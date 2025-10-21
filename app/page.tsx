import { absoluteUrl } from '@/lib/absolute-url';
import { defaultSettings } from '@/lib/settings';
import GameCard from '@/components/GameCard';
import { NormalizedGame } from '@/app/api/scoreboard/route';

async function getTodaysGames(): Promise<NormalizedGame[]> {
  try {
    const url = absoluteUrl('/api/scoreboard');
    const response = await fetch(url, { 
      next: { revalidate: 60 } 
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch games');
    }
    
    const data = await response.json();
    return data.games || [];
  } catch (error) {
    console.error('Error fetching games:', error);
    return [];
  }
}

export default async function Home() {
  const games = await getTodaysGames();
  
  // Filter games based on default settings
  const filteredGames = games.filter(game => {
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
            />
          ))}
        </div>
      )}
    </div>
  );
}
