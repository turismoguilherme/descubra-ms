import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook para buscar wallpaper global do passaporte
 * O wallpaper é único para todos os passaportes (não por rota)
 */
export const usePassportWallpaper = () => {
  const [wallpaperUrl, setWallpaperUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWallpaper();
  }, []);

  const loadWallpaper = async () => {
    try {
      // Buscar configuração do wallpaper global do passaporte
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('platform', 'ms')
        .eq('setting_key', 'passport_wallpaper')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar wallpaper do passaporte:', error);
        // Se não existe a configuração, usa null (sem wallpaper)
        setWallpaperUrl(null);
        return;
      }

      // Se encontrou configuração, extrair a URL
      if (data?.setting_value) {
        const value = data.setting_value as any;
        setWallpaperUrl(value.url || value.wallpaper_url || null);
      } else {
        setWallpaperUrl(null);
      }
    } catch (error: unknown) {
      console.error('Erro ao carregar wallpaper:', error);
      setWallpaperUrl(null);
    } finally {
      setLoading(false);
    }
  };

  return { wallpaperUrl, loading };
};


