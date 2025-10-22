'use client';

import { useSettingsStore } from '@/lib/settings';
import { getShareableURL } from '@/lib/url-params';
import { useState } from 'react';

export default function SettingsPage() {
  const settings = useSettingsStore();
  const [showShareURL, setShowShareURL] = useState(false);

  const timeZones = [
    'America/New_York',
    'America/Chicago', 
    'America/Denver',
    'America/Los_Angeles',
    'America/Phoenix',
    'America/Anchorage',
    'Pacific/Honolulu',
  ];

  const teams = [
    { id: 'ATL', name: 'Atlanta Hawks', colors: { primary: '#E03A3E', secondary: '#C1D32F' } },
    { id: 'BOS', name: 'Boston Celtics', colors: { primary: '#007A33', secondary: '#BA9653' } },
    { id: 'BKN', name: 'Brooklyn Nets', colors: { primary: '#000000', secondary: '#FFFFFF' } },
    { id: 'CHA', name: 'Charlotte Hornets', colors: { primary: '#1D1160', secondary: '#00788C' } },
    { id: 'CHI', name: 'Chicago Bulls', colors: { primary: '#CE1141', secondary: '#000000' } },
    { id: 'CLE', name: 'Cleveland Cavaliers', colors: { primary: '#860038', secondary: '#FDBB30' } },
    { id: 'DAL', name: 'Dallas Mavericks', colors: { primary: '#00538C', secondary: '#002B5E' } },
    { id: 'DEN', name: 'Denver Nuggets', colors: { primary: '#0E2240', secondary: '#FEC524' } },
  ];

  const handleTeamSelect = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (team) {
      settings.setFavoriteTeam(teamId);
      // Update CSS variables
      document.documentElement.style.setProperty('--accent', team.colors.primary);
      document.documentElement.style.setProperty('--secondary', team.colors.secondary);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">
        Settings
      </h1>

      <div className="space-y-6">
        {/* Appearance */}
        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-gray-800">Appearance</legend>
          
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Compact Layout</label>
            <input
              type="checkbox"
              checked={settings.compact}
              onChange={(e) => settings.setCompact(e.target.checked)}
              className="rounded border-gray-300 text-[var(--accent)] focus:ring-[var(--accent)]"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Network Colors</label>
            <select
              value={settings.networkColorMode}
              onChange={(e) => settings.setNetworkColorMode(e.target.value as 'brand' | 'mono')}
              className="rounded border-gray-300 text-sm"
            >
              <option value="brand">Brand Colors</option>
              <option value="mono">Monochrome</option>
            </select>
          </div>
        </fieldset>

        {/* Time & Locale */}
        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-gray-800">Time & Locale</legend>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
            <select
              value={settings.tz}
              onChange={(e) => settings.setTz(e.target.value)}
              className="w-full rounded border-gray-300 text-sm"
            >
              {timeZones.map(tz => (
                <option key={tz} value={tz}>
                  {tz.replace('America/', '').replace('Pacific/', '').replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">12-Hour Format</label>
            <input
              type="checkbox"
              checked={settings.hourFormat === '12'}
              onChange={(e) => settings.setHourFormat(e.target.checked ? '12' : '24')}
              className="rounded border-gray-300 text-[var(--accent)] focus:ring-[var(--accent)]"
            />
          </div>
        </fieldset>

        {/* Content */}
        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-gray-800">Content</legend>
          
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">No Spoilers</label>
            <input
              type="checkbox"
              checked={settings.noSpoilers}
              onChange={(e) => settings.setNoSpoilers(e.target.checked)}
              className="rounded border-gray-300 text-[var(--accent)] focus:ring-[var(--accent)]"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Hide Finished Games</label>
            <input
              type="checkbox"
              checked={settings.hideFinished}
              onChange={(e) => settings.setHideFinished(e.target.checked)}
              className="rounded border-gray-300 text-[var(--accent)] focus:ring-[var(--accent)]"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Show League Pass</label>
            <input
              type="checkbox"
              checked={settings.showLeaguePass}
              onChange={(e) => settings.setShowLeaguePass(e.target.checked)}
              className="rounded border-gray-300 text-[var(--accent)] focus:ring-[var(--accent)]"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Show Blackout Risk</label>
            <input
              type="checkbox"
              checked={settings.showBlackout}
              onChange={(e) => settings.setShowBlackout(e.target.checked)}
              className="rounded border-gray-300 text-[var(--accent)] focus:ring-[var(--accent)]"
            />
          </div>
        </fieldset>

        {/* Favorite Team */}
        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-gray-800">Favorite Team</legend>
          
          <div className="grid grid-cols-2 gap-2">
            {teams.map(team => (
              <button
                key={team.id}
                onClick={() => handleTeamSelect(team.id)}
                className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                  settings.favoriteTeam === team.id
                    ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                {team.name}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Refresh */}
        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-gray-800">Refresh</legend>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Auto Refresh (seconds)</label>
            <input
              type="number"
              min="30"
              max="300"
              value={settings.autoRefreshSec}
              onChange={(e) => settings.setAutoRefreshSec(Number(e.target.value))}
              className="w-full rounded border-gray-300 text-sm"
            />
          </div>
        </fieldset>

        {/* Share & Reset */}
        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-gray-800">Share & Reset</legend>
          
          <div className="space-y-3">
            <button
              onClick={() => setShowShareURL(!showShareURL)}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              {showShareURL ? 'Hide' : 'Show'} Shareable URL
            </button>
            
            {showShareURL && (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Shareable URL</label>
                <input
                  type="text"
                  value={getShareableURL(settings)}
                  readOnly
                  className="w-full rounded border-gray-300 text-sm bg-white"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Click to select and copy. Share this URL to preserve your settings.
                </p>
              </div>
            )}
            
            <button
              onClick={() => {
                if (confirm('Reset all settings to defaults? This cannot be undone.')) {
                  settings.resetSettings();
                }
              }}
              className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm font-medium"
            >
              Reset All Settings
            </button>
          </div>
        </fieldset>
      </div>
    </div>
  );
}
