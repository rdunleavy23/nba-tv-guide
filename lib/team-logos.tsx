/**
 * NBA Team Logos - using react-nba-logos package
 * All logos are displayed in a consistent, minimalist white/gray style
 * Colors are processed client-side based on luminance to preserve details
 */

'use client';

import React, { useEffect, useRef } from 'react';
import * as NBALogos from 'react-nba-logos';
import { processSvgToMonochrome } from './svg-color-processor';

/**
 * Map team abbreviations to react-nba-logos component names
 * The package uses uppercase abbreviations like LAL, BOS, etc.
 */
const TEAM_LOGO_COMPONENTS: Record<string, React.ComponentType<{ size?: number | string }>> = {
  // Western Conference
  'LAL': NBALogos.LAL, // Los Angeles Lakers
  'LAC': NBALogos.LAC, // Los Angeles Clippers
  'GSW': NBALogos.GSW, // Golden State Warriors
  'GS': NBALogos.GSW,
  'SAC': NBALogos.SAC, // Sacramento Kings
  'PHX': NBALogos.PHX, // Phoenix Suns
  'DEN': NBALogos.DEN, // Denver Nuggets
  'UTA': NBALogos.UTA, // Utah Jazz
  'UT': NBALogos.UTA,
  'POR': NBALogos.POR, // Portland Trail Blazers
  'OKC': NBALogos.OKC, // Oklahoma City Thunder
  'MIN': NBALogos.MIN, // Minnesota Timberwolves
  'DAL': NBALogos.DAL, // Dallas Mavericks
  'HOU': NBALogos.HOU, // Houston Rockets
  'SAS': NBALogos.SAS, // San Antonio Spurs
  'SA': NBALogos.SAS,
  'MEM': NBALogos.MEM, // Memphis Grizzlies
  'NOP': NBALogos.NOP, // New Orleans Pelicans
  'NO': NBALogos.NOP,
  
  // Eastern Conference
  'BOS': NBALogos.BOS, // Boston Celtics
  'BKN': NBALogos.BKN, // Brooklyn Nets
  'NYK': NBALogos.NYK, // New York Knicks
  'NY': NBALogos.NYK,
  'PHI': NBALogos.PHI, // Philadelphia 76ers
  'TOR': NBALogos.TOR, // Toronto Raptors
  'CHI': NBALogos.CHI, // Chicago Bulls
  'CLE': NBALogos.CLE, // Cleveland Cavaliers
  'DET': NBALogos.DET, // Detroit Pistons
  'IND': NBALogos.IND, // Indiana Pacers
  'MIL': NBALogos.MIL, // Milwaukee Bucks
  'ATL': NBALogos.ATL, // Atlanta Hawks
  'CHA': NBALogos.CHA, // Charlotte Hornets
  'MIA': NBALogos.MIA, // Miami Heat
  'ORL': NBALogos.ORL, // Orlando Magic
  'WAS': NBALogos.WAS, // Washington Wizards
  'WSH': NBALogos.WAS,
};

export function TeamLogo({ abbr, className = '', size = 24 }: { abbr: string; className?: string; size?: number }) {
  const LogoComponent = TEAM_LOGO_COMPONENTS[abbr.toUpperCase()];
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;

    // Use requestAnimationFrame to ensure SVG is fully rendered
    const processSvg = () => {
      const svgElement = containerRef.current?.querySelector('svg');
      if (svgElement) {
        // Process the SVG to convert colors to white/gray based on luminance
        processSvgToMonochrome(svgElement);
      }
    };

    // Try immediately first
    processSvg();

    // Also try after a frame in case the SVG renders asynchronously
    requestAnimationFrame(() => {
      processSvg();
    });
  }, [abbr, size]); // Re-process if team or size changes
  
  if (!LogoComponent) {
    // Fallback to abbreviation if logo component not found
    return (
      <span className={`inline-flex items-center justify-center text-[10px] font-bold ${className}`} style={{ width: size, height: size }}>
        {abbr}
      </span>
    );
  }

  return (
    <span 
      className={`inline-flex items-center justify-center overflow-hidden ${className}`} 
      style={{ 
        width: size, 
        height: size,
      }}
    >
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LogoComponent size={size} />
      </div>
    </span>
  );
}
