/**
 * Serviço Principal de Eventos Inteligentes
 * 
 * FUNCIONALIDADE: Orquestra busca, processamento e exibição de eventos
 * SEGURANÇA: Não interfere com funcionalidades existentes
 */

import { EventoCompleto, EventoFiltros, EventoEstatisticas } from '@/types/events';
import { googleSearchEventService } from './GoogleSearchEventService';
import { geminiEventProcessor } from './GeminiEventProcessor';
import { supabase } from '@/integrations/supabase/client';

export interface IntelligentEventConfig {
  googleSearch: {
    enabled: boolean;
    searchInterval: number; // em horas
    maxResults: number;
  };
  geminiAI: {
    enabled: boolean;
    processNewEvents: boolean;
    improveDescriptions: boolean;
  };
  googleCalendar: {
    enabled: boolean;
    syncInterval: number; // em horas
  };
  autoCleanup: {
    enabled: boolean;
    cleanupInterval: number; // em horas
  };
}

export class IntelligentEventService {
  private config: IntelligentEventConfig;
  private isInitialized: boolean = false;

  constructor(config: Partial<IntelligentEventConfig> = {}) {
    this.config = {
      googleSearch: {
        enabled: true,
        searchInterval: 24, // 24 horas
        maxResults: 20
      },
      geminiAI: {
        enabled: true,
        processNewEvents: true,
        improveDescriptions: true
      },
      googleCalendar: {
        enabled: false, // Desabilitado por padrão
        syncInterval: 6
      },
      autoCleanup: {
        enabled: true,
        cleanupInterval: 24
      },
      ...config
    };
  }

  /**
   * Inicializa o serviço inteligente
   */
  public async initialize(): Promise<{
    success: boolean;
    servicesStarted: string[];
    errors: string[];
  }> {
    const result = {
      success: true,
      servicesStarted: [] as string[],
      errors: [] as string[]
    };

    try {
      console.log("🎯 INTELLIGENT EVENTS: Inicializando serviço inteligente...");

      // 1. Buscar eventos com Google Search
      if (this.config.googleSearch.enabled) {
        try {
          console.log("🔍 INTELLIGENT EVENTS: Buscando eventos com Google Search...");
          const searchResult = await googleSearchEventService.searchEvents();
          
          if (searchResult.success && searchResult.eventos.length > 0) {
            console.log(`✅ INTELLIGENT EVENTS: Encontrados ${searchResult.eventos.length} eventos`);
            
            // 2. Processar eventos com Gemini AI
            if (this.config.geminiAI.enabled) {
              console.log("🤖 INTELLIGENT EVENTS: Processando eventos com Gemini AI...");
              const processedEvents = await geminiEventProcessor.processMultipleEvents(searchResult.eventos);
              
              // 3. Salvar eventos processados no banco
              await this.saveProcessedEvents(processedEvents);
              
              result.servicesStarted.push('GoogleSearch + GeminiAI');
            } else {
              // Salvar eventos sem processamento
              await this.saveEvents(searchResult.eventos);
              result.servicesStarted.push('GoogleSearch');
            }
          }
        } catch (error) {
          result.errors.push(`Erro na busca: ${error}`);
        }
      }

      // 4. Executar limpeza automática
      if (this.config.autoCleanup.enabled) {
        try {
          await this.performAutoCleanup();
          result.servicesStarted.push('AutoCleanup');
        } catch (error) {
          result.errors.push(`Erro na limpeza: ${error}`);
        }
      }

      this.isInitialized = true;
      console.log(`🎯 INTELLIGENT EVENTS: Inicialização concluída - ${result.servicesStarted.length} serviços iniciados`);

    } catch (error) {
      console.error("🎯 INTELLIGENT EVENTS: Erro durante inicialização:", error);
      result.success = false;
      result.errors.push(`Erro geral: ${error}`);
    }

    return result;
  }

  /**
   * Salva eventos processados no banco
   */
  private async saveProcessedEvents(processedEvents: any[]): Promise<void> {
    console.log(`💾 INTELLIGENT EVENTS: Salvando ${processedEvents.length} eventos processados...`);
    
    for (const processedEvent of processedEvents) {
      try {
        const evento = processedEvent.evento_processado;
        
        // Converter evento processado para formato da tabela events
        const eventData = {
          name: evento.titulo || evento.nome || 'Evento sem título',
          description: evento.descricao_completa || evento.descricao_resumida || evento.descricao || '',
          location: evento.local || evento.endereco || evento.cidade || '',
          start_date: evento.data_inicio || evento.data || new Date().toISOString(),
          end_date: evento.data_fim || null,
          is_visible: true,
          auto_hide: true,
        };

        // Verificar se evento já existe (por título e data)
        const { data: existingEvents } = await supabase
          .from('events')
          .select('id')
          .eq('name', eventData.name)
          .eq('start_date', eventData.start_date)
          .limit(1);

        if (existingEvents && existingEvents.length > 0) {
          console.log(`⏭️  INTELLIGENT EVENTS: Evento "${eventData.name}" já existe, pulando...`);
          continue;
        }

        // Inserir novo evento
        const { error } = await supabase
          .from('events')
          .insert(eventData);

        if (error) {
          console.error(`❌ INTELLIGENT EVENTS: Erro ao salvar evento "${eventData.name}":`, error);
        } else {
          console.log(`✅ INTELLIGENT EVENTS: Evento "${eventData.name}" salvo com sucesso`);
        }
      } catch (error) {
        console.error(`❌ INTELLIGENT EVENTS: Erro ao processar evento:`, error);
      }
    }
    
    console.log(`✅ INTELLIGENT EVENTS: ${processedEvents.length} eventos processados`);
  }

  /**
   * Salva eventos simples no banco
   */
  private async saveEvents(eventos: EventoCompleto[]): Promise<void> {
    console.log(`💾 INTELLIGENT EVENTS: Salvando ${eventos.length} eventos...`);
    
    for (const evento of eventos) {
      try {
        const eventData = {
          name: evento.titulo,
          description: evento.descricao_completa || evento.descricao_resumida,
          location: `${evento.local}, ${evento.cidade}`,
          start_date: evento.data_inicio,
          end_date: evento.data_fim,
          image_url: evento.imagem_principal,
          external_id: evento.id,
          external_url: evento.site_oficial,
          source: evento.fonte,
          is_visible: evento.visibilidade,
          auto_hide: false
        };

        const { error } = await supabase
          .from('events')
          .insert(eventData);

        if (error) throw error;
        console.log(`✅ INTELLIGENT EVENTS: Evento salvo: ${evento.titulo}`);
      } catch (error) {
        console.error(`❌ INTELLIGENT EVENTS: Erro ao salvar evento:`, error);
      }
    }
  }

  /**
   * Executa limpeza automática
   */
  private async performAutoCleanup(): Promise<void> {
    console.log("🧹 INTELLIGENT EVENTS: Executando limpeza automática...");
    
    const now = new Date();
    
    // Buscar eventos expirados
    const { data: expiredEvents, error: fetchError } = await supabase
      .from('events')
      .select('id, name, end_date, start_date')
      .or(`end_date.lt.${now.toISOString()},and(end_date.is.null,start_date.lt.${now.toISOString()})`);

    if (fetchError) {
      throw new Error(`Erro ao buscar eventos: ${fetchError.message}`);
    }

    if (expiredEvents && expiredEvents.length > 0) {
      console.log(`🧹 INTELLIGENT EVENTS: Encontrados ${expiredEvents.length} eventos expirados`);
      
      // Arquivar eventos expirados
      for (const event of expiredEvents) {
        try {
          const { error } = await supabase
            .from('events')
            .update({ 
              is_visible: false,
              auto_hide: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', event.id);

          if (error) throw error;
          console.log(`🧹 INTELLIGENT EVENTS: Evento arquivado: ${event.name}`);
        } catch (error) {
          console.error(`❌ INTELLIGENT EVENTS: Erro ao arquivar evento:`, error);
        }
      }
    }
  }

  /**
   * Busca eventos com filtros
   */
  public async getEvents(filtros?: EventoFiltros): Promise<{
    success: boolean;
    eventos: EventoCompleto[];
    total: number;
    errors: string[];
  }> {
    const result = {
      success: true,
      eventos: [] as EventoCompleto[],
      total: 0,
      errors: [] as string[]
    };

    try {
      console.log("🔍 INTELLIGENT EVENTS: Buscando eventos...");
      
      let query = supabase
        .from('events')
        .select('*')
        .eq('is_visible', true);

      // Aplicar filtros
      if (filtros?.cidade) {
        query = query.ilike('location', `%${filtros.cidade}%`);
      }
      
      if (filtros?.categoria) {
        query = query.eq('category', filtros.categoria);
      }
      
      if (filtros?.data_inicio) {
        query = query.gte('start_date', filtros.data_inicio);
      }
      
      if (filtros?.data_fim) {
        query = query.lte('start_date', filtros.data_fim);
      }

      const { data: eventos, error } = await query.order('start_date');

      if (error) throw error;

      // Converter para formato EventoCompleto
      result.eventos = (eventos || []).map(evento => ({
        id: evento.id,
        titulo: evento.name,
        descricao_resumida: evento.description?.substring(0, 200) || '',
        descricao_completa: evento.description || '',
        data_inicio: evento.start_date,
        data_fim: evento.end_date,
        local: evento.location,
        cidade: evento.location?.split(',')[1]?.trim() || '',
        estado: 'MS',
        endereco_completo: evento.location || '',
        imagem_principal: evento.image_url,
        site_oficial: evento.external_url,
        categoria: evento.category || 'cultural',
        tipo_entrada: evento.event_type || 'gratuito',
        publico_alvo: 'geral',
        status: 'ativo',
        visibilidade: evento.is_visible,
        destaque: false,
        organizador: 'Sistema Inteligente',
        fonte: evento.source || 'manual',
        processado_por_ia: evento.ai_processed || false,
        confiabilidade: evento.ai_confidence || 50,
        ultima_atualizacao: evento.updated_at || evento.created_at,
        tags: evento.tags || [],
        palavras_chave: evento.keywords || [],
        relevancia: evento.relevance || 50
      }));

      result.total = result.eventos.length;
      console.log(`✅ INTELLIGENT EVENTS: Encontrados ${result.total} eventos`);

    } catch (error) {
      console.error("❌ INTELLIGENT EVENTS: Erro ao buscar eventos:", error);
      result.success = false;
      result.errors.push(`Erro de busca: ${error}`);
    }

    return result;
  }

  /**
   * Obtém estatísticas dos eventos
   */
  public async getEventStatistics(): Promise<EventoEstatisticas> {
    try {
      const { data: eventos } = await supabase
        .from('events')
        .select('*')
        .eq('is_visible', true);

      const now = new Date();
      const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thisMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const eventosAtivos = eventos?.filter(e => new Date(e.start_date) >= now) || [];
      const eventosEstaSemana = eventos?.filter(e => new Date(e.start_date) >= thisWeek) || [];
      const eventosEsteMes = eventos?.filter(e => new Date(e.start_date) >= thisMonth) || [];

      // Contar categorias
      const categorias = eventos?.reduce((acc, evento) => {
        const cat = evento.category || 'cultural';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Contar cidades
      const cidades = eventos?.reduce((acc, evento) => {
        const cidade = evento.location?.split(',')[1]?.trim() || 'Desconhecida';
        acc[cidade] = (acc[cidade] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return {
        total_eventos: eventos?.length || 0,
        eventos_ativos: eventosAtivos.length,
        eventos_esta_semana: eventosEstaSemana.length,
        eventos_este_mes: eventosEsteMes.length,
        categorias_mais_populares: Object.entries(categorias)
          .map(([categoria, quantidade]) => ({ categoria, quantidade }))
          .sort((a, b) => b.quantidade - a.quantidade)
          .slice(0, 5),
        cidades_mais_ativas: Object.entries(cidades)
          .map(([cidade, quantidade]) => ({ cidade, quantidade }))
          .sort((a, b) => b.quantidade - a.quantidade)
          .slice(0, 5)
      };
    } catch (error) {
      console.error("❌ INTELLIGENT EVENTS: Erro ao obter estatísticas:", error);
      return {
        total_eventos: 0,
        eventos_ativos: 0,
        eventos_esta_semana: 0,
        eventos_este_mes: 0,
        categorias_mais_populares: [],
        cidades_mais_ativas: []
      };
    }
  }

  /**
   * Atualiza configuração do serviço
   */
  public updateConfig(newConfig: Partial<IntelligentEventConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log("🎯 INTELLIGENT EVENTS: Configuração atualizada:", this.config);
  }

  /**
   * Obtém status do serviço
   */
  public getServiceStatus(): {
    isInitialized: boolean;
    config: IntelligentEventConfig;
    googleSearch: any;
    geminiAI: any;
  } {
    return {
      isInitialized: this.isInitialized,
      config: this.config,
      googleSearch: googleSearchEventService.getServiceStatus(),
      geminiAI: geminiEventProcessor.getServiceStatus()
    };
  }
}

// Instância singleton
export const intelligentEventService = new IntelligentEventService();

