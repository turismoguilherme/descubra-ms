import { supabase } from '@/integrations/supabase/client';

export type DataSourceType = 'alumia' | 'ibge' | 'manual';

export interface DataSourceConfig {
  state: string;
  apiType: DataSourceType;
  apiUrl?: string;
  apiKey?: string;
}

export interface RegionalMetric {
  value: number;
  source: DataSourceType;
  confidence: 'high' | 'medium' | 'low';
  lastUpdate: string;
  isEstimated: boolean;
}

class RegionalDataService {
  private stateConfigs: Record<string, DataSourceConfig> = {
    'MS': { 
      state: 'MS', 
      apiType: 'alumia', 
      apiUrl: process.env.ALUMIA_API_URL || 'https://api.alumia.ms.gov.br'
    },
    'SP': { state: 'SP', apiType: 'ibge' },
    'RJ': { state: 'RJ', apiType: 'ibge' },
    'MG': { state: 'MG', apiType: 'ibge' },
    'default': { state: 'default', apiType: 'manual' }
  };

  async getData(stateCode: string, metricType: string): Promise<RegionalMetric | null> {
    const config = this.stateConfigs[stateCode] || this.stateConfigs['default'];
    
    try {
      switch (config.apiType) {
        case 'alumia':
          return await this.fetchFromAlumia(config, metricType);
        case 'ibge':
          return await this.fetchFromIBGE(stateCode, metricType);
        case 'manual':
          return await this.fetchFromSupabase(stateCode, metricType);
        default:
          return null;
      }
    } catch (error) {
      console.error(`Erro ao buscar dados regionais para ${stateCode}:`, error);
      // Fallback para dados do Supabase
      return await this.fetchFromSupabase(stateCode, metricType);
    }
  }

  private async fetchFromAlumia(config: DataSourceConfig, metricType: string): Promise<RegionalMetric> {
    // Implementação futura da API Alumia
    // Por enquanto, retorna dados de exemplo
    console.log(`Buscando de Alumia: ${metricType}`);
    
    return {
      value: 0,
      source: 'alumia',
      confidence: 'high',
      lastUpdate: new Date().toISOString(),
      isEstimated: false
    };
  }

  private async fetchFromIBGE(stateCode: string, metricType: string): Promise<RegionalMetric> {
    // API IBGE para dados turísticos
    // https://servicodados.ibge.gov.br/api/docs
    console.log(`Buscando de IBGE: ${stateCode} - ${metricType}`);
    
    return {
      value: 0,
      source: 'ibge',
      confidence: 'medium',
      lastUpdate: new Date().toISOString(),
      isEstimated: true
    };
  }

  private async fetchFromSupabase(stateCode: string, metricType: string): Promise<RegionalMetric | null> {
    const { data, error } = await supabase
      .from('flowtrip_usage_metrics')
      .select('metric_value, recorded_date')
      .eq('metric_type', metricType)
      .order('recorded_date', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      value: data.metric_value,
      source: 'manual',
      confidence: 'low',
      lastUpdate: data.recorded_date || new Date().toISOString(),
      isEstimated: false
    };
  }

  async saveManualData(stateCode: string, metricType: string, value: number): Promise<void> {
    const { data: stateData } = await supabase
      .from('flowtrip_states')
      .select('id')
      .eq('code', stateCode)
      .single();

    if (!stateData) {
      throw new Error(`Estado ${stateCode} não encontrado`);
    }

    await supabase.from('flowtrip_usage_metrics').insert({
      client_id: null,
      metric_type: metricType,
      metric_value: value,
      recorded_date: new Date().toISOString(),
      metadata: {
        source: 'manual',
        state_code: stateCode
      }
    });
  }
}

export const regionalDataService = new RegionalDataService();
