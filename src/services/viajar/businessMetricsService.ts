/**
 * Business Metrics Service
 * Serviço para salvar, buscar e calcular métricas de negócios
 */

import { supabase } from '@/integrations/supabase/client';

export type MetricType = 'occupancy' | 'revenue' | 'visitors' | 'ticket_avg' | 'table_turnover' | 'pax' | 'adr' | 'revpar';

export interface BusinessMetric {
  id: string;
  user_id: string;
  metric_date: string;
  metric_type: MetricType;
  value: number;
  source: 'manual' | 'document_upload' | 'api' | 'channel_manager';
  document_id?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CityAverage {
  metric_type: MetricType;
  average: number;
  count: number; // Número de negócios que contribuíram
  min: number;
  max: number;
}

export interface BusinessMetricsService {
  saveMetric(
    userId: string,
    metricDate: string,
    metricType: MetricType,
    value: number,
    source?: 'manual' | 'document_upload' | 'api' | 'channel_manager',
    documentId?: string,
    metadata?: Record<string, any>
  ): Promise<BusinessMetric>;

  getMetrics(
    userId: string,
    startDate?: string,
    endDate?: string,
    metricType?: MetricType
  ): Promise<BusinessMetric[]>;

  getCityAverages(
    cityId: string,
    metricType?: MetricType,
    startDate?: string,
    endDate?: string
  ): Promise<CityAverage[]>;

  deleteMetric(metricId: string): Promise<void>;
}

class BusinessMetricsServiceImpl implements BusinessMetricsService {
  /**
   * Salvar uma métrica
   */
  async saveMetric(
    userId: string,
    metricDate: string,
    metricType: MetricType,
    value: number,
    source: 'manual' | 'document_upload' | 'api' | 'channel_manager' = 'manual',
    documentId?: string,
    metadata?: Record<string, any>
  ): Promise<BusinessMetric> {
    const { data, error } = await supabase
      .from('business_metrics')
      .insert({
        user_id: userId,
        metric_date: metricDate,
        metric_type: metricType,
        value: value,
        source: source,
        document_id: documentId || null,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (error) {
      // Se for erro de duplicata, fazer update
      if (error.code === '23505') {
        const { data: updated, error: updateError } = await supabase
          .from('business_metrics')
          .update({
            value: value,
            source: source,
            document_id: documentId || null,
            metadata: metadata || {},
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
          .eq('metric_date', metricDate)
          .eq('metric_type', metricType)
          .select()
          .single();

        if (updateError) throw updateError;
        return updated as BusinessMetric;
      }
      throw error;
    }

    return data as BusinessMetric;
  }

  /**
   * Buscar métricas do usuário
   */
  async getMetrics(
    userId: string,
    startDate?: string,
    endDate?: string,
    metricType?: MetricType
  ): Promise<BusinessMetric[]> {
    let query = supabase
      .from('business_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('metric_date', { ascending: false });

    if (startDate) {
      query = query.gte('metric_date', startDate);
    }

    if (endDate) {
      query = query.lte('metric_date', endDate);
    }

    if (metricType) {
      query = query.eq('metric_type', metricType);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []) as BusinessMetric[];
  }

  /**
   * Calcular médias da cidade (agregadas e anonimizadas)
   * Requer no mínimo 5 negócios para garantir privacidade (LGPD)
   */
  async getCityAverages(
    cityId: string,
    metricType?: MetricType,
    startDate?: string,
    endDate?: string
  ): Promise<CityAverage[]> {
    // Buscar todos os user_ids da cidade
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('city_id', cityId)
      .not('business_category', 'is', null);

    if (profilesError) throw profilesError;

    if (!profiles || profiles.length < 5) {
      // Não retornar dados se houver menos de 5 negócios (LGPD)
      return [];
    }

    const userIds = profiles.map(p => p.user_id);

    // Buscar métricas agregadas
    let query = supabase
      .from('business_metrics')
      .select('metric_type, value')
      .in('user_id', userIds);

    if (metricType) {
      query = query.eq('metric_type', metricType);
    }

    if (startDate) {
      query = query.gte('metric_date', startDate);
    }

    if (endDate) {
      query = query.lte('metric_date', endDate);
    }

    const { data: metrics, error: metricsError } = await query;

    if (metricsError) throw metricsError;

    if (!metrics || metrics.length === 0) {
      return [];
    }

    // Agrupar por tipo de métrica e calcular estatísticas
    const grouped = metrics.reduce((acc, metric) => {
      const type = metric.metric_type as MetricType;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(metric.value);
      return acc;
    }, {} as Record<MetricType, number[]>);

    // Calcular médias, min, max para cada tipo
    const averages: CityAverage[] = Object.entries(grouped).map(([type, values]) => {
      const nums = values as number[];
      const sum = nums.reduce((a, b) => a + b, 0);
      const avg = sum / nums.length;
      const min = Math.min(...nums);
      const max = Math.max(...nums);

      return {
        metric_type: type as MetricType,
        average: Math.round(avg * 100) / 100, // Arredondar para 2 casas decimais
        count: profiles.length, // Número de negócios (não valores individuais para privacidade)
        min: Math.round(min * 100) / 100,
        max: Math.round(max * 100) / 100,
      };
    });

    return averages;
  }

  /**
   * Deletar uma métrica
   */
  async deleteMetric(metricId: string): Promise<void> {
    const { error } = await supabase
      .from('business_metrics')
      .delete()
      .eq('id', metricId);

    if (error) throw error;
  }
}

// Exportar instância singleton
export const businessMetricsService = new BusinessMetricsServiceImpl();

