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

  const events = (data.events ?? []).map((e: any) => {
    const comp = e.competitions?.[0] ?? {};
    const broadcasts = (comp.broadcasts ?? []).map((b: any) => ({
      market: b.market,
      names: b.names ?? (b.name ? [b.name] : []),
    }));
    const home = comp.competitors?.find((c: any) => c.homeAway === 'home')?.team ?? {};
    const away = comp.competitors?.find((c: any) => c.homeAway === 'away')?.team ?? {};

    const allNames = broadcasts.flatMap((b: any) => b.names);
    const isLeaguePass = allNames.some((n: string) => /league pass/i.test(n));
    const hasLocalRSN = broadcasts.some((b: any) => b.market === 'local');
    const hasNationalTV = broadcasts.some((b: any) => b.market === 'national');

    return {
      id: e.id,
      date: comp.date,
      status: e.status?.type?.name,
      home: { name: home.displayName, short: home.abbreviation },
      away: { name: away.displayName, short: away.abbreviation },
      broadcasts,
      flags: { isLeaguePass, hasLocalRSN, hasNationalTV },
    };
  });

  return NextResponse.json({ events });
}
