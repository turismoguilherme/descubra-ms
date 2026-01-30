/**
 * Interceptor para renovar tokens automaticamente quando receber 401
 * Isso resolve o problema de JWT expired no Vercel
 */

import { supabase } from '@/integrations/supabase/client';
import { getErrorMessage } from '@/utils/errorUtils';

/**
 * Interface para erros do Supabase
 */
interface SupabaseError {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
  status?: number;
  statusCode?: number;
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * Tenta renovar a sessão do Supabase
 */
async function refreshSession(): Promise<boolean> {
  // Se já está renovando, aguardar a renovação em andamento
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        console.warn('[SupabaseInterceptor] Nenhuma sessão encontrada para renovar');
        return false;
      }

      if (!session.refresh_token) {
        console.warn('[SupabaseInterceptor] Sessão não tem refresh token');
        return false;
      }

      // Tentar renovar
      const { data: { session: refreshedSession }, error: refreshError } = 
        await supabase.auth.refreshSession();

      if (refreshError) {
        console.error('[SupabaseInterceptor] Erro ao renovar token:', refreshError);
        return false;
      }

      if (!refreshedSession?.access_token) {
        console.warn('[SupabaseInterceptor] Renovação não retornou token válido');
        return false;
      }

      console.log('[SupabaseInterceptor] ✅ Token renovado com sucesso');
      return true;
    } catch (error) {
      console.error('[SupabaseInterceptor] Erro ao renovar sessão:', error);
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Wrapper para operações do Supabase que renova token automaticamente em caso de 401
 */
export async function withAutoRefresh<T>(
  operation: () => Promise<{ data: T | null; error: SupabaseError | null }>,
  retries = 1
): Promise<{ data: T | null; error: SupabaseError | null }> {
  try {
    const result = await operation();
    
    // Se não há erro, retornar resultado
    if (!result.error) {
      return result;
    }

    // Se é erro 401 (JWT expired) e ainda tem tentativas
    const isJWTError = result.error?.code === 'PGRST301' || 
                      result.error?.message?.includes('JWT expired') ||
                      result.error?.status === 401 ||
                      result.error?.statusCode === 401;

    if (isJWTError && retries > 0) {
      console.log('[SupabaseInterceptor] Token expirado, tentando renovar...');
      
      const refreshed = await refreshSession();
      
      if (refreshed) {
        // Aguardar um pouco para garantir que o token foi atualizado
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Retentar a operação
        return withAutoRefresh(operation, retries - 1);
      } else {
        console.error('[SupabaseInterceptor] Não foi possível renovar token');
        return result;
      }
    }

    return result;
  } catch (error: unknown) {
    // Se é erro de JWT e ainda tem tentativas
    const errorObj = error && typeof error === 'object'
      ? (error as { code?: string; message?: string; status?: number; statusCode?: number })
      : null;
    
    const isJWTError = errorObj?.code === 'PGRST301' || 
                      errorObj?.message?.includes('JWT expired') ||
                      errorObj?.status === 401 ||
                      errorObj?.statusCode === 401;

    if (isJWTError && retries > 0) {
      console.log('[SupabaseInterceptor] Erro de JWT capturado, tentando renovar...');
      
      const refreshed = await refreshSession();
      
      if (refreshed) {
        await new Promise(resolve => setTimeout(resolve, 300));
        return withAutoRefresh(operation, retries - 1);
      }
    }

    return { data: null, error };
  }
}

/**
 * Verifica e renova token periodicamente se necessário
 */
function setupPeriodicTokenRefresh() {
  setInterval(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session || !session.expires_at) return;

      const expiresAt = session.expires_at * 1000;
      const timeUntilExpiry = expiresAt - Date.now();
      
      // Se expira em menos de 10 minutos, renovar proativamente
      if (timeUntilExpiry < 10 * 60 * 1000 && timeUntilExpiry > 0 && session.refresh_token) {
        console.log('[SupabaseInterceptor] Token próximo de expirar, renovando proativamente...');
        await refreshSession();
      }
    } catch (error) {
      // Silenciosamente falha - não queremos poluir o console
    }
  }, 5 * 60 * 1000); // Verificar a cada 5 minutos
}

/**
 * Inicializa o interceptor global
 * Deve ser chamado no início da aplicação
 */
export function initSupabaseInterceptor() {
  // Listener para eventos de autenticação
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'TOKEN_REFRESHED') {
      console.log('[SupabaseInterceptor] ✅ Token renovado automaticamente pelo Supabase');
    } else if (event === 'SIGNED_OUT') {
      console.log('[SupabaseInterceptor] Usuário deslogado');
    } else if (event === 'SIGNED_IN' && session) {
      console.log('[SupabaseInterceptor] Usuário autenticado, iniciando verificação periódica de token');
      // Iniciar verificação periódica quando usuário faz login
      setupPeriodicTokenRefresh();
    }
  });

  // Verificar se já há uma sessão ativa
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      console.log('[SupabaseInterceptor] Sessão encontrada, iniciando verificação periódica');
      setupPeriodicTokenRefresh();
    }
  });

  console.log('[SupabaseInterceptor] ✅ Interceptor inicializado');
}

