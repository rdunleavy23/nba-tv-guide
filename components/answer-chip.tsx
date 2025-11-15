import { Badge } from '@/components/ui/badge';
import { getNationalNetwork } from '@/lib/national';
import { lpAvailableForUser } from '@/lib/blackout';
import { Region } from '@/lib/region';

export interface GameLink {
  url: string;           // final href you put on the row
  target: 'web' | 'app';
  source: 'league_pass' | 'espn' | 'tnt' | 'abc' | 'nba_tv' | 'nba' | 'unknown';
}

export interface Game {
  id: string;
  startTimeUtc: string;
  teams: { away: { abbr: string }, home: { abbr: string } };
  networks: string[]; // national only for UI
  allBroadcasts: string[]; // includes RSNs for internal blackout calc
  leaguePass: boolean;
  primaryLink: GameLink;
}

interface AnswerChipProps {
  game: Game;
  region: Region | null;
}

/**
 * AnswerChip component - renders exactly ONE chip per game
 * Server component (no client JS)
 *
 * Logic:
 * 1. Check for national network → show network name
 * 2. Else check LP availability → show LP status
 * 3. Fallback: "TV info TBD"
 *
 * All badges use neutral colors - no green/red to avoid implying preference.
 */
export function AnswerChip({ game, region }: AnswerChipProps) {
  let label: string;
  let ariaLabel: string;

  // First priority: Check for national network
  const nationalNetwork = getNationalNetwork(game.networks);

  if (nationalNetwork) {
    label = nationalNetwork;
    ariaLabel = `Watch on ${nationalNetwork}`;
  } else if (game.leaguePass) {
    // Second priority: Check LP availability
    const lpStatus = lpAvailableForUser(region, game);

    switch (lpStatus) {
      case 'available':
        label = 'League Pass';
        ariaLabel = 'Available on League Pass';
        break;
      case 'blackout':
        label = 'LP blackout';
        ariaLabel = 'League Pass blacked out in your area';
        break;
      case 'unknown':
      default:
        label = 'League Pass';
        ariaLabel = 'League Pass availability unknown';
        break;
    }
  } else {
    // Fallback: No broadcast data available
    label = 'TV info TBD';
    ariaLabel = 'Broadcast information to be determined';
  }

  return (
    <Badge
      className="h-7 px-3 text-xs font-medium border border-muted-foreground/20 text-foreground bg-transparent"
      aria-label={ariaLabel}
    >
      {label}
    </Badge>
  );
}
