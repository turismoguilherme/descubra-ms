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
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

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
  private genAI: GoogleGenerativeAI | null = null;

  constructor(config: Partial<IntelligentEventConfig> = {}) {
    if (GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    }
    this.config = {
      googleSearch: {
        enabled: false, // DESATIVADO - eventos manuais
        searchInterval: 24, // 24 horas
        maxResults: 20
      },
      geminiAI: {
        enabled: false, // DESATIVADO - eventos manuais
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
  public async initialize(customConfig?: Partial<IntelligentEventConfig>): Promise<{
    success: boolean;
    servicesStarted: string[];
    errors: string[];
  }> {
    // Aplicar configuração customizada se fornecida
    if (customConfig) {
      if (customConfig.googleSearch) {
        this.config.googleSearch = { ...this.config.googleSearch, ...customConfig.googleSearch };
      }
      if (customConfig.geminiAI) {
        this.config.geminiAI = { ...this.config.geminiAI, ...customConfig.geminiAI };
      }
      if (customConfig.googleCalendar) {
        this.config.googleCalendar = { ...this.config.googleCalendar, ...customConfig.googleCalendar };
      }
      if (customConfig.autoCleanup) {
        this.config.autoCleanup = { ...this.config.autoCleanup, ...customConfig.autoCleanup };
      }
    }

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
          // Erros de RLS (Row Level Security) são esperados em desenvolvimento
          // Erro 401 também é esperado quando não há usuário autenticado
          const isRLSError = error.code === '42501' || error.code === 'PGRST301' || 
                            error.message?.includes('permission denied') ||
                            error.message?.includes('new row violates row-level security');
          
          const isUnauthorizedError = error.status === 401 || error.statusCode === 401;
          
          if (isRLSError || isUnauthorizedError) {
            // Log silencioso em dev - erro esperado quando não há autenticação
            // Não logar para não poluir o console
          } else {
            // Apenas logar erros inesperados
            const isDev = import.meta.env.DEV;
            if (isDev) {
              console.warn(`⚠️ INTELLIGENT EVENTS: Erro ao salvar evento "${eventData.name}":`, error.message);
            }
          }
        } else {
          const isDev = import.meta.env.DEV;
          if (isDev) {
            console.log(`✅ INTELLIGENT EVENTS: Evento "${eventData.name}" salvo com sucesso`);
          }
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
          .insert(eventData)
          .select(); // Adicionar select para evitar erro silencioso

        if (error) {
          // Erros de RLS e 401 são esperados em desenvolvimento quando não há autenticação
          const isRLSError = error.code === '42501' || error.code === 'PGRST301' || 
                            error.message?.includes('permission denied') ||
                            error.message?.includes('new row violates row-level security');
          
          const isUnauthorizedError = error.status === 401 || error.statusCode === 401;
          
          if (!isRLSError && !isUnauthorizedError) {
            // Apenas lançar erros inesperados
            throw error;
          }
          // Erros esperados (RLS/401) são ignorados silenciosamente
        } else {
          const isDev = import.meta.env.DEV;
          if (isDev) {
            console.log(`✅ INTELLIGENT EVENTS: Evento salvo: ${evento.titulo}`);
          }
        }
      } catch (error: any) {
        // Apenas logar erros inesperados
        const isRLSError = error?.code === '42501' || error?.code === 'PGRST301' || 
                          error?.message?.includes('permission denied') ||
                          error?.message?.includes('new row violates row-level security');
        
        const isUnauthorizedError = error?.status === 401 || error?.statusCode === 401;
        
        if (!isRLSError && !isUnauthorizedError) {
          const isDev = import.meta.env.DEV;
          if (isDev) {
            console.error(`❌ INTELLIGENT EVENTS: Erro ao salvar evento:`, error);
          }
        }
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

  /**
   * Classificar categoria de evento automaticamente
   */
  public async classifyEventCategory(title: string, description: string): Promise<{
    category: string;
    confidence: number;
    reasoning: string;
  }> {
    try {
      if (!GEMINI_API_KEY) {
        return {
          category: 'cultural',
          confidence: 0.5,
          reasoning: 'IA não configurada, usando categoria padrão',
        };
      }

      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `
Classifique o seguinte evento turístico em uma das categorias:
- cultural (festivais, shows, exposições, arte)
- gastronomia (festivais de comida, degustações)
- esportivo (competições, maratonas, esportes)
- religioso (festas religiosas, romarias)
- natureza (ecoturismo, observação de aves, trilhas)
- entretenimento (shows, festas, entretenimento)
- educacional (workshops, palestras, cursos)
- outros

Título: ${title}
Descrição: ${description || 'Sem descrição'}

Responda em JSON:
{
  "category": "categoria",
  "confidence": 0.0-1.0,
  "reasoning": "explicação breve"
}
`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          category: parsed.category || 'cultural',
          confidence: parsed.confidence || 0.5,
          reasoning: parsed.reasoning || '',
        };
      }

      return {
        category: 'cultural',
        confidence: 0.5,
        reasoning: 'Não foi possível classificar automaticamente',
      };
    } catch (error) {
      console.error('Erro ao classificar categoria:', error);
      return {
        category: 'cultural',
        confidence: 0.5,
        reasoning: 'Erro ao classificar',
      };
    }
  }

  /**
   * Encontrar eventos similares
   */
  public async findSimilarEvents(event: any): Promise<Array<{
    id: string;
    name: string;
    similarity: number;
    reason: string;
  }>> {
    try {
      const { data: existingEvents } = await supabase
        .from('events')
        .select('id, titulo, descricao, data_inicio, local')
        .neq('id', event.id || '');

      if (!existingEvents) return [];

      const similar: Array<{ id: string; name: string; similarity: number; reason: string }> = [];

      for (const existing of existingEvents) {
        let similarity = 0;
        const reasons: string[] = [];

        // Comparar título
        const titleSimilarity = this.calculateStringSimilarity(
          (event.titulo || event.name || '').toLowerCase(),
          (existing.titulo || existing.name || '').toLowerCase()
        );
        if (titleSimilarity > 0.7) {
          similarity += titleSimilarity * 50;
          reasons.push(`Título similar (${Math.round(titleSimilarity * 100)}%)`);
        }

        // Comparar local
        if (event.local && existing.local) {
          const locationSimilarity = this.calculateStringSimilarity(
            event.local.toLowerCase(),
            existing.local.toLowerCase()
          );
          if (locationSimilarity > 0.8) {
            similarity += locationSimilarity * 30;
            reasons.push(`Local similar`);
          }
        }

        // Comparar data (mesmo mês)
        if (event.data_inicio && existing.data_inicio) {
          const eventDate = new Date(event.data_inicio);
          const existingDate = new Date(existing.data_inicio);
          if (
            eventDate.getMonth() === existingDate.getMonth() &&
            eventDate.getFullYear() === existingDate.getFullYear()
          ) {
            similarity += 20;
            reasons.push('Mesmo período');
          }
        }

        if (similarity > 50) {
          similar.push({
            id: existing.id,
            name: existing.titulo || existing.name || '',
            similarity: Math.min(100, similarity),
            reason: reasons.join(', '),
          });
        }
      }

      return similar.sort((a, b) => b.similarity - a.similarity).slice(0, 5);
    } catch (error) {
      console.error('Erro ao encontrar eventos similares:', error);
      return [];
    }
  }

  /**
   * Sugerir tags para evento
   */
  public async suggestTags(title: string, description: string, category: string): Promise<string[]> {
    try {
      if (!GEMINI_API_KEY) {
        return [category, title.toLowerCase().split(' ')[0]];
      }

      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `
Sugira 5-8 tags relevantes para o seguinte evento turístico:

Título: ${title}
Descrição: ${description || 'Sem descrição'}
Categoria: ${category}

As tags devem ser:
- Palavras-chave relevantes para busca
- Em português
- Relacionadas ao turismo brasileiro
- Específicas e úteis

Retorne apenas um array JSON de strings:
["tag1", "tag2", "tag3"]
`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return Array.isArray(parsed) ? parsed : [];
      }

      return [category, title.toLowerCase().split(' ')[0]];
    } catch (error) {
      console.error('Erro ao sugerir tags:', error);
      return [category, title.toLowerCase().split(' ')[0]];
    }
  }

  /**
   * Calcular similaridade entre strings
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) {
      return 1.0;
    }

    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Distância de Levenshtein
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Preencher dados do evento automaticamente usando IA
   */
  async autoFillEventData(name: string, location: string): Promise<Partial<any>> {
    try {
      if (!this.genAI) {
        throw new Error('Gemini API não configurada');
      }

      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `
Com base no nome e local do evento turístico abaixo, preencha automaticamente os campos faltantes:

Nome: ${name}
Local: ${location}

Forneça uma resposta em JSON com os seguintes campos (apenas os que você conseguir inferir):
{
  "titulo": "título completo do evento",
  "descricao": "descrição detalhada e atrativa do evento",
  "categoria": "cultural|gastronomic|sports|religious|entertainment|business",
  "expected_audience": número estimado de público,
  "budget": orçamento estimado em reais (número),
  "contact_phone": "telefone de contato se disponível",
  "contact_email": "email de contato se disponível",
  "contact_website": "site oficial se disponível",
  "features": ["característica1", "característica2"],
  "opening_hours": "horário de funcionamento se aplicável"
}

Seja específico e realista. Use informações sobre o local e tipo de evento para fazer inferências inteligentes.
`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      // Extrair JSON da resposta
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed;
      }

      return {};
    } catch (error) {
      console.error('Erro ao preencher dados automaticamente:', error);
      return {};
    }
  }

  /**
   * Gerar descrição do evento usando IA
   */
  async generateDescription(title: string, category: string, location: string): Promise<string> {
    try {
      if (!this.genAI) {
        throw new Error('Gemini API não configurada');
      }

      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `
Gere uma descrição atrativa e detalhada para o seguinte evento turístico:

Título: ${title}
Categoria: ${category}
Local: ${location}

A descrição deve:
- Ser atrativa e convidativa
- Ter entre 100 e 300 palavras
- Destacar os principais atrativos do evento
- Mencionar informações relevantes sobre o local
- Ser escrita em português brasileiro
- Usar linguagem turística apropriada

Retorne apenas a descrição, sem formatação adicional.
`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      // Limpar a resposta (remover markdown, aspas extras, etc)
      return response
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .replace(/^["']|["']$/g, '')
        .trim();
    } catch (error) {
      console.error('Erro ao gerar descrição:', error);
      return '';
    }
  }

  /**
   * Classificar categoria do evento automaticamente
   */
  async classifyEventAutomatically(title: string, description: string): Promise<string> {
    try {
      if (!this.genAI) {
        return 'entertainment'; // Default
      }

      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `
Classifique o seguinte evento turístico em uma das categorias: cultural, gastronomic, sports, religious, entertainment, business

Título: ${title}
Descrição: ${description || 'Sem descrição'}

Responda apenas com uma das categorias acima, sem explicações adicionais.
`;

      const result = await model.generateContent(prompt);
      const category = result.response.text().trim().toLowerCase();

      const validCategories = ['cultural', 'gastronomic', 'sports', 'religious', 'entertainment', 'business'];
      if (validCategories.includes(category)) {
        return category;
      }

      return 'entertainment'; // Default
    } catch (error) {
      console.error('Erro ao classificar evento:', error);
      return 'entertainment';
    }
  }

  /**
   * Detectar eventos similares
   */
  async detectSimilarEvents(event: any): Promise<Array<{ id: string; name: string; similarity: number }>> {
    try {
      const { data: existingEvents } = await supabase
        .from('events')
        .select('id, titulo, descricao, data_inicio, local')
        .neq('id', event.id || '');

      if (!existingEvents) return [];

      const similar: Array<{ id: string; name: string; similarity: number }> = [];

      for (const existing of existingEvents) {
        let similarity = 0;

        // Comparar título
        const title1 = (event.titulo || event.title || '').toLowerCase();
        const title2 = (existing.titulo || existing.name || '').toLowerCase();
        if (title1 && title2) {
          const titleSimilarity = this.calculateSimilarity(title1, title2);
          similarity += titleSimilarity * 0.5;
        }

        // Comparar local
        const location1 = (event.local || event.location || '').toLowerCase();
        const location2 = (existing.local || existing.location || '').toLowerCase();
        if (location1 && location2 && location1 === location2) {
          similarity += 0.3;
        }

        // Comparar data (mesmo mês)
        if (event.data_inicio && existing.data_inicio) {
          const date1 = new Date(event.data_inicio);
          const date2 = new Date(existing.data_inicio);
          if (date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear()) {
            similarity += 0.2;
          }
        }

        if (similarity > 0.5) {
          similar.push({
            id: existing.id,
            name: existing.titulo || existing.name || '',
            similarity: Math.round(similarity * 100),
          });
        }
      }

      return similar.sort((a, b) => b.similarity - a.similarity).slice(0, 5);
    } catch (error) {
      console.error('Erro ao detectar eventos similares:', error);
      return [];
    }
  }

  /**
   * Sugerir tags para o evento
   */
  async suggestEventTags(title: string, description: string, category: string): Promise<string[]> {
    try {
      if (!this.genAI) {
        return [];
      }

      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `
Sugira 5-10 tags relevantes para o seguinte evento turístico:

Título: ${title}
Descrição: ${description || 'Sem descrição'}
Categoria: ${category}

As tags devem ser:
- Relevantes ao evento
- Em português
- Curtas (1-3 palavras)
- Úteis para busca e categorização

Retorne apenas as tags separadas por vírgula, sem numeração ou formatação adicional.
`;

      const result = await model.generateContent(prompt);
      const tags = result.response.text()
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .slice(0, 10);

      return tags;
    } catch (error) {
      console.error('Erro ao sugerir tags:', error);
      return [];
    }
  }

  /**
   * Calcular similaridade entre strings
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }
}

// Instância singleton
export const intelligentEventService = new IntelligentEventService();

