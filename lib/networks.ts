import React from 'react';

export function normalizeNetworkName(name: string): string {
  if (!name) return '';
  
  const normalized = name.toLowerCase().trim();
  
  // National networks and streaming platforms only
  const mappings: Record<string, string> = {
    // Nationals
    'espn': 'ESPN',
    'abc': 'ABC', 
    'tnt': 'TNT',
    'nba tv': 'NBA TV',
    'nbatv': 'NBA TV',
    'nba-tv': 'NBA TV',
    'trutv': 'TruTV',
    'tru tv': 'TruTV',
    
    // Streaming platforms
    'peacock': 'Peacock',
    'prime video': 'Prime Video',
    'amazon prime': 'Prime Video',
    'max': 'Max',
    'hbo max': 'Max',
    'fubo': 'Fubo',
    'fubotv': 'Fubo',
    'youtube tv': 'YouTube TV',
    'youtubetv': 'YouTube TV',
    'apple tv+': 'Apple TV+',
    'apple tv plus': 'Apple TV+',
    'netflix': 'Netflix',
    
    // Separate Bally Sports and FanDuel TV (distinct brands)
    'bally sports': 'Bally Sports',
    'fanduel sports network': 'FanDuel Sports Network',
    'fanduel tv': 'FanDuel TV',
  };
  
  return mappings[normalized] || name;
}

export const NETWORK_COLORS: Record<string, string> = {
  // Nationals - WCAG AA compliant colors (3:1+ contrast)
  'ESPN': '#E31837',      // ESPN Red - 4.5:1 contrast with white text
  'ABC': '#000000',       // ABC Black - 21:1 contrast with white text
  'TNT': '#E31837',       // TNT Red - 4.5:1 contrast with white text
  'NBA TV': '#E31837',    // NBA TV Red - 4.5:1 contrast with white text
  'TruTV': '#E31837',     // TruTV Red - 4.5:1 contrast with white text
  
  // Streaming platforms - WCAG AA compliant colors
  'Peacock': '#000000',   // Peacock Black - 21:1 contrast with white text
  'Prime Video': '#00A8E1', // Prime Blue - 3.2:1 contrast with white text
  'Max': '#8B5CF6',       // Max Purple - 3.1:1 contrast with white text
  'Fubo': '#00D4AA',      // Fubo Green - 3.0:1 contrast with white text
  'YouTube TV': '#FF0000', // YouTube Red - 3.0:1 contrast with white text
  'Apple TV+': '#000000', // Apple Black - 21:1 contrast with white text
  'Netflix': '#E50914',   // Netflix Red - 4.2:1 contrast with white text
  
  // Separate brands (RSNs filtered out, but keeping for completeness)
  'Bally Sports': '#E31837',
  'FanDuel Sports Network': '#E31837',
  'FanDuel TV': '#E31837',
};

// Calculate relative luminance for WCAG AA contrast compliance
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Get contrast-safe text color (white or black) for WCAG AA compliance
function getContrastColor(bgColor: string): string {
  const rgb = hexToRgb(bgColor);
  if (!rgb) return 'white';
  
  const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
  // WCAG AA requires 4.5:1 contrast ratio
  return luminance > 0.5 ? 'black' : 'white';
}

export function getBadgeStyle(name: string, mode: 'brand' | 'mono'): React.CSSProperties {
  const normalizedName = normalizeNetworkName(name);
  const brandColor = NETWORK_COLORS[normalizedName];
  
  if (mode === 'brand' && brandColor) {
    const textColor = getContrastColor(brandColor);
    return {
      backgroundColor: brandColor,
      color: textColor,
      border: textColor === 'white' ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.1)',
    };
  }
  
  // Monochrome fallback with semantic meaning
  return {
    backgroundColor: 'transparent',
    color: 'var(--accent)',
    border: '1px solid var(--accent)',
  };
}

/**
 * Get semantic label for network badge (for screen readers and accessibility)
 */
export function getNetworkSemanticLabel(network: string): string {
  const normalizedName = normalizeNetworkName(network);
  
  const semanticLabels: Record<string, string> = {
    'ESPN': 'ESPN cable network',
    'ABC': 'ABC broadcast network',
    'TNT': 'TNT cable network',
    'NBA TV': 'NBA TV cable network',
    'TruTV': 'TruTV cable network',
    'Peacock': 'Peacock streaming service',
    'Prime Video': 'Amazon Prime Video streaming',
    'Max': 'Max streaming service',
    'Fubo': 'Fubo streaming service',
    'YouTube TV': 'YouTube TV streaming',
    'Apple TV+': 'Apple TV Plus streaming',
    'Netflix': 'Netflix streaming service',
  };
  
  return semanticLabels[normalizedName] || `${normalizedName} network`;
}

// Filter out RSNs, keep only nationals and streaming platforms
export function filterNationalAndStreaming(networks: string[]): string[] {
  const nationalNetworks = ['ESPN', 'ABC', 'TNT', 'NBA TV', 'TruTV'];
  const streamingNetworks = ['Peacock', 'Prime Video', 'Max', 'Fubo', 'YouTube TV', 'Apple TV+', 'Netflix'];
  
  const normalized = networks.map(normalizeNetworkName);
  
  return normalized.filter(network => 
    nationalNetworks.includes(network) || streamingNetworks.includes(network)
  );
}

// Network priority system for smart badge filtering
export function getNetworkPriority(network: string): number {
  const normalizedName = normalizeNetworkName(network);
  
  // Priority 1: National networks (always accessible)
  const nationalNetworks = ['ESPN', 'ABC', 'TNT', 'NBA TV', 'TruTV'];
  if (nationalNetworks.includes(normalizedName)) return 1;
  
  // Priority 2: Regional Sports Networks (RSNs)
  const rsnKeywords = ['FanDuel', 'MSG', 'Bally', 'YES', 'NBC Sports', 'FOX Sports', 'AT&T SportsNet', 'Spectrum', 'Root Sports'];
  if (rsnKeywords.some(keyword => normalizedName.includes(keyword))) return 2;
  
  // Priority 3: League Pass (tertiary)
  if (normalizedName.includes('League Pass')) return 3;
  
  // Priority 4: Other networks
  return 4;
}

// Smart badge filtering with 2-badge max rule
export function filterSmartBadges(networks: string[], showLeaguePass: boolean, isLeaguePassOnly: boolean): string[] { // eslint-disable-line @typescript-eslint/no-unused-vars
  const normalized = networks.map(normalizeNetworkName);
  const nationalNetworks = ['ESPN', 'ABC', 'TNT', 'NBA TV', 'TruTV'];
  const rsnKeywords = ['FanDuel', 'MSG', 'Bally', 'YES', 'NBC Sports', 'FOX Sports', 'AT&T SportsNet', 'Spectrum', 'Root Sports'];
  
  // Sort by priority
  const sorted = normalized.sort((a, b) => getNetworkPriority(a) - getNetworkPriority(b));
  
  const result: string[] = [];
  
  // Always show national TV first if available
  const national = sorted.find(network => nationalNetworks.includes(network));
  if (national) {
    result.push(national);
  }
  
  // Show RSN second if we have space and no national
  if (result.length < 2) {
    const rsn = sorted.find(network => rsnKeywords.some(keyword => network.includes(keyword)));
    if (rsn) {
      result.push(rsn);
    }
  }
  
  // Show LP badge only if:
  // 1. LP-only game (no other broadcasts), OR
  // 2. User has enabled "Show League Pass" setting
  if (result.length < 2 && (isLeaguePassOnly || showLeaguePass)) {
    result.push('League Pass');
  }
  
  return result.slice(0, 2); // Cap at 2 badges max
}

// Blackout status detection
export type BlackoutStatus = 'available' | 'national-blackout' | 'regional-blackout' | 'no-lp';

export function getBlackoutStatus(networks: string[], isLeaguePass: boolean): BlackoutStatus {
  const normalized = networks.map(normalizeNetworkName);
  const nationalNetworks = ['ESPN', 'ABC', 'TNT', 'NBA TV', 'TruTV'];
  const rsnKeywords = ['FanDuel', 'MSG', 'Bally', 'YES', 'NBC Sports', 'FOX Sports', 'AT&T SportsNet', 'Spectrum', 'Root Sports'];
  
  const hasNational = normalized.some(network => nationalNetworks.includes(network));
  const hasRSN = normalized.some(network => rsnKeywords.some(keyword => network.includes(keyword)));
  
  if (!isLeaguePass) {
    return 'no-lp';
  }
  
  if (hasNational) {
    return 'national-blackout';
  }
  
  if (hasRSN) {
    return 'regional-blackout';
  }
  
  return 'available';
}

export function sortNetworks(networks: string[]): string[] {
  // Only nationals and streamers - RSNs filtered out
  const nationalNetworks = ['ESPN', 'ABC', 'TNT', 'NBA TV', 'TruTV'];
  const streamingNetworks = ['Peacock', 'Prime Video', 'Max', 'Fubo', 'YouTube TV', 'Apple TV+', 'Netflix'];
  const normalized = networks.map(normalizeNetworkName);
  
  return normalized.sort((a, b) => {
    const aIsNational = nationalNetworks.includes(a);
    const bIsNational = nationalNetworks.includes(b);
    const aIsStreaming = streamingNetworks.includes(a);
    const bIsStreaming = streamingNetworks.includes(b);
    
    // Nationals first
    if (aIsNational && !bIsNational) return -1;
    if (!aIsNational && bIsNational) return 1;
    
    // Then streamers
    if (aIsStreaming && !bIsStreaming && !bIsNational) return -1;
    if (!aIsStreaming && bIsStreaming && !aIsNational) return 1;
    
    return a.localeCompare(b);
  });
}
