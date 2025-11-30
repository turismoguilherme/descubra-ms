/**
 * Ativador Automático do Sistema de Eventos Inteligente
 * 
 * FUNCIONALIDADE: Ativa automaticamente o sistema completo
 * SEGURANÇA: Não interfere com funcionalidades existentes
 */

import { intelligentEventService } from './IntelligentEventService';

export class IntelligentEventActivator {
  private static instance: IntelligentEventActivator;
  private isActivated: boolean = false;

  private constructor() {}

  public static getInstance(): IntelligentEventActivator {
    if (!IntelligentEventActivator.instance) {
      IntelligentEventActivator.instance = new IntelligentEventActivator();
    }
    return IntelligentEventActivator.instance;
  }

  /**
   * Ativa automaticamente o sistema inteligente
   */
  public async activateIntelligentSystem(): Promise<void> {
    if (this.isActivated) {
      return;
    }

    try {

      // Sistema automático DESATIVADO - apenas eventos cadastrados manualmente
      const config = {
        googleSearch: {
          enabled: false, // DESATIVADO
          searchInterval: 24,
          maxResults: 20
        },
        geminiAI: {
          enabled: false, // DESATIVADO
          processNewEvents: false,
          improveDescriptions: false
        },
        googleCalendar: {
          enabled: false,
          syncInterval: 6
        },
        autoCleanup: {
          enabled: true,
          cleanupInterval: 24
        }
      };

      // Inicializar sistema com a config desativada
      const result = await intelligentEventService.initialize(config);
      
      if (result.success) {
        this.isActivated = true;
        
        if (result.errors.length > 0) {
          console.warn("⚠️ INTELLIGENT ACTIVATOR: Alguns erros encontrados:", result.errors);
        }
      } else {
        console.error("❌ INTELLIGENT ACTIVATOR: Falha ao ativar sistema:", result.errors);
      }

    } catch (error) {
      console.error("❌ INTELLIGENT ACTIVATOR: Erro durante ativação:", error);
    }
  }

  /**
   * Obtém status da ativação
   */
  public getActivationStatus(): {
    isActivated: boolean;
    serviceStatus: any;
  } {
    return {
      isActivated: this.isActivated,
      serviceStatus: intelligentEventService.getServiceStatus()
    };
  }

  /**
   * Executa busca manual de eventos
   */
  public async performManualSearch(): Promise<any> {
    return await intelligentEventService.getEvents();
  }
}

// Instância singleton
export const intelligentEventActivator = IntelligentEventActivator.getInstance();

// Auto-ativação imediata
if (typeof window !== 'undefined') {
  // Iniciando ativação automática (log removido)
  
  // Aguardar um pouco para garantir que a aplicação esteja carregada
  setTimeout(() => {
    intelligentEventActivator.activateIntelligentSystem();
  }, 2000); // 2 segundos para garantir que tudo esteja carregado
}
