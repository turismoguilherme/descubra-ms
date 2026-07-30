import type { MyLeaderboardPosition } from '@/services/passport/leaderboardService';
import { Medal } from 'lucide-react';

interface MyRankCardProps {
  position: MyLeaderboardPosition | null;
  loading?: boolean;
}

export default function MyRankCard({ position, loading }: MyRankCardProps) {
  if (loading) {
    return (
      <div className="rounded-xl border bg-white p-4 animate-pulse h-24" />
    );
  }

  if (!position) {
    return (
      <div className="rounded-xl border border-dashed bg-white p-4 text-sm text-muted-foreground">
        Faça check-ins em roteiros oficiais para entrar no ranking.
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal p-4 text-white shadow-md">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
          <Medal className="h-6 w-6 text-ms-secondary-yellow" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-wide text-white/80">Sua posição</p>
          <p className="text-2xl font-bold">#{position.rank_position}</p>
          <p className="text-xs text-white/85">
            {position.total_points} pts · {position.total_stamps} carimbos ·{' '}
            {position.total_participants} participantes
          </p>
        </div>
      </div>
    </div>
  );
}
