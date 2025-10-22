import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getBrowserTimezone, getTimezoneWithFallback } from './timezone';

export interface Settings {
  favoriteTeam: string;
  compact: boolean;
  tz: string;
  hourFormat: '12' | '24';
  noSpoilers: boolean;
  hideFinished: boolean;
  showLeaguePass: boolean;
  showBlackout: boolean;
  hiddenNetworks: string[];
  networkColorMode: 'brand' | 'mono';
  autoRefreshSec: number;
}

export const defaultSettings: Settings = {
  favoriteTeam: '',
  compact: true,
  tz: getBrowserTimezone(), // Auto-detect browser timezone
  hourFormat: '12',
  noSpoilers: true,
  hideFinished: true,
  showLeaguePass: true,
  showBlackout: true,
  hiddenNetworks: [],
  networkColorMode: 'brand',
  autoRefreshSec: 60,
};

export const useSettingsStore = create<Settings & {
  setFavoriteTeam: (team: string) => void;
  setCompact: (compact: boolean) => void;
  setTz: (tz: string) => void;
  setHourFormat: (hourFormat: '12' | '24') => void;
  setNoSpoilers: (noSpoilers: boolean) => void;
  setHideFinished: (hideFinished: boolean) => void;
  setShowLeaguePass: (showLeaguePass: boolean) => void;
  setShowBlackout: (showBlackout: boolean) => void;
  setHiddenNetworks: (hiddenNetworks: string[]) => void;
  setNetworkColorMode: (networkColorMode: 'brand' | 'mono') => void;
  setAutoRefreshSec: (autoRefreshSec: number) => void;
  updateSettings: (updates: Partial<Settings>) => void;
  resetSettings: () => void;
}>()(
  persist(
    (set) => ({
      ...defaultSettings,
      setFavoriteTeam: (team: string) => set({ favoriteTeam: team }),
      setCompact: (compact: boolean) => set({ compact }),
      setTz: (tz: string) => set({ tz }),
      setHourFormat: (hourFormat: '12' | '24') => set({ hourFormat }),
      setNoSpoilers: (noSpoilers: boolean) => set({ noSpoilers }),
      setHideFinished: (hideFinished: boolean) => set({ hideFinished }),
      setShowLeaguePass: (showLeaguePass: boolean) => set({ showLeaguePass }),
      setShowBlackout: (showBlackout: boolean) => set({ showBlackout }),
      setHiddenNetworks: (hiddenNetworks: string[]) => set({ hiddenNetworks }),
      setNetworkColorMode: (networkColorMode: 'brand' | 'mono') => set({ networkColorMode }),
      setAutoRefreshSec: (autoRefreshSec: number) => set({ autoRefreshSec }),
      updateSettings: (updates: Partial<Settings>) => set(updates),
      resetSettings: () => set(defaultSettings),
    }),
    {
      name: 'screenassist-settings',
      skipHydration: true, // Prevent hydration mismatch
      // Remove expiration - persist indefinitely with manual reset option
    }
  )
);
