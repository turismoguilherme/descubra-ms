/**
 * Sistema de Timeout para o Guatá
 * Evita carregamento infinito e fornece fallbacks
 */

export class GuataTimeout {
  private static instance: GuataTimeout;
  private timeouts: Map<string, NodeJS.Timeout> = new Map();

  static getInstance(): GuataTimeout {
    if (!GuataTimeout.instance) {
      GuataTimeout.instance = new GuataTimeout();
    }
    return GuataTimeout.instance;
  }

  /**
   * Cria um timeout com fallback
   */
  createTimeout(
    key: string,
    callback: () => void,
    fallback: () => void,
    timeoutMs: number = 10000
  ): void {
    // Limpar timeout anterior se existir
    this.clearTimeout(key);

    // Criar novo timeout
    const timeout = setTimeout(() => {
      console.warn(`⏰ GUATA TIMEOUT: Timeout atingido para ${key}`);
      fallback();
      this.timeouts.delete(key);
    }, timeoutMs);

    this.timeouts.set(key, timeout);

    // Executar callback imediatamente
    try {
      callback();
    } catch (error) {
      console.error(`❌ GUATA TIMEOUT: Erro ao executar callback para ${key}:`, error);
      fallback();
    }
  }

  /**
   * Limpa um timeout específico
   */
  clearTimeout(key: string): void {
    const timeout = this.timeouts.get(key);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(key);
    }
  }

  /**
   * Limpa todos os timeouts
   */
  clearAllTimeouts(): void {
    this.timeouts.forEach((timeout) => {
      clearTimeout(timeout);
    });
    this.timeouts.clear();
  }

  /**
   * Verifica se um timeout está ativo
   */
  hasTimeout(key: string): boolean {
    return this.timeouts.has(key);
  }
}

// Instância global
export const guataTimeout = GuataTimeout.getInstance();

// Timeouts padrão
export const GUATA_TIMEOUTS = {
  AUTH_LOADING: 3000,       // 3 segundos para carregar auth
  INITIALIZATION: 5000,     // 5 segundos para inicializar
  CONNECTION_CHECK: 5000,   // 5 segundos para verificar conexão
  MESSAGE_SEND: 10000,      // 10 segundos para enviar mensagem
  COMPONENT_LOAD: 3000      // 3 segundos para carregar componentes
};
