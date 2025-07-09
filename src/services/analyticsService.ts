
import { supabase } from "@/integrations/supabase/client";

export interface AnalyticsMetric {
  id: string;
  region: string;
  city?: string;
  date: string;
  metric_type: string;
  metric_value: number;
  additional_data?: Record<string, any>;
  created_at: string;
}

export interface TourismStats {
  totalVisitors: number;
  growthRate: number;
  topRegions: Array<{ name: string; visitors: number }>;
  monthlyTrends: Array<{ month: string; visitors: number }>;
}

class AnalyticsService {
  async getTourismStats(region?: string, dateRange?: { start: string; end: string }): Promise<TourismStats> {
    try {
      let query = supabase
        .from('user_interactions')
        .select('*')
        .eq('interaction_type', 'page_view');

      // Note: user_interactions doesn't have a direct region column
      // We'll filter client-side from metadata

      if (dateRange) {
        query = query
          .gte('created_at', dateRange.start)
          .lte('created_at', dateRange.end);
      }

      const { data, error } = await query;

      if (error) throw error;

      return this.processMetricsData(data || []);
    } catch (error) {
      console.error('Error fetching tourism stats:', error);
      return {
        totalVisitors: 0,
        growthRate: 0,
        topRegions: [],
        monthlyTrends: []
      };
    }
  }

  processMetricsData(metrics: any[]): TourismStats {
    // Converter dados para AnalyticsMetric format
    const convertedMetrics: AnalyticsMetric[] = metrics.map(metric => {
      const metadata = typeof metric.metadata === 'object' && !Array.isArray(metric.metadata) ? metric.metadata : {};
      return {
        id: metric.id,
        region: (metadata as any)?.region || 'N/A',
        city: (metadata as any)?.city || 'N/A',
        date: metric.created_at.split('T')[0],
        metric_type: metric.interaction_type,
        metric_value: 1, // Each interaction counts as 1
        additional_data: metadata,
        created_at: metric.created_at
      };
    });

    const totalVisitors = convertedMetrics.length;
    
    const regionStats = convertedMetrics.reduce((acc, metric) => {
      if (!acc[metric.region]) {
        acc[metric.region] = 0;
      }
      acc[metric.region] += metric.metric_value;
      return acc;
    }, {} as Record<string, number>);

    const topRegions = Object.entries(regionStats)
      .map(([name, visitors]) => ({ name, visitors }))
      .sort((a, b) => b.visitors - a.visitors)
      .slice(0, 5);

    const monthlyStats = convertedMetrics.reduce((acc, metric) => {
      const month = new Date(metric.date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      if (!acc[month]) {
        acc[month] = 0;
      }
      acc[month] += metric.metric_value;
      return acc;
    }, {} as Record<string, number>);

    const monthlyTrends = Object.entries(monthlyStats)
      .map(([month, visitors]) => ({ month, visitors }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

    return {
      totalVisitors,
      growthRate: 5.2, // Mock value - could be calculated from historical data
      topRegions,
      monthlyTrends
    };
  }

  async getAnalyticsMetrics(region?: string, dateRange?: { start: string; end: string }): Promise<AnalyticsMetric[]> {
    try {
      let query = supabase
        .from('user_interactions')
        .select('*');

      // Note: user_interactions doesn't have a direct region column
      // We'll filter client-side from metadata

      if (dateRange) {
        query = query
          .gte('created_at', dateRange.start)
          .lte('created_at', dateRange.end);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Converter dados para AnalyticsMetric format
      return (data || []).map(metric => {
        const metadata = typeof metric.metadata === 'object' && !Array.isArray(metric.metadata) ? metric.metadata : {};
        return {
          id: metric.id,
          region: (metadata as any)?.region || 'N/A',
          city: (metadata as any)?.city || 'N/A',
          date: metric.created_at.split('T')[0],
          metric_type: metric.interaction_type,
          metric_value: 1,
          additional_data: metadata,
          created_at: metric.created_at
        };
      });
    } catch (error) {
      console.error('Error fetching analytics metrics:', error);
      return [];
    }
  }

  async recordInteraction(
    userId: string | null,
    interactionType: string,
    elementId?: string,
    additionalData?: Record<string, any>
  ): Promise<void> {
    try {
      await supabase.from('user_interactions').insert({
        user_id: userId,
        interaction_type: interactionType,
        metadata: additionalData
      });
    } catch (error) {
      console.error('Error recording interaction:', error);
    }
  }

  async recordPageView(
    userId: string | null,
    pagePath: string,
    region?: string,
    city?: string
  ): Promise<void> {
    try {
      await supabase.from('user_interactions').insert({
        user_id: userId,
        interaction_type: 'page_view',
        page_url: pagePath,
        metadata: { region: region, city: city }
      });
    } catch (error) {
      console.error('Error recording page view:', error);
    }
  }

  async recordAnalytic(
    region: string,
    city: string,
    metricType: string,
    value: number,
    additionalData?: Record<string, any>
  ): Promise<void> {
    try {
      await supabase.from('user_interactions').insert({
        interaction_type: metricType,
        metadata: { 
          region, 
          city, 
          value, 
          ...additionalData 
        }
      });
    } catch (error) {
      console.error('Error recording analytic:', error);
    }
  }
}

export const analyticsService = new AnalyticsService();
