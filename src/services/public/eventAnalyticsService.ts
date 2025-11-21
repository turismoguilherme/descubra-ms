/**
 * Event Analytics Service
 * Serviço para análise e insights de eventos turísticos
 */

import { supabase } from '@/integrations/supabase/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export interface CompletenessAnalysis {
  overallScore: number;
  byCategory: Record<string, {
    score: number;
    total: number;
    complete: number;
    incomplete: number;
  }>;
  recommendations: string[];
}

export interface TrendAnalysis {
  eventsByMonth: Array<{ month: string; count: number; totalAudience: number }>;
  eventsByCategory: Record<string, number>;
  peakMonths: string[];
  trends: string[];
}

export interface LocationAnalysis {
  mostUsedLocations: Array<{ location: string; count: number; totalAudience: number }>;
  recommendations: string[];
}

export interface SuccessAnalysis {
  averageSuccessRate: number;
  byCategory: Record<string, { expected: number; actual: number; rate: number }>;
  recommendations: string[];
}

export interface BenchmarkComparison {
  metric: string;
  currentValue: number;
  averageValue: number;
  benchmarkValue: number;
  difference: number;
  status: 'above' | 'below' | 'equal';
}

export interface OutdatedAlert {
  eventId: string;
  name: string;
  lastUpdated: string;
  daysSinceUpdate: number;
  recommendedAction: string;
}

export interface Improvement {
  field: string;
  currentValue: any;
  suggestedValue: any;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export class EventAnalyticsService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    if (GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    }
  }

  /**
   * Analisar completude por categoria
   */
  async analyzeCompleteness(municipalityId?: string): Promise<CompletenessAnalysis> {
    try {
      // Buscar eventos
      let query = supabase
        .from('events')
        .select('*');

      const { data: events, error } = await query;

      if (error) throw error;

      const items = events || [];

      // Calcular completude por categoria
      const byCategory: Record<string, any> = {};
      let totalScore = 0;
      let totalItems = 0;

      const requiredFields = ['titulo', 'descricao', 'data_inicio', 'local'];
      const recommendedFields = ['data_fim', 'categoria', 'site_oficial', 'imagem_principal', 'expected_audience', 'budget', 'contact_phone', 'contact_email'];

      for (const item of items) {
        const category = item.categoria || 'outros';
        
        if (!byCategory[category]) {
          byCategory[category] = {
            score: 0,
            total: 0,
            complete: 0,
            incomplete: 0,
          };
        }

        // Calcular completude do item
        let filledFields = 0;
        const totalFields = requiredFields.length + recommendedFields.length;

        for (const field of requiredFields) {
          const value = item[field] || item[field.replace('titulo', 'name')];
          if (value && (typeof value !== 'string' || value.trim() !== '')) {
            filledFields++;
          }
        }

        for (const field of recommendedFields) {
          const value = item[field];
          if (value && (typeof value !== 'string' || value.trim() !== '')) {
            filledFields++;
          }
        }

        const completenessScore = Math.round((filledFields / totalFields) * 100);
        byCategory[category].score += completenessScore;
        byCategory[category].total += 1;
        
        if (completenessScore >= 80) {
          byCategory[category].complete += 1;
        } else {
          byCategory[category].incomplete += 1;
        }

        totalScore += completenessScore;
        totalItems += 1;
      }

      // Calcular média por categoria
      for (const category in byCategory) {
        if (byCategory[category].total > 0) {
          byCategory[category].score = Math.round(byCategory[category].score / byCategory[category].total);
        }
      }

      const overallScore = totalItems > 0 ? Math.round(totalScore / totalItems) : 0;

      // Gerar recomendações
      const recommendations = this.generateCompletenessRecommendations(byCategory, overallScore);

      return {
        overallScore,
        byCategory,
        recommendations,
      };
    } catch (error) {
      console.error('Erro ao analisar completude:', error);
      throw error;
    }
  }

  /**
   * Analisar tendências temporais
   */
  async analyzeEventTrends(municipalityId?: string): Promise<TrendAnalysis> {
    try {
      const { data: events, error } = await supabase
        .from('events')
        .select('data_inicio, categoria, expected_audience')
        .not('data_inicio', 'is', null)
        .order('data_inicio', { ascending: false });

      if (error) throw error;

      const items = events || [];

      // Agrupar por mês
      const eventsByMonthMap: Record<string, { count: number; totalAudience: number }> = {};
      const eventsByCategoryMap: Record<string, number> = {};

      items.forEach((item: any) => {
        if (item.data_inicio) {
          const date = new Date(item.data_inicio);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          const monthLabel = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

          if (!eventsByMonthMap[monthKey]) {
            eventsByMonthMap[monthKey] = { count: 0, totalAudience: 0 };
          }
          eventsByMonthMap[monthKey].count += 1;
          eventsByMonthMap[monthKey].totalAudience += item.expected_audience || 0;
        }

        const category = item.categoria || 'outros';
        eventsByCategoryMap[category] = (eventsByCategoryMap[category] || 0) + 1;
      });

      // Converter para array e ordenar
      const eventsByMonth = Object.entries(eventsByMonthMap)
        .map(([key, value]) => {
          const [year, month] = key.split('-');
          const date = new Date(parseInt(year), parseInt(month) - 1);
          return {
            month: date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
            count: value.count,
            totalAudience: value.totalAudience,
          };
        })
        .sort((a, b) => {
          const dateA = new Date(a.month);
          const dateB = new Date(b.month);
          return dateA.getTime() - dateB.getTime();
        })
        .slice(-12); // Últimos 12 meses

      // Identificar meses de pico
      const peakMonths = eventsByMonth
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
        .map(e => e.month);

      // Gerar tendências
      const trends: string[] = [];
      if (eventsByMonth.length >= 2) {
        const recent = eventsByMonth.slice(-3);
        const older = eventsByMonth.slice(-6, -3);
        const recentAvg = recent.reduce((sum, e) => sum + e.count, 0) / recent.length;
        const olderAvg = older.reduce((sum, e) => sum + e.count, 0) / older.length;

        if (recentAvg > olderAvg * 1.2) {
          trends.push('Tendência de aumento no número de eventos');
        } else if (recentAvg < olderAvg * 0.8) {
          trends.push('Tendência de redução no número de eventos');
        }
      }

      const mostCommonCategory = Object.entries(eventsByCategoryMap)
        .sort((a, b) => b[1] - a[1])[0]?.[0];
      if (mostCommonCategory) {
        trends.push(`Categoria mais comum: ${mostCommonCategory}`);
      }

      return {
        eventsByMonth,
        eventsByCategory: eventsByCategoryMap,
        peakMonths,
        trends,
      };
    } catch (error) {
      console.error('Erro ao analisar tendências:', error);
      throw error;
    }
  }

  /**
   * Comparar com benchmarks
   */
  async compareWithBenchmarks(municipalityId?: string): Promise<BenchmarkComparison[]> {
    try {
      const { data: events } = await supabase
        .from('events')
        .select('*');

      const items = events || [];

      // Calcular métricas atuais
      const totalEvents = items.length;
      const averageCompleteness = items.reduce((sum, item) => {
        const requiredFields = ['titulo', 'descricao', 'data_inicio', 'local'];
        const recommendedFields = ['data_fim', 'categoria', 'expected_audience'];
        let filledFields = 0;
        const totalFields = requiredFields.length + recommendedFields.length;

        for (const field of requiredFields) {
          const value = item[field] || item[field.replace('titulo', 'name')];
          if (value && (typeof value !== 'string' || value.trim() !== '')) {
            filledFields++;
          }
        }

        for (const field of recommendedFields) {
          const value = item[field];
          if (value && (typeof value !== 'string' || value.trim() !== '')) {
            filledFields++;
          }
        }

        return sum + Math.round((filledFields / totalFields) * 100);
      }, 0) / (totalEvents || 1);

      const upcomingEvents = items.filter((item: any) => {
        if (!item.data_inicio) return false;
        const eventDate = new Date(item.data_inicio);
        const now = new Date();
        return eventDate > now && eventDate <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      }).length;

      // Benchmarks (valores de referência)
      const benchmarks: BenchmarkComparison[] = [
        {
          metric: 'Total de Eventos',
          currentValue: totalEvents,
          averageValue: 50,
          benchmarkValue: 100,
          difference: totalEvents - 100,
          status: totalEvents >= 100 ? 'above' : totalEvents >= 50 ? 'equal' : 'below',
        },
        {
          metric: 'Completude Média',
          currentValue: Math.round(averageCompleteness),
          averageValue: 70,
          benchmarkValue: 85,
          difference: Math.round(averageCompleteness - 85),
          status: averageCompleteness >= 85 ? 'above' : averageCompleteness >= 70 ? 'equal' : 'below',
        },
        {
          metric: 'Eventos Próximos (30 dias)',
          currentValue: upcomingEvents,
          averageValue: 5,
          benchmarkValue: 10,
          difference: upcomingEvents - 10,
          status: upcomingEvents >= 10 ? 'above' : upcomingEvents >= 5 ? 'equal' : 'below',
        },
      ];

      return benchmarks;
    } catch (error) {
      console.error('Erro ao comparar com benchmarks:', error);
      return [];
    }
  }

  /**
   * Verificar eventos desatualizados
   */
  async checkOutdatedEvents(municipalityId?: string): Promise<OutdatedAlert[]> {
    try {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const { data: outdated, error } = await supabase
        .from('events')
        .select('id, titulo, updated_at, data_inicio')
        .lt('updated_at', oneYearAgo.toISOString())
        .order('updated_at', { ascending: true });

      if (error) throw error;

      const alerts: OutdatedAlert[] = (outdated || []).map((item: any) => {
        const lastUpdate = new Date(item.updated_at);
        const daysSinceUpdate = Math.floor((Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));

        // Verificar se evento já passou
        const eventDate = item.data_inicio ? new Date(item.data_inicio) : null;
        const isPast = eventDate && eventDate < new Date();

        return {
          eventId: item.id,
          name: item.titulo || item.name || 'Evento sem título',
          lastUpdated: item.updated_at,
          daysSinceUpdate,
          recommendedAction: isPast 
            ? 'Evento já ocorreu. Considere arquivar ou atualizar para próximo ano.'
            : daysSinceUpdate > 365 
            ? 'Atualizar dados urgentemente' 
            : 'Revisar e atualizar dados',
        };
      });

      return alerts;
    } catch (error) {
      console.error('Erro ao verificar eventos desatualizados:', error);
      return [];
    }
  }

  /**
   * Analisar uso de locais
   */
  async analyzeLocationUsage(municipalityId?: string): Promise<LocationAnalysis> {
    try {
      const { data: events, error } = await supabase
        .from('events')
        .select('local, expected_audience')
        .not('local', 'is', null);

      if (error) throw error;

      const items = events || [];

      // Agrupar por local
      const locationMap: Record<string, { count: number; totalAudience: number }> = {};

      items.forEach((item: any) => {
        const location = item.local || '';
        if (location) {
          if (!locationMap[location]) {
            locationMap[location] = { count: 0, totalAudience: 0 };
          }
          locationMap[location].count += 1;
          locationMap[location].totalAudience += item.expected_audience || 0;
        }
      });

      // Converter para array e ordenar
      const mostUsedLocations = Object.entries(locationMap)
        .map(([location, data]) => ({
          location,
          count: data.count,
          totalAudience: data.totalAudience,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Gerar recomendações
      const recommendations: string[] = [];
      if (mostUsedLocations.length > 0) {
        const topLocation = mostUsedLocations[0];
        recommendations.push(`Local mais utilizado: ${topLocation.location} (${topLocation.count} eventos)`);
        
        if (mostUsedLocations.length > 3) {
          recommendations.push('Considere diversificar os locais dos eventos para alcançar diferentes públicos');
        }
      }

      return {
        mostUsedLocations,
        recommendations,
      };
    } catch (error) {
      console.error('Erro ao analisar uso de locais:', error);
      throw error;
    }
  }

  /**
   * Analisar taxa de sucesso
   */
  async analyzeEventSuccess(municipalityId?: string): Promise<SuccessAnalysis> {
    try {
      const { data: events, error } = await supabase
        .from('events')
        .select('categoria, expected_audience, actual_audience')
        .not('expected_audience', 'is', null);

      if (error) throw error;

      const items = events || [];

      // Agrupar por categoria
      const byCategory: Record<string, { expected: number; actual: number; count: number }> = {};
      let totalExpected = 0;
      let totalActual = 0;
      let totalCount = 0;

      items.forEach((item: any) => {
        const category = item.categoria || 'outros';
        const expected = item.expected_audience || 0;
        const actual = item.actual_audience || expected; // Se não tiver real, usar esperado

        if (!byCategory[category]) {
          byCategory[category] = { expected: 0, actual: 0, count: 0 };
        }

        byCategory[category].expected += expected;
        byCategory[category].actual += actual;
        byCategory[category].count += 1;

        totalExpected += expected;
        totalActual += actual;
        totalCount += 1;
      });

      // Calcular taxas
      const averageSuccessRate = totalCount > 0 && totalExpected > 0
        ? Math.round((totalActual / totalExpected) * 100)
        : 100;

      const byCategoryRates: Record<string, { expected: number; actual: number; rate: number }> = {};
      for (const [category, data] of Object.entries(byCategory)) {
        const rate = data.expected > 0
          ? Math.round((data.actual / data.expected) * 100)
          : 100;
        byCategoryRates[category] = {
          expected: Math.round(data.expected / data.count),
          actual: Math.round(data.actual / data.count),
          rate,
        };
      }

      // Gerar recomendações
      const recommendations: string[] = [];
      if (averageSuccessRate < 80) {
        recommendations.push('Taxa de sucesso abaixo do esperado. Revise as previsões de público.');
      }
      if (averageSuccessRate > 120) {
        recommendations.push('Taxa de sucesso acima do esperado. Considere aumentar a capacidade dos eventos.');
      }

      const worstCategory = Object.entries(byCategoryRates)
        .sort((a, b) => a[1].rate - b[1].rate)[0];
      if (worstCategory && worstCategory[1].rate < 70) {
        recommendations.push(`Categoria "${worstCategory[0]}" com menor taxa de sucesso (${worstCategory[1].rate}%). Revise estratégias.`);
      }

      return {
        averageSuccessRate,
        byCategory: byCategoryRates,
        recommendations,
      };
    } catch (error) {
      console.error('Erro ao analisar taxa de sucesso:', error);
      throw error;
    }
  }

  /**
   * Sugerir melhorias com IA
   */
  async suggestImprovements(event: any): Promise<Improvement[]> {
    try {
      if (!this.genAI) {
        return this.getBasicImprovements(event);
      }

      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `
Analise o seguinte evento turístico e sugira melhorias específicas:

Título: ${event.titulo || event.title || event.name || 'Não informado'}
Descrição: ${event.descricao || event.description || 'Não informado'}
Data: ${event.data_inicio || event.start_date || 'Não informado'}
Local: ${event.local || event.location || 'Não informado'}
Categoria: ${event.categoria || event.category || 'Não informado'}
Público Esperado: ${event.expected_audience || 'Não informado'}
Orçamento: ${event.budget || 'Não informado'}

Forneça uma resposta em JSON com melhorias:
{
  "improvements": [
    {
      "field": "nome_do_campo",
      "currentValue": "valor atual ou null",
      "suggestedValue": "valor sugerido",
      "reason": "razão da sugestão",
      "priority": "high|medium|low"
    }
  ]
}

Seja específico e acionável. Priorize campos obrigatórios faltando.
`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed.improvements)) {
          return parsed.improvements;
        }
      }

      return this.getBasicImprovements(event);
    } catch (error) {
      console.error('Erro ao sugerir melhorias:', error);
      return this.getBasicImprovements(event);
    }
  }

  /**
   * Gerar recomendações básicas de completude
   */
  private generateCompletenessRecommendations(
    byCategory: Record<string, any>,
    overallScore: number
  ): string[] {
    const recommendations: string[] = [];

    if (overallScore < 70) {
      recommendations.push('Score geral de completude abaixo de 70%. Priorize preencher campos obrigatórios.');
    }

    for (const [category, data] of Object.entries(byCategory)) {
      if (data.score < 70) {
        recommendations.push(`Categoria "${category}" com completude baixa (${data.score}%). Revise ${data.incomplete} evento(s) incompleto(s).`);
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('Parabéns! Os eventos estão bem completos. Continue mantendo os dados atualizados.');
    }

    return recommendations;
  }

  /**
   * Melhorias básicas (fallback)
   */
  private getBasicImprovements(event: any): Improvement[] {
    const improvements: Improvement[] = [];

    if (!event.descricao && !event.description || (event.descricao || event.description || '').trim().length < 50) {
      improvements.push({
        field: 'description',
        currentValue: event.descricao || event.description || 'Não informado',
        suggestedValue: 'Adicione uma descrição detalhada com pelo menos 50 caracteres',
        reason: 'Descrição muito curta ou ausente',
        priority: 'high',
      });
    }

    if (!event.local && !event.location) {
      improvements.push({
        field: 'location',
        currentValue: 'Não informado',
        suggestedValue: 'Adicione o local do evento',
        reason: 'Local é obrigatório',
        priority: 'high',
      });
    }

    if (!event.expected_audience || event.expected_audience === 0) {
      improvements.push({
        field: 'expected_audience',
        currentValue: event.expected_audience || 0,
        suggestedValue: 'Estime o público esperado',
        reason: 'Público esperado ajuda no planejamento',
        priority: 'medium',
      });
    }

    if (!event.contact_phone && !event.contact_email) {
      improvements.push({
        field: 'contact',
        currentValue: 'Não informado',
        suggestedValue: 'Adicione telefone ou email para contato',
        reason: 'Informações de contato são essenciais',
        priority: 'high',
      });
    }

    return improvements;
  }
}

export const eventAnalyticsService = new EventAnalyticsService();

