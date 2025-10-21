'use client';

import { useSettingsStore } from '@/lib/settings';
import Link from 'next/link';

export default function TeamsPage() {
  const settings = useSettingsStore();

  const teams = [
    { id: 'ATL', name: 'Atlanta Hawks', colors: { primary: '#E03A3E', secondary: '#C1D32F' } },
    { id: 'BOS', name: 'Boston Celtics', colors: { primary: '#007A33', secondary: '#BA9653' } },
    { id: 'BKN', name: 'Brooklyn Nets', colors: { primary: '#000000', secondary: '#FFFFFF' } },
    { id: 'CHA', name: 'Charlotte Hornets', colors: { primary: '#1D1160', secondary: '#00788C' } },
    { id: 'CHI', name: 'Chicago Bulls', colors: { primary: '#CE1141', secondary: '#000000' } },
    { id: 'CLE', name: 'Cleveland Cavaliers', colors: { primary: '#860038', secondary: '#FDBB30' } },
    { id: 'DAL', name: 'Dallas Mavericks', colors: { primary: '#00538C', secondary: '#002B5E' } },
    { id: 'DEN', name: 'Denver Nuggets', colors: { primary: '#0E2240', secondary: '#FEC524' } },
    { id: 'DET', name: 'Detroit Pistons', colors: { primary: '#C8102E', secondary: '#1D42BA' } },
    { id: 'GSW', name: 'Golden State Warriors', colors: { primary: '#1D428A', secondary: '#FFC72C' } },
    { id: 'HOU', name: 'Houston Rockets', colors: { primary: '#CE1141', secondary: '#000000' } },
    { id: 'IND', name: 'Indiana Pacers', colors: { primary: '#002D62', secondary: '#FDBB30' } },
    { id: 'LAC', name: 'LA Clippers', colors: { primary: '#C8102E', secondary: '#1D428A' } },
    { id: 'LAL', name: 'Los Angeles Lakers', colors: { primary: '#552583', secondary: '#FDB927' } },
    { id: 'MEM', name: 'Memphis Grizzlies', colors: { primary: '#5D76A9', secondary: '#12173F' } },
    { id: 'MIA', name: 'Miami Heat', colors: { primary: '#98002E', secondary: '#F9A01B' } },
    { id: 'MIL', name: 'Milwaukee Bucks', colors: { primary: '#00471B', secondary: '#EEE1C6' } },
    { id: 'MIN', name: 'Minnesota Timberwolves', colors: { primary: '#0C2340', secondary: '#236192' } },
    { id: 'NOP', name: 'New Orleans Pelicans', colors: { primary: '#0C2340', secondary: '#C8102E' } },
    { id: 'NYK', name: 'New York Knicks', colors: { primary: '#006BB6', secondary: '#F58426' } },
    { id: 'OKC', name: 'Oklahoma City Thunder', colors: { primary: '#007AC1', secondary: '#EF3B24' } },
    { id: 'ORL', name: 'Orlando Magic', colors: { primary: '#0077C0', secondary: '#C4CED4' } },
    { id: 'PHI', name: 'Philadelphia 76ers', colors: { primary: '#006BB6', secondary: '#ED174C' } },
    { id: 'PHX', name: 'Phoenix Suns', colors: { primary: '#1D1160', secondary: '#E56020' } },
    { id: 'POR', name: 'Portland Trail Blazers', colors: { primary: '#E03A3E', secondary: '#000000' } },
    { id: 'SAC', name: 'Sacramento Kings', colors: { primary: '#5A2D81', secondary: '#63727A' } },
    { id: 'SAS', name: 'San Antonio Spurs', colors: { primary: '#C4CED4', secondary: '#000000' } },
    { id: 'TOR', name: 'Toronto Raptors', colors: { primary: '#CE1141', secondary: '#000000' } },
    { id: 'UTA', name: 'Utah Jazz', colors: { primary: '#002B5C', secondary: '#F9A01B' } },
    { id: 'WAS', name: 'Washington Wizards', colors: { primary: '#002B5C', secondary: '#E31837' } },
  ];

  const handleTeamSelect = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (team) {
      settings.setFavoriteTeam(teamId);
      // Update CSS variables
      document.documentElement.style.setProperty('--accent', team.colors.primary);
      document.documentElement.style.setProperty('--secondary', team.colors.secondary);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">
        NBA Teams
      </h1>
      
      <p className="text-gray-600 mb-6">
        Select your favorite team to customize the app colors and prioritize their games.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {teams.map(team => (
          <button
            key={team.id}
            onClick={() => handleTeamSelect(team.id)}
            className={`p-4 rounded-lg border text-sm font-medium transition-colors ${
              settings.favoriteTeam === team.id
                ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="text-center">
              <div className="font-semibold">{team.name}</div>
              <div className="text-xs opacity-75 mt-1">{team.id}</div>
            </div>
          </button>
        ))}
      </div>

      {settings.favoriteTeam && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Selected:</strong> {teams.find(t => t.id === settings.favoriteTeam)?.name}
          </p>
          <Link 
            href="/" 
            className="inline-block mt-2 text-sm text-[var(--accent)] hover:underline"
          >
            ← Back to Today&apos;s Games
          </Link>
        </div>
      )}
    </div>
  );
}
