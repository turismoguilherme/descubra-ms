/**
 * Hook React para Gerenciamento de Eventos
 * 
 * FUNCIONALIDADE: Integra serviços de eventos com React
 * SEGURANÇA: Não interfere com funcionalidades existentes
 * MODO: Operação em background, não afeta UI
 */

import { useState, useEffect, useCallback } from 'react';
import { eventManagementService, EventManagementConfig } from '@/services/events/EventManagementService';

export interface UseEventManagementReturn {
  // Status dos serviços
  isInitialized: boolean;
  servicesStatus: unknown;
  
  // Controles
  initializeServices: () => Promise<void>;
  stopAllServices: () => void;
  performManualCleanup: () => Promise<any>;
  performManualSync: () => Promise<any>;
  processEventsWithAI: () => Promise<any>;
  
  // Configurações
  updateServiceConfig: (service: 'cleanup' | 'googleCalendar' | 'geminiAI', config: unknown) => void;
  toggleService: (service: 'cleanup' | 'googleCalendar' | 'geminiAI', enabled: boolean) => void;
  
  // Diagnósticos
  runDiagnostics: () => Promise<any>;
  
  // Estados de loading
  isInitializing: boolean;
  isCleaning: boolean;
  isSyncing: boolean;
  isProcessing: boolean;
  
  // Erros
  errors: string[];
  clearErrors: () => void;
}

/**
 * Hook para gerenciamento de eventos
 * SEGURO: Não afeta funcionalidades existentes
 */
export const useEventManagement = (): UseEventManagementReturn => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [servicesStatus, setServicesStatus] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Inicializar serviços
  const initializeServices = useCallback(async () => {
    setIsInitializing(true);
    setErrors([]);
    
    try {
      console.log("🎯 HOOK: Inicializando serviços de eventos...");
      const result = await eventManagementService.initializeServices();
      
      if (result.success) {
        setIsInitialized(true);
        setServicesStatus(eventManagementService.getAllServicesStatus());
        console.log("✅ HOOK: Serviços inicializados com sucesso");
      } else {
        setErrors(result.errors);
        console.error("❌ HOOK: Erro ao inicializar serviços:", result.errors);
      }
    } catch (error) {
      const errorMessage = `Erro ao inicializar serviços: ${error}`;
      setErrors([errorMessage]);
      console.error("❌ HOOK:", errorMessage);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  // Parar todos os serviços
  const stopAllServices = useCallback(() => {
    console.log("🎯 HOOK: Parando todos os serviços...");
    eventManagementService.stopAllServices();
    setIsInitialized(false);
    setServicesStatus(null);
  }, []);

  // Executar limpeza manual
  const performManualCleanup = useCallback(async () => {
    setIsCleaning(true);
    setErrors([]);
    
    try {
      console.log("🎯 HOOK: Executando limpeza manual...");
      const result = await eventManagementService.performManualCleanup();
      
      if (result.success) {
        console.log(`✅ HOOK: Limpeza concluída - ${result.eventsArchived} arquivados, ${result.eventsRemoved} removidos`);
      } else {
        setErrors(result.errors);
        console.error("❌ HOOK: Erro durante limpeza:", result.errors);
      }
      
      return result;
    } catch (error) {
      const errorMessage = `Erro durante limpeza: ${error}`;
      setErrors([errorMessage]);
      console.error("❌ HOOK:", errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsCleaning(false);
    }
  }, []);

  // Executar sincronização manual
  const performManualSync = useCallback(async () => {
    setIsSyncing(true);
    setErrors([]);
    
    try {
      console.log("🎯 HOOK: Executando sincronização manual...");
      const result = await eventManagementService.performManualSync();
      
      if (result.success) {
        console.log(`✅ HOOK: Sincronização concluída - ${result.eventsAdded} adicionados, ${result.eventsUpdated} atualizados`);
      } else {
        setErrors(result.errors);
        console.error("❌ HOOK: Erro durante sincronização:", result.errors);
      }
      
      return result;
    } catch (error) {
      const errorMessage = `Erro durante sincronização: ${error}`;
      setErrors([errorMessage]);
      console.error("❌ HOOK:", errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Processar eventos com IA
  const processEventsWithAI = useCallback(async () => {
    setIsProcessing(true);
    setErrors([]);
    
    try {
      console.log("🎯 HOOK: Processando eventos com IA...");
      const result = await eventManagementService.processEventsWithAI();
      
      if (result.success) {
        console.log(`✅ HOOK: Processamento concluído - ${result.processed} eventos processados`);
      } else {
        setErrors(result.errors);
        console.error("❌ HOOK: Erro durante processamento:", result.errors);
      }
      
      return result;
    } catch (error) {
      const errorMessage = `Erro durante processamento: ${error}`;
      setErrors([errorMessage]);
      console.error("❌ HOOK:", errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Atualizar configuração de serviço
  const updateServiceConfig = useCallback((service: 'cleanup' | 'googleCalendar' | 'geminiAI', config: unknown) => {
    console.log(`🎯 HOOK: Atualizando configuração do serviço ${service}`);
    eventManagementService.updateServiceConfig(service, config);
    setServicesStatus(eventManagementService.getAllServicesStatus());
  }, []);

  // Alternar serviço
  const toggleService = useCallback((service: 'cleanup' | 'googleCalendar' | 'geminiAI', enabled: boolean) => {
    console.log(`🎯 HOOK: ${enabled ? 'Habilitando' : 'Desabilitando'} serviço ${service}`);
    eventManagementService.toggleService(service, enabled);
    setServicesStatus(eventManagementService.getAllServicesStatus());
  }, []);

  // Executar diagnósticos
  const runDiagnostics = useCallback(async () => {
    try {
      console.log("🎯 HOOK: Executando diagnósticos...");
      const result = await eventManagementService.runDiagnostics();
      
      if (result.success) {
        console.log("✅ HOOK: Diagnósticos concluídos");
      } else {
        console.error("❌ HOOK: Erro durante diagnósticos:", result.recommendations);
      }
      
      return result;
    } catch (error) {
      console.error("❌ HOOK: Erro durante diagnósticos:", error);
      return { success: false, error: `Erro durante diagnósticos: ${error}` };
    }
  }, []);

  // Limpar erros
  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // Atualizar status dos serviços periodicamente
  useEffect(() => {
    if (isInitialized) {
      const interval = setInterval(() => {
        setServicesStatus(eventManagementService.getAllServicesStatus());
      }, 30000); // A cada 30 segundos

      return () => clearInterval(interval);
    }
  }, [isInitialized]);

  // Auto-inicialização em produção (apenas serviços seguros)
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && !isInitialized) {
      console.log("🎯 HOOK: Auto-inicializando serviços em produção...");
      initializeServices();
    }
  }, [initializeServices, isInitialized]);

  return {
    // Status dos serviços
    isInitialized,
    servicesStatus,
    
    // Controles
    initializeServices,
    stopAllServices,
    performManualCleanup,
    performManualSync,
    processEventsWithAI,
    
    // Configurações
    updateServiceConfig,
    toggleService,
    
    // Diagnósticos
    runDiagnostics,
    
    // Estados de loading
    isInitializing,
    isCleaning,
    isSyncing,
    isProcessing,
    
    // Erros
    errors,
    clearErrors
  };
};


