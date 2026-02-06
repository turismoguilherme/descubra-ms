/**
 * Revenue Service
 * Serviço para gerenciar otimizações de receita
 */

import { supabase } from '@/integrations/supabase/client';
import { generateContent } from '@/config/gemini';

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

  /**
   * Calcular preço sugerido usando Gemini (ao invés de pesos fixos)
   */
  async calculateSuggestedPrice(
    currentPrice: number,
    occupancyRate: number,
    factors: {
      demand?: number; // 0-100
      seasonality?: number; // 0-100
      competition?: number; // 0-100 (preço médio dos concorrentes)
      events?: string[];
      weather?: string;
      historicalData?: Array<{ date: string; price: number; occupancy: number }>;
    },
    businessCategory?: string,
    userId?: string
  ): Promise<{
    suggestedPrice: number;
    confidence: number;
    reasoning: string;
    factors: RevenueOptimization['factors'];
    fromCache?: boolean;
  }> {
    try {
      // Construir chave de cache baseada nos parâmetros
      const cacheKey = JSON.stringify({
        currentPrice: Math.round(currentPrice),
        occupancyRate: Math.round(occupancyRate),
        demand: factors.demand ? Math.round(factors.demand) : null,
        seasonality: factors.seasonality ? Math.round(factors.seasonality) : null,
        competition: factors.competition ? Math.round(factors.competition) : null,
        businessCategory,
      });

      // Verificar cache primeiro
      const { apiCacheService } = await import('./apiCacheService');
      const cacheResult = await apiCacheService.getFromCache('gemini', cacheKey);

      if (cacheResult.found && cacheResult.response) {
        console.log('✅ Revenue Optimizer: Usando cache - Economizou 1 chamada Gemini');
        return {
          ...cacheResult.response,
          fromCache: true,
        };
      }

      // Construir prompt para Gemini
      const prompt = `Você é um especialista em revenue management para negócios de turismo.

Analise os seguintes dados e sugira o preço otimizado:

PREÇO ATUAL: R$ ${currentPrice.toFixed(2)}
TAXA DE OCUPAÇÃO: ${occupancyRate}%
CATEGORIA DO NEGÓCIO: ${businessCategory || 'não especificada'}

FATORES:
- Demanda: ${factors.demand !== undefined ? factors.demand + '%' : 'não disponível'}
- Sazonalidade: ${factors.seasonality !== undefined ? factors.seasonality + '%' : 'não disponível'}
- Competição (preço médio): ${factors.competition !== undefined ? 'R$ ' + factors.competition.toFixed(2) : 'não disponível'}
- Eventos próximos: ${factors.events && factors.events.length > 0 ? factors.events.join(', ') : 'nenhum'}
- Clima: ${factors.weather || 'não disponível'}

${factors.historicalData && factors.historicalData.length > 0 ? `
DADOS HISTÓRICOS (últimos ${factors.historicalData.length} registros):
${factors.historicalData.slice(-10).map(d => `- ${d.date}: R$ ${d.price.toFixed(2)} (ocupação: ${d.occupancy}%)`).join('\n')}
` : ''}

INSTRUÇÕES:
1. Analise todos os fatores fornecidos
2. Considere a relação entre ocupação e preço (elasticidade)
3. Se ocupação está baixa (< 50%), considere reduzir preço para aumentar demanda
4. Se ocupação está alta (> 80%), considere aumentar preço para maximizar receita
5. Considere eventos próximos que podem aumentar demanda
6. Considere sazonalidade e clima
7. Compare com preço dos concorrentes se disponível
8. Seja conservador: não sugira aumentos/reduções muito agressivos (> 30%)

Retorne APENAS um JSON válido no formato:
{
  "suggestedPrice": número (preço sugerido em R$),
  "confidence": número (0.0-1.0),
  "reasoning": "explicação breve do raciocínio",
  "priceChange": número (percentual de mudança, positivo para aumento, negativo para redução)
}

IMPORTANTE: Retorne APENAS o JSON, sem markdown, sem explicações adicionais.`;

      const response = await generateContent(
        'Você é um especialista em revenue management para turismo. Analise os dados e sugira o preço otimizado.',
        prompt
      );

      if (!response.ok || !response.text) {
        throw new Error('Erro ao gerar otimização com Gemini');
      }

      // Parsear resposta JSON
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Resposta do Gemini não contém JSON válido');
      }

      const result = JSON.parse(jsonMatch[0]);

      // Validar e normalizar
      const suggestedPrice = Math.max(0, Math.min(result.suggestedPrice || currentPrice, currentPrice * 2));
      const confidence = Math.max(0, Math.min(1, result.confidence || 0.7));
      const reasoning = result.reasoning || 'Análise baseada nos fatores fornecidos';

      const optimizationResult = {
        suggestedPrice: Math.round(suggestedPrice * 100) / 100,
        confidence,
        reasoning,
        factors: {
          demand: factors.demand,
          seasonality: factors.seasonality,
          competition: factors.competition,
          events: factors.events,
        },
      };

      // Salvar no cache
      await apiCacheService.saveToCache('gemini', cacheKey, optimizationResult);

      // Registrar uso (se tiver userId)
      if (userId) {
        const { apiUsageTrackingService } = await import('./apiUsageTrackingService');
        await apiUsageTrackingService.incrementUsage(userId, 'gemini', 1);
      }

      return optimizationResult;
    } catch (error) {
      console.error('Erro ao calcular preço sugerido com Gemini:', error);
      
      // Fallback: cálculo simples baseado em ocupação
      let suggestedPrice = currentPrice;
      if (occupancyRate < 50) {
        suggestedPrice = currentPrice * 0.9; // Reduzir 10% se ocupação baixa
      } else if (occupancyRate > 80) {
        suggestedPrice = currentPrice * 1.1; // Aumentar 10% se ocupação alta
      }

      return {
        suggestedPrice: Math.round(suggestedPrice * 100) / 100,
        confidence: 0.5,
        reasoning: 'Cálculo simplificado baseado apenas na taxa de ocupação (fallback)',
        factors: {
          demand: factors.demand,
          seasonality: factors.seasonality,
          competition: factors.competition,
          events: factors.events,
        },
      };
    }
  }
}

export const revenueService = new RevenueService();

