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
          // Handle multiple possible broadcast name formats defensively
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
      
      const isFinished = ((competition?.status as Record<string, unknown>)?.type as Record<string, unknown>)?.state === 'post';
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
      
      // Validate ISO timestamp
      if (!rawTime || typeof rawTime !== 'string') {
        console.warn('Missing or invalid game time for game:', event.id);
        processedTime = new Date().toISOString(); // Fallback to current time
      } else {
        // Test if it's a valid ISO string
        const testDate = new Date(rawTime);
        if (isNaN(testDate.getTime())) {
          console.warn('Invalid ISO timestamp for game:', event.id, 'Raw time:', rawTime);
          processedTime = new Date().toISOString(); // Fallback to current time
        }
      }
      
      // Log warnings for unexpected data shapes (not errors)
      if (!homeTeam || !awayTeam) {
        console.warn('Missing team data for game:', event.id);
      }
      
      return {
        id: event.id as string,
        homeTeam: homeTeamName,
        awayTeam: awayTeamName,
        homeAbbr,
        awayAbbr,
        time: processedTime,
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
