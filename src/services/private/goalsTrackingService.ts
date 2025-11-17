/**
 * Goals Tracking Service
 * Gerencia metas e acompanhamento de objetivos do negócio
 */

import { supabase } from '@/integrations/supabase/client';

export interface BusinessGoal {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: 'revenue' | 'occupancy' | 'rating' | 'growth' | 'marketing' | 'operations';
  targetValue: number;
  currentValue: number;
  unit: string; // '%', 'R$', 'dias', etc.
  deadline: Date;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  progress: number; // 0-100
}

export interface GoalProgress {
  goal: BusinessGoal;
  progress: number;
  daysRemaining: number;
  onTrack: boolean;
  estimatedCompletion?: Date;
}

export class GoalsTrackingService {
  /**
   * Criar nova meta
   */
  async createGoal(
    userId: string,
    goalData: Omit<BusinessGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'progress' | 'status'>
  ): Promise<BusinessGoal> {
    try {
      const progress = this.calculateProgress(goalData.currentValue, goalData.targetValue);

      const { data, error } = await supabase
        .from('business_goals')
        .insert({
          user_id: userId,
          title: goalData.title,
          description: goalData.description,
          category: goalData.category,
          target_value: goalData.targetValue,
          current_value: goalData.currentValue,
          unit: goalData.unit,
          deadline: goalData.deadline.toISOString(),
          status: 'active',
          priority: goalData.priority,
          progress: progress
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapToGoal(data);
    } catch (error) {
      console.error('Erro ao criar meta:', error);
      throw error;
    }
  }

  /**
   * Buscar metas do usuário
   */
  async getUserGoals(userId: string, status?: BusinessGoal['status']): Promise<BusinessGoal[]> {
    try {
      let query = supabase
        .from('business_goals')
        .select('*')
        .eq('user_id', userId)
        .order('priority', { ascending: false })
        .order('deadline', { ascending: true });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []).map(item => this.mapToGoal(item));
    } catch (error) {
      console.error('Erro ao buscar metas:', error);
      return [];
    }
  }

  /**
   * Atualizar progresso de uma meta
   */
  async updateGoalProgress(
    goalId: string,
    userId: string,
    currentValue: number
  ): Promise<BusinessGoal> {
    try {
      // Buscar meta atual
      const { data: goalData, error: fetchError } = await supabase
        .from('business_goals')
        .select('*')
        .eq('id', goalId)
        .eq('user_id', userId)
        .single();

      if (fetchError || !goalData) {
        throw new Error('Meta não encontrada');
      }

      const progress = this.calculateProgress(currentValue, goalData.target_value);
      const status = progress >= 100 ? 'completed' : goalData.status;

      const { data, error } = await supabase
        .from('business_goals')
        .update({
          current_value: currentValue,
          progress: progress,
          status: status,
          completed_at: progress >= 100 ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapToGoal(data);
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
      throw error;
    }
  }

  /**
   * Obter progresso detalhado de uma meta
   */
  async getGoalProgress(goal: BusinessGoal): Promise<GoalProgress> {
    const now = new Date();
    const deadline = new Date(goal.deadline);
    const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Calcular se está no caminho certo
    const daysSinceCreation = Math.ceil((now.getTime() - goal.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    const totalDays = Math.ceil((deadline.getTime() - goal.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    const expectedProgress = totalDays > 0 ? (daysSinceCreation / totalDays) * 100 : 0;
    const onTrack = goal.progress >= expectedProgress - 10; // Margem de 10%

    // Estimar data de conclusão
    let estimatedCompletion: Date | undefined;
    if (goal.progress > 0 && goal.progress < 100) {
      const progressPerDay = goal.progress / daysSinceCreation;
      if (progressPerDay > 0) {
        const daysToComplete = (100 - goal.progress) / progressPerDay;
        estimatedCompletion = new Date(now.getTime() + daysToComplete * 24 * 60 * 60 * 1000);
      }
    }

    return {
      goal,
      progress: goal.progress,
      daysRemaining: Math.max(0, daysRemaining),
      onTrack,
      estimatedCompletion
    };
  }

  /**
   * Calcular progresso (0-100)
   */
  private calculateProgress(current: number, target: number): number {
    if (target === 0) return 0;
    const progress = (current / target) * 100;
    return Math.min(100, Math.max(0, Math.round(progress * 10) / 10));
  }

  /**
   * Mapear dados do banco para interface
   */
  private mapToGoal(data: any): BusinessGoal {
    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      description: data.description,
      category: data.category,
      targetValue: data.target_value,
      currentValue: data.current_value,
      unit: data.unit,
      deadline: new Date(data.deadline),
      status: data.status,
      priority: data.priority,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      progress: data.progress || 0
    };
  }

  /**
   * Deletar meta
   */
  async deleteGoal(goalId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('business_goals')
        .delete()
        .eq('id', goalId)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Erro ao deletar meta:', error);
      throw error;
    }
  }
}

export const goalsTrackingService = new GoalsTrackingService();

