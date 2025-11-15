import { Badge } from '@/components/ui/badge';
import { Play, Info } from 'lucide-react';
import { lpAvailableForUser } from '@/lib/blackout';
import { Region } from '@/lib/region';
import { StreamingOption } from '@/lib/streaming';

export interface Game {
  id: string;
  startTimeUtc: string;
  teams: { away: { abbr: string }, home: { abbr: string } };
  networks: string[]; // national only for UI
  allBroadcasts: string[]; // includes RSNs for internal blackout calc
  leaguePass: boolean;
  streamingOptions: StreamingOption[];
  primaryLink: StreamingOption;
}

interface AnswerChipProps {
  game: Game;
  region: Region | null;
}

/**
 * Platform icon component - neutral, monochrome glyphs
 */
function PlatformIcon({ kind }: { kind: StreamingOption['kind'] }) {
  if (kind === 'info') {
    return <Info className="h-3 w-3" aria-hidden="true" />;
  }
  return <Play className="h-3 w-3" aria-hidden="true" />;
}

/**
 * AnswerChip component - renders exactly ONE chip per game
 * Server component (no client JS)
 *
 * Logic:
 * - Uses the primaryLink selected by the streaming system
 * - For League Pass games, checks blackout status and adjusts label
 * - All badges use neutral colors - no green/red to avoid implying preference
 */
export function AnswerChip({ game, region }: AnswerChipProps) {
  const primaryLink = game.primaryLink;
  let label = primaryLink.label;
  let ariaLabel = `Watch on ${label}`;

  // If this is League Pass, check blackout status and adjust label
  if (primaryLink.id === 'league_pass' && game.leaguePass) {
    const lpStatus = lpAvailableForUser(region, game);

    switch (lpStatus) {
      case 'available':
        label = 'LP';
        ariaLabel = 'Available on League Pass';
        break;
      case 'blackout':
        label = 'LP blackout';
        ariaLabel = 'League Pass blacked out in your area';
        break;
      case 'unknown':
      default:
        label = 'LP';
        ariaLabel = 'League Pass availability unknown';
        break;
    }
  }

  return (
    <Badge
      className="inline-flex h-7 items-center gap-1 px-3 rounded-md border border-muted-foreground/20 text-xs font-medium text-foreground bg-transparent"
      aria-label={ariaLabel}
    >
      <PlatformIcon kind={primaryLink.kind} />
      {label}
    </Badge>
  );
}
