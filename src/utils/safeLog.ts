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
  // Apenas em desenvolvimento e se debug logs estiverem habilitados
  if (!enableDebugLogs || !isDev) return;
  
  try {
    fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: payload?.runId || 'run1'
      })
    }).catch(() => {
      // Silenciosamente falha - não queremos poluir o console em produção
    });
  } catch (error) {
    // Silenciosamente falha em produção
  }
};

