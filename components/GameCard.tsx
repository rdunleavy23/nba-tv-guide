'use client';

import { getBadgeStyle, filterSmartBadges, getBlackoutStatus, getNetworkSemanticLabel } from '@/lib/networks';
import { formatGameTime } from '@/lib/timezone';
import { NormalizedGame } from '@/app/api/scoreboard/route';

interface GameCardProps {
  game: NormalizedGame;
  tz: string;
  hour12: boolean;
  compact: boolean;
  showLeaguePass: boolean;
  showBlackout: boolean; // eslint-disable-line @typescript-eslint/no-unused-vars
  networkColorMode: 'brand' | 'mono';
  hiddenNetworks: string[];
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
  const timeSizeClass = compact ? 'text-sm' : 'text-base';
  const matchupSizeClass = compact ? 'text-sm' : 'text-sm';

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${paddingClass} mb-2`}>
      {/* Horizontal layout: Time | Matchup | Smart Badges */}
      <div className={`flex items-center justify-between gap-3 ${textSizeClass}`}>
        {/* Time - Left side */}
        <div className={`font-bold ${timeSizeClass} text-gray-900 tabular-nums flex-shrink-0`}>
          {formatGameTime(game.time, tz, hour12)}
        </div>
        
        {/* Matchup - Center */}
        <div className={`font-medium ${matchupSizeClass} text-gray-800 flex-shrink-0`}>
          {game.awayAbbr} @ {game.homeAbbr}
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
              badgeClass = compact ? 'text-sm px-2 py-1 font-bold' : 'text-lg px-3 py-1.5 font-bold';
            } else if (isRSN) {
              badgeClass = compact ? 'text-sm px-2 py-1 font-normal border' : 'text-sm px-2 py-1 font-normal border';
            } else if (isLP) {
              badgeClass = compact ? 'text-xs px-2 py-1 font-normal border text-gray-600' : 'text-xs px-2 py-1 font-normal border text-gray-600';
            }
            
            return (
              <span
                key={index}
                className={`rounded-full ${badgeClass} break-words`}
                style={getBadgeStyle(network, networkColorMode)}
                role="img"
                aria-label={getNetworkSemanticLabel(network)}
              >
                {network}
              </span>
            );
          })}
          
          {/* Blackout warnings */}
          {showBlackout && blackoutStatus !== 'no-lp' && (
            <span className="text-xs text-orange-600 font-medium">
              {blackoutStatus === 'national-blackout' && 'Blacked out on LP'}
              {blackoutStatus === 'regional-blackout' && 'Regional only'}
              {blackoutStatus === 'available' && 'LP available'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
