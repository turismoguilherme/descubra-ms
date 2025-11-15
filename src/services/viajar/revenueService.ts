/**
 * Revenue Service
 * Serviço para gerenciar otimizações de receita
 */

import { supabase } from '@/integrations/supabase/client';

export interface RevenueOptimization {
  id: string;
  user_id: string;
  date: string;
  current_price: number;
  suggested_price: number;
  occupancy_rate: number;
  applied: boolean;
  applied_at: string | null;
  actual_revenue: number | null;
  factors: {
    demand?: number;
    seasonality?: number;
    competition?: number;
    events?: string[];
  } | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export class RevenueService {
  /**
   * Salvar otimização aplicada
   */
  async saveOptimization(
    userId: string,
    optimization: {
      date: string;
      current_price: number;
      suggested_price: number;
      occupancy_rate: number;
      factors?: RevenueOptimization['factors'];
      notes?: string;
    }
  ): Promise<RevenueOptimization> {
    try {
      const { data, error } = await supabase
        .from('viajar_revenue_optimizations')
        .insert({
          user_id: userId,
          ...optimization,
          applied: false
        })
        .select()
        .single();

      if (error) throw error;
      return data as RevenueOptimization;
    } catch (error) {
      console.error('Erro ao salvar otimização:', error);
      throw error;
    }
  }

  /**
   * Marcar otimização como aplicada
   */
  async applyOptimization(
    id: string,
    actualRevenue?: number
  ): Promise<RevenueOptimization> {
    try {
      const { data, error } = await supabase
        .from('viajar_revenue_optimizations')
        .update({
          applied: true,
          applied_at: new Date().toISOString(),
          actual_revenue: actualRevenue || null
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as RevenueOptimization;
    } catch (error) {
      console.error('Erro ao aplicar otimização:', error);
      throw error;
    }
  }

  /**
   * Buscar histórico de otimizações
   */
  async getOptimizationHistory(
    userId: string,
    filters?: {
      startDate?: string;
      endDate?: string;
      applied?: boolean;
    }
  ): Promise<RevenueOptimization[]> {
    try {
      let query = supabase
        .from('viajar_revenue_optimizations')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (filters?.startDate) {
        query = query.gte('date', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('date', filters.endDate);
      }

      if (filters?.applied !== undefined) {
        query = query.eq('applied', filters.applied);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as RevenueOptimization[];
    } catch (error) {
      console.error('Erro ao buscar histórico de otimizações:', error);
      return [];
    }
  }

  /**
   * Buscar dados de receita (mockado, preparado para ALUMIA)
   */
  async getRevenueData(userId: string): Promise<any> {
    try {
      // Por enquanto retorna dados mockados
      // TODO: Integrar com ALUMIA API quando disponível
      return {
        nextDays: [
          { date: '15/Out', occupancy: 45, suggestedPrice: 320 },
          { date: '16/Out', occupancy: 48, suggestedPrice: 340 },
          { date: '17/Out', occupancy: 88, suggestedPrice: 580 },
          { date: '18/Out', occupancy: 65, suggestedPrice: 420 },
          { date: '19/Out', occupancy: 52, suggestedPrice: 360 },
          { date: '20/Out', occupancy: 40, suggestedPrice: 310 },
          { date: '21/Out', occupancy: 38, suggestedPrice: 300 }
        ],
        currentPrice: 400,
        averageOccupancy: 64,
        projectedIncrease: 35
      };
    } catch (error) {
      console.error('Erro ao buscar dados de receita:', error);
      throw error;
    }
  }

  /**
   * Buscar estatísticas de otimizações
   */
  async getOptimizationStats(userId: string): Promise<{
    total: number;
    applied: number;
    averageIncrease: number;
    totalRevenueIncrease: number;
  }> {
    try {
      const optimizations = await this.getOptimizationHistory(userId);
      const applied = optimizations.filter(o => o.applied);

      const averageIncrease = applied.length > 0
        ? applied.reduce((sum, o) => {
            const increase = ((o.suggested_price - o.current_price) / o.current_price) * 100;
            return sum + increase;
          }, 0) / applied.length
        : 0;

      const totalRevenueIncrease = applied.reduce((sum, o) => {
        return sum + (o.actual_revenue || 0);
      }, 0);

      return {
        total: optimizations.length,
        applied: applied.length,
        averageIncrease: Math.round(averageIncrease * 100) / 100,
        totalRevenueIncrease: Math.round(totalRevenueIncrease * 100) / 100
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return {
        total: 0,
        applied: 0,
        averageIncrease: 0,
        totalRevenueIncrease: 0
      };
    }
  }
}

export const revenueService = new RevenueService();

