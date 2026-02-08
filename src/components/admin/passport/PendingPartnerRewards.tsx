/**
 * PendingPartnerRewards
 * Exibe recompensas cadastradas por parceiros aguardando aprovação
 * Permite aprovar, rejeitar e vincular a rotas
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Loader2, 
  Gift,
  Building2,
  Calendar,
  Percent,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PartnerReward {
  id: string;
  partner_id: string;
  partner_name: string;
  reward_type: 'desconto' | 'brinde' | 'experiencia' | 'outros';
  reward_description: string;
  discount_percentage: number | null;
  status: 'pending' | 'approved' | 'rejected';
  valid_from: string;
  valid_until: string;
  max_uses: number | null;
  uses_count: number;
  route_id: string | null;
  admin_notes: string | null;
  created_at: string;
}

interface Route {
  id: string;
  name: string;
}

export default function PendingPartnerRewards() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [rewards, setRewards] = useState<PartnerReward[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedRoutes, setSelectedRoutes] = useState<Record<string, string>>({});
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar recompensas pendentes
      const { data: rewardsData, error: rewardsError } = await supabase
        .from('partner_rewards')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (rewardsError) throw rewardsError;
      setRewards(rewardsData || []);

      // Carregar rotas ativas
      const { data: routesData, error: routesError } = await supabase
        .from('routes')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (routesError) throw routesError;
      setRoutes(routesData || []);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao carregar dados:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as recompensas pendentes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (rewardId: string) => {
    const selectedRouteId = selectedRoutes[rewardId];
    
    if (!selectedRouteId) {
      toast({
        title: 'Selecione uma rota',
        description: 'Você precisa vincular a recompensa a uma rota antes de aprovar',
        variant: 'destructive',
      });
      return;
    }

    setProcessingId(rewardId);
    try {
      const { error } = await supabase
        .from('partner_rewards')
        .update({
          status: 'approved',
          route_id: selectedRouteId,
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
          admin_notes: adminNotes[rewardId] || null,
        })
        .eq('id', rewardId);

      if (error) throw error;

      toast({
        title: 'Recompensa aprovada! ✅',
        description: 'A recompensa agora aparecerá no Passaporte Digital',
      });
      loadData();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao aprovar:', err);
      toast({
        title: 'Erro ao aprovar',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (rewardId: string) => {
    const notes = adminNotes[rewardId];
    
    if (!notes?.trim()) {
      toast({
        title: 'Informe o motivo',
        description: 'Você precisa informar o motivo da rejeição',
        variant: 'destructive',
      });
      return;
    }

    setProcessingId(rewardId);
    try {
      const { error } = await supabase
        .from('partner_rewards')
        .update({
          status: 'rejected',
          admin_notes: notes,
        })
        .eq('id', rewardId);

      if (error) throw error;

      toast({
        title: 'Recompensa rejeitada',
        description: 'O parceiro será notificado',
      });
      loadData();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao rejeitar:', err);
      toast({
        title: 'Erro ao rejeitar',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
        <p className="text-gray-600">Carregando recompensas pendentes...</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              Recompensas Pendentes de Aprovação
            </CardTitle>
            <CardDescription>
              Recompensas cadastradas por parceiros aguardando sua análise
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {rewards.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <CheckCircle2 className="w-12 h-12 text-green-300 mx-auto mb-4" />
            <p className="font-medium">Nenhuma recompensa pendente</p>
            <p className="text-sm">Todas as recompensas foram revisadas</p>
          </div>
        ) : (
          <div className="space-y-6">
            {rewards.map((reward) => (
              <div 
                key={reward.id} 
                className="border rounded-lg p-4 bg-yellow-50/50 border-yellow-200"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold text-gray-900">{reward.partner_name}</span>
                      <Badge variant="outline" className="capitalize">
                        {reward.reward_type}
                      </Badge>
                      {reward.discount_percentage && (
                        <Badge className="bg-green-100 text-green-700">
                          <Percent className="w-3 h-3 mr-1" />
                          {reward.discount_percentage}% OFF
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-700 mb-3">
                      <Gift className="w-4 h-4 inline-block mr-1 text-purple-500" />
                      {reward.reward_description}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(reward.valid_from), 'dd/MM/yy', { locale: ptBR })} - {format(new Date(reward.valid_until), 'dd/MM/yy', { locale: ptBR })}
                      </span>
                      {reward.max_uses && (
                        <span>Limite: {reward.max_uses} usos</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Seleção de Rota */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Vincular a Rota *
                    </label>
                    <Select
                      value={selectedRoutes[reward.id] || ''}
                      onValueChange={(value) => setSelectedRoutes({ ...selectedRoutes, [reward.id]: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma rota" />
                      </SelectTrigger>
                      <SelectContent>
                        {routes.map((route) => (
                          <SelectItem key={route.id} value={route.id}>
                            {route.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Observações do Admin
                    </label>
                    <Textarea
                      value={adminNotes[reward.id] || ''}
                      onChange={(e) => setAdminNotes({ ...adminNotes, [reward.id]: e.target.value })}
                      placeholder="Motivo da rejeição ou observações..."
                      rows={2}
                    />
                  </div>
                </div>

                {/* Ações */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleApprove(reward.id)}
                    disabled={processingId === reward.id}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {processingId === reward.id ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                    )}
                    Aprovar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleReject(reward.id)}
                    disabled={processingId === reward.id}
                  >
                    {processingId === reward.id ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-2" />
                    )}
                    Rejeitar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

