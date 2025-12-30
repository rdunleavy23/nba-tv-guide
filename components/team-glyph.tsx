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
  // Ensure abbr is a valid string
  const safeAbbr = typeof abbr === 'string' && abbr ? abbr : 'UNK';
  
  return (
    <span
      className={`
        inline-flex h-7 w-7 items-center justify-center
        rounded-full border border-muted-foreground/20
        text-muted-foreground
        ${className}
      `}
      aria-label={safeAbbr}
      title={safeAbbr}
    >
      <TeamLogo abbr={safeAbbr} size={18} className="text-muted-foreground" />
    </span>
  );
}
