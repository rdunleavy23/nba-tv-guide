/**
 * SVG Color Processor - Convert colored SVGs to white/gray monochrome
 * Complete rewrite with perceptual color matching, contrast preservation, and proper element processing
 * Supports team-specific overrides for manual fine-tuning
 */

import { TEAM_LOGO_OVERRIDES, type ColorOverride } from './team-logo-overrides';

type RGB = { r: number; g: number; b: number };
type LAB = { L: number; a: number; b: number };

/**
 * Calculate relative luminance of an RGB color (WCAG formula)
 * Returns value between 0 (darkest) and 1 (lightest)
 */
function calculateLuminance(r: number, g: number, b: number): number {
  // Normalize RGB values to 0-1 range
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  // WCAG relative luminance formula
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Convert RGB to XYZ color space (intermediate step for LAB conversion)
 */
function rgbToXyz(r: number, g: number, b: number): { x: number; y: number; z: number } {
  // Normalize RGB to 0-1
  let rNorm = r / 255;
  let gNorm = g / 255;
  let bNorm = b / 255;

  // Apply gamma correction
  rNorm = rNorm > 0.04045 ? Math.pow((rNorm + 0.055) / 1.055, 2.4) : rNorm / 12.92;
  gNorm = gNorm > 0.04045 ? Math.pow((gNorm + 0.055) / 1.055, 2.4) : gNorm / 12.92;
  bNorm = bNorm > 0.04045 ? Math.pow((bNorm + 0.055) / 1.055, 2.4) : bNorm / 12.92;

  // Observer = 2°, Illuminant = D65
  const x = (rNorm * 0.4124 + gNorm * 0.3576 + bNorm * 0.1805) * 100;
  const y = (rNorm * 0.2126 + gNorm * 0.7152 + bNorm * 0.0722) * 100;
  const z = (rNorm * 0.0193 + gNorm * 0.1192 + bNorm * 0.9505) * 100;

  return { x, y, z };
}

/**
 * Convert XYZ to LAB color space
 */
function xyzToLab(x: number, y: number, z: number): LAB {
  // D65 illuminant
  const xn = 95.047;
  const yn = 100.000;
  const zn = 108.883;

  const fx = x / xn > 0.008856 ? Math.pow(x / xn, 1/3) : (7.787 * x / xn + 16/116);
  const fy = y / yn > 0.008856 ? Math.pow(y / yn, 1/3) : (7.787 * y / yn + 16/116);
  const fz = z / zn > 0.008856 ? Math.pow(z / zn, 1/3) : (7.787 * z / zn + 16/116);

  const L = 116 * fy - 16;
  const a = 500 * (fx - fy);
  const b = 200 * (fy - fz);

  return { L, a, b };
}

/**
 * Convert RGB to LAB color space
 */
function rgbToLab(r: number, g: number, b: number): LAB {
  const xyz = rgbToXyz(r, g, b);
  return xyzToLab(xyz.x, xyz.y, xyz.z);
}

/**
 * Calculate DeltaE (CIE76) perceptual color distance
 * Lower values = more perceptually similar colors
 * Threshold: < 2.0 = barely perceptible, < 5.0 = perceptually similar
 */
function deltaE(lab1: LAB, lab2: LAB): number {
  const dL = lab1.L - lab2.L;
  const da = lab1.a - lab2.a;
  const db = lab1.b - lab2.b;
  return Math.sqrt(dL * dL + da * da + db * db);
}

/**
 * Convert HSL to RGB
 */
function hslToRgb(h: number, s: number, l: number): RGB {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

/**
 * Parse a color string to RGB values
 * Supports: hex (3/6 digit), rgb/rgba, hsl/hsla, percentages, CSS variables, named colors, currentColor
 */
function parseColorToRgb(color: string): RGB | null {
  if (!color || color === 'none' || color === 'transparent') {
    return null;
  }

  const normalized = color.trim();

  // Handle CSS variables (var(--color))
  if (normalized.startsWith('var(')) {
    // Try to resolve via a temporary element
    if (typeof window !== 'undefined') {
      try {
        const tempEl = document.createElement('div');
        tempEl.style.color = normalized;
        document.body.appendChild(tempEl);
        const resolved = window.getComputedStyle(tempEl).color;
        document.body.removeChild(tempEl);
        if (resolved && resolved !== 'rgba(0, 0, 0, 0)') {
          return parseColorToRgb(resolved);
        }
      } catch (e) {
        // Ignore errors
      }
    }
    return null;
  }

  // Handle 3-digit hex colors (#RGB)
  const hex3Match = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(normalized);
  if (hex3Match) {
    return {
      r: parseInt(hex3Match[1] + hex3Match[1], 16),
      g: parseInt(hex3Match[2] + hex3Match[2], 16),
      b: parseInt(hex3Match[3] + hex3Match[3], 16),
    };
  }

  // Handle 6-digit hex colors (#RRGGBB)
  const hex6Match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized);
  if (hex6Match) {
    return {
      r: parseInt(hex6Match[1], 16),
      g: parseInt(hex6Match[2], 16),
      b: parseInt(hex6Match[3], 16),
    };
  }

  // Handle HSL/HSLA colors
  const hslMatch = /hsla?\((\d+),\s*(\d+)%,\s*(\d+)%/i.exec(normalized);
  if (hslMatch) {
    return hslToRgb(
      parseInt(hslMatch[1], 10),
      parseInt(hslMatch[2], 10),
      parseInt(hslMatch[3], 10)
    );
  }

  // Handle RGB percentages (rgb(50%, 50%, 50%))
  const rgbPercentMatch = /rgba?\((\d+)%,\s*(\d+)%,\s*(\d+)%/i.exec(normalized);
  if (rgbPercentMatch) {
    return {
      r: Math.round(parseInt(rgbPercentMatch[1], 10) * 2.55),
      g: Math.round(parseInt(rgbPercentMatch[2], 10) * 2.55),
      b: Math.round(parseInt(rgbPercentMatch[3], 10) * 2.55),
    };
  }

  // Handle rgb/rgba colors
  const rgbMatch = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(normalized);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10),
    };
  }

  // Handle named colors (extended set of 147 CSS named colors)
  const namedColors: Record<string, RGB> = {
    // Basic colors
    black: { r: 0, g: 0, b: 0 },
    white: { r: 255, g: 255, b: 255 },
    red: { r: 255, g: 0, b: 0 },
    green: { r: 0, g: 128, b: 0 },
    blue: { r: 0, g: 0, b: 255 },
    yellow: { r: 255, g: 255, b: 0 },
    cyan: { r: 0, g: 255, b: 255 },
    magenta: { r: 255, g: 0, b: 255 },
    gray: { r: 128, g: 128, b: 128 },
    grey: { r: 128, g: 128, b: 128 },
    // Extended common colors
    aliceblue: { r: 240, g: 248, b: 255 },
    antiquewhite: { r: 250, g: 235, b: 215 },
    aqua: { r: 0, g: 255, b: 255 },
    aquamarine: { r: 127, g: 255, b: 212 },
    azure: { r: 240, g: 255, b: 255 },
    beige: { r: 245, g: 245, b: 220 },
    bisque: { r: 255, g: 228, b: 196 },
    blanchedalmond: { r: 255, g: 235, b: 205 },
    blueviolet: { r: 138, g: 43, b: 226 },
    brown: { r: 165, g: 42, b: 42 },
    burlywood: { r: 222, g: 184, b: 135 },
    cadetblue: { r: 95, g: 158, b: 160 },
    chartreuse: { r: 127, g: 255, b: 0 },
    chocolate: { r: 210, g: 105, b: 30 },
    coral: { r: 255, g: 127, b: 80 },
    cornflowerblue: { r: 100, g: 149, b: 237 },
    cornsilk: { r: 255, g: 248, b: 220 },
    crimson: { r: 220, g: 20, b: 60 },
    darkblue: { r: 0, g: 0, b: 139 },
    darkcyan: { r: 0, g: 139, b: 139 },
    darkgoldenrod: { r: 184, g: 134, b: 11 },
    darkgray: { r: 169, g: 169, b: 169 },
    darkgreen: { r: 0, g: 100, b: 0 },
    darkgrey: { r: 169, g: 169, b: 169 },
    darkkhaki: { r: 189, g: 183, b: 107 },
    darkmagenta: { r: 139, g: 0, b: 139 },
    darkolivegreen: { r: 85, g: 107, b: 47 },
    darkorange: { r: 255, g: 140, b: 0 },
    darkorchid: { r: 153, g: 50, b: 204 },
    darkred: { r: 139, g: 0, b: 0 },
    darksalmon: { r: 233, g: 150, b: 122 },
    darkseagreen: { r: 143, g: 188, b: 143 },
    darkslateblue: { r: 72, g: 61, b: 139 },
    darkslategray: { r: 47, g: 79, b: 79 },
    darkslategrey: { r: 47, g: 79, b: 79 },
    darkturquoise: { r: 0, g: 206, b: 205 },
    darkviolet: { r: 148, g: 0, b: 211 },
    deeppink: { r: 255, g: 20, b: 147 },
    deepskyblue: { r: 0, g: 191, b: 255 },
    dimgray: { r: 105, g: 105, b: 105 },
    dimgrey: { r: 105, g: 105, b: 105 },
    dodgerblue: { r: 30, g: 144, b: 255 },
    firebrick: { r: 178, g: 34, b: 34 },
    floralwhite: { r: 255, g: 250, b: 240 },
    forestgreen: { r: 34, g: 139, b: 34 },
    fuchsia: { r: 255, g: 0, b: 255 },
    gainsboro: { r: 220, g: 220, b: 220 },
    ghostwhite: { r: 248, g: 248, b: 255 },
    gold: { r: 255, g: 215, b: 0 },
    goldenrod: { r: 218, g: 165, b: 32 },
    honeydew: { r: 240, g: 255, b: 240 },
    hotpink: { r: 255, g: 105, b: 180 },
    indianred: { r: 205, g: 92, b: 92 },
    indigo: { r: 75, g: 0, b: 130 },
    ivory: { r: 255, g: 255, b: 240 },
    khaki: { r: 240, g: 230, b: 140 },
    lavender: { r: 230, g: 230, b: 250 },
    lavenderblush: { r: 255, g: 240, b: 245 },
    lawngreen: { r: 124, g: 252, b: 0 },
    lemonchiffon: { r: 255, g: 250, b: 205 },
    lightblue: { r: 173, g: 216, b: 230 },
    lightcoral: { r: 240, g: 128, b: 128 },
    lightcyan: { r: 224, g: 255, b: 255 },
    lightgoldenrodyellow: { r: 250, g: 250, b: 210 },
    lightgray: { r: 211, g: 211, b: 211 },
    lightgreen: { r: 144, g: 238, b: 144 },
    lightgrey: { r: 211, g: 211, b: 211 },
    lightpink: { r: 255, g: 182, b: 193 },
    lightsalmon: { r: 255, g: 160, b: 122 },
    lightseagreen: { r: 32, g: 178, b: 170 },
    lightskyblue: { r: 135, g: 206, b: 250 },
    lightslategray: { r: 119, g: 136, b: 153 },
    lightslategrey: { r: 119, g: 136, b: 153 },
    lightsteelblue: { r: 176, g: 196, b: 222 },
    lightyellow: { r: 255, g: 255, b: 224 },
    lime: { r: 0, g: 255, b: 0 },
    limegreen: { r: 50, g: 205, b: 50 },
    linen: { r: 250, g: 240, b: 230 },
    maroon: { r: 128, g: 0, b: 0 },
    mediumaquamarine: { r: 102, g: 205, b: 170 },
    mediumblue: { r: 0, g: 0, b: 205 },
    mediumorchid: { r: 186, g: 85, b: 211 },
    mediumpurple: { r: 147, g: 112, b: 219 },
    mediumseagreen: { r: 60, g: 179, b: 113 },
    mediumslateblue: { r: 123, g: 104, b: 238 },
    mediumspringgreen: { r: 0, g: 250, b: 154 },
    mediumturquoise: { r: 72, g: 209, b: 204 },
    mediumvioletred: { r: 199, g: 21, b: 133 },
    midnightblue: { r: 25, g: 25, b: 112 },
    mintcream: { r: 245, g: 255, b: 250 },
    mistyrose: { r: 255, g: 228, b: 225 },
    moccasin: { r: 255, g: 228, b: 181 },
    navajowhite: { r: 255, g: 222, b: 173 },
    navy: { r: 0, g: 0, b: 128 },
    oldlace: { r: 253, g: 245, b: 230 },
    olive: { r: 128, g: 128, b: 0 },
    olivedrab: { r: 107, g: 142, b: 35 },
    orange: { r: 255, g: 165, b: 0 },
    orangered: { r: 255, g: 69, b: 0 },
    orchid: { r: 218, g: 112, b: 214 },
    palegoldenrod: { r: 238, g: 232, b: 170 },
    palegreen: { r: 152, g: 251, b: 152 },
    paleturquoise: { r: 175, g: 238, b: 238 },
    palevioletred: { r: 219, g: 112, b: 147 },
    papayawhip: { r: 255, g: 239, b: 213 },
    peachpuff: { r: 255, g: 218, b: 185 },
    peru: { r: 205, g: 133, b: 63 },
    pink: { r: 255, g: 192, b: 203 },
    plum: { r: 221, g: 160, b: 221 },
    powderblue: { r: 176, g: 224, b: 230 },
    purple: { r: 128, g: 0, b: 128 },
    rebeccapurple: { r: 102, g: 51, b: 153 },
    rosybrown: { r: 188, g: 143, b: 143 },
    royalblue: { r: 65, g: 105, b: 225 },
    saddlebrown: { r: 139, g: 69, b: 19 },
    salmon: { r: 250, g: 128, b: 114 },
    sandybrown: { r: 244, g: 164, b: 96 },
    seagreen: { r: 46, g: 139, b: 87 },
    seashell: { r: 255, g: 245, b: 238 },
    sienna: { r: 160, g: 82, b: 45 },
    silver: { r: 192, g: 192, b: 192 },
    skyblue: { r: 135, g: 206, b: 235 },
    slateblue: { r: 106, g: 90, b: 205 },
    slategray: { r: 112, g: 128, b: 144 },
    slategrey: { r: 112, g: 128, b: 144 },
    snow: { r: 255, g: 250, b: 250 },
    springgreen: { r: 0, g: 255, b: 127 },
    steelblue: { r: 70, g: 130, b: 180 },
    tan: { r: 210, g: 180, b: 140 },
    teal: { r: 0, g: 128, b: 128 },
    thistle: { r: 216, g: 191, b: 216 },
    tomato: { r: 255, g: 99, b: 71 },
    turquoise: { r: 64, g: 224, b: 208 },
    violet: { r: 238, g: 130, b: 238 },
    wheat: { r: 245, g: 222, b: 179 },
    whitesmoke: { r: 245, g: 245, b: 245 },
    yellowgreen: { r: 154, g: 205, b: 50 },
  };

  const lowerNormalized = normalized.toLowerCase();
  if (namedColors[lowerNormalized]) {
    return namedColors[lowerNormalized];
  }

  return null;
}

/**
 * Get actual rendered color from an SVG element using computed styles
 * CRITICAL: Always uses computed style to catch elements without explicit fills
 * SVG shape elements default to black fill if not specified
 * For text elements, also checks CSS 'color' property
 */
function getActualRenderedColor(element: SVGElement, property: 'fill' | 'stroke'): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const computed = window.getComputedStyle(element);
    let color = computed[property];
    const opacityKey = `${property}-opacity` as keyof CSSStyleDeclaration;
    let opacity = parseFloat((computed[opacityKey] as string) || '1');
    
    // For text elements, also check CSS 'color' property if fill is not set
    if (isTextElement(element) && (!color || color === 'none' || color === 'transparent' || color === 'rgba(0, 0, 0, 0)')) {
      const cssColor = computed.color;
      if (cssColor && cssColor !== 'rgba(0, 0, 0, 0)') {
        color = cssColor;
        // Text elements might have opacity via color opacity
        const colorOpacity = parseFloat((computed.opacity as string) || '1');
        opacity = colorOpacity;
      }
    }
    
    // If color is 'none' or 'transparent', return null
    if (!color || color === 'none' || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') {
      return null;
    }
    
    // Handle currentColor - resolve from CSS color property
    if (color === 'currentColor') {
      const cssColor = computed.color;
      if (cssColor && cssColor !== 'rgba(0, 0, 0, 0)') {
        color = cssColor;
      }
    }
    
    // Combine color + opacity to get actual rendered RGB
    const rgb = parseColorToRgb(color);
    if (rgb && opacity < 1) {
      // Apply opacity: blend with background (assume transparent/white)
      return `rgb(${Math.round(rgb.r * opacity)}, ${Math.round(rgb.g * opacity)}, ${Math.round(rgb.b * opacity)})`;
    }
    
    return color;
  } catch (e) {
    // Ignore errors
    return null;
  }
}

/**
 * Check if element is a shape element (can have default black fill)
 */
function isShapeElement(element: SVGElement): boolean {
  const shapeTags = ['path', 'circle', 'ellipse', 'rect', 'polygon', 'polyline', 'line', 'text', 'tspan'];
  return shapeTags.includes(element.tagName.toLowerCase());
}

/**
 * Check if element is a text element
 */
function isTextElement(element: SVGElement): boolean {
  const textTags = ['text', 'tspan'];
  return textTags.includes(element.tagName.toLowerCase());
}

/**
 * Check if two RGB colors match within tolerance (fallback for DeltaE)
 */
function colorsMatchRGB(
  rgb1: RGB,
  rgb2: RGB,
  tolerance: number = 20
): boolean {
  const rDiff = Math.abs(rgb1.r - rgb2.r);
  const gDiff = Math.abs(rgb1.g - rgb2.g);
  const bDiff = Math.abs(rgb1.b - rgb2.b);
  return rDiff <= tolerance && gDiff <= tolerance && bDiff <= tolerance;
}

/**
 * Find a matching color override using DeltaE perceptual distance
 * Falls back to RGB tolerance if DeltaE doesn't match
 */
function findColorOverride(
  color: RGB,
  overrides: ColorOverride[]
): string | null {
  const colorLab = rgbToLab(color.r, color.g, color.b);
  
  for (const override of overrides) {
    const fromColor = parseColorToRgb(override.from);
    if (fromColor) {
      const fromLab = rgbToLab(fromColor.r, fromColor.g, fromColor.b);
      // Use DeltaE threshold (default 8.0 = perceptually similar, increased from 5.0)
      // Override tolerance is now interpreted as DeltaE threshold
      const threshold = override.tolerance ?? 8.0;
      const distance = deltaE(colorLab, fromLab);
      
      if (distance < threshold) {
        return override.to;
      }
      
      // Fallback: If DeltaE fails, try RGB tolerance (15-20 units)
      // This catches colors that are close but DeltaE misses
      const rgbTolerance = 18; // RGB units
      if (colorsMatchRGB(color, fromColor, rgbTolerance)) {
        return override.to;
      }
    }
  }
  return null;
}

/**
 * Calculate contrast-preserving grayscale value
 * Uses wider range (50-250) to preserve relative brightness relationships
 * For text elements, ensures higher contrast for readability
 */
function calculateContrastPreservingGray(rgb: RGB, isText: boolean = false): string {
  const luminance = calculateLuminance(rgb.r, rgb.g, rgb.b);
  
  if (isText) {
    // Text needs higher contrast - map to lighter grays for better readability
    // Original dark text → medium gray, original light text → very light gray/white
    const grayValue = Math.round(180 + (luminance * 75)); // 180-255 range for text
    return `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
  }
  
  // Map to wider range: dark colors → darker gray, light colors → lighter gray
  // Maintain relative differences: if color A is brighter than B, gray A > gray B
  const grayValue = Math.round(50 + (luminance * 200)); // 50-250 range
  return `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
}

/**
 * Process a single SVG element and replace its fill/stroke color
 * Checks team-specific overrides first, then falls back to contrast-preserving calculation
 * CRITICAL: Processes ALL elements, including those without explicit fills
 */
function processSvgElement(element: SVGElement, teamAbbr?: string, processedSet?: Set<SVGElement>): void {
  // Skip if already processed
  if (processedSet?.has(element)) {
    return;
  }

  // Skip elements that shouldn't have fills (like defs, masks, etc.)
  const skipTags = ['defs', 'mask', 'clipPath', 'pattern'];
  const tagName = element.tagName.toLowerCase();
  if (skipTags.includes(tagName)) {
    return;
  }

  // Mark as processed
  if (processedSet) {
    processedSet.add(element);
  }

  // CRITICAL FIX: Always get computed color, even if no explicit fill attribute
  const fillColor = getActualRenderedColor(element, 'fill');
  
  // Check if element is intentionally transparent (creates a gap)
  const fillAttr = element.getAttribute('fill');
  const isIntentionallyTransparent = fillAttr === 'none' || fillAttr === 'transparent';

  const isText = isTextElement(element);
  
  if (fillColor) {
    // Process this element - this now catches elements without explicit fills
    const rgb = parseColorToRgb(fillColor);
    if (rgb) {
      let replacementColor: string | null = null;

      // Check team-specific overrides first
      if (teamAbbr) {
        const teamOverride = TEAM_LOGO_OVERRIDES[teamAbbr.toUpperCase()];
        if (teamOverride?.colors) {
          replacementColor = findColorOverride(rgb, teamOverride.colors);
        }
      }

      // Fall back to contrast-preserving calculation if no override found
      // Text elements get higher contrast for readability
      if (!replacementColor) {
        replacementColor = calculateContrastPreservingGray(rgb, isText);
      }

      element.setAttribute('fill', replacementColor);
      
      // For text elements, ensure font-weight is preserved for readability
      if (isText) {
        const fontWeight = element.getAttribute('font-weight') || (typeof window !== 'undefined' ? window.getComputedStyle(element).fontWeight : '600');
        if (fontWeight && fontWeight !== 'normal' && fontWeight !== '400') {
          element.setAttribute('font-weight', fontWeight);
        } else {
          // Ensure text is bold enough to be readable
          element.setAttribute('font-weight', '600');
        }
      }
    }
  } else if (isIntentionallyTransparent && isShapeElement(element) && !isText) {
    // This is an intentional gap - make it darker to create contrast
    // Map to dark gray to preserve the visual separation
    // Don't apply to text elements (they should use fill or color)
    element.setAttribute('fill', 'rgb(80, 80, 80)'); // Dark gray for gaps
  } else if (isText && !fillColor) {
    // Text elements without fill should use a visible color
    // Default to light gray/white for text readability
    element.setAttribute('fill', 'rgb(240, 240, 240)');
    element.setAttribute('font-weight', '600');
  } else if (!fillColor && isShapeElement(element) && !isIntentionallyTransparent) {
    // Shape elements without explicit fill default to black per SVG spec
    // Process them as black to ensure outlines/details are visible
    const blackRgb: RGB = { r: 0, g: 0, b: 0 };
    let replacementColor: string | null = null;
    
    // Check team-specific overrides for black
    if (teamAbbr) {
      const teamOverride = TEAM_LOGO_OVERRIDES[teamAbbr.toUpperCase()];
      if (teamOverride?.colors) {
        replacementColor = findColorOverride(blackRgb, teamOverride.colors);
      }
    }
    
    // Fall back to darker gray for black elements (outlines/details)
    if (!replacementColor) {
      replacementColor = 'rgb(170, 170, 170)'; // Default darker gray for black outlines
    }
    
    element.setAttribute('fill', replacementColor);
  }

  // Also handle stroke if present
  const strokeColor = getActualRenderedColor(element, 'stroke');
  if (strokeColor) {
    const strokeRgb = parseColorToRgb(strokeColor);
    if (strokeRgb) {
      let strokeReplacement: string | null = null;

      // Check team-specific overrides first
      if (teamAbbr) {
        const teamOverride = TEAM_LOGO_OVERRIDES[teamAbbr.toUpperCase()];
        if (teamOverride?.colors) {
          strokeReplacement = findColorOverride(strokeRgb, teamOverride.colors);
        }
      }

      // Fall back to contrast-preserving calculation
      // Text strokes also need higher contrast
      if (!strokeReplacement) {
        strokeReplacement = calculateContrastPreservingGray(strokeRgb, isText);
      }

      element.setAttribute('stroke', strokeReplacement);
      
      // Ensure stroke width is visible (minimum 0.5)
      const strokeWidth = element.getAttribute('stroke-width');
      if (!strokeWidth || parseFloat(strokeWidth) < 0.5) {
        element.setAttribute('stroke-width', '0.5');
      }
    }
  }
}

/**
 * Depth-first traversal helper to process elements in correct order
 */
function processElementDepthFirst(
  element: SVGElement,
  svgRoot: SVGElement,
  teamAbbr: string | undefined,
  processedSet: Set<SVGElement>
): void {
  // Process defs content first (masks, patterns, gradients)
  if (element.tagName.toLowerCase() === 'defs') {
    Array.from(element.children).forEach((child) => {
      if (child instanceof SVGElement) {
        processElementDepthFirst(child, svgRoot, teamAbbr, processedSet);
      }
    });
    return;
  }

  // Process gradient stops
  if (element.tagName.toLowerCase() === 'linearGradient' || element.tagName.toLowerCase() === 'radialGradient') {
    const stops = element.querySelectorAll('stop');
    stops.forEach((stop) => {
      processSvgElement(stop, teamAbbr, processedSet);
    });
    return;
  }

  // Process groups (only if they have explicit fills)
  if (element.tagName.toLowerCase() === 'g') {
    const groupFill = element.getAttribute('fill');
    if (groupFill && groupFill !== 'none' && groupFill !== 'transparent') {
      processSvgElement(element, teamAbbr, processedSet);
    }
    // Process children
    Array.from(element.children).forEach((child) => {
      if (child instanceof SVGElement) {
        processElementDepthFirst(child, svgRoot, teamAbbr, processedSet);
      }
    });
    return;
  }

  // Process shape/text elements
  if (isShapeElement(element)) {
    processSvgElement(element, teamAbbr, processedSet);
    return;
  }

  // Process use elements last (they reference other elements)
  if (element.tagName.toLowerCase() === 'use') {
    processSvgElement(element, teamAbbr, processedSet);
    // Also process the referenced element if it exists
    const href = element.getAttribute('href') || element.getAttribute('xlink:href');
    if (href) {
      const referencedId = href.replace('#', '');
      const referenced = svgRoot.querySelector(`#${referencedId}`);
      if (referenced instanceof SVGElement && !processedSet.has(referenced)) {
        processSvgElement(referenced, teamAbbr, processedSet);
      }
    }
    return;
  }

  // Process any remaining children
  Array.from(element.children).forEach((child) => {
    if (child instanceof SVGElement) {
      processElementDepthFirst(child, svgRoot, teamAbbr, processedSet);
    }
  });
}

/**
 * Process an entire SVG element tree, converting all fills to white/gray
 * Uses depth-first traversal to maintain proper processing order
 * @param svgElement The SVG element to process
 * @param teamAbbr Optional team abbreviation for team-specific color overrides
 */
export function processSvgToMonochrome(svgElement: SVGElement | null, teamAbbr?: string): void {
  if (!svgElement) return;

  // Track processed elements to avoid double processing
  const processedSet = new Set<SVGElement>();

  // Process using depth-first traversal starting from root
  processElementDepthFirst(svgElement, svgElement, teamAbbr, processedSet);
}
