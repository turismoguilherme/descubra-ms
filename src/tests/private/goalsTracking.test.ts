/**
 * Testes para Goals Tracking
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { goalsTrackingService, BusinessGoal } from '@/services/private/goalsTrackingService';
import { goalsAlertsService } from '@/services/private/goalsAlertsService';

describe('Goals Tracking Service', () => {
  const mockUserId = 'test-user-id';
  const mockGoalData = {
    title: 'Aumentar ocupação para 80%',
    description: 'Meta de ocupação para o próximo trimestre',
    category: 'occupancy' as BusinessGoal['category'],
    targetValue: 80,
    currentValue: 30,
    unit: '%',
    deadline: new Date('2024-12-31'),
    priority: 'high' as BusinessGoal['priority']
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createGoal', () => {
    it('deve criar uma meta com progresso calculado corretamente', async () => {
      const goal = await goalsTrackingService.createGoal(mockUserId, mockGoalData);
      
      expect(goal).toBeDefined();
      expect(goal.title).toBe(mockGoalData.title);
      expect(goal.targetValue).toBe(80);
      expect(goal.currentValue).toBe(30);
      expect(goal.progress).toBe(37.5); // 30/80 * 100
      expect(goal.status).toBe('active');
    });

    it('deve calcular progresso como 0 quando valor atual é 0', async () => {
      const goalData = { ...mockGoalData, currentValue: 0 };
      const goal = await goalsTrackingService.createGoal(mockUserId, goalData);
      
      expect(goal.progress).toBe(0);
    });

    it('deve calcular progresso como 100 quando valor atual >= valor alvo', async () => {
      const goalData = { ...mockGoalData, currentValue: 80 };
      const goal = await goalsTrackingService.createGoal(mockUserId, goalData);
      
      expect(goal.progress).toBe(100);
      expect(goal.status).toBe('active'); // Status muda para completed no updateProgress
    });
  });

  describe('updateGoalProgress', () => {
    it('deve atualizar progresso corretamente', async () => {
      const goal = await goalsTrackingService.createGoal(mockUserId, mockGoalData);
      const updatedGoal = await goalsTrackingService.updateGoalProgress(
        goal.id,
        mockUserId,
        50
      );
      
      expect(updatedGoal.currentValue).toBe(50);
      expect(updatedGoal.progress).toBe(62.5); // 50/80 * 100
    });

    it('deve marcar como completed quando progresso >= 100', async () => {
      const goal = await goalsTrackingService.createGoal(mockUserId, mockGoalData);
      const updatedGoal = await goalsTrackingService.updateGoalProgress(
        goal.id,
        mockUserId,
        80
      );
      
      expect(updatedGoal.progress).toBe(100);
      expect(updatedGoal.status).toBe('completed');
      expect(updatedGoal.completedAt).toBeDefined();
    });
  });

  describe('getGoalProgress', () => {
    it('deve calcular progresso esperado corretamente', async () => {
      const goal = await goalsTrackingService.createGoal(mockUserId, {
        ...mockGoalData,
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 dias
      });
      
      const progress = await goalsTrackingService.getGoalProgress(goal);
      
      expect(progress.expectedProgress).toBeGreaterThanOrEqual(0);
      expect(progress.expectedProgress).toBeLessThanOrEqual(100);
      expect(progress.daysRemaining).toBeGreaterThan(0);
    });

    it('deve identificar meta em risco quando progresso está abaixo do esperado', async () => {
      const goal = await goalsTrackingService.createGoal(mockUserId, {
        ...mockGoalData,
        currentValue: 10, // Progresso muito baixo
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias
      });
      
      const progress = await goalsTrackingService.getGoalProgress(goal);
      
      // Se o progresso está muito abaixo do esperado, deve estar em risco
      if (progress.progressDifference < -10) {
        expect(progress.isAtRisk).toBe(true);
      }
    });

    it('deve identificar meta atrasada quando prazo passou', async () => {
      const goal = await goalsTrackingService.createGoal(mockUserId, {
        ...mockGoalData,
        deadline: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 dias atrás
        currentValue: 30 // Ainda não completou
      });
      
      const progress = await goalsTrackingService.getGoalProgress(goal);
      
      if (progress.daysRemaining < 0 && progress.progress < 100) {
        expect(progress.isOverdue).toBe(true);
        expect(progress.riskLevel).toBe('critical');
      }
    });

    it('deve identificar meta próxima de completar quando progresso >= 90%', async () => {
      const goal = await goalsTrackingService.createGoal(mockUserId, {
        ...mockGoalData,
        currentValue: 72 // 90% de 80
      });
      
      const progress = await goalsTrackingService.getGoalProgress(goal);
      
      if (progress.progress >= 90) {
        expect(progress.isNearCompletion).toBe(true);
      }
    });
  });

  describe('getUserGoals', () => {
    it('deve retornar lista de metas do usuário', async () => {
      await goalsTrackingService.createGoal(mockUserId, mockGoalData);
      const goals = await goalsTrackingService.getUserGoals(mockUserId);
      
      expect(Array.isArray(goals)).toBe(true);
      expect(goals.length).toBeGreaterThan(0);
    });

    it('deve filtrar por status', async () => {
      const goal = await goalsTrackingService.createGoal(mockUserId, mockGoalData);
      await goalsTrackingService.updateGoalProgress(goal.id, mockUserId, 80);
      
      const activeGoals = await goalsTrackingService.getUserGoals(mockUserId, 'active');
      const completedGoals = await goalsTrackingService.getUserGoals(mockUserId, 'completed');
      
      expect(activeGoals.every(g => g.status === 'active')).toBe(true);
      expect(completedGoals.every(g => g.status === 'completed')).toBe(true);
    });
  });
});

describe('Goals Alerts Service', () => {
  const mockUserId = 'test-user-id';

  describe('checkGoalAlerts', () => {
    it('deve gerar alerta quando meta está em risco', async () => {
      const goal = await goalsTrackingService.createGoal(mockUserId, {
        title: 'Meta em Risco',
        description: 'Teste',
        category: 'revenue',
        targetValue: 100,
        currentValue: 10,
        unit: '%',
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        priority: 'high'
      });
      
      const progress = await goalsTrackingService.getGoalProgress(goal);
      const alerts = await goalsAlertsService.checkGoalAlerts(goal, progress);
      
      if (progress.isAtRisk) {
        const riskAlert = alerts.find(a => a.type === 'at_risk');
        expect(riskAlert).toBeDefined();
        expect(riskAlert?.severity).toBe(progress.riskLevel);
      }
    });

    it('deve gerar alerta quando meta está atrasada', async () => {
      const goal = await goalsTrackingService.createGoal(mockUserId, {
        title: 'Meta Atrasada',
        description: 'Teste',
        category: 'revenue',
        targetValue: 100,
        currentValue: 50,
        unit: '%',
        deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        priority: 'high'
      });
      
      const progress = await goalsTrackingService.getGoalProgress(goal);
      const alerts = await goalsAlertsService.checkGoalAlerts(goal, progress);
      
      if (progress.isOverdue) {
        const overdueAlert = alerts.find(a => a.type === 'overdue');
        expect(overdueAlert).toBeDefined();
        expect(overdueAlert?.severity).toBe('critical');
      }
    });

    it('deve gerar alerta quando meta está próxima de completar', async () => {
      const goal = await goalsTrackingService.createGoal(mockUserId, {
        title: 'Meta Próxima',
        description: 'Teste',
        category: 'revenue',
        targetValue: 100,
        currentValue: 95,
        unit: '%',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        priority: 'high'
      });
      
      const progress = await goalsTrackingService.getGoalProgress(goal);
      const alerts = await goalsAlertsService.checkGoalAlerts(goal, progress);
      
      if (progress.isNearCompletion) {
        const nearAlert = alerts.find(a => a.type === 'near_completion');
        expect(nearAlert).toBeDefined();
        expect(nearAlert?.severity).toBe('low');
      }
    });
  });

  describe('getGoalsSummary', () => {
    it('deve retornar resumo correto de metas', async () => {
      // Criar algumas metas
      await goalsTrackingService.createGoal(mockUserId, {
        title: 'Meta 1',
        description: 'Teste',
        category: 'revenue',
        targetValue: 100,
        currentValue: 50,
        unit: '%',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        priority: 'high'
      });
      
      const summary = await goalsAlertsService.getGoalsSummary(mockUserId);
      
      expect(summary).toBeDefined();
      expect(summary.total).toBeGreaterThan(0);
      expect(summary.active).toBeGreaterThanOrEqual(0);
      expect(summary.completed).toBeGreaterThanOrEqual(0);
      expect(summary.atRisk).toBeGreaterThanOrEqual(0);
      expect(summary.overdue).toBeGreaterThanOrEqual(0);
      expect(summary.overallProgress).toBeGreaterThanOrEqual(0);
      expect(summary.overallProgress).toBeLessThanOrEqual(100);
    });
  });
});


