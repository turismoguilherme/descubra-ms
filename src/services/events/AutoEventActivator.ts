/**
 * Ativador Automático do Sistema de Eventos
 * 
 * FUNCIONALIDADE: Ativa automaticamente o sistema de eventos
 * SEGURANÇA: Não interfere com funcionalidades existentes
 */

import { eventManagementService } from './EventManagementService';

export class AutoEventActivator {
  private static instance: AutoEventActivator;
  private isActivated: boolean = false;

  private constructor() {}

  public static getInstance(): AutoEventActivator {
    if (!AutoEventActivator.instance) {
      AutoEventActivator.instance = new AutoEventActivator();
    }
    return AutoEventActivator.instance;
  }

  /**
   * Ativa automaticamente o sistema de eventos
   * SEGURO: Apenas ativa limpeza automática
   */
  public async activateEventSystem(): Promise<void> {
    if (this.isActivated) {
      return;
    }

    try {

      // Configurar sistema com limpeza automática ativa
      const config = {
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
        this.isActivated = true;
        
        // Executar limpeza imediata
        const cleanupResult = await eventManagementService.performManualCleanup();
        
        if (!cleanupResult.success) {
          console.warn("⚠️ AUTO ACTIVATOR: Limpeza inicial com erros:", cleanupResult.errors);
        }
        
      } else {
        console.error("❌ AUTO ACTIVATOR: Falha ao ativar sistema:", result.errors);
      }

    } catch (error) {
      console.error("❌ AUTO ACTIVATOR: Erro durante ativação:", error);
    }
  }

  /**
   * Obtém status da ativação
   */
  public getActivationStatus(): {
    isActivated: boolean;
    servicesStatus: any;
  } {
    return {
      isActivated: this.isActivated,
      servicesStatus: eventManagementService.getAllServicesStatus()
    };
  }

  /**
   * Executa limpeza imediata
   */
  public async performImmediateCleanup(): Promise<any> {
    return await eventManagementService.performManualCleanup();
  }
}

// Instância singleton
export const autoEventActivator = AutoEventActivator.getInstance();

// Auto-ativação imediata (reativada)
if (typeof window !== 'undefined' && true) { // Reativado
  // Iniciando ativação automática (log removido)
  
  // Aguardar um pouco para garantir que a aplicação esteja carregada
  setTimeout(() => {
    autoEventActivator.activateEventSystem();
  }, 1000);
}
