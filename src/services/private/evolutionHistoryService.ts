/**
 * Evolution History Service
 * Gerencia histórico de evolução do negócio ao longo do tempo
 */

import { supabase } from '@/integrations/supabase/client';
import { AnalysisResult } from '@/services/diagnostic/analysisService';

export interface EvolutionDataPoint {
  date: string;
  score: number;
  roi: number;
  recommendationsCount: number;
  growthPotential: number;
  metrics?: {
    occupancy?: number;
    revenue?: number;
    rating?: number;
  };
}

export interface EvolutionHistory {
  dataPoints: EvolutionDataPoint[];
  trends: {
    score: 'up' | 'down' | 'stable';
    roi: 'up' | 'down' | 'stable';
    growth: 'up' | 'down' | 'stable';
  };
  period: '7d' | '30d' | '90d' | '1y';
}

export class EvolutionHistoryService {
  /**
   * Salvar ponto de evolução (chamado após cada diagnóstico)
   */
  async saveEvolutionPoint(
    userId: string,
    analysisResult: AnalysisResult,
    metrics?: {
      occupancy?: number;
      revenue?: number;
      rating?: number;
    }
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('business_evolution_history')
        .insert({
          user_id: userId,
          date: new Date().toISOString(),
          score: analysisResult.overallScore,
          roi: analysisResult.estimatedROI,
          recommendations_count: analysisResult.recommendations.length,
          growth_potential: analysisResult.growthPotential,
          metrics: metrics || {},
          analysis_result: analysisResult
        });

      if (error) {
        console.error('Erro ao salvar ponto de evolução:', error);
      }
    } catch (error) {
      console.error('Erro ao salvar ponto de evolução:', error);
    }
  }

  /**
   * Buscar histórico de evolução
   */
  async getEvolutionHistory(
    userId: string,
    period: '7d' | '30d' | '90d' | '1y' = '30d'
  ): Promise<EvolutionHistory> {
    try {
      const daysAgo = this.getDaysAgo(period);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const { data, error } = await supabase
        .from('business_evolution_history')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString())
        .order('date', { ascending: true });

      if (error) {
        console.error('Erro ao buscar histórico:', error);
        return {
          dataPoints: [],
          trends: {
            score: 'stable',
            roi: 'stable',
            growth: 'stable'
          },
          period
        };
      }

      const dataPoints: EvolutionDataPoint[] = (data || []).map((item: any) => ({
        date: item.date,
        score: item.score,
        roi: item.roi,
        recommendationsCount: item.recommendations_count,
        growthPotential: item.growth_potential,
        metrics: item.metrics || {}
      }));

      // Calcular tendências
      const trends = this.calculateTrends(dataPoints);

      return {
        dataPoints,
        trends,
        period
      };
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      return {
        dataPoints: [],
        trends: {
          score: 'stable',
          roi: 'stable',
          growth: 'stable'
        },
        period
      };
    }
  }

  /**
   * Calcular tendências baseado nos dados
   */
  private calculateTrends(dataPoints: EvolutionDataPoint[]): EvolutionHistory['trends'] {
    if (dataPoints.length < 2) {
      return {
        score: 'stable',
        roi: 'stable',
        growth: 'stable'
      };
    }

    const first = dataPoints[0];
    const last = dataPoints[dataPoints.length - 1];

    const getTrend = (firstValue: number, lastValue: number): 'up' | 'down' | 'stable' => {
      const diff = lastValue - firstValue;
      if (Math.abs(diff) < 1) return 'stable';
      return diff > 0 ? 'up' : 'down';
    };

    return {
      score: getTrend(first.score, last.score),
      roi: getTrend(first.roi, last.roi),
      growth: getTrend(first.growthPotential, last.growthPotential)
    };
  }

  /**
   * Obter número de dias baseado no período
   */
  private getDaysAgo(period: '7d' | '30d' | '90d' | '1y'): number {
    switch (period) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      case '1y': return 365;
      default: return 30;
    }
  }

  /**
   * Obter estatísticas de evolução
   */
  async getEvolutionStats(userId: string): Promise<{
    totalDiagnostics: number;
    firstDiagnostic: Date | null;
    lastDiagnostic: Date | null;
    scoreImprovement: number;
    averageScore: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('business_evolution_history')
        .select('date, score')
        .eq('user_id', userId)
        .order('date', { ascending: true });

      if (error || !data || data.length === 0) {
        return {
          totalDiagnostics: 0,
          firstDiagnostic: null,
          lastDiagnostic: null,
          scoreImprovement: 0,
          averageScore: 0
        };
      }

      const first = data[0];
      const last = data[data.length - 1];
      const scoreImprovement = last.score - first.score;
      const averageScore = data.reduce((sum, item) => sum + item.score, 0) / data.length;

      return {
        totalDiagnostics: data.length,
        firstDiagnostic: new Date(first.date),
        lastDiagnostic: new Date(last.date),
        scoreImprovement,
        averageScore: Math.round(averageScore * 10) / 10
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return {
        totalDiagnostics: 0,
        firstDiagnostic: null,
        lastDiagnostic: null,
        scoreImprovement: 0,
        averageScore: 0
      };
    }
  }
}

export const evolutionHistoryService = new EvolutionHistoryService();

