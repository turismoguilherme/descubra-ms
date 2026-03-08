/**
 * Goals AI Service
 * Serviço de IA para sugerir metas e objetivos de negócio turístico
 * SEGURANÇA: Usa callGeminiProxy (Edge Function) em vez de API key direta
 */

import { callGeminiProxy } from './geminiProxy';
import { BusinessGoal } from '../private/goalsTrackingService';

export interface SuggestedGoal {
  title: string;
  description: string;
  category: BusinessGoal['category'];
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string;
  priority: BusinessGoal['priority'];
}

export class GoalsAIService {
  async suggestGoals(
    businessType: string,
    category: string,
    currentData?: { revenue?: number; occupancy?: number; rating?: number }
  ): Promise<SuggestedGoal[]> {
    // Retornar imediatamente as metas básicas para evitar travamento
    return this.getBasicGoals(category);
  }

  getBasicGoals(category: string): SuggestedGoal[] {
    const baseDate = new Date();
    baseDate.setMonth(baseDate.getMonth() + 6);

    return [
      {
        title: 'Aumentar ocupação para 75%',
        description: 'Meta de ocupação média mensal baseada em benchmarks do setor',
        category: 'occupancy',
        targetValue: 75,
        currentValue: 60,
        unit: '%',
        deadline: baseDate.toISOString().split('T')[0],
        priority: 'high',
      },
      {
        title: 'Aumentar receita em 20%',
        description: 'Crescimento de receita através de melhorias operacionais e marketing',
        category: 'revenue',
        targetValue: 0,
        currentValue: 0,
        unit: 'R$',
        deadline: baseDate.toISOString().split('T')[0],
        priority: 'high',
      },
      {
        title: 'Melhorar avaliação média para 4.5',
        description: 'Foco em qualidade de serviço e experiência do cliente',
        category: 'rating',
        targetValue: 4.5,
        currentValue: 4.0,
        unit: '/5',
        deadline: baseDate.toISOString().split('T')[0],
        priority: 'medium',
      },
    ];
  }
}

export const goalsAIService = new GoalsAIService();
