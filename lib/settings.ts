'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Settings = {
  favoriteTeam: string
  compact: boolean
  tz: 'auto' | string
  hourFormat: '12' | '24'
  noSpoilers: boolean
  hideFinished: boolean
  showLeaguePass: boolean
  showBlackout: boolean
  hiddenNetworks: string[]
  autoRefreshSec: 0 | 30 | 60 | 120
  set: (p: Partial<Settings>) => void
  reset: () => void
}

const defaults: Omit<Settings, 'set' | 'reset'> = {
  favoriteTeam: 'lakers',
  compact: true,
  tz: 'auto',
  hourFormat: '12',
  noSpoilers: true,
  hideFinished: true,
  showLeaguePass: true,
  showBlackout: true,
  hiddenNetworks: [],
  autoRefreshSec: 60,
}

export const useSettings = create<Settings>()(
  persist(
    (set) => ({
      ...defaults,
      set: (p) => set(p),
      reset: () => set(defaults),
    }),
    { name: 'screenassist:settings' }
  )
)
