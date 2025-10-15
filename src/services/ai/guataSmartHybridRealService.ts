/**
 * 🦦 GUATÁ SMART HYBRID REAL SERVICE - Sistema híbrido inteligente real
 * Conhecimento local + Web search inteligente + Aprendizado contínuo
 */

import { supabase } from "@/integrations/supabase/client";

export interface SmartHybridRealQuery {
  question: string;
  userId?: string;
  sessionId?: string;
  userLocation?: string;
  conversationHistory?: string[];
  userPreferences?: any;
}

export interface SmartHybridRealResponse {
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
  knowledgeSource: 'local' | 'web' | 'hybrid';
  partnerSuggestion?: string;
}

class GuataSmartHybridRealService {
  private personality = {
    name: "Guatá",
    species: "capivara",
    role: "guia de turismo especializado",
    traits: ["conhecedor", "prestativo", "confiável", "apaixonado por MS"],
    speakingStyle: "conversacional e natural",
    emotions: ["interessado", "prestativo", "confiável", "orgulhoso"]
  };

  // Base de conhecimento local expandida
  private readonly LOCAL_KNOWLEDGE = {
    'bonito': {
      title: 'Bonito - Capital Mundial do Ecoturismo',
      content: 'Bonito é mundialmente reconhecida como a Capital do Ecoturismo, famosa por suas águas cristalinas e preservação ambiental.',
      category: 'destinos',
      keywords: ['bonito', 'ecoturismo', 'águas cristalinas', 'flutuação', 'gruta', 'rio sucuri', 'lago azul']
    },
    'pantanal': {
      title: 'Pantanal - Patrimônio Mundial da UNESCO',
      content: 'O Pantanal é a maior planície alagada do mundo, reconhecido pela UNESCO como Patrimônio Mundial.',
      category: 'destinos',
      keywords: ['pantanal', 'unesco', 'onça-pintada', 'safári', 'pesca', 'corumbá', 'miranda', 'aquidauana']
    },
    'campo grande': {
      title: 'Campo Grande - Portal de Entrada do MS',
      content: 'Capital conhecida como "Cidade Morena". Principais atrações: Feira Central, Parque das Nações Indígenas, Memorial da Cultura Indígena.',
      category: 'destinos',
      keywords: ['campo grande', 'cidade morena', 'feira central', 'parque nações indígenas', 'mercadão']
    },
    'gastronomia': {
      title: 'Gastronomia Sul-Mato-Grossense',
      content: 'A culinária mistura influências paraguaias, bolivianas e indígenas. Pratos típicos: sobá, chipa, churrasco pantaneiro, sopa paraguaia, tereré.',
      category: 'gastronomia',
      keywords: ['comida', 'gastronomia', 'culinária', 'sobá', 'chipa', 'churrasco pantaneiro', 'sopa paraguaia', 'tereré', 'comida típica']
    },
    'rota bioceanica': {
      title: 'Rota Bioceânica - Conexão MS-Chile',
      content: 'Corredor rodoviário estratégico que conecta Mato Grosso do Sul ao Chile, passando pelo Paraguai e Argentina.',
      category: 'infraestrutura',
      keywords: ['rota bioceanica', 'bioceanica', 'corredor', 'chile', 'paraguai', 'argentina', 'porto murtinho', 'ponta porã']
    },
    'roteiro': {
      title: 'Roteiros de Viagem em MS',
      content: 'Posso te ajudar a montar roteiros personalizados! Para Campo Grande (3 dias): Dia 1 - Feira Central, Parque das Nações Indígenas; Dia 2 - Mercadão Municipal, Museu de Arte; Dia 3 - Passeio cultural, gastronomia.',
      category: 'roteiros',
      keywords: ['roteiro', 'roteiros', 'montar', 'planejar', 'viagem', 'dias', 'itinerário', 'programação', 'cidade']
    }
  };

  // Sistema de parceiros (vazio por enquanto)
  private readonly PARTNERS = {};

  async processQuestion(query: SmartHybridRealQuery): Promise<SmartHybridRealResponse> {
    const startTime = Date.now();
    console.log('🦦 Guatá Smart Hybrid Real: Processando pergunta...');
    
    try {
      const question = query.question.toLowerCase();
      let answer = "";
      let usedWebSearch = false;
      let knowledgeSource: 'local' | 'web' | 'hybrid' = 'local';
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
      
      // 4. DECISÃO INTELIGENTE: LOCAL, WEB OU HÍBRIDO?
      if (localResult.found && localResult.confidence > 0.8) {
        // Usar apenas conhecimento local (rápido e confiável)
        answer = this.generateLocalResponse(localResult, analysis, partnerSuggestion);
        knowledgeSource = 'local';
        console.log('✅ Usando apenas conhecimento local');
      } else if (localResult.found && localResult.confidence > 0.5) {
        // Usar local + web para complementar
        answer = this.generateLocalResponse(localResult, analysis, partnerSuggestion);
        const webResult = await this.searchWebIntelligently(question, analysis);
        if (webResult && webResult.confidence > localResult.confidence) {
          answer += `\n\n${webResult.content}`;
          usedWebSearch = true;
          knowledgeSource = 'hybrid';
          console.log('✅ Usando conhecimento local + web (híbrido)');
        } else {
          console.log('✅ Usando conhecimento local (web não melhorou)');
        }
      } else {
        // Buscar na web (quando não souber local)
        const webResult = await this.searchWebIntelligently(question, analysis);
        if (webResult) {
          answer = webResult.content;
          usedWebSearch = true;
          knowledgeSource = 'web';
          console.log('✅ Usando web search (local não encontrou)');
        } else {
          answer = this.generateFallbackResponse(question, analysis);
          console.log('⚠️ Usando resposta de fallback');
        }
      }
      
      // 5. ADICIONAR PERSONALIDADE NATURAL
      answer = this.addNaturalPersonality(answer, analysis, partnerSuggestion);
      
      // 6. GERAR PERGUNTAS DE SEGUIMENTO INTELIGENTES
      const followUpQuestions = this.generateIntelligentFollowUps(analysis, localResult.found, usedWebSearch);
      
      // 7. APRENDIZADO E MEMÓRIA
      this.updateLearningMemory(query.userId || 'convidado', {
        question,
        localFound: localResult.found,
        webUsed: usedWebSearch,
        knowledgeSource,
        timestamp: new Date()
      });
      
      const processingTime = Date.now() - startTime;
      console.log('✅ Guatá Smart Hybrid Real: Resposta gerada em', processingTime, 'ms');

      return {
        answer: answer,
        confidence: localResult.found ? Math.max(localResult.confidence, 0.8) : 0.7,
        sources: localResult.found ? ['conhecimento_local'] : ['web_search'],
        processingTime: processingTime,
        learningInsights: {
          questionType: analysis.type,
          userIntent: analysis.intent,
          knowledgeGaps: localResult.found ? [] : ['conhecimento_especifico'],
          improvementSuggestions: localResult.found ? [] : ['Expandir base local'],
          contextRelevance: localResult.confidence,
          hybridDecision: knowledgeSource
        },
        adaptiveImprovements: ['Sistema híbrido inteligente', 'Personalidade natural'],
        memoryUpdates: this.getMemoryUpdates(query.userId || 'convidado'),
        personality: this.personality.name,
        emotionalState: analysis.emotionalState,
        followUpQuestions: followUpQuestions,
        usedWebSearch: usedWebSearch,
        knowledgeSource: knowledgeSource,
        partnerSuggestion: partnerSuggestion || undefined
      };

    } catch (error) {
      console.error('❌ Erro no Guatá Smart Hybrid Real:', error);
      
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
        usedWebSearch: false,
        knowledgeSource: 'local',
        partnerSuggestion: undefined
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
      urgency: 'normal',
      requiresWebSearch: false
    };

    // Detecção de tipo de pergunta
    if (question.includes('melhor') || question.includes('recomenda') || question.includes('sugere')) {
      analysis.type = 'recommendation';
      analysis.intent = 'seeking_recommendation';
      analysis.requiresWebSearch = true; // Recomendações precisam de dados atualizados
    } else if (question.includes('como') || question.includes('onde') || question.includes('quando')) {
      analysis.type = 'practical';
      analysis.intent = 'seeking_guidance';
      analysis.requiresWebSearch = true; // Informações práticas precisam estar atualizadas
    } else if (question.includes('o que') || question.includes('quais') || question.includes('quem')) {
      analysis.type = 'informational';
      analysis.intent = 'seeking_information';
    } else if (question.includes('oi') || question.includes('olá') || question.includes('tudo bem')) {
      analysis.type = 'greeting';
      analysis.intent = 'casual_greeting';
    } else if (question.includes('roteiro') || question.includes('montar') || question.includes('planejar')) {
      analysis.type = 'planning';
      analysis.intent = 'seeking_planning';
      analysis.requiresWebSearch = true; // Planejamento precisa de informações atualizadas
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
      
      // Detecção especial para roteiros
      if (question.includes('roteiro') || question.includes('montar') || question.includes('dias')) {
        if (knowledge.category === 'roteiros') {
          score += 3;
        }
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
          max_results: 3,
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
    } else if (analysis.type === 'planning') {
      return `${answer} Posso personalizar ainda mais se você me contar suas preferências!`;
    }
    
    return answer;
  }

  /**
   * PERGUNTAS DE SEGUIMENTO INTELIGENTES
   */
  private generateIntelligentFollowUps(analysis: any, hasLocalKnowledge: boolean, usedWebSearch: boolean): string[] {
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
    } else if (analysis.type === 'planning') {
      return [
        "Qual cidade você gostaria de visitar?",
        "Quantos dias você tem disponível?",
        "Qual seu perfil de viagem (cultura, aventura, gastronomia)?"
      ];
    } else if (usedWebSearch) {
      return [
        "Quer que eu busque mais informações sobre isso?",
        "Posso te ajudar com outros aspectos do MS?",
        "Tem outras dúvidas específicas?"
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

  /**
   * APRENDIZADO E MEMÓRIA
   */
  private learningMemory = new Map<string, any[]>();

  private updateLearningMemory(userId: string, data: any): void {
    if (!this.learningMemory.has(userId)) {
      this.learningMemory.set(userId, []);
    }
    this.learningMemory.get(userId)?.push(data);
  }

  private getMemoryUpdates(userId: string): any[] {
    const userMemory = this.learningMemory.get(userId) || [];
    return userMemory.slice(-3).map(entry => ({
      type: 'learning',
      content: entry.question,
      confidence: 0.8,
      timestamp: entry.timestamp,
      knowledgeSource: entry.knowledgeSource
    }));
  }
}

// Exportar instância única
export const guataSmartHybridRealService = new GuataSmartHybridRealService();
export type { SmartHybridRealQuery, SmartHybridRealResponse };






