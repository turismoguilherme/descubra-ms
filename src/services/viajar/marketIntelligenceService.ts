/**
 * Market Intelligence Service
 * Serviço para gerenciar dados de inteligência de mercado
 */

import { supabase } from '@/integrations/supabase/client';

export interface MarketIntelligence {
  id: string;
  user_id: string;
  period_start: string;
  period_end: string;
  tourist_origins: {
    [key: string]: number;
  } | null;
  demographic_profile: {
    age_range?: string;
    income_level?: string;
    transport_preference?: string;
    stay_duration?: string;
    booking_window?: string;
  } | null;
  marketing_roi: {
    [channel: string]: number;
  } | null;
  insights: string[] | null;
  recommendations: string[] | null;
  created_at: string;
  updated_at: string;
}

export class MarketIntelligenceService {
  /**
   * Salvar dados de inteligência de mercado
   */
  async saveMarketData(
    userId: string,
    data: {
      period_start: string;
      period_end: string;
      tourist_origins?: MarketIntelligence['tourist_origins'];
      demographic_profile?: MarketIntelligence['demographic_profile'];
      marketing_roi?: MarketIntelligence['marketing_roi'];
      insights?: string[];
      recommendations?: string[];
    }
  ): Promise<MarketIntelligence> {
    try {
      const { data: result, error } = await supabase
        .from('viajar_market_intelligence')
        .insert({
          user_id: userId,
          ...data
        })
        .select()
        .single();

      if (error) throw error;
      return result as MarketIntelligence;
    } catch (error) {
      console.error('Erro ao salvar dados de mercado:', error);
      throw error;
    }
  }

  /**
   * Buscar dados de inteligência de mercado (mockado, preparado para ALUMIA)
   */
  async getMarketIntelligence(userId: string): Promise<any> {
    try {
      // Por enquanto retorna dados mockados
      // TODO: Integrar com ALUMIA API quando disponível
      return {
        touristOrigins: {
          'São Paulo': 45,
          'Paraná': 30,
          'Santa Catarina': 15,
          'Rio de Janeiro': 7,
          'Outros': 3
        },
        demographicProfile: {
          ageRange: '35-50 anos',
          incomeLevel: 'Classe A/B',
          transportPreference: 'Carro próprio (85%)',
          stayDuration: '3-4 dias',
          bookingWindow: '15-30 dias antes'
        },
        marketingROI: {
          email: 7.5,
          google_ads: 6.0,
          instagram: 6.0,
          facebook: 4.0
        },
        insights: [
          'Invista 70% em SP (maior volume)',
          'Anuncie 15-30 dias antes (janela de decisão)',
          'Email tem maior ROI - crie newsletter'
        ]
      };
    } catch (error) {
      console.error('Erro ao buscar inteligência de mercado:', error);
      throw error;
    }
  }

  /**
   * Buscar histórico de análises de mercado
   */
  async getMarketDataHistory(
    userId: string,
    filters?: {
      startDate?: string;
      endDate?: string;
    }
  ): Promise<MarketIntelligence[]> {
    try {
      let query = supabase
        .from('viajar_market_intelligence')
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
      return (data || []) as MarketIntelligence[];
    } catch (error) {
      console.error('Erro ao buscar histórico de mercado:', error);
      return [];
    }
  }

  /**
   * Atualizar dados de mercado
   */
  async updateMarketData(
    id: string,
    updates: Partial<MarketIntelligence>
  ): Promise<MarketIntelligence> {
    try {
      const { data, error } = await supabase
        .from('viajar_market_intelligence')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as MarketIntelligence;
    } catch (error) {
      console.error('Erro ao atualizar dados de mercado:', error);
      throw error;
    }
  }
}

export const marketIntelligenceService = new MarketIntelligenceService();

