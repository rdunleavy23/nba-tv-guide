/**
 * NBA Team Logos - using actual team logos from ESPN CDN
 * All logos are displayed in a consistent, minimalist white style
 */

import React from 'react';
import Image from 'next/image';

/**
 * Map team abbreviations to ESPN team IDs for logo URLs
 * ESPN uses numeric team IDs in their logo URLs
 */
const TEAM_ESPN_IDS: Record<string, string> = {
  // Western Conference
  'LAL': '13', // Los Angeles Lakers
  'LAC': '12', // Los Angeles Clippers
  'GSW': '9',  // Golden State Warriors
  'GS': '9',
  'SAC': '26', // Sacramento Kings
  'PHX': '21', // Phoenix Suns
  'DEN': '7',  // Denver Nuggets
  'UTA': '29', // Utah Jazz
  'POR': '22', // Portland Trail Blazers
  'OKC': '25', // Oklahoma City Thunder
  'MIN': '16', // Minnesota Timberwolves
  'DAL': '6',  // Dallas Mavericks
  'HOU': '10', // Houston Rockets
  'SAS': '27', // San Antonio Spurs
  'SA': '27',
  'MEM': '15', // Memphis Grizzlies
  'NOP': '3',  // New Orleans Pelicans
  'NO': '3',
  
  // Eastern Conference
  'BOS': '2',  // Boston Celtics
  'BKN': '17', // Brooklyn Nets
  'NYK': '18', // New York Knicks
  'NY': '18',
  'PHI': '20', // Philadelphia 76ers
  'TOR': '28', // Toronto Raptors
  'CHI': '4',  // Chicago Bulls
  'CLE': '5',  // Cleveland Cavaliers
  'DET': '8',  // Detroit Pistons
  'IND': '11', // Indiana Pacers
  'MIL': '15', // Milwaukee Bucks
  'ATL': '1',  // Atlanta Hawks
  'CHA': '30', // Charlotte Hornets
  'MIA': '14', // Miami Heat
  'ORL': '19', // Orlando Magic
  'WAS': '27', // Washington Wizards
  'WSH': '27',
};

export function TeamLogo({ abbr, className = '', size = 24 }: { abbr: string; className?: string; size?: number }) {
  const teamId = TEAM_ESPN_IDS[abbr.toUpperCase()];
  
  if (!teamId) {
    // Fallback to abbreviation if team ID not found
    return (
      <span className={`inline-flex items-center justify-center text-[10px] font-bold ${className}`} style={{ width: size, height: size }}>
        {abbr}
      </span>
    );
  }

  // ESPN logo URL format: https://a.espncdn.com/i/teamlogos/nba/500/{teamId}.png
  const logoUrl = `https://a.espncdn.com/i/teamlogos/nba/500/${teamId}.png`;

  return (
    <span className={`inline-flex items-center justify-center overflow-hidden rounded-full ${className}`} style={{ width: size, height: size }}>
      <Image
        src={logoUrl}
        alt={abbr}
        width={size}
        height={size}
        className="object-contain"
        style={{ 
          filter: 'brightness(0) invert(1)', // Make logos white/monochrome
          opacity: 0.9
        }}
        unoptimized // ESPN CDN handles optimization
      />
    </span>
  );
}
