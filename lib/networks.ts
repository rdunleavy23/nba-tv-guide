import React from 'react';

export function normalizeNetworkName(name: string): string {
  if (!name) return '';
  
  const normalized = name.toLowerCase().trim();
  
  // Common mappings
  const mappings: Record<string, string> = {
    'nba tv': 'NBA TV',
    'prime video': 'Prime Video',
    'nbc sports': 'NBC Sports',
    'fox sports': 'FOX Sports',
    'espn': 'ESPN',
    'abc': 'ABC',
    'tnt': 'TNT',
    'peacock': 'Peacock',
    'bally sports': 'Bally Sports',
    'spectrum sportsnet': 'Spectrum SportsNet',
    'msg': 'MSG',
    'yes': 'YES',
    'altitude': 'Altitude',
    'monumental': 'Monumental',
    'fanduel sports network': 'FanDuel Sports Network',
  };
  
  return mappings[normalized] || name;
}

export const NETWORK_COLORS: Record<string, string> = {
  'ESPN': '#E31837',
  'ABC': '#000000',
  'TNT': '#E31837',
  'NBA TV': '#E31837',
  'Peacock': '#000000',
  'Prime Video': '#00A8E1',
  'NBC Sports': '#E31837',
  'FOX Sports': '#E31837',
  'FOX': '#E31837',
  'YES': '#132448',
  'MSG': '#0047AB',
  'Spectrum SportsNet': '#E31837',
  'Bally Sports': '#E31837',
  'Altitude': '#E31837',
  'Monumental': '#E31837',
  'FanDuel Sports Network': '#E31837',
};

export function getBadgeStyle(name: string, mode: 'brand' | 'mono'): React.CSSProperties {
  const normalizedName = normalizeNetworkName(name);
  const brandColor = NETWORK_COLORS[normalizedName];
  
  if (mode === 'brand' && brandColor) {
    return {
      backgroundColor: brandColor,
      color: 'white',
    };
  }
  
  return {
    backgroundColor: 'transparent',
    color: 'var(--accent)',
    border: '1px solid var(--accent)',
  };
}

export function sortNetworks(networks: string[]): string[] {
  const nationalNetworks = ['ESPN', 'ABC', 'TNT', 'NBC', 'Peacock', 'Prime Video', 'NBA TV'];
  const normalized = networks.map(normalizeNetworkName);
  
  return normalized.sort((a, b) => {
    const aIsNational = nationalNetworks.includes(a);
    const bIsNational = nationalNetworks.includes(b);
    
    if (aIsNational && !bIsNational) return -1;
    if (!aIsNational && bIsNational) return 1;
    
    return a.localeCompare(b);
  });
}
