'use client';

import { getBadgeStyle, sortNetworks, getNetworkSemanticLabel } from '@/lib/networks';
import { formatGameTime } from '@/lib/timezone';
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
  const filteredBroadcasts = game.broadcasts
    .filter(broadcast => !hiddenNetworks.includes(broadcast))
    .map(broadcast => broadcast);

  const sortedBroadcasts = sortNetworks(filteredBroadcasts);

  const paddingClass = compact ? 'p-3' : 'p-4';
  const textSizeClass = compact ? 'text-sm' : 'text-base';
  const badgeSizeClass = compact ? 'text-sm px-2 py-1' : 'text-lg px-3 py-1.5';

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${paddingClass} mb-2`}>
      {/* Channel badges row - positioned first for Principle 1 */}
      <div className="inline-flex flex-wrap gap-1 min-h-[2rem] mb-2">
        {sortedBroadcasts.map((network, index) => (
          <span
            key={index}
            className={`rounded-full ${badgeSizeClass} font-medium break-words`}
            style={getBadgeStyle(network, networkColorMode)}
            role="img"
            aria-label={getNetworkSemanticLabel(network)}
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

      {/* Game info row */}
      <div className={`flex justify-between items-center ${textSizeClass}`}>
        <div className="font-medium">
          {game.awayAbbr} @ {game.homeAbbr}
        </div>
        <div className="text-gray-600 tabular-nums">
          {noSpoilers && game.flags.isFinished ? '—' : formatGameTime(game.time, tz, hour12)}
        </div>
      </div>
    </div>
  );
}
