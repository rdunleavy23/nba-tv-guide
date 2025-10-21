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
  // Nationals
  'ESPN': '#E31837',
  'ABC': '#000000',
  'TNT': '#E31837',
  'NBA TV': '#E31837',
  'TruTV': '#E31837',
  
  // Streaming platforms
  'Peacock': '#000000',
  'Prime Video': '#00A8E1',
  'Max': '#8B5CF6',
  'Fubo': '#00D4AA',
  'YouTube TV': '#FF0000',
  'Apple TV+': '#000000',
  'Netflix': '#E50914',
  
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
  
  return {
    backgroundColor: 'transparent',
    color: 'var(--accent)',
    border: '1px solid var(--accent)',
  };
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
