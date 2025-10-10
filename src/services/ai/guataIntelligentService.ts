/**
 * 🦦 GUATÁ INTELLIGENT SERVICE - Chatbot verdadeiramente inteligente e interativo
 */

import { supabase } from "@/integrations/supabase/client";

export interface IntelligentQuery {
  question: string;
  userId?: string;
  sessionId?: string;
  userLocation?: string;
  conversationHistory?: string[];
  userPreferences?: any;
}

export interface IntelligentResponse {
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
}

class GuataIntelligentService {
  private personality = {
    name: "Guatá",
    species: "capivara",
    role: "guia de turismo inteligente",
    traits: ["curioso", "amigável", "conhecedor", "apaixonado por MS"],
    speakingStyle: "conversacional e envolvente",
    emotions: ["animado", "interessado", "prestativo", "orgulhoso"]
  };

  private emotionalStates = {
    excited: "🦦 *olhos brilhando*",
    curious: "🤔 *coçando a cabeça pensativamente*",
    proud: "😊 *peito estufado de orgulho*",
    helpful: "💪 *determinado a ajudar*",
    surprised: "😮 *boquiaberto*",
    thoughtful: "🤓 *pensando profundamente*"
  };

  private conversationMemory = new Map<string, any[]>();

  async processQuestion(query: IntelligentQuery): Promise<IntelligentResponse> {
    const startTime = Date.now();
    console.log('🦦 Guatá Inteligente: Processando pergunta com personalidade...');
    
    try {
      const question = query.question.toLowerCase();
      const userId = query.userId || 'convidado';
      
      // 1. ANÁLISE EMOCIONAL E CONTEXTUAL
      const emotionalAnalysis = this.analyzeEmotionalContext(question, query.conversationHistory || []);
      const userIntent = this.detectUserIntent(question);
      const conversationContext = this.getConversationContext(query.conversationHistory || []);
      
      // 2. BUSCA INTELIGENTE (WEB + CONHECIMENTO LOCAL)
      const searchResults = await this.intelligentSearch(question, userIntent);
      
      // 3. GERAÇÃO DE RESPOSTA COM PERSONALIDADE
      const response = await this.generateIntelligentResponse({
        question,
        searchResults,
        emotionalAnalysis,
        userIntent,
        conversationContext,
        userId
      });
      
      // 4. APRENDIZADO E MEMÓRIA
      this.updateConversationMemory(userId, {
        question,
        response: response.answer,
        emotionalState: response.emotionalState,
        timestamp: new Date()
      });

      const processingTime = Date.now() - startTime;
      console.log('✅ Guatá Inteligente: Resposta gerada em', processingTime, 'ms');

      return {
        ...response,
        processingTime,
        learningInsights: {
          questionType: userIntent.type,
          userIntent: userIntent.intent,
          emotionalContext: emotionalAnalysis,
          conversationFlow: conversationContext,
          knowledgeGaps: searchResults.gaps,
          improvementSuggestions: ['Melhorar compreensão contextual', 'Expandir base de conhecimento']
        },
        adaptiveImprovements: ['Personalização de respostas', 'Melhoria de contexto emocional'],
        memoryUpdates: this.getMemoryUpdates(userId)
      };

    } catch (error) {
      console.error('❌ Erro no Guatá Inteligente:', error);
      
      return {
        answer: "🦦 *coçando a cabeça* Ops! Parece que algo deu errado aqui. Deixe-me tentar novamente...",
        confidence: 0.3,
        sources: ['erro'],
        processingTime: Date.now() - startTime,
        learningInsights: {
          questionType: 'error',
          userIntent: 'unknown',
          knowledgeGaps: ['technical_issue'],
          improvementSuggestions: ['Corrigir erro técnico']
        },
        adaptiveImprovements: ['Melhorar tratamento de erros'],
        memoryUpdates: [],
        personality: 'confused',
        emotionalState: 'confused',
        followUpQuestions: ['Você pode reformular sua pergunta?', 'Posso te ajudar com algo mais específico?']
      };
    }
  }

  /**
   * ANÁLISE EMOCIONAL E CONTEXTUAL
   */
  private analyzeEmotionalContext(question: string, history: string[]): any {
    const emotions = {
      excited: question.includes('!') || question.includes('incrível') || question.includes('maravilhoso'),
      curious: question.includes('?') || question.includes('como') || question.includes('por que'),
      urgent: question.includes('urgente') || question.includes('rápido') || question.includes('agora'),
      confused: question.includes('não sei') || question.includes('confuso') || question.includes('perdido'),
      happy: question.includes('obrigado') || question.includes('valeu') || question.includes('perfeito')
    };

    const dominantEmotion = Object.entries(emotions).find(([_, value]) => value)?.[0] || 'neutral';
    
    return {
      dominant: dominantEmotion,
      detected: emotions,
      context: history.length > 0 ? 'continuing' : 'new',
      intensity: this.calculateEmotionalIntensity(question)
    };
  }

  /**
   * DETECÇÃO DE INTENÇÃO DO USUÁRIO
   */
  private detectUserIntent(question: string): any {
    const intents = {
      information_seeking: question.includes('o que') || question.includes('quais') || question.includes('como'),
      planning: question.includes('planejar') || question.includes('organizar') || question.includes('roteiro'),
      comparison: question.includes('melhor') || question.includes('comparar') || question.includes('diferença'),
      recommendation: question.includes('recomenda') || question.includes('sugere') || question.includes('indica'),
      personal: question.includes('eu') || question.includes('minha') || question.includes('meu'),
      casual: question.includes('oi') || question.includes('olá') || question.includes('tudo bem')
    };

    const detectedIntent = Object.entries(intents).find(([_, value]) => value)?.[0] || 'general';
    
    return {
      type: detectedIntent,
      intent: detectedIntent,
      confidence: 0.9,
      followUp: this.generateFollowUpQuestions(detectedIntent, question)
    };
  }

  /**
   * BUSCA INTELIGENTE
   */
  private async intelligentSearch(question: string, userIntent: any): Promise<any> {
    try {
      // Busca web inteligente
      const { data: webData, error: webError } = await supabase.functions.invoke("guata-web-rag", {
        body: {
          question: question,
          state_code: 'MS',
          max_results: 3,
          include_sources: true
        }
      });

      if (!webError && webData?.sources && webData.sources.length > 0) {
        return {
          webResults: webData.sources,
          localKnowledge: this.getRelevantLocalKnowledge(question),
          gaps: [],
          confidence: 0.95
        };
      } else {
        return {
          webResults: [],
          localKnowledge: this.getRelevantLocalKnowledge(question),
          gaps: ['web_unavailable'],
          confidence: 0.7
        };
      }
    } catch (error) {
      return {
        webResults: [],
        localKnowledge: this.getRelevantLocalKnowledge(question),
        gaps: ['web_error'],
        confidence: 0.6
      };
    }
  }

  /**
   * GERAÇÃO DE RESPOSTA INTELIGENTE
   */
  private async generateIntelligentResponse(context: any): Promise<any> {
    const { question, searchResults, emotionalAnalysis, userIntent, conversationContext, userId } = context;
    
    // 1. ESCOLHER ESTADO EMOCIONAL
    const emotionalState = this.selectEmotionalState(emotionalAnalysis, userIntent);
    const emotionIcon = this.emotionalStates[emotionalState as keyof typeof this.emotionalStates] || "🦦";
    
    // 2. GERAR RESPOSTA BASEADA NO CONTEXTO
    let answer = "";
    
    // Saudação personalizada
    if (userIntent.intent === 'casual') {
      answer = `${emotionIcon} Oi! Que bom te ver aqui! Eu sou o Guatá, sua capivara guia de turismo! `;
      answer += `Estou super animado para te ajudar a descobrir as maravilhas do Mato Grosso do Sul! `;
      answer += `O que você gostaria de saber hoje?`;
    } else {
      // Resposta contextual inteligente
      answer = this.buildContextualResponse(question, searchResults, emotionalAnalysis, userIntent);
    }
    
    // 3. ADICIONAR PERSONALIDADE E EMOÇÃO
    answer = this.addPersonalityTouches(answer, emotionalState, userIntent);
    
    // 4. GERAR PERGUNTAS DE SEGUIMENTO
    const followUpQuestions = this.generateFollowUpQuestions(userIntent.intent, question);
    
    return {
      answer,
      confidence: searchResults.confidence,
      sources: searchResults.webResults.map((r: any) => r.url || r.title || 'Web').concat(searchResults.localKnowledge.map((k: any) => k.category)),
      personality: this.personality.name,
      emotionalState,
      followUpQuestions
    };
  }

  /**
   * CONSTRUIR RESPOSTA CONTEXTUAL
   */
  private buildContextualResponse(question: string, searchResults: any, emotionalAnalysis: any, userIntent: any): string {
    let response = "";
    
    if (searchResults.webResults.length > 0) {
      const mainSource = searchResults.webResults[0];
      response = `Com base nas informações mais atualizadas que encontrei, posso te contar que `;
      response += mainSource.snippet || mainSource.content || 'existem várias opções incríveis!';
      
      if (mainSource.title) {
        response += `\n\n📰 **Fonte:** ${mainSource.title}`;
      }
    } else if (searchResults.localKnowledge.length > 0) {
      const local = searchResults.localKnowledge[0];
      response = `Baseado no que sei sobre ${local.title.toLowerCase()}, posso te contar que ${local.content}`;
    } else {
      response = `Hmm, essa é uma pergunta interessante! Deixe-me pensar...`;
    }
    
    // Adicionar contexto emocional
    if (emotionalAnalysis.dominant === 'excited') {
      response = `*olhos brilhando* ${response}`;
    } else if (emotionalAnalysis.dominant === 'curious') {
      response = `*coçando a cabeça pensativamente* ${response}`;
    }
    
    return response;
  }

  /**
   * ADICIONAR TOQUES DE PERSONALIDADE
   */
  private addPersonalityTouches(response: string, emotionalState: string, userIntent: any): string {
    // Adicionar expressões da capivara
    const capybaraExpressions = [
      "*coçando a cabeça*",
      "*olhos brilhando*",
      "*peito estufado de orgulho*",
      "*boquiaberto*",
      "*pensando profundamente*"
    ];
    
    // Adicionar curiosidade natural
    if (userIntent.intent === 'information_seeking') {
      response += `\n\n🤔 *coçando a cabeça* Você sabia que eu adoro descobrir coisas novas sobre o MS? `;
      response += `É sempre uma aventura aprender mais sobre nosso estado!`;
    }
    
    // Adicionar paixão pelo turismo
    if (response.includes('Bonito') || response.includes('Pantanal')) {
      response += `\n\n😊 *peito estufado de orgulho* Nossa, falar do MS me deixa todo animado! `;
      response += `É um lugar tão especial e cheio de belezas naturais incríveis!`;
    }
    
    return response;
  }

  /**
   * GERAR PERGUNTAS DE SEGUIMENTO
   */
  private generateFollowUpQuestions(intent: string, question: string): string[] {
    const followUps = {
      information_seeking: [
        "Quer saber mais detalhes sobre algum aspecto específico?",
        "Posso te contar sobre outros lugares similares?",
        "Tem alguma dúvida específica sobre isso?"
      ],
      planning: [
        "Quer que eu te ajude a montar um roteiro completo?",
        "Posso sugerir outros lugares para incluir na sua viagem?",
        "Tem alguma preferência de data ou orçamento?"
      ],
      recommendation: [
        "Quer que eu compare com outras opções?",
        "Posso te dar mais detalhes sobre essa recomendação?",
        "Tem alguma preferência específica que devo considerar?"
      ],
      casual: [
        "O que você gostaria de saber sobre o MS?",
        "Posso te ajudar a planejar uma viagem?",
        "Tem alguma curiosidade sobre nosso estado?"
      ]
    };
    
    return followUps[intent as keyof typeof followUps] || [
      "Posso te ajudar com mais alguma coisa?",
      "Tem outras dúvidas sobre o MS?",
      "Quer saber mais sobre algum lugar específico?"
    ];
  }

  /**
   * CONHECIMENTO LOCAL RELEVANTE
   */
  private getRelevantLocalKnowledge(question: string): any[] {
    const knowledge = {
      'bonito': {
        title: 'Bonito - Capital Mundial do Ecoturismo',
        content: 'Bonito é mundialmente reconhecida como a Capital do Ecoturismo, famosa por suas águas cristalinas e preservação ambiental.',
        category: 'destinos'
      },
      'pantanal': {
        title: 'Pantanal - Patrimônio Mundial da UNESCO',
        content: 'O Pantanal é a maior planície alagada do mundo, reconhecido pela UNESCO como Patrimônio Mundial.',
        category: 'destinos'
      },
      'campo grande': {
        title: 'Campo Grande - Portal de Entrada do MS',
        content: 'Capital conhecida como "Cidade Morena".',
        category: 'destinos'
      }
    };
    
    const relevant = [];
    for (const [key, value] of Object.entries(knowledge)) {
      if (question.includes(key)) {
        relevant.push(value);
      }
    }
    
    return relevant;
  }

  /**
   * UTILITÁRIOS
   */
  private selectEmotionalState(emotionalAnalysis: any, userIntent: any): string {
    if (emotionalAnalysis.dominant === 'excited') return 'excited';
    if (emotionalAnalysis.dominant === 'curious') return 'curious';
    if (userIntent.intent === 'planning') return 'helpful';
    if (userIntent.intent === 'casual') return 'excited';
    return 'thoughtful';
  }

  private calculateEmotionalIntensity(question: string): number {
    const intensityIndicators = ['!', 'muito', 'super', 'incrível', 'fantástico'];
    return intensityIndicators.filter(indicator => question.includes(indicator)).length / intensityIndicators.length;
  }

  private getConversationContext(history: string[]): any {
    return {
      length: history.length,
      recentTopics: history.slice(-3),
      isContinuing: history.length > 0
    };
  }

  private updateConversationMemory(userId: string, data: any): void {
    if (!this.conversationMemory.has(userId)) {
      this.conversationMemory.set(userId, []);
    }
    this.conversationMemory.get(userId)?.push(data);
  }

  private getMemoryUpdates(userId: string): any[] {
    const userMemory = this.conversationMemory.get(userId) || [];
    return userMemory.slice(-3).map(entry => ({
      type: 'conversation',
      content: entry.question,
      confidence: 0.8,
      timestamp: entry.timestamp
    }));
  }
}

// Exportar instância única
export const guataIntelligentService = new GuataIntelligentService();
export type { IntelligentQuery, IntelligentResponse };