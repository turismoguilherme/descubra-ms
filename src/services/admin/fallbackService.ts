import { supabase } from '@/integrations/supabase/client';
import { SystemFallback } from '@/types/admin';

export const fallbackService = {
  async getFallbackConfig(platform: 'viajar' | 'descubra_ms') {
    try {
      const { data, error } = await supabase
        .from('system_fallback_config')
        .select('*')
        .eq('platform', platform)
        .single();
      
      // Tratar erros 406 (Not Acceptable) e 404 (Not Found) silenciosamente
      // Esses erros podem ocorrer se a tabela não existe ou RLS está bloqueando
      if (error) {
        // Verificar códigos de erro do PostgREST e PostgreSQL
        const isExpectedError = 
          error.code === 'PGRST116' || // no rows returned
          error.code === 'PGRST301' || // JWT expired/unauthorized
          error.code === '42P01' ||    // relation does not exist
          error.code === '42501' ||    // permission denied (RLS)
          error.status === 406 ||      // Not Acceptable
          error.status === 404 ||      // Not Found
          error.status === 401 ||      // Unauthorized
          error.message?.includes('does not exist') ||
          error.message?.includes('permission denied') ||
          error.message?.includes('row-level security');
        
        if (isExpectedError) {
          // Erro esperado, retornar null silenciosamente
          return null;
        }
        // Outros erros inesperados: logar apenas em desenvolvimento
        if (import.meta.env.DEV) {
          console.warn('⚠️ [FallbackService] Erro inesperado ao buscar config:', error);
        }
        return null;
      }
      return data;
    } catch (error: any) {
      // Capturar erros de rede ou outros erros inesperados
      const isExpectedError = 
        error?.code === 'PGRST116' ||
        error?.code === 'PGRST301' ||
        error?.code === '42P01' ||
        error?.code === '42501' ||
        error?.status === 406 ||
        error?.status === 404 ||
        error?.status === 401;
      
      if (!isExpectedError && import.meta.env.DEV) {
        console.warn('⚠️ [FallbackService] Erro ao buscar config:', error);
      }
      return null;
    }
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

