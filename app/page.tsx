import Link from "next/link";
import { absoluteUrl } from "@/lib/absolute-url";

async function getToday() {
  const url = await absoluteUrl("/api/scoreboard");
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) return { events: [] as Array<unknown> };
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

      {events.map((g: unknown) => {
        const game = g as { date?: string; broadcasts?: Array<{ names?: string[] }>; away?: { short?: string }; home?: { short?: string }; flags?: { isLeaguePass?: boolean; hasLocalRSN?: boolean } };
        const time = formatTime(game.date ?? '');
        const channels: string[] = Array.from(new Set(game.broadcasts?.flatMap((b: { names?: string[] }) => b.names || []) || []));
        return (
          <div key={(g as { id?: string }).id} className="rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">{game.away?.short} @ {game.home?.short}</div>
              <div className="tabular-nums">{time}</div>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {channels.map((n) => (
                <span key={n} className="rounded bg-[var(--accent)] px-2 py-1 text-xs text-white">{n}</span>
              ))}
              {game.flags?.isLeaguePass && <span className="rounded border px-2 py-1 text-xs">League Pass</span>}
              {game.flags?.isLeaguePass && game.flags?.hasLocalRSN && (
                <span className="rounded bg-neutral-200 px-2 py-1 text-xs">Blackout risk</span>
              )}
            </div>
          </div>
        );
      })}
    </main>
  );
}
