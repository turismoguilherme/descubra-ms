import { useState, useEffect } from 'react';
import { TourismRegion, MSRegion, UseRegionsReturn, MS_REGIONS } from '@/types/regions';

export const useRegions = (): UseRegionsReturn => {
  const [regions, setRegions] = useState<TourismRegion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // console.log('🔍 DEBUG: useRegions hook iniciado');

  // Carregar regiões - usando dados locais por enquanto
  const fetchRegions = async () => {
    try {
      // console.log('🔄 DEBUG: Iniciando fetchRegions');
      setLoading(true);
      setError(null);

      // Simular delay de carregamento
      await new Promise(resolve => setTimeout(resolve, 500));

      // Usar dados locais das regiões do MS
      const localRegions = MS_REGIONS.map(region => ({
        id: region.slug, // Usar slug como ID
        name: region.name,
        slug: region.slug,
        description: region.description,
        cities: region.cities,
        coordinates: region.coordinates,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      // console.log('✅ DEBUG: Regiões processadas:', localRegions.length);
      // console.log('📊 DEBUG: Dados das regiões:', localRegions);

      setRegions(localRegions);
      console.log('✅ Regiões carregadas com sucesso:', localRegions.length);
    } catch (err) {
      console.error('❌ Erro ao carregar regiões:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      
      // Fallback para dados locais
      const fallbackRegions = MS_REGIONS.map(region => ({
        id: region.slug,
        name: region.name,
        slug: region.slug,
        description: region.description,
        cities: region.cities,
        coordinates: region.coordinates,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      setRegions(fallbackRegions);
    } finally {
      setLoading(false);
      // console.log('🏁 DEBUG: fetchRegions finalizado');
    }
  };

  // Buscar região por slug
  const getRegionBySlug = (slug: string): TourismRegion | undefined => {
    console.log('🔍 DEBUG: getRegionBySlug chamado com slug:', slug);
    const result = regions.find(region => region.slug === slug);
    console.log('🔍 DEBUG: getRegionBySlug resultado:', result);
    return result;
  };

  // Buscar regiões por cidade
  const getRegionsByCity = (city: string): TourismRegion[] => {
    console.log('🔍 DEBUG: getRegionsByCity chamado com cidade:', city);
    const result = regions.filter(region => 
      region.cities.some(c => 
        c.toLowerCase().includes(city.toLowerCase())
      )
    );
    console.log('🔍 DEBUG: getRegionsByCity resultado:', result);
    return result;
  };

  // Buscar regiões por tipo de turismo (apenas para MS)
  const getRegionsByType = (type: MSRegion['tourism_type']): MSRegion[] => {
    console.log('🔍 DEBUG: getRegionsByType chamado com tipo:', type);
    const result = MS_REGIONS.filter(region => region.tourism_type === type) as MSRegion[];
    console.log('🔍 DEBUG: getRegionsByType resultado:', result);
    return result;
  };

  // Carregar regiões na inicialização
  useEffect(() => {
    console.log('🚀 DEBUG: useEffect do useRegions executado');
    fetchRegions();
  }, []);

  // Função para recarregar regiões
  const refreshRegions = () => {
    console.log('🔄 DEBUG: refreshRegions chamado');
    fetchRegions();
  };

  // console.log('📤 DEBUG: useRegions retornando:', {
  //   regionsCount: regions.length,
  //   loading,
  //   error,
  //   hasGetRegionBySlug: !!getRegionBySlug,
  //   hasGetRegionsByCity: !!getRegionsByCity,
  //   hasGetRegionsByType: !!getRegionsByType,
  //   hasRefreshRegions: !!refreshRegions
  // });

  return {
    regions,
    loading,
    error,
    getRegionBySlug,
    getRegionsByCity,
    getRegionsByType,
    refreshRegions
  };
};

// Hook específico para regiões do MS
export const useMSRegions = () => {
  // console.log('🔍 DEBUG: useMSRegions hook iniciado');
  
  const { regions, loading, error, getRegionBySlug, getRegionsByCity, getRegionsByType } = useRegions();

  // console.log('📊 DEBUG: useMSRegions - dados recebidos:', {
  //   regionsCount: regions.length,
  //   loading,
  //   error,
  //   hasGetRegionBySlug: !!getRegionBySlug,
  //   hasGetRegionsByCity: !!getRegionsByCity,
  //   hasGetRegionsByType: !!getRegionsByType
  // });

  // Filtrar apenas regiões do MS
  const msRegions = regions.filter(region => 
    region.name && MS_REGIONS.some(msRegion => msRegion.name === region.name)
  );

  // console.log('🔍 DEBUG: msRegions filtradas:', msRegions.length);

  // Estatísticas das regiões
  const getRegionStats = () => {
    // console.log('📊 DEBUG: getRegionStats chamado');
    const stats = {
      total: msRegions.length,
      byType: {
        ecoturismo: getRegionsByType('ecoturismo').length,
        turismo_rural: getRegionsByType('turismo_rural').length,
        turismo_urbano: getRegionsByType('turismo_urbano').length,
        turismo_aventura: getRegionsByType('turismo_aventura').length,
        turismo_cultural: getRegionsByType('turismo_cultural').length,
        turismo_fronteira: getRegionsByType('turismo_fronteira').length,
      },
      totalCities: msRegions.reduce((acc, region) => acc + region.cities.length, 0)
    };

    // console.log('📊 DEBUG: getRegionStats resultado:', stats);
    return stats;
  };

  // Buscar região por coordenadas (mais próxima)
  const getRegionByCoordinates = (lat: number, lng: number): TourismRegion | undefined => {
    console.log('🔍 DEBUG: getRegionByCoordinates chamado com:', { lat, lng });
    
    if (msRegions.length === 0) {
      console.log('⚠️ DEBUG: msRegions vazio, retornando undefined');
      return undefined;
    }

    let closestRegion = msRegions[0];
    let minDistance = Infinity;

    msRegions.forEach(region => {
      const distance = Math.sqrt(
        Math.pow(region.coordinates.lat - lat, 2) + 
        Math.pow(region.coordinates.lng - lng, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestRegion = region;
      }
    });

    console.log('🔍 DEBUG: getRegionByCoordinates resultado:', closestRegion);
    return closestRegion;
  };

  const result = {
    regions: msRegions,
    loading,
    error,
    getRegionBySlug,
    getRegionsByCity,
    getRegionsByType,
    getRegionStats,
    getRegionByCoordinates
  };

  // console.log('📤 DEBUG: useMSRegions retornando:', {
  //   regionsCount: result.regions.length,
  //   loading: result.loading,
  //   error: result.error,
  //   hasGetRegionBySlug: !!result.getRegionBySlug,
  //   hasGetRegionsByCity: !!result.getRegionsByCity,
  //   hasGetRegionsByType: !!result.getRegionsByType,
  //   hasGetRegionStats: !!result.getRegionStats,
  //   hasGetRegionByCoordinates: !!result.getRegionByCoordinates
  // });

  return result;
}; 