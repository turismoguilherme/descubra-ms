/**
 * API Usage Tracking Service
 * Rastreia uso de APIs por usuário e data
 */

import { supabase } from '@/integrations/supabase/client';
import { APIType } from './apiCacheService';

export interface APIUsage {
  userId: string;
  date: string; // YYYY-MM-DD
  geminiCalls: number;
  googleSearchCalls: number;
  openweatherCalls: number;
  googlePlacesCalls: number;
}

export interface UsageStats {
  today: APIUsage;
  thisMonth: {
    gemini: number;
    googleSearch: number;
    openweather: number;
    googlePlaces: number;
    total: number;
  };
}

class APIUsageTrackingService {
  /**
   * Incrementa contador de uso de uma API
   */
  async incrementUsage(
    userId: string,
    apiType: APIType,
    count: number = 1
  ): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Buscar registro do dia
      const { data: existing } = await supabase
        .from('api_usage')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      const fieldMap: Record<APIType, string> = {
        gemini: 'gemini_calls',
        google_search: 'google_search_calls',
        openweather: 'openweather_calls',
        google_places: 'google_places_calls',
      };

      const field = fieldMap[apiType];

      if (existing) {
        // Atualizar existente
        await supabase
          .from('api_usage')
          .update({
            [field]: (existing[field] || 0) + count,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        // Criar novo
        await supabase
          .from('api_usage')
          .insert({
            user_id: userId,
            date: today,
            [field]: count,
          });
      }
    } catch (error) {
      console.error(`Erro ao incrementar uso de ${apiType}:`, error);
    }
  }

  /**
   * Obtém uso do dia atual
   */
  async getTodayUsage(userId: string): Promise<APIUsage | null> {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('api_usage')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      if (error || !data) {
        return {
          userId,
          date: today,
          geminiCalls: 0,
          googleSearchCalls: 0,
          openweatherCalls: 0,
          googlePlacesCalls: 0,
        };
      }

      return {
        userId: data.user_id,
        date: data.date,
        geminiCalls: data.gemini_calls || 0,
        googleSearchCalls: data.google_search_calls || 0,
        openweatherCalls: data.openweather_calls || 0,
        googlePlacesCalls: data.google_places_calls || 0,
      };
    } catch (error) {
      console.error('Erro ao buscar uso do dia:', error);
      return null;
    }
  }

  /**
   * Obtém estatísticas de uso
   */
  async getUsageStats(userId: string): Promise<UsageStats | null> {
    try {
      const today = await this.getTodayUsage(userId);
      if (!today) return null;

      // Buscar uso do mês atual
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString().split('T')[0];
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString().split('T')[0];

      const { data: monthlyData } = await supabase
        .from('api_usage')
        .select('*')
        .eq('user_id', userId)
        .gte('date', firstDayOfMonth)
        .lte('date', lastDayOfMonth);

      const monthly = {
        gemini: 0,
        googleSearch: 0,
        openweather: 0,
        googlePlaces: 0,
        total: 0,
      };

      if (monthlyData) {
        monthlyData.forEach((entry) => {
          monthly.gemini += entry.gemini_calls || 0;
          monthly.googleSearch += entry.google_search_calls || 0;
          monthly.openweather += entry.openweather_calls || 0;
          monthly.googlePlaces += entry.google_places_calls || 0;
        });

        monthly.total = monthly.gemini + monthly.googleSearch + 
                       monthly.openweather + monthly.googlePlaces;
      }

      return {
        today,
        thisMonth: monthly,
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de uso:', error);
      return null;
    }
  }
}

export const apiUsageTrackingService = new APIUsageTrackingService();

