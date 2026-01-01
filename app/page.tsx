import { Suspense } from 'react';
import { ChannelLinkButton } from '@/components/channel-link-button';
import type { Game } from '@/lib/game-types';
import { SkeletonList } from '@/components/game-skeleton';
import { ClientWrapper } from '@/components/client-wrapper';
import { Logo } from '@/components/logo';
import { DayNavigatorWrapper } from '@/components/day-navigator-wrapper';
import { SettingsTrigger } from '@/components/settings-trigger';
import { ErrorFallback } from '@/components/error-fallback';
import { TeamGlyph } from '@/components/team-glyph';
import { GameTime } from '@/components/game-time';
import { SwipeableGameList } from '@/components/swipeable-game-list';
import { AnimatedGameList } from '@/components/animated-game-list';
import { getTodayForEspnApi, getDateForEspnApi, isGameOnDate } from '@/lib/timezone';
import { filterToNationalOnly } from '@/lib/national';
import { buildStreamingOptions, selectPrimaryOption } from '@/lib/streaming';
import { normalizeTeamAbbreviation } from '@/lib/team-abbreviations';

export const runtime = 'edge';

// Game row component - channel button handles navigation
function GameRow({ game }: { game: Game }) {
  const matchupLabel = `${game.teams.away.abbr} at ${game.teams.home.abbr}`;
  
  return (
    <article
      aria-label={matchupLabel}
      className="grid grid-cols-[28px_1fr_28px_auto] gap-2 items-center px-4 py-3 border-b border-border/30"
    >
      {/* Column 1: Away team glyph - fixed 28px */}
      <div className="flex justify-center">
        <TeamGlyph abbr={game.teams.away.abbr} />
      </div>

      {/* Column 2: Matchup text - flexible (1fr) */}
      <span className="text-base tabular-nums text-center">
        <span className="font-semibold tracking-wide">{String(game.teams.away.abbr || 'UNK')}</span>
        <span className="text-sm text-muted-foreground/70 font-medium px-1">@</span>
        <span className="font-semibold tracking-wide">{String(game.teams.home.abbr || 'UNK')}</span>
      </span>

      {/* Column 3: Home team glyph - fixed 28px */}
      <div className="flex justify-center">
        <TeamGlyph abbr={game.teams.home.abbr} />
      </div>

      {/* Column 4: Time + Channel chip - flexible (auto) */}
      <div className="flex items-center justify-end gap-3">
        <GameTime
          utcTime={game.startTimeUtc}
          className="text-right text-xs tabular-nums text-muted-foreground/80 font-medium"
        />
        <ChannelLinkButton option={game.primaryOption} />
      </div>
    </article>
  );
}

// Game list component
function GameList({ games }: { games: Game[] }) {
  if (games.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground text-sm">
        No games scheduled. Check another day.
      </div>
    );
  }

  return (
    <ul>
      {games.map((game) => (
        <GameRow key={game.id} game={game} />
      ))}
    </ul>
  );
}

async function fetchGamesForDate(targetDate?: Date): Promise<{ games: Game[]; error?: string }> {
  try {
    // Use provided date or default to today in Eastern Time
    const date = targetDate 
      ? getDateForEspnApi(targetDate, 'America/New_York')
      : getTodayForEspnApi('America/New_York');
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

      // Collect broadcasts for national networks
      const broadcasts: string[] = [];
      if (competition?.broadcasts) {
        (competition.broadcasts as Record<string, unknown>[]).forEach((broadcast: Record<string, unknown>) => {
          if (broadcast.names && Array.isArray(broadcast.names)) {
            broadcasts.push(...(broadcast.names as string[]));
          } else if (broadcast.name && typeof broadcast.name === 'string') {
            broadcasts.push(broadcast.name);
          } else if (broadcast.shortName && typeof broadcast.shortName === 'string') {
            broadcasts.push(broadcast.shortName);
          } else if (broadcast.callSign && typeof broadcast.callSign === 'string') {
            broadcasts.push(broadcast.callSign);
          }
        });
      }

      // Filter to national networks only
      const nationalNetworks = filterToNationalOnly(broadcasts);

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

      const homeAbbrRaw = homeTeam?.team ?
        ((homeTeam.team as Record<string, unknown>)?.abbreviation as string) ||
        ((homeTeam.team as Record<string, unknown>)?.shortName as string) ||
        homeTeamName.substring(0, 3).toUpperCase() : 'UNK';

      const awayAbbrRaw = awayTeam?.team ?
        ((awayTeam.team as Record<string, unknown>)?.abbreviation as string) ||
        ((awayTeam.team as Record<string, unknown>)?.shortName as string) ||
        awayTeamName.substring(0, 3).toUpperCase() : 'UNK';

      // Normalize to 3-letter abbreviations (ensures consistency for grid layout)
      const homeAbbr = normalizeTeamAbbreviation(homeAbbrRaw);
      const awayAbbr = normalizeTeamAbbreviation(awayAbbrRaw);

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

      // Build all streaming options for this game
      const streamingOptions = buildStreamingOptions(nationalNetworks, isLeaguePass, gameId);

      // Select the primary option (can later incorporate user prefs from cookie)
      const primaryOption = selectPrimaryOption(streamingOptions, null);

      return {
        id: gameId,
        startTimeUtc: processedTime,
        teams: {
          away: { abbr: awayAbbr },
          home: { abbr: homeAbbr }
        },
        networks: nationalNetworks,
        leaguePass: isLeaguePass,
        streamingOptions,
        primaryOption,
      };
    });

    // Filter to the target date in Eastern Time
    const targetDateForFilter = targetDate || new Date();
    const filteredGames = games.filter((game: Game) =>
      isGameOnDate(game.startTimeUtc, targetDateForFilter, 'America/New_York')
    );

    return { games: filteredGames };
  } catch (error) {
    console.error('Error fetching games:', error);
    return {
      games: [],
      error: error instanceof Error ? error.message : 'Failed to load games'
    };
  }
}

interface HomePageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  // Parse date from search params if provided (Next.js 15 requires awaiting searchParams)
  const params = await searchParams;
  let targetDate: Date | undefined;
  if (params?.date) {
    const parsed = new Date(params.date);
    if (!isNaN(parsed.getTime())) {
      targetDate = parsed;
    }
  }
  
  const { games, error } = await fetchGamesForDate(targetDate);

  return (
    <ClientWrapper>
      <div className="min-h-screen max-w-[640px] md:max-w-[800px] mx-auto px-4">
        {/* Header */}
        <header className="py-4 border-b">
          <div className="flex items-center justify-between">
            <Logo />
            <DayNavigatorWrapper initialDate={targetDate} />
          </div>
        </header>

        {/* Content */}
        <main className="py-4">
          <SwipeableGameList currentDate={targetDate}>
            <AnimatedGameList dateKey={targetDate?.toISOString() || new Date().toISOString()}>
              {error ? (
                <ErrorFallback />
              ) : (
                <Suspense fallback={<SkeletonList count={6} />}>
                  <GameList games={games} />
                </Suspense>
              )}
            </AnimatedGameList>
          </SwipeableGameList>
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
