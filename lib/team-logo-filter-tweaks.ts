/**
 * Per-Team Filter Tweaks
 * 
 * Optional overrides for CSS filter values (brightness, contrast, invert, opacity)
 * when a logo doesn't render well with the default filter settings.
 * 
 * Default values:
 * - brightness: 1.15
 * - contrast: 1.15
 * - invert: false
 * - opacity: 1.0
 * 
 * Use sparingly - most logos should work with defaults.
 * This provides an escape hatch for edge cases without heavy SVG processing.
 */

export interface TeamLogoFilterTweak {
  brightness?: number;
  contrast?: number;
  invert?: boolean;
  opacity?: number;
}

export const TEAM_LOGO_FILTER_TWEAKS: Record<string, TeamLogoFilterTweak> = {
  // Example usage (uncomment and adjust as needed):
  // 'GSW': { brightness: 1.2, contrast: 1.3 },
  // 'CHA': { brightness: 1.1 },
  // 'PHI': { contrast: 1.25 },
};

/**
 * Get filter tweak for a team, or return default values
 */
export function getTeamFilterTweak(abbr: string): Required<TeamLogoFilterTweak> {
  const tweak = TEAM_LOGO_FILTER_TWEAKS[abbr.toUpperCase()] || {};
  return {
    brightness: tweak.brightness ?? 1.15,
    contrast: tweak.contrast ?? 1.15,
    invert: tweak.invert ?? false,
    opacity: tweak.opacity ?? 1.0,
  };
}

