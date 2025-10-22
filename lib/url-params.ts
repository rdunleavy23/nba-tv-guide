'use client';

import { Settings } from './settings';

export interface URLParams {
  tz?: string;
  spoilers?: 'on' | 'off';
  compact?: 'on' | 'off';
  theme?: 'brand' | 'mono';
  hide?: string; // comma-separated list of networks to hide
}

/**
 * Parse URL search parameters into settings object
 */
export function parseURLParams(searchParams: URLSearchParams): Partial<Settings> {
  const params: Partial<Settings> = {};

  // Timezone
  const tz = searchParams.get('tz');
  if (tz) {
    params.tz = tz;
  }

  // No spoilers
  const spoilers = searchParams.get('spoilers');
  if (spoilers === 'off') {
    params.noSpoilers = false;
  } else if (spoilers === 'on') {
    params.noSpoilers = true;
  }

  // Compact mode
  const compact = searchParams.get('compact');
  if (compact === 'on') {
    params.compact = true;
  } else if (compact === 'off') {
    params.compact = false;
  }

  // Network color mode
  const theme = searchParams.get('theme');
  if (theme === 'mono') {
    params.networkColorMode = 'mono';
  } else if (theme === 'brand') {
    params.networkColorMode = 'brand';
  }

  // Hidden networks
  const hide = searchParams.get('hide');
  if (hide) {
    params.hiddenNetworks = hide.split(',').map(n => n.trim()).filter(Boolean);
  }

  return params;
}

/**
 * Generate URL search parameters from settings object
 */
export function generateURLParams(settings: Settings): URLSearchParams {
  const params = new URLSearchParams();

  // Only add non-default values to keep URLs clean
  if (settings.tz !== 'America/New_York') {
    params.set('tz', settings.tz);
  }

  if (!settings.noSpoilers) {
    params.set('spoilers', 'off');
  }

  if (!settings.compact) {
    params.set('compact', 'off');
  }

  if (settings.networkColorMode === 'mono') {
    params.set('theme', 'mono');
  }

  if (settings.hiddenNetworks.length > 0) {
    params.set('hide', settings.hiddenNetworks.join(','));
  }

  return params;
}

/**
 * Update browser URL with current settings (without page reload)
 */
export function updateURL(settings: Settings): void {
  if (typeof window === 'undefined') return;

  const params = generateURLParams(settings);
  const newURL = params.toString() 
    ? `${window.location.pathname}?${params.toString()}`
    : window.location.pathname;

  window.history.replaceState({}, '', newURL);
}

/**
 * Get shareable URL with current settings
 */
export function getShareableURL(settings: Settings): string {
  if (typeof window === 'undefined') return '';

  const params = generateURLParams(settings);
  const baseURL = window.location.origin + window.location.pathname;
  
  return params.toString() 
    ? `${baseURL}?${params.toString()}`
    : baseURL;
}

/**
 * Sync URL parameters with settings store on page load
 */
export function syncURLWithSettings(
  settings: Settings,
  updateSettings: (updates: Partial<Settings>) => void
): void {
  if (typeof window === 'undefined') return;

  const urlParams = new URLSearchParams(window.location.search);
  const urlSettings = parseURLParams(urlParams);

  // Only update settings that are different from current values
  const updates: Partial<Settings> = {};
  
  Object.entries(urlSettings).forEach(([key, value]) => {
    if (value !== undefined && settings[key as keyof Settings] !== value) {
      updates[key as keyof Settings] = value;
    }
  });

  if (Object.keys(updates).length > 0) {
    updateSettings(updates);
  }
}
