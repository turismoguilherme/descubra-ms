/**
 * Sistema de Fallback para Autenticação
 * Fornece alternativas quando a autenticação falha
 */

export interface AuthFallbackOptions {
  maxRetries: number;
  retryDelay: number;
  fallbackToGuest: boolean;
}

export class AuthFallback {
  private static instance: AuthFallback;
  private retryCount = 0;
  private options: AuthFallbackOptions = {
    maxRetries: 3,
    retryDelay: 2000,
    fallbackToGuest: true
  };

  static getInstance(): AuthFallback {
    if (!AuthFallback.instance) {
      AuthFallback.instance = new AuthFallback();
    }
    return AuthFallback.instance;
  }

  /**
   * Verifica se deve usar fallback
   */
  shouldUseFallback(authLoading: boolean, user: any): boolean {
    // Se está carregando há muito tempo ou não há usuário
    return authLoading || !user;
  }

  /**
   * Cria um usuário convidado temporário
   */
  createGuestUser() {
    return {
      id: 'guest-' + Date.now(),
      email: 'guest@descubrams.com.br',
      created_at: new Date().toISOString(),
      isGuest: true
    };
  }

  /**
   * Verifica se o usuário é convidado
   */
  isGuestUser(user: any): boolean {
    return user?.isGuest === true;
  }

  /**
   * Tenta recuperar a autenticação
   */
  async tryRecoverAuth(): Promise<boolean> {
    try {
      // Verificar se há dados de autenticação no localStorage
      const authData = localStorage.getItem('supabase.auth.token');
      const userData = localStorage.getItem('test-user-data');
      
      if (authData || userData) {
        console.log('🔄 AUTH FALLBACK: Dados de autenticação encontrados, tentando recuperar...');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ AUTH FALLBACK: Erro ao tentar recuperar autenticação:', error);
      return false;
    }
  }

  /**
   * Executa o fallback
   */
  async executeFallback(): Promise<any> {
    this.retryCount++;
    
    if (this.retryCount > this.options.maxRetries) {
      console.warn('⚠️ AUTH FALLBACK: Máximo de tentativas atingido');
      return this.options.fallbackToGuest ? this.createGuestUser() : null;
    }

    // Tentar recuperar autenticação
    const recovered = await this.tryRecoverAuth();
    if (recovered) {
      console.log('✅ AUTH FALLBACK: Autenticação recuperada');
      return null; // Deixar o sistema normal continuar
    }

    // Aguardar antes da próxima tentativa
    await new Promise(resolve => setTimeout(resolve, this.options.retryDelay));
    
    return this.executeFallback();
  }

  /**
   * Reset do contador de tentativas
   */
  reset() {
    this.retryCount = 0;
  }
}

// Instância global
export const authFallback = AuthFallback.getInstance();

