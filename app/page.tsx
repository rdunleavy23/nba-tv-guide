'use client';

import Link from 'next/link';
import { absoluteUrl } from '@/lib/absolute-url';
import { useSettingsStore } from '@/lib/settings';
import { syncURLWithSettings, updateURL } from '@/lib/url-params';
import GameCard from '@/components/GameCard';
import { NormalizedGame } from '@/app/api/scoreboard/route';
import { useEffect, useState } from 'react';

async function getTodaysGames(): Promise<{ games: NormalizedGame[]; error?: string }> {
  try {
    const url = absoluteUrl('/api/scoreboard');
    const response = await fetch(url, { 
      next: { revalidate: 60 } 
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch games: ${response.status}`);
    }
    
    const data = await response.json();
    return { games: data.games || [] };
  } catch (error) {
    console.error('Error fetching games:', error);
    return { 
      games: [], 
      error: error instanceof Error ? error.message : 'Failed to load games' 
    };
  }
}

export default function Home() {
  const settings = useSettingsStore();
  const [result, setResult] = useState<{ games: NormalizedGame[]; error?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync URL parameters with settings on mount
  useEffect(() => {
    syncURLWithSettings(settings, settings.updateSettings);
  }, [settings]);

  // Update URL when settings change
  useEffect(() => {
    updateURL(settings);
  }, [settings]);

  // Fetch games data
  useEffect(() => {
    async function fetchGames() {
      try {
        const data = await getTodaysGames();
        setResult(data);
      } catch {
        setResult({ games: [], error: 'Failed to load games' });
      } finally {
        setLoading(false);
      }
    }
    
    fetchGames();
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">
          NBA Games Today
        </h1>
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg">Loading games...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">
          NBA Games Today
        </h1>
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg">No data available</p>
        </div>
      </div>
    );
  }
  
  // Handle error state
  if (result.error) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">
          NBA Games Today
        </h1>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-800 mb-3">
            Unable to load games: {result.error}
          </p>
          <div className="space-x-3">
            <Link 
              href="/"
              className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 inline-block"
            >
              Retry
            </Link>
            <a 
              href="https://www.espn.com/nba/scoreboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-600 hover:text-yellow-800 underline"
            >
              View on ESPN.com
            </a>
          </div>
        </div>
      </div>
    );
  }
  
  // Filter games based on settings
  const filteredGames = result.games.filter(game => {
    if (settings.hideFinished && game.flags.isFinished) {
      return false;
    }
    return true;
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">
        NBA Games Today
      </h1>
      
      {filteredGames.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg">No games today</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              tz={settings.tz}
              hour12={settings.hourFormat === '12'}
              compact={settings.compact}
              showLeaguePass={settings.showLeaguePass}
              showBlackout={settings.showBlackout}
              networkColorMode={settings.networkColorMode}
              hiddenNetworks={settings.hiddenNetworks}
              noSpoilers={settings.noSpoilers}
            />
          ))}
        </div>
      )}
    </div>
  );
}
