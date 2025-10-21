'use client'
import { useEffect } from 'react'
import { useSettings } from '@/lib/settings'
import { teamColors } from '@/lib/teamColors'

export default function SettingsPage() {
  const s = useSettings()

  useEffect(() => {
    const c = teamColors[s.favoriteTeam] || { primary: '#3b82f6', secondary: '#93c5fd' }
    const root = document.documentElement
    root.style.setProperty('--accent', c.primary)
    root.style.setProperty('--accent-2', c.secondary)
  }, [s.favoriteTeam])

  return (
    <main className="mx-auto max-w-md p-4 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Settings</h1>
        <a href="/" className="rounded border px-3 py-1.5">Today</a>
      </header>

      <section className="space-y-3">
        <label className="block text-sm font-medium">Favorite team</label>
        <select
          className="w-full rounded-md border bg-background p-2"
          value={s.favoriteTeam}
          onChange={(e) => s.set({ favoriteTeam: e.target.value })}
        >
          {Object.keys(teamColors).map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <div className="flex items-center justify-between">
          <span>Compact layout</span>
          <input type="checkbox" checked={s.compact} onChange={(e) => s.set({ compact: e.target.checked })}/>
        </div>

        <label className="block text-sm font-medium">Timezone</label>
        <select
          className="w-full rounded-md border bg-background p-2"
          value={s.tz}
          onChange={(e) => s.set({ tz: e.target.value })}
        >
          <option value="auto">Auto-detect</option>
          <option value="America/New_York">ET</option>
          <option value="America/Chicago">CT</option>
          <option value="America/Denver">MT</option>
          <option value="America/Los_Angeles">PT</option>
        </select>

        <label className="block text-sm font-medium">Clock</label>
        <select
          className="w-full rounded-md border bg-background p-2"
          value={s.hourFormat}
          onChange={(e) => s.set({ hourFormat: e.target.value as '12' | '24' })}
        >
          <option value="12">12-hour</option>
          <option value="24">24-hour</option>
        </select>

        <div className="flex items-center justify-between">
          <span>No spoilers</span>
          <input type="checkbox" checked={s.noSpoilers} onChange={(e) => s.set({ noSpoilers: e.target.checked })}/>
        </div>
        <div className="flex items-center justify-between">
          <span>Hide finished games</span>
          <input type="checkbox" checked={s.hideFinished} onChange={(e) => s.set({ hideFinished: e.target.checked })}/>
        </div>
        <div className="flex items-center justify-between">
          <span>League Pass badge</span>
          <input type="checkbox" checked={s.showLeaguePass} onChange={(e) => s.set({ showLeaguePass: e.target.checked })}/>
        </div>
        <div className="flex items-center justify-between">
          <span>Blackout warning</span>
          <input type="checkbox" checked={s.showBlackout} onChange={(e) => s.set({ showBlackout: e.target.checked })}/>
        </div>
      </section>

      <button onClick={() => s.reset()} className="w-full rounded-md bg-red-600 py-2 text-white">
        Reset to defaults
      </button>
    </main>
  )
}
