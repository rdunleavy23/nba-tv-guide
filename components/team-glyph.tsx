/**
 * TeamGlyph - Minimalist team logo indicator
 *
 * Clean, neutral circular glyph with minimalist team logo.
 * All logos use the same color for consistency.
 */

import { TeamLogo } from '@/lib/team-logos';

interface TeamGlyphProps {
  abbr: string; // "LAL", "DEN", etc.
  className?: string;
}

export function TeamGlyph({ abbr, className = '' }: TeamGlyphProps) {
  return (
    <span
      className={`
        inline-flex h-7 w-7 items-center justify-center
        rounded-full border border-muted-foreground/30
        bg-muted/30
        ${className}
      `}
      aria-label={abbr}
      title={abbr}
    >
      <TeamLogo abbr={abbr} size={20} className="text-foreground" />
    </span>
  );
}
