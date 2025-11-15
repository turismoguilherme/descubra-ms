/**
 * Benchmark Service
 * Serviço para gerenciar dados de competitive benchmark
 */

import { supabase } from '@/integrations/supabase/client';

export interface CompetitiveBenchmark {
  id: string;
  user_id: string;
  period_start: string;
  period_end: string;
  occupancy_rate: number | null;
  market_occupancy_rate: number | null;
  average_price: number | null;
  market_average_price: number | null;
  rating: number | null;
  market_rating: number | null;
  average_stay_days: number | null;
  market_average_stay_days: number | null;
  competitors_data: any[] | null;
  gaps: {
    [key: string]: string;
  } | null;
  recommendations: string[] | null;
  created_at: string;
  updated_at: string;
}

export class BenchmarkService {
  /**
   * Salvar dados de benchmark
   */
  async saveBenchmarkData(
    userId: string,
    data: {
      period_start: string;
      period_end: string;
      occupancy_rate?: number;
      market_occupancy_rate?: number;
      average_price?: number;
      market_average_price?: number;
      rating?: number;
      market_rating?: number;
      average_stay_days?: number;
      market_average_stay_days?: number;
      competitors_data?: any[];
      gaps?: CompetitiveBenchmark['gaps'];
      recommendations?: string[];
    }
  ): Promise<CompetitiveBenchmark> {
    try {
      const { data: result, error } = await supabase
        .from('viajar_competitive_benchmarks')
        .insert({
          user_id: userId,
          ...data
        })
        .select()
        .single();

      if (error) throw error;
      return result as CompetitiveBenchmark;
    } catch (error) {
      console.error('Erro ao salvar dados de benchmark:', error);
      throw error;
    }
  }

  /**
   * Buscar dados de benchmark (mockado, preparado para ALUMIA)
   */
  async getBenchmarkData(userId: string): Promise<any> {
    try {
      // Por enquanto retorna dados mockados
      // TODO: Integrar com ALUMIA API quando disponível
      return {
        yourMetrics: {
          occupancy: 68,
          price: 420,
          rating: 4.3,
          stayDays: 2.8
        },
        marketAverage: {
          occupancy: 72,
          price: 390,
          rating: 4.5,
          stayDays: 3.2
        },
        competitors: [
          {
            name: 'Concorrente A',
            occupancy: 75,
            price: 380,
            rating: 4.6
          },
          {
            name: 'Concorrente B',
            occupancy: 70,
            price: 410,
            rating: 4.4
          }
        ],
        recommendations: [
          'Ocupação abaixo: reduza preço 5% ou invista em marketing',
          'Avaliação baixa: foque em limpeza e atendimento',
          'Hóspedes ficam menos: ofereça pacotes com desconto'
        ]
      };
    } catch (error) {
      console.error('Erro ao buscar dados de benchmark:', error);
      throw error;
    }
  }

  /**
   * Buscar histórico de benchmarks
   */
  async getBenchmarkHistory(
    userId: string,
    filters?: {
      startDate?: string;
      endDate?: string;
    }
  ): Promise<CompetitiveBenchmark[]> {
    try {
      let query = supabase
        .from('viajar_competitive_benchmarks')
        .select('*')
        .eq('user_id', userId)
        .order('period_start', { ascending: false });

      if (filters?.startDate) {
        query = query.gte('period_start', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('period_end', filters.endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as CompetitiveBenchmark[];
    } catch (error) {
      console.error('Erro ao buscar histórico de benchmarks:', error);
      return [];
    }
  }

  /**
   * Atualizar dados de benchmark
   */
  async updateBenchmarkData(
    id: string,
    updates: Partial<CompetitiveBenchmark>
  ): Promise<CompetitiveBenchmark> {
    try {
      const { data, error } = await supabase
        .from('viajar_competitive_benchmarks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as CompetitiveBenchmark;
    } catch (error) {
      console.error('Erro ao atualizar dados de benchmark:', error);
      throw error;
    }
  }
}

export const benchmarkService = new BenchmarkService();


