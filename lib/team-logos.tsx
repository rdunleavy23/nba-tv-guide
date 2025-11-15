/**
 * Minimalist team logos - all in the same color for consistency
 * Simple geometric SVG representations of each team's identity
 */

import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

const LOGO_COLOR = 'currentColor'; // Uses text color for consistency

export function TeamLogo({ abbr, className = '', size = 24 }: { abbr: string; className?: string; size?: number }) {
  const LogoComponent = TEAM_LOGOS[abbr.toUpperCase()] || DefaultLogo;
  return (
    <span className={`inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <LogoComponent size={size} />
    </span>
  );
}

function DefaultLogo({ size = 24 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke={LOGO_COLOR} strokeWidth="1.5" fill="none" />
    </svg>
  );
}

// Western Conference
function LakersLogo({ size = 24 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L4 8L12 14L20 8L12 2Z" fill={LOGO_COLOR} />
      <path d="M12 10L4 16L12 22L20 16L12 10Z" fill={LOGO_COLOR} />
    </svg>
  );
}

function ClippersLogo({ size = 24 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="12" r="5" stroke={LOGO_COLOR} strokeWidth="1.5" fill="none" />
      <circle cx="16" cy="12" r="5" stroke={LOGO_COLOR} strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function WarriorsLogo({ size = 24 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L6 8L12 14L18 8L12 2Z" fill={LOGO_COLOR} />
      <path d="M12 14L6 20L12 22L18 20L12 14Z" fill={LOGO_COLOR} />
    </svg>
  );
}

function KingsLogo({ size = 24 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8 2 4 6 4 10C4 14 8 18 12 18C16 18 20 14 20 10C20 6 16 2 12 2Z" fill={LOGO_COLOR} />
      <circle cx="12" cy="10" r="3" fill="white" />
    </svg>
  );
}

function SunsLogo({ size = 24 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="6" fill={LOGO_COLOR} />
      <path d="M12 2L12 6M12 18L12 22M2 12L6 12M18 12L22 12M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke={LOGO_COLOR} strokeWidth="1.5" />
    </svg>
  );
}

function NuggetsLogo({ size = 24 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L4 8L12 14L20 8L12 2Z" fill={LOGO_COLOR} />
      <path d="M4 8L12 14L20 8" stroke={LOGO_COLOR} strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function JazzLogo({ size = 24 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 4L16 4L20 8L20 16L16 20L8 20L4 16L4 8L8 4Z" fill={LOGO_COLOR} />
    </svg>
  );
}

function TrailBlazersLogo({ size = 24 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L6 8L12 14L18 8L12 2Z" fill={LOGO_COLOR} />
      <path d="M12 14L6 20L12 22L18 20L12 14Z" fill={LOGO_COLOR} />
    </svg>
  );
}

function ThunderLogo({ size = 24 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 4L16 12L8 20" stroke={LOGO_COLOR} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M12 4L20 12L12 20" stroke={LOGO_COLOR} strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function TimberwolvesLogo({ size = 24 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 8L12 2L20 8L12 14L4 8Z" fill={LOGO_COLOR} />
      <path d="M12 14L20 20L12 22L4 20L12 14Z" fill={LOGO_COLOR} />
    </svg>
  );
}

function MavericksLogo({ size = 24 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L4 6L12 10L20 6L12 2Z" fill={LOGO_COLOR} />
      <path d="M4 6L12 10L20 6" stroke={LOGO_COLOR} strokeWidth="1.5" fill="none" />
      <path d="M12 10L4 18L12 22L20 18L12 10Z" fill={LOGO_COLOR} />
    </svg>
  );
}

function RocketsLogo({ size = 24 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L6 8L12 14L18 8L12 2Z" fill={LOGO_COLOR} />
      <path d="M12 14L6 20L12 22L18 20L12 14Z" fill={LOGO_COLOR} />
    </svg>
  );
}

function SpursLogo({ size = 24 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L4 8L12 14L20 8L12 2Z" fill={LOGO_COLOR} />
      <circle cx="12" cy="12" r="4" fill={LOGO_COLOR} />
    </svg>
  );
}

function GrizzliesLogo({ size = 24 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 4L16 4L20 8L20 16L16 20L8 20L4 16L4 8L8 4Z" fill={LOGO_COLOR} />
      <path d="M8 8L16 8L16 16L8 16L8 8Z" fill="white" />
    </svg>
  );
}

function PelicansLogo({ size = 24 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8 2 4 6 4 10C4 14 8 18 12 18C16 18 20 14 20 10C20 6 16 2 12 2Z" fill={LOGO_COLOR} />
      <path d="M12 6L8 12L12 18L16 12L12 6Z" fill="white" />
    </svg>
  );
}

// Eastern Conference
function CelticsLogo({ size = 24 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill={LOGO_COLOR} />
      <path d="M12 2L12 22M2 12L22 12" stroke="white" strokeWidth="2" />
    </svg>
  );
}

function NetsLogo({ size = 24 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 4L20 4L20 20L4 20L4 4Z" fill={LOGO_COLOR} />
      <path d="M4 12L20 12" stroke="white" strokeWidth="2" />
    </svg>
  );
}

function KnicksLogo({ size = 24 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 4L20 4L20 20L4 20L4 4Z" fill={LOGO_COLOR} />
      <path d="M4 8L20 8M4 12L20 12M4 16L20 16" stroke="white" strokeWidth="1.5" />
    </svg>
  );
}

function SixersLogo({ size = 24 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L4 8L12 14L20 8L12 2Z" fill={LOGO_COLOR} />
      <path d="M12 14L4 20L12 22L20 20L12 14Z" fill={LOGO_COLOR} />
      <circle cx="12" cy="12" r="2" fill="white" />
    </svg>
  );
}

function RaptorsLogo({ size = 24 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L4 8L12 14L20 8L12 2Z" fill={LOGO_COLOR} />
      <path d="M4 8L12 14L20 8" stroke={LOGO_COLOR} strokeWidth="1.5" fill="none" />
      <path d="M12 14L4 20L12 22L20 20L12 14Z" fill={LOGO_COLOR} />
    </svg>
  );
}

function BullsLogo({ size = 24 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8" r="4" fill={LOGO_COLOR} />
      <path d="M8 12L16 12L16 20L8 20L8 12Z" fill={LOGO_COLOR} />
    </svg>
  );
}

function CavaliersLogo({ size = 24 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L4 8L12 14L20 8L12 2Z" fill={LOGO_COLOR} />
      <path d="M12 14L4 20L12 22L20 20L12 14Z" fill={LOGO_COLOR} />
    </svg>
  );
}

function PistonsLogo({ size = 24 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 4L20 4L20 20L4 20L4 4Z" fill={LOGO_COLOR} />
      <circle cx="12" cy="12" r="6" fill="white" />
    </svg>
  );
}

function PacersLogo({ size = 24 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L4 8L12 14L20 8L12 2Z" fill={LOGO_COLOR} />
      <path d="M12 14L4 20L12 22L20 20L12 14Z" fill={LOGO_COLOR} />
    </svg>
  );
}

function BucksLogo({ size = 24 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L4 8L12 14L20 8L12 2Z" fill={LOGO_COLOR} />
      <path d="M12 14L4 20L12 22L20 20L12 14Z" fill={LOGO_COLOR} />
      <circle cx="12" cy="12" r="3" fill="white" />
    </svg>
  );
}

function HawksLogo({ size = 24 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L4 8L12 14L20 8L12 2Z" fill={LOGO_COLOR} />
      <path d="M12 14L4 20L12 22L20 20L12 14Z" fill={LOGO_COLOR} />
    </svg>
  );
}

function HornetsLogo({ size = 24 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L4 8L12 14L20 8L12 2Z" fill={LOGO_COLOR} />
      <path d="M12 14L4 20L12 22L20 20L12 14Z" fill={LOGO_COLOR} />
    </svg>
  );
}

function HeatLogo({ size = 24 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill={LOGO_COLOR} />
      <path d="M12 4L12 20M4 12L20 12" stroke="white" strokeWidth="2" />
    </svg>
  );
}

function MagicLogo({ size = 24 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill={LOGO_COLOR} />
      <circle cx="12" cy="12" r="6" fill="white" />
    </svg>
  );
}

function WizardsLogo({ size = 24 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 4L20 4L20 20L4 20L4 4Z" fill={LOGO_COLOR} />
      <path d="M4 8L20 8M4 12L20 12M4 16L20 16" stroke="white" strokeWidth="1.5" />
    </svg>
  );
}

// Map team abbreviations to logo components
const TEAM_LOGOS: Record<string, ({ size }: LogoProps) => React.ReactElement> = {
  // Western Conference
  'LAL': LakersLogo,
  'LAC': ClippersLogo,
  'GSW': WarriorsLogo,
  'GS': WarriorsLogo,
  'SAC': KingsLogo,
  'PHX': SunsLogo,
  'DEN': NuggetsLogo,
  'UTA': JazzLogo,
  'POR': TrailBlazersLogo,
  'OKC': ThunderLogo,
  'MIN': TimberwolvesLogo,
  'DAL': MavericksLogo,
  'HOU': RocketsLogo,
  'SAS': SpursLogo,
  'SA': SpursLogo,
  'MEM': GrizzliesLogo,
  'NOP': PelicansLogo,
  'NO': PelicansLogo,
  
  // Eastern Conference
  'BOS': CelticsLogo,
  'BKN': NetsLogo,
  'NYK': KnicksLogo,
  'NY': KnicksLogo,
  'PHI': SixersLogo,
  'TOR': RaptorsLogo,
  'CHI': BullsLogo,
  'CLE': CavaliersLogo,
  'DET': PistonsLogo,
  'IND': PacersLogo,
  'MIL': BucksLogo,
  'ATL': HawksLogo,
  'CHA': HornetsLogo,
  'MIA': HeatLogo,
  'ORL': MagicLogo,
  'WAS': WizardsLogo,
  'WSH': WizardsLogo,
};

