import Link from 'next/link';
import { absoluteUrl } from '@/lib/absolute-url';
import { defaultSettings } from '@/lib/settings';
import GameCard from '@/components/GameCard';
import { NormalizedGame } from '@/app/api/scoreboard/route';

async function getTodaysGames(): Promise<{ games: NormalizedGame[]; error?: string }> {
  try {
    const url = absoluteUrl('/api/scoreboard');
    const response = await fetch(url, { 
      next: { revalidate: 60 } 
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch games: ${response.status}`);
    }
    
    const data = await response.json();
    return { games: data.games || [] };
  } catch (error) {
    console.error('Error fetching games:', error);
    return { 
      games: [], 
      error: error instanceof Error ? error.message : 'Failed to load games' 
    };
  }
}

export default async function Home() {
  const result = await getTodaysGames();
  
  // Handle error state
  if (result.error) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">
          NBA Games Today
        </h1>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-800 mb-3">
            Unable to load games: {result.error}
          </p>
          <div className="space-x-3">
            <Link 
              href="/"
              className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 inline-block"
            >
              Retry
            </Link>
            <a 
              href="https://www.espn.com/nba/scoreboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-600 hover:text-yellow-800 underline"
            >
              View on ESPN.com
            </a>
          </div>
        </div>
      </div>
    );
  }
  
  // Filter games based on default settings
  const filteredGames = result.games.filter(game => {
    if (defaultSettings.hideFinished && game.flags.isFinished) {
      return false;
    }
    return true;
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">
        NBA Games Today
      </h1>
      
      {filteredGames.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg">No games today</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              tz={defaultSettings.tz}
              hour12={defaultSettings.hourFormat === '12'}
              compact={defaultSettings.compact}
              showLeaguePass={defaultSettings.showLeaguePass}
              showBlackout={defaultSettings.showBlackout}
              networkColorMode={defaultSettings.networkColorMode}
              hiddenNetworks={defaultSettings.hiddenNetworks}
              noSpoilers={defaultSettings.noSpoilers}
            />
          ))}
        </div>
      )}
    </div>
  );
}
