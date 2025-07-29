import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { rewardService } from '@/services/rewards/rewardService';
import { Reward } from '@/types/rewards';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Check, X, Award, User } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const RewardsManager: React.FC = () => {
  const { toast } = useToast();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentReward, setCurrentReward] = useState<Reward | null>(null);
  const [newReward, setNewReward] = useState<Partial<Reward>>({
    name: '',
    description: '',
    type: 'badge',
    criteria: {},
    active: true,
    local_resgate: '',
    instrucoes_resgate: '',
  });

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    setLoading(true);
    try {
      const fetchedRewards = await rewardService.getAllRewards();
      setRewards(fetchedRewards);
    } catch (error) {
      console.error('Erro ao carregar recompensas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as recompensas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReward = async () => {
    if (!newReward.name || !newReward.type || !newReward.local_resgate || !newReward.instrucoes_resgate) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios (Nome, Tipo, Local de Resgate, Instruções de Resgate).",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (currentReward) {
        // Update existing reward
        await rewardService.updateReward(currentReward.id, newReward as Reward);
        toast({
          title: "Sucesso!",
          description: "Recompensa atualizada.",
        });
      } else {
        // Create new reward
        await rewardService.createReward(newReward as Reward);
        toast({
          title: "Sucesso!",
          description: "Recompensa criada.",
        });
      }
      setIsDialogOpen(false);
      setNewReward({
        name: '',
        description: '',
        type: 'badge',
        criteria: {},
        active: true,
        local_resgate: '',
        instrucoes_resgate: '',
      });
      setCurrentReward(null);
      fetchRewards(); // Recarrega a lista
    } catch (error) {
      console.error('Erro ao salvar recompensa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a recompensa.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReward = async (id: string) => {
    setLoading(true);
    try {
      await rewardService.deleteReward(id);
      toast({
        title: "Sucesso!",
        description: "Recompensa removida.",
      });
      fetchRewards();
    } catch (error) {
      console.error('Erro ao deletar recompensa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a recompensa.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (reward: Reward) => {
    setCurrentReward(reward);
    setNewReward(reward);
    setIsDialogOpen(true);
  };

  const handleNewRewardClick = () => {
    setCurrentReward(null);
    setNewReward({
      name: '',
      description: '',
      type: 'badge',
      criteria: {},
      active: true,
      local_resgate: '',
      instrucoes_resgate: '',
    });
    setIsDialogOpen(true);
  };

  const handleAssignReward = async (rewardId: string) => {
    const userId = prompt("Digite o ID do usuário para atribuir esta recompensa:");
    if (!userId) return;

    setLoading(true);
    try {
      await rewardService.assignRewardToUser(rewardId, userId);
      toast({
        title: "Sucesso!",
        description: `Recompensa atribuída ao usuário ${userId}.`,
      });
    } catch (error) {
      console.error('Erro ao atribuir recompensa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atribuir a recompensa. Verifique o ID do usuário.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Gerenciamento de Recompensas</CardTitle>
          <Button onClick={handleNewRewardClick}>Criar Nova Recompensa</Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando recompensas...</div>
          ) : rewards.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma recompensa cadastrada. Crie a primeira!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rewards.map((reward) => (
                <Card key={reward.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2"><Award size={20} />{reward.name}</CardTitle>
                      <Badge variant={reward.active ? 'default' : 'outline'}>{reward.active ? 'Ativa' : 'Inativa'}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 capitalize">Tipo: {reward.type}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 text-sm mb-2">{reward.description}</p>
                    {reward.local_resgate && (
                      <p className="text-sm text-gray-600"><span className="font-semibold">Local de Resgate:</span> {reward.local_resgate}</p>
                    )}
                    {reward.instrucoes_resgate && (
                      <p className="text-sm text-gray-600"><span className="font-semibold">Instruções:</span> {reward.instrucoes_resgate}</p>
                    )}
                    <Separator className="my-2" />
                    <h4 className="font-semibold text-sm mb-1">Critérios:</h4>
                    <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">{JSON.stringify(reward.criteria, null, 2)}</pre>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button size="sm" variant="secondary" onClick={() => handleEditClick(reward)}>Editar</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteReward(reward.id!)}>Excluir</Button>
                      <Button size="sm" variant="outline" onClick={() => handleAssignReward(reward.id!)} className="flex items-center gap-1">
                        <User size={14} /> Atribuir Manualmente
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentReward ? 'Editar Recompensa' : 'Criar Nova Recompensa'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Nome</Label>
              <Input
                id="name"
                value={newReward.name}
                onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Descrição</Label>
              <Textarea
                id="description"
                value={newReward.description}
                onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">Tipo</Label>
              <Select value={newReward.type} onValueChange={(value) => setNewReward({ ...newReward, type: value as Reward['type'] })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="badge">Emblema</SelectItem>
                  <SelectItem value="discount">Desconto</SelectItem>
                  <SelectItem value="gift">Brinde</SelectItem>
                  <SelectItem value="experience">Experiência</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="local_resgate" className="text-right">Local de Resgate</Label>
              <Input
                id="local_resgate"
                value={newReward.local_resgate}
                onChange={(e) => setNewReward({ ...newReward, local_resgate: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="instrucoes_resgate" className="text-right">Instruções de Resgate</Label>
              <Textarea
                id="instrucoes_resgate"
                value={newReward.instrucoes_resgate}
                onChange={(e) => setNewReward({ ...newReward, instrucoes_resgate: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="criteria" className="text-right">Critérios (JSON)</Label>
              <Textarea
                id="criteria"
                value={JSON.stringify(newReward.criteria, null, 2)}
                onChange={(e) => {
                  try {
                    setNewReward({ ...newReward, criteria: JSON.parse(e.target.value) });
                  } catch (error) {
                    toast({
                      title: "Erro de JSON",
                      description: "Formato JSON inválido para os critérios.",
                      variant: "destructive",
                    });
                  }
                }}
                className="col-span-3 font-mono text-xs"
                rows={4}
              />
            </div>
            <div className="flex items-center space-x-2 col-span-4 justify-end">
              <Label htmlFor="active">Ativa</Label>
              <Switch
                id="active"
                checked={newReward.active}
                onCheckedChange={(checked) => setNewReward({ ...newReward, active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSaveReward} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Recompensa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RewardsManager; 