import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Gift, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Search,
  Loader2,
  Calendar,
  User
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Voucher {
  id: string;
  voucher_code: string;
  user_id: string;
  reward_id: string;
  route_id: string;
  is_used: boolean;
  used_at: string | null;
  created_at: string;
  partner_name: string;
  user_email?: string;
  reward_description?: string;
}

interface VoucherListProps {
  partnerId: string;
  partnerName: string;
}

const VoucherList: React.FC<VoucherListProps> = ({ partnerId, partnerName }) => {
  const { toast } = useToast();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'valid' | 'used'>('all');

  useEffect(() => {
    loadVouchers();
  }, [partnerName]);

  const loadVouchers = async () => {
    try {
      setLoading(true);
      
      // Buscar vouchers vinculados às recompensas deste parceiro
      // Primeiro, buscar IDs das recompensas do parceiro
      const { data: rewards, error: rewardsError } = await supabase
        .from('passport_rewards')
        .select('id')
        .eq('partner_name', partnerName)
        .eq('is_active', true);

      if (rewardsError) throw rewardsError;

      if (!rewards || rewards.length === 0) {
        setVouchers([]);
        return;
      }

      const rewardIds = rewards.map(r => r.id);

      // Buscar vouchers dessas recompensas
      const { data: vouchersData, error: vouchersError } = await supabase
        .from('user_rewards')
        .select(`
          *,
          reward:passport_rewards!inner(partner_name, reward_description)
        `)
        .in('reward_id', rewardIds)
        .order('created_at', { ascending: false });

      if (vouchersError) throw vouchersError;

      // Formatar dados
      const formattedVouchers: Voucher[] = (vouchersData || []).map((v: any) => ({
        id: v.id,
        voucher_code: v.voucher_code,
        user_id: v.user_id,
        reward_id: v.reward_id,
        route_id: v.route_id,
        is_used: v.is_used,
        used_at: v.used_at,
        created_at: v.created_at,
        partner_name: v.reward?.partner_name || partnerName,
        reward_description: v.reward?.reward_description,
      }));

      setVouchers(formattedVouchers);
    } catch (error: any) {
      console.error('Erro ao carregar vouchers:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os vouchers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredVouchers = vouchers.filter(v => {
    // Filtro por status
    if (filter === 'valid' && v.is_used) return false;
    if (filter === 'used' && !v.is_used) return false;
    
    // Filtro por busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        v.voucher_code.toLowerCase().includes(term) ||
        v.user_email?.toLowerCase().includes(term)
      );
    }
    
    return true;
  });

  const stats = {
    total: vouchers.length,
    used: vouchers.filter(v => v.is_used).length,
    valid: vouchers.filter(v => !v.is_used).length,
    usageRate: vouchers.length > 0 
      ? Math.round((vouchers.filter(v => v.is_used).length / vouchers.length) * 100)
      : 0,
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-ms-primary-blue mx-auto mb-4" />
        <p className="text-gray-600">Carregando vouchers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Emitidos</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Gift className="w-8 h-8 text-ms-primary-blue opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Usados</p>
                <p className="text-2xl font-bold text-green-600">{stats.used}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Válidos</p>
                <p className="text-2xl font-bold text-blue-600">{stats.valid}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Uso</p>
                <p className="text-2xl font-bold text-orange-600">{stats.usageRate}%</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle>Vouchers Emitidos</CardTitle>
          <CardDescription>
            Lista de todos os vouchers gerados para suas recompensas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por código ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tabs de Filtro */}
          <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'valid' | 'used')}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">Todos ({stats.total})</TabsTrigger>
              <TabsTrigger value="valid">Válidos ({stats.valid})</TabsTrigger>
              <TabsTrigger value="used">Usados ({stats.used})</TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="mt-4">
              {filteredVouchers.length === 0 ? (
                <div className="text-center py-12">
                  <Gift className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-700 mb-2">Nenhum voucher encontrado</h3>
                  <p className="text-gray-500 text-sm">
                    {searchTerm 
                      ? 'Tente buscar com outros termos'
                      : 'Ainda não há vouchers emitidos para suas recompensas'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredVouchers.map((voucher) => (
                    <Card key={voucher.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={voucher.is_used ? "default" : "secondary"}
                                className={voucher.is_used 
                                  ? "bg-green-100 text-green-700" 
                                  : "bg-blue-100 text-blue-700"
                                }
                              >
                                {voucher.is_used ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Usado
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3 h-3 mr-1" />
                                    Válido
                                  </>
                                )}
                              </Badge>
                              <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                {voucher.voucher_code}
                              </code>
                            </div>

                            {voucher.reward_description && (
                              <p className="text-sm text-gray-600">
                                {voucher.reward_description}
                              </p>
                            )}

                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Emitido: {format(new Date(voucher.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                              </span>
                              {voucher.is_used && voucher.used_at && (
                                <span className="flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Usado: {format(new Date(voucher.used_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoucherList;





