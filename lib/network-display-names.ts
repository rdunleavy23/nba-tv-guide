/**
 * Display name mapping for network badges
 * Optimized for mobile: all names ≤ 7 characters for 96px badge container
 */

export const NETWORK_DISPLAY_NAMES: Record<string, string> = {
  // National Networks (Already short)
  'ESPN': 'ESPN',
  'ESPN2': 'ESPN2',
  'ABC': 'ABC',
  'NBC': 'NBC',
  'TNT': 'TNT',
  'TBS': 'TBS',

  // NBA Networks
  'NBA TV': 'NBA TV',
  'NBATV': 'NBA TV',

  // Streaming Platforms (Shortened)
  'Prime Video': 'Prime',
  'Amazon Prime': 'Prime',
  'Peacock': 'Peacock',
  'Apple TV+': 'Apple+',
  'Apple TV Plus': 'Apple+',
  'YouTube TV': 'YouTube',
  'YouTubeTv': 'YouTube',
  'Max': 'Max',
  'HBO Max': 'Max',
  'Netflix': 'Netflix',
  'Fubo': 'Fubo',
  'FuboTV': 'Fubo',
  'Hulu': 'Hulu',
  'Sling': 'Sling',

  // League Pass
  'League Pass': 'LP',

  // Regional Sports Networks (Shortened)
  'MSG': 'MSG',
  'YES': 'YES',
  'Bally Sports': 'Bally',
  'FanDuel Sports Network': 'FanDuel',
  'FanDuel TV': 'FanDuel',
  'NBC Sports': 'NBCS',
  'FOX Sports': 'FOX',
  'AT&T SportsNet': 'AT&T',
  'Spectrum': 'Spec',
  'Root Sports': 'Root',

  // Fallback
  'TV info TBD': 'TBD',
  'Other': 'Other',
};

/**
 * Get short display name for badge (max 7 characters)
 */
export function getDisplayName(networkName: string): string {
  // Direct lookup
  if (NETWORK_DISPLAY_NAMES[networkName]) {
    return NETWORK_DISPLAY_NAMES[networkName];
  }

  // Try normalized version
  const normalized = networkName.toLowerCase().trim();
  for (const [key, value] of Object.entries(NETWORK_DISPLAY_NAMES)) {
    if (key.toLowerCase() === normalized) {
      return value;
    }
  }

  // Fallback: truncate to 7 chars
  return networkName.substring(0, 7);
}

/**
 * Check if a name needs truncation warning (for UX audit)
 */
export function needsTruncation(displayName: string): boolean {
  return displayName.length > 7;
}

/**
 * Get all possible display names (for testing)
 */
export function getAllDisplayNames(): string[] {
  return [...new Set(Object.values(NETWORK_DISPLAY_NAMES))];
}
