/**
 * Serviço Principal de Gerenciamento de Eventos
 * 
 * FUNCIONALIDADE: Orquestra todos os serviços de eventos
 * SEGURANÇA: Não interfere com funcionalidades existentes
 * MODO: Operação em background, não afeta UI
 */

import { eventCleanupService, EventCleanupConfig } from './EventCleanupService';
import { googleCalendarSyncService, GoogleCalendarConfig } from './GoogleCalendarSyncService';
import { geminiEventProcessorService, GeminiEventProcessorConfig } from './GeminiEventProcessorService';

export interface EventManagementConfig {
  cleanup: EventCleanupConfig;
  googleCalendar: GoogleCalendarConfig;
  geminiAI: GeminiEventProcessorConfig;
  enableAllServices: boolean;
  logServiceActions: boolean;
}

export class EventManagementService {
  private config: EventManagementConfig;
  private isInitialized: boolean = false;

  constructor(config: Partial<EventManagementConfig> = {}) {
    this.config = {
      cleanup: {
        enabled: true,
        cleanupInterval: 24,
        archiveExpiredEvents: true,
        logCleanupActions: true
      },
      googleCalendar: {
        enabled: false, // Desabilitado por padrão - será ativado apenas se credenciais estiverem disponíveis
        calendarIds: [],
        syncInterval: 6,
        autoCreateEvents: false,
        logSyncActions: true
      },
      geminiAI: {
        enabled: false, // Desabilitado por padrão - será ativado apenas se credenciais estiverem disponíveis
        processNewEvents: true,
        processExistingEvents: false,
        autoCategorize: true,
        autoExtractMetadata: true,
        logProcessingActions: true
      },
      enableAllServices: false,
      logServiceActions: true,
      ...config
    };
  }

  /**
   * Inicializa todos os serviços de eventos
   * SEGURO: Não afeta funcionalidades existentes
   */
  public async initializeServices(): Promise<{
    success: boolean;
    servicesStarted: string[];
    servicesFailed: string[];
    errors: string[];
  }> {
    const result = {
      success: true,
      servicesStarted: [] as string[],
      servicesFailed: [] as string[],
      errors: [] as string[]
    };

    try {
      console.log("🎯 EVENT MANAGEMENT: Inicializando serviços de eventos...");

      // 1. Inicializar serviço de limpeza (sempre ativo)
      try {
        eventCleanupService.updateConfig(this.config.cleanup);
        eventCleanupService.startCleanupService();
        result.servicesStarted.push('EventCleanupService');
        console.log("✅ EVENT MANAGEMENT: Serviço de limpeza iniciado");
      } catch (error) {
        result.servicesFailed.push('EventCleanupService');
        result.errors.push(`Erro ao iniciar limpeza: ${error}`);
      }

      // 2. Inicializar serviço do Google Calendar (se habilitado e com credenciais)
      if (this.config.googleCalendar.enabled) {
        try {
          // Verificar credenciais antes de iniciar
          const hasCredentials = await this.checkGoogleCalendarCredentials();
          if (hasCredentials) {
            googleCalendarSyncService.updateConfig(this.config.googleCalendar);
            await googleCalendarSyncService.startSyncService();
            result.servicesStarted.push('GoogleCalendarSyncService');
            console.log("✅ EVENT MANAGEMENT: Serviço do Google Calendar iniciado");
          } else {
            console.warn("⚠️ EVENT MANAGEMENT: Google Calendar não iniciado - credenciais não disponíveis");
            result.servicesFailed.push('GoogleCalendarSyncService');
            result.errors.push('Credenciais do Google Calendar não disponíveis');
          }
        } catch (error) {
          result.servicesFailed.push('GoogleCalendarSyncService');
          result.errors.push(`Erro ao iniciar Google Calendar: ${error}`);
        }
      }

      // 3. Inicializar serviço do Gemini AI (se habilitado e com credenciais)
      if (this.config.geminiAI.enabled) {
        try {
          // Verificar credenciais antes de iniciar
          const hasCredentials = await this.checkGeminiCredentials();
          if (hasCredentials) {
            geminiEventProcessorService.updateConfig(this.config.geminiAI);
            await geminiEventProcessorService.startProcessingService();
            result.servicesStarted.push('GeminiEventProcessorService');
            console.log("✅ EVENT MANAGEMENT: Serviço do Gemini AI iniciado");
          } else {
            console.warn("⚠️ EVENT MANAGEMENT: Gemini AI não iniciado - credenciais não disponíveis");
            result.servicesFailed.push('GeminiEventProcessorService');
            result.errors.push('Credenciais do Gemini AI não disponíveis');
          }
        } catch (error) {
          result.servicesFailed.push('GeminiEventProcessorService');
          result.errors.push(`Erro ao iniciar Gemini AI: ${error}`);
        }
      }

      this.isInitialized = true;
      
      console.log(`🎯 EVENT MANAGEMENT: Inicialização concluída - ${result.servicesStarted.length} serviços iniciados`);

    } catch (error) {
      console.error("🎯 EVENT MANAGEMENT: Erro durante inicialização:", error);
      result.success = false;
      result.errors.push(`Erro geral: ${error}`);
    }

    return result;
  }

  /**
   * Verifica se as credenciais do Google Calendar estão disponíveis
   */
  private async checkGoogleCalendarCredentials(): Promise<boolean> {
    try {
      // Verificar variáveis de ambiente ou configurações
      const hasApiKey = !!(typeof process !== 'undefined' && process.env?.VITE_GOOGLE_CALENDAR_API_KEY);
      const hasClientId = !!(typeof process !== 'undefined' && process.env?.VITE_GOOGLE_CLIENT_ID);
      
      // Se não tiver variáveis de ambiente, verificar se o serviço consegue verificar
      if (!hasApiKey && !hasClientId) {
        // O serviço próprio já verifica disponibilidade
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("🎯 EVENT MANAGEMENT: Erro ao verificar credenciais do Google Calendar:", error);
      return false;
    }
  }

  /**
   * Verifica se as credenciais do Gemini AI estão disponíveis
   */
  private async checkGeminiCredentials(): Promise<boolean> {
    try {
      // Credenciais gerenciadas via Edge Function (guata-gemini-proxy)
      // O serviço próprio verifica disponibilidade ao chamar a edge function
      return true;
    } catch (error) {
      console.error("🎯 EVENT MANAGEMENT: Erro ao verificar credenciais do Gemini AI:", error);
      return false;
    }
  }

  /**
   * Para todos os serviços
   * SEGURO: Não afeta funcionalidades existentes
   */
  public stopAllServices(): void {
    console.log("🎯 EVENT MANAGEMENT: Parando todos os serviços...");
    
    eventCleanupService.stopCleanupService();
    googleCalendarSyncService.stopSyncService();
    
    this.isInitialized = false;
    console.log("🎯 EVENT MANAGEMENT: Todos os serviços parados");
  }

  /**
   * Executa limpeza manual de eventos
   * SEGURO: Operação isolada
   */
  public async performManualCleanup(): Promise<any> {
    console.log("🎯 EVENT MANAGEMENT: Executando limpeza manual...");
    return await eventCleanupService.performCleanup();
  }

  /**
   * Executa sincronização manual com Google Calendar
   * SEGURO: Operação isolada
   */
  public async performManualSync(): Promise<any> {
    console.log("🎯 EVENT MANAGEMENT: Executando sincronização manual...");
    return await googleCalendarSyncService.performSync();
  }

  /**
   * Processa eventos com Gemini AI
   * SEGURO: Operação isolada
   */
  public async processEventsWithAI(): Promise<any> {
    console.log("🎯 EVENT MANAGEMENT: Processando eventos com IA...");
    return await geminiEventProcessorService.processAllPendingEvents();
  }

  /**
   * Obtém status de todos os serviços
   * SEGURO: Apenas leitura
   */
  public getAllServicesStatus(): {
    isInitialized: boolean;
    cleanup: any;
    googleCalendar: any;
    geminiAI: any;
    config: EventManagementConfig;
  } {
    return {
      isInitialized: this.isInitialized,
      cleanup: eventCleanupService.getServiceStatus(),
      googleCalendar: googleCalendarSyncService.getServiceStatus(),
      geminiAI: geminiEventProcessorService.getServiceStatus(),
      config: this.config
    };
  }

  /**
   * Atualiza configuração de um serviço específico
   * SEGURO: Não afeta funcionalidades existentes
   */
  public updateServiceConfig(service: 'cleanup' | 'googleCalendar' | 'geminiAI', newConfig: any): void {
    console.log(`🎯 EVENT MANAGEMENT: Atualizando configuração do serviço ${service}`);
    
    switch (service) {
      case 'cleanup':
        this.config.cleanup = { ...this.config.cleanup, ...newConfig };
        eventCleanupService.updateConfig(newConfig);
        break;
      case 'googleCalendar':
        this.config.googleCalendar = { ...this.config.googleCalendar, ...newConfig };
        googleCalendarSyncService.updateConfig(newConfig);
        break;
      case 'geminiAI':
        this.config.geminiAI = { ...this.config.geminiAI, ...newConfig };
        geminiEventProcessorService.updateConfig(newConfig);
        break;
    }
  }

  /**
   * Habilita/desabilita um serviço específico
   * SEGURO: Não afeta funcionalidades existentes
   */
  public toggleService(service: 'cleanup' | 'googleCalendar' | 'geminiAI', enabled: boolean): void {
    console.log(`🎯 EVENT MANAGEMENT: ${enabled ? 'Habilitando' : 'Desabilitando'} serviço ${service}`);
    
    switch (service) {
      case 'cleanup':
        this.config.cleanup.enabled = enabled;
        if (enabled) {
          eventCleanupService.startCleanupService();
        } else {
          eventCleanupService.stopCleanupService();
        }
        break;
      case 'googleCalendar':
        this.config.googleCalendar.enabled = enabled;
        if (enabled) {
          googleCalendarSyncService.startSyncService();
        } else {
          googleCalendarSyncService.stopSyncService();
        }
        break;
      case 'geminiAI':
        this.config.geminiAI.enabled = enabled;
        if (enabled) {
          geminiEventProcessorService.startProcessingService();
        }
        break;
    }
  }

  /**
   * Executa diagnóstico completo dos serviços
   * SEGURO: Apenas leitura
   */
  public async runDiagnostics(): Promise<{
    success: boolean;
    diagnostics: any;
    recommendations: string[];
  }> {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      services: this.getAllServicesStatus(),
      systemHealth: 'ok',
      recommendations: [] as string[]
    };

    // Verificar saúde dos serviços
    if (!this.isInitialized) {
      diagnostics.recommendations.push('Serviços não inicializados - execute initializeServices()');
    }

    if (!this.config.cleanup.enabled) {
      diagnostics.recommendations.push('Serviço de limpeza desabilitado - eventos expirados podem não ser removidos');
    }

    if (this.config.googleCalendar.enabled && !googleCalendarSyncService.getServiceStatus().isGoogleApiAvailable) {
      diagnostics.recommendations.push('Google Calendar habilitado mas API não disponível - configure credenciais');
    }

    if (this.config.geminiAI.enabled && !geminiEventProcessorService.getServiceStatus().isGeminiApiAvailable) {
      diagnostics.recommendations.push('Gemini AI habilitado mas API não disponível - configure credenciais');
    }

    return {
      success: true,
      diagnostics,
      recommendations: diagnostics.recommendations
    };
  }
}

// Instância singleton para uso global
export const eventManagementService = new EventManagementService();

// Auto-inicialização em produção (apenas serviços seguros)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  // Iniciar apenas o serviço de limpeza automaticamente
  eventManagementService.initializeServices();
}

