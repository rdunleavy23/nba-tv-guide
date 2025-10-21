import { NextResponse } from 'next/server';

export const runtime = 'edge';

function yyyymmdd(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date') ?? yyyymmdd();
  const url = `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${date}`;

  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) return NextResponse.json({ error: 'upstream error' }, { status: 502 });
  const data = await res.json();

  const events = (data.events ?? []).map((e: unknown) => {
    const comp = (e as { competitions?: unknown[] })?.competitions?.[0] ?? {};
    const broadcasts = ((comp as { broadcasts?: unknown[] })?.broadcasts ?? []).map((b: unknown) => ({
      market: (b as { market?: string })?.market,
      names: (b as { names?: string[] })?.names ?? ((b as { name?: string })?.name ? [(b as { name: string }).name] : []),
    }));
    const home = ((comp as { competitors?: unknown[] })?.competitors ?? []).find((c: unknown) => (c as { homeAway?: string })?.homeAway === 'home') as { team?: unknown } ?? {};
    const away = ((comp as { competitors?: unknown[] })?.competitors ?? []).find((c: unknown) => (c as { homeAway?: string })?.homeAway === 'away') as { team?: unknown } ?? {};

    const allNames = broadcasts.flatMap((b: { names?: string[] }) => b.names ?? []);
    const isLeaguePass = allNames.some((n: string) => /league pass/i.test(n));
    const hasLocalRSN = broadcasts.some((b: { market?: string }) => b.market === 'local');
    const hasNationalTV = broadcasts.some((b: { market?: string }) => b.market === 'national');

    return {
      id: (e as { id?: string })?.id,
      date: (comp as { date?: string })?.date,
      status: (e as { status?: { type?: { name?: string } } })?.status?.type?.name,
      home: { name: (home.team as { displayName?: string })?.displayName, short: (home.team as { abbreviation?: string })?.abbreviation },
      away: { name: (away.team as { displayName?: string })?.displayName, short: (away.team as { abbreviation?: string })?.abbreviation },
      broadcasts,
      flags: { isLeaguePass, hasLocalRSN, hasNationalTV },
    };
  });

  return NextResponse.json({ events });
}
