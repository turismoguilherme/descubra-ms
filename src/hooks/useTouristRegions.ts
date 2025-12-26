import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { touristRegions2025, TouristRegion2025 } from '@/data/touristRegions2025';

export interface TouristRegion {
  id: string;
  name: string;
  slug: string;
  color: string;
  colorHover: string;
  description: string;
  cities: string[];
  highlights: string[];
  image: string;
  order_index?: number;
  is_active?: boolean;
}

// Converter região do banco para formato esperado pelo componente
// CRÍTICO: Usar slug como id para consistência com paths SVG
const convertDbRegionToComponent = (dbRegion: any): TouristRegion2025 => {
  return {
    id: dbRegion.slug, // Usar slug como id para consistência com paths SVG
    name: dbRegion.name,
    slug: dbRegion.slug,
    color: dbRegion.color,
    colorHover: dbRegion.color_hover || dbRegion.color,
    description: dbRegion.description,
    cities: Array.isArray(dbRegion.cities) ? dbRegion.cities : [],
    highlights: Array.isArray(dbRegion.highlights) ? dbRegion.highlights : [],
    image: dbRegion.image_url || '',
  };
};

export function useTouristRegions() {
  const [regions, setRegions] = useState<TouristRegion2025[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadRegions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Tentar buscar do banco de dados
      const { data: dbRegions, error: dbError } = await supabase
        .from('tourist_regions')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true })
        .order('name', { ascending: true });

      if (dbError) {
        console.warn('Erro ao carregar regiões do banco:', dbError);
        // Continuar para usar fallback
      }

      if (dbRegions && dbRegions.length > 0) {
        // Converter regiões do banco para formato do componente
        const convertedRegions = dbRegions.map(convertDbRegionToComponent);
        setRegions(convertedRegions);
        console.log(`✅ [useTouristRegions] ${convertedRegions.length} regiões carregadas do banco`);
        return;
      }

      // Fallback: usar dados do arquivo se banco estiver vazio
      console.log('⚠️ [useTouristRegions] Nenhuma região no banco, usando dados do arquivo');
      setRegions(touristRegions2025);
    } catch (err) {
      console.error('Erro ao carregar regiões:', err);
      setError(err instanceof Error ? err : new Error('Erro desconhecido'));
      // Fallback para dados do arquivo em caso de erro
      setRegions(touristRegions2025);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRegions();

    // Escutar mudanças no banco via Realtime
    const channel = supabase
      .channel('tourist_regions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tourist_regions',
        },
        (payload) => {
          console.log('🔄 [useTouristRegions] Mudança detectada no banco:', payload);
          loadRegions();
        }
      )
      .subscribe();

    // Escutar evento customizado de atualização
    const handleUpdate = () => {
      console.log('📢 [useTouristRegions] Evento de atualização recebido');
      loadRegions();
    };

    window.addEventListener('touristRegionsUpdated', handleUpdate);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('touristRegionsUpdated', handleUpdate);
    };
  }, [loadRegions]);

  // Função para forçar reload manualmente
  const refetch = useCallback(() => {
    loadRegions();
  }, [loadRegions]);

  return { regions, loading, error, refetch };
}



