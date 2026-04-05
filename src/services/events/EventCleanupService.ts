/**
 * Serviço de Limpeza Automática de Eventos
 * 
 * FUNCIONALIDADE: Remove eventos finalizados automaticamente
 * SEGURANÇA: Não interfere com funcionalidades existentes
 * MODO: Operação em background, não afeta UI
 */

import { supabase } from "@/integrations/supabase/client";

export interface EventCleanupConfig {
  enabled: boolean;
  cleanupInterval: number; // em horas
  archiveExpiredEvents: boolean;
  logCleanupActions: boolean;
}

export class EventCleanupService {
  private config: EventCleanupConfig;
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<EventCleanupConfig> = {}) {
    this.config = {
      enabled: true,
      cleanupInterval: 24, // 24 horas por padrão
      archiveExpiredEvents: true,
      logCleanupActions: true,
      ...config
    };
  }

  /**
   * Inicia o serviço de limpeza automática
   * SEGURO: Não afeta funcionalidades existentes
   */
  public startCleanupService(): void {
    if (!this.config.enabled) {
      console.log("🧹 EVENTOS: Serviço de limpeza desabilitado");
      return;
    }

    console.log("🧹 EVENTOS: Iniciando serviço de limpeza automática");
    
    // Executar limpeza imediatamente
    this.performCleanup();
    
    // Agendar limpeza periódica
    this.scheduleCleanup();
  }

  /**
   * Para o serviço de limpeza
   */
  public stopCleanupService(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
      console.log("🧹 EVENTOS: Serviço de limpeza parado");
    }
  }

  /**
   * Executa limpeza manual de eventos
   * SEGURO: Operação isolada, não afeta UI
   */
  public async performCleanup(): Promise<{
    success: boolean;
    eventsRemoved: number;
    eventsArchived: number;
    errors: string[];
  }> {
    const result = {
      success: true,
      eventsRemoved: 0,
      eventsArchived: 0,
      errors: [] as string[]
    };

    try {
      console.log("🧹 EVENTOS: Iniciando limpeza de eventos...");
      
      const now = new Date();
      
      // 1. Buscar eventos que já terminaram
      const { data: expiredEvents, error: fetchError } = await supabase
        .from('events')
        .select('id, titulo, data_fim, data_inicio')
        .or(`data_fim.lt.${now.toISOString()},and(data_fim.is.null,data_inicio.lt.${now.toISOString()})`);

      if (fetchError) {
        throw new Error(`Erro ao buscar eventos: ${fetchError.message}`);
      }

      if (!expiredEvents || expiredEvents.length === 0) {
        console.log("🧹 EVENTOS: Nenhum evento expirado encontrado");
        return result;
      }

      console.log(`🧹 EVENTOS: Encontrados ${expiredEvents.length} eventos expirados`);

      // 2. Processar eventos expirados
      for (const event of expiredEvents) {
        try {
          if (this.config.archiveExpiredEvents) {
            // Arquivar evento (marcar como não visível)
            const { error: archiveError } = await supabase
              .from('events')
              .update({ 
                is_visible: false,
                auto_hide: true,
                updated_at: new Date().toISOString()
              })
              .eq('id', event.id);

            if (archiveError) {
              result.errors.push(`Erro ao arquivar evento ${event.titulo}: ${archiveError.message}`);
            } else {
              result.eventsArchived++;
              console.log(`🧹 EVENTOS: Evento arquivado: ${event.titulo}`);
            }
          } else {
            // Remover evento completamente
            const { error: deleteError } = await supabase
              .from('events')
              .delete()
              .eq('id', event.id);

            if (deleteError) {
              result.errors.push(`Erro ao remover evento ${event.titulo}: ${deleteError.message}`);
            } else {
              result.eventsRemoved++;
              console.log(`🧹 EVENTOS: Evento removido: ${event.titulo}`);
            }
          }
        } catch (eventError) {
          result.errors.push(`Erro ao processar evento ${event.titulo}: ${eventError}`);
        }
      }

      // 3. Log do resultado
      if (this.config.logCleanupActions) {
        console.log(`🧹 EVENTOS: Limpeza concluída - Arquivados: ${result.eventsArchived}, Removidos: ${result.eventsRemoved}`);
        
        if (result.errors.length > 0) {
          console.warn(`🧹 EVENTOS: Erros durante limpeza:`, result.errors);
        }
      }

    } catch (error) {
      console.error("🧹 EVENTOS: Erro durante limpeza:", error);
      result.success = false;
      result.errors.push(`Erro geral: ${error}`);
    }

    return result;
  }

  /**
   * Agenda limpeza periódica
   * SEGURO: Não interfere com outras operações
   */
  private scheduleCleanup(): void {
    const intervalMs = this.config.cleanupInterval * 60 * 60 * 1000; // converter para ms
    
    this.cleanupTimer = setInterval(() => {
      console.log("🧹 EVENTOS: Executando limpeza agendada...");
      this.performCleanup();
    }, intervalMs);

    console.log(`🧹 EVENTOS: Limpeza agendada para cada ${this.config.cleanupInterval} horas`);
  }

  /**
   * Atualiza configuração do serviço
   */
  public updateConfig(newConfig: Partial<EventCleanupConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log("🧹 EVENTOS: Configuração atualizada:", this.config);
  }

  /**
   * Obtém status do serviço
   */
  public getServiceStatus(): {
    isRunning: boolean;
    config: EventCleanupConfig;
    nextCleanup: Date | null;
  } {
    return {
      isRunning: this.cleanupTimer !== null,
      config: this.config,
      nextCleanup: this.cleanupTimer ? new Date(Date.now() + this.config.cleanupInterval * 60 * 60 * 1000) : null
    };
  }
}

// Instância singleton para uso global
export const eventCleanupService = new EventCleanupService();

// Auto-inicialização (apenas se não estiver em modo de desenvolvimento)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  // Iniciar serviço automaticamente em produção
  eventCleanupService.startCleanupService();
}

