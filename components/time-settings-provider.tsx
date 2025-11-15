'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { TimeSettings, TimeMode } from '@/lib/time-settings';
import { DEFAULT_TIME_SETTINGS } from '@/lib/time-settings';

interface TimeSettingsContextValue {
  settings: TimeSettings;
  setMode: (mode: TimeMode) => void;
}

const TimeSettingsContext = createContext<TimeSettingsContextValue>({
  settings: DEFAULT_TIME_SETTINGS,
  setMode: () => {},
});

const STORAGE_KEY = 'screenassist_time_settings';

export function TimeSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<TimeSettings>(() => {
    if (typeof window === 'undefined') return DEFAULT_TIME_SETTINGS;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as TimeSettings;
        return parsed;
      }
    } catch {}

    // Auto-detect user's timezone on first load
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return {
      mode: 'local',
      localZone: tz ?? null,
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const setMode = (mode: TimeMode) => {
    setSettings(prev => ({ ...prev, mode }));
  };

  return (
    <TimeSettingsContext.Provider value={{ settings, setMode }}>
      {children}
    </TimeSettingsContext.Provider>
  );
}

export function useTimeSettings() {
  return useContext(TimeSettingsContext);
}

/**
 * Get display timezone based on settings
 */
export function getDisplayZone(settings: TimeSettings): string {
  if (settings.mode === 'et') {
    return 'America/New_York';
  }
  return settings.localZone ?? 'America/New_York';
}

/**
 * Get formatted label for current time settings
 */
export function getTimeLabel(settings: TimeSettings): string {
  if (settings.mode === 'et') {
    return 'All times in ET';
  }

  if (settings.localZone) {
    const parts = settings.localZone.split('/');
    const city = parts[parts.length - 1].replace(/_/g, ' ');
    return `All times in ${city} time`;
  }

  return 'All times in local time';
}
