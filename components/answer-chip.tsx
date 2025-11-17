import { Badge } from '@/components/ui/badge';
import { Play, Info, Tv2, MonitorPlay, Radio, Globe } from 'lucide-react';
import type { Game } from '@/lib/game-types';
import type { StreamingOption } from '@/lib/streaming-types';

interface AnswerChipProps {
  game: Game;
}

/**
 * Get platform-specific icon based on streaming option label
 */
function getPlatformIcon(label: string, kind: StreamingOption['kind']) {
  const lowercaseLabel = label.toLowerCase();

  // League Pass - TV streaming icon
  if (lowercaseLabel.includes('lp') || lowercaseLabel.includes('league pass')) {
    return <Tv2 className="h-4 w-4" aria-hidden="true" />;
  }

  // Prime Video - Monitor with play button
  if (lowercaseLabel.includes('prime')) {
    return <MonitorPlay className="h-4 w-4" aria-hidden="true" />;
  }

  // Radio broadcasts
  if (lowercaseLabel.includes('radio')) {
    return <Radio className="h-4 w-4" aria-hidden="true" />;
  }

  // International/Regional streams
  if (lowercaseLabel.includes('international') || lowercaseLabel.includes('regional')) {
    return <Globe className="h-4 w-4" aria-hidden="true" />;
  }

  // Info icon for unknown/generic
  if (kind === 'info') {
    return <Info className="h-4 w-4" aria-hidden="true" />;
  }

  // Default to Play icon for national networks (ESPN, TNT, ABC, etc.)
  return <Play className="h-4 w-4" aria-hidden="true" />;
}

/**
 * Platform icon component - neutral, monochrome glyphs
 */
function PlatformIcon({ label, kind }: { label: string; kind: StreamingOption['kind'] }) {
  return getPlatformIcon(label, kind);
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
      className="inline-flex h-8 items-center gap-1.5 px-3 rounded-md border border-muted-foreground/20 text-xs font-medium text-foreground bg-transparent max-w-full"
      aria-label={ariaLabel}
    >
      <PlatformIcon label={label} kind={primaryOption.kind} />
      <span className="truncate">{label}</span>
    </Badge>
  );
}
