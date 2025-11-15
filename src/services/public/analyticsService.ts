/**
 * Analytics Service para Setor Público
 * Análises avançadas de dados turísticos do Supabase
 */

import { supabase } from '@/integrations/supabase/client';

export interface FlowAnalysis {
  from: string;
  to: string;
  count: number;
  percentage: number;
}

export interface SeasonalAnalysis {
  month: string;
  visitors: number;
  revenue: number;
  growth: number;
}

export interface DemographicAnalysis {
  ageGroups: Array<{ group: string; count: number; percentage: number }>;
  origins: Array<{ origin: string; count: number; percentage: number }>;
  countries: Array<{ country: string; count: number; percentage: number }>;
}

export interface RevenueAnalysis {
  total: number;
  monthly: number;
  growth: number;
  sources: Array<{ source: string; amount: number; percentage: number }>;
  trends: Array<{ month: string; revenue: number }>;
}

export interface EngagementAnalysis {
  totalInteractions: number;
  averageRating: number;
  topInterests: Array<{ interest: string; count: number; percentage: number }>;
  satisfactionDistribution: Array<{ rating: number; count: number; percentage: number }>;
}

export interface PredictiveAnalysis {
  nextMonthVisitors: number;
  nextMonthRevenue: number;
  confidence: number;
  trends: Array<{ period: string; predicted: number; actual?: number }>;
  recommendations: string[];
}

export interface AdvancedAnalytics {
  flowAnalysis: FlowAnalysis[];
  seasonalAnalysis: SeasonalAnalysis[];
  demographicAnalysis: DemographicAnalysis;
  revenueAnalysis: RevenueAnalysis;
  engagementAnalysis: EngagementAnalysis;
  predictiveAnalysis: PredictiveAnalysis;
}

export class PublicAnalyticsService {
  /**
   * Análise de fluxos de turistas (origem e destino)
   */
  async getFlowAnalysis(dateRange?: { start: string; end: string }): Promise<FlowAnalysis[]> {
    try {
      let query = supabase
        .from('cat_tourists')
        .select('origin_state, origin_city, cat_id, cat_locations(name, city)');

      if (dateRange) {
        query = query
          .gte('visit_date', dateRange.start)
          .lte('visit_date', dateRange.end);
      }

      const { data, error } = await query;

      if (error) throw error;

      const flows = new Map<string, { from: string; to: string; count: number }>();

      data?.forEach((tourist: any) => {
        const from = tourist.origin_state || tourist.origin_city || 'Desconhecido';
        const to = tourist.cat_locations?.city || tourist.cat_locations?.name || 'Local';
        const key = `${from}->${to}`;

        if (!flows.has(key)) {
          flows.set(key, { from, to, count: 0 });
        }
        flows.get(key)!.count++;
      });

      const total = Array.from(flows.values()).reduce((sum, f) => sum + f.count, 0);

      return Array.from(flows.values())
        .map(flow => ({
          ...flow,
          percentage: total > 0 ? (flow.count / total) * 100 : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    } catch (error) {
      console.error('❌ Erro ao analisar fluxos:', error);
      return [];
    }
  }

  /**
   * Análise sazonal (padrões por mês)
   */
  async getSeasonalAnalysis(dateRange?: { start: string; end: string }): Promise<SeasonalAnalysis[]> {
    try {
      let query = supabase
        .from('cat_tourists')
        .select('visit_date, visit_time');

      if (dateRange) {
        query = query
          .gte('visit_date', dateRange.start)
          .lte('visit_date', dateRange.end);
      }

      const { data, error } = await query;

      if (error) throw error;

      const monthlyData = new Map<string, { visitors: number; revenue: number }>();
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

      data?.forEach((tourist: any) => {
        const date = new Date(tourist.visit_date || tourist.visit_time);
        const monthKey = months[date.getMonth()];
        const year = date.getFullYear();
        const key = `${monthKey} ${year}`;

        if (!monthlyData.has(key)) {
          monthlyData.set(key, { visitors: 0, revenue: 0 });
        }

        const monthData = monthlyData.get(key)!;
        monthData.visitors++;
        // Estimativa de receita: R$ 200 por turista (média)
        monthData.revenue += 200;
      });

      const sortedMonths = Array.from(monthlyData.entries())
        .map(([month, data]) => ({
          month,
          visitors: data.visitors,
          revenue: data.revenue,
          growth: 0 // Será calculado abaixo
        }))
        .sort((a, b) => {
          const aDate = new Date(a.month);
          const bDate = new Date(b.month);
          return aDate.getTime() - bDate.getTime();
        });

      // Calcular crescimento
      for (let i = 1; i < sortedMonths.length; i++) {
        const prev = sortedMonths[i - 1].visitors;
        const curr = sortedMonths[i].visitors;
        sortedMonths[i].growth = prev > 0 ? ((curr - prev) / prev) * 100 : 0;
      }

      return sortedMonths;
    } catch (error) {
      console.error('❌ Erro ao analisar sazonalidade:', error);
      return [];
    }
  }

  /**
   * Análise demográfica
   */
  async getDemographicAnalysis(dateRange?: { start: string; end: string }): Promise<DemographicAnalysis> {
    try {
      let query = supabase
        .from('cat_tourists')
        .select('origin_state, origin_country, origin_city');

      if (dateRange) {
        query = query
          .gte('visit_date', dateRange.start)
          .lte('visit_date', dateRange.end);
      }

      const { data, error } = await query;

      if (error) throw error;

      const origins = new Map<string, number>();
      const countries = new Map<string, number>();
      const total = data?.length || 0;

      data?.forEach((tourist: any) => {
        // Origem (estado)
        const origin = tourist.origin_state || 'Desconhecido';
        origins.set(origin, (origins.get(origin) || 0) + 1);

        // País
        const country = tourist.origin_country || 'Brasil';
        countries.set(country, (countries.get(country) || 0) + 1);
      });

      // Agrupar por faixa etária (simulado - não temos dados de idade)
      // Em produção, isso viria de um campo específico ou seria estimado
      const ageGroups = [
        { group: '18-25', count: Math.floor(total * 0.25), percentage: 25 },
        { group: '26-35', count: Math.floor(total * 0.35), percentage: 35 },
        { group: '36-45', count: Math.floor(total * 0.22), percentage: 22 },
        { group: '46-55', count: Math.floor(total * 0.12), percentage: 12 },
        { group: '55+', count: Math.floor(total * 0.06), percentage: 6 }
      ];

      return {
        ageGroups,
        origins: Array.from(origins.entries())
          .map(([origin, count]) => ({
            origin,
            count,
            percentage: total > 0 ? (count / total) * 100 : 0
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
        countries: Array.from(countries.entries())
          .map(([country, count]) => ({
            country,
            count,
            percentage: total > 0 ? (count / total) * 100 : 0
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)
      };
    } catch (error) {
      console.error('❌ Erro ao analisar demografia:', error);
      return {
        ageGroups: [],
        origins: [],
        countries: []
      };
    }
  }

  /**
   * Análise de receita (estimada)
   */
  async getRevenueAnalysis(dateRange?: { start: string; end: string }): Promise<RevenueAnalysis> {
    try {
      let query = supabase
        .from('cat_tourists')
        .select('visit_date, visit_time');

      if (dateRange) {
        query = query
          .gte('visit_date', dateRange.start)
          .lte('visit_date', dateRange.end);
      }

      const { data, error } = await query;

      if (error) throw error;

      const total = data?.length || 0;
      const averagePerTourist = 200; // R$ 200 por turista (estimativa)
      const totalRevenue = total * averagePerTourist;

      // Calcular receita mensal
      const monthlyData = new Map<string, number>();
      data?.forEach((tourist: any) => {
        const date = new Date(tourist.visit_date || tourist.visit_time);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + averagePerTourist);
      });

      const monthlyRevenue = Array.from(monthlyData.values()).reduce((sum, rev) => sum + rev, 0) / (monthlyData.size || 1);

      // Calcular crescimento
      const monthlyValues = Array.from(monthlyData.values()).sort((a, b) => a - b);
      const growth = monthlyValues.length >= 2
        ? ((monthlyValues[monthlyValues.length - 1] - monthlyValues[0]) / monthlyValues[0]) * 100
        : 0;

      // Fontes de receita (estimadas)
      const sources = [
        { source: 'Hospedagem', amount: totalRevenue * 0.42, percentage: 42 },
        { source: 'Gastronomia', amount: totalRevenue * 0.30, percentage: 30 },
        { source: 'Transporte', amount: totalRevenue * 0.16, percentage: 16 },
        { source: 'Atrações', amount: totalRevenue * 0.12, percentage: 12 }
      ];

      // Tendências mensais
      const trends = Array.from(monthlyData.entries())
        .map(([month, revenue]) => ({
          month,
          revenue
        }))
        .sort((a, b) => a.month.localeCompare(b.month));

      return {
        total: totalRevenue,
        monthly: monthlyRevenue,
        growth,
        sources,
        trends
      };
    } catch (error) {
      console.error('❌ Erro ao analisar receita:', error);
      return {
        total: 0,
        monthly: 0,
        growth: 0,
        sources: [],
        trends: []
      };
    }
  }

  /**
   * Análise de engajamento
   */
  async getEngagementAnalysis(dateRange?: { start: string; end: string }): Promise<EngagementAnalysis> {
    try {
      let query = supabase
        .from('cat_tourists')
        .select('rating, feedback, interests, questions_asked');

      if (dateRange) {
        query = query
          .gte('visit_date', dateRange.start)
          .lte('visit_date', dateRange.end);
      }

      const { data, error } = await query;

      if (error) throw error;

      const total = data?.length || 0;
      const ratings = data?.filter((t: any) => t.rating !== null).map((t: any) => t.rating) || [];
      const averageRating = ratings.length > 0
        ? ratings.reduce((sum: number, r: number) => sum + r, 0) / ratings.length
        : 0;

      // Distribuição de satisfação
      const ratingDistribution = new Map<number, number>();
      ratings.forEach((rating: number) => {
        ratingDistribution.set(rating, (ratingDistribution.get(rating) || 0) + 1);
      });

      const satisfactionDistribution = [1, 2, 3, 4, 5].map(rating => {
        const count = ratingDistribution.get(rating) || 0;
        return {
          rating,
          count,
          percentage: total > 0 ? (count / total) * 100 : 0
        };
      });

      // Interesses mais populares
      const interests = new Map<string, number>();
      data?.forEach((tourist: any) => {
        if (tourist.interests && Array.isArray(tourist.interests)) {
          tourist.interests.forEach((interest: string) => {
            interests.set(interest, (interests.get(interest) || 0) + 1);
          });
        }
      });

      const topInterests = Array.from(interests.entries())
        .map(([interest, count]) => ({
          interest,
          count,
          percentage: total > 0 ? (count / total) * 100 : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        totalInteractions: total,
        averageRating: Math.round(averageRating * 100) / 100,
        topInterests,
        satisfactionDistribution
      };
    } catch (error) {
      console.error('❌ Erro ao analisar engajamento:', error);
      return {
        totalInteractions: 0,
        averageRating: 0,
        topInterests: [],
        satisfactionDistribution: []
      };
    }
  }

  /**
   * Análise preditiva (previsões futuras)
   */
  async getPredictiveAnalysis(dateRange?: { start: string; end: string }): Promise<PredictiveAnalysis> {
    try {
      // Buscar dados históricos
      const seasonalData = await this.getSeasonalAnalysis(dateRange);
      const revenueData = await this.getRevenueAnalysis(dateRange);

      if (seasonalData.length < 3) {
        return {
          nextMonthVisitors: 0,
          nextMonthRevenue: 0,
          confidence: 0,
          trends: [],
          recommendations: ['Dados insuficientes para previsões precisas']
        };
      }

      // Calcular média móvel dos últimos 3 meses
      const last3Months = seasonalData.slice(-3);
      const avgVisitors = last3Months.reduce((sum, m) => sum + m.visitors, 0) / last3Months.length;
      const avgRevenue = last3Months.reduce((sum, m) => sum + m.revenue, 0) / last3Months.length;

      // Aplicar tendência de crescimento
      const growth = last3Months.length >= 2
        ? ((last3Months[last3Months.length - 1].visitors - last3Months[0].visitors) / last3Months[0].visitors) * 100
        : 0;

      const nextMonthVisitors = Math.round(avgVisitors * (1 + growth / 100));
      const nextMonthRevenue = Math.round(avgRevenue * (1 + growth / 100));

      // Calcular confiança baseada na quantidade de dados
      const confidence = Math.min(95, Math.max(50, seasonalData.length * 10));

      // Gerar tendências
      const trends = seasonalData.slice(-6).map((month, index) => ({
        period: month.month,
        actual: month.visitors,
        predicted: index < seasonalData.length - 1 ? month.visitors : nextMonthVisitors
      }));

      // Gerar recomendações
      const recommendations: string[] = [];
      if (growth > 10) {
        recommendations.push('Crescimento positivo detectado - considere aumentar a capacidade de atendimento');
      } else if (growth < -5) {
        recommendations.push('Queda de visitantes detectada - avalie estratégias de marketing');
      }
      if (avgVisitors > 1000) {
        recommendations.push('Alto volume de visitantes - planeje infraestrutura para picos');
      }
      if (last3Months[last3Months.length - 1].visitors < avgVisitors * 0.8) {
        recommendations.push('Volume abaixo da média - analise causas e ajuste estratégias');
      }

      return {
        nextMonthVisitors,
        nextMonthRevenue,
        confidence,
        trends,
        recommendations: recommendations.length > 0 ? recommendations : ['Mantenha o monitoramento regular dos dados']
      };
    } catch (error) {
      console.error('❌ Erro ao gerar análise preditiva:', error);
      return {
        nextMonthVisitors: 0,
        nextMonthRevenue: 0,
        confidence: 0,
        trends: [],
        recommendations: ['Erro ao gerar previsões']
      };
    }
  }

  /**
   * Obter todas as análises avançadas
   */
  async getAdvancedAnalytics(dateRange?: { start: string; end: string }): Promise<AdvancedAnalytics> {
    try {
      const [
        flowAnalysis,
        seasonalAnalysis,
        demographicAnalysis,
        revenueAnalysis,
        engagementAnalysis,
        predictiveAnalysis
      ] = await Promise.all([
        this.getFlowAnalysis(dateRange),
        this.getSeasonalAnalysis(dateRange),
        this.getDemographicAnalysis(dateRange),
        this.getRevenueAnalysis(dateRange),
        this.getEngagementAnalysis(dateRange),
        this.getPredictiveAnalysis(dateRange)
      ]);

      return {
        flowAnalysis,
        seasonalAnalysis,
        demographicAnalysis,
        revenueAnalysis,
        engagementAnalysis,
        predictiveAnalysis
      };
    } catch (error) {
      console.error('❌ Erro ao obter análises avançadas:', error);
      throw error;
    }
  }
}

export const publicAnalyticsService = new PublicAnalyticsService();

