/**
 * Inicializador Automático dos Serviços de Eventos
 * 
 * FUNCIONALIDADE: Ativa automaticamente os serviços seguros
 * SEGURANÇA: Não interfere com funcionalidades existentes
 */

import { eventManagementService } from './EventManagementService';

export class EventServiceInitializer {
  private static instance: EventServiceInitializer;
  private isInitialized: boolean = false;

  private constructor() {}

  public static getInstance(): EventServiceInitializer {
    if (!EventServiceInitializer.instance) {
      EventServiceInitializer.instance = new EventServiceInitializer();
    }
    return EventServiceInitializer.instance;
  }

  /**
   * Inicializa automaticamente os serviços seguros
   * SEGURO: Apenas ativa limpeza automática
   */
  public async initializeSafeServices(): Promise<void> {
    if (this.isInitialized) {
      console.log("🎯 INITIALIZER: Serviços já inicializados");
      return;
    }

    try {
      console.log("🎯 INITIALIZER: Inicializando serviços seguros...");

      // Configurar apenas serviços seguros
      const safeConfig = {
        cleanup: {
          enabled: true,
          cleanupInterval: 24, // 24 horas
          archiveExpiredEvents: true,
          logCleanupActions: true
        },
        googleCalendar: {
          enabled: false, // Desabilitado por padrão
          calendarIds: [],
          syncInterval: 6,
          autoCreateEvents: false,
          logSyncActions: true
        },
        geminiAI: {
          enabled: false, // Desabilitado por padrão
          processNewEvents: true,
          processExistingEvents: false,
          autoCategorize: true,
          autoExtractMetadata: true,
          logProcessingActions: true
        },
        enableAllServices: false,
        logServiceActions: true
      };

      // Inicializar serviços
      const result = await eventManagementService.initializeServices();
      
      if (result.success) {
        this.isInitialized = true;
        console.log("✅ INITIALIZER: Serviços seguros inicializados com sucesso");
        console.log(`📊 INITIALIZER: ${result.servicesStarted.length} serviços iniciados`);
        
        if (result.servicesFailed.length > 0) {
          console.warn(`⚠️ INITIALIZER: ${result.servicesFailed.length} serviços falharam:`, result.servicesFailed);
        }
      } else {
        console.error("❌ INITIALIZER: Falha ao inicializar serviços:", result.errors);
      }

    } catch (error) {
      console.error("❌ INITIALIZER: Erro durante inicialização:", error);
    }
  }

  /**
   * Para todos os serviços
   */
  public stopAllServices(): void {
    console.log("🎯 INITIALIZER: Parando todos os serviços...");
    eventManagementService.stopAllServices();
    this.isInitialized = false;
  }

  /**
   * Obtém status da inicialização
   */
  public getInitializationStatus(): {
    isInitialized: boolean;
    servicesStatus: any;
  } {
    return {
      isInitialized: this.isInitialized,
      servicesStatus: eventManagementService.getAllServicesStatus()
    };
  }

  /**
   * Executa limpeza imediata
   */
  public async performImmediateCleanup(): Promise<any> {
    console.log("🎯 INITIALIZER: Executando limpeza imediata...");
    return await eventManagementService.performManualCleanup();
  }
}

// Instância singleton
export const eventServiceInitializer = EventServiceInitializer.getInstance();

// Auto-inicialização em produção (desabilitada por enquanto)
if (typeof window !== 'undefined' && import.meta.env.PROD && false) {
  // Aguardar um pouco para garantir que a aplicação esteja carregada
  setTimeout(() => {
    eventServiceInitializer.initializeSafeServices();
  }, 2000);
}
