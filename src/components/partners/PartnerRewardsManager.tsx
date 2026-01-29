/**
 * PartnerRewardsManager
 * Permite que parceiros cadastrem suas recompensas para o Passaporte Digital
 * As recompensas ficam pendentes até aprovação do admin
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Gift, 
  Plus, 
  Trash2, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Percent,
  Calendar,
  AlertCircle,
  CheckSquare,
  List
} from 'lucide-react';
import { format, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import VoucherValidator from './VoucherValidator';
import VoucherList from './VoucherList';

interface PartnerReward {
  id: string;
  partner_id: string;
  reward_type: 'desconto' | 'brinde' | 'experiencia' | 'outros';
  reward_description: string;
  discount_percentage: number | null;
  status: 'pending' | 'approved' | 'rejected';
  valid_from: string;
  valid_until: string;
  max_uses: number | null;
  uses_count: number;
  created_at: string;
  admin_notes?: string;
}

interface PartnerRewardsManagerProps {
  partnerId: string;
  partnerName: string;
}

const REWARD_TYPES = [
  { value: 'desconto', label: 'Desconto (%)', icon: Percent },
  { value: 'brinde', label: 'Brinde', icon: Gift },
  { value: 'experiencia', label: 'Experiência Especial', icon: Gift },
  { value: 'outros', label: 'Outros', icon: Gift },
];

export default function PartnerRewardsManager({ partnerId, partnerName }: PartnerRewardsManagerProps) {
  const { toast } = useToast();
  const [rewards, setRewards] = useState<PartnerReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('rewards');
  const [voucherStats, setVoucherStats] = useState({
    total: 0,
    used: 0,
    valid: 0,
    usageRate: 0,
  });
  
  const [formData, setFormData] = useState({
    reward_type: 'desconto' as 'desconto' | 'brinde' | 'experiencia' | 'outros',
    reward_description: '',
    discount_percentage: '',
    valid_from: format(new Date(), 'yyyy-MM-dd'),
    valid_until: format(addMonths(new Date(), 1), 'yyyy-MM-dd'),
    max_uses: '',
  });

  useEffect(() => {
    loadRewards();
    loadVoucherStats();
  }, [partnerId, partnerName]);

  const loadVoucherStats = async () => {
    try {
      // Buscar IDs das recompensas aprovadas do parceiro
      const { data: rewards, error: rewardsError } = await supabase
        .from('passport_rewards' as any)
        .select('id')
        .eq('partner_name', partnerName)
        .eq('is_active', true);

      if (rewardsError) throw rewardsError;

      if (!rewards || rewards.length === 0) {
        setVoucherStats({ total: 0, used: 0, valid: 0, usageRate: 0 });
        return;
      }

      const rewardIds = (rewards as any[]).map((r: unknown) => r.id);

      // Contar vouchers
      const { count: total, error: totalError } = await supabase
        .from('user_rewards')
        .select('id', { count: 'exact', head: true })
        .in('reward_id', rewardIds);

      if (totalError) throw totalError;

      const { count: used, error: usedError } = await supabase
        .from('user_rewards')
        .select('id', { count: 'exact', head: true })
        .in('reward_id', rewardIds)
        .eq('is_used', true);

      if (usedError) throw usedError;

      const totalCount = total || 0;
      const usedCount = used || 0;
      const validCount = totalCount - usedCount;
      const usageRate = totalCount > 0 ? Math.round((usedCount / totalCount) * 100) : 0;

      setVoucherStats({
        total: totalCount,
        used: usedCount,
        valid: validCount,
        usageRate,
      });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao carregar estatísticas:', err);
    }
  };

  const handleVoucherValidated = () => {
    loadVoucherStats();
  };

  const loadRewards = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('partner_rewards' as any)
        .select('*')
        .eq('partner_id', partnerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRewards((data as any) || []);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao carregar recompensas:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar suas recompensas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.reward_description.trim()) {
      toast({
        title: 'Descrição obrigatória',
        description: 'Por favor, descreva a recompensa oferecida',
        variant: 'destructive',
      });
      return;
    }

    if (formData.reward_type === 'desconto' && !formData.discount_percentage) {
      toast({
        title: 'Percentual obrigatório',
        description: 'Informe o percentual de desconto',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('partner_rewards' as any)
        .insert({
          partner_id: partnerId,
          partner_name: partnerName,
          reward_type: formData.reward_type,
          reward_description: formData.reward_description,
          discount_percentage: formData.reward_type === 'desconto' 
            ? parseFloat(formData.discount_percentage) 
            : null,
          valid_from: formData.valid_from,
          valid_until: formData.valid_until,
          max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
          status: 'pending', // Sempre começa como pendente
          uses_count: 0,
        });

      if (error) throw error;

      toast({
        title: 'Recompensa cadastrada! 🎉',
        description: 'Sua recompensa foi enviada para aprovação do administrador.',
      });

      // Resetar formulário
      setFormData({
        reward_type: 'desconto',
        reward_description: '',
        discount_percentage: '',
        valid_from: format(new Date(), 'yyyy-MM-dd'),
        valid_until: format(addMonths(new Date(), 1), 'yyyy-MM-dd'),
        max_uses: '',
      });
      setShowForm(false);
      loadRewards();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao cadastrar recompensa:', err);
      toast({
        title: 'Erro ao cadastrar',
        description: err.message || 'Não foi possível cadastrar a recompensa',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (rewardId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta recompensa?')) return;

    try {
      const { error } = await supabase
        .from('partner_rewards' as any)
        .delete()
        .eq('id', rewardId)
        .eq('partner_id', partnerId); // Garante que só deleta as próprias

      if (error) throw error;

      toast({
        title: 'Excluída',
        description: 'Recompensa removida com sucesso',
      });
      loadRewards();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao excluir:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a recompensa',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-700 border-green-300"><CheckCircle2 className="w-3 h-3 mr-1" /> Aprovada</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300"><Clock className="w-3 h-3 mr-1" /> Pendente</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700 border-red-300"><XCircle className="w-3 h-3 mr-1" /> Rejeitada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-ms-primary-blue mx-auto mb-4" />
        <p className="text-gray-600">Carregando recompensas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-1">
          <Gift className="w-5 h-5 text-ms-primary-blue" />
          Recompensas do Passaporte Digital
        </h3>
        <p className="text-sm text-gray-500">
          Gerencie suas recompensas, valide vouchers e acompanhe estatísticas
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vouchers Emitidos</p>
                <p className="text-2xl font-bold">{voucherStats.total}</p>
              </div>
              <Gift className="w-8 h-8 text-ms-primary-blue opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vouchers Usados</p>
                <p className="text-2xl font-bold text-green-600">{voucherStats.used}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vouchers Válidos</p>
                <p className="text-2xl font-bold text-blue-600">{voucherStats.valid}</p>
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
                <p className="text-2xl font-bold text-orange-600">{voucherStats.usageRate}%</p>
              </div>
              <Percent className="w-8 h-8 text-orange-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rewards">
            <Gift className="w-4 h-4 mr-2" />
            Minhas Recompensas
          </TabsTrigger>
          <TabsTrigger value="validate">
            <CheckSquare className="w-4 h-4 mr-2" />
            Validar Vouchers
          </TabsTrigger>
          <TabsTrigger value="list">
            <List className="w-4 h-4 mr-2" />
            Vouchers Emitidos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rewards" className="space-y-6">
          {/* Header da aba Recompensas */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Cadastrar Recompensas</h4>
              <p className="text-sm text-gray-500">
                Cadastre benefícios para viajantes do Descubra MS
              </p>
            </div>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-ms-primary-blue hover:bg-ms-discovery-teal text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Recompensa
            </Button>
          </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Como funciona?</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Cadastre recompensas que você oferece aos viajantes do Passaporte Digital</li>
              <li>Cada recompensa passa por aprovação do administrador</li>
              <li>Após aprovada, aparecerá nas rotas do passaporte</li>
              <li>Recomendamos atualizar as recompensas mensalmente</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Formulário de Nova Recompensa */}
      {showForm && (
        <Card className="border-ms-primary-blue/30">
          <CardHeader>
            <CardTitle className="text-lg">Cadastrar Nova Recompensa</CardTitle>
            <CardDescription>
              Descreva o benefício que você oferece aos viajantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Recompensa *</Label>
                  <Select
                    value={formData.reward_type}
                    onValueChange={(value: unknown) => setFormData({ ...formData, reward_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {REWARD_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.reward_type === 'desconto' && (
                  <div className="space-y-2">
                    <Label>Percentual de Desconto *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={formData.discount_percentage}
                        onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                        placeholder="10"
                      />
                      <span className="text-gray-500">%</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Descrição da Recompensa *</Label>
                <Textarea
                  value={formData.reward_description}
                  onChange={(e) => setFormData({ ...formData, reward_description: e.target.value })}
                  placeholder="Ex: 10% de desconto em qualquer hospedagem, válido para reservas diretas"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Válido a partir de</Label>
                  <Input
                    type="date"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Válido até</Label>
                  <Input
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Limite de usos (opcional)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.max_uses}
                    onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                    placeholder="Ilimitado"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-ms-primary-blue hover:bg-ms-discovery-teal text-white"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Gift className="w-4 h-4 mr-2" />
                      Cadastrar Recompensa
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Recompensas */}
      {rewards.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Gift className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-700 mb-2">Nenhuma recompensa cadastrada</h3>
            <p className="text-gray-500 text-sm mb-4">
              Cadastre benefícios para atrair mais viajantes do Passaporte Digital
            </p>
            <Button
              onClick={() => setShowForm(true)}
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Primeira Recompensa
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {rewards.map((reward) => (
            <Card key={reward.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusBadge(reward.status)}
                      <Badge variant="outline" className="capitalize">
                        {reward.reward_type}
                      </Badge>
                      {reward.discount_percentage && (
                        <Badge className="bg-green-100 text-green-700">
                          {reward.discount_percentage}% OFF
                        </Badge>
                      )}
                    </div>
                    
                    <p className="font-medium text-gray-900 mb-2">
                      {reward.reward_description}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(reward.valid_from), 'dd/MM/yyyy', { locale: ptBR })} - {format(new Date(reward.valid_until), 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                      {reward.max_uses && (
                        <span>
                          {reward.uses_count}/{reward.max_uses} usos
                        </span>
                      )}
                    </div>

                    {reward.admin_notes && reward.status === 'rejected' && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        <strong>Motivo da rejeição:</strong> {reward.admin_notes}
                      </div>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(reward.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
        </TabsContent>

        <TabsContent value="validate">
          <VoucherValidator
            partnerId={partnerId}
            partnerName={partnerName}
            onVoucherValidated={handleVoucherValidated}
          />
        </TabsContent>

        <TabsContent value="list">
          <VoucherList
            partnerId={partnerId}
            partnerName={partnerName}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

