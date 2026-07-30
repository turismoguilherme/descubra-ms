import type { LeaderboardEntry } from '@/services/passport/leaderboardService';
import { cn } from '@/lib/utils';

interface RankingListProps {
  entries: LeaderboardEntry[];
  currentUserId?: string | null;
}

export default function RankingList({ entries, currentUserId }: RankingListProps) {
  const list = entries.filter((e) => e.rank_position > 3).slice(0, 47);

  if (list.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground py-6">
        Ainda não há mais posições neste ranking.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border rounded-lg border bg-white overflow-hidden">
      {list.map((entry) => {
        const isMe = currentUserId && entry.ranked_user_id === currentUserId;
        return (
          <li
            key={entry.ranked_user_id}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5',
              isMe && 'bg-ms-discovery-teal/10'
            )}
          >
            <span className="w-8 shrink-0 text-center text-sm font-bold text-ms-primary-blue">
              {entry.rank_position}
            </span>
            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-muted">
              {entry.avatar_url ? (
                <img src={entry.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-muted-foreground">
                  {(entry.display_name || 'V').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {entry.display_name}
                {isMe ? ' (você)' : ''}
              </p>
              <p className="text-xs text-muted-foreground">
                {entry.total_stamps} carimbo{entry.total_stamps === 1 ? '' : 's'}
              </p>
            </div>
            <span className="shrink-0 text-sm font-semibold text-ms-pantanal-green">
              {entry.total_points} pts
            </span>
          </li>
        );
      })}
    </ul>
  );
}
