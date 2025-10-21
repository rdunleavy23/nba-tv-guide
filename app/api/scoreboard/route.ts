import { NextRequest, NextResponse } from 'next/server';

export interface Broadcast {
  name?: string;
  names?: string[];
  shortName?: string;
}

export interface Game {
  id: string;
  date: string;
  status: string;
  home: {
    name: string;
    short: string;
  };
  away: {
    name: string;
    short: string;
  };
  broadcasts: Array<{
    market: string;
    names: string[];
  }>;
  flags: {
    isLeaguePass: boolean;
    hasLocalRSN: boolean;
    hasNationalTV: boolean;
  };
}

export interface NormalizedGame {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeAbbr: string;
  awayAbbr: string;
  time: string;
  status: string;
  broadcasts: string[];
  flags: {
    isLeaguePass: boolean;
    isFinished: boolean;
  };
}


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0].replace(/-/g, '');
    
    const espnUrl = `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${date}`;
    
    const response = await fetch(espnUrl, {
      headers: {
        'User-Agent': 'ScreenAssist/1.0',
      },
    });
    
    if (!response.ok) {
      throw new Error(`ESPN API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Handle the actual ESPN API response format
    const events = data.events || [];
    const games = events.map((event: Record<string, unknown>) => {
      const competition = (event.competitions as Record<string, unknown>[])?.[0];
      const competitors = (competition?.competitors as Record<string, unknown>[]) || [];
      
      const homeTeam = competitors.find((c: Record<string, unknown>) => c.homeAway === 'home');
      const awayTeam = competitors.find((c: Record<string, unknown>) => c.homeAway === 'away');
      
      const broadcasts: string[] = [];
      if (competition?.broadcasts) {
        (competition.broadcasts as Record<string, unknown>[]).forEach((broadcast: Record<string, unknown>) => {
          if (broadcast.names) {
            broadcasts.push(...(broadcast.names as string[]));
          }
        });
      }
      
      const isFinished = ((competition?.status as Record<string, unknown>)?.type as Record<string, unknown>)?.state === 'post';
      const isLeaguePass = (competition?.flags as string[])?.includes('league-pass') || false;
      
      return {
        id: event.id as string,
        homeTeam: ((homeTeam?.team as Record<string, unknown>)?.displayName as string) || '',
        awayTeam: ((awayTeam?.team as Record<string, unknown>)?.displayName as string) || '',
        homeAbbr: ((homeTeam?.team as Record<string, unknown>)?.abbreviation as string) || '',
        awayAbbr: ((awayTeam?.team as Record<string, unknown>)?.abbreviation as string) || '',
        time: event.date as string,
        status: ((competition?.status as Record<string, unknown>)?.type as Record<string, unknown>)?.name as string || event.status as string,
        broadcasts: [...new Set(broadcasts)], // deduplicate
        flags: {
          isLeaguePass,
          isFinished,
        },
      };
    });
    
    return NextResponse.json({ games, date });
  } catch (error) {
    console.error('Scoreboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scoreboard data' },
      { status: 500 }
    );
  }
}
