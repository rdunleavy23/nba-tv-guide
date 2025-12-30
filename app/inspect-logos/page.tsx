'use client';

import { useEffect, useState } from 'react';
import * as NBALogos from 'react-nba-logos';

const TEAMS = [
  { abbr: 'ATL', name: 'Atlanta Hawks' },
  { abbr: 'BOS', name: 'Boston Celtics' },
  { abbr: 'BKN', name: 'Brooklyn Nets' },
  { abbr: 'CHA', name: 'Charlotte Hornets' },
  { abbr: 'CHI', name: 'Chicago Bulls' },
  { abbr: 'CLE', name: 'Cleveland Cavaliers' },
  { abbr: 'DET', name: 'Detroit Pistons' },
  { abbr: 'IND', name: 'Indiana Pacers' },
  { abbr: 'MIA', name: 'Miami Heat' },
  { abbr: 'MIL', name: 'Milwaukee Bucks' },
  { abbr: 'NYK', name: 'New York Knicks' },
  { abbr: 'ORL', name: 'Orlando Magic' },
  { abbr: 'PHI', name: 'Philadelphia 76ers' },
  { abbr: 'TOR', name: 'Toronto Raptors' },
  { abbr: 'WAS', name: 'Washington Wizards' },
  { abbr: 'DAL', name: 'Dallas Mavericks' },
  { abbr: 'DEN', name: 'Denver Nuggets' },
  { abbr: 'GSW', name: 'Golden State Warriors' },
  { abbr: 'HOU', name: 'Houston Rockets' },
  { abbr: 'LAC', name: 'LA Clippers' },
  { abbr: 'LAL', name: 'LA Lakers' },
  { abbr: 'MEM', name: 'Memphis Grizzlies' },
  { abbr: 'MIN', name: 'Minnesota Timberwolves' },
  { abbr: 'NOP', name: 'New Orleans Pelicans' },
  { abbr: 'OKC', name: 'Oklahoma City Thunder' },
  { abbr: 'PHX', name: 'Phoenix Suns' },
  { abbr: 'POR', name: 'Portland Trail Blazers' },
  { abbr: 'SAC', name: 'Sacramento Kings' },
  { abbr: 'SAS', name: 'San Antonio Spurs' },
  { abbr: 'UTA', name: 'Utah Jazz' },
] as const;

type TeamData = {
  abbr: string;
  name: string;
  colors: string[];
  svgSource: string;
};

function rgbToHex(rgb: string): string {
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (match) {
    const r = parseInt(match[1]).toString(16).padStart(2, '0');
    const g = parseInt(match[2]).toString(16).padStart(2, '0');
    const b = parseInt(match[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`.toUpperCase();
  }
  return rgb.toUpperCase();
}

function extractColors(svgElement: SVGElement): Set<string> {
  const colors = new Set<string>();

  const elements = svgElement.querySelectorAll('path, circle, ellipse, rect, polygon, polyline, g');

  elements.forEach((el) => {
    // Check fill attribute
    const fill = el.getAttribute('fill');
    if (fill && fill !== 'none' && fill !== 'transparent' && fill !== 'inherit') {
      const hex = fill.startsWith('#') ? fill.toUpperCase() : rgbToHex(fill);
      colors.add(hex);
    }

    // Check stroke attribute
    const stroke = el.getAttribute('stroke');
    if (stroke && stroke !== 'none' && stroke !== 'transparent') {
      const hex = stroke.startsWith('#') ? stroke.toUpperCase() : rgbToHex(stroke);
      colors.add(hex);
    }
  });

  return colors;
}

function TeamInspector({ team }: { team: typeof TEAMS[number] }) {
  const [colors, setColors] = useState<string[]>([]);
  const LogoComponent = NBALogos[team.abbr as keyof typeof NBALogos] as React.ComponentType<{ size?: number }>;

  useEffect(() => {
    const timer = setTimeout(() => {
      const container = document.getElementById(`logo-${team.abbr}`);
      if (container) {
        const svg = container.querySelector('svg');
        if (svg) {
          const extractedColors = extractColors(svg);
          setColors(Array.from(extractedColors).sort());
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [team.abbr]);

  const copyOverride = () => {
    let template = `  '${team.abbr}': {\n    colors: [\n`;
    colors.forEach((hex) => {
      template += `      { from: '${hex}', to: 'rgb(XXX, XXX, XXX)' }, // TODO\n`;
    });
    template += `    ],\n    notes: 'TODO: Critical details for ${team.name}',\n  },\n`;

    navigator.clipboard.writeText(template);
    alert(`Copied override template for ${team.name}!`);
  };

  return (
    <div className="border border-gray-700 p-6 rounded-lg bg-gray-900">
      <h2 className="text-xl font-bold mb-4 text-blue-400">
        {team.name} ({team.abbr})
      </h2>

      <div className="flex gap-8">
        {/* Original Logo */}
        <div className="flex flex-col items-center">
          <div
            id={`logo-${team.abbr}`}
            className="w-32 h-32 border border-gray-600 flex items-center justify-center bg-gray-800 mb-2"
          >
            {LogoComponent && <LogoComponent size={100} />}
          </div>
          <span className="text-sm text-gray-400">Original</span>
        </div>

        {/* Colors */}
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">
            Colors Found ({colors.length}):
          </h3>
          <ul className="space-y-1 mb-4">
            {colors.map((color) => (
              <li
                key={color}
                className="flex items-center gap-2 text-xs font-mono p-2 bg-gray-800 rounded"
              >
                <div
                  className="w-8 h-8 border border-gray-600 rounded"
                  style={{ backgroundColor: color }}
                />
                <span className="text-gray-300">{color}</span>
              </li>
            ))}
          </ul>
          {colors.length > 0 && (
            <button
              onClick={copyOverride}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
            >
              Copy Override Template
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function InspectLogosPage() {
  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-white">NBA Logo Color Inspector</h1>
        <p className="text-gray-400 mb-8">
          Inspect each team&apos;s logo to extract exact colors for manual override tuning.
        </p>

        <div className="grid grid-cols-1 gap-6">
          {TEAMS.map((team) => (
            <TeamInspector key={team.abbr} team={team} />
          ))}
        </div>
      </div>
    </div>
  );
}
