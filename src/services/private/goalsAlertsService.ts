/**
 * Goals Alerts Service
 * Gerencia alertas e notificações para metas
 */

import { BusinessGoal, GoalProgress, goalsTrackingService } from './goalsTrackingService';

export interface GoalAlert {
  id: string;
  goalId: string;
  type: 'at_risk' | 'overdue' | 'near_completion' | 'completed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  recommendation?: string;
  createdAt: Date;
}

export interface GoalsSummary {
  total: number;
  active: number;
  completed: number;
  atRisk: number;
  overdue: number;
  nearCompletion: number;
  onTrack: number;
  overallProgress: number;
}

export class GoalsAlertsService {
  /**
   * Verificar alertas para uma meta
   */
  async checkGoalAlerts(goal: BusinessGoal, progress: GoalProgress): Promise<GoalAlert[]> {
    const alerts: GoalAlert[] = [];

    // Meta em risco
    if (progress.isAtRisk) {
      alerts.push({
        id: `risk-${goal.id}`,
        goalId: goal.id,
        type: 'at_risk',
        severity: progress.riskLevel,
        message: this.getAtRiskMessage(goal, progress),
        recommendation: this.getAtRiskRecommendation(goal, progress),
        createdAt: new Date()
      });
    }

    // Meta atrasada
    if (progress.isOverdue) {
      alerts.push({
        id: `overdue-${goal.id}`,
        goalId: goal.id,
        type: 'overdue',
        severity: 'critical',
        message: this.getOverdueMessage(goal, progress),
        recommendation: this.getOverdueRecommendation(goal, progress),
        createdAt: new Date()
      });
    }

    // Meta próxima de ser atingida
    if (progress.isNearCompletion) {
      alerts.push({
        id: `near-${goal.id}`,
        goalId: goal.id,
        type: 'near_completion',
        severity: 'low',
        message: this.getNearCompletionMessage(goal, progress),
        recommendation: this.getNearCompletionRecommendation(goal, progress),
        createdAt: new Date()
      });
    }

    // Meta completada
    if (goal.progress >= 100 && goal.status === 'active') {
      alerts.push({
        id: `completed-${goal.id}`,
        goalId: goal.id,
        type: 'completed',
        severity: 'low',
        message: this.getCompletedMessage(goal),
        recommendation: this.getCompletedRecommendation(goal),
        createdAt: new Date()
      });
    }

    return alerts;
  }

  /**
   * Verificar alertas para todas as metas ativas
   */
  async checkAllGoalsAlerts(userId: string): Promise<GoalAlert[]> {
    try {
      const goals = await goalsTrackingService.getUserGoals(userId, 'active');
      const allAlerts: GoalAlert[] = [];

      for (const goal of goals) {
        const progress = await goalsTrackingService.getGoalProgress(goal);
        const alerts = await this.checkGoalAlerts(goal, progress);
        allAlerts.push(...alerts);
      }

      return allAlerts.sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      });
    } catch (error) {
      console.error('Erro ao verificar alertas de metas:', error);
      return [];
    }
  }

  /**
   * Obter resumo de metas
   */
  async getGoalsSummary(userId: string): Promise<GoalsSummary> {
    try {
      const allGoals = await goalsTrackingService.getUserGoals(userId);
      const activeGoals = allGoals.filter(g => g.status === 'active');
      const completedGoals = allGoals.filter(g => g.status === 'completed');

      let atRisk = 0;
      let overdue = 0;
      let nearCompletion = 0;
      let onTrack = 0;
      let totalProgress = 0;

      for (const goal of activeGoals) {
        const progress = await goalsTrackingService.getGoalProgress(goal);
        
        if (progress.isAtRisk) atRisk++;
        if (progress.isOverdue) overdue++;
        if (progress.isNearCompletion) nearCompletion++;
        if (progress.onTrack) onTrack++;
        
        totalProgress += goal.progress;
      }

      const overallProgress = activeGoals.length > 0 
        ? Math.round(totalProgress / activeGoals.length)
        : 0;

      return {
        total: allGoals.length,
        active: activeGoals.length,
        completed: completedGoals.length,
        atRisk,
        overdue,
        nearCompletion,
        onTrack,
        overallProgress
      };
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      // Se a tabela não existir (código 42P01), não logar erro (esperado em dev)
      if (err?.code !== '42P01') {
        const errMsg = err?.message || (error instanceof Error ? error.message : String(error));
        console.error('Erro ao obter resumo de metas:', errMsg);
      }
      return {
        total: 0,
        active: 0,
        completed: 0,
        atRisk: 0,
        overdue: 0,
        nearCompletion: 0,
        onTrack: 0,
        overallProgress: 0
      };
    }
  }

  /**
   * Mensagens de alerta
   */
  private getAtRiskMessage(goal: BusinessGoal, progress: GoalProgress): string {
    const daysText = progress.daysRemaining === 1 ? 'dia' : 'dias';
    return `Meta "${goal.title}" está em risco. Progresso atual: ${progress.progress.toFixed(1)}%, esperado: ${progress.expectedProgress.toFixed(1)}%. Faltam ${progress.daysRemaining} ${daysText}.`;
  }

  private getOverdueMessage(goal: BusinessGoal, progress: GoalProgress): string {
    const daysOverdue = Math.abs(progress.daysRemaining);
    const daysText = daysOverdue === 1 ? 'dia' : 'dias';
    return `Meta "${goal.title}" está atrasada há ${daysOverdue} ${daysText}. Progresso atual: ${progress.progress.toFixed(1)}%.`;
  }

  private getNearCompletionMessage(goal: BusinessGoal, progress: GoalProgress): string {
    return `Meta "${goal.title}" está ${progress.progress.toFixed(1)}% completa! Continue assim para atingir a meta.`;
  }

  private getCompletedMessage(goal: BusinessGoal): string {
    return `🎉 Parabéns! Meta "${goal.title}" foi atingida!`;
  }

  /**
   * Recomendações
   */
  private getAtRiskRecommendation(goal: BusinessGoal, progress: GoalProgress): string {
    const categoryRecommendations: Record<BusinessGoal['category'], string> = {
      occupancy: 'Considere otimizar preços ou investir em campanhas de marketing para aumentar a ocupação.',
      revenue: 'Revise estratégias de precificação e explore novas oportunidades de receita.',
      rating: 'Foque em melhorar a experiência do cliente e solicite avaliações positivas.',
      growth: 'Analise barreiras ao crescimento e ajuste sua estratégia de expansão.',
      marketing: 'Aumente o investimento em marketing ou otimize campanhas existentes.',
      operations: 'Identifique gargalos operacionais e implemente melhorias de eficiência.'
    };

    return categoryRecommendations[goal.category] || 'Revise sua estratégia e ajuste as ações para atingir a meta.';
  }

  private getOverdueRecommendation(goal: BusinessGoal, progress: GoalProgress): string {
    if (progress.progress >= 80) {
      return 'Você está muito próximo! Considere estender o prazo ou ajustar a meta ligeiramente.';
    } else if (progress.progress >= 50) {
      return 'Ainda há tempo para recuperar. Revise sua estratégia e intensifique os esforços.';
    } else {
      return 'A meta pode estar muito ambiciosa. Considere ajustar o prazo ou o valor da meta.';
    }
  }

  private getNearCompletionRecommendation(goal: BusinessGoal, progress: GoalProgress): string {
    return 'Continue com as ações atuais. Considere definir uma nova meta mais desafiadora após completar esta.';
  }

  private getCompletedRecommendation(goal: BusinessGoal): string {
    return 'Excelente trabalho! Considere definir uma nova meta para continuar crescendo.';
  }
}

export const goalsAlertsService = new GoalsAlertsService();

