'use client';

import { useState } from 'react';
import { NormalizedGame } from '@/app/api/scoreboard/route';

interface QuickFiltersProps {
  games: NormalizedGame[];
  onFilteredGamesChange: (filteredGames: NormalizedGame[]) => void;
  favoriteTeam: string;
}

export default function QuickFilters({ games, onFilteredGamesChange, favoriteTeam }: QuickFiltersProps) {
  const [activeFilters, setActiveFilters] = useState<{
    leaguePass: boolean;
    national: boolean;
    myTeam: boolean;
  }>({
    leaguePass: false,
    national: false,
    myTeam: false,
  });

  const applyFilters = (filters: typeof activeFilters) => {
    let filteredGames = [...games];

    if (filters.leaguePass) {
      filteredGames = filteredGames.filter(game => game.flags.isLeaguePass);
    }

    if (filters.national) {
      const nationalNetworks = ['ESPN', 'ABC', 'TNT', 'NBA TV', 'TruTV'];
      filteredGames = filteredGames.filter(game => 
        game.broadcasts.some(broadcast => 
          nationalNetworks.some(national => broadcast.includes(national))
        )
      );
    }

    if (filters.myTeam && favoriteTeam) {
      filteredGames = filteredGames.filter(game => 
        game.awayAbbr === favoriteTeam || game.homeAbbr === favoriteTeam
      );
    }

    onFilteredGamesChange(filteredGames);
  };

  const toggleFilter = (filterType: keyof typeof activeFilters) => {
    const newFilters = {
      ...activeFilters,
      [filterType]: !activeFilters[filterType],
    };
    setActiveFilters(newFilters);
    applyFilters(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      leaguePass: false,
      national: false,
      myTeam: false,
    };
    setActiveFilters(clearedFilters);
    onFilteredGamesChange(games);
  };

  const hasActiveFilters = Object.values(activeFilters).some(Boolean);

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-gray-700">Quick filters:</span>
        
        <button
          onClick={() => toggleFilter('leaguePass')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            activeFilters.leaguePass
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
          }`}
        >
          League Pass
        </button>

        <button
          onClick={() => toggleFilter('national')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            activeFilters.national
              ? 'bg-red-100 text-red-800 border border-red-200'
              : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
          }`}
        >
          National TV
        </button>

        {favoriteTeam && (
          <button
            onClick={() => toggleFilter('myTeam')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              activeFilters.myTeam
                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            My Team ({favoriteTeam})
          </button>
        )}

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="px-3 py-1 rounded-full text-sm font-medium text-gray-500 hover:text-gray-700 underline"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
