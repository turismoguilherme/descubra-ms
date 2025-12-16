/**
 * Platform Metrics Service
 * Calcula métricas automaticamente e permite override manual via site_settings
 */

import { supabase } from '@/integrations/supabase/client';

export interface PlatformMetrics {
  tourists_impacted: number;
  satisfaction_percentage: number;
  tourist_spots: number;
  partners: number;
}

export interface PlatformMetricsWithSource extends PlatformMetrics {
  source: 'auto' | 'manual';
  last_updated?: string;
}

class PlatformMetricsService {
  /**
   * Calcula métricas automaticamente a partir do banco de dados
   */
  async calculateAutoMetrics(): Promise<PlatformMetrics> {
    try {
      // 1. Turistas Impactados: user_passports + tourist_surveys únicos
      const [passportsCount, surveysData] = await Promise.all([
        supabase
          .from('user_passports')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('tourist_surveys')
          .select('tourist_name, tourist_origin', { count: 'exact' })
          .limit(10000) // Limite para evitar timeout
      ]);

      const uniqueTourists = new Set<string>();
      (surveysData.data || []).forEach((survey: any) => {
        if (survey.tourist_name) {
          uniqueTourists.add(survey.tourist_name);
        }
      });

      const touristsImpacted = (passportsCount.count || 0) + uniqueTourists.size;

      // 2. Satisfação: média de ratings (tourist_surveys não tem rating, então vamos usar inventory_reviews)
      const { data: reviews } = await supabase
        .from('inventory_reviews')
        .select('rating')
        .eq('is_approved', true);

      let satisfactionPercentage = 0;
      if (reviews && reviews.length > 0) {
        const avgRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length;
        // Converter de 1-5 para porcentagem (1 = 20%, 5 = 100%)
        satisfactionPercentage = Math.round((avgRating / 5) * 100);
      }

      // 3. Pontos Turísticos: destinations + tourism_inventory ativos
      const [destinationsCount, inventoryCount] = await Promise.all([
        supabase
          .from('destinations')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('tourism_inventory')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true)
          .eq('status', 'approved')
      ]);

      const touristSpots = (destinationsCount.count || 0) + (inventoryCount.count || 0);

      // 4. Parceiros: institutional_partners ativos
      const { count: partnersCount } = await supabase
        .from('institutional_partners')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      return {
        tourists_impacted: touristsImpacted,
        satisfaction_percentage: satisfactionPercentage || 0,
        tourist_spots: touristSpots || 0,
        partners: partnersCount || 0,
      };
    } catch (error) {
      console.error('Erro ao calcular métricas automáticas:', error);
      // Retornar valores padrão em caso de erro
      return {
        tourists_impacted: 0,
        satisfaction_percentage: 0,
        tourist_spots: 0,
        partners: 0,
      };
    }
  }

  /**
   * Busca métricas manuais do site_settings
   */
  async getManualMetrics(): Promise<PlatformMetrics | null> {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value, updated_at')
        .eq('platform', 'viajar')
        .eq('setting_key', 'platform_metrics')
        .single();

      if (error || !data) return null;

      return {
        tourists_impacted: data.setting_value?.tourists_impacted || 0,
        satisfaction_percentage: data.setting_value?.satisfaction_percentage || 0,
        tourist_spots: data.setting_value?.tourist_spots || 0,
        partners: data.setting_value?.partners || 0,
      };
    } catch (error) {
      console.error('Erro ao buscar métricas manuais:', error);
      return null;
    }
  }

  /**
   * Salva métricas manuais no site_settings
   */
  async saveManualMetrics(metrics: PlatformMetrics): Promise<void> {
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          platform: 'viajar',
          setting_key: 'platform_metrics',
          setting_value: metrics,
          description: 'Métricas públicas da plataforma (pode ser override manual)',
        }, {
          onConflict: 'platform,setting_key'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao salvar métricas manuais:', error);
      throw error;
    }
  }

  /**
   * Busca métricas finais (híbrido: manual se existir, senão automático)
   */
  async getMetrics(): Promise<PlatformMetricsWithSource> {
    const manualMetrics = await this.getManualMetrics();
    
    if (manualMetrics && this.hasManualValues(manualMetrics)) {
      // Se há valores manuais definidos, usar eles
      return {
        ...manualMetrics,
        source: 'manual',
      };
    }

    // Caso contrário, calcular automaticamente
    const autoMetrics = await this.calculateAutoMetrics();
    return {
      ...autoMetrics,
      source: 'auto',
    };
  }

  /**
   * Verifica se há valores manuais definidos (não zero)
   */
  private hasManualValues(metrics: PlatformMetrics): boolean {
    return (
      metrics.tourists_impacted > 0 ||
      metrics.satisfaction_percentage > 0 ||
      metrics.tourist_spots > 0 ||
      metrics.partners > 0
    );
  }

  /**
   * Formata número para exibição (ex: 50000 -> "50K+")
   */
  formatNumber(value: number): string {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M+`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K+`;
    }
    return `${value}+`;
  }

  /**
   * Formata porcentagem (ex: 95 -> "95%")
   */
  formatPercentage(value: number): string {
    return `${value}%`;
  }
}

export const platformMetricsService = new PlatformMetricsService();
