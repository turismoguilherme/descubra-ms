import { useEffect, useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  leaderboardService,
  type LeaderboardEntry,
  type LeaderboardPeriod,
  type MyLeaderboardPosition,
} from '@/services/passport/leaderboardService';
import { achievementService } from '@/services/achievementService';
import RankingPodium from './RankingPodium';
import RankingList from './RankingList';
import MyRankCard from './MyRankCard';
import RankingShareCard from './RankingShareCard';
import { Trophy } from 'lucide-react';

type RankTab = 'month' | 'all' | 'region';

export default function PassportRankingPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState<RankTab>('month');
  const [region, setRegion] = useState<string>('all');
  const [regions, setRegions] = useState<string[]>([]);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myPosition, setMyPosition] = useState<MyLeaderboardPosition | null>(null);
  const [loading, setLoading] = useState(true);
  const [optOut, setOptOut] = useState(false);
  const [displayName, setDisplayName] = useState('Viajante');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const period: LeaderboardPeriod = tab === 'all' ? 'all' : 'month';
  const regionFilter = tab === 'region' && region !== 'all' ? region : null;

  const periodLabel = useMemo(() => {
    if (tab === 'all') return 'Ranking geral';
    if (tab === 'region') return region !== 'all' ? `Ranking · ${region}` : 'Ranking por região';
    return 'Ranking do mês';
  }, [region, tab]);

  useEffect(() => {
    leaderboardService
      .getRouteRegions()
      .then(setRegions)
      .catch(() => setRegions([]));
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const [out, profile] = await Promise.all([
          leaderboardService.getOptOut(),
          supabase
            .from('user_profiles')
            .select('full_name, display_name, avatar_url')
            .eq('user_id', user.id)
            .maybeSingle(),
        ]);
        if (cancelled) return;
        setOptOut(out);
        const p = profile.data;
        setDisplayName(
          (p?.display_name || p?.full_name || user.user_metadata?.full_name || 'Viajante') as string
        );
        setAvatarUrl((p?.avatar_url as string) || null);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [board, mine] = await Promise.all([
          leaderboardService.getLeaderboard(period, regionFilter, 50),
          user?.id
            ? leaderboardService.getMyPosition(period, regionFilter)
            : Promise.resolve(null),
        ]);
        if (cancelled) return;
        setEntries(board);
        setMyPosition(mine);
        if (user?.id) {
          achievementService.checkAndUnlockAchievements(user.id).catch(() => undefined);
        }
      } catch (err) {
        if (!cancelled) {
          toast({
            title: 'Erro ao carregar ranking',
            description:
              err instanceof Error
                ? err.message
                : 'Verifique se a migração do ranking foi aplicada.',
            variant: 'destructive',
          });
          setEntries([]);
          setMyPosition(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [period, regionFilter, toast, user?.id]);

  const handleOptOut = async (checked: boolean) => {
    try {
      await leaderboardService.setOptOut(checked);
      setOptOut(checked);
      toast({
        title: checked ? 'Você saiu do ranking público' : 'Você voltou ao ranking',
      });
      const board = await leaderboardService.getLeaderboard(period, regionFilter, 50);
      setEntries(board);
    } catch (err) {
      toast({
        title: 'Não foi possível atualizar',
        description: err instanceof Error ? err.message : 'Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-ms-primary-blue/10 px-3 py-1 text-sm font-medium text-ms-primary-blue">
          <Trophy className="h-4 w-4" />
          Ranking do Passaporte
        </div>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          Pontuação por carimbos válidos em roteiros oficiais. Mensal para novos viajantes
          competirem; geral e por região para quem já explora o estado.
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as RankTab)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="month">Mensal</TabsTrigger>
          <TabsTrigger value="all">Geral</TabsTrigger>
          <TabsTrigger value="region">Por região</TabsTrigger>
        </TabsList>

        <TabsContent value="region" className="mt-4">
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className="max-w-md mx-auto bg-white">
              <SelectValue placeholder="Escolha a região" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as regiões (mês)</SelectItem>
              {regions.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {regions.length === 0 && (
            <p className="text-center text-xs text-muted-foreground mt-2">
              Nenhuma região cadastrada nas rotas publicadas ainda.
            </p>
          )}
        </TabsContent>
      </Tabs>

      <MyRankCard position={optOut ? null : myPosition} loading={loading} />

      {!optOut && myPosition && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-muted-foreground">{periodLabel}</p>
          <RankingShareCard
            displayName={displayName}
            avatarUrl={avatarUrl}
            position={myPosition}
            periodLabel={periodLabel}
          />
        </div>
      )}

      {loading ? (
        <div className="h-48 animate-pulse rounded-xl bg-muted" />
      ) : entries.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center text-muted-foreground">
          Ninguém no ranking ainda. Seja o primeiro a carimbar!
        </div>
      ) : (
        <>
          <RankingPodium entries={entries} />
          <RankingList entries={entries} currentUserId={user?.id} />
        </>
      )}

      {user && (
        <div className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
          <div>
            <Label htmlFor="lb-opt-out" className="font-medium">
              Não aparecer no ranking público
            </Label>
            <p className="text-xs text-muted-foreground">
              Sua posição continua calculada; só some da lista pública.
            </p>
          </div>
          <Switch id="lb-opt-out" checked={optOut} onCheckedChange={handleOptOut} />
        </div>
      )}
    </div>
  );
}
