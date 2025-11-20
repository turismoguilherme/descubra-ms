/**
 * Testes para Diagnostic Service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { analyzeBusinessProfile, generateRecommendations } from '@/services/diagnostic/analysisService';
import { QuestionnaireAnswers } from '@/types/diagnostic';

describe('Diagnostic Analysis Service', () => {
  const mockAnswers: QuestionnaireAnswers = {
    business_name: 'Hotel Teste',
    business_type: 'hotel',
    city: 'Campo Grande',
    state: 'MS',
    years_in_operation: '5-10',
    number_of_employees: '10-20',
    monthly_revenue: '50000-100000',
    occupancy_rate: 'ate_30',
    current_challenges: ['ocupacao', 'precos'],
    goals: ['aumentar_receita', 'melhorar_ocupacao'],
    technology_usage: ['reservas_online', 'redes_sociais'],
    marketing_channels: ['google', 'facebook'],
    customer_feedback: 'positivo',
    budget: 'medium',
    timeline: '3-6_meses'
  };

  describe('analyzeBusinessProfile', () => {
    it('deve analisar perfil do negócio corretamente', async () => {
      const result = await analyzeBusinessProfile(mockAnswers);
      
      expect(result).toBeDefined();
      expect(result.businessProfile).toBeDefined();
      expect(result.businessProfile.strengths).toBeInstanceOf(Array);
      expect(result.businessProfile.weaknesses).toBeInstanceOf(Array);
      expect(result.businessProfile.opportunities).toBeInstanceOf(Array);
      expect(result.businessProfile.threats).toBeInstanceOf(Array);
      expect(result.businessProfile.potentialGrowth).toBeGreaterThanOrEqual(0);
      expect(result.businessProfile.potentialGrowth).toBeLessThanOrEqual(100);
    });

    it('deve gerar recomendações baseadas nos desafios', async () => {
      const result = await analyzeBusinessProfile(mockAnswers);
      
      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.recommendations.length).toBeGreaterThan(0);
      
      // Deve ter recomendação de Revenue Optimizer se desafio é ocupação
      if (mockAnswers.current_challenges.includes('ocupacao')) {
        const revenueRec = result.recommendations.find(r => r.id === 'revenue-optimizer');
        expect(revenueRec).toBeDefined();
      }
    });

    it('deve calcular score geral', async () => {
      const result = await analyzeBusinessProfile(mockAnswers);
      
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
    });

    it('deve criar plano de implementação em fases', async () => {
      const result = await analyzeBusinessProfile(mockAnswers);
      
      expect(result.implementationPlan).toBeDefined();
      expect(result.implementationPlan.phase1).toBeInstanceOf(Array);
      expect(result.implementationPlan.phase2).toBeInstanceOf(Array);
      expect(result.implementationPlan.phase3).toBeInstanceOf(Array);
    });
  });

  describe('generateRecommendations', () => {
    it('deve gerar recomendações para hotel com baixa ocupação', () => {
      const answers: QuestionnaireAnswers = {
        ...mockAnswers,
        business_type: 'hotel',
        current_challenges: ['ocupacao']
      };
      
      const businessProfile = {
        strengths: [],
        weaknesses: ['Baixa ocupação'],
        opportunities: [],
        threats: [],
        potentialGrowth: 50,
        estimatedRevenue: 0,
        riskLevel: 'medium' as const,
        marketPosition: 'follower' as const
      };
      
      const recommendations = generateRecommendations(answers, businessProfile);
      
      expect(recommendations.length).toBeGreaterThan(0);
      const revenueRec = recommendations.find(r => r.id === 'revenue-optimizer');
      expect(revenueRec).toBeDefined();
    });

    it('deve gerar recomendações para restaurante', () => {
      const answers: QuestionnaireAnswers = {
        ...mockAnswers,
        business_type: 'restaurant',
        current_challenges: ['precos']
      };
      
      const businessProfile = {
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: [],
        potentialGrowth: 50,
        estimatedRevenue: 0,
        riskLevel: 'medium' as const,
        marketPosition: 'follower' as const
      };
      
      const recommendations = generateRecommendations(answers, businessProfile);
      
      expect(recommendations.length).toBeGreaterThan(0);
    });
  });
});



