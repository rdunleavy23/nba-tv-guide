'use client';

import { getBadgeStyle, filterSmartBadges, getBlackoutStatus, getNetworkSemanticLabel, getLeaguePassBadgeStyle, getLeaguePassBadgeText, BlackoutStatus } from '@/lib/networks';
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

  // Use smart badge filtering with 2-badge max
  const isLeaguePassOnly = game.flags.isLeaguePass && filteredBroadcasts.length === 0;
  const smartBadges = filterSmartBadges(filteredBroadcasts, showLeaguePass, isLeaguePassOnly);
  
  // Get blackout status for warnings
  const blackoutStatus = getBlackoutStatus(filteredBroadcasts, game.flags.isLeaguePass);

  const paddingClass = compact ? 'p-3' : 'p-4';
  const textSizeClass = compact ? 'text-sm' : 'text-base';

  return (
    <div 
      className={`bg-white rounded-lg border border-gray-200 ${paddingClass} mb-2 hover:shadow-md hover:scale-[1.01] transition-all duration-200 cursor-pointer`}
      data-game-id={game.id}
      data-lp-available={blackoutStatus === 'available'}
      // TODO: Add tap-to-expand for streaming links
      // TODO: Add network badge click → filter by network
    >
      {/* Inline layout: Matchup — Time | Badges */}
      <div className={`flex items-center justify-between gap-3 ${textSizeClass}`}>
        {/* Matchup with inline time - Left side (prominent) */}
        <div className="flex-1 min-w-0">
          <div className={`font-bold ${compact ? 'text-base' : 'text-lg'} text-gray-900 leading-tight`}>
            {game.awayAbbr} @ {game.homeAbbr} — {noSpoilers && game.flags.isFinished ? '—' : formatGameTime(game.time, tz, hour12, true)}
          </div>
        </div>
        
        {/* Smart Badges - Right side */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {smartBadges.map((network, index) => {
            const isNational = ['ESPN', 'ABC', 'TNT', 'NBA TV', 'TruTV'].includes(network);
            const isRSN = ['FanDuel', 'MSG', 'Bally', 'YES', 'NBC Sports', 'FOX Sports'].some(keyword => network.includes(keyword));
            const isLP = network === 'League Pass';
            
            // Apply visual hierarchy
            let badgeClass = '';
            if (isNational) {
              badgeClass = compact ? 'text-sm px-2 py-1 font-bold' : 'text-base px-3 py-1.5 font-bold';
            } else if (isRSN) {
              badgeClass = compact ? 'text-xs px-2 py-1 font-normal border' : 'text-sm px-2 py-1 font-normal border';
            } else if (isLP) {
              badgeClass = compact ? 'text-xs px-2 py-1 font-medium' : 'text-sm px-2 py-1 font-medium';
            }
            
            return (
              <span
                key={index}
                className={`rounded-full ${badgeClass} break-words`}
                style={isLP ? getLeaguePassBadgeStyle(blackoutStatus) : getBadgeStyle(network, networkColorMode)}
                role="img"
                aria-label={isLP ? `League Pass: ${getLeaguePassBadgeText(blackoutStatus)}` : getNetworkSemanticLabel(network)}
                title={isLP ? `League Pass: ${getLeaguePassBadgeText(blackoutStatus)}` : undefined}
              >
                {isLP ? getLeaguePassBadgeText(blackoutStatus) : network}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
