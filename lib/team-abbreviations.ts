/**
 * Team abbreviation normalization
 * Converts 2-letter abbreviations to standard 3-letter format
 */

/**
 * Map of 2-letter and variant abbreviations to standard 3-letter abbreviations
 */
const ABBREVIATION_MAP: Record<string, string> = {
  // Western Conference
  'GS': 'GSW',  // Golden State Warriors
  'SA': 'SAS',  // San Antonio Spurs
  'NO': 'NOP',  // New Orleans Pelicans
  
  // Eastern Conference
  'NY': 'NYK',  // New York Knicks
  'WSH': 'WAS', // Washington Wizards
  
  // All standard 3-letter abbreviations (identity mapping)
  'LAL': 'LAL', // Los Angeles Lakers
  'LAC': 'LAC', // Los Angeles Clippers
  'GSW': 'GSW', // Golden State Warriors
  'SAC': 'SAC', // Sacramento Kings
  'PHX': 'PHX', // Phoenix Suns
  'DEN': 'DEN', // Denver Nuggets
  'UTA': 'UTA', // Utah Jazz
  'POR': 'POR', // Portland Trail Blazers
  'OKC': 'OKC', // Oklahoma City Thunder
  'MIN': 'MIN', // Minnesota Timberwolves
  'DAL': 'DAL', // Dallas Mavericks
  'HOU': 'HOU', // Houston Rockets
  'SAS': 'SAS', // San Antonio Spurs
  'MEM': 'MEM', // Memphis Grizzlies
  'NOP': 'NOP', // New Orleans Pelicans
  
  // Eastern Conference
  'BOS': 'BOS', // Boston Celtics
  'BKN': 'BKN', // Brooklyn Nets
  'NYK': 'NYK', // New York Knicks
  'PHI': 'PHI', // Philadelphia 76ers
  'TOR': 'TOR', // Toronto Raptors
  'CHI': 'CHI', // Chicago Bulls
  'CLE': 'CLE', // Cleveland Cavaliers
  'DET': 'DET', // Detroit Pistons
  'IND': 'IND', // Indiana Pacers
  'MIL': 'MIL', // Milwaukee Bucks
  'ATL': 'ATL', // Atlanta Hawks
  'CHA': 'CHA', // Charlotte Hornets
  'MIA': 'MIA', // Miami Heat
  'ORL': 'ORL', // Orlando Magic
  'WAS': 'WAS', // Washington Wizards
};

/**
 * Normalizes a team abbreviation to a standard 3-letter format
 * @param abbr - The abbreviation from the API (may be 2 or 3 letters)
 * @returns A 3-letter abbreviation, or the original if no mapping exists
 */
export function normalizeTeamAbbreviation(abbr: string | null | undefined): string {
  // Ensure we have a valid string
  if (!abbr || typeof abbr !== 'string') return 'UNK';
  
  const upperAbbr = abbr.toUpperCase().trim();
  
  // Handle empty string after trimming
  if (!upperAbbr) return 'UNK';
  
  // Check if we have a direct mapping
  if (ABBREVIATION_MAP[upperAbbr]) {
    return ABBREVIATION_MAP[upperAbbr];
  }
  
  // If it's already 3 letters, return as-is
  if (upperAbbr.length === 3) {
    return upperAbbr;
  }
  
  // If it's 2 letters, try to infer or pad
  // This handles edge cases where ESPN might use non-standard abbreviations
  if (upperAbbr.length === 2) {
    // Try common patterns
    if (upperAbbr === 'PH') {
      // Could be PHI or PHX - we'll need context, but default to PHI (more common)
      return 'PHI';
    }
    // For other 2-letter abbreviations, pad with first letter
    // This is a fallback - ideally ESPN should provide 3-letter abbreviations
    return upperAbbr + upperAbbr[0];
  }
  
  // If it's longer than 3, take first 3 letters
  if (upperAbbr.length > 3) {
    return upperAbbr.substring(0, 3);
  }
  
  // Fallback
  return upperAbbr;
}

