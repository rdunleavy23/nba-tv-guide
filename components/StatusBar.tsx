'use client';

import { NormalizedGame } from '@/app/api/scoreboard/route';

interface StatusBarProps {
  games: NormalizedGame[];
}

export default function StatusBar({ games }: StatusBarProps) {
  const now = new Date();
  const liveGames = games.filter(game => {
    const gameTime = new Date(game.time);
    const gameEnd = new Date(gameTime.getTime() + 2.5 * 60 * 60 * 1000); // Assume 2.5 hour games
    return gameTime <= now && now <= gameEnd && !game.flags.isFinished;
  });
  
  const upcomingGames = games.filter(game => {
    const gameTime = new Date(game.time);
    return gameTime > now && !game.flags.isFinished;
  });

  if (liveGames.length === 0 && upcomingGames.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 mb-4">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          {liveGames.length > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="font-medium text-gray-800">
                {liveGames.length} game{liveGames.length !== 1 ? 's' : ''} live now
              </span>
            </div>
          )}
          
          {upcomingGames.length > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">
                {upcomingGames.length} upcoming
              </span>
            </div>
          )}
        </div>
        
        <div className="text-gray-500 text-xs">
          {games.length} total game{games.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
