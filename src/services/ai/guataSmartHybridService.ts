/**
 * 🦦 GUATÁ SMART HYBRID SERVICE - Chatbot verdadeiramente inteligente
 * Combina conhecimento local + web search inteligente + personalidade natural
 */

import { supabase } from "@/integrations/supabase/client";

export interface SmartHybridQuery {
  question: string;
  userId?: string;
  sessionId?: string;
  userLocation?: string;
  conversationHistory?: string[];
  userPreferences?: any;
}

export interface SmartHybridResponse {
  answer: string;
  confidence: number;
  sources: string[];
  processingTime: number;
  learningInsights: any;
  adaptiveImprovements: string[];
  memoryUpdates: any[];
  personality: string;
  emotionalState: string;
  followUpQuestions: string[];
  usedWebSearch: boolean;
  partnerSuggestion?: string;
}

class GuataSmartHybridService {
  private personality = {
    name: "Guatá",
    species: "capivara",
    role: "guia de turismo especializado",
    traits: ["conhecedor", "prestativo", "confiável", "apaixonado por MS"],
    speakingStyle: "conversacional e natural",
    emotions: ["interessado", "prestativo", "confiável", "orgulhoso"]
  };

  // Base de conhecimento local expandida do MS
  private readonly LOCAL_KNOWLEDGE = {
    // DESTINOS PRINCIPAIS
    'bonito': {
      title: 'Bonito - Capital Mundial do Ecoturismo',
      content: 'Bonito é mundialmente reconhecida como a Capital do Ecoturismo, famosa por suas águas cristalinas e preservação ambiental. Principais atrativos: Rio Sucuri (flutuação), Gruta do Lago Azul (mergulho), Gruta da Anhumas (rapel), Buraco das Araras (observação de aves), Rio da Prata (flutuação), Balneário Municipal. Melhor época: abril a outubro (período seco).',
      category: 'destinos',
      keywords: ['bonito', 'ecoturismo', 'águas cristalinas', 'flutuação', 'gruta', 'rio sucuri', 'lago azul']
    },
    'pantanal': {
      title: 'Pantanal - Patrimônio Mundial da UNESCO',
      content: 'O Pantanal é a maior planície alagada do mundo, reconhecido pela UNESCO como Patrimônio Mundial. Em MS, principais portais: Corumbá, Miranda e Aquidauana. Atividades: observação de onças-pintadas, safáris fotográficos, mais de 600 espécies de aves, pesca esportiva, passeios de barco. Melhor época: seca (maio a outubro).',
      category: 'destinos',
      keywords: ['pantanal', 'unesco', 'onça-pintada', 'safári', 'pesca', 'corumbá', 'miranda', 'aquidauana']
    },
    'campo grande': {
      title: 'Campo Grande - Portal de Entrada do MS',
      content: 'Capital conhecida como "Cidade Morena". Principais atrações: Feira Central (gastronomia local), Parque das Nações Indígenas, Memorial da Cultura Indígena, Museu de Arte Contemporânea, Mercadão Municipal, Praça do Rádio. Centro de convenções e eventos.',
      category: 'destinos',
      keywords: ['campo grande', 'cidade morena', 'feira central', 'parque nações indígenas', 'mercadão']
    },
    'corumbá': {
      title: 'Corumbá - Capital do Pantanal',
      content: 'Portal principal do Pantanal, conhecida por sua rica história e cultura. Atrações: Porto Geral, Casario do Porto, Estrada Parque do Pantanal, Forte Coimbra, Museu de História do Pantanal. Ponto de partida para safáris e pesca esportiva.',
      category: 'destinos',
      keywords: ['corumbá', 'porto geral', 'casario', 'estrada parque', 'forte coimbra']
    },
    'três lagoas': {
      title: 'Três Lagoas - Portal do Pantanal Sul',
      content: 'Conhecida como "Cidade das Águas", importante centro industrial e turístico. Atrações: Lagoa Maior, Lagoa Menor, Lagoa do Sapo, Festa do Peixe, Catedral de São Carlos, Museu Histórico. Acesso ao Pantanal Sul.',
      category: 'destinos',
      keywords: ['três lagoas', 'lagoa maior', 'festa do peixe', 'catedral são carlos']
    },
    'dourados': {
      title: 'Dourados - Capital do Agronegócio',
      content: 'Segunda maior cidade do MS, importante centro do agronegócio. Atrações: Parque Antenor Martins, Museu Histórico, Catedral Nossa Senhora da Candelária, Feira Central, Universidade Federal da Grande Dourados.',
      category: 'destinos',
      keywords: ['dourados', 'agronegócio', 'parque antenor martins', 'catedral candelária']
    },

    // GASTRONOMIA
    'gastronomia': {
      title: 'Gastronomia Sul-Mato-Grossense',
      content: 'A culinária mistura influências paraguaias, bolivianas e indígenas. Pratos típicos: sobá (macarrão japonês adaptado), chipa (pão de queijo paraguaio), churrasco pantaneiro, sopa paraguaia, tereré (erva-mate gelada), pacu assado, arroz carreteiro. Onde comer: Feira Central de Campo Grande, Mercadão Municipal, restaurantes especializados.',
      category: 'gastronomia',
      keywords: ['comida', 'gastronomia', 'culinária', 'sobá', 'chipa', 'churrasco pantaneiro', 'sopa paraguaia', 'tereré', 'pacu']
    },

    // INFRAESTRUTURA
    'rota bioceanica': {
      title: 'Rota Bioceânica - Conexão MS-Chile',
      content: 'Corredor rodoviário estratégico que conecta Mato Grosso do Sul ao Chile, passando pelo Paraguai e Argentina. Em MS, passa por Campo Grande, Ponta Porã e Porto Murtinho. Importante para comércio e turismo internacional. Facilita acesso ao Oceano Pacífico.',
      category: 'infraestrutura',
      keywords: ['rota bioceanica', 'bioceanica', 'corredor', 'chile', 'paraguai', 'argentina', 'porto murtinho', 'ponta porã']
    },

    // EVENTOS
    'eventos': {
      title: 'Eventos e Festivais em MS',
      content: 'Principais eventos: Festival de Inverno de Bonito (julho), Festa do Peixe de Três Lagoas (setembro), Festival América do Sul em Corumbá (abril), Encontro de Carros Antigos em Campo Grande, Festa do Divino Espírito Santo em Miranda, Festa de São João em Aquidauana.',
      category: 'eventos',
      keywords: ['eventos', 'festivais', 'festa do peixe', 'festival inverno', 'américa do sul', 'são joão']
    },

    // CULTURA E HISTÓRIA
    'cultura': {
      title: 'Cultura e História de MS',
      content: 'MS foi criado em 1977, desmembrado de Mato Grosso. Forte influência indígena (Terena, Guarani-Kaiowá), paraguaia e boliviana. Campo Grande fundada em 1899. Rico em tradições, artesanato indígena, música regional e festas populares.',
      category: 'cultura',
      keywords: ['cultura', 'história', 'indígena', 'terena', 'guarani', 'artesanato', 'música regional']
    }
  };

  // Sistema de parceiros (vazio por enquanto, mas preparado)
  private readonly PARTNERS = {
    // Quando tiver parceiros reais, será preenchido aqui
    // Exemplo: 'restaurante_xyz': { name: 'Restaurante XYZ', category: 'gastronomia', priority: 1 }
  };

  async processQuestion(query: SmartHybridQuery): Promise<SmartHybridResponse> {
    const startTime = Date.now();
    console.log('🦦 Guatá Smart Hybrid: Processando pergunta...');
    
    try {
      const question = query.question.toLowerCase();
      let answer = "";
      let usedWebSearch = false;
      let partnerSuggestion = "";
      
      // 1. ANÁLISE INTELIGENTE DA PERGUNTA
      const analysis = this.analyzeQuestion(question, query.conversationHistory || []);
      
      // 2. VERIFICAÇÃO DE PARCEIROS PRIMEIRO
      const partnerMatch = this.checkPartners(question);
      if (partnerMatch) {
        partnerSuggestion = partnerMatch;
      }
      
      // 3. BUSCA NO CONHECIMENTO LOCAL
      const localResult = this.searchLocalKnowledge(question, analysis);
      
      // 4. DECISÃO INTELIGENTE: LOCAL OU WEB?
      if (localResult.found && localResult.confidence > 0.8) {
        // Usar conhecimento local (rápido e confiável)
        answer = this.generateLocalResponse(localResult, analysis, partnerSuggestion);
        console.log('✅ Usando conhecimento local');
      } else if (localResult.found && localResult.confidence > 0.5) {
        // Usar local + web para complementar
        answer = this.generateLocalResponse(localResult, analysis, partnerSuggestion);
        const webResult = await this.searchWebIntelligently(question, analysis);
        if (webResult && webResult.confidence > localResult.confidence) {
          answer += `\n\n${webResult.content}`;
          usedWebSearch = true;
          console.log('✅ Usando local + web complementar');
        }
      } else {
        // Buscar na web (quando não souber local)
        const webResult = await this.searchWebIntelligently(question, analysis);
        if (webResult) {
          answer = webResult.content;
          usedWebSearch = true;
          console.log('✅ Usando web search');
        } else {
          answer = this.generateFallbackResponse(question, analysis);
          console.log('⚠️ Usando resposta de fallback');
        }
      }
      
      // 5. ADICIONAR PERSONALIDADE NATURAL
      answer = this.addNaturalPersonality(answer, analysis, partnerSuggestion);
      
      // 6. GERAR PERGUNTAS DE SEGUIMENTO NATURAIS
      const followUpQuestions = this.generateNaturalFollowUps(analysis, localResult.found);
      
      const processingTime = Date.now() - startTime;
      console.log('✅ Guatá Smart Hybrid: Resposta gerada em', processingTime, 'ms');

      return {
        answer: answer,
        confidence: localResult.found ? localResult.confidence : 0.7,
        sources: localResult.found ? ['conhecimento_local'] : ['web_search'],
        processingTime: processingTime,
        learningInsights: {
          questionType: analysis.type,
          userIntent: analysis.intent,
          knowledgeGaps: localResult.found ? [] : ['conhecimento_especifico'],
          improvementSuggestions: localResult.found ? [] : ['Expandir base local'],
          contextRelevance: localResult.confidence
        },
        adaptiveImprovements: ['Resposta híbrida inteligente', 'Personalidade natural'],
        memoryUpdates: [],
        personality: this.personality.name,
        emotionalState: analysis.emotionalState,
        followUpQuestions: followUpQuestions,
        usedWebSearch: usedWebSearch,
        partnerSuggestion: partnerSuggestion || undefined
      };

    } catch (error) {
      console.error('❌ Erro no Guatá Smart Hybrid:', error);
      
      return {
        answer: "Desculpe, não consegui processar sua pergunta no momento. Pode tentar novamente?",
        confidence: 0.3,
        sources: ['erro'],
        processingTime: Date.now() - startTime,
        learningInsights: {
          questionType: 'error',
          userIntent: 'unknown',
          knowledgeGaps: ['technical_issue'],
          improvementSuggestions: ['Melhorar tratamento de erros'],
          contextRelevance: 0
        },
        adaptiveImprovements: ['Melhorar tratamento de erros'],
        memoryUpdates: [],
        personality: 'confused',
        emotionalState: 'confused',
        followUpQuestions: ['Você pode reformular sua pergunta?', 'Posso te ajudar com algo mais específico?'],
        usedWebSearch: false
      };
    }
  }

  /**
   * ANÁLISE INTELIGENTE DA PERGUNTA
   */
  private analyzeQuestion(question: string, history: string[]): any {
    const analysis = {
      type: 'general',
      intent: 'information_seeking',
      emotionalState: 'neutral',
      keywords: [],
      context: 'new',
      urgency: 'normal'
    };

    // Detecção de tipo de pergunta
    if (question.includes('melhor') || question.includes('recomenda') || question.includes('sugere')) {
      analysis.type = 'recommendation';
      analysis.intent = 'seeking_recommendation';
    } else if (question.includes('como') || question.includes('onde') || question.includes('quando')) {
      analysis.type = 'practical';
      analysis.intent = 'seeking_guidance';
    } else if (question.includes('o que') || question.includes('quais') || question.includes('quem')) {
      analysis.type = 'informational';
      analysis.intent = 'seeking_information';
    } else if (question.includes('oi') || question.includes('olá') || question.includes('tudo bem')) {
      analysis.type = 'greeting';
      analysis.intent = 'casual_greeting';
    }

    // Detecção de estado emocional
    if (question.includes('!') || question.includes('incrível') || question.includes('maravilhoso')) {
      analysis.emotionalState = 'excited';
    } else if (question.includes('urgente') || question.includes('rápido')) {
      analysis.emotionalState = 'urgent';
      analysis.urgency = 'high';
    } else if (question.includes('não sei') || question.includes('confuso')) {
      analysis.emotionalState = 'confused';
    }

    // Contexto da conversa
    analysis.context = history.length > 0 ? 'continuing' : 'new';

    return analysis;
  }

  /**
   * VERIFICAÇÃO DE PARCEIROS
   */
  private checkPartners(question: string): string {
    // Por enquanto retorna vazio, mas quando tiver parceiros reais:
    // - Verificar se a pergunta é sobre restaurante, hotel, passeio, etc.
    // - Buscar parceiros na categoria relevante
    // - Retornar sugestão do parceiro se encontrado
    
    if (Object.keys(this.PARTNERS).length === 0) {
      return ""; // Sem parceiros por enquanto
    }
    
    // Lógica para verificar parceiros quando existirem
    return "";
  }

  /**
   * BUSCA NO CONHECIMENTO LOCAL
   */
  private searchLocalKnowledge(question: string, analysis: any): any {
    let bestMatch = null;
    let bestScore = 0;
    
    for (const [key, knowledge] of Object.entries(this.LOCAL_KNOWLEDGE)) {
      let score = 0;
      
      // Verificar palavras-chave
      for (const keyword of knowledge.keywords) {
        if (question.includes(keyword)) {
          score += 1;
        }
      }
      
      // Verificar título
      if (question.includes(knowledge.title.toLowerCase())) {
        score += 2;
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = { ...knowledge, score };
      }
    }
    
    return {
      found: bestMatch !== null,
      knowledge: bestMatch,
      confidence: bestScore > 0 ? Math.min(bestScore / 3, 1) : 0
    };
  }

  /**
   * BUSCA WEB INTELIGENTE
   */
  private async searchWebIntelligently(question: string, analysis: any): Promise<any> {
    try {
      console.log('🌐 Buscando na web para complementar resposta...');
      
      const { data: webData, error: webError } = await supabase.functions.invoke("guata-web-rag", {
        body: {
          question: question,
          state_code: 'MS',
          max_results: 2,
          include_sources: true
        }
      });

      if (!webError && webData?.answer) {
        return {
          content: `Com base em informações atualizadas: ${webData.answer}`,
          confidence: 0.8,
          sources: webData.sources?.map((s: any) => s.title || s.url) || []
        };
      }
      
      return null;
    } catch (error) {
      console.log('⚠️ Busca web falhou:', error);
      return null;
    }
  }

  /**
   * GERAÇÃO DE RESPOSTA LOCAL
   */
  private generateLocalResponse(localResult: any, analysis: any, partnerSuggestion: string): string {
    const knowledge = localResult.knowledge;
    let response = `Sobre ${knowledge.title.toLowerCase()}, posso te contar que ${knowledge.content}`;
    
    // Adicionar sugestão de parceiro se houver
    if (partnerSuggestion) {
      response += `\n\n${partnerSuggestion}`;
    }
    
    return response;
  }

  /**
   * RESPOSTA DE FALLBACK
   */
  private generateFallbackResponse(question: string, analysis: any): string {
    return `Posso te ajudar com informações sobre destinos, gastronomia, eventos e cultura de Mato Grosso do Sul. ` +
           `Sobre o que você gostaria de saber mais especificamente?`;
  }

  /**
   * ADICIONAR PERSONALIDADE NATURAL
   */
  private addNaturalPersonality(answer: string, analysis: any, partnerSuggestion: string): string {
    // Personalidade sutil e natural
    if (analysis.type === 'greeting') {
      return `Olá! ${answer}`;
    } else if (analysis.emotionalState === 'excited') {
      return `${answer} Que legal que você se interessa por isso!`;
    } else if (analysis.type === 'recommendation') {
      return `${answer} Espero que essa informação te ajude!`;
    }
    
    return answer;
  }

  /**
   * PERGUNTAS DE SEGUIMENTO NATURAIS
   */
  private generateNaturalFollowUps(analysis: any, hasLocalKnowledge: boolean): string[] {
    if (analysis.type === 'greeting') {
      return [
        "O que você gostaria de saber sobre Mato Grosso do Sul?",
        "Posso te ajudar a planejar uma viagem?",
        "Tem interesse em algum destino específico?"
      ];
    } else if (analysis.type === 'recommendation') {
      return [
        "Quer saber mais detalhes sobre essa recomendação?",
        "Posso te ajudar com outras opções?",
        "Tem alguma preferência específica?"
      ];
    } else if (hasLocalKnowledge) {
      return [
        "Quer saber mais sobre esse assunto?",
        "Posso te contar sobre outros lugares similares?",
        "Tem outras dúvidas sobre MS?"
      ];
    } else {
      return [
        "Posso te ajudar com informações sobre destinos do MS?",
        "Quer saber sobre gastronomia ou eventos?",
        "Tem interesse em algum lugar específico?"
      ];
    }
  }
}

// Exportar instância única
export const guataSmartHybridService = new GuataSmartHybridService();
export type { SmartHybridQuery, SmartHybridResponse };











