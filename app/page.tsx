import { headers } from 'next/headers';
import { Suspense } from 'react';
import { AnswerChip, type Game, type GameLink } from '@/components/answer-chip';
import { SkeletonList } from '@/components/game-skeleton';
import { ClientWrapper } from '@/components/client-wrapper';
import { Logo } from '@/components/logo';
import { DayNavigatorWrapper } from '@/components/day-navigator-wrapper';
import { SettingsTrigger } from '@/components/settings-trigger';
import { ErrorFallback } from '@/components/error-fallback';
import { getServerRegion } from '@/lib/region';
import { formatGameTime, isGameTonight } from '@/lib/timezone';
import { Region } from '@/lib/region';
import { filterToNationalOnly } from '@/lib/national';

export const runtime = 'edge';

// Game row component - clickable to streaming destination
function GameRow({ game, region }: { game: Game; region: Region | null }) {
  const timeString = formatGameTime(game.startTimeUtc, 'America/New_York', true);

  return (
    <a
      href={game.primaryLink.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 px-4 py-3.5 border-b hover:bg-accent/10 transition-colors cursor-pointer"
    >
      <div className="min-w-[90px] flex-shrink-0">
        <AnswerChip game={game} region={region} />
      </div>

      <div className="flex-1 min-w-0">
        <span className="text-base md:text-sm font-medium tabular-nums">
          {game.teams.away.abbr} @ {game.teams.home.abbr}
        </span>
      </div>

      <time className="w-20 text-right text-sm tabular-nums text-muted-foreground">
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
    <ul>
      {games.map((game) => (
        <GameRow key={game.id} game={game} region={region} />
      ))}
    </ul>
  );
}

// Helper function to determine the primary streaming link for a game
function getPrimaryLink(gameId: string, networks: string[], hasLeaguePass: boolean): GameLink {
  // Priority 1: National network streaming apps
  if (networks.length > 0) {
    const network = networks[0].toUpperCase();

    if (network.includes('ESPN')) {
      return {
        url: `https://www.espn.com/watch/player/_/id/${gameId}`,
        target: 'app',
        source: 'espn',
      };
    }

    if (network.includes('TNT')) {
      return {
        url: `https://www.tntdrama.com/watchtnt/east`,
        target: 'app',
        source: 'tnt',
      };
    }

    if (network.includes('ABC')) {
      return {
        url: `https://abc.com/watch-live`,
        target: 'app',
        source: 'abc',
      };
    }

    if (network.includes('NBA TV')) {
      return {
        url: `https://www.nba.com/watch/league-pass-stream`,
        target: 'app',
        source: 'nba_tv',
      };
    }
  }

  // Priority 2: League Pass
  if (hasLeaguePass) {
    return {
      url: `https://www.nba.com/game/${gameId}`,
      target: 'app',
      source: 'league_pass',
    };
  }

  // Fallback: ESPN game page (for stats/info)
  return {
    url: `https://www.espn.com/nba/game/_/gameId/${gameId}`,
    target: 'web',
    source: 'unknown',
  };
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
      
      const gameId = event.id as string;
      const primaryLink = getPrimaryLink(gameId, nationalNetworks, isLeaguePass);

      return {
        id: gameId,
        startTimeUtc: processedTime,
        teams: {
          away: { abbr: awayAbbr },
          home: { abbr: homeAbbr }
        },
        networks: nationalNetworks,
        allBroadcasts: [...new Set(allBroadcasts)],
        leaguePass: isLeaguePass,
        primaryLink,
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
            <DayNavigatorWrapper />
          </div>
        </header>

        {/* Content */}
        <main className="py-4">
          {error ? (
            <ErrorFallback />
          ) : (
            <Suspense fallback={<SkeletonList count={6} />}>
              <GameList games={games} region={region} />
            </Suspense>
          )}
        </main>

        {/* Footer */}
        <footer className="py-8 text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            Refreshes every 30 seconds • Data from ESPN
          </p>
          <SettingsTrigger />
        </footer>
      </div>
    </ClientWrapper>
  );
}