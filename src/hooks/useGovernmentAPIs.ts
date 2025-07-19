import { useState, useEffect, useCallback } from 'react';
import { governmentAPI } from '@/services/governmentAPIs';
import { 
  UseGovernmentAPIResult, 
  TourismData, 
  WeatherData, 
  TransportData,
  RealTimeData,
  APIStats 
} from '@/services/governmentAPIs/types';

// Hook principal para APIs governamentais
export const useGovernmentAPIs = (): UseGovernmentAPIResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const realTimeData = await governmentAPI.getRealTimeData();
      setData(realTimeData);
      setLastUpdate(new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCache = useCallback(() => {
    governmentAPI.clearCache();
    setData(null);
    setLastUpdate(null);
  }, []);

  const getStats = useCallback((): APIStats => {
    const cacheStats = governmentAPI.getCacheStats();
    return {
      totalRequests: 0, // Implementar contador
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      cacheHitRate: cacheStats.size > 0 ? 0.8 : 0, // Mock
      lastReset: new Date().toISOString()
    };
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    loading,
    error,
    data,
    lastUpdate,
    refetch,
    clearCache,
    getStats
  };
};

// Hook específico para dados turísticos
export const useTourismData = (state: string = 'MS') => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TourismData[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const tourismData = await governmentAPI.getMinistryTourismData(state);
      setData(tourismData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados turísticos');
    } finally {
      setLoading(false);
    }
  }, [state]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    loading,
    error,
    data,
    refetch: fetchData
  };
};

// Hook específico para dados meteorológicos
export const useWeatherData = (cityCode: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<WeatherData | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const weatherData = await governmentAPI.getWeatherData(cityCode);
      setData(weatherData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados meteorológicos');
    } finally {
      setLoading(false);
    }
  }, [cityCode]);

  useEffect(() => {
    if (cityCode) {
      fetchData();
    }
  }, [cityCode, fetchData]);

  return {
    loading,
    error,
    data,
    refetch: fetchData
  };
};

// Hook específico para dados de transporte
export const useTransportData = (origin: string, destination: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TransportData[]>([]);

  const fetchData = useCallback(async () => {
    if (!origin || !destination) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const transportData = await governmentAPI.getTransportData(origin, destination);
      setData(transportData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados de transporte');
    } finally {
      setLoading(false);
    }
  }, [origin, destination]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    loading,
    error,
    data,
    refetch: fetchData
  };
};

// Hook específico para dados em tempo real
export const useRealTimeData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RealTimeData | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const realTimeData = await governmentAPI.getRealTimeData();
      setData(realTimeData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados em tempo real');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    // Atualizar dados a cada 5 minutos
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    loading,
    error,
    data,
    refetch: fetchData
  };
};

// Hook para dados do IBGE
export const useIBGEData = (municipalityCode?: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const ibgeData = await governmentAPI.getIBGEData(municipalityCode);
      setData(ibgeData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados do IBGE');
    } finally {
      setLoading(false);
    }
  }, [municipalityCode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    loading,
    error,
    data,
    refetch: fetchData
  };
};

// Hook para dados da Fundtur-MS
export const useFundturMSData = (endpoint: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const fundturData = await governmentAPI.getFundturMSData(endpoint);
      setData(fundturData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados da Fundtur-MS');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    if (endpoint) {
      fetchData();
    }
  }, [endpoint, fetchData]);

  return {
    loading,
    error,
    data,
    refetch: fetchData
  };
};

// Hook para múltiplas APIs simultaneamente
export const useMultipleAPIs = (apis: Array<{ type: string; params: any }>) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Record<string, any>>({});

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await Promise.allSettled(
        apis.map(async (api) => {
          switch (api.type) {
            case 'tourism':
              return governmentAPI.getMinistryTourismData(api.params.state);
            case 'weather':
              return governmentAPI.getWeatherData(api.params.cityCode);
            case 'transport':
              return governmentAPI.getTransportData(api.params.origin, api.params.destination);
            case 'realtime':
              return governmentAPI.getRealTimeData();
            case 'ibge':
              return governmentAPI.getIBGEData(api.params.municipalityCode);
            case 'fundtur':
              return governmentAPI.getFundturMSData(api.params.endpoint);
            default:
              throw new Error(`Tipo de API não suportado: ${api.type}`);
          }
        })
      );

      const newData: Record<string, any> = {};
      results.forEach((result, index) => {
        const apiType = apis[index].type;
        if (result.status === 'fulfilled') {
          newData[apiType] = result.value;
        } else {
          newData[apiType] = { error: result.reason.message };
        }
      });

      setData(newData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [apis]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    loading,
    error,
    data,
    refetch: fetchAllData
  };
}; 