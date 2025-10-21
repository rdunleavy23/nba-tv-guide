'use client';

import { useState, useEffect } from 'react';
import { useSettingsStore } from '@/lib/settings';
import GameCard from '@/components/GameCard';
import DateScroller from '@/components/DateScroller';
import { NormalizedGame } from '@/app/api/scoreboard/route';

export default function WeekPage() {
  const [games, setGames] = useState<NormalizedGame[]>([]);
  const [loading, setLoading] = useState(false);
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

  // Filter games based on settings
  const filteredGames = games.filter(game => {
    if (settings.hideFinished && game.flags.isFinished) {
      return false;
    }
    return true;
  });

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
      />
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {formatSelectedDate(selectedDate)}
        </h2>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg">Loading games...</p>
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg">No games on this date</p>
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
