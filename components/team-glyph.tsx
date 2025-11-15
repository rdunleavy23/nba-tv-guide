/**
 * TeamGlyph - Minimalist team indicator
 *
 * Clean, neutral circular glyph with team abbreviation.
 * No logos, no team colors - keeps UI consistent and brand-safe.
 */

interface TeamGlyphProps {
  abbr: string; // "LAL", "DEN", etc.
  className?: string;
}

export function TeamGlyph({ abbr, className = '' }: TeamGlyphProps) {
  return (
    <span
      className={`
        inline-flex h-6 w-6 items-center justify-center
        rounded-full border border-muted-foreground/20
        text-[10px] font-bold tabular-nums
        text-muted-foreground
        ${className}
      `}
      aria-label={abbr}
      title={abbr}
    >
      {abbr}
    </span>
  );
}
