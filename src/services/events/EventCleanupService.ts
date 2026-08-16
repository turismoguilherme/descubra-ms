/**
 * Serviço de Limpeza Automática de Eventos
 */

import { supabase } from "@/integrations/supabase/client";

export interface EventCleanupConfig {
  enabled: boolean;
  cleanupInterval: number;
  archiveExpiredEvents: boolean;
  logCleanupActions: boolean;
}

export class EventCleanupService {
  private config: EventCleanupConfig;
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<EventCleanupConfig> = {}) {
    this.config = {
      enabled: true,
      cleanupInterval: 24,
      archiveExpiredEvents: true,
      logCleanupActions: true,
      ...config
    };
  }

  public startCleanupService(): void {
    if (!this.config.enabled) return;
    this.performCleanup();
    this.scheduleCleanup();
  }

  public stopCleanupService(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  public async performCleanup(): Promise<{
    success: boolean;
    eventsRemoved: number;
    eventsArchived: number;
    errors: string[];
  }> {
    const result = { success: true, eventsRemoved: 0, eventsArchived: 0, errors: [] as string[] };

    try {
      const now = new Date();
      
      const { data: expiredEvents, error: fetchError } = await supabase
        .from('events')
        .select('id, titulo, data_fim, data_inicio')
        .or(`data_fim.lt.${now.toISOString()},and(data_fim.is.null,data_inicio.lt.${now.toISOString()})`);

      if (fetchError) throw new Error(`Erro ao buscar eventos: ${fetchError.message}`);
      if (!expiredEvents || expiredEvents.length === 0) return result;

      for (const event of expiredEvents) {
        try {
          const eventTitle = (event as any).titulo || 'Sem título';
          if (this.config.archiveExpiredEvents) {
            const { error: archiveError } = await supabase
              .from('events')
              .update({ is_visible: false, updated_at: new Date().toISOString() } as any)
              .eq('id', (event as any).id);

            if (archiveError) {
              result.errors.push(`Erro ao arquivar evento ${eventTitle}: ${archiveError.message}`);
            } else {
              result.eventsArchived++;
            }
          } else {
            const { error: deleteError } = await supabase
              .from('events')
              .delete()
              .eq('id', (event as any).id);

            if (deleteError) {
              result.errors.push(`Erro ao remover evento ${eventTitle}: ${deleteError.message}`);
            } else {
              result.eventsRemoved++;
            }
          }
        } catch (eventError) {
          result.errors.push(`Erro ao processar evento: ${eventError}`);
        }
      }
    } catch (error) {
      result.success = false;
      result.errors.push(`Erro geral: ${error}`);
    }

    return result;
  }

  private scheduleCleanup(): void {
    const intervalMs = this.config.cleanupInterval * 60 * 60 * 1000;
    this.cleanupTimer = setInterval(() => {
      this.performCleanup();
    }, intervalMs);
  }

  public updateConfig(newConfig: Partial<EventCleanupConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getServiceStatus() {
    return {
      isRunning: this.cleanupTimer !== null,
      config: this.config,
      nextCleanup: this.cleanupTimer ? new Date(Date.now() + this.config.cleanupInterval * 60 * 60 * 1000) : null
    };
  }
}

export const eventCleanupService = new EventCleanupService();

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  eventCleanupService.startCleanupService();
}
