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
  Calendar,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import { goalsTrackingService, BusinessGoal, GoalProgress } from '@/services/private/goalsTrackingService';
import { goalsAlertsService, GoalsSummary } from '@/services/private/goalsAlertsService';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const GoalsTracking: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState<BusinessGoal[]>([]);
  const [goalProgress, setGoalProgress] = useState<Map<string, GoalProgress>>(new Map());
  const [summary, setSummary] = useState<GoalsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<BusinessGoal | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
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

      // Carregar resumo
      const goalsSummary = await goalsAlertsService.getGoalsSummary(user.id);
      setSummary(goalsSummary);
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
            <Button 
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs px-3 py-1"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Botão Nova Meta clicado');
                setIsDialogOpen(true);
              }}
            >
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
              <Button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Botão Criar Meta clicado', newGoal);
                  handleCreateGoal();
                }} 
                className="bg-blue-600 hover:bg-blue-700"
              >
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
        <div className="space-y-6">
          {/* Dashboard de Resumo */}
          {summary && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <CardBox>
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-slate-600">Total</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-800">{summary.total}</div>
                  <p className="text-xs text-slate-500 mt-1">{summary.active} ativas</p>
                </CardBox>
                <CardBox>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-slate-600">Concluídas</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-800">{summary.completed}</div>
                  <p className="text-xs text-slate-500 mt-1">{summary.onTrack} no caminho certo</p>
                </CardBox>
                <CardBox>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium text-slate-600">Em Risco</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-800">{summary.atRisk}</div>
                  <p className="text-xs text-slate-500 mt-1">{summary.overdue} atrasadas</p>
                </CardBox>
                <CardBox>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-slate-600">Progresso Geral</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-800">{summary.overallProgress}%</div>
                  <Progress value={summary.overallProgress} className="h-2 mt-2" />
                </CardBox>
              </div>

              {/* Gráficos de Visualização */}
              {goals.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  {/* Gráfico de Progresso por Meta */}
                  <CardBox>
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-slate-800">Progresso das Metas</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={goals.map(goal => ({
                        name: goal.title.length > 15 ? goal.title.substring(0, 15) + '...' : goal.title,
                        progresso: goal.progress,
                        esperado: 100
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="progresso" fill="#3b82f6" name="Progresso Atual" />
                        <Bar dataKey="esperado" fill="#e5e7eb" name="Meta (100%)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardBox>

                  {/* Gráfico de Distribuição por Categoria */}
                  <CardBox>
                    <div className="flex items-center gap-2 mb-4">
                      <PieChartIcon className="h-5 w-5 text-purple-600" />
                      <h3 className="font-semibold text-slate-800">Metas por Categoria</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={Object.entries(
                            goals.reduce((acc, goal) => {
                              acc[goal.category] = (acc[goal.category] || 0) + 1;
                              return acc;
                            }, {} as Record<string, number>)
                          ).map(([name, value]) => ({
                            name: getCategoryLabel(name as BusinessGoal['category']),
                            value
                          }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {Object.entries(
                            goals.reduce((acc, goal) => {
                              acc[goal.category] = (acc[goal.category] || 0) + 1;
                              return acc;
                            }, {} as Record<string, number>)
                          ).map((_, index) => (
                            <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][index % 6]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardBox>
                </div>
              )}
            </>
          )}

          {/* Lista de Metas */}
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
                    {progress.isOverdue && (
                      <div className="flex items-center gap-2 p-2 bg-red-50 rounded border border-red-200">
                        <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                        <p className="text-xs text-red-700">
                          Meta atrasada! Ajuste o prazo ou intensifique os esforços.
                        </p>
                      </div>
                    )}
                    {progress.isAtRisk && !progress.isOverdue && (
                      <div className={`flex items-center gap-2 p-2 rounded border ${
                        progress.riskLevel === 'high' || progress.riskLevel === 'critical'
                          ? 'bg-red-50 border-red-200'
                          : 'bg-amber-50 border-amber-200'
                      }`}>
                        <AlertCircle className={`h-4 w-4 flex-shrink-0 ${
                          progress.riskLevel === 'high' || progress.riskLevel === 'critical'
                            ? 'text-red-600'
                            : 'text-amber-600'
                        }`} />
                        <p className={`text-xs ${
                          progress.riskLevel === 'high' || progress.riskLevel === 'critical'
                            ? 'text-red-700'
                            : 'text-amber-700'
                        }`}>
                          Meta em risco ({progress.riskLevel === 'high' ? 'Alto' : progress.riskLevel === 'critical' ? 'Crítico' : 'Médio'}). Progresso: {progress.progress.toFixed(1)}% vs. Esperado: {progress.expectedProgress.toFixed(1)}%
                        </p>
                      </div>
                    )}
                    {progress.isNearCompletion && (
                      <div className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <p className="text-xs text-green-700">
                          Quase lá! Meta {progress.progress.toFixed(1)}% completa.
                        </p>
                      </div>
                    )}
                    {progress.onTrack && !progress.isNearCompletion && progress.daysRemaining > 0 && (
                      <div className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200">
                        <TrendingUp className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <p className="text-xs text-green-700">
                          Meta no caminho certo! Continue assim.
                        </p>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedGoal(goal);
                        setIsDetailsDialogOpen(true);
                      }}
                      className="w-full mt-2"
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                )}
              </CardBox>
            );
          })}
        </div>
        </div>
      )}

      {/* Dialog de Detalhes da Meta */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedGoal && (() => {
            const progress = goalProgress.get(selectedGoal.id);
            return (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedGoal.title}</DialogTitle>
                  <DialogDescription>
                    {selectedGoal.description || 'Detalhes da meta'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 mt-4">
                  {/* Informações Básicas */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-slate-500">Categoria</Label>
                      <p className="font-medium">{getCategoryLabel(selectedGoal.category)}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">Prioridade</Label>
                      <Badge className={getPriorityColor(selectedGoal.priority)}>
                        {selectedGoal.priority}
                      </Badge>
                    </div>
                  </div>

                  {/* Progresso */}
                  {progress && (
                    <>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium">Progresso</Label>
                          <span className="text-sm font-bold text-blue-600">
                            {progress.progress.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={progress.progress} className="h-3" />
                        <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                          <span>
                            {selectedGoal.currentValue} {selectedGoal.unit} / {selectedGoal.targetValue} {selectedGoal.unit}
                          </span>
                          <span>
                            Esperado: {progress.expectedProgress.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      {/* Tempo */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-slate-500">Prazo</Label>
                          <p className="font-medium">
                            {format(new Date(selectedGoal.deadline), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-slate-500">Dias Restantes</Label>
                          <p className={`font-medium ${progress.daysRemaining < 0 ? 'text-red-600' : ''}`}>
                            {progress.daysRemaining < 0 
                              ? `${Math.abs(progress.daysRemaining)} dias atrasado`
                              : `${progress.daysRemaining} dias`
                            }
                          </p>
                        </div>
                      </div>

                      {/* Estimativa de Conclusão */}
                      {progress.estimatedCompletion && (
                        <div>
                          <Label className="text-xs text-slate-500">Estimativa de Conclusão</Label>
                          <p className="font-medium">
                            {format(progress.estimatedCompletion, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </p>
                        </div>
                      )}

                      {/* Status */}
                      <div>
                        <Label className="text-xs text-slate-500">Status</Label>
                        <div className="mt-2 space-y-2">
                          {progress.isOverdue && (
                            <div className="p-3 bg-red-50 rounded border border-red-200">
                              <p className="text-sm font-medium text-red-900">⚠️ Meta Atrasada</p>
                              <p className="text-xs text-red-700 mt-1">
                                A meta está atrasada. Considere ajustar o prazo ou intensificar os esforços.
                              </p>
                            </div>
                          )}
                          {progress.isAtRisk && !progress.isOverdue && (
                            <div className={`p-3 rounded border ${
                              progress.riskLevel === 'high' || progress.riskLevel === 'critical'
                                ? 'bg-red-50 border-red-200'
                                : 'bg-amber-50 border-amber-200'
                            }`}>
                              <p className={`text-sm font-medium ${
                                progress.riskLevel === 'high' || progress.riskLevel === 'critical'
                                  ? 'text-red-900'
                                  : 'text-amber-900'
                              }`}>
                                ⚠️ Meta em Risco ({progress.riskLevel === 'high' ? 'Alto' : progress.riskLevel === 'critical' ? 'Crítico' : 'Médio'})
                              </p>
                              <p className={`text-xs mt-1 ${
                                progress.riskLevel === 'high' || progress.riskLevel === 'critical'
                                  ? 'text-red-700'
                                  : 'text-amber-700'
                              }`}>
                                Progresso atual está {Math.abs(progress.progressDifference).toFixed(1)}% abaixo do esperado.
                              </p>
                            </div>
                          )}
                          {progress.isNearCompletion && (
                            <div className="p-3 bg-green-50 rounded border border-green-200">
                              <p className="text-sm font-medium text-green-900">🎉 Quase Lá!</p>
                              <p className="text-xs text-green-700 mt-1">
                                Você está muito próximo de atingir esta meta. Continue assim!
                              </p>
                            </div>
                          )}
                          {progress.onTrack && !progress.isNearCompletion && !progress.isAtRisk && (
                            <div className="p-3 bg-green-50 rounded border border-green-200">
                              <p className="text-sm font-medium text-green-900">✅ No Caminho Certo</p>
                              <p className="text-xs text-green-700 mt-1">
                                Sua meta está progredindo conforme esperado. Continue assim!
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                    Fechar
                  </Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </SectionWrapper>
  );
};

export default GoalsTracking;

