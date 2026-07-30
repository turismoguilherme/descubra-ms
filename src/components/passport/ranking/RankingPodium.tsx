import type { LeaderboardEntry } from '@/services/passport/leaderboardService';
import { Trophy } from 'lucide-react';

interface RankingPodiumProps {
  entries: LeaderboardEntry[];
}

const PODIUM = [
  { place: 2, height: 'h-20', ring: 'ring-slate-300', badge: 'bg-slate-400' },
  { place: 1, height: 'h-28', ring: 'ring-amber-400', badge: 'bg-amber-500' },
  { place: 3, height: 'h-16', ring: 'ring-amber-700/70', badge: 'bg-amber-800' },
] as const;

function findEntry(entries: LeaderboardEntry[], place: number) {
  return entries.find((e) => e.rank_position === place);
}

export default function RankingPodium({ entries }: RankingPodiumProps) {
  const top = PODIUM.map((slot) => ({
    ...slot,
    entry: findEntry(entries, slot.place),
  }));

  if (!top.some((t) => t.entry)) return null;

  return (
    <div className="flex items-end justify-center gap-3 sm:gap-6 py-4">
      {top.map(({ place, height, ring, badge, entry }) => (
        <div key={place} className="flex flex-col items-center w-24 sm:w-28">
          <div
            className={`relative mb-2 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-ms-primary-blue/10 ring-2 ${ring}`}
          >
            {entry?.avatar_url ? (
              <img
                src={entry.avatar_url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <Trophy className="h-6 w-6 text-ms-primary-blue" />
            )}
            <span
              className={`absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${badge}`}
            >
              {place}
            </span>
          </div>
          <p className="text-center text-sm font-semibold text-ms-primary-blue line-clamp-2 min-h-[2.5rem]">
            {entry?.display_name || '—'}
          </p>
          <p className="text-xs text-muted-foreground mb-2">
            {entry ? `${entry.total_points} pts` : ''}
          </p>
          <div
            className={`w-full rounded-t-lg bg-gradient-to-t from-ms-primary-blue to-ms-discovery-teal ${height} flex items-start justify-center pt-2`}
          >
            {place === 1 && <Trophy className="h-5 w-5 text-ms-secondary-yellow" />}
          </div>
        </div>
      ))}
    </div>
  );
}
