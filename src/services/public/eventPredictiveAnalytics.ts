/**
 * Event Predictive Analytics Service
 * Serviço para análise preditiva de eventos turísticos
 */

import { supabase } from '@/integrations/supabase/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export interface AudiencePrediction {
  expectedAudience: number;
  confidence: number;
  factors: string[];
  similarEvents: Array<{
    name: string;
    audience: number;
    date: string;
  }>;
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
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    if (GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    }
  }

  /**
   * Prever público esperado baseado em eventos similares
   */
  async predictAudience(event: any): Promise<AudiencePrediction> {
    try {
      // Buscar eventos similares
      const { data: similarEvents } = await supabase
        .from('events')
        .select('titulo, expected_audience, data_inicio, categoria')
        .eq('categoria', event.categoria || '')
        .not('expected_audience', 'is', null)
        .limit(10);

      const similar = (similarEvents || []).map((e: any) => ({
        name: e.titulo || e.name || '',
        audience: e.expected_audience || 0,
        date: e.data_inicio || '',
      }));

      // Calcular média de público de eventos similares
      const averageAudience = similar.length > 0
        ? Math.round(similar.reduce((sum, e) => sum + e.audience, 0) / similar.length)
        : 100; // Valor padrão

      // Usar IA para refinar previsão
      let predictedAudience = averageAudience;
      let confidence = 0.6;
      const factors: string[] = [];

      if (this.genAI && event.titulo && event.descricao) {
        try {
          const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

          const prompt = `
Com base em eventos similares que tiveram público médio de ${averageAudience} pessoas, preveja o público esperado para:

Título: ${event.titulo}
Descrição: ${event.descricao || 'Sem descrição'}
Categoria: ${event.categoria || 'Não especificada'}
Local: ${event.local || 'Não especificado'}

Responda em JSON:
{
  "expectedAudience": número estimado,
  "confidence": 0.0-1.0,
  "factors": ["fator1", "fator2", "fator3"]
}
`;

          const result = await model.generateContent(prompt);
          const response = result.response.text();

          const jsonMatch = response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            predictedAudience = parsed.expectedAudience || averageAudience;
            confidence = parsed.confidence || 0.6;
            factors.push(...(Array.isArray(parsed.factors) ? parsed.factors : []));
          }
        } catch (error) {
          console.error('Erro ao prever público com IA:', error);
        }
      }

      if (factors.length === 0) {
        factors.push(`Baseado em ${similar.length} evento(s) similar(es)`);
        factors.push(`Média histórica: ${averageAudience} pessoas`);
      }

      return {
        expectedAudience: predictedAudience,
        confidence,
        factors,
        similarEvents: similar.slice(0, 3),
      };
    } catch (error) {
      console.error('Erro ao prever público:', error);
      return {
        expectedAudience: 100,
        confidence: 0.5,
        factors: ['Previsão baseada em dados limitados'],
        similarEvents: [],
      };
    }
  }

  /**
   * Analisar impacto econômico
   */
  async analyzeEconomicImpact(event: any): Promise<EconomicImpact> {
    try {
      // Buscar dados de eventos similares
      const { data: similarEvents } = await supabase
        .from('events')
        .select('expected_audience, budget')
        .eq('categoria', event.categoria || '')
        .not('expected_audience', 'is', null)
        .limit(10);

      const similar = similarEvents || [];

      // Calcular estimativas
      const averageAudience = similar.length > 0
        ? Math.round(similar.reduce((sum: number, e: any) => sum + (e.expected_audience || 0), 0) / similar.length)
        : 100;

      // Estimativa de gasto médio por visitante (R$ 50-200 dependendo do tipo de evento)
      const averageSpendingPerVisitor = event.categoria === 'gastronomia' ? 150 : 80;
      const estimatedSpending = averageAudience * averageSpendingPerVisitor;

      // Estimativa de receita (considerando ingressos, vendas, etc)
      const estimatedRevenue = event.categoria === 'cultural' 
        ? averageAudience * 30 // R$ 30 por ingresso
        : estimatedSpending * 0.3; // 30% da receita total

      const factors = [
        `Baseado em ${similar.length} evento(s) similar(es)`,
        `Gasto médio estimado: R$ ${averageSpendingPerVisitor} por visitante`,
        `Categoria: ${event.categoria || 'Não especificada'}`,
      ];

      return {
        estimatedRevenue: Math.round(estimatedRevenue),
        estimatedVisitors: averageAudience,
        estimatedSpending: Math.round(estimatedSpending),
        factors,
      };
    } catch (error) {
      console.error('Erro ao analisar impacto econômico:', error);
      return {
        estimatedRevenue: 0,
        estimatedVisitors: 0,
        estimatedSpending: 0,
        factors: ['Análise não disponível'],
      };
    }
  }

  /**
   * Sugerir datas ideais
   */
  async suggestOptimalDates(eventType: string, location: string): Promise<OptimalDate[]> {
    try {
      // Buscar eventos existentes no local
      const { data: existingEvents } = await supabase
        .from('events')
        .select('data_inicio, expected_audience')
        .eq('local', location)
        .not('expected_audience', 'is', null)
        .order('expected_audience', { ascending: false })
        .limit(20);

      // Analisar padrões de datas com melhor público
      const datePatterns: Record<string, number> = {};
      const monthPatterns: Record<string, number> = {};

      (existingEvents || []).forEach((event: any) => {
        const date = new Date(event.data_inicio);
        const month = date.getMonth();
        const dayOfWeek = date.getDay();

        monthPatterns[month] = (monthPatterns[month] || 0) + (event.expected_audience || 0);
        datePatterns[dayOfWeek] = (datePatterns[dayOfWeek] || 0) + (event.expected_audience || 0);
      });

      // Sugerir próximas datas baseadas em padrões
      const suggestions: OptimalDate[] = [];
      const today = new Date();

      // Próximos 3 meses
      for (let i = 1; i <= 3; i++) {
        const futureDate = new Date(today);
        futureDate.setMonth(today.getMonth() + i);

        // Encontrar melhor dia do mês (fins de semana geralmente têm mais público)
        const bestDayOfWeek = Object.entries(datePatterns)
          .sort((a, b) => b[1] - a[1])[0]?.[0] || '6'; // Sábado por padrão

        const optimalDate = new Date(futureDate);
        optimalDate.setDate(1); // Primeiro dia do mês
        while (optimalDate.getDay() !== parseInt(bestDayOfWeek)) {
          optimalDate.setDate(optimalDate.getDate() + 1);
        }

        const score = monthPatterns[optimalDate.getMonth()] 
          ? Math.min(100, Math.round(monthPatterns[optimalDate.getMonth()] / 100))
          : 70;

        suggestions.push({
          date: optimalDate.toISOString().split('T')[0],
          score,
          reasons: [
            `Mês com histórico de bom público`,
            `Dia da semana com melhor desempenho`,
          ],
        });
      }

      return suggestions.sort((a, b) => b.score - a.score);
    } catch (error) {
      console.error('Erro ao sugerir datas ideais:', error);
      return [];
    }
  }
}

export const eventPredictiveAnalyticsService = new EventPredictiveAnalyticsService();

