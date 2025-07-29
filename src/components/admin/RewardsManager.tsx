import React, { useEffect, useState } from 'react';
import rewardService, { Reward } from '@/services/rewardService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const defaultReward: Partial<Reward> = {
  name: '',
  description: '',
  type: 'badge',
  criteria: {},
  local_resgate: '',
  instrucoes_resgate: '',
  active: true,
};

const RewardsManager: React.FC = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<Reward>>(defaultReward);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    setLoading(true);
    try {
      const data = await rewardService.listRewards(false);
      setRewards(data);
    } catch (e) {
      console.error('Erro ao carregar recompensas:', e);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as recompensas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (reward: Reward) => {
    setForm(reward);
    setEditingId(reward.id);
  };

  const handleCancel = () => {
    setForm(defaultReward);
    setEditingId(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSwitch = (checked: boolean) => {
    setForm({ ...form, active: checked });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const rewardToSave: Partial<Reward> = {
        ...form,
        criteria: typeof form.criteria === 'string' ? JSON.parse(form.criteria) : form.criteria,
        type: form.type || 'badge',
        active: form.active !== false,
      };

      if (editingId) {
        await rewardService.updateReward(editingId, rewardToSave as Reward);
        toast({
          title: "Sucesso",
          description: "Recompensa atualizada com sucesso.",
        });
      } else {
        await rewardService.createReward(rewardToSave as Reward);
        toast({
          title: "Sucesso",
          description: "Recompensa cadastrada com sucesso.",
        });
      }
      await loadRewards();
      handleCancel();
    } catch (e: any) {
      console.error('Erro ao salvar recompensa:', e);
      toast({
        title: "Erro",
        description: `Não foi possível salvar a recompensa. ${e.message || 'Verifique os dados.'}`, // Melhorar mensagem de erro
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Editar Recompensa' : 'Nova Recompensa'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Input
              name="name"
              placeholder="Nome da recompensa"
              value={form.name || ''}
              onChange={handleChange}
              required
            />
            <Textarea
              name="description"
              placeholder="Descrição"
              value={form.description || ''}
              onChange={handleChange}
            />
            <Input
              name="type"
              placeholder="Tipo (badge, desconto, brinde, etc.)"
              value={form.type || ''}
              onChange={handleChange}
            />
            <Input
              name="criteria"
              placeholder="Critérios (JSON)"
              value={typeof form.criteria === 'string' ? form.criteria : JSON.stringify(form.criteria || {})}
              onChange={e => setForm({ ...form, criteria: e.target.value })}
            />
            <Input
              name="local_resgate"
              placeholder="Local de Resgate (Endereço, Parceiro, etc.)"
              value={form.local_resgate || ''}
              onChange={handleChange}
            />
            <Textarea
              name="instrucoes_resgate"
              placeholder="Instruções de Resgate (Ex: Apresente o QR code no balcão X)"
              value={form.instrucoes_resgate || ''}
              onChange={handleChange}
            />
            <div className="flex items-center gap-2">
              <Switch checked={form.active !== false} onCheckedChange={handleSwitch} />
              <span>{form.active !== false ? 'Ativa' : 'Inativa'}</span>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving}>
                {editingId ? 'Salvar Alterações' : 'Cadastrar'}
              </Button>
              {editingId && (
                <Button variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recompensas Cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Carregando...</div>
          ) : (
            <div className="space-y-4">
              {rewards.length === 0 && <div>Nenhuma recompensa cadastrada ainda.</div>}
              {rewards.map(reward => (
                <div key={reward.id} className="flex items-center gap-4 border-b py-2">
                  <div className="flex-1">
                    <div className="font-bold">{reward.name}</div>
                    <div className="text-sm text-gray-600">{reward.description}</div>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline">{reward.type}</Badge>
                      <Badge variant={reward.active ? 'default' : 'secondary'}>
                        {reward.active ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Critérios: {typeof reward.criteria === 'string' ? reward.criteria : JSON.stringify(reward.criteria)}
                    </div>
                    {reward.local_resgate && (
                      <div className="text-xs text-gray-500 mt-1">
                        Local de Resgate: {reward.local_resgate}
                      </div>
                    )}
                    {reward.instrucoes_resgate && (
                      <div className="text-xs text-gray-500 mt-1">
                        Instruções: {reward.instrucoes_resgate}
                      </div>
                    )}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(reward)}>
                    Editar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RewardsManager; 