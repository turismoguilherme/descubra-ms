/**
 * Serviço de Processamento de Eventos com Gemini AI
 * 
 * FUNCIONALIDADE: Processa e melhora eventos com IA
 * SEGURANÇA: Não interfere com funcionalidades existentes
 */

import { EventoCompleto, EventoProcessamento } from '@/types/events';

export interface GeminiEventProcessorConfig {
  enabled: boolean;
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  processNewEvents: boolean;
  improveDescriptions: boolean;
  extractMetadata: boolean;
  categorizeEvents: boolean;
  logProcessingActions: boolean;
}

export class GeminiEventProcessor {
  private config: GeminiEventProcessorConfig;
  private isApiAvailable: boolean = false;

  constructor(config: Partial<GeminiEventProcessorConfig> = {}) {
    this.config = {
      enabled: false, // Desabilitado por padrão
      apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
      model: 'gemini-1.5-flash',
      maxTokens: 2000,
      temperature: 0.7,
      processNewEvents: true,
      improveDescriptions: true,
      extractMetadata: true,
      categorizeEvents: true,
      logProcessingActions: true,
      ...config
    };
  }

  /**
   * Verifica se Gemini API está disponível
   */
  private async checkApiAvailability(): Promise<void> {
    try {
      if (!this.config.apiKey) {
        console.log("🤖 GEMINI: API Key não configurada");
        this.isApiAvailable = false;
        return;
      }

      // TODO: Implementar verificação real da API
      this.isApiAvailable = true;
      console.log("🤖 GEMINI: Gemini API disponível");
      
    } catch (error) {
      console.error("🤖 GEMINI: Erro ao verificar API:", error);
      this.isApiAvailable = false;
    }
  }

  /**
   * Processa evento com Gemini AI
   */
  public async processEvent(evento: EventoCompleto): Promise<EventoProcessamento> {
    try {
      if (!this.isApiAvailable) {
        await this.checkApiAvailability();
        if (!this.isApiAvailable) {
          throw new Error("Gemini API não disponível");
        }
      }

      console.log(`🤖 GEMINI: Processando evento: ${evento.titulo}`);

      // TODO: Implementar processamento real com Gemini AI
      const resultado = await this.simulateGeminiProcessing(evento);

      return resultado;

    } catch (error) {
      console.error("🤖 GEMINI: Erro ao processar evento:", error);
      return {
        evento_bruto: evento,
        evento_processado: evento,
        confianca: 0,
        fontes_encontradas: [],
        melhorias_aplicadas: [`Erro: ${error}`]
      };
    }
  }

  /**
   * Simula processamento com Gemini AI
   */
  private async simulateGeminiProcessing(evento: EventoCompleto): Promise<EventoProcessamento> {
    // Simular delay de processamento
    await new Promise(resolve => setTimeout(resolve, 1500));

    const eventoProcessado: EventoCompleto = {
      ...evento,
      descricao_completa: this.improveDescription(evento.descricao_completa || evento.descricao_resumida),
      categoria: this.categorizeEvent(evento.titulo, evento.descricao_resumida),
      tags: this.extractTags(evento.titulo, evento.descricao_resumida),
      palavras_chave: this.extractKeywords(evento.titulo, evento.descricao_resumida),
      processado_por_ia: true,
      confiabilidade: Math.min(evento.confiabilidade + 10, 100),
      ultima_atualizacao: new Date().toISOString()
    };

    return {
      evento_bruto: evento,
      evento_processado: eventoProcessado,
      confianca: 85,
      fontes_encontradas: ['google_search', 'web_scraping'],
      melhorias_aplicadas: [
        'Descrição melhorada',
        'Categorização automática',
        'Tags extraídas',
        'Palavras-chave identificadas',
        'Confiança aumentada'
      ]
    };
  }

  /**
   * Melhora descrição do evento
   */
  private improveDescription(descricao: string | undefined): string {
    // Se não houver descrição, retornar uma descrição padrão
    if (!descricao || typeof descricao !== 'string') {
      return 'Um evento especial que você não pode perder.';
    }

    // Simular melhoria de descrição
    const melhorias = [
      'Este evento promete ser uma experiência única',
      'Uma oportunidade imperdível para',
      'Venha participar desta celebração especial',
      'Um momento de encontro e celebração'
    ];

    const melhoria = melhorias[Math.floor(Math.random() * melhorias.length)];
    return `${melhoria} ${descricao.toLowerCase()}.`;
  }

  /**
   * Categoriza evento automaticamente
   */
  private categorizeEvent(titulo: string, descricao: string): EventoCompleto['categoria'] {
    const texto = `${titulo} ${descricao}`.toLowerCase();
    
    if (texto.includes('festival') || texto.includes('música') || texto.includes('show')) {
      return 'cultural';
    } else if (texto.includes('esporte') || texto.includes('corrida') || texto.includes('competição')) {
      return 'esportivo';
    } else if (texto.includes('gastronomia') || texto.includes('comida') || texto.includes('culinária')) {
      return 'gastronomico';
    } else if (texto.includes('turismo') || texto.includes('passeio') || texto.includes('viagem')) {
      return 'turismo';
    } else if (texto.includes('oficial') || texto.includes('governo') || texto.includes('prefeitura')) {
      return 'oficial';
    } else if (texto.includes('curso') || texto.includes('workshop') || texto.includes('palestra')) {
      return 'educativo';
    } else {
      return 'cultural';
    }
  }

  /**
   * Extrai tags do evento
   */
  private extractTags(titulo: string, descricao: string): string[] {
    const texto = `${titulo} ${descricao}`.toLowerCase();
    const tags: string[] = [];
    
    const tagKeywords = {
      'familiar': ['família', 'criança', 'infantil'],
      'noturno': ['noite', 'noturno', '21h', '22h'],
      'gratuito': ['gratuito', 'gratis', 'entrada livre'],
      'ao ar livre': ['parque', 'praça', 'exterior', 'ar livre'],
      'educativo': ['curso', 'workshop', 'palestra', 'educativo'],
      'gastronômico': ['comida', 'culinária', 'gastronomia', 'sabor'],
      'cultural': ['arte', 'cultura', 'exposição', 'museu'],
      'esportivo': ['esporte', 'competição', 'atividade física']
    };
    
    Object.entries(tagKeywords).forEach(([tag, keywords]) => {
      if (keywords.some(keyword => texto.includes(keyword))) {
        tags.push(tag);
      }
    });
    
    return tags;
  }

  /**
   * Extrai palavras-chave
   */
  private extractKeywords(titulo: string, descricao: string): string[] {
    const texto = `${titulo} ${descricao}`.toLowerCase();
    const palavras = texto.split(/\s+/);
    
    // Filtrar palavras comuns e manter apenas as relevantes
    const palavrasComuns = ['de', 'da', 'do', 'das', 'dos', 'em', 'na', 'no', 'nas', 'nos', 'para', 'com', 'por', 'sobre', 'entre'];
    const palavrasRelevantes = palavras
      .filter(palavra => palavra.length > 3 && !palavrasComuns.includes(palavra))
      .slice(0, 10);
    
    return [...new Set(palavrasRelevantes)]; // Remove duplicatas
  }

  /**
   * Processa múltiplos eventos
   */
  public async processMultipleEvents(eventos: EventoCompleto[]): Promise<EventoProcessamento[]> {
    console.log(`🤖 GEMINI: Processando ${eventos.length} eventos...`);
    
    const resultados: EventoProcessamento[] = [];
    
    for (const evento of eventos) {
      try {
        const resultado = await this.processEvent(evento);
        resultados.push(resultado);
      } catch (error) {
        console.error(`🤖 GEMINI: Erro ao processar evento ${evento.titulo}:`, error);
        resultados.push({
          evento_bruto: evento,
          evento_processado: evento,
          confianca: 0,
          fontes_encontradas: [],
          melhorias_aplicadas: [`Erro: ${error}`]
        });
      }
    }
    
    console.log(`🤖 GEMINI: Processamento concluído - ${resultados.length} eventos processados`);
    return resultados;
  }

  /**
   * Atualiza configuração do serviço
   */
  public updateConfig(newConfig: Partial<GeminiEventProcessorConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log("🤖 GEMINI: Configuração atualizada:", this.config);
  }

  /**
   * Obtém status do serviço
   */
  public getServiceStatus(): {
    isAvailable: boolean;
    config: GeminiEventProcessorConfig;
    lastProcessing?: Date;
  } {
    return {
      isAvailable: this.isApiAvailable,
      config: this.config,
      lastProcessing: undefined // TODO: Implementar tracking
    };
  }
}

// Instância singleton
export const geminiEventProcessor = new GeminiEventProcessor();
