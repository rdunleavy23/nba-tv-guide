import { Badge } from '@/components/ui/badge';
import { Play, Info } from 'lucide-react';
import { StreamingOption } from '@/lib/streaming';

export interface Game {
  id: string;
  startTimeUtc: string;
  teams: { away: { abbr: string }, home: { abbr: string } };
  networks: string[]; // national only for UI
  leaguePass: boolean;
  streamingOptions: StreamingOption[];
  primaryLink: StreamingOption;
}

interface AnswerChipProps {
  game: Game;
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
 * - Shows platform name without blackout detection
 * - All badges use neutral colors
 */
export function AnswerChip({ game }: AnswerChipProps) {
  const primaryLink = game.primaryLink;
  const label = primaryLink.label;
  const ariaLabel = `Watch on ${label}`;

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
