// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Gift, QrCode, Lock } from 'lucide-react';
import VoucherModal from './VoucherModal';

interface RewardRow {
  id: string;
  voucher_code: string | null;
  is_used: boolean;
  used_at: string | null;
  route_id: string | null;
  passport_rewards: {
    partner_name: string | null;
    reward_description: string | null;
    discount_percentage: number | null;
    expires_at: string | null;
  } | null;
  routes?: { name: string } | null;
}

interface ShowcaseRow {
  id: string;
  partner_name: string | null;
  reward_description: string | null;
  discount_percentage: number | null;
  route_id: string;
  routes?: { name: string } | null;
}

function statusOf(r: RewardRow): 'available' | 'used' | 'expired' {
  if (r.is_used) return 'used';
  const exp = r.passport_rewards?.expires_at;
  if (exp && new Date(exp) < new Date()) return 'expired';
  return 'available';
}

const STATUS_LABEL = { available: 'Disponível', used: 'Utilizado', expired: 'Vencido' };

const PassportAllRewardsView: React.FC = () => {
  const { user } = useAuth();
  const [mine, setMine] = useState<RewardRow[]>([]);
  const [showcase, setShowcase] = useState<ShowcaseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<RewardRow | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let wonRouteIds: string[] = [];
      if (user) {
        const { data } = await supabase
          .from('user_rewards')
          .select('id, voucher_code, is_used, used_at, route_id, passport_rewards(partner_name, reward_description, discount_percentage, expires_at), routes(name)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        setMine((data as RewardRow[]) || []);
        wonRouteIds = (data || []).map((r) => r.route_id).filter(Boolean);
      }
      const { data: all } = await supabase
        .from('passport_rewards')
        .select('id, partner_name, reward_description, discount_percentage, route_id, routes(name)')
        .eq('is_active', true)
        .limit(50);
      setShowcase(((all as ShowcaseRow[]) || []).filter((r) => !wonRouteIds.includes(r.route_id)));
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) return <p className="text-center text-muted-foreground py-10">Carregando recompensas…</p>;

  return (
    <div className="space-y-10 max-w-3xl mx-auto">
      <section>
        <h2 className="text-xl font-semibold mb-1">Meus vouchers</h2>
        <p className="text-sm text-muted-foreground mb-4">Toque em um voucher disponível para mostrar o QR Code ao parceiro.</p>
        {!user && <p className="text-sm text-muted-foreground">Entre na sua conta para ver seus vouchers.</p>}
        {user && mine.length === 0 && (
          <Card><CardContent className="py-8 text-center text-muted-foreground">
            Você ainda não ganhou vouchers. Complete um roteiro para desbloquear prêmios dos parceiros.
          </CardContent></Card>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          {mine.map((r) => {
            const st = statusOf(r);
            const canShow = st === 'available' && r.voucher_code;
            return (
              <Card key={r.id} className={st !== 'available' ? 'opacity-60' : 'shadow-lg'}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{r.passport_rewards?.partner_name || 'Parceiro'}</span>
                    <Badge variant={st === 'available' ? 'default' : 'secondary'}>{STATUS_LABEL[st]}</Badge>
                  </div>
                  <p className="text-sm">{r.passport_rewards?.reward_description || (r.passport_rewards?.discount_percentage ? `${r.passport_rewards.discount_percentage}% de desconto` : 'Recompensa')}</p>
                  {r.routes?.name && <p className="text-xs text-muted-foreground">Roteiro: {r.routes.name}</p>}
                  {canShow && (
                    <Button size="sm" className="w-full" onClick={() => setOpen(r)}>
                      <QrCode className="mr-2 h-4 w-4" /> Mostrar QR Code
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {showcase.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-1">Para desbloquear</h2>
          <p className="text-sm text-muted-foreground mb-4">Complete estes roteiros para ganhar.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {showcase.map((r) => (
              <Card key={r.id}>
                <CardContent className="p-4 space-y-1">
                  <div className="flex items-center gap-2 font-semibold"><Lock className="h-4 w-4" />{r.partner_name || 'Parceiro'}</div>
                  <p className="text-sm flex items-center gap-1"><Gift className="h-4 w-4" />{r.reward_description || (r.discount_percentage ? `${r.discount_percentage}% de desconto` : 'Recompensa')}</p>
                  {r.routes?.name && <p className="text-xs text-muted-foreground">Roteiro: {r.routes.name}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {open?.voucher_code && (
        <VoucherModal
          open={!!open}
          onOpenChange={(o) => !o && setOpen(null)}
          voucherCode={open.voucher_code}
          partnerName={open.passport_rewards?.partner_name}
          description={open.passport_rewards?.reward_description}
          expiresAt={open.passport_rewards?.expires_at}
        />
      )}
    </div>
  );
};

export default PassportAllRewardsView;
