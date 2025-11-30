import { supabase } from '@/integrations/supabase/client';
import { SystemFallback } from '@/types/admin';

export const fallbackService = {
  async getFallbackConfig(platform: 'viajar' | 'descubra_ms') {
    const { data, error } = await supabase
      .from('system_fallback_config')
      .select('*')
      .eq('platform', platform)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateFallbackConfig(platform: 'viajar' | 'descubra_ms', updates: Partial<SystemFallback>) {
    const { data, error } = await supabase
      .from('system_fallback_config')
      .update(updates)
      .eq('platform', platform)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async checkSystemHealth(platform: 'viajar' | 'descubra_ms'): Promise<'healthy' | 'degraded' | 'down'> {
    try {
      // Verificar saúde do Supabase
      const { error: dbError } = await supabase
        .from('system_fallback_config')
        .select('id')
        .limit(1);
      
      if (dbError) {
        console.error('Database health check failed:', dbError);
        return 'down';
      }

      // Verificar se a plataforma está respondendo
      const platformUrl = platform === 'descubra_ms' 
        ? window.location.origin 
        : window.location.origin;
      
      try {
        const response = await fetch(platformUrl, { 
          method: 'HEAD',
          cache: 'no-cache',
          signal: AbortSignal.timeout(5000) // 5 segundos timeout
        });
        
        if (response.ok) {
          return 'healthy';
        } else if (response.status >= 500) {
          return 'down';
        } else {
          return 'degraded';
        }
      } catch (fetchError) {
        console.error('Platform health check failed:', fetchError);
        return 'degraded';
      }
    } catch (error) {
      console.error('Health check error:', error);
      return 'down';
    }
  },
};

