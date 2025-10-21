import Link from "next/link";
import { absoluteUrl } from "@/lib/absolute-url";

async function getToday() {
  const url = absoluteUrl("/api/scoreboard");
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) return { events: [] as any[] };
  return res.json();
}

function formatTime(iso: string, tz?: string, hour12 = true) {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", hour12, timeZone: tz });
}

export default async function Home() {
  const { events } = await getToday();

  return (
    <main className="mx-auto max-w-md p-4 space-y-3">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Today’s NBA Games</h1>
        <Link href="/settings" className="rounded border px-3 py-1.5">Settings</Link>
      </header>

      {events.length === 0 && <p>No games today.</p>}

      {events.map((g: any) => {
        const time = formatTime(g.date);
        const channels: string[] = Array.from(new Set(g.broadcasts.flatMap((b: any) => b.names || [])));
        return (
          <div key={g.id} className="rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">{g.away.short} @ {g.home.short}</div>
              <div className="tabular-nums">{time}</div>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {channels.map((n) => (
                <span key={n} className="rounded bg-[var(--accent)] px-2 py-1 text-xs text-white">{n}</span>
              ))}
              {g.flags?.isLeaguePass && <span className="rounded border px-2 py-1 text-xs">League Pass</span>}
              {g.flags?.isLeaguePass && g.flags?.hasLocalRSN && (
                <span className="rounded bg-neutral-200 px-2 py-1 text-xs">Blackout risk</span>
              )}
            </div>
          </div>
        );
      })}
    </main>
  );
}
