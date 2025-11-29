/**
 * Logger utilitário para reduzir verbosidade em produção
 * Logs apenas em desenvolvimento ou quando explicitamente habilitado
 */

const isDev = import.meta.env.DEV;
const isVerbose = import.meta.env.VITE_VERBOSE_LOGS === 'true';

export const logger = {
  /**
   * Log apenas em desenvolvimento
   */
  dev: (...args: any[]) => {
    if (isDev || isVerbose) {
      console.log(...args);
    }
  },

  /**
   * Log de debug (mais verboso, apenas em dev com flag)
   */
  debug: (...args: any[]) => {
    if (isDev && isVerbose) {
      console.log('[DEBUG]', ...args);
    }
  },

  /**
   * Log de informação (sempre visível)
   */
  info: (...args: any[]) => {
    console.log(...args);
  },

  /**
   * Log de aviso (sempre visível)
   */
  warn: (...args: any[]) => {
    console.warn(...args);
  },

  /**
   * Log de erro (sempre visível)
   */
  error: (...args: any[]) => {
    console.error(...args);
  }
};

