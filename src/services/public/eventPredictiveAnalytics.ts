// @ts-nocheck
/**
 * Event Predictive Analytics Service
 * SEGURANÇA: Usa callGeminiProxy (Edge Function) em vez de API key direta
 */

import { supabase } from '@/integrations/supabase/client';
import { callGeminiProxy } from '../ai/geminiProxy';

export interface AudiencePrediction {
  expectedAudience: number;
  confidence: number;
  factors: string[];
  similarEvents: Array<{ name: string; audience: number; date: string }>;
}

export interface EconomicImpact {
  estimatedRevenue: number;
  estimatedVisitors: number;
  estimatedSpending: number;
  factors: string[];
}

export interface OptimalDate {
  date: string;
  score: number;
  reasons: string[];
}

export class EventPredictiveAnalyticsService {
  async predictAudience(event: any): Promise<AudiencePrediction> {
    try {
      const { data: similarEvents } = await supabase
        .from('events').select('titulo, expected_audience, data_inicio, categoria')
        .eq('categoria', event.categoria || '').not('expected_audience', 'is', null).limit(10);

      const similar = (similarEvents || []).map((e: any) => ({ name: e.titulo || '', audience: e.expected_audience || 0, date: e.data_inicio || '' }));
      const averageAudience = similar.length > 0 ? Math.round(similar.reduce((sum, e) => sum + e.audience, 0) / similar.length) : 100;

      let predictedAudience = averageAudience;
      let confidence = 0.6;
      const factors: string[] = [];

      if (event.titulo && event.descricao) {
        try {
          const prompt = `Preveja o público para: "${event.titulo}" (${event.categoria || 'N/A'}). Eventos similares tiveram média de ${averageAudience} pessoas. Responda em JSON: { "expectedAudience": número, "confidence": 0.0-1.0, "factors": ["fator1"] }`;
          const result = await callGeminiProxy(prompt, { temperature: 0.5, maxOutputTokens: 500 });
          if (result.ok && result.text) {
            const jsonMatch = result.text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              predictedAudience = parsed.expectedAudience || averageAudience;
              confidence = parsed.confidence || 0.6;
              factors.push(...(Array.isArray(parsed.factors) ? parsed.factors : []));
            }
          }
        } catch (error) {
          console.error('Erro ao prever público com IA:', error);
        }
      }

      if (factors.length === 0) {
        factors.push(`Baseado em ${similar.length} evento(s) similar(es)`);
        factors.push(`Média histórica: ${averageAudience} pessoas`);
      }

      return { expectedAudience: predictedAudience, confidence, factors, similarEvents: similar.slice(0, 3) };
    } catch (error) {
      console.error('Erro ao prever público:', error);
      return { expectedAudience: 100, confidence: 0.5, factors: ['Previsão baseada em dados limitados'], similarEvents: [] };
    }
  }

  async analyzeEconomicImpact(event: any): Promise<EconomicImpact> {
    try {
      const { data: similarEvents } = await supabase.from('events').select('expected_audience, budget').eq('categoria', event.categoria || '').not('expected_audience', 'is', null).limit(10);
      const similar = similarEvents || [];
      const averageAudience = similar.length > 0 ? Math.round(similar.reduce((sum: number, e: any) => sum + (e.expected_audience || 0), 0) / similar.length) : 100;
      const averageSpendingPerVisitor = event.categoria === 'gastronomia' ? 150 : 80;
      const estimatedSpending = averageAudience * averageSpendingPerVisitor;
      const estimatedRevenue = event.categoria === 'cultural' ? averageAudience * 30 : estimatedSpending * 0.3;

      return {
        estimatedRevenue: Math.round(estimatedRevenue),
        estimatedVisitors: averageAudience,
        estimatedSpending: Math.round(estimatedSpending),
        factors: [`Baseado em ${similar.length} evento(s) similar(es)`, `Gasto médio: R$ ${averageSpendingPerVisitor}/visitante`],
      };
    } catch (error) {
      console.error('Erro ao analisar impacto econômico:', error);
      return { estimatedRevenue: 0, estimatedVisitors: 0, estimatedSpending: 0, factors: ['Análise não disponível'] };
    }
  }

  async suggestOptimalDates(eventType: string, location: string): Promise<OptimalDate[]> {
    try {
      const { data: existingEvents } = await supabase.from('events').select('data_inicio, expected_audience').eq('local', location).not('expected_audience', 'is', null).order('expected_audience', { ascending: false }).limit(20);
      const datePatterns: Record<string, number> = {};
      const monthPatterns: Record<string, number> = {};
      (existingEvents || []).forEach((event: any) => {
        const date = new Date(event.data_inicio);
        monthPatterns[date.getMonth()] = (monthPatterns[date.getMonth()] || 0) + (event.expected_audience || 0);
        datePatterns[date.getDay()] = (datePatterns[date.getDay()] || 0) + (event.expected_audience || 0);
      });

      const suggestions: OptimalDate[] = [];
      const today = new Date();
      for (let i = 1; i <= 3; i++) {
        const futureDate = new Date(today);
        futureDate.setMonth(today.getMonth() + i);
        const bestDayOfWeek = Object.entries(datePatterns).sort((a, b) => b[1] - a[1])[0]?.[0] || '6';
        const optimalDate = new Date(futureDate);
        optimalDate.setDate(1);
        while (optimalDate.getDay() !== parseInt(bestDayOfWeek)) optimalDate.setDate(optimalDate.getDate() + 1);
        const score = monthPatterns[optimalDate.getMonth()] ? Math.min(100, Math.round(monthPatterns[optimalDate.getMonth()] / 100)) : 70;
        suggestions.push({ date: optimalDate.toISOString().split('T')[0], score, reasons: ['Mês com histórico de bom público', 'Dia da semana com melhor desempenho'] });
      }
      return suggestions.sort((a, b) => b.score - a.score);
    } catch (error) {
      console.error('Erro ao sugerir datas ideais:', error);
      return [];
    }
  }
}

export const eventPredictiveAnalyticsService = new EventPredictiveAnalyticsService();
