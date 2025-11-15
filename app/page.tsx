import { Suspense } from 'react';
import { AnswerChip, type Game } from '@/components/answer-chip';
import { SkeletonList } from '@/components/game-skeleton';
import { ClientWrapper } from '@/components/client-wrapper';
import { Logo } from '@/components/logo';
import { DayNavigatorWrapper } from '@/components/day-navigator-wrapper';
import { SettingsTrigger } from '@/components/settings-trigger';
import { ErrorFallback } from '@/components/error-fallback';
import { TeamGlyph } from '@/components/team-glyph';
import { GameTime } from '@/components/game-time';
import { isGameTonight } from '@/lib/timezone';
import { filterToNationalOnly } from '@/lib/national';
import { buildStreamingOptions, selectPrimaryOption } from '@/lib/streaming';
import { ExternalLink } from 'lucide-react';

export const runtime = 'edge';

// Game row component - clickable to streaming destination
function GameRow({ game }: { game: Game }) {
  return (
    <a
      href={game.primaryLink.links.web}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-4 px-4 py-3.5 border-b hover:bg-accent/10 transition-colors cursor-pointer"
    >
      <div className="min-w-[90px] flex-shrink-0">
        <AnswerChip game={game} />
      </div>

      <div className="flex-1 min-w-0 flex items-center gap-2">
        <TeamGlyph abbr={game.teams.away.abbr} />
        <span className="text-base md:text-sm font-medium tabular-nums">
          {game.teams.away.abbr} @ {game.teams.home.abbr}
        </span>
        <TeamGlyph abbr={game.teams.home.abbr} />
      </div>

      <div className="flex items-center gap-2">
        <GameTime
          utcTime={game.startTimeUtc}
          className="w-20 text-right text-sm tabular-nums text-muted-foreground"
        />
        <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
      </div>
    </a>
  );
}

// Game list component
function GameList({ games }: { games: Game[] }) {
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
        <GameRow key={game.id} game={game} />
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

      // Build all streaming options for this game
      const streamingOptions = buildStreamingOptions(gameId, nationalNetworks, isLeaguePass);

      // Select the primary option (can later incorporate user prefs from cookie)
      const primaryLink = selectPrimaryOption(streamingOptions, null);

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
              <GameList games={games} />
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
