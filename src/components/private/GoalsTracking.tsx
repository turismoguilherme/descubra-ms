/**
 * Goals Tracking Component
 * Gerencia metas e acompanhamento de objetivos
 */

import React, { useState, useEffect } from 'react';
import SectionWrapper from '@/components/ui/SectionWrapper';
import CardBox from '@/components/ui/CardBox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Target, 
  Plus, 
  CheckCircle, 
  Clock,
  TrendingUp,
  AlertCircle,
  Edit,
  Trash2,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { goalsTrackingService, BusinessGoal, GoalProgress } from '@/services/private/goalsTrackingService';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

const GoalsTracking: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState<BusinessGoal[]>([]);
  const [goalProgress, setGoalProgress] = useState<Map<string, GoalProgress>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'growth' as BusinessGoal['category'],
    targetValue: 0,
    currentValue: 0,
    unit: '%',
    deadline: '',
    priority: 'medium' as BusinessGoal['priority']
  });

  useEffect(() => {
    if (user?.id) {
      loadGoals();
    }
  }, [user]);

  const loadGoals = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const userGoals = await goalsTrackingService.getUserGoals(user.id, 'active');
      setGoals(userGoals);

      // Calcular progresso de cada meta
      const progressMap = new Map<string, GoalProgress>();
      for (const goal of userGoals) {
        const progress = await goalsTrackingService.getGoalProgress(goal);
        progressMap.set(goal.id, progress);
      }
      setGoalProgress(progressMap);
    } catch (error) {
      console.error('Erro ao carregar metas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as metas',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    if (!user?.id || !newGoal.title || !newGoal.deadline) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive'
      });
      return;
    }

    try {
      await goalsTrackingService.createGoal(user.id, {
        ...newGoal,
        deadline: new Date(newGoal.deadline)
      });

      toast({
        title: 'Sucesso',
        description: 'Meta criada com sucesso'
      });

      setIsDialogOpen(false);
      setNewGoal({
        title: '',
        description: '',
        category: 'growth',
        targetValue: 0,
        currentValue: 0,
        unit: '%',
        deadline: '',
        priority: 'medium'
      });

      await loadGoals();
    } catch (error) {
      console.error('Erro ao criar meta:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a meta',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateProgress = async (goalId: string, currentValue: number) => {
    if (!user?.id) return;

    try {
      await goalsTrackingService.updateGoalProgress(goalId, user.id, currentValue);
      await loadGoals();
      toast({
        title: 'Sucesso',
        description: 'Progresso atualizado'
      });
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o progresso',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!user?.id || !confirm('Tem certeza que deseja excluir esta meta?')) return;

    try {
      await goalsTrackingService.deleteGoal(goalId, user.id);
      await loadGoals();
      toast({
        title: 'Sucesso',
        description: 'Meta excluída com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir meta:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a meta',
        variant: 'destructive'
      });
    }
  };

  const getCategoryLabel = (category: BusinessGoal['category']) => {
    const labels: Record<BusinessGoal['category'], string> = {
      revenue: 'Receita',
      occupancy: 'Ocupação',
      rating: 'Avaliação',
      growth: 'Crescimento',
      marketing: 'Marketing',
      operations: 'Operações'
    };
    return labels[category] || category;
  };

  const getPriorityColor = (priority: BusinessGoal['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-amber-100 text-amber-700';
      case 'low':
        return 'bg-blue-100 text-blue-700';
    }
  };

  if (isLoading) {
    return (
      <SectionWrapper variant="default" title="Metas e Acompanhamento">
        <CardBox>
          <div className="flex items-center justify-center py-8">
            <Clock className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </CardBox>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper
      variant="default"
      title="Metas e Acompanhamento"
      subtitle="Defina e acompanhe seus objetivos de negócio"
      actions={
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs px-3 py-1">
              <Plus className="h-4 w-4 mr-1" />
              Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Meta</DialogTitle>
              <DialogDescription>
                Defina uma nova meta para acompanhar o progresso do seu negócio
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="Ex: Aumentar ocupação para 80%"
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  placeholder="Descrição da meta"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={newGoal.category}
                    onValueChange={(value) => setNewGoal({ ...newGoal, category: value as BusinessGoal['category'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revenue">Receita</SelectItem>
                      <SelectItem value="occupancy">Ocupação</SelectItem>
                      <SelectItem value="rating">Avaliação</SelectItem>
                      <SelectItem value="growth">Crescimento</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="operations">Operações</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select
                    value={newGoal.priority}
                    onValueChange={(value) => setNewGoal({ ...newGoal, priority: value as BusinessGoal['priority'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="currentValue">Valor Atual</Label>
                  <Input
                    id="currentValue"
                    type="number"
                    value={newGoal.currentValue}
                    onChange={(e) => setNewGoal({ ...newGoal, currentValue: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="targetValue">Meta</Label>
                  <Input
                    id="targetValue"
                    type="number"
                    value={newGoal.targetValue}
                    onChange={(e) => setNewGoal({ ...newGoal, targetValue: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="unit">Unidade</Label>
                  <Input
                    id="unit"
                    value={newGoal.unit}
                    onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                    placeholder="%, R$, dias"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="deadline">Prazo *</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateGoal} className="bg-blue-600 hover:bg-blue-700">
                Criar Meta
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      {goals.length === 0 ? (
        <CardBox>
          <div className="text-center py-8">
            <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2 font-medium">
              Nenhuma meta definida
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Crie metas para acompanhar o progresso do seu negócio.
            </p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-1" />
              Criar Primeira Meta
            </Button>
          </div>
        </CardBox>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const progress = goalProgress.get(goal.id);
            return (
              <CardBox key={goal.id}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="h-4 w-4 text-blue-600" />
                      <h3 className="font-semibold text-slate-800">{goal.title}</h3>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="rounded-full text-xs px-2 py-0.5">
                        {getCategoryLabel(goal.category)}
                      </Badge>
                      <Badge className={`rounded-full text-xs px-2 py-0.5 ${getPriorityColor(goal.priority)}`}>
                        {goal.priority}
                      </Badge>
                      {goal.status === 'completed' && (
                        <Badge className="rounded-full text-xs px-2 py-0.5 bg-green-100 text-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Concluída
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {goal.description && (
                  <p className="text-sm text-slate-600 mb-4">{goal.description}</p>
                )}

                {/* Progresso */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">
                      {goal.currentValue} {goal.unit} / {goal.targetValue} {goal.unit}
                    </span>
                    <span className="text-sm font-bold text-blue-600">{goal.progress}%</span>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                </div>

                {/* Informações adicionais */}
                {progress && (
                  <div className="space-y-2 pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}
                      </span>
                      <span>
                        {progress.daysRemaining} dias restantes
                      </span>
                    </div>
                    {!progress.onTrack && progress.daysRemaining > 0 && (
                      <div className="flex items-center gap-2 p-2 bg-amber-50 rounded border border-amber-200">
                        <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                        <p className="text-xs text-amber-700">
                          Meta pode não ser alcançada no prazo. Considere ajustar estratégia.
                        </p>
                      </div>
                    )}
                    {progress.onTrack && progress.daysRemaining > 0 && (
                      <div className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200">
                        <TrendingUp className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <p className="text-xs text-green-700">
                          Meta no caminho certo! Continue assim.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardBox>
            );
          })}
        </div>
      )}
    </SectionWrapper>
  );
};

export default GoalsTracking;

