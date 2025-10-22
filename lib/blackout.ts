/**
 * League Pass blackout logic
 * Determines LP availability based on region and team markets
 * Uses RSN data internally but never exposes RSN strings
 */

import { Region, isRegionKnown } from './region';
import { getTeamMarkets } from './team-markets';

export type LPStatus = 'available' | 'blackout' | 'unknown';

export interface Game {
  id: string;
  teams: { away: { abbr: string }, home: { abbr: string } };
  allBroadcasts: string[]; // includes RSNs for internal blackout calc
  leaguePass: boolean;
}

/**
 * Check if user is in-market for a team based on region
 */
export function isInMarket(region: Region | null, teamAbbr: string): boolean {
  if (!region || !isRegionKnown(region)) return false;
  
  const teamMarkets = getTeamMarkets(teamAbbr);
  
  // If user has ZIP override, check state derived from ZIP
  if (region.zip) {
    // TODO: Implement ZIP to state mapping
    // For now, return false (not in market) to be conservative
    return false;
  }
  
  // If user has state from server headers, check against team markets
  if (region.state) {
    return teamMarkets.includes(region.state);
  }
  
  return false;
}

/**
 * Determine League Pass availability for a user and game
 * Returns 'unknown' if region is not determined (never optimistic)
 */
export function lpAvailableForUser(region: Region | null, game: Game): LPStatus {
  // If region is unknown, return 'unknown' (never optimistic)
  if (!region || !isRegionKnown(region)) {
    return 'unknown';
  }
  
  // If game doesn't have League Pass, return 'unknown'
  if (!game.leaguePass) {
    return 'unknown';
  }
  
  // Check if user is in-market for either team
  const inMarketAway = isInMarket(region, game.teams.away.abbr);
  const inMarketHome = isInMarket(region, game.teams.home.abbr);
  
  if (inMarketAway || inMarketHome) {
    return 'blackout';
  }
  
  // Check for RSN broadcasts that would cause blackout
  // This uses RSN data internally but never exposes RSN strings
  const hasRSNBroadcast = game.allBroadcasts.some(broadcast => {
    const normalized = broadcast.toLowerCase();
    return normalized.includes('msg') || 
           normalized.includes('bally') || 
           normalized.includes('yes') || 
           normalized.includes('nbc sports') ||
           normalized.includes('fox sports') ||
           normalized.includes('at&t sportsnet') ||
           normalized.includes('spectrum') ||
           normalized.includes('root sports') ||
           normalized.includes('tsn') ||
           normalized.includes('sn');
  });
  
  // If there's an RSN broadcast and user is in the team's market, it's blacked out
  if (hasRSNBroadcast && (inMarketAway || inMarketHome)) {
    return 'blackout';
  }
  
  // International users (non-US/CA) are generally out-of-market
  if (region.country !== 'US' && region.country !== 'CA') {
    return 'available';
  }
  
  // Default to available if not in-market
  return 'available';
}

/**
 * Get display text for LP status
 */
export function getLPStatusText(status: LPStatus): string {
  switch (status) {
    case 'available':
      return 'League Pass — Available';
    case 'blackout':
      return 'League Pass — Blackout';
    case 'unknown':
      return 'League Pass — Check Region';
    default:
      return 'League Pass — Unknown';
  }
}

/**
 * Check if a game has any RSN broadcasts (internal use only)
 * This is used for blackout calculation but RSN strings are never shown to user
 */
export function hasRSNBroadcast(game: Game): boolean {
  return game.allBroadcasts.some(broadcast => {
    const normalized = broadcast.toLowerCase();
    return normalized.includes('msg') || 
           normalized.includes('bally') || 
           normalized.includes('yes') || 
           normalized.includes('nbc sports') ||
           normalized.includes('fox sports') ||
           normalized.includes('at&t sportsnet') ||
           normalized.includes('spectrum') ||
           normalized.includes('root sports') ||
           normalized.includes('tsn') ||
           normalized.includes('sn') ||
           normalized.includes('fanduel');
  });
}
