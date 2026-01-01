/**
 * TeamGlyph - Minimalist team logo indicator
 *
 * Clean, neutral circular glyph with minimalist team logo.
 * Uses detail-preserving CSS filter mode by default (via mode="auto").
 * 
 * The TeamLogo component (components/team-logo.tsx) renders logos with:
 * - Filter mode (default): CSS grayscale + brightness/contrast
 * - Preserves internal details (GSW bridge, CHA hornet, PHI "76", etc.)
 * - No SVG DOM manipulation for better performance
 */

import { TeamLogo } from '@/components/team-logo';

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
        bg-muted/20 ring-1 ring-border/60
        text-muted-foreground
        p-0.5
        ${className}
      `}
      aria-label={safeAbbr}
      title={safeAbbr}
    >
      <TeamLogo 
        abbr={safeAbbr} 
        mode="auto"
        logoScale={0.75}
      />
    </span>
  );
}
