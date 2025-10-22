/**
 * National network detection and normalization
 * Handles ESPN split names, case-insensitive matching, and NBA TV precedence
 */

export const NATIONAL_NETWORKS = ['ABC', 'ESPN', 'ESPN2', 'TNT', 'NBA TV'] as const;

export type NationalNetwork = typeof NATIONAL_NETWORKS[number];

/**
 * Normalize network name for consistent matching
 * Handles ESPN split names ("ESPN/ESPN2" → "ESPN"), ignores "ESPN Deportes"
 */
export function normalizeNetworkName(name: string): string {
  if (!name) return '';
  
  const normalized = name.toLowerCase().trim();
  
  // Handle ESPN split names
  if (normalized.includes('espn/espn2') || normalized.includes('espn2/espn')) {
    return 'ESPN';
  }
  
  // Ignore ESPN Deportes and other variants
  if (normalized.includes('deportes') || normalized.includes('radio')) {
    return '';
  }
  
  // Map common variations to canonical names
  const mappings: Record<string, string> = {
    'espn': 'ESPN',
    'espn2': 'ESPN2', 
    'abc': 'ABC',
    'tnt': 'TNT',
    'nba tv': 'NBA TV',
    'nbatv': 'NBA TV',
    'nba-tv': 'NBA TV',
  };
  
  return mappings[normalized] || '';
}

/**
 * Get the first national network from a list of networks
 * Returns null if no national network found
 * NBA TV is treated as national (displaces LP chips)
 */
export function getNationalNetwork(networks: string[]): NationalNetwork | null {
  if (!networks || networks.length === 0) return null;
  
  // Normalize all networks and find first national match
  for (const network of networks) {
    const normalized = normalizeNetworkName(network);
    if (normalized && NATIONAL_NETWORKS.includes(normalized as NationalNetwork)) {
      return normalized as NationalNetwork;
    }
  }
  
  return null;
}

/**
 * Check if a network is national (for internal use)
 */
export function isNationalNetwork(network: string): boolean {
  const normalized = normalizeNetworkName(network);
  return normalized !== '' && NATIONAL_NETWORKS.includes(normalized as NationalNetwork);
}

/**
 * Filter networks to only include national ones (for UI display)
 * Strips all RSNs and non-national networks
 */
export function filterToNationalOnly(networks: string[]): NationalNetwork[] {
  const result: NationalNetwork[] = [];
  
  for (const network of networks) {
    const normalized = normalizeNetworkName(network);
    if (normalized && NATIONAL_NETWORKS.includes(normalized as NationalNetwork)) {
      result.push(normalized as NationalNetwork);
    }
  }
  
  return result;
}
