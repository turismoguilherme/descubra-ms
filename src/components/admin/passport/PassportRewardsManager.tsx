import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { passportAdminService } from '@/services/admin/passportAdminService';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const PassportRewardsManager: React.FC = () => {
  const [routes, setRoutes] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    route_id: '',
    partner_name: '',
    reward_type: 'desconto' as 'desconto' | 'brinde' | 'experiencia',
    reward_description: '',
    reward_code_prefix: '',
    discount_percentage: 0,
    partner_address: '',
    partner_phone: '',
    partner_email: '',
    expires_at: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [routesRes, rewardsRes] = await Promise.all([
        supabase.from('routes').select('*').eq('is_active', true),
        passportAdminService.getRewards(),
      ]);

      if (routesRes.error) throw routesRes.error;
      setRoutes(routesRes.data || []);
      setRewards(rewardsRes);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar dados',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await passportAdminService.createReward({
        ...formData,
        is_active: true,
      });
      toast({
        title: 'Recompensa criada',
      });
      setShowForm(false);
      setFormData({
        route_id: '',
        partner_name: '',
        reward_type: 'desconto',
        reward_description: '',
        reward_code_prefix: '',
        discount_percentage: 0,
        partner_address: '',
        partner_phone: '',
        partner_email: '',
        expires_at: '',
      });
      loadData();
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (rewardId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta recompensa?')) return;

    try {
      await passportAdminService.deleteReward(rewardId);
      toast({
        title: 'Recompensa excluída',
      });
      loadData();
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recompensas</CardTitle>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Recompensa
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <div className="mb-6 p-4 border rounded-lg space-y-4">
              <h3 className="font-semibold">Nova Recompensa</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Rota</Label>
                  <Select
                    value={formData.route_id}
                    onValueChange={(v) => setFormData({ ...formData, route_id: v })}
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
                <div>
                  <Label>Tipo</Label>
                  <Select
                    value={formData.reward_type}
                    onValueChange={(v: any) => setFormData({ ...formData, reward_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desconto">Desconto</SelectItem>
                      <SelectItem value="brinde">Brinde</SelectItem>
                      <SelectItem value="experiencia">Experiência</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Nome do Parceiro</Label>
                  <Input
                    value={formData.partner_name}
                    onChange={(e) => setFormData({ ...formData, partner_name: e.target.value })}
                  />
                </div>
                {formData.reward_type === 'desconto' && (
                  <div>
                    <Label>Percentual de Desconto</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discount_percentage}
                      onChange={(e) =>
                        setFormData({ ...formData, discount_percentage: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                )}
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={formData.reward_description}
                  onChange={(e) => setFormData({ ...formData, reward_description: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave}>Salvar</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {rewards.map((reward) => (
              <Card key={reward.id} className="border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{reward.partner_name}</h3>
                      <p className="text-sm text-muted-foreground">{reward.reward_description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(reward.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PassportRewardsManager;

