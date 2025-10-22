/**
 * Team market definitions for blackout logic
 * Maps team abbreviations to their primary market states
 */

export const TEAM_MARKETS: Record<string, string[]> = {
  // Western Conference
  'LAL': ['CA'], // Los Angeles Lakers
  'LAC': ['CA'], // Los Angeles Clippers  
  'GSW': ['CA'], // Golden State Warriors
  'SAC': ['CA'], // Sacramento Kings
  'PHX': ['AZ'], // Phoenix Suns
  'DEN': ['CO'], // Denver Nuggets
  'UTA': ['UT'], // Utah Jazz
  'POR': ['OR'], // Portland Trail Blazers
  'OKC': ['OK'], // Oklahoma City Thunder
  'MIN': ['MN'], // Minnesota Timberwolves
  'DAL': ['TX'], // Dallas Mavericks
  'HOU': ['TX'], // Houston Rockets
  'SAS': ['TX'], // San Antonio Spurs
  'MEM': ['TN'], // Memphis Grizzlies
  'NOP': ['LA'], // New Orleans Pelicans
  
  // Eastern Conference
  'BOS': ['MA'], // Boston Celtics
  'BKN': ['NY', 'NJ', 'CT'], // Brooklyn Nets (NY/NJ/CT market)
  'NYK': ['NY', 'NJ', 'CT'], // New York Knicks (NY/NJ/CT market)
  'PHI': ['PA'], // Philadelphia 76ers
  'TOR': ['ON'], // Toronto Raptors (Ontario, Canada)
  'CHI': ['IL'], // Chicago Bulls
  'CLE': ['OH'], // Cleveland Cavaliers
  'DET': ['MI'], // Detroit Pistons
  'IND': ['IN'], // Indiana Pacers
  'MIL': ['WI'], // Milwaukee Bucks
  'ATL': ['GA'], // Atlanta Hawks
  'CHA': ['NC'], // Charlotte Hornets
  'MIA': ['FL'], // Miami Heat
  'ORL': ['FL'], // Orlando Magic
  'WAS': ['DC', 'MD', 'VA'], // Washington Wizards (DC/MD/VA market)
};

/**
 * Get market states for a team
 */
export function getTeamMarkets(teamAbbr: string): string[] {
  return TEAM_MARKETS[teamAbbr] || [];
}

/**
 * Check if a team has overlapping markets with another team
 * Used for documenting market conflicts
 */
export function getMarketOverlaps(team1: string, team2: string): string[] {
  const markets1 = getTeamMarkets(team1);
  const markets2 = getTeamMarkets(team2);
  
  return markets1.filter(market => markets2.includes(market));
}

/**
 * Get all teams in a given state
 */
export function getTeamsInState(state: string): string[] {
  return Object.entries(TEAM_MARKETS)
    .filter(([, markets]) => markets.includes(state))
    .map(([team]) => team);
}

/**
 * Documented market overlaps for reference
 */
export const MARKET_OVERLAPS = {
  'Nets/Knicks': ['NY', 'NJ', 'CT'], // Both teams claim NY/NJ/CT
  'Clippers/Lakers': ['CA'], // Both teams in Los Angeles
  'Warriors/Kings': ['CA'], // Both teams in California (different regions)
  'Wizards': ['DC', 'MD', 'VA'], // Washington DC metro area spans multiple states
} as const;
