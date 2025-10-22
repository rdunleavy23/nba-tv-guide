import { headers } from 'next/headers';
import { Suspense } from 'react';
import { AnswerChip, type Game } from '@/components/answer-chip';
import { SkeletonList } from '@/components/game-skeleton';
import { ClientWrapper } from '@/components/client-wrapper';
import { Logo } from '@/components/logo';
import { DayNavigator } from '@/components/day-navigator';
import { getServerRegion } from '@/lib/region';
import { formatGameTime, isGameTonight } from '@/lib/timezone';
import { Region } from '@/lib/region';
import { filterToNationalOnly } from '@/lib/national';

export const runtime = 'edge';

// Client component for settings trigger
function SettingsTrigger() {
  return (
    <button
      onClick={() => {
        // This will be handled by ClientWrapper's keyboard listener
        const event = new KeyboardEvent('keydown', {
          key: ',',
          metaKey: true,
        });
        window.dispatchEvent(event);
      }}
      className="text-xs text-muted-foreground hover:text-foreground"
    >
      Settings
    </button>
  );
}

// Game row component - clickable to ESPN
function GameRow({ game, region }: { game: Game; region: Region | null }) {
  const timeString = formatGameTime(game.startTimeUtc, 'America/New_York', true);
  
  return (
    <a
      href={`https://www.espn.com/nba/game/_/gameId/${game.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-4 py-3 border-b hover:bg-accent/5 transition-colors"
    >
      <div className="w-20 flex-shrink-0">
        <AnswerChip game={game} region={region} />
      </div>
      
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium tabular-nums">
          {game.teams.away.abbr} @ {game.teams.home.abbr}
        </span>
      </div>
      
      <time className="text-sm text-muted-foreground tabular-nums w-15 text-right">
        {timeString}
      </time>
    </a>
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
    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
      {games.map((game) => (
        <GameRow key={game.id} game={game} region={region} />
      ))}
    </ul>
  );
}

async function fetchTonightGames(): Promise<{ games: Game[]; error?: string }> {
  try {
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const espnUrl = `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${date}`;
    
    const response = await fetch(espnUrl, {
      next: { revalidate: 30 },
      headers: {
        'User-Agent': 'NBA Tonight/1.0',
      },
    });
    
    if (!response.ok) {
      throw new Error(`ESPN API error: ${response.status}`);
    }
    
    const data = await response.json();
    const events = data.events || [];
    
    const games: Game[] = events.map((event: Record<string, unknown>) => {
      const competition = (event.competitions as Record<string, unknown>[])?.[0];
      const competitors = (competition?.competitors as Record<string, unknown>[]) || [];
      
      const homeTeam = competitors.find((c: Record<string, unknown>) => c.homeAway === 'home');
      const awayTeam = competitors.find((c: Record<string, unknown>) => c.homeAway === 'away');
      
      // Collect ALL broadcasts (including RSNs for internal blackout calc)
      const allBroadcasts: string[] = [];
      if (competition?.broadcasts) {
        (competition.broadcasts as Record<string, unknown>[]).forEach((broadcast: Record<string, unknown>) => {
          if (broadcast.names && Array.isArray(broadcast.names)) {
            allBroadcasts.push(...(broadcast.names as string[]));
          } else if (broadcast.name && typeof broadcast.name === 'string') {
            allBroadcasts.push(broadcast.name);
          } else if (broadcast.shortName && typeof broadcast.shortName === 'string') {
            allBroadcasts.push(broadcast.shortName);
          } else if (broadcast.callSign && typeof broadcast.callSign === 'string') {
            allBroadcasts.push(broadcast.callSign);
          }
        });
      }
      
      // Filter to national networks only for UI (strip RSNs)
      const nationalNetworks = filterToNationalOnly(allBroadcasts);
      
      const isLeaguePass = (competition?.flags as string[])?.includes('league-pass') || false;
      
      // Defensive team data extraction
      const homeTeamName = homeTeam?.team ? 
        ((homeTeam.team as Record<string, unknown>)?.displayName as string) || 
        ((homeTeam.team as Record<string, unknown>)?.name as string) || 
        ((homeTeam.team as Record<string, unknown>)?.shortDisplayName as string) || 
        'Unknown' : 'Unknown';
        
      const awayTeamName = awayTeam?.team ? 
        ((awayTeam.team as Record<string, unknown>)?.displayName as string) || 
        ((awayTeam.team as Record<string, unknown>)?.name as string) || 
        ((awayTeam.team as Record<string, unknown>)?.shortDisplayName as string) || 
        'Unknown' : 'Unknown';
        
      const homeAbbr = homeTeam?.team ? 
        ((homeTeam.team as Record<string, unknown>)?.abbreviation as string) || 
        ((homeTeam.team as Record<string, unknown>)?.shortName as string) || 
        homeTeamName.substring(0, 3).toUpperCase() : 'UNK';
        
      const awayAbbr = awayTeam?.team ? 
        ((awayTeam.team as Record<string, unknown>)?.abbreviation as string) || 
        ((awayTeam.team as Record<string, unknown>)?.shortName as string) || 
        awayTeamName.substring(0, 3).toUpperCase() : 'UNK';
      
      // Validate and process game time
      const rawTime = event.date as string;
      let processedTime = rawTime;
      
      if (!rawTime || typeof rawTime !== 'string') {
        console.warn('Missing or invalid game time for game:', event.id);
        processedTime = new Date().toISOString();
      } else {
        const testDate = new Date(rawTime);
        if (isNaN(testDate.getTime())) {
          console.warn('Invalid ISO timestamp for game:', event.id, 'Raw time:', rawTime);
          processedTime = new Date().toISOString();
        }
      }
      
      return {
        id: event.id as string,
        startTimeUtc: processedTime,
        teams: { 
          away: { abbr: awayAbbr }, 
          home: { abbr: homeAbbr } 
        },
        networks: nationalNetworks,
        allBroadcasts: [...new Set(allBroadcasts)],
        leaguePass: isLeaguePass,
      };
    });
    
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
  const headersList = await headers();
  const region = getServerRegion(headersList);
  const { games, error } = await fetchTonightGames();

  return (
    <ClientWrapper>
      <div className="min-h-screen max-w-[640px] md:max-w-[800px] mx-auto px-4">
        {/* Header */}
        <header className="py-4 border-b">
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
        <main className="py-4">
          {error ? (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Can&apos;t reach ESPN right now.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="text-sm text-primary underline-offset-4 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : (
            <Suspense fallback={<SkeletonList count={6} />}>
              <GameList games={games} region={region} />
            </Suspense>
          )}
        </main>
        
        {/* Footer */}
        <footer className="py-8 text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            Updated just now • Data from ESPN
          </p>
          <div className="hidden md:block text-xs text-muted-foreground space-x-2">
            <kbd className="px-1.5 py-0.5 bg-muted rounded">j/k</kbd>
            <span>navigate</span>
            <kbd className="px-1.5 py-0.5 bg-muted rounded">,</kbd>
            <span>settings</span>
          </div>
          <SettingsTrigger />
        </footer>
      </div>
    </ClientWrapper>
  );
}