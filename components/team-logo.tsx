/**
 * TeamLogo - Detail-Preserving Logo Renderer
 *
 * Default mode: CSS filters (grayscale + brightness/contrast)
 * - Preserves internal details (color differences become luminance differences)
 * - Works reliably for all NBA logos on dark backgrounds
 * 
 * Alternative modes:
 * - mask: CSS mask-image tint (fast but loses details for many logos)
 * - legacy-svg: SVG DOM processing (heavy but maximum control)
 * 
 * Fallback chain (auto mode):
 * 1. Filter (preferred) → renders logo with CSS filters
 * 2. Initials (fallback) → if logo fails to load
 * 
 * Note: legacy-svg and mask are opt-in only (not auto fallbacks)
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as NBALogos from 'react-nba-logos';
import { processSvgToMonochrome } from '@/lib/svg-color-processor';
import { getTeamFilterTweak } from '@/lib/team-logo-filter-tweaks';

type Size = 'sm' | 'md' | 'lg' | number;
type Mode = 'auto' | 'filter' | 'mask' | 'legacy-svg';

interface TeamLogoProps {
  /** Team abbreviation (e.g., "LAL", "GSW") */
  abbr: string;
  /** Additional CSS classes */
  className?: string;
  /** Size preset or custom pixel value */
  size?: Size;
  /** Rendering mode */
  mode?: Mode;
  /** Inner logo fill ratio (0.0-1.0, default 0.75 = 75% of container) */
  logoScale?: number;
}

/**
 * Map team abbreviations to react-nba-logos component names
 */
const TEAM_LOGO_COMPONENTS: Record<string, React.ComponentType<{ size?: number | string }>> = {
  // Western Conference
  'LAL': NBALogos.LAL, 'LAC': NBALogos.LAC, 'GSW': NBALogos.GSW, 'GS': NBALogos.GSW,
  'SAC': NBALogos.SAC, 'PHX': NBALogos.PHX, 'DEN': NBALogos.DEN, 'UTA': NBALogos.UTA,
  'UT': NBALogos.UTA, 'POR': NBALogos.POR, 'OKC': NBALogos.OKC, 'MIN': NBALogos.MIN,
  'DAL': NBALogos.DAL, 'HOU': NBALogos.HOU, 'SAS': NBALogos.SAS, 'SA': NBALogos.SAS,
  'MEM': NBALogos.MEM, 'NOP': NBALogos.NOP, 'NO': NBALogos.NOP,
  // Eastern Conference
  'BOS': NBALogos.BOS, 'BKN': NBALogos.BKN, 'NYK': NBALogos.NYK, 'NY': NBALogos.NYK,
  'PHI': NBALogos.PHI, 'TOR': NBALogos.TOR, 'CHI': NBALogos.CHI, 'CLE': NBALogos.CLE,
  'DET': NBALogos.DET, 'IND': NBALogos.IND, 'MIL': NBALogos.MIL, 'ATL': NBALogos.ATL,
  'CHA': NBALogos.CHA, 'MIA': NBALogos.MIA, 'ORL': NBALogos.ORL, 'WAS': NBALogos.WAS,
  'WSH': NBALogos.WAS,
};

/**
 * Convert size preset to pixel value
 */
function getSizeInPixels(size: Size): number {
  if (typeof size === 'number') return size;
  switch (size) {
    case 'sm': return 16;
    case 'md': return 24;
    case 'lg': return 32;
    default: return 24;
  }
}

/**
 * Detect CSS mask-image support
 */
let maskSupportCache: boolean | null = null;

function supportsMask(): boolean {
  if (maskSupportCache !== null) return maskSupportCache;
  
  if (typeof window === 'undefined') {
    return false; // SSR
  }
  
  if (typeof CSS !== 'undefined' && CSS.supports) {
    maskSupportCache = 
      CSS.supports('mask-image', 'url("")') || 
      CSS.supports('-webkit-mask-image', 'url("")');
    return maskSupportCache;
  }
  
  maskSupportCache = true;
  return maskSupportCache;
}

/**
 * Select render mode based on explicit mode and env override
 */
function selectRenderMode(mode: Mode): Mode {
  // Check env override first (for A/B testing)
  const envMode = process.env.NEXT_PUBLIC_TEAM_LOGO_MODE as Mode | undefined;
  const effectiveMode = envMode || mode;
  
  // Auto mode defaults to filter
  if (effectiveMode === 'auto') return 'filter';
  
  return effectiveMode;
}

/**
 * TeamLogo component
 */
export function TeamLogo({
  abbr,
  className = '',
  size = 'md',
  mode = 'auto',
  logoScale = 0.75,
}: TeamLogoProps) {
  const [renderMode, setRenderMode] = useState<Mode>(() => selectRenderMode(mode));
  const [hasError, setHasError] = useState(false);
  const [maskUrl, setMaskUrl] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  const hiddenLogoRef = useRef<HTMLDivElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);

  const sizePixels = getSizeInPixels(size);
  const safeAbbr = typeof abbr === 'string' && abbr ? abbr.toUpperCase() : 'UNK';
  const LogoComponent = TEAM_LOGO_COMPONENTS[safeAbbr];

  // Get per-team filter tweaks
  const filterTweaks = getTeamFilterTweak(safeAbbr);

  // Update render mode when mode prop or env changes
  useEffect(() => {
    setRenderMode(selectRenderMode(mode));
    setIsMounted(true);
  }, [mode]);

  // Warn if max-w/max-h passed via className (prevents double constraints)
  useEffect(() => {
    if (className && (className.includes('max-w') || className.includes('max-h'))) {
      console.warn(
        `[TeamLogo] Avoid max-w/max-h in className. Use logoScale prop instead. (abbr: ${safeAbbr})`
      );
    }
  }, [className, safeAbbr]);

  // Extract SVG for mask mode (if needed)
  useEffect(() => {
    if (renderMode !== 'mask' || !isMounted) return;
    
    if (!supportsMask()) {
      // Mask not supported, fall back to filter
      setRenderMode('filter');
      return;
    }

    const timer = setTimeout(() => {
      const container = hiddenLogoRef.current;
      if (!container) {
        setRenderMode('filter');
        return;
      }

      const svg = container.querySelector('svg');
      if (!svg) {
        setRenderMode('filter');
        return;
      }

      try {
        const clonedSvg = svg.cloneNode(true) as SVGElement;
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(clonedSvg);
        const dataUrl = `data:image/svg+xml,${encodeURIComponent(svgString)}`;
        setMaskUrl(dataUrl);
      } catch (error) {
        console.error('Failed to extract SVG for mask:', error);
        setRenderMode('filter');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [renderMode, isMounted, safeAbbr, sizePixels]);

  // Apply SVG processing for legacy-svg mode
  useEffect(() => {
    if (renderMode !== 'legacy-svg') return;
    
    const container = svgContainerRef.current;
    if (!container) return;

    const processSvg = () => {
      const svg = container.querySelector('svg');
      if (svg && svg.children.length > 0) {
        try {
          processSvgToMonochrome(svg, safeAbbr);
        } catch (error) {
          console.error('SVG processing failed:', error);
          setRenderMode('filter'); // Fall back to filter
        }
      }
    };

    const observer = new MutationObserver(() => {
      processSvg();
    });

    observer.observe(container, { childList: true, subtree: true });
    processSvg();

    return () => observer.disconnect();
  }, [renderMode, safeAbbr]);

  // Handle logo load errors
  const handleError = () => {
    setHasError(true);
  };

  // Fallback: Show initials if no logo component found or error
  if (!LogoComponent || hasError) {
    return (
      <span
        className={`inline-flex items-center justify-center text-[10px] font-bold ${className}`}
        style={{ width: sizePixels, height: sizePixels }}
      >
        {safeAbbr.substring(0, 3)}
      </span>
    );
  }

  // Render filter mode (default/preferred)
  if (renderMode === 'filter') {
    const useCustomFilter = 
      filterTweaks.brightness !== 1.15 ||
      filterTweaks.contrast !== 1.15 ||
      filterTweaks.invert ||
      filterTweaks.opacity !== 1.0;

    const customFilterStyle = useCustomFilter
      ? {
          filter: `grayscale(1) brightness(${filterTweaks.brightness}) contrast(${filterTweaks.contrast})${
            filterTweaks.invert ? ' invert(1)' : ''
          } drop-shadow(0 0 1px rgba(255,255,255,0.35)) drop-shadow(0 0 6px rgba(0,0,0,0.6))`,
          opacity: filterTweaks.opacity,
        }
      : {};

    return (
      <span
        className={`inline-flex items-center justify-center overflow-hidden ${className}`}
        style={{ width: sizePixels, height: sizePixels }}
      >
        <div
          className={`[&>svg]:h-full [&>svg]:w-full [&>svg]:block ${useCustomFilter ? '' : 'team-logo-filter'}`}
          style={
            useCustomFilter
              ? {
                  ...customFilterStyle,
                  width: `${logoScale * 100}%`,
                  height: `${logoScale * 100}%`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }
              : {
                  width: `${logoScale * 100}%`,
                  height: `${logoScale * 100}%`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }
          }
        >
          <LogoComponent />
        </div>
      </span>
    );
  }

  // Render mask mode (opt-in)
  if (renderMode === 'mask' && isMounted && maskUrl) {
    return (
      <div
        className={`relative inline-flex items-center justify-center overflow-hidden ${className}`}
        style={{ width: sizePixels, height: sizePixels }}
      >
        {/* Tinted mask overlay */}
        <div
          className="bg-foreground/80"
          style={{
            width: `${logoScale * 100}%`,
            height: `${logoScale * 100}%`,
            maskImage: `url("${maskUrl}")`,
            WebkitMaskImage: `url("${maskUrl}")`,
            maskSize: 'contain',
            WebkitMaskSize: 'contain',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskPosition: 'center',
          }}
        />
      </div>
    );
  }

  // Render legacy-svg mode (opt-in)
  if (renderMode === 'legacy-svg') {
    return (
      <span
        className={`inline-flex items-center justify-center overflow-hidden ${className}`}
        style={{ width: sizePixels, height: sizePixels }}
      >
        <div
          ref={svgContainerRef}
          className="[&>svg]:h-full [&>svg]:w-full [&>svg]:block"
          style={{
            width: `${logoScale * 100}%`,
            height: `${logoScale * 100}%`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LogoComponent />
        </div>
      </span>
    );
  }

  // SSR fallback or waiting for mask extraction
  return (
    <>
      {/* Hidden logo for SVG extraction (used for mask mode) */}
      {renderMode === 'mask' && (
        <div ref={hiddenLogoRef} className="absolute opacity-0 pointer-events-none -z-50 [&>svg]:h-full [&>svg]:w-full [&>svg]:block">
          <LogoComponent />
        </div>
      )}
      
      {/* Placeholder */}
      <span
        className={`inline-flex items-center justify-center ${className}`}
        style={{ width: sizePixels, height: sizePixels }}
      >
        <div style={{ width: sizePixels, height: sizePixels }} />
      </span>
    </>
  );
}
