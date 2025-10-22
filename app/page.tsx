import { headers } from 'next/headers';
import { Suspense } from 'react';
import { AnswerChip, type Game } from '@/components/answer-chip';
import { GameSkeleton, SkeletonList } from '@/components/game-skeleton';
import { ClientWrapper } from '@/components/client-wrapper';
import { Logo } from '@/components/logo';
import { DayNavigator } from '@/components/day-navigator';
import { getServerRegion } from '@/lib/region';
import { formatGameTime, getLocalDateString, isGameTonight } from '@/lib/timezone';
import { Region } from '@/lib/region';

export const runtime = 'edge';

// Client component for settings sheet trigger
function SettingsSheetTrigger() {
  return (
    <button
      className="fixed bottom-4 right-4 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors"
      aria-label="Open settings"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
      </svg>
    </button>
  );
}

// Game row component with dense layout
function GameRow({ game, region }: { game: Game; region: Region | null }) {
  const timeString = formatGameTime(game.startTimeUtc, 'America/New_York', true);
  
  return (
    <li 
      className="flex items-center gap-3 px-4 py-2 border-b border-gray-200 dark:border-gray-700 hover:bg-accent/5 focus:bg-accent/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
      tabIndex={0}
      aria-label={`${game.teams.away.abbr} at ${game.teams.home.abbr}. ${timeString}.`}
    >
      {/* BADGE: Left, 80px fixed width */}
      <div className="w-20 flex-shrink-0">
        <AnswerChip game={game} region={region} />
      </div>
      
      {/* MATCHUP: Center, flex-grow */}
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium tabular-nums">
          {game.teams.away.abbr} @ {game.teams.home.abbr}
        </span>
      </div>
      
      {/* TIME: Right, 60px fixed width */}
      <time className="text-sm text-muted-foreground tabular-nums w-15 text-right">
        {timeString}
      </time>
    </li>
  );
}

// Game list component
function GameList({ games, region }: { games: Game[]; region: Region | null }) {
  if (games.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground text-sm">
        No games tonight. Check back tomorrow.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-200 dark:divide-gray-700" role="list" aria-label="Game schedule">
      {games.map((game) => (
        <GameRow key={game.id} game={game} region={region} />
      ))}
    </ul>
  );
}

async function fetchTonightGames(): Promise<{ games: Game[]; error?: string }> {
  try {
    const url = new URL('/api/scoreboard', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
    const response = await fetch(url.toString(), { 
      next: { revalidate: 30 } 
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch games: ${response.status}`);
    }
    
    const data = await response.json();
    const games = data.games || [];
    
    // Filter to tonight only
    const tonightGames = games.filter((game: Game) => 
      isGameTonight(game.startTimeUtc, 'America/New_York')
    );
    
    return { games: tonightGames };
  } catch (error) {
    console.error('Error fetching games:', error);
    return { 
      games: [], 
      error: error instanceof Error ? error.message : 'Failed to load games' 
    };
  }
}

export default async function HomePage() {
  // Get server region from Edge headers
  const headersList = await headers();
  const region = getServerRegion(headersList);
  
  // Fetch tonight's games
  const { games, error } = await fetchTonightGames();
  
  const localDateString = getLocalDateString('America/New_York');

  return (
    <ClientWrapper>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="px-4 py-3 border-b border-gray-200 dark:border-gray-700" aria-label="Page header">
          <div className="flex items-center justify-between">
            <Logo />
            <DayNavigator 
              currentDate={new Date()} 
              onDateChange={(date) => {
                // TODO: Implement date change logic
                console.log('Date changed to:', date);
              }} 
            />
          </div>
        </header>

        {/* Content */}
        <main aria-label="Tonight's NBA games" className="px-0">
          {error ? (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Couldn't load games.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="text-sm text-primary underline-offset-4 hover:underline"
              >
                Retry
              </button>
            </div>
          ) : (
            <Suspense fallback={<SkeletonList count={6} />}>
              <GameList games={games} region={region} />
            </Suspense>
          )}
        </main>

        {/* Client components */}
        <SettingsSheetTrigger />
      </div>
    </ClientWrapper>
  );
}