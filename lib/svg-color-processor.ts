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
 * Supports 3-digit hex, 6-digit hex, rgb(), rgba(), and named colors
 */
function parseColorToRgb(color: string): { r: number; g: number; b: number } | null {
  if (!color || color === 'none' || color === 'transparent') {
    return null;
  }

  const normalized = color.trim();

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

  // Handle rgb/rgba colors
  const rgbMatch = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(normalized);
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

  const lowerNormalized = normalized.toLowerCase();
  if (namedColors[lowerNormalized]) {
    return namedColors[lowerNormalized];
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
 * Uses increased tolerance to handle color space conversions and rounding
 */
function findColorOverride(
  color: { r: number; g: number; b: number },
  overrides: ColorOverride[]
): string | null {
  for (const override of overrides) {
    const fromColor = parseColorToRgb(override.from);
    if (fromColor) {
      // Use tolerance, default to 35 for better matching (handles color space conversions)
      const tolerance = override.tolerance ?? 35;
      if (colorsMatch(color, fromColor, tolerance)) {
        return override.to;
      }
    }
  }
  return null;
}

/**
 * Get computed fill color from an SVG element
 * Handles currentColor, inherit, and resolves from computed styles
 */
function getComputedFillColor(element: SVGElement): string | null {
  // First check explicit fill attribute
  const fillAttr = element.getAttribute('fill');
  if (fillAttr && fillAttr !== 'none' && fillAttr !== 'transparent') {
    // Handle currentColor - resolve from CSS color property
    if (fillAttr === 'currentColor' || fillAttr === 'inherit') {
      if (typeof window !== 'undefined') {
        try {
          const computed = window.getComputedStyle(element);
          const color = computed.color;
          if (color && color !== 'rgba(0, 0, 0, 0)') {
            return color;
          }
          // Try parent element for inherit
          if (fillAttr === 'inherit' && element.parentElement) {
            const parentComputed = window.getComputedStyle(element.parentElement);
            const parentColor = parentComputed.color || parentComputed.fill;
            if (parentColor && parentColor !== 'rgba(0, 0, 0, 0)') {
              return parentColor;
            }
          }
        } catch (e) {
          // Ignore errors
        }
      }
      return null;
    }
    return fillAttr;
  }

  // Try to get from computed style (handles inherited colors)
  if (typeof window !== 'undefined') {
    try {
      const computed = window.getComputedStyle(element);
      const fill = computed.fill;
      if (fill && fill !== 'none' && fill !== 'transparent' && fill !== 'rgba(0, 0, 0, 0)') {
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
function processSvgElement(element: SVGElement, teamAbbr?: string, processedSet?: Set<SVGElement>): void {
  // Skip if already processed
  if (processedSet?.has(element)) {
    return;
  }

  // Skip elements that shouldn't have fills (like defs, masks, etc.)
  // But we'll process gradient stops separately
  const skipTags = ['defs', 'mask', 'clipPath', 'pattern'];
  const tagName = element.tagName.toLowerCase();
  if (skipTags.includes(tagName)) {
    return;
  }

  // Mark as processed
  if (processedSet) {
    processedSet.add(element);
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

  // Track processed elements to avoid double processing
  const processedSet = new Set<SVGElement>();

  // First, process gradient stops (they're referenced by other elements)
  const gradientStops = svgElement.querySelectorAll<SVGElement>('linearGradient stop, radialGradient stop');
  gradientStops.forEach((stop) => {
    processSvgElement(stop, teamAbbr, processedSet);
  });

  // Process groups first (before their children) to avoid overwriting
  const groups = svgElement.querySelectorAll<SVGElement>('g');
  groups.forEach((group) => {
    // Only process group if it has explicit fill (not just for children)
    const groupFill = group.getAttribute('fill');
    if (groupFill && groupFill !== 'none' && groupFill !== 'transparent') {
      processSvgElement(group, teamAbbr, processedSet);
    }
  });

  // Process all shape and text elements (excluding those already in groups we processed)
  const elementsToProcess = svgElement.querySelectorAll<SVGElement>(
    'path, circle, ellipse, rect, polygon, polyline, line, text, tspan'
  );

  elementsToProcess.forEach((element) => {
    // Skip if this element is a child of a group we already processed
    let isInProcessedGroup = false;
    let parent: Element | null = element.parentElement;
    while (parent && parent !== svgElement) {
      if (parent.tagName.toLowerCase() === 'g' && parent instanceof SVGElement && processedSet.has(parent)) {
        isInProcessedGroup = true;
        break;
      }
      parent = parent.parentElement;
    }
    
    if (!isInProcessedGroup) {
      processSvgElement(element, teamAbbr, processedSet);
    }
  });

  // Process use elements last (they reference other elements)
  const useElements = svgElement.querySelectorAll<SVGElement>('use');
  useElements.forEach((use) => {
    processSvgElement(use, teamAbbr, processedSet);
    // Also process the referenced element if it exists
    const href = use.getAttribute('href') || use.getAttribute('xlink:href');
    if (href) {
      const referencedId = href.replace('#', '');
      const referenced = svgElement.querySelector(`#${referencedId}`);
      if (referenced instanceof SVGElement) {
        processSvgElement(referenced, teamAbbr, processedSet);
      }
    }
  });
}

