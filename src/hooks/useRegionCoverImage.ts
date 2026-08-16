// @ts-nocheck
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook para buscar a imagem de capa de uma região turística
 * Retorna a imagem de capa (image_url) ou a primeira imagem da galeria como fallback
 */
export function useRegionCoverImage(regionDbId: string | null | undefined, defaultImage?: string) {
  const [coverImage, setCoverImage] = useState<string | null>(defaultImage || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!regionDbId) {
      setCoverImage(defaultImage || null);
      return;
    }

    const fetchCoverImage = async () => {
      setLoading(true);
      try {
        // Primeiro, buscar a região para ver se tem image_url
        const { data: region } = await supabase
          .from('tourist_regions')
          .select('image_url')
          .eq('id', regionDbId)
          .single();

        if (region?.image_url) {
          setCoverImage(region.image_url);
          setLoading(false);
          return;
        }

        // Se não tiver image_url, buscar a primeira imagem da galeria
        const { data: details } = await supabase
          .from('destination_details')
          .select('image_gallery')
          .eq('tourist_region_id', regionDbId)
          .single();

        if (details?.image_gallery && Array.isArray(details.image_gallery) && details.image_gallery.length > 0) {
          setCoverImage(details.image_gallery[0]);
        } else {
          setCoverImage(defaultImage || null);
        }
      } catch (error) {
        console.error('Erro ao buscar imagem de capa:', error);
        setCoverImage(defaultImage || null);
      } finally {
        setLoading(false);
      }
    };

    fetchCoverImage();
  }, [regionDbId, defaultImage]);

  return { coverImage, loading };
}

