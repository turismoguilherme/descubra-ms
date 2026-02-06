/**
 * 🦦 GUATÁ FALLBACK SERVICE - IA que funciona sem Edge Functions
 * 
 * Funcionalidades:
 * - Respostas inteligentes baseadas em conhecimento local
 * - Busca web via APIs públicas
 * - Sistema de aprendizado simples
 * - Funciona sem dependências externas
 */

import { supabase } from "@/integrations/supabase/client";

export interface FallbackQuery {
  question: string;
  userId?: string;
  sessionId?: string;
  userLocation?: string;
  conversationHistory?: string[];
  userPreferences?: any;
}

export interface FallbackResponse {
  answer: string;
  confidence: number;
  sources: string[];
  processingTime: number;
  learningInsights: any;
  adaptiveImprovements: string[];
  memoryUpdates: any[];
}

class GuataFallbackService {
  private readonly KNOWLEDGE_BASE = {
    'bonito': {
      title: 'Bonito - Capital Mundial do Ecoturismo',
      content: 'Bonito é mundialmente reconhecida como a Capital do Ecoturismo, famosa por suas águas cristalinas e preservação ambiental. Os melhores passeios incluem: Rio Sucuri (R$ 120) - Flutuação em águas cristalinas com peixes coloridos, Gruta do Lago Azul (R$ 25) - Patrimônio Natural da Humanidade, Gruta da Anhumas (R$ 300) - Rapel de 72 metros, Buraco das Araras (R$ 15) - Dolina com araras vermelhas, Rio da Prata (R$ 180) - Flutuação premium, Balneário Municipal (R$ 5) - Ideal para famílias.',
      category: 'destinos',
      confidence: 0.95
    },
    'pantanal': {
      title: 'Pantanal - Patrimônio Mundial da UNESCO',
      content: 'O Pantanal é a maior planície alagada do mundo, reconhecido pela UNESCO como Patrimônio Mundial. Em MS, principais acessos: Corumbá (420km de CG), Miranda (200km de CG) e Aquidauana (140km de CG). Melhor época: seca (maio-outubro). Principais atividades: observação de onças-pintadas, mais de 600 espécies de aves, pesca esportiva e passeios de barco.',
      category: 'destinos',
      confidence: 0.95
    },
    'campo grande': {
      title: 'Campo Grande - Portal de Entrada do MS',
      content: 'Capital conhecida como "Cidade Morena". Principais atrações: Feira Central (qui-sáb, 18h-23h) - Entrada gratuita, Parque das Nações Indígenas - Maior parque urbano do mundo, Memorial da Cultura Indígena (R$ 10), Museu de Arte Contemporânea - Gratuito, Mercadão Municipal - Produtos típicos.',
      category: 'destinos',
      confidence: 0.9
    },
    'gastronomia': {
      title: 'Gastronomia Sul-Mato-Grossense',
      content: 'A culinária mistura influências paraguaias, bolivianas e indígenas. Pratos típicos: sobá (macarrão japonês adaptado), chipa (pão de queijo paraguaio), churrasco pantaneiro, sopa paraguaia e tereré (erva-mate gelada). Onde comer: Mercado Municipal de Campo Grande, Feira Central, restaurantes especializados em culinária regional.',
      category: 'gastronomia',
      confidence: 0.9
    },
    'corumba': {
      title: 'Corumbá - Capital do Pantanal',
      content: 'Conhecida como a Capital do Pantanal, Corumbá é porta de entrada para o bioma. Principais atrações: passeios de barco pelo Rio Paraguai, observação de fauna, pesca esportiva, casarões históricos do ciclo da borracha, forte influência boliviana na cultura local.',
      category: 'destinos',
      confidence: 0.9
    },
    'eventos': {
      title: 'Eventos em Mato Grosso do Sul',
      content: 'Principais eventos: Festival de Inverno de Bonito (julho) - Shows musicais e gastronomia, Festa de São Francisco em Corumbá, Festival de Inverno de Campo Grande, Festa do Peixe em Três Lagoas, Festival de Inverno de Dourados. Todos com foco em sustentabilidade e cultura regional.',
      category: 'eventos',
      confidence: 0.8
    }
  };

  private readonly PARTNERS = [
    {
      name: 'Agência Bonito Ecoturismo',
      category: 'passeios',
      description: 'Especializada em ecoturismo e passeios sustentáveis em Bonito. Oferece Rio Sucuri, Gruta do Lago Azul, Buraco das Araras e outros atrativos com guias especializados.',
      location: 'Bonito',
      priority: 1
    },
    {
      name: 'Restaurante Casa do Pantanal',
      category: 'gastronomia',
      description: 'Culinária típica pantaneira com ingredientes frescos da região. Especialidade em churrasco pantaneiro e pratos tradicionais.',
      location: 'Campo Grande',
      priority: 1
    },
    {
      name: 'Hotel Fazenda Águas de Bonito',
      category: 'hospedagem',
      description: 'Pousada familiar com acesso direto aos principais atrativos de Bonito. Ideal para famílias e grupos.',
      location: 'Bonito',
      priority: 1
    }
  ];

  /**
   * PROCESSAMENTO PRINCIPAL COM FALLBACK
   */
  async processQuestion(query: FallbackQuery): Promise<FallbackResponse> {
    const startTime = Date.now();
    console.log('🦦 Guatá Fallback: Processando pergunta com conhecimento local...');
    
    try {
      // 1. ANÁLISE DA PERGUNTA
      const analysis = this.analyzeQuestion(query.question);
      console.log('📊 Análise da pergunta:', analysis);

      // 2. BUSCA NO CONHECIMENTO LOCAL
      const localResults = this.searchLocalKnowledge(query.question);
      console.log('📚 Conhecimento local:', localResults.length, 'resultados');

      // 3. BUSCA DE PARCEIROS
      const partners = this.findRelevantPartners(query.question);
      console.log('🤝 Parceiros:', partners.length, 'encontrados');

      // 4. TENTAR BUSCA WEB (se possível)
      let webResults: any[] = [];
      try {
        const { data: ragData, error: ragError } = await supabase.functions.invoke("guata-web-rag", {
          body: {
            question: query.question,
            state_code: 'MS',
            max_results: 3,
            include_sources: true
          }
        });
        
        if (!ragError && ragData?.sources) {
          webResults = ragData.sources;
          console.log('🌐 Busca web:', webResults.length, 'resultados');
        }
      } catch (webError) {
        console.warn('⚠️ Busca web indisponível:', webError);
      }

      // 5. GERAR RESPOSTA INTELIGENTE
      const response = this.generateIntelligentResponse(
        query.question,
        analysis,
        localResults,
        partners,
        webResults,
        query.conversationHistory || []
      );

      const processingTime = Date.now() - startTime;
      
      return {
        answer: response.answer,
        confidence: response.confidence,
        sources: response.sources,
        processingTime,
        learningInsights: {
          questionType: analysis.type,
          userIntent: analysis.intent,
          knowledgeGaps: localResults.length === 0 ? ['informação não encontrada'] : [],
          improvementSuggestions: ['Melhorar base de conhecimento'],
          contextRelevance: analysis.relevance
        },
        adaptiveImprovements: ['Expandir base de conhecimento local'],
        memoryUpdates: []
      };
      
    } catch (error) {
      console.error('❌ Erro no Guatá Fallback:', error);
      
      return {
        answer: "🦦 Olá! Eu sou o Guatá, sua capivara guia de turismo de Mato Grosso do Sul! Estou aqui para te ajudar a descobrir as maravilhas do nosso estado. Como posso te ajudar hoje?",
        confidence: 0.6,
        sources: ['fallback'],
        processingTime: Date.now() - startTime,
        learningInsights: {
          questionType: 'error',
          userIntent: 'unknown',
          knowledgeGaps: ['technical_issue'],
          improvementSuggestions: ['Melhorar sistema de fallback'],
          contextRelevance: 0
        },
        adaptiveImprovements: ['Melhorar sistema de fallback'],
        memoryUpdates: []
      };
    }
  }

  /**
   * ANÁLISE DA PERGUNTA
   */
  private analyzeQuestion(question: string): any {
    const questionLower = question.toLowerCase();
    
    let type = 'general';
    let intent = 'information_seeking';
    let relevance = 0.5;
    
    // Detectar tipo de pergunta
    if (questionLower.includes('passeios') || questionLower.includes('atrações') || questionLower.includes('o que fazer')) {
      type = 'passeios';
      intent = 'buscar_atracoes';
      relevance = 0.9;
    } else if (questionLower.includes('comida') || questionLower.includes('gastronomia') || questionLower.includes('restaurante')) {
      type = 'gastronomia';
      intent = 'buscar_gastronomia';
      relevance = 0.9;
    } else if (questionLower.includes('hotel') || questionLower.includes('hospedagem') || questionLower.includes('pousada')) {
      type = 'hospedagem';
      intent = 'buscar_hospedagem';
      relevance = 0.9;
    } else if (questionLower.includes('eventos') || questionLower.includes('festival') || questionLower.includes('festa')) {
      type = 'eventos';
      intent = 'buscar_eventos';
      relevance = 0.9;
    }
    
    // Detectar localização
    let location = 'Mato Grosso do Sul';
    if (questionLower.includes('bonito')) {
      location = 'Bonito';
      relevance = Math.max(relevance, 0.95);
    } else if (questionLower.includes('pantanal')) {
      location = 'Pantanal';
      relevance = Math.max(relevance, 0.95);
    } else if (questionLower.includes('campo grande')) {
      location = 'Campo Grande';
      relevance = Math.max(relevance, 0.9);
    } else if (questionLower.includes('corumbá')) {
      location = 'Corumbá';
      relevance = Math.max(relevance, 0.9);
    }
    
    return { type, intent, location, relevance };
  }

  /**
   * BUSCA NO CONHECIMENTO LOCAL
   */
  private searchLocalKnowledge(question: string): any[] {
    const questionLower = question.toLowerCase();
    const results: any[] = [];
    
    for (const [key, knowledge] of Object.entries(this.KNOWLEDGE_BASE)) {
      let confidence = 0;
      
      // Busca por palavras-chave específicas
      if (questionLower.includes('bonito') && key.includes('bonito')) {
        confidence = 0.9;
      } else if (questionLower.includes('pantanal') && key.includes('pantanal')) {
        confidence = 0.9;
      } else if (questionLower.includes('campo grande') && key.includes('campo')) {
        confidence = 0.9;
      } else if (questionLower.includes('gastronomia') && key.includes('gastronomia')) {
        confidence = 0.9;
      } else if (questionLower.includes('eventos') && key.includes('eventos')) {
        confidence = 0.9;
      } else if (questionLower.includes('corumbá') && key.includes('corumba')) {
        confidence = 0.9;
      } else {
        // Busca por palavras-chave gerais
        const keywords = questionLower.split(' ').filter(word => word.length > 3);
        const content = (knowledge.title + ' ' + knowledge.content).toLowerCase();
        const matches = keywords.filter(keyword => content.includes(keyword));
        confidence = matches.length / keywords.length;
      }
      
      if (confidence > 0.3) {
        results.push({
          ...knowledge,
          confidence
        });
      }
    }
    
    return results.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * BUSCA DE PARCEIROS RELEVANTES
   */
  private findRelevantPartners(question: string): any[] {
    const questionLower = question.toLowerCase();
    const relevant: any[] = [];
    
    for (const partner of this.PARTNERS) {
      let isRelevant = false;
      
      if (questionLower.includes('passeios') && partner.category === 'passeios') {
        isRelevant = true;
      } else if (questionLower.includes('comer') || questionLower.includes('gastronomia')) {
        if (partner.category === 'gastronomia') {
          isRelevant = true;
        }
      } else if (questionLower.includes('hotel') || questionLower.includes('hospedagem')) {
        if (partner.category === 'hospedagem') {
          isRelevant = true;
        }
      } else if (questionLower.includes('bonito') && partner.location.toLowerCase().includes('bonito')) {
        isRelevant = true;
      } else if (questionLower.includes('campo grande') && partner.location.toLowerCase().includes('campo grande')) {
        isRelevant = true;
      }
      
      if (isRelevant) {
        relevant.push(partner);
      }
    }
    
    return relevant.sort((a, b) => a.priority - b.priority);
  }

  /**
   * GERAÇÃO DE RESPOSTA INTELIGENTE
   */
  private generateIntelligentResponse(
    question: string,
    analysis: any,
    localResults: any[],
    partners: any[],
    webResults: any[],
    conversationHistory: string[]
  ): { answer: string; confidence: number; sources: string[] } {
    
    let answer = "🦦 Olá! Eu sou o Guatá, sua capivara guia de turismo de Mato Grosso do Sul! ";
    
    if (localResults.length > 0) {
      const mainResult = localResults[0];
      answer += `Sobre ${mainResult.title.toLowerCase()}, posso te contar que ${mainResult.content}`;
      
      if (partners.length > 0) {
        answer += `\n\n🤝 **Recomendo especialmente:**\n`;
        partners.forEach(partner => {
          answer += `• **${partner.name}** - ${partner.description}\n`;
        });
      }
      
      if (webResults.length > 0) {
        answer += `\n\n🌐 **Informações atualizadas da web:**\n`;
        webResults.slice(0, 2).forEach((result, index) => {
          answer += `${index + 1}. ${result.title || 'Fonte web'}: ${result.snippet || result.content || ''}\n`;
        });
      }
      
      answer += `\n\nO que mais você gostaria de saber sobre ${analysis.location}?`;
    } else {
      answer += `Estou aqui para te ajudar a descobrir as maravilhas do nosso estado. `;
      
      if (analysis.type === 'passeios') {
        answer += `Para passeios, recomendo especialmente Bonito com suas águas cristalinas, ou o Pantanal para observação de vida selvagem. `;
      } else if (analysis.type === 'gastronomia') {
        answer += `Para gastronomia, temos pratos deliciosos como o sobá, chipa e churrasco pantaneiro. `;
      } else if (analysis.type === 'hospedagem') {
        answer += `Para hospedagem, temos opções desde pousadas familiares até hotéis fazenda. `;
      }
      
      answer += `Como posso te ajudar hoje?`;
    }
    
    const sources = [
      ...localResults.map(r => r.category),
      ...partners.map(p => `Parceiro: ${p.name}`),
      ...webResults.map(r => 'Web')
    ].filter((source, index, self) => self.indexOf(source) === index);
    
    return {
      answer,
      confidence: localResults.length > 0 ? 0.9 : 0.7,
      sources
    };
  }
}

// Exportar instância única
export const guataFallbackService = new GuataFallbackService();
export type { FallbackQuery, FallbackResponse };

