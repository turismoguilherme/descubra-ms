/**
 * Utilitário centralizado para logs seguros
 * Não tenta conectar ao localhost em produção
 */

const enableDebugLogs = import.meta.env.VITE_DEBUG_LOGS === 'true';
const isDev = import.meta.env.DEV || 
  (typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1'
  ));

export const safeLog = (payload: any) => {
  if (!enableDebugLogs || !isDev) return;
  try {
    // eslint-disable-next-line no-console
    console.debug('[safeLog]', payload);
  } catch {
    /* ignore */
  }
};

