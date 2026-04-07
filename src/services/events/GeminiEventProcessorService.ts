/**
 * Serviço de Processamento de Eventos com Gemini AI
 */

import { supabase } from "@/integrations/supabase/client";

export interface GeminiEventProcessorConfig {
  enabled: boolean;
  processNewEvents: boolean;
  processExistingEvents: boolean;
  autoCategorize: boolean;
  autoExtractMetadata: boolean;
  logProcessingActions: boolean;
}

export interface EventProcessingResult {
  success: boolean;
  category?: string;
  extractedMetadata?: {
    location?: string;
    price?: string;
    eventType?: string;
    tags?: string[];
  };
  improvedDescription?: string;
  confidence?: number;
  error?: string;
}

export class GeminiEventProcessorService {
  private config: GeminiEventProcessorConfig;
  private isGeminiApiAvailable: boolean = false;

  constructor(config: Partial<GeminiEventProcessorConfig> = {}) {
    this.config = {
      enabled: false,
      processNewEvents: true,
      processExistingEvents: false,
      autoCategorize: true,
      autoExtractMetadata: true,
      logProcessingActions: true,
      ...config
    };
  }

  public async startProcessingService(): Promise<void> {
    if (!this.config.enabled) return;
    await this.checkGeminiApiAvailability();
  }

  private async checkGeminiApiAvailability(): Promise<void> {
    try {
      this.isGeminiApiAvailable = false;
    } catch {
      this.isGeminiApiAvailable = false;
    }
  }

  public async processEvent(eventId: string): Promise<EventProcessingResult> {
    try {
      if (!this.isGeminiApiAvailable) {
        return { success: false, error: "Gemini API não disponível" };
      }

      const { data: event, error: fetchError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (fetchError || !event) {
        return { success: false, error: `Evento não encontrado: ${fetchError?.message}` };
      }

      const eventAny = event as any;
      const result = await this.simulateGeminiProcessing(eventAny);

      if (result.success) {
        await this.saveProcessingResult(eventId, result);
      }

      return result;
    } catch (error) {
      return { success: false, error: `Erro de processamento: ${error}` };
    }
  }

  private async simulateGeminiProcessing(event: any): Promise<EventProcessingResult> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const category = this.simulateCategorization(event.titulo || '');
    const metadata = this.simulateMetadataExtraction(event);

    return {
      success: true,
      category,
      extractedMetadata: metadata,
      confidence: 0.85,
      improvedDescription: event.descricao
    };
  }

  private simulateCategorization(eventName: string): string {
    const name = eventName.toLowerCase();
    if (name.includes('festival') || name.includes('música') || name.includes('show')) return 'Cultural';
    if (name.includes('esporte') || name.includes('corrida')) return 'Esportivo';
    if (name.includes('gastronomia') || name.includes('comida')) return 'Gastronômico';
    if (name.includes('turismo') || name.includes('passeio')) return 'Turístico';
    return 'Geral';
  }

  private simulateMetadataExtraction(event: any): any {
    const metadata: any = {};
    if (event.local) metadata.location = event.local;
    if (event.descricao?.toLowerCase().includes('gratuito')) {
      metadata.price = 'Gratuito';
    } else {
      metadata.price = 'Pago';
    }
    metadata.tags = this.extractTags(event.titulo || '', event.descricao || '');
    return metadata;
  }

  private extractTags(name: string, description: string): string[] {
    const text = `${name} ${description}`.toLowerCase();
    const tags: string[] = [];
    const tagKeywords: Record<string, string[]> = {
      'familiar': ['família', 'criança', 'infantil'],
      'noturno': ['noite', 'noturno'],
      'gratuito': ['gratuito', 'gratis', 'entrada livre'],
      'ao ar livre': ['parque', 'praça', 'ar livre'],
      'educativo': ['curso', 'workshop', 'palestra']
    };
    Object.entries(tagKeywords).forEach(([tag, keywords]) => {
      if (keywords.some(keyword => text.includes(keyword))) tags.push(tag);
    });
    return tags;
  }

  private async saveProcessingResult(eventId: string, result: EventProcessingResult): Promise<void> {
    try {
      const updateData: any = {};
      if (result.category) updateData.categoria = result.category;
      updateData.processado_por_ia = true;
      updateData.ultima_atualizacao = new Date().toISOString();

      await supabase.from('events').update(updateData).eq('id', eventId);
    } catch (error) {
      console.error("Erro ao salvar resultado do processamento:", error);
    }
  }

  public async processAllPendingEvents(): Promise<{ success: boolean; processed: number; errors: string[] }> {
    const result = { success: true, processed: 0, errors: [] as string[] };

    try {
      const { data: pendingEvents, error: fetchError } = await supabase
        .from('events')
        .select('id, titulo')
        .is('processado_por_ia', null)
        .eq('is_visible', true);

      if (fetchError) throw new Error(`Erro ao buscar eventos: ${fetchError.message}`);
      if (!pendingEvents || pendingEvents.length === 0) return result;

      for (const event of pendingEvents) {
        try {
          const eventAny = event as any;
          const processingResult = await this.processEvent(eventAny.id);
          if (processingResult.success) {
            result.processed++;
          } else {
            result.errors.push(`Erro ao processar ${eventAny.titulo}: ${processingResult.error}`);
          }
        } catch (eventError) {
          result.errors.push(`Erro: ${eventError}`);
        }
      }
    } catch (error) {
      result.success = false;
      result.errors.push(`Erro geral: ${error}`);
    }

    return result;
  }

  public updateConfig(newConfig: Partial<GeminiEventProcessorConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getServiceStatus() {
    return {
      isRunning: this.config.enabled,
      isGeminiApiAvailable: this.isGeminiApiAvailable,
      config: this.config
    };
  }
}

export const geminiEventProcessorService = new GeminiEventProcessorService();
