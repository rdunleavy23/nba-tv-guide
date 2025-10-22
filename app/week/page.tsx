'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSettingsStore } from '@/lib/settings';
import { getTimezoneAbbreviation } from '@/lib/timezone';
import GameCard from '@/components/GameCard';
import DateScroller from '@/components/DateScroller';
import QuickFilters from '@/components/QuickFilters';
import { NormalizedGame } from '@/app/api/scoreboard/route';

export default function WeekPage() {
  const [games, setGames] = useState<NormalizedGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [gameCounts, setGameCounts] = useState<Record<string, number>>({});
  const [displayGames, setDisplayGames] = useState<NormalizedGame[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0].replace(/-/g, '');
  });

  const settings = useSettingsStore();

  const fetchGames = async (date: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/scoreboard?date=${date}`);
      if (!response.ok) {
        throw new Error('Failed to fetch games');
      }
      const data = await response.json();
      setGames(data.games || []);
      
      // Update game counts
      setGameCounts(prev => ({
        ...prev,
        [date]: data.gameCount || 0
      }));
    } catch (error) {
      console.error('Error fetching games:', error);
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames(selectedDate);
  }, [selectedDate]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  // Apply persistent filters and update display games
  useEffect(() => {
    if (!games.length) return;
    
    let filteredGames = games.filter(game => {
      if (settings.hideFinished && game.flags.isFinished) {
        return false;
      }
      return true;
    });
    
    // Apply persistent filters
    if (settings.leaguePassOnly) {
      filteredGames = filteredGames.filter(game => game.flags.isLeaguePass);
    }
    
    if (settings.nationalGamesOnly) {
      const nationalNetworks = ['ESPN', 'ABC', 'TNT', 'NBA TV', 'TruTV'];
      filteredGames = filteredGames.filter(game => 
        game.broadcasts.some(broadcast => 
          nationalNetworks.some(national => broadcast.includes(national))
        )
      );
    }
    
    if (settings.myTeamOnly && settings.favoriteTeam) {
      filteredGames = filteredGames.filter(game => 
        game.awayAbbr === settings.favoriteTeam || game.homeAbbr === settings.favoriteTeam
      );
    }
    
    setDisplayGames(filteredGames);
  }, [games, settings]);

  const formatSelectedDate = (dateString: string) => {
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    const date = new Date(`${year}-${month}-${day}`);
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">
        NBA Games
      </h1>
      
      <DateScroller 
        selectedDate={selectedDate} 
        onDateSelect={handleDateSelect}
        gameCounts={gameCounts}
      />
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-gray-800">
            {formatSelectedDate(selectedDate)}
          </h2>
          
          {/* Spoiler protection toggle */}
          <button 
            onClick={() => settings.setNoSpoilers(!settings.noSpoilers)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              settings.noSpoilers 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-gray-100 text-gray-600 border border-gray-200'
            }`}
          >
            {settings.noSpoilers ? '🔒 Spoilers OFF' : '🔓 Spoilers ON'}
          </button>
        </div>
        
        {/* Timezone indicator */}
        <div className="text-sm text-gray-600">
          All times shown in <span className="font-medium">{getTimezoneAbbreviation(settings.tz)}</span>
          <Link href="/settings" className="ml-1 text-blue-600 hover:text-blue-800 underline">
            (change)
          </Link>
        </div>
      </div>

      <QuickFilters 
        games={games}
        onFilteredGamesChange={setDisplayGames}
        favoriteTeam={settings.favoriteTeam}
      />
      
      {loading ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg">Loading games...</p>
        </div>
      ) : displayGames.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg">No games on this date</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayGames.map((game) => (
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
