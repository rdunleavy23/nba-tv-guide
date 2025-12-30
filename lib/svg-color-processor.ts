/**
 * SVG Color Processor - Convert colored SVGs to white/gray monochrome
 * Preserves internal details by calculating luminance and replacing colors accordingly
 * Supports team-specific overrides for manual fine-tuning
 */

import { TEAM_LOGO_OVERRIDES, type ColorOverride } from './team-logo-overrides';

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
 * Parse a color string (hex, rgb, rgba, or named color) to RGB values
 */
function parseColorToRgb(color: string): { r: number; g: number; b: number } | null {
  if (!color || color === 'none' || color === 'transparent') {
    return null;
  }

  // Handle hex colors (#RGB, #RRGGBB)
  const hexMatch = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
  if (hexMatch) {
    return {
      r: parseInt(hexMatch[1], 16),
      g: parseInt(hexMatch[2], 16),
      b: parseInt(hexMatch[3], 16),
    };
  }

  // Handle rgb/rgba colors
  const rgbMatch = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(color);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10),
    };
  }

  // Handle named colors (basic set)
  const namedColors: Record<string, { r: number; g: number; b: number }> = {
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
  };

  const normalized = color.toLowerCase().trim();
  if (namedColors[normalized]) {
    return namedColors[normalized];
  }

  return null;
}

/**
 * Check if two RGB colors match within tolerance
 */
function colorsMatch(
  rgb1: { r: number; g: number; b: number },
  rgb2: { r: number; g: number; b: number },
  tolerance: number = 10
): boolean {
  const rDiff = Math.abs(rgb1.r - rgb2.r);
  const gDiff = Math.abs(rgb1.g - rgb2.g);
  const bDiff = Math.abs(rgb1.b - rgb2.b);

  // Colors match if all channels are within tolerance
  return rDiff <= tolerance && gDiff <= tolerance && bDiff <= tolerance;
}

/**
 * Find a matching color override for the given color
 */
function findColorOverride(
  color: { r: number; g: number; b: number },
  overrides: ColorOverride[]
): string | null {
  for (const override of overrides) {
    const fromColor = parseColorToRgb(override.from);
    if (fromColor) {
      // Use tolerance, default to 20 for better matching
      const tolerance = override.tolerance ?? 20;
      if (colorsMatch(color, fromColor, tolerance)) {
        return override.to;
      }
    }
  }
  return null;
}

/**
 * Get computed fill color from an SVG element
 */
function getComputedFillColor(element: SVGElement): string | null {
  // First check explicit fill attribute
  const fillAttr = element.getAttribute('fill');
  if (fillAttr && fillAttr !== 'none' && fillAttr !== 'transparent' && fillAttr !== 'inherit') {
    return fillAttr;
  }

  // Try to get from computed style (handles inherited colors)
  if (typeof window !== 'undefined') {
    try {
      const computed = window.getComputedStyle(element);
      const fill = computed.fill;
      if (fill && fill !== 'none' && fill !== 'transparent') {
        // Process all colors including black (rgb(0, 0, 0))
        return fill;
      }
    } catch (e) {
      // Ignore errors in computed style
    }
  }

  return null;
}

/**
 * Process a single SVG element and replace its fill color based on luminance
 * Checks team-specific overrides first, then falls back to luminance calculation
 */
function processSvgElement(element: SVGElement, teamAbbr?: string): void {
  // Skip elements that shouldn't have fills (like defs, masks, etc.)
  const skipTags = ['defs', 'mask', 'clipPath', 'pattern', 'linearGradient', 'radialGradient'];
  if (skipTags.includes(element.tagName.toLowerCase())) {
    return;
  }

  const fillColor = getComputedFillColor(element);

  if (fillColor) {
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

      // Fall back to luminance-based calculation if no override found
      if (!replacementColor) {
        const luminance = calculateLuminance(rgb.r, rgb.g, rgb.b);
        const grayValue = Math.round(150 + (luminance * 105)); // luminance 0→150, 0.5→202, 1.0→255
        replacementColor = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
      }

      element.setAttribute('fill', replacementColor);
    } else {
      // If we can't parse the color, don't set it - let it inherit or use default
      // This prevents overwriting with white when we don't know the color
    }
  } else {
    // Elements without explicit fill might be transparent or inherit
    // Don't force a fill - let the SVG use its natural colors or inheritance
    // Only process elements that explicitly have colors
  }

  // Also handle stroke if present - check overrides first
  const stroke = element.getAttribute('stroke');
  if (stroke && stroke !== 'none' && stroke !== 'transparent') {
    const strokeRgb = parseColorToRgb(stroke);
    if (strokeRgb) {
      let strokeReplacement: string | null = null;

      // Check team-specific overrides first
      if (teamAbbr) {
        const teamOverride = TEAM_LOGO_OVERRIDES[teamAbbr.toUpperCase()];
        if (teamOverride?.colors) {
          strokeReplacement = findColorOverride(strokeRgb, teamOverride.colors);
        }
      }

      // Fall back to luminance-based calculation
      if (!strokeReplacement) {
        const strokeLuminance = calculateLuminance(strokeRgb.r, strokeRgb.g, strokeRgb.b);
        const strokeGrayValue = Math.round(150 + (strokeLuminance * 105));
        strokeReplacement = `rgb(${strokeGrayValue}, ${strokeGrayValue}, ${strokeGrayValue})`;
      }

      element.setAttribute('stroke', strokeReplacement);
    }
  }
}

/**
 * Process an entire SVG element tree, converting all fills to white/gray
 * @param svgElement The SVG element to process
 * @param teamAbbr Optional team abbreviation for team-specific color overrides
 */
export function processSvgToMonochrome(svgElement: SVGElement | null, teamAbbr?: string): void {
  if (!svgElement) return;

  // Find all elements that can have fill colors
  // Process in order: paths, shapes, then groups (to handle nested structures)
  const elementsToProcess = svgElement.querySelectorAll<SVGElement>(
    'path, circle, ellipse, rect, polygon, polyline, line, text, tspan, use'
  );

  elementsToProcess.forEach((element) => {
    processSvgElement(element, teamAbbr);
  });

  // Process groups and their direct children
  const groups = svgElement.querySelectorAll<SVGElement>('g');
  groups.forEach((group) => {
    // Process the group itself if it has fill
    processSvgElement(group, teamAbbr);

    // Process direct children
    Array.from(group.children).forEach((child) => {
      if (child instanceof SVGElement) {
        processSvgElement(child, teamAbbr);
      }
    });
  });
}

