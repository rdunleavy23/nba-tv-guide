'use client';

import { getBadgeStyle, sortNetworks } from '@/lib/networks';
import { NormalizedGame } from '@/app/api/scoreboard/route';

interface GameCardProps {
  game: NormalizedGame;
  tz: string;
  hour12: boolean;
  compact: boolean;
  showLeaguePass: boolean;
  showBlackout: boolean;
  networkColorMode: 'brand' | 'mono';
  hiddenNetworks: string[];
  noSpoilers: boolean;
}

export default function GameCard({
  game,
  tz,
  hour12,
  compact,
  showLeaguePass,
  showBlackout,
  networkColorMode,
  hiddenNetworks,
  noSpoilers,
}: GameCardProps) {
  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      const options: Intl.DateTimeFormatOptions = {
        timeZone: tz,
        hour: 'numeric',
        minute: '2-digit',
        hour12,
      };
      return date.toLocaleTimeString('en-US', options);
    } catch {
      return timeString;
    }
  };

  const filteredBroadcasts = game.broadcasts
    .filter(broadcast => !hiddenNetworks.includes(broadcast))
    .map(broadcast => broadcast);

  const sortedBroadcasts = sortNetworks(filteredBroadcasts);

  const paddingClass = compact ? 'p-2' : 'p-3';
  const textSizeClass = compact ? 'text-sm' : 'text-base';
  const badgeSizeClass = compact ? 'text-xs px-2 py-1' : 'text-sm px-2 py-1';

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${paddingClass} mb-2`}>
      {/* Game info row */}
      <div className={`flex justify-between items-center mb-2 ${textSizeClass}`}>
        <div className="font-medium">
          {game.awayAbbr} @ {game.homeAbbr}
        </div>
        <div className="text-gray-600 tabular-nums">
          {noSpoilers && game.flags.isFinished ? 'Final' : formatTime(game.time)}
        </div>
      </div>

      {/* Channel badges row */}
      <div className="inline-flex flex-wrap gap-1 min-h-[2rem]">
        {sortedBroadcasts.map((network, index) => (
          <span
            key={index}
            className={`rounded-full ${badgeSizeClass} font-medium break-words`}
            style={getBadgeStyle(network, networkColorMode)}
          >
            {network}
          </span>
        ))}
        
        {showLeaguePass && game.flags.isLeaguePass && (
          <span className={`rounded-full border border-gray-400 text-gray-700 ${badgeSizeClass}`}>
            League Pass
          </span>
        )}
        
        {showBlackout && game.flags.isLeaguePass && sortedBroadcasts.some(network => 
          !['ESPN', 'ABC', 'TNT', 'NBA TV', 'Peacock', 'Prime Video', 'NBC Sports', 'FOX Sports'].includes(network)
        ) && (
          <span className={`rounded-full border border-orange-400 text-orange-700 ${badgeSizeClass}`}>
            Blackout risk
          </span>
        )}
      </div>
    </div>
  );
}
