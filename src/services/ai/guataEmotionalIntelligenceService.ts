/**
 * 🦦 GUATÁ EMOTIONAL INTELLIGENCE SERVICE - Inteligência emocional e personalização
 */

export interface EmotionalIntelligenceQuery {
  question: string;
  userId?: string;
  sessionId?: string;
  userLocation?: string;
  conversationHistory?: string[];
  userPreferences?: any;
}

export interface EmotionalIntelligenceResponse {
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
  emotionalAnalysis: any;
  personalizationLevel: number;
  empathyScore: number;
  userSatisfaction: number;
}

class GuataEmotionalIntelligenceService {
  private personality = {
    name: "Guatá",
    species: "capivara",
    role: "guia de turismo especializado",
    traits: ["conhecedor", "prestativo", "confiável", "apaixonado por MS"],
    speakingStyle: "conversacional e natural",
    emotions: ["interessado", "prestativo", "confiável", "orgulhoso"]
  };

  // Sistema de análise emocional
  private emotionalStates = {
    excited: { level: 0.8, keywords: ['!', 'incrível', 'maravilhoso', 'fantástico', 'amazing'] },
    curious: { level: 0.6, keywords: ['?', 'como', 'por que', 'quando', 'onde'] },
    urgent: { level: 0.9, keywords: ['urgente', 'rápido', 'agora', 'imediato'] },
    confused: { level: 0.4, keywords: ['não sei', 'confuso', 'perdido', 'não entendo'] },
    happy: { level: 0.7, keywords: ['obrigado', 'valeu', 'perfeito', 'ótimo', 'excelente'] },
    frustrated: { level: 0.3, keywords: ['não funciona', 'erro', 'problema', 'difícil'] },
    neutral: { level: 0.5, keywords: [] }
  };

  // Perfis de personalização
  private userProfiles = new Map<string, any>();
  private emotionalHistory = new Map<string, any[]>();

  // Base de conhecimento local
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
    }
  };

  async processQuestion(query: EmotionalIntelligenceQuery): Promise<EmotionalIntelligenceResponse> {
    const startTime = Date.now();
    console.log('🦦 Guatá Emotional Intelligence: Processando pergunta...');
    
    try {
      const question = query.question.toLowerCase();
      const userId = query.userId || 'convidado';
      
      // 1. ANÁLISE EMOCIONAL AVANÇADA
      const emotionalAnalysis = this.analyzeEmotionalState(question, query.conversationHistory || []);
      
      // 2. CARREGAR PERFIL DO USUÁRIO
      const userProfile = this.loadUserProfile(userId);
      
      // 3. ANÁLISE DE PERSONALIZAÇÃO
      const personalizationLevel = this.calculatePersonalizationLevel(userProfile, emotionalAnalysis);
      
      // 4. BUSCA INTELIGENTE COM CONTEXTO EMOCIONAL
      const searchResult = await this.intelligentSearchWithEmotion(question, emotionalAnalysis, userProfile);
      
      // 5. GERAÇÃO DE RESPOSTA EMPÁTICA
      const response = this.generateEmpatheticResponse(question, searchResult, emotionalAnalysis, userProfile);
      
      // 6. CÁLCULO DE EMPATIA E SATISFAÇÃO
      const empathyScore = this.calculateEmpathyScore(emotionalAnalysis, response);
      const userSatisfaction = this.calculateUserSatisfaction(userProfile, emotionalAnalysis, response);
      
      // 7. ATUALIZAR PERFIL E HISTÓRICO EMOCIONAL
      this.updateUserProfile(userId, {
        question,
        emotionalAnalysis,
        response: response.answer,
        satisfaction: userSatisfaction,
        timestamp: new Date()
      });
      
      this.updateEmotionalHistory(userId, emotionalAnalysis);
      
      const processingTime = Date.now() - startTime;
      console.log('✅ Guatá Emotional Intelligence: Resposta gerada em', processingTime, 'ms');

      return {
        answer: response.answer,
        confidence: response.confidence,
        sources: response.sources,
        processingTime: processingTime,
        learningInsights: {
          questionType: emotionalAnalysis.type,
          userIntent: emotionalAnalysis.intent,
          emotionalContext: emotionalAnalysis,
          personalizationLevel: personalizationLevel,
          empathyScore: empathyScore,
          userSatisfaction: userSatisfaction
        },
        adaptiveImprovements: this.generateEmotionalImprovements(emotionalAnalysis, userProfile),
        memoryUpdates: this.getEmotionalMemoryUpdates(userId),
        personality: this.personality.name,
        emotionalState: emotionalAnalysis.dominant,
        followUpQuestions: response.followUpQuestions,
        usedWebSearch: searchResult.usedWebSearch,
        knowledgeSource: searchResult.knowledgeSource,
        partnerSuggestion: searchResult.partnerSuggestion,
        emotionalAnalysis: emotionalAnalysis,
        personalizationLevel: personalizationLevel,
        empathyScore: empathyScore,
        userSatisfaction: userSatisfaction
      };

    } catch (error) {
      console.error('❌ Erro no Guatá Emotional Intelligence:', error);
      
      return {
        answer: "Desculpe, não consegui processar sua pergunta no momento. Pode tentar novamente?",
        confidence: 0.3,
        sources: ['erro'],
        processingTime: Date.now() - startTime,
        learningInsights: {
          questionType: 'error',
          userIntent: 'unknown',
          emotionalContext: { dominant: 'neutral', level: 0.5 },
          personalizationLevel: 0,
          empathyScore: 0.3,
          userSatisfaction: 0.3
        },
        adaptiveImprovements: ['Melhorar tratamento de erros'],
        memoryUpdates: [],
        personality: 'confused',
        emotionalState: 'confused',
        followUpQuestions: ['Você pode reformular sua pergunta?', 'Posso te ajudar com algo mais específico?'],
        usedWebSearch: false,
        knowledgeSource: 'local',
        partnerSuggestion: undefined,
        emotionalAnalysis: { dominant: 'neutral', level: 0.5 },
        personalizationLevel: 0,
        empathyScore: 0.3,
        userSatisfaction: 0.3
      };
    }
  }

  /**
   * ANÁLISE EMOCIONAL AVANÇADA
   */
  private analyzeEmotionalState(question: string, history: string[]): any {
    const analysis = {
      dominant: 'neutral',
      level: 0.5,
      intensity: 0.5,
      context: 'new',
      keywords: [],
      sentiment: 'neutral',
      urgency: 'normal',
      type: 'general',
      intent: 'information_seeking'
    };

    // Detecção de estado emocional
    for (const [emotion, config] of Object.entries(this.emotionalStates)) {
      let matchCount = 0;
      for (const keyword of config.keywords) {
        if (question.includes(keyword)) {
          matchCount++;
        }
      }
      
      if (matchCount > 0) {
        analysis.dominant = emotion;
        analysis.level = config.level;
        analysis.intensity = matchCount / config.keywords.length;
        break;
      }
    }

    // Análise de contexto
    if (history.length > 0) {
      analysis.context = 'continuing';
      // Analisar mudança emocional
      const lastEmotion = this.getLastEmotionalState(history);
      if (lastEmotion && lastEmotion !== analysis.dominant) {
        analysis.sentiment = 'changing';
      }
    }

    // Detecção de urgência
    if (question.includes('urgente') || question.includes('rápido') || question.includes('agora')) {
      analysis.urgency = 'high';
    }

    // Detecção de tipo de pergunta
    if (question.includes('melhor') || question.includes('recomenda')) {
      analysis.type = 'recommendation';
      analysis.intent = 'seeking_recommendation';
    } else if (question.includes('como') || question.includes('onde')) {
      analysis.type = 'practical';
      analysis.intent = 'seeking_guidance';
    } else if (question.includes('roteiro') || question.includes('montar')) {
      analysis.type = 'planning';
      analysis.intent = 'seeking_planning';
    }

    return analysis;
  }

  /**
   * CARREGAR PERFIL DO USUÁRIO
   */
  private loadUserProfile(userId: string): any {
    if (!this.userProfiles.has(userId)) {
      this.userProfiles.set(userId, {
        preferences: {},
        interests: [],
        emotionalPatterns: {},
        satisfactionHistory: [],
        personalizationLevel: 0.5,
        lastInteraction: null
      });
    }
    return this.userProfiles.get(userId);
  }

  /**
   * CÁLCULO DE NÍVEL DE PERSONALIZAÇÃO
   */
  private calculatePersonalizationLevel(userProfile: any, emotionalAnalysis: any): number {
    let level = 0.5; // Base
    
    // Aumentar baseado no histórico
    if (userProfile.satisfactionHistory.length > 0) {
      const avgSatisfaction = userProfile.satisfactionHistory.reduce((a: number, b: number) => a + b, 0) / userProfile.satisfactionHistory.length;
      level += avgSatisfaction * 0.3;
    }
    
    // Aumentar baseado em padrões emocionais
    if (userProfile.emotionalPatterns[emotionalAnalysis.dominant]) {
      level += 0.2;
    }
    
    // Aumentar baseado em interesses
    if (userProfile.interests.length > 0) {
      level += 0.1;
    }
    
    return Math.min(level, 1.0);
  }

  /**
   * BUSCA INTELIGENTE COM CONTEXTO EMOCIONAL
   */
  private async intelligentSearchWithEmotion(question: string, emotionalAnalysis: any, userProfile: any): Promise<any> {
    // Busca local primeiro
    const localResult = this.searchLocalKnowledge(question);
    
    // Decisão baseada no contexto emocional
    if (emotionalAnalysis.urgency === 'high' || emotionalAnalysis.dominant === 'frustrated') {
      // Resposta rápida para urgência ou frustração
      return {
        ...localResult,
        usedWebSearch: false,
        knowledgeSource: 'local'
      };
    } else if (emotionalAnalysis.type === 'recommendation' || emotionalAnalysis.type === 'planning') {
      // Buscar na web para recomendações e planejamento
      const webResult = await this.searchWebIntelligently(question);
      if (webResult) {
        return {
          ...webResult,
          usedWebSearch: true,
          knowledgeSource: 'web'
        };
      }
    }
    
    return {
      ...localResult,
      usedWebSearch: false,
      knowledgeSource: 'local'
    };
  }

  /**
   * BUSCA NO CONHECIMENTO LOCAL
   */
  private searchLocalKnowledge(question: string): any {
    let bestMatch = null;
    let bestScore = 0;
    
    for (const [key, knowledge] of Object.entries(this.LOCAL_KNOWLEDGE)) {
      let score = 0;
      
      for (const keyword of knowledge.keywords) {
        if (question.includes(keyword)) {
          score += 1;
        }
      }
      
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
  private async searchWebIntelligently(question: string): Promise<any> {
    try {
      console.log('🌐 Buscando na web com contexto emocional...');
      
      // Simular busca web (implementar com Supabase depois)
      return {
        content: `Com base em informações atualizadas: ${question}`,
        confidence: 0.8,
        sources: ['web_search']
      };
    } catch (error) {
      console.log('⚠️ Busca web falhou:', error);
      return null;
    }
  }

  /**
   * GERAÇÃO DE RESPOSTA EMPÁTICA
   */
  private generateEmpatheticResponse(question: string, searchResult: any, emotionalAnalysis: any, userProfile: any): any {
    let answer = "";
    let followUpQuestions: string[] = [];

    // Resposta baseada no estado emocional
    if (emotionalAnalysis.dominant === 'excited') {
      answer = `Que legal que você está animado! `;
    } else if (emotionalAnalysis.dominant === 'confused') {
      answer = `Entendo que pode ser confuso, vou te ajudar! `;
    } else if (emotionalAnalysis.dominant === 'frustrated') {
      answer = `Vejo que está com dificuldades, vamos resolver isso juntos! `;
    } else if (emotionalAnalysis.dominant === 'urgent') {
      answer = `Entendo a urgência, vou te dar uma resposta rápida! `;
    }

    // Adicionar conteúdo baseado na busca
    if (searchResult.found) {
      const knowledge = searchResult.knowledge;
      answer += `Sobre ${knowledge.title.toLowerCase()}, posso te contar que ${knowledge.content}`;
      
      // Personalização baseada no perfil
      if (userProfile.interests.includes(knowledge.category)) {
        answer += `\n\nVejo que você se interessa por ${knowledge.category}!`;
      }
    } else {
      answer += `Posso te ajudar com informações sobre destinos, gastronomia, eventos e cultura de Mato Grosso do Sul.`;
    }

    // Perguntas de seguimento empáticas
    followUpQuestions = this.generateEmpatheticFollowUps(emotionalAnalysis, userProfile);

    return {
      answer,
      confidence: searchResult.confidence,
      sources: searchResult.found ? ['conhecimento_local'] : ['web_search'],
      followUpQuestions
    };
  }

  /**
   * GERAÇÃO DE PERGUNTAS EMPÁTICAS
   */
  private generateEmpatheticFollowUps(emotionalAnalysis: any, userProfile: any): string[] {
    if (emotionalAnalysis.dominant === 'excited') {
      return [
        "Quer saber mais sobre esse destino?",
        "Posso te ajudar a planejar uma viagem?",
        "Tem interesse em outros lugares similares?"
      ];
    } else if (emotionalAnalysis.dominant === 'confused') {
      return [
        "Posso explicar de outra forma?",
        "Quer que eu detalhe melhor?",
        "Tem alguma dúvida específica?"
      ];
    } else if (emotionalAnalysis.dominant === 'frustrated') {
      return [
        "Posso tentar uma abordagem diferente?",
        "Quer que eu simplifique a resposta?",
        "Como posso te ajudar melhor?"
      ];
    } else {
      return [
        "Quer saber mais sobre esse assunto?",
        "Posso te ajudar com outras informações?",
        "Tem outras dúvidas sobre MS?"
      ];
    }
  }

  /**
   * CÁLCULO DE EMPATIA
   */
  private calculateEmpathyScore(emotionalAnalysis: any, response: any): number {
    let score = 0.5; // Base
    
    // Aumentar baseado no reconhecimento emocional
    if (emotionalAnalysis.dominant !== 'neutral') {
      score += 0.2;
    }
    
    // Aumentar baseado na resposta empática
    if (response.answer.includes('entendo') || response.answer.includes('vejo')) {
      score += 0.2;
    }
    
    // Aumentar baseado na personalização
    if (response.answer.includes('você')) {
      score += 0.1;
    }
    
    return Math.min(score, 1.0);
  }

  /**
   * CÁLCULO DE SATISFAÇÃO DO USUÁRIO
   */
  private calculateUserSatisfaction(userProfile: any, emotionalAnalysis: any, response: any): number {
    let satisfaction = 0.5; // Base
    
    // Aumentar baseado na resposta empática
    if (emotionalAnalysis.dominant === 'excited' && response.answer.includes('legal')) {
      satisfaction += 0.2;
    }
    
    // Aumentar baseado na personalização
    if (userProfile.interests.length > 0 && response.answer.includes('interessa')) {
      satisfaction += 0.2;
    }
    
    // Aumentar baseado na completude da resposta
    if (response.confidence > 0.8) {
      satisfaction += 0.1;
    }
    
    return Math.min(satisfaction, 1.0);
  }

  /**
   * ATUALIZAR PERFIL DO USUÁRIO
   */
  private updateUserProfile(userId: string, data: any): void {
    const profile = this.userProfiles.get(userId);
    if (profile) {
      profile.lastInteraction = data.timestamp;
      profile.satisfactionHistory.push(data.satisfaction);
      
      // Manter apenas últimas 20 satisfações
      if (profile.satisfactionHistory.length > 20) {
        profile.satisfactionHistory = profile.satisfactionHistory.slice(-20);
      }
      
      // Atualizar padrões emocionais
      if (!profile.emotionalPatterns[data.emotionalAnalysis.dominant]) {
        profile.emotionalPatterns[data.emotionalAnalysis.dominant] = 0;
      }
      profile.emotionalPatterns[data.emotionalAnalysis.dominant]++;
    }
  }

  /**
   * ATUALIZAR HISTÓRICO EMOCIONAL
   */
  private updateEmotionalHistory(userId: string, emotionalAnalysis: any): void {
    if (!this.emotionalHistory.has(userId)) {
      this.emotionalHistory.set(userId, []);
    }
    
    const history = this.emotionalHistory.get(userId);
    history.push({
      ...emotionalAnalysis,
      timestamp: new Date()
    });
    
    // Manter apenas últimas 50 interações
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }
  }

  /**
   * UTILITÁRIOS
   */
  private getLastEmotionalState(history: string[]): string {
    // Implementar lógica para extrair último estado emocional
    return 'neutral';
  }

  private generateEmotionalImprovements(emotionalAnalysis: any, userProfile: any): string[] {
    const improvements = [];
    
    if (emotionalAnalysis.dominant === 'frustrated') {
      improvements.push('Melhorar respostas para usuários frustrados');
    }
    
    if (userProfile.satisfactionHistory.length > 0) {
      const avgSatisfaction = userProfile.satisfactionHistory.reduce((a: number, b: number) => a + b, 0) / userProfile.satisfactionHistory.length;
      if (avgSatisfaction < 0.6) {
        improvements.push('Melhorar personalização geral');
      }
    }
    
    return improvements;
  }

  private getEmotionalMemoryUpdates(userId: string): any[] {
    const history = this.emotionalHistory.get(userId) || [];
    return history.slice(-3);
  }
}

// Exportar instância única
export const guataEmotionalIntelligenceService = new GuataEmotionalIntelligenceService();
export type { EmotionalIntelligenceQuery, EmotionalIntelligenceResponse };




