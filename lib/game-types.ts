/**
 * Game data types for NBA schedule
 */

import type { StreamingOption } from './streaming-types';

export interface TeamSide {
  abbr: string; // Team abbreviation: "LAL", "BOS", etc.
}

export interface GameTeams {
  away: TeamSide;
  home: TeamSide;
}

export interface Game {
  id: string; // ESPN game ID
  startTimeUtc: string; // ISO 8601 string in UTC
  teams: GameTeams;
  networks: string[]; // National networks only (normalized)
  leaguePass: boolean; // League Pass availability flag
  streamingOptions: StreamingOption[]; // All ways to watch this game
  primaryOption: StreamingOption; // Selected "best" option for tap-to-stream
}
