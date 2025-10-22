'use client';

import { useSettingsStore } from '@/lib/settings';
import { getShareableURL } from '@/lib/url-params';
import { getCommonTimezones, getTimezoneDisplayName, getBrowserTimezone, getTimezoneDebugInfo } from '@/lib/timezone';
import { requestLocation, detectRegion, getBlackoutRules, getRegionDisplayName, GeolocationError } from '@/lib/geolocation';
import { useState } from 'react';

export default function SettingsPage() {
  const settings = useSettingsStore();
  const [showShareURL, setShowShareURL] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const timeZones = getCommonTimezones();
  const browserTz = getBrowserTimezone();
  const debugInfo = getTimezoneDebugInfo(settings.tz);

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

  const handleLocationDetection = async () => {
    setLocationLoading(true);
    setLocationError(null);
    
    try {
      const location = await requestLocation();
      settings.setUserLocation(location);
    } catch (error) {
      const geoError = error as GeolocationError;
      setLocationError(geoError.message);
    } finally {
      setLocationLoading(false);
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
            <div className="space-y-2">
              <select
                value={settings.tz}
                onChange={(e) => settings.setTz(e.target.value)}
                className="w-full rounded border-gray-300 text-sm"
              >
                {timeZones.map(tz => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
              
              {/* Timezone Debug Info */}
              <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-xs">
                <div className="space-y-1">
                  <div><strong>Selected:</strong> {getTimezoneDisplayName(settings.tz)} ({settings.tz})</div>
                  <div><strong>Browser:</strong> {getTimezoneDisplayName(browserTz)} ({browserTz})</div>
                  <div><strong>Current Time:</strong> {debugInfo.currentTime}</div>
                  <div><strong>DST Active:</strong> {debugInfo.isDST ? 'Yes' : 'No'}</div>
                  <div><strong>Valid:</strong> {debugInfo.isValid ? 'Yes' : 'No'}</div>
                </div>
              </div>
              
              {/* Reset to Browser Timezone */}
              {settings.tz !== browserTz && (
                <button
                  onClick={() => settings.setTz(browserTz)}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Reset to Browser Timezone ({getTimezoneDisplayName(browserTz)})
                </button>
              )}
            </div>
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

        {/* Filters */}
        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-gray-800">Default Filters</legend>
          <p className="text-sm text-gray-600">These filters will be applied by default when viewing games. You can override them temporarily using quick filters on the main pages.</p>
          
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">League Pass Only</label>
            <input
              type="checkbox"
              checked={settings.leaguePassOnly}
              onChange={(e) => settings.setLeaguePassOnly(e.target.checked)}
              className="rounded border-gray-300 text-[var(--accent)] focus:ring-[var(--accent)]"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">National Games Only</label>
            <input
              type="checkbox"
              checked={settings.nationalGamesOnly}
              onChange={(e) => settings.setNationalGamesOnly(e.target.checked)}
              className="rounded border-gray-300 text-[var(--accent)] focus:ring-[var(--accent)]"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">My Team Only</label>
            <input
              type="checkbox"
              checked={settings.myTeamOnly}
              onChange={(e) => settings.setMyTeamOnly(e.target.checked)}
              className="rounded border-gray-300 text-[var(--accent)] focus:ring-[var(--accent)]"
            />
          </div>
        </fieldset>

        {/* Blackout Zone Tester */}
        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-gray-800">Blackout Zone Tester</legend>
          <p className="text-sm text-gray-600">
            Detect your location to see which regional sports networks (RSNs) would black out League Pass games in your area.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={handleLocationDetection}
              disabled={locationLoading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-sm font-medium"
            >
              {locationLoading ? 'Detecting Location...' : 'Detect My Location'}
            </button>
            
            {locationError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-800 text-sm">
                  <strong>Error:</strong> {locationError}
                </p>
                <p className="text-red-600 text-xs mt-1">
                  You can manually set your location below or continue without location-based blackout detection.
                </p>
              </div>
            )}
            
            {settings.userLocation && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <div className="space-y-2">
                  <div className="text-green-800 text-sm">
                    <strong>Detected Region:</strong> {getRegionDisplayName(settings.userLocation.region)}
                  </div>
                  <div className="text-green-700 text-xs">
                    Coordinates: {settings.userLocation.lat.toFixed(4)}, {settings.userLocation.lon.toFixed(4)}
                  </div>
                  
                  {(() => {
                    const blackoutRules = getBlackoutRules(settings.userLocation.region);
                    return blackoutRules.length > 0 ? (
                      <div className="mt-2">
                        <div className="text-green-800 text-xs font-medium">RSNs that black out League Pass:</div>
                        <div className="text-green-700 text-xs mt-1">
                          {blackoutRules.join(', ')}
                        </div>
                      </div>
                    ) : (
                      <div className="text-green-700 text-xs mt-1">
                        No regional blackouts detected for this area.
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
            
            <div className="text-xs text-gray-500">
              <strong>Privacy:</strong> Location data is only used for blackout detection and is stored locally on your device.
            </div>
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
