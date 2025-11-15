'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type TimeZoneMode = 'et' | 'local';

export interface TimeZoneSettings {
  mode: TimeZoneMode;
  localZone: string | null;
  displayZone: string; // The actual timezone to use for formatting
}

const TimeZoneContext = createContext<{
  settings: TimeZoneSettings;
  updateMode: (mode: TimeZoneMode) => void;
}>({
  settings: {
    mode: 'et',
    localZone: null,
    displayZone: 'America/New_York',
  },
  updateMode: () => {},
});

export function useTimeZone() {
  return useContext(TimeZoneContext);
}

interface TimeZoneProviderProps {
  children: ReactNode;
}

export function TimeZoneProvider({ children }: TimeZoneProviderProps) {
  const [settings, setSettings] = useState<TimeZoneSettings>({
    mode: 'et',
    localZone: null,
    displayZone: 'America/New_York',
  });

  // Auto-detect timezone on mount
  useEffect(() => {
    try {
      const detectedZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Load saved preference from localStorage
      const savedMode = localStorage.getItem('sa_timezone_mode') as TimeZoneMode | null;

      setSettings(prev => ({
        ...prev,
        localZone: detectedZone,
        mode: savedMode || 'et',
        displayZone: savedMode === 'local' ? detectedZone : 'America/New_York',
      }));
    } catch (error) {
      console.error('Failed to detect timezone:', error);
    }
  }, []);

  const updateMode = (mode: TimeZoneMode) => {
    try {
      localStorage.setItem('sa_timezone_mode', mode);

      setSettings(prev => ({
        ...prev,
        mode,
        displayZone: mode === 'local' && prev.localZone
          ? prev.localZone
          : 'America/New_York',
      }));
    } catch (error) {
      console.error('Failed to save timezone mode:', error);
    }
  };

  return (
    <TimeZoneContext.Provider value={{ settings, updateMode }}>
      {children}
    </TimeZoneContext.Provider>
  );
}

/**
 * Get a formatted label for the current timezone setting
 */
export function getTimeZoneLabel(settings: TimeZoneSettings): string {
  if (settings.mode === 'et') {
    return 'All times in ET';
  }

  if (settings.localZone) {
    // Extract city name from IANA timezone (e.g., "America/Chicago" → "Chicago")
    const parts = settings.localZone.split('/');
    const city = parts[parts.length - 1].replace(/_/g, ' ');
    return `All times in ${city} time`;
  }

  return 'All times in local time';
}
