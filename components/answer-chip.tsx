import { Badge } from '@/components/ui/badge';
import type { Game } from '@/lib/game-types';

interface AnswerChipProps {
  game: Game;
}

/**
 * AnswerChip component - renders exactly ONE chip per game
 * Server component (no client JS)
 *
 * Logic:
 * - Uses the primaryOption selected by the streaming system
 * - Shows platform name without blackout detection
 * - All badges use neutral colors
 */
export function AnswerChip({ game }: AnswerChipProps) {
  const primaryOption = game.primaryOption;
  const label = primaryOption.label;
  const ariaLabel = `Watch on ${label}`;

  return (
    <Badge
      className="inline-flex h-8 min-w-[60px] items-center justify-center px-3 rounded-md border border-muted-foreground/20 text-xs font-medium text-foreground bg-transparent"
      aria-label={ariaLabel}
    >
      {label}
    </Badge>
  );
}
