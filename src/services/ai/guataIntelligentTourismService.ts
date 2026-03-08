// @ts-nocheck
/**
 * 🦦 GUATÁ INTELLIGENT TOURISM SERVICE
 * Chatbot de turismo verdadeiramente inteligente
 * Combina IA + Pesquisa Web Real + Dados de Turismo + Machine Learning
 */

import { guataRealWebSearchService, RealWebSearchQuery, RealWebSearchResponse, TourismData } from './guataRealWebSearchService';
import { guataMLService, LearningInteraction } from './ml/guataMLService';

export interface IntelligentTourismQuery {
  question: string;
  userId?: string;
  sessionId?: string;
  userLocation?: string;
  conversationHistory?: string[];
  userPreferences?: any;
  isTotemVersion?: boolean; // true = /chatguata (pode usar "Olá"), false = /guata (não usa "Olá" após primeira mensagem)
  isFirstUserMessage?: boolean; // true = primeira mensagem do usuário (já teve mensagem de boas-vindas)
}

export interface IntelligentTourismResponse {
  answer: string;
  confidence: number;
  sources: string[];
  processingTime: number;
  webSearchResults: any[];
  tourismData: TourismData;
  usedRealSearch: boolean;
  searchMethod: string;
  personality: string;
  emotionalState: string;
  followUpQuestions: string[];
  learningInsights: any;
  adaptiveImprovements: string[];
  memoryUpdates: any[];
}

class GuataIntelligentTourismService {
  private personality = {
    name: "Guatá",
    species: "capivara",
    role: "guia de turismo especializado",
    traits: ["conhecedor", "prestativo", "confiável", "apaixonado por MS", "curioso", "amigável"],
    speakingStyle: "conversacional, natural e envolvente",
    emotions: ["interessado", "prestativo", "confiável", "orgulhoso", "curioso", "empolgado"]
  };

  /**
   * Processa pergunta com IA + Pesquisa Web Real
   */
  async processQuestion(query: IntelligentTourismQuery): Promise<IntelligentTourismResponse> {
    const startTime = Date.now();
    // Garantir que question seja sempre uma string
    let question = String(query.question || '').trim();
    // Processando pergunta (logs removidos)

    try {
      // 0. Validar escopo de turismo e conteúdo inapropriado
      const { TourismScopeValidator } = await import('./validation/tourismScopeValidator');
      const validator = new TourismScopeValidator();
      const validation = validator.validateQuestion(question);
      
      if (validation.shouldBlock) {
        return {
          answer: validation.redirectResponse || '🦦 Olá! Eu sou o Guatá, seu guia inteligente de turismo de Mato Grosso do Sul! 😊\n\nPosso te ajudar com informações sobre destinos, atrações, gastronomia, hospedagem, eventos e roteiros turísticos em MS.\n\nO que você gostaria de saber sobre turismo em Mato Grosso do Sul? 🌟',
          confidence: 0.9,
          sources: ['validation'],
          processingTime: Date.now() - startTime,
          webSearchResults: [],
          tourismData: {},
          usedRealSearch: false,
          searchMethod: 'validation',
          personality: this.personality.name,
          emotionalState: 'helpful',
          followUpQuestions: [
            'Quais são os melhores passeios em Bonito?',
            'Me conte sobre a comida típica de MS',
            'O que fazer em Campo Grande?'
          ],
          learningInsights: {
            questionType: validation.isInappropriate ? 'inappropriate' : 'off_scope',
            userIntent: 'blocked',
            reason: validation.reason
          },
          adaptiveImprovements: [],
          memoryUpdates: []
        };
      }

      // 1. Verificar se é APENAS um cumprimento simples (sem perguntas)
      // NÃO tratar como cumprimento se houver perguntas ou contexto adicional
      if (this.isSimpleGreeting(question) && question.trim().length < 20) {
        console.log('👋 Cumprimento simples detectado, respondendo naturalmente...');
        return this.generateSimpleGreetingResponse(question);
      }

      // 1.5. Detectar perguntas de continuação ("sim, por favor", "ok", etc.)
      if (this.isContinuationQuestion(question, query.conversationHistory || [])) {
        console.log('🔄 Pergunta de continuação detectada, respondendo baseado no contexto...');
        return this.handleContinuationQuestion(question, query.conversationHistory || []);
      }

      // 1.5.5. Detectar resposta apenas com cidade após esclarecimento
      const cityContext = this.detectCityOnlyResponse(question, query.conversationHistory || []);
      if (cityContext.shouldCombine) {
        console.log('🏙️ Resposta apenas com cidade detectada, combinando com contexto anterior...');
        const originalQuestion = question;
        question = `${cityContext.serviceType} em ${cityContext.city}`;
        console.log(`🔄 Pergunta combinada: "${originalQuestion}" → "${question}"`);
        // Atualizar query.question para que o resto do código use a pergunta combinada
        query.question = question;
      }

      // 1.5.6. Detectar perguntas com pronomes vagos que dependem do contexto anterior
      const pronounContext = this.detectPronounReference(question, query.conversationHistory || []);
      if (pronounContext.shouldRewrite) {
        console.log('🔗 Pergunta com pronome detectada, reescrevendo com base no contexto anterior...');
        console.log(`   Pergunta original: "${question}"`);
        console.log(`   Pergunta reescrita: "${pronounContext.rewrittenQuestion}"`);
        question = pronounContext.rewrittenQuestion;
        query.question = question;
      }

      // 1.5.7. Detectar perguntas curtas e ambíguas (ex: "qual o nome do presidente?")
      const implicitContext = this.detectImplicitReference(question, query.conversationHistory || []);
      if (implicitContext.shouldRewrite) {
        console.log('🧩 Pergunta ambígua detectada, usando foco da conversa anterior...');
        console.log(`   Pergunta original: "${question}"`);
        console.log(`   Pergunta reescrita: "${implicitContext.rewrittenQuestion}"`);
        question = implicitContext.rewrittenQuestion;
        query.question = question;
      }

      // 1.6. Detectar perguntas genéricas que precisam de esclarecimento
      const needsClarification = this.needsClarification(question);
      if (needsClarification.needs) {
        console.log('❓ Pergunta genérica detectada, pedindo esclarecimento...');
        return this.generateClarificationResponse(question, needsClarification);
      }

      // 1.7. CONSULTAR KNOWLEDGE BASE PERSISTENTE (antes de web search)
      try {
        const { guataKnowledgeBaseService } = await import('./guataKnowledgeBaseService');
        const kbResult = await guataKnowledgeBaseService.searchKnowledgeBase(question, { minSimilarity: 0.75 });

        if (kbResult.found && kbResult.answer) {
          console.log('✅ [KB] Resposta encontrada na Knowledge Base!');
          return {
            answer: kbResult.answer,
            confidence: kbResult.confidence || 0.95,
            sources: ['knowledge_base', ...(kbResult.source ? [kbResult.source] : [])],
            processingTime: Date.now() - startTime,
            webSearchResults: [],
            tourismData: {},
            usedRealSearch: false,
            searchMethod: 'knowledge_base',
            personality: this.personality.name,
            emotionalState: 'helpful',
            followUpQuestions: this.generateFollowUpQuestions(question, {}),
            learningInsights: {
              questionType: this.detectQuestionCategory(question),
              userIntent: 'information_seeking',
              knowledgeSource: 'kb',
              kbMatch: true
            },
            adaptiveImprovements: [],
            memoryUpdates: []
          };
        }
        // Não logar quando não encontra (comportamento normal)
      } catch (error: unknown) {
        const err = error as { code?: string; message?: string };
        // Erros esperados (tabela não existe, etc) não devem ser logados
        const isExpectedError = 
          err?.message?.includes('does not exist') ||
          err?.message?.includes('relation') ||
          err?.code === '42P01';
        
        if (!isExpectedError) {
          console.warn('⚠️ [KB] Erro inesperado ao consultar Knowledge Base:', error);
        }
        // Em caso de erro, continuar fluxo normal sem quebrar
      }

      // 2. Detectar categoria da pergunta
      const category = this.detectQuestionCategory(question);
      // Log removido para reduzir verbosidade

      // 3. SEMPRE fazer pesquisa web PRIMEIRO (antes de tudo)
      const webSearchQuery: RealWebSearchQuery = {
        question: question,
        location: query.userLocation || 'Mato Grosso do Sul',
        category: category,
        maxResults: 5
      };
      
      const webSearchResponse = await guataRealWebSearchService.searchRealTime(webSearchQuery);
      
      // 4. VERIFICAR PARCEIROS (após pesquisa web)
      const partnersResult = await this.checkPartners(question, category);
      
      // 5. Gerar resposta inteligente combinando IA + dados reais + parceiros
      const intelligentAnswer = await this.generateIntelligentAnswer(
        question,
        webSearchResponse,
        query.conversationHistory || [],
        query.userPreferences || {},
        partnersResult,
        query.userId,
        query.sessionId,
        query.isTotemVersion,
        query.isFirstUserMessage
      );

      // 4. Personalizar resposta com Machine Learning
      let personalizedAnswer = intelligentAnswer;
      try {
        personalizedAnswer = await guataMLService.personalizeResponse(
          question,
          intelligentAnswer,
          query.userId,
          query.sessionId
        );
        // ML: Resposta personalizada aplicada (log removido)
      } catch (error: unknown) {
        console.warn('⚠️ ML: Erro ao personalizar resposta, usando resposta original:', error);
      }

      // 5. Adicionar personalidade e contexto
      const finalAnswer = this.addPersonalityAndContext(
        personalizedAnswer,
        question,
        webSearchResponse.tourismData
      );

      const processingTime = Date.now() - startTime;
        // Resposta gerada (log removido)

      // 6. Aprender automaticamente da interação (assíncrono, não bloqueia resposta)
      const learningInteraction: LearningInteraction = {
        userId: query.userId,
        sessionId: query.sessionId || `session-${Date.now()}`,
        question: question,
        answer: finalAnswer,
        sources: webSearchResponse.sources,
        confidence: webSearchResponse.usedRealSearch ? 0.95 : 0.8,
        timestamp: new Date(),
        metadata: {
          queryType: this.detectQuestionCategory(question) as any,
          location: query.userLocation,
          conversationHistory: query.conversationHistory
        }
      };

      // Aprender em background (não esperar)
      guataMLService.learnFromInteraction(learningInteraction).catch(err => {
        console.warn('⚠️ ML: Erro ao aprender de interação:', err);
      });

      return {
        answer: finalAnswer,
        confidence: webSearchResponse.usedRealSearch ? 0.95 : 0.8,
        sources: webSearchResponse.sources,
        processingTime,
        webSearchResults: webSearchResponse.results,
        tourismData: webSearchResponse.tourismData,
        usedRealSearch: webSearchResponse.usedRealSearch,
        searchMethod: webSearchResponse.searchMethod,
        personality: this.personality.name,
        emotionalState: this.determineEmotionalState(question),
        followUpQuestions: this.generateFollowUpQuestions(question, webSearchResponse.tourismData),
        learningInsights: this.generateLearningInsights(question, webSearchResponse),
        adaptiveImprovements: this.generateAdaptiveImprovements(webSearchResponse),
        memoryUpdates: this.generateMemoryUpdates(question, webSearchResponse)
      };

    } catch (error: unknown) {
      console.error('❌ Erro no Guatá Intelligent Tourism:', error);
      
      return {
        answer: "🦦 *coçando a cabeça* Ops! Algo deu errado aqui. Deixe-me tentar novamente...",
        confidence: 0.3,
        sources: ['erro'],
        processingTime: Date.now() - startTime,
        webSearchResults: [],
        tourismData: {},
        usedRealSearch: false,
        searchMethod: 'error',
        personality: 'confused',
        emotionalState: 'confused',
        followUpQuestions: ['Você pode reformular sua pergunta?', 'Posso te ajudar com algo mais específico?'],
        learningInsights: { error: true },
        adaptiveImprovements: ['Melhorar tratamento de erros'],
        memoryUpdates: []
      };
    }
  }

  /**
   * Verifica parceiros para a pergunta
   */
  private async checkPartners(question: string, category: string): Promise<any> {
    try {
      // Verificar se a pergunta é sobre serviços que podem ter parceiros
      const isServiceQuestion = this.isServiceRelatedQuestion(question);
      
      if (!isServiceQuestion) {
        console.log('🤝 Pergunta não relacionada a serviços, pulando verificação de parceiros');
        return {
          partnersFound: [],
          partnerSuggestion: null,
          partnerPriority: 0
        };
      }
      
      // Importar o serviço de parceiros
      const { guataPartnersService } = await import('./guataPartnersService');
      
      const partnersResponse = await guataPartnersService.processQuestion({
        question: question,
        userId: 'guata_user',
        sessionId: 'guata_session',
        userLocation: 'Mato Grosso do Sul',
        conversationHistory: [],
        userPreferences: {}
      });
      
      console.log('🤝 Parceiros encontrados:', partnersResponse.partnersFound.length);
      return partnersResponse;
    } catch (error: unknown) {
      console.log('🤝 Erro ao verificar parceiros:', error);
      return {
        partnersFound: [],
        partnerSuggestion: null,
        partnerPriority: 0
      };
    }
  }

  /**
   * Verifica se a pergunta é sobre serviços que podem ter parceiros
   */
  private isServiceRelatedQuestion(question: string): boolean {
    // Garantir que question seja sempre uma string
    const questionStr = String(question || '').trim();
    if (!questionStr) return false;
    
    const lowerQuestion = questionStr.toLowerCase();
    
    // Palavras-chave que indicam perguntas sobre serviços (hotéis, restaurantes, etc)
    const serviceKeywords = [
      'hotel', 'hospedagem', 'pousada', 'dormir', 'acomodação', 'onde ficar',
      'restaurante', 'comer', 'comida', 'gastronomia', 'lanchonete', 'onde comer',
      'passeio', 'tour', 'excursão', 'agência', 'operadora', 'onde fazer',
      'tem hotel', 'tem restaurante', 'tem pousada', 'tem passeio',
      'melhor restaurante', 'melhor hotel', 'melhor pousada', 'melhor passeio'
    ];
    
    // Perguntas que NÃO devem ter parceiros (conceitos gerais)
    const generalConcepts = [
      'rota bioceânica', 'rota bioceanica', 'bioceanica',
      'o que é', 'como funciona', 'quando', 'onde fica (localização)',
      'história', 'cultura', 'turismo (conceito)', 'destino (conceito)',
      'roteiro (planejamento)', 'itinerário (planejamento)', 'dias', 'moto', 'viagem (planejamento)'
    ];
    
    // Se contém conceitos gerais, não usar parceiros
    for (const concept of generalConcepts) {
      if (lowerQuestion.includes(concept)) {
        console.log(`🤝 Pergunta contém conceito geral "${concept}", não usando parceiros`);
        return false;
      }
    }
    
    // Se contém palavras-chave de serviços, usar parceiros
    for (const keyword of serviceKeywords) {
      if (lowerQuestion.includes(keyword)) {
        console.log(`🤝 Pergunta contém palavra-chave de serviço "${keyword}", verificando parceiros`);
        return true;
      }
    }
    
    console.log(`🤝 Pergunta não contém palavras-chave de serviços, não usando parceiros`);
    return false;
  }

  /**
   * Detecta quando a pergunta atual usa pronomes vagos ("ela", "ele", "isso")
   * e tenta reescrever usando o assunto da última pergunta do usuário.
   *
   * Exemplo:
   *  - Anterior: "quem é tia eva?"
   *  - Atual:    "ela fundou campo grande?"
   *  - Saída:    "tia eva fundou campo grande?"
   */
  private detectPronounReference(
    question: string,
    conversationHistory: string[]
  ): { shouldRewrite: boolean; rewrittenQuestion: string } {
    const lowerQuestion = question.toLowerCase().trim();

    // Se a pergunta é muito longa, provavelmente já tem contexto suficiente
    if (lowerQuestion.length > 120) {
      return { shouldRewrite: false, rewrittenQuestion: question };
    }

    const pronouns = [
      'ela',
      'ele',
      'eles',
      'elas',
      'isso',
      'isso aí',
      'isso ai',
      'esse lugar',
      'essa cidade',
      'lá',
      'la'
    ];

    const hasPronoun = pronouns.some(p => lowerQuestion.includes(p));
    if (!hasPronoun) {
      return { shouldRewrite: false, rewrittenQuestion: question };
    }

    if (!conversationHistory || conversationHistory.length === 0) {
      return { shouldRewrite: false, rewrittenQuestion: question };
    }

    const lastQuestionRaw = String(conversationHistory[conversationHistory.length - 1] || '').trim();
    if (!lastQuestionRaw) {
      return { shouldRewrite: false, rewrittenQuestion: question };
    }

    const lastQuestionLower = lastQuestionRaw.toLowerCase();

    let subject = '';

    // Padrões típicos de identificação de sujeito: "quem é X", "quem foi X"
    const whoMatch =
      lastQuestionRaw.match(/quem\s+é\s+(.+?)[\?]?$/i) ||
      lastQuestionRaw.match(/quem\s+foi\s+(.+?)[\?]?$/i);
    if (whoMatch && whoMatch[1]) {
      subject = whoMatch[1].trim();
    }

    // Se não encontrou via regex, tentar usar a última pergunta inteira como assunto (casos como "rio da prata", "pantanal")
    if (!subject && lastQuestionRaw.length > 0 && lastQuestionRaw.length < 120) {
      subject = lastQuestionRaw.replace(/\?+$/, '').trim();
    }

    if (!subject) {
      return { shouldRewrite: false, rewrittenQuestion: question };
    }

    // Substituir pronomes pelo assunto identificado
    let rewritten = question;
    pronouns.forEach(p => {
      const pattern = new RegExp(`\\b${p}\\b`, 'gi');
      rewritten = rewritten.replace(pattern, subject);
    });

    // Se não houve substituição efetiva, adicionar contexto como prefixo
    if (rewritten === question) {
      rewritten = `Sobre ${subject}: ${question}`;
    }

    return { shouldRewrite: true, rewrittenQuestion: rewritten };
  }

  /**
   * Detecta perguntas curtas e ambíguas (sem pronome claro), como:
   *  - "qual o nome do presidente?"
   *  - "como é o nome do presidente?"
   *  - "qual o nome dele?" (já pode ter sido tratada por detectPronounReference)
   * Usa o último foco da conversa (normalmente a resposta anterior do Guatá)
   * para reescrever a pergunta com mais contexto.
   */
  private detectImplicitReference(
    question: string,
    conversationHistory: string[]
  ): { shouldRewrite: boolean; rewrittenQuestion: string } {
    const lowerQuestion = question.toLowerCase().trim();

    // Só tratar perguntas relativamente curtas para evitar interferir em perguntas completas
    if (lowerQuestion.length === 0 || lowerQuestion.length > 80) {
      return { shouldRewrite: false, rewrittenQuestion: question };
    }

    // Evitar casos em que o usuário já especificou claramente o alvo
    const explicitMarkers = ['do brasil', 'da assembleia', 'da assembleia legislativa', 'do tre', 'do senado'];
    if (explicitMarkers.some(marker => lowerQuestion.includes(marker))) {
      return { shouldRewrite: false, rewrittenQuestion: question };
    }

    if (!conversationHistory || conversationHistory.length === 0) {
      return { shouldRewrite: false, rewrittenQuestion: question };
    }

    // Usar a última entrada do histórico como "foco" da conversa.
    // Com a mudança no front, isso normalmente será a última resposta do Guatá.
    const lastEntryRaw = String(conversationHistory[conversationHistory.length - 1] || '').trim();
    const lastEntryLower = lastEntryRaw.toLowerCase();
    if (!lastEntryRaw) {
      return { shouldRewrite: false, rewrittenQuestion: question };
    }

    // Caso específico: perguntas sobre "presidente" sem especificação
    const asksForPresident =
      (lowerQuestion.includes('presidente') && !lowerQuestion.includes('da ') && !lowerQuestion.includes('do ')) ||
      lowerQuestion.match(/^como\s+é\s+o\s+nome\s+do\s+presidente\??$/) !== null ||
      lowerQuestion.match(/^qual\s+é\s+o\s+nome\s+do\s+presidente\??$/) !== null ||
      lowerQuestion.match(/^qual\s+o\s+nome\s+do\s+presidente\??$/) !== null;

    if (!asksForPresident) {
      return { shouldRewrite: false, rewrittenQuestion: question };
    }

    // Tentar extrair "presidente da/ do X" da resposta anterior
    let entity = '';
    const presidentMatchDa = lastEntryRaw.match(/presidente\s+da\s+([^\.!\n]+)/i);
    const presidentMatchDo = lastEntryRaw.match(/presidente\s+do\s+([^\.!\n]+)/i);

    if (presidentMatchDa && presidentMatchDa[1]) {
      entity = presidentMatchDa[1].trim();
    } else if (presidentMatchDo && presidentMatchDo[1]) {
      entity = presidentMatchDo[1].trim();
    }

    // Se não conseguir identificar entidade, não reescrever
    if (!entity) {
      return { shouldRewrite: false, rewrittenQuestion: question };
    }

    // Construir pergunta mais específica
    const rewritten = `qual é o nome do presidente da ${entity}?`;

    return { shouldRewrite: true, rewrittenQuestion: rewritten };
  }

  /**
   * Detecta se a pergunta é genérica e precisa de esclarecimento
   * IMPORTANTE: NÃO pede esclarecimento se a cidade já está mencionada
   */
  private needsClarification(question: string): { needs: boolean; type: 'city' | 'service' | 'none'; missingInfo: string } {
    const lowerQuestion = question.toLowerCase().trim();
    
    // Verificar PRIMEIRO se a pergunta menciona uma cidade específica
    const cities = [
      'campo grande', 'bonito', 'corumbá', 'corumba', 'dourados', 'três lagoas', 'tres lagoas',
      'pontaporã', 'pontapora', 'naviraí', 'navirai', 'nova andradina', 'aquidauana', 'paranaíba', 'paranaiba',
      'coxim', 'miranda', 'bodoquena', 'ladário', 'ladario', 'bataguassu', 'rio brilhante',
      'sidrolândia', 'sidrolandia', 'maracaju', 'chapadão do sul', 'chapadao do sul',
      'cassilândia', 'cassilandia', 'angélica', 'angelica', 'iguatemi', 'sete quedas',
      'porto murtinho', 'paranaíba', 'paranaiba'
    ];
    
    const hasCity = cities.some(city => lowerQuestion.includes(city));
    
    // Se TEM cidade mencionada, NUNCA pedir esclarecimento
    if (hasCity) {
      return { needs: false, type: 'none', missingInfo: '' };
    }
    
    // Padrões de perguntas genéricas que precisam de cidade (apenas se NÃO tem cidade)
    const genericPatterns = [
      { pattern: /onde\s+(comer|dormir|ficar|hospedar|passear|fazer|visitar)\s+em\s+ms/i, type: 'city' as const, missingInfo: 'cidade' },
      { pattern: /o\s+que\s+(comer|fazer|visitar|ver)\s+em\s+ms/i, type: 'city' as const, missingInfo: 'cidade' },
      { pattern: /melhor\s+(hotel|restaurante|pousada|passeio)\s+em\s+ms/i, type: 'city' as const, missingInfo: 'cidade' },
      { pattern: /onde\s+(comer|dormir|ficar|hospedar)\s+no\s+ms/i, type: 'city' as const, missingInfo: 'cidade' },
      { pattern: /quais\s+(hotéis|restaurantes|pousadas|passeios)\s+em\s+ms/i, type: 'city' as const, missingInfo: 'cidade' },
      { pattern: /onde\s+(comer|dormir|ficar|hospedar)\s+em\s+mato\s+grosso\s+do\s+sul/i, type: 'city' as const, missingInfo: 'cidade' },
    ];
    
    // Padrões de perguntas ambíguas que precisam de esclarecimento (sem cidade mencionada)
    const ambiguousPatterns = [
      // Hotéis perto de algo (shopping, aeroporto, centro, etc.) sem cidade
      { pattern: /(hotel|hospedagem|pousada).*perto\s+(do|da|de)\s+(shopping|centro|aeroporto|praça|parque|estádio|estadio)/i, type: 'city' as const, missingInfo: 'cidade' },
      // Restaurantes perto de algo sem cidade
      { pattern: /(restaurante|comida|gastronomia).*perto\s+(do|da|de)\s+(shopping|centro|praça|parque)/i, type: 'city' as const, missingInfo: 'cidade' },
      // Hotéis no centro sem cidade
      { pattern: /(hotel|hospedagem|pousada).*(no|no centro|centro)/i, type: 'city' as const, missingInfo: 'cidade' },
      // Restaurantes no centro sem cidade
      { pattern: /(restaurante|comida|gastronomia).*(no|no centro|centro)/i, type: 'city' as const, missingInfo: 'cidade' },
      // Shopping sem cidade
      { pattern: /(hotel|restaurante|comida).*(shopping|mall)/i, type: 'city' as const, missingInfo: 'cidade' },
    ];
    
    // Se não tem cidade e bate com padrões genéricos, precisa de esclarecimento
    for (const { pattern, type, missingInfo } of genericPatterns) {
      if (pattern.test(question) && !hasCity) {
        return { needs: true, type, missingInfo };
      }
    }
    
    // Se não tem cidade e bate com padrões ambíguos, precisa de esclarecimento
    for (const { pattern, type, missingInfo } of ambiguousPatterns) {
      if (pattern.test(question) && !hasCity) {
        return { needs: true, type, missingInfo };
      }
    }
    
    return { needs: false, type: 'none', missingInfo: '' };
  }

  /**
   * Gera resposta pedindo esclarecimento
   */
  private generateClarificationResponse(question: string, clarification: { type: string; missingInfo: string }): IntelligentTourismResponse {
    const lowerQuestion = question.toLowerCase();
    
    let clarificationQuestion = '';
    let followUpQuestions: string[] = [];
    
    if (clarification.type === 'city') {
      // Casos específicos: hotéis/restaurantes perto de shopping, centro, etc.
      if ((lowerQuestion.includes('hotel') || lowerQuestion.includes('hospedagem') || lowerQuestion.includes('pousada')) && 
          (lowerQuestion.includes('shopping') || lowerQuestion.includes('centro') || lowerQuestion.includes('perto'))) {
        clarificationQuestion = '🦦 Que alegria te ajudar a encontrar hospedagem! 😊 Para te dar as melhores opções, você quer hotéis perto do shopping ou centro de qual cidade? Campo Grande, Dourados, Corumbá ou outra?';
        followUpQuestions = [
          'Hotéis perto do shopping em Campo Grande',
          'Hotéis no centro de Campo Grande',
          'Hotéis perto do shopping em Dourados'
        ];
      } else if ((lowerQuestion.includes('restaurante') || lowerQuestion.includes('comida') || lowerQuestion.includes('gastronomia')) && 
                 (lowerQuestion.includes('shopping') || lowerQuestion.includes('centro') || lowerQuestion.includes('perto'))) {
        clarificationQuestion = '🦦 Que legal que você quer conhecer a gastronomia! 😊 Para te dar as melhores recomendações, você quer restaurantes perto do shopping ou centro de qual cidade? Campo Grande, Dourados, Corumbá ou outra?';
        followUpQuestions = [
          'Restaurantes perto do shopping em Campo Grande',
          'Restaurantes no centro de Campo Grande',
          'Restaurantes perto do shopping em Dourados'
        ];
      } else if (lowerQuestion.includes('comer') || lowerQuestion.includes('restaurante') || lowerQuestion.includes('gastronomia')) {
        clarificationQuestion = '🦦 Que legal que você quer conhecer a gastronomia de Mato Grosso do Sul! 😊 Para te dar as melhores recomendações, qual cidade você tem interesse? Campo Grande, Corumbá, Bonito ou outra?';
        followUpQuestions = [
          'Onde comer em Campo Grande?',
          'Onde comer em Corumbá?',
          'Onde comer em Bonito?'
        ];
      } else if (lowerQuestion.includes('hotel') || lowerQuestion.includes('hospedagem') || lowerQuestion.includes('dormir') || lowerQuestion.includes('ficar')) {
        clarificationQuestion = '🦦 Que alegria te ajudar a encontrar hospedagem! 😊 Para te dar as melhores opções, qual cidade você tem interesse? Campo Grande, Bonito, Corumbá ou outra?';
        followUpQuestions = [
          'Hotéis em Campo Grande',
          'Hotéis em Bonito',
          'Hotéis em Corumbá'
        ];
      } else if (lowerQuestion.includes('fazer') || lowerQuestion.includes('visitar') || lowerQuestion.includes('passeio') || lowerQuestion.includes('ver')) {
        clarificationQuestion = '🦦 Que demais que você quer explorar Mato Grosso do Sul! 🤩 Para te dar as melhores sugestões, qual cidade você tem interesse? Campo Grande, Bonito, Corumbá ou outra?';
        followUpQuestions = [
          'O que fazer em Campo Grande?',
          'O que fazer em Bonito?',
          'O que fazer em Corumbá?'
        ];
      } else {
        clarificationQuestion = '🦦 Que legal! 😊 Para te ajudar melhor, qual cidade de Mato Grosso do Sul você tem interesse? Campo Grande, Bonito, Corumbá ou outra?';
        followUpQuestions = [
          'O que fazer em Campo Grande?',
          'O que fazer em Bonito?',
          'O que fazer em Corumbá?'
        ];
      }
    }
    
    return {
      answer: clarificationQuestion,
      confidence: 0.95,
      sources: ['interactive_clarification'],
      processingTime: 50,
      webSearchResults: [],
      tourismData: {},
      usedRealSearch: false,
      searchMethod: 'interactive',
      personality: this.personality.name,
      emotionalState: 'helpful',
      followUpQuestions: followUpQuestions,
      learningInsights: {
        questionType: 'clarification_needed',
        userIntent: 'information_seeking',
        behaviorPattern: 'explorer',
        conversationFlow: 'interactive',
        predictiveAccuracy: 0.8
      },
      adaptiveImprovements: [],
      memoryUpdates: []
    };
  }

  /**
   * Verifica se é uma pergunta de continuação (resposta curta à pergunta anterior)
   */
  private isContinuationQuestion(question: string, conversationHistory: string[]): boolean {
    const lowerQuestion = question.toLowerCase().trim();
    const continuationWords = ['sim', 'sim por favor', 'sim, por favor', 'ok', 'okay', 'pode', 'pode sim', 'claro', 'quero', 'gostaria'];
    
    // Se a pergunta é muito curta e contém palavras de continuação
    if (lowerQuestion.length < 20 && continuationWords.some(word => lowerQuestion.includes(word))) {
      // Verificar se há histórico de conversa recente
      if (conversationHistory.length > 0) {
        const lastQuestion = conversationHistory[conversationHistory.length - 1].toLowerCase();
        // Se a última pergunta mencionava roteiro, fazer, montar, etc.
        if (lastQuestion.includes('roteiro') || lastQuestion.includes('montar') || 
            lastQuestion.includes('fazer') || lastQuestion.includes('visitar')) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Detecta se a resposta é apenas uma cidade e deve combinar com contexto anterior
   */
  private detectCityOnlyResponse(question: string, conversationHistory: string[]): { 
    shouldCombine: boolean; 
    city: string; 
    serviceType: string;
  } {
    const lowerQuestion = question.toLowerCase().trim();
    
    // Verificar se a pergunta é curta (1-3 palavras) e não contém palavras de pergunta
    const words = lowerQuestion.split(/\s+/).filter(w => w.length > 0);
    if (words.length > 3) {
      return { shouldCombine: false, city: '', serviceType: '' };
    }
    
    // Verificar se contém palavras de pergunta (não é apenas resposta)
    const questionWords = ['qual', 'quais', 'onde', 'como', 'quando', 'por que', 'porque', 'o que', 'que'];
    if (questionWords.some(qw => lowerQuestion.includes(qw))) {
      return { shouldCombine: false, city: '', serviceType: '' };
    }
    
    // Lista de cidades conhecidas de MS
    const cities = [
      'campo grande', 'bonito', 'corumbá', 'corumba', 'dourados', 'três lagoas', 'tres lagoas',
      'pontaporã', 'naviraí', 'navirai', 'nova andradina', 'aquidauana', 'paranaíba', 'paranaiba',
      'coxim', 'miranda', 'bodoquena', 'ladário', 'ladario', 'bataguassu', 'rio brilhante',
      'sidrolândia', 'sidrolandia', 'maracaju', 'chapadão do sul', 'chapadao do sul',
      'cassilândia', 'cassilandia', 'angélica', 'angelica', 'iguatemi', 'sete quedas'
    ];
    
    // Verificar se a pergunta é apenas uma cidade conhecida
    let detectedCity = '';
    for (const city of cities) {
      if (lowerQuestion === city || lowerQuestion === city.toUpperCase() || 
          lowerQuestion.includes(city) && words.length <= 2) {
        detectedCity = city;
        break;
      }
    }
    
    if (!detectedCity) {
      return { shouldCombine: false, city: '', serviceType: '' };
    }
    
    // Verificar se há histórico recente (última pergunta)
    if (conversationHistory.length === 0) {
      return { shouldCombine: false, city: '', serviceType: '' };
    }
    
    const lastQuestion = conversationHistory[conversationHistory.length - 1].toLowerCase();
    
    // Verificar se a última pergunta era genérica (sem cidade) e tinha palavras-chave de serviços
    const hasCityInLast = cities.some(city => lastQuestion.includes(city));
    if (hasCityInLast) {
      // Última pergunta já tinha cidade, não combinar
      return { shouldCombine: false, city: '', serviceType: '' };
    }
    
    // Extrair tipo de serviço da última pergunta
    let serviceType = '';
    if (lastQuestion.includes('restaurante') || lastQuestion.includes('comer') || 
        lastQuestion.includes('comida') || lastQuestion.includes('gastronomia')) {
      serviceType = 'restaurantes';
    } else if (lastQuestion.includes('hotel') || lastQuestion.includes('hospedagem') || 
               lastQuestion.includes('pousada') || lastQuestion.includes('dormir') || 
               lastQuestion.includes('ficar') || lastQuestion.includes('onde ficar')) {
      serviceType = 'hotéis';
    } else if (lastQuestion.includes('passeio') || lastQuestion.includes('fazer') || 
               lastQuestion.includes('visitar') || lastQuestion.includes('ver') ||
               lastQuestion.includes('o que fazer') || lastQuestion.includes('atrações')) {
      serviceType = 'passeios';
    } else if (lastQuestion.includes('roteiro') || lastQuestion.includes('itinerário') || 
               lastQuestion.includes('itinerario')) {
      serviceType = 'roteiros';
    }
    
    // Se encontrou tipo de serviço, combinar
    if (serviceType) {
      console.log(`🔗 Combinando contexto: "${serviceType}" + "${detectedCity}"`);
      return { 
        shouldCombine: true, 
        city: detectedCity, 
        serviceType: serviceType 
      };
    }
    
    return { shouldCombine: false, city: '', serviceType: '' };
  }

  /**
   * Lida com perguntas de continuação baseado no contexto
   */
  private handleContinuationQuestion(question: string, conversationHistory: string[]): IntelligentTourismResponse {
    const lowerQuestion = question.toLowerCase().trim();
    
    // Buscar contexto da última pergunta
    if (conversationHistory.length > 0) {
      const lastQuestion = conversationHistory[conversationHistory.length - 1].toLowerCase();
      
      // Se a última pergunta era sobre roteiro em Campo Grande
      if (lastQuestion.includes('campo grande') && (lastQuestion.includes('roteiro') || lastQuestion.includes('montar') || lastQuestion.includes('dias'))) {
        const daysMatch = lastQuestion.match(/(\d+)\s*dias?/);
        const numDays = daysMatch ? parseInt(daysMatch[1]) : 3;
        
        return {
          answer: this.generateCampoGrandeItinerary(numDays),
          confidence: 0.95,
          sources: ['conhecimento_local'],
          processingTime: 50,
          webSearchResults: [],
          tourismData: {},
          usedRealSearch: false,
          searchMethod: 'contextual',
          personality: this.personality.name,
          emotionalState: 'excited',
          followUpQuestions: [
            'Quer detalhes sobre hospedagem em Campo Grande?',
            'Posso te ajudar com restaurantes e gastronomia?'
          ],
          learningInsights: {},
          adaptiveImprovements: ['Resposta contextual baseada em continuação'],
          memoryUpdates: []
        };
      }
      
      // Se a última pergunta era sobre fazer algo em Campo Grande
      if (lastQuestion.includes('campo grande') && lastQuestion.includes('fazer')) {
        return {
          answer: this.formatCampoGrandeResponse([]),
          confidence: 0.95,
          sources: ['conhecimento_local'],
          processingTime: 50,
          webSearchResults: [],
          tourismData: {},
          usedRealSearch: false,
          searchMethod: 'contextual',
          personality: this.personality.name,
          emotionalState: 'excited',
          followUpQuestions: [],
          learningInsights: {},
          adaptiveImprovements: [],
          memoryUpdates: []
        };
      }
    }
    
    // Resposta genérica para continuação sem contexto claro
    return {
      answer: "🦦 Que alegria! Estou aqui para te ajudar! Pode me dizer mais especificamente o que você gostaria de saber? Por exemplo: roteiros, hospedagem, restaurantes, atrações... O que mais te interessa? ✨",
      confidence: 0.8,
      sources: ['conhecimento_local'],
      processingTime: 50,
      webSearchResults: [],
      tourismData: {},
      usedRealSearch: false,
      searchMethod: 'contextual',
      personality: this.personality.name,
      emotionalState: 'helpful',
      followUpQuestions: [],
      learningInsights: {},
      adaptiveImprovements: [],
      memoryUpdates: []
    };
  }

  /**
   * Gera roteiro detalhado para Campo Grande
   */
  private generateCampoGrandeItinerary(days: number): string {
    if (days === 3) {
      return `🦦 Que alegria te ajudar a montar um roteiro de 3 dias em Campo Grande! É uma experiência incrível! 🚀

📅 ROTEIRO DE 3 DIAS EM CAMPO GRANDE:

DIA 1 - Conhecendo a Cidade Morena
• Manhã: Bioparque Pantanal - Maior aquário de água doce do mundo! É impressionante ver peixes de todos os continentes! 🐠
• Tarde: Parque das Nações Indígenas - Cultura e natureza juntas! Um lugar mágico! ✨
• Noite: Feira Central - Comida boa, artesanato, música ao vivo! É a alma da cidade! 🎵

DIA 2 - Natureza e Cultura
• Manhã: Parque Horto Florestal - Um pedacinho da Amazônia no coração da cidade! 🌿
• Tarde: Orla Morena - Perfeita para ver o pôr do sol e relaxar! 🌅
• Noite: Praça Ary Coelho - O coração pulsante de Campo Grande! 💓

DIA 3 - Experiências Únicas
• Manhã: Mercadão Municipal - Comida típica e artesanato local! 🛍️
• Tarde: Memorial da Cultura Indígena - Conheça a história dos povos originários! 🏛️
• Noite: Aproveite a gastronomia local - Sobá, chipa, churrasco pantaneiro! 🍽️

🎯 Dicas do Guatá:
• Reserve ingressos do Bioparque com antecedência
• Use protetor solar - o sol de MS é forte!
• Experimente o sobá - prato típico único!
• Leve câmera - lugares lindos para fotografar!

Quer que eu detalhe algum dia específico ou te ajude com hospedagem e restaurantes? Estou aqui para te ajudar! 🦦`;
    } else if (days === 2) {
      return `🦦 Que legal! Um roteiro de 2 dias em Campo Grande é perfeito para conhecer o essencial! 

📅 ROTEIRO DE 2 DIAS EM CAMPO GRANDE:

DIA 1 - Principais Atrações
• Manhã: Bioparque Pantanal - Imperdível! 🐠
• Tarde: Parque das Nações Indígenas + Horto Florestal
• Noite: Feira Central - Experiência única! 🎵

DIA 2 - Cultura e Natureza
• Manhã: Orla Morena - Pôr do sol incrível! 🌅
• Tarde: Mercadão Municipal + Praça Ary Coelho
• Noite: Gastronomia local - Sobá, chipa! 🍽️

Quer mais detalhes sobre algum lugar específico? 🦦`;
    } else {
      return `🦦 Nossa, que roteiro incrível! Com ${days} dias você vai conhecer Campo Grande profundamente! 

Posso te montar um roteiro detalhado dia a dia! Quer que eu organize por temas (cultura, natureza, gastronomia) ou prefere um roteiro cronológico? 🚀`;
    }
  }

  /**
   * Verifica se é APENAS um cumprimento simples (sem perguntas adicionais)
   * Muito restritivo para não classificar perguntas reais como cumprimentos
   */
  private isSimpleGreeting(question: string): boolean {
    const lowerQuestion = question.toLowerCase().trim();
    const greetings = [
      'oi', 'olá', 'ola', 'hey', 'hi', 'hello', 
      'bom dia', 'boa tarde', 'boa noite',
      'tudo bem', 'como vai', 'e aí', 'eai'
    ];
    
    // Se tem mais de 20 caracteres, provavelmente tem pergunta ou contexto
    if (lowerQuestion.length > 20) {
      return false;
    }
    
    // Se contém palavras de pergunta, NÃO é cumprimento simples
    const questionWords = ['quem', 'o que', 'onde', 'como', 'quando', 'por que', 'qual', 'quais', 'tem', 'há', 'existe', 'você', 'vc'];
    const hasQuestion = questionWords.some(word => lowerQuestion.includes(word));
    if (hasQuestion) {
      return false;
    }
    
    // Verificar se é EXATAMENTE um cumprimento (sem nada mais)
    const isExactGreeting = greetings.some(greeting => {
      const trimmed = lowerQuestion.trim();
      return trimmed === greeting || trimmed === `${greeting}!` || trimmed === `${greeting}.`;
    });
    
    if (isExactGreeting) {
      return true;
    }
    
    // Verificar se começa com cumprimento mas é muito curto (apenas cumprimento + pontuação)
    const isGreetingStart = greetings.some(greeting => {
      const startsWith = lowerQuestion.startsWith(greeting);
      const afterGreeting = lowerQuestion.substring(greeting.length).trim();
      // Permitir apenas pontuação ou espaços após o cumprimento
      return startsWith && (afterGreeting === '' || afterGreeting === '!' || afterGreeting === '.' || afterGreeting.length <= 2);
    });
    
    return isGreetingStart;
  }

  /**
   * Detecta o idioma da pergunta e retorna resposta no mesmo idioma
   */
  private async detectAndRespondInLanguage(question: string, answer: string): Promise<string> {
    try {
      const { languageDetectionService } = await import('./languageDetectionService');
      const detection = languageDetectionService.detectLanguage(question);
      
      // Se detectou outro idioma além de português com boa confiança
      if (detection.language !== 'pt' && detection.confidence > 0.6) {
        // A resposta já deve vir no idioma correto do Gemini (que recebe instrução)
        // Mas podemos adicionar uma nota se necessário
        return answer;
      }
      
      return answer;
    } catch (error: unknown) {
      // Se houver erro na detecção, retornar resposta original
      return answer;
    }
  }

  /**
   * Gera resposta para cumprimentos simples
   */
  private generateSimpleGreetingResponse(question: string): IntelligentTourismResponse {
    const responses = [
      "🦦 Que alegria te ver aqui! Eu sou o Guatá, sua capivara guia de Mato Grosso do Sul! 😊 Estou aqui para te ajudar a descobrir as maravilhas do nosso estado! Temos o Pantanal (maior santuário ecológico do mundo!), Bonito (águas cristalinas de outro planeta!), Campo Grande (nossa capital cheia de história!) e muito mais! O que você está com vontade de descobrir hoje?",
      "🦦 Nossa, que bom te ver por aqui! Sou o Guatá e estou super animado para te ajudar a conhecer Mato Grosso do Sul! 🚀 Temos destinos que vão te deixar de queixo caído! Me conta, o que mais te chama atenção? O Pantanal com seus jacarés? Bonito com suas águas cristalinas? Campo Grande com sua cultura?",
      "🦦 Olá, bem-vindo à nossa terra! Eu sou o Guatá, seu guia virtual de MS! 🌟 Posso te contar sobre destinos incríveis, eventos imperdíveis, comidas deliciosas e muito mais! Temos o Pantanal (maior área úmida do mundo!), Bonito (capital do ecoturismo!), Campo Grande (cidade morena cheia de charme!) e Corumbá (portal do Pantanal!). Por onde você quer começar nossa conversa?",
      "🦦 Oi! Que prazer te receber aqui! Eu sou o Guatá, sua capivara guia de Mato Grosso do Sul! 💚 Estou aqui para te ajudar a descobrir as maravilhas do nosso estado! Temos o Pantanal (maior santuário ecológico do mundo!), Bonito (águas cristalinas de outro planeta!), Campo Grande (nossa capital cheia de história!) e muito mais! O que você está com vontade de descobrir hoje?",
      "🦦 Que alegria te ver aqui! Eu sou o Guatá, sua capivara guia de Mato Grosso do Sul! 😊 Estou aqui para te ajudar a descobrir as maravilhas do nosso estado! Temos o Pantanal (maior santuário ecológico do mundo!), Bonito (águas cristalinas de outro planeta!), Campo Grande (nossa capital cheia de história!) e muito mais! O que você está com vontade de descobrir hoje?"
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      answer: randomResponse,
      confidence: 0.95,
      sources: ['personalidade_local'],
      processingTime: 50,
      webSearchResults: [],
      tourismData: {},
      usedRealSearch: false,
      searchMethod: 'greeting',
      personality: this.personality.name,
      emotionalState: 'friendly',
      followUpQuestions: [
        "**Que tal conhecer o Pantanal?** É uma experiência que vai mudar sua vida!",
        "**Bonito te interessa?** É o destino mais lindo do Brasil!",
        "**Campo Grande?** Nossa capital tem segredos incríveis para descobrir!",
        "**Quer que eu monte um roteiro personalizado?** Posso criar algo especial para você!"
      ],
      learningInsights: {
        questionType: 'greeting',
        userIntent: 'social_interaction',
        behaviorPattern: 'friendly',
        conversationFlow: 'natural',
        predictiveAccuracy: 0.9,
        proactiveSuggestions: 0
      },
      adaptiveImprovements: ['Resposta natural para cumprimentos'],
      memoryUpdates: [
        {
          type: 'greeting_interaction',
          content: question,
          confidence: 0.9,
          timestamp: new Date()
        }
      ]
    };
  }

  /**
   * Detecta categoria da pergunta
   */
  private detectQuestionCategory(question: string): 'hotels' | 'events' | 'restaurants' | 'attractions' | 'general' {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('hotel') || lowerQuestion.includes('hospedagem') || lowerQuestion.includes('pousada')) {
      return 'hotels';
    }
    
    if (lowerQuestion.includes('evento') || lowerQuestion.includes('festa') || lowerQuestion.includes('agenda')) {
      return 'events';
    }
    
    if (lowerQuestion.includes('restaurante') || lowerQuestion.includes('comida') || lowerQuestion.includes('gastronomia')) {
      return 'restaurants';
    }
    
    if (lowerQuestion.includes('passeio') || lowerQuestion.includes('atração') || lowerQuestion.includes('ponto turístico')) {
      return 'attractions';
    }
    
    return 'general';
  }

  /**
   * Gera resposta inteligente combinando IA + dados reais
   */
  private async generateIntelligentAnswer(
    question: string,
    webSearchResponse: RealWebSearchResponse,
    conversationHistory: string[],
    userPreferences: any,
    partnersResult?: any,
    userId?: string,
    sessionId?: string,
    isTotemVersion?: boolean,
    isFirstUserMessage?: boolean
  ): Promise<string> {
    let answer = "";

    // PRIORIZAR PARCEIROS SE HOUVER
    if (partnersResult && partnersResult.partnersFound && partnersResult.partnersFound.length > 0) {
      console.log('🤝 Usando parceiros encontrados:', partnersResult.partnersFound.length);
      answer = this.formatPartnersResponse(partnersResult, question);
      
      // Adicionar pesquisa web como complemento
      if (webSearchResponse.results.length > 0) {
        answer += "\n\n🌐 Outras opções encontradas:\n";
        answer += this.formatWebSearchResults(webSearchResponse.results, question);
      }
    } else {
      // USAR GEMINI + PESQUISA WEB + PARCEIROS PARA RESPOSTA DINÂMICA
      try {
        const { guataGeminiService } = await import('./guataGeminiService');
        const isDev = import.meta.env.DEV;
        if (isDev) {
          console.log('[Guatá] Preparando resposta com Gemini + pesquisa web');
        }
        
        const geminiQuery: any = {
          question,
          context: `Localização: Mato Grosso do Sul`,
          userLocation: 'Mato Grosso do Sul',
          searchResults: webSearchResponse.results,
          conversationHistory: conversationHistory,
          isTotemVersion: isTotemVersion ?? true,
          isFirstUserMessage: isFirstUserMessage ?? false
        };
        
        // Passar informações de parceiros para o Gemini
        if (partnersResult && partnersResult.partnersFound && partnersResult.partnersFound.length > 0) {
          geminiQuery.partnersInfo = partnersResult.partnersFound.map((p: any) => ({
            name: p.name,
            city: p.city,
            segment: p.segment,
            description: p.description,
            contact_email: p.contact_email,
            contact_whatsapp: p.contact_whatsapp,
            website_link: p.website_link
          }));
        }
        
        // Passar userId e sessionId para cache individual
        if (userId) geminiQuery.userId = userId;
        if (sessionId) geminiQuery.sessionId = sessionId;
        
        const geminiResponse = await guataGeminiService.processQuestion(geminiQuery);
        
        if (geminiResponse.usedGemini) {
          const isDev = import.meta.env.DEV;
          if (isDev) {
            console.log('[Guatá] Gemini gerou resposta com pesquisa web');
          }
          answer = geminiResponse.answer;
        } else {
          // Fallback: usar pesquisa web formatada de forma inteligente
          // SEMPRE usar os resultados da pesquisa web quando Gemini não está disponível
          if (webSearchResponse.results && webSearchResponse.results.length > 0) {
            // Priorizar parceiros se houver
            if (partnersResult && partnersResult.partnersFound && partnersResult.partnersFound.length > 0) {
              answer = this.formatPartnersResponse(partnersResult, question);
              answer += "\n\n🌐 Outras informações encontradas:\n\n";
              answer += this.formatWebSearchResults(webSearchResponse.results, question);
            } else {
              // Usar apenas pesquisa web formatada de forma inteligente
              answer = this.formatWebSearchResults(webSearchResponse.results, question);
            }
          } else {
            // Se não há resultados de pesquisa web, usar conhecimento local
            answer = this.generateLocalKnowledgeResponse(question);
          }
        }
      } catch (error: unknown) {
        const err = error as { message?: string };
        // Tratamento específico para API key vazada
        if (err.message?.includes('API_KEY_LEAKED') || err.message?.includes('leaked')) {
          const isDev = import.meta.env.DEV;
          if (isDev) {
            console.warn('[Guatá] API Key vazada detectada, usando fallback com pesquisa web');
          }
          // Usar pesquisa web como fallback principal
          if (partnersResult && partnersResult.partnersFound && partnersResult.partnersFound.length > 0) {
            answer = this.formatPartnersResponse(partnersResult, question);
            answer += "\n\n🌐 Outras opções encontradas:\n";
            answer += this.formatWebSearchResults(webSearchResponse.results, question);
          } else if (webSearchResponse.results.length > 0) {
            answer = this.formatWebSearchResults(webSearchResponse.results, question);
          } else {
            // Último fallback: conhecimento local
            answer = this.generateLocalKnowledgeResponse(question);
          }
        } else {
          // Outros erros: usar pesquisa web
          const isDev = import.meta.env.DEV;
          if (isDev) {
            console.warn('[Guatá] Erro no Gemini, usando pesquisa web:', error.message);
          }
          if (partnersResult && partnersResult.partnersFound && partnersResult.partnersFound.length > 0) {
            answer = this.formatPartnersResponse(partnersResult, question);
            answer += "\n\n🌐 Outras opções encontradas:\n";
            answer += this.formatWebSearchResults(webSearchResponse.results, question);
          } else {
            answer = this.formatWebSearchResults(webSearchResponse.results, question);
          }
        }
      }
    }

    // Se ainda não temos resposta, usar conhecimento local
    if (!answer) {
      answer = this.generateLocalKnowledgeResponse(question);
    }

    return answer;
  }

  /**
   * Formata informações de hotéis
   */
  private formatHotelInformation(hotels: any[], question: string): string {
    let response = "🏨 Hotéis Recomendados:\n\n";
    
    hotels.slice(0, 3).forEach((hotel, index) => {
      response += `${index + 1}. ${hotel.name}\n`;
      response += `📍 ${hotel.address}\n`;
      response += `💰 ${hotel.price}\n`;
      response += `⭐ ${hotel.rating}/5\n`;
      response += `📞 ${hotel.contact}\n`;
      if (hotel.amenities && hotel.amenities.length > 0) {
        response += `✨ ${hotel.amenities.join(', ')}\n`;
      }
      response += `\n`;
    });

    response += `Dados atualizados em tempo real`;
    return response;
  }

  /**
   * Formata informações de eventos
   */
  private formatEventInformation(events: any[], question: string): string {
    let response = "🎉 Eventos Recomendados:\n\n";
    
    events.slice(0, 3).forEach((event, index) => {
      response += `${index + 1}. ${event.name}\n`;
      response += `📅 ${event.date}\n`;
      response += `📍 ${event.location}\n`;
      response += `💰 ${event.price}\n`;
      response += `📝 ${event.description}\n\n`;
    });

    response += `Informações atualizadas`;
    return response;
  }

  /**
   * Formata informações de restaurantes
   */
  private formatRestaurantInformation(restaurants: any[], question: string): string {
    let response = "🍽️ Restaurantes Recomendados:\n\n";
    
    restaurants.slice(0, 3).forEach((restaurant, index) => {
      response += `${index + 1}. ${restaurant.name}\n`;
      response += `🍴 ${restaurant.cuisine}\n`;
      response += `⭐ ${restaurant.rating}/5\n`;
      response += `📍 ${restaurant.address}\n`;
      response += `💰 ${restaurant.priceRange}\n`;
      if (restaurant.specialties && restaurant.specialties.length > 0) {
        response += `🍽️ Especialidades: ${restaurant.specialties.join(', ')}\n`;
      }
      response += `\n`;
    });

    response += `*Recomendações atualizadas*`;
    return response;
  }

  /**
   * Formata informações de clima
   */
  private formatWeatherInformation(weather: any, question: string): string {
    let response = `🌤️ **Clima Atual:**\n\n`;
    response += `🌡️ Temperatura: ${weather.temperature}°C\n`;
    response += `☁️ Condição: ${weather.condition}\n`;
    response += `💧 Umidade: ${weather.humidity}%\n\n`;
    
    if (weather.forecast && weather.forecast.length > 0) {
      response += `📅 **Previsão:**\n`;
      weather.forecast.forEach((day: string, index: number) => {
        response += `• ${day}\n`;
      });
    }

    response += `\n*Dados meteorológicos atualizados*`;
    return response;
  }

  /**
   * Formata resultados da pesquisa web de forma conversacional
   */
  private formatWebSearchResults(results: any[], question: string): string {
    if (results.length === 0) {
      return "Desculpe, não consegui encontrar informações específicas sobre isso. Posso te ajudar com outras informações sobre Mato Grosso do Sul?";
    }

    // Detectar tipo de pergunta para formatação específica
    const lowerQuestion = question.toLowerCase().trim();
    
    // Detectar perguntas sobre identidade do Guatá
    if (lowerQuestion.includes('quem é você') || lowerQuestion.includes('quem voce') || 
        lowerQuestion === 'quem é você' || lowerQuestion === 'quem voce' ||
        lowerQuestion.includes('você é') || lowerQuestion.includes('voce e')) {
      const variations = [
        "🦦 Oi! Que alegria te ver aqui! Eu sou o Guatá, sua capivara guia de turismo de Mato Grosso do Sul! Estou aqui para te ajudar a descobrir as maravilhas do nosso estado. Temos o Pantanal (maior santuário ecológico do mundo!), Bonito (águas cristalinas de outro planeta!), Campo Grande (nossa capital cheia de história!) e muito mais! O que você gostaria de saber?",
        "🦦 Nossa, que bom te ver por aqui! Sou o Guatá e estou super animado para te ajudar a conhecer Mato Grosso do Sul! 🚀 Temos destinos que vão te deixar de queixo caído! Me conta, o que mais te chama atenção? O Pantanal com seus jacarés? Bonito com suas águas cristalinas? Campo Grande com sua cultura?",
        "🦦 Olá, bem-vindo à nossa terra! Eu sou o Guatá, seu guia virtual de MS! 🌟 Posso te contar sobre destinos incríveis, eventos imperdíveis, comidas deliciosas e muito mais! Temos o Pantanal (maior área úmida do mundo!), Bonito (capital do ecoturismo!), Campo Grande (cidade morena cheia de charme!) e Corumbá (portal do Pantanal!). Por onde você quer começar nossa conversa?"
      ];
      return variations[Math.floor(Math.random() * variations.length)];
    }
    
    // Detectar perguntas específicas sobre aquário PRIMEIRO
    if (lowerQuestion.includes('aquário') && (lowerQuestion.includes('água doce') || lowerQuestion.includes('agua doce') || lowerQuestion.includes('maior') || lowerQuestion.includes('maior'))) {
      return this.formatAquarioResponse(results, question);
    }
    
    // Detectar perguntas específicas sobre aquário PRIMEIRO
    if ((lowerQuestion.includes('aquário') || lowerQuestion.includes('aquario')) && 
        (lowerQuestion.includes('água doce') || lowerQuestion.includes('agua doce') || 
         lowerQuestion.includes('maior') || lowerQuestion.includes('maior'))) {
      return this.formatAquarioResponse(results, question);
    }
    
    // Detectar roteiros/itinerários
    if (lowerQuestion.includes('roteiro') || lowerQuestion.includes('itinerário') || lowerQuestion.includes('dias') || lowerQuestion.includes('moto') || lowerQuestion.includes('viagem') || lowerQuestion.includes('montar')) {
      return this.formatItineraryResponse(results[0]?.snippet || '', results[0]?.title || '', question);
    }
    
    if (lowerQuestion.includes('campo grande') && (lowerQuestion.includes('fazer') || lowerQuestion.includes('visitar'))) {
      return this.formatCampoGrandeResponse(results);
    }
    
    if (lowerQuestion.includes('bonito') && (lowerQuestion.includes('fazer') || lowerQuestion.includes('visitar'))) {
      return this.formatBonitoResponse(results);
    }
    
    // Detectar restaurantes, comida e gastronomia (ANTES de hotéis)
    if (lowerQuestion.includes('restaurante') || lowerQuestion.includes('comer') || 
        lowerQuestion.includes('gastronomia') || lowerQuestion.includes('comida') ||
        lowerQuestion.includes('onde comer') || lowerQuestion.includes('melhor restaurante') ||
        lowerQuestion.includes('restaurantes')) {
      return this.formatRestaurantResponse(results, question);
    }
    
    if (lowerQuestion.includes('hotel') || lowerQuestion.includes('hospedagem')) {
      return this.formatHotelResponse(results);
    }
    
    if (lowerQuestion.includes('evento') || lowerQuestion.includes('festa')) {
      return this.formatEventResponse(results);
    }
    
    // Detectar perguntas sobre guias de turismo, passeios, tours
    if (lowerQuestion.includes('guia') || lowerQuestion.includes('tour') || 
        lowerQuestion.includes('passeio') || lowerQuestion.includes('atração') ||
        lowerQuestion.includes('ponto turístico') || lowerQuestion.includes('ponto turistico') ||
        lowerQuestion.includes('recomenda') && (lowerQuestion.includes('guia') || lowerQuestion.includes('tour'))) {
      return this.formatTourismGuideResponse(results, question);
    }
    
    if (lowerQuestion.includes('rota bioceânica') || lowerQuestion.includes('rota bioceanica') || lowerQuestion.includes('bioceanica')) {
      return this.formatRotaBioceanicaResponse(results);
    }
    
    if (lowerQuestion.includes('pantanal')) {
      return this.formatPantanalResponse(results);
    }
    
    // Formatação geral
    return this.formatGeneralResponse(results);
  }

  /**
   * Formata resposta específica para Campo Grande
   */
  private formatCampoGrandeResponse(results: any[]): string {
    let response = "🦦 Que pergunta incrível! Campo Grande é a capital de Mato Grosso do Sul, conhecida como a 'Cidade Morena' por sua terra avermelhada! É uma cidade que vai te surpreender com sua mistura única de urbanização e natureza! 😊\n\n";
    
    response += "🌳 **Parques que vão te encantar:**\n";
    response += "• **Parque das Nações Indígenas** - onde você sente a energia da nossa cultura! É um lugar mágico! ✨\n";
    response += "• **Parque Horto Florestal** - um pedacinho da Amazônia no coração da cidade! 🌿\n";
    response += "• **Orla Morena** - perfeita para um passeio romântico ou uma corrida matinal! 💕\n\n";
    
    response += "🏛️ **E tem o Bioparque Pantanal!** É o maior aquário de água doce do mundo! Você vai ver peixes do Pantanal, da Amazônia, de rios de todos os continentes... É uma viagem pelo mundo subaquático sem sair da cidade! 🐠\n\n";
    
    response += "🎯 Principais atrações:\n";
    response += "• Feira Central - é um espetáculo à parte! Comida boa, artesanato, música... É a alma da cidade!\n";
    response += "• Praça Ary Coelho - o coração pulsante de Campo Grande\n";
    response += "• Orla Morena - perfeita para ver o pôr do sol\n\n";
    
    response += "Quer conhecer nossa cidade? Posso te dar dicas específicas de onde comer, onde ficar, o que fazer em cada bairro... É só me falar o que mais te interessa!";
    return response;
  }

  /**
   * Formata resposta específica para Bonito
   */
  private formatBonitoResponse(results: any[]): string {
    let response = "🌊 **Bonito - Capital do Ecoturismo**\n\n";
    response += "Bonito é um destino único no mundo! Aqui estão as principais atrações:\n\n";
    
    response += "🏞️ **Principais Atrações:**\n";
    response += "• Rio Sucuri - flutuação em águas cristalinas\n";
    response += "• Gruta do Lago Azul - lago subterrâneo incrível\n";
    response += "• Gruta da Anhumas - aventura única\n";
    response += "• Buraco das Araras - observação de aves\n";
    response += "• Rio da Prata - flutuação e mergulho\n\n";
    
    response += "🎯 Dicas do Guatá:\n";
    response += "• Reserve com antecedência - é muito procurado!\n";
    response += "• Leve protetor solar e repelente\n";
    response += "• Aproveite a gastronomia local\n\n";
    
    response += "💡 *Informações atualizadas em tempo real*";
    return response;
  }

  /**
   * Formata resposta para hotéis
   */
  private formatHotelResponse(results: any[]): string {
    let response = "🦦 Que alegria te ajudar com hospedagem! 🏨\n\n";
    
    // Extrair informações principais dos resultados da pesquisa web
    const mainInfo = this.extractMainInformation(results);
    
    if (mainInfo) {
      response += mainInfo;
    } else {
      // Formatação conversacional para hotéis - SEM dados falsos
      response += "Sobre hospedagem em Mato Grosso do Sul, posso te dar algumas orientações gerais baseadas no que sei:\n\n";
      response += "🏨 Tipos de hospedagem em MS:\n";
      response += "• Hotéis urbanos em Campo Grande\n";
      response += "• Pousadas ecológicas em Bonito\n";
      response += "• Fazendas e pousadas no Pantanal\n";
      response += "• Hospedagem rural em outras cidades\n\n";
      response += "💡 Dicas importantes:\n";
      response += "• Reserve com antecedência, especialmente em alta temporada\n";
      response += "• Verifique se aceita pets, se necessário\n";
      response += "• Considere a localização em relação aos passeios\n";
      response += "• Leia avaliações de outros viajantes\n\n";
      response += "⚠️ **Importante:** Para informações específicas sobre hotéis, preços e disponibilidade, recomendo consultar sites especializados como Booking.com, Airbnb ou contatar diretamente as pousadas e hotéis.\n\n";
      response += "Posso te ajudar com informações sobre destinos e atrações em MS?";
    }
    
    return response;
  }

  /**
   * Formata resposta para restaurantes
   */
  private formatRestaurantResponse(results: any[], question: string): string {
    let response = "🦦 Que alegria te ajudar com gastronomia! 🍽️\n\n";
    
    const lowerQuestion = question.toLowerCase();
    const hasCity = lowerQuestion.includes('campo grande') || lowerQuestion.includes('bonito') || 
                    lowerQuestion.includes('corumbá') || lowerQuestion.includes('corumba') ||
                    lowerQuestion.includes('dourados');
    
    // Extrair informações principais dos resultados da pesquisa web
    const mainInfo = this.extractMainInformation(results);
    
    if (mainInfo && results.length > 0) {
      // Usar informações da pesquisa web
      response += mainInfo;
      
      // Adicionar informações específicas dos resultados
      if (results.length > 0) {
        response += "\n\n🍽️ **Recomendações encontradas:**\n\n";
        
        results.slice(0, 5).forEach((result, index) => {
          const title = result.title || '';
          const snippet = result.snippet || result.description || '';
          
          // Extrair nome do restaurante do título ou snippet
          let restaurantName = title;
          if (title.includes(' - ')) {
            restaurantName = title.split(' - ')[0];
          } else if (title.includes('|')) {
            restaurantName = title.split('|')[0];
          }
          
          response += `${index + 1}. ${restaurantName}\n`;
          
          // Extrair informações do snippet
          if (snippet.length > 50) {
            const cleanSnippet = snippet.substring(0, 200).replace(/\.\.\./g, '');
            response += `   ${cleanSnippet}...\n`;
          }
          
          if (result.url) {
            response += `   🔗 [Saiba mais](${result.url})\n`;
          }
          response += `\n`;
        });
      }
    } else {
      // Formatação conversacional para restaurantes baseada em conhecimento local
      if (hasCity) {
        const city = lowerQuestion.includes('campo grande') ? 'Campo Grande' :
                     lowerQuestion.includes('bonito') ? 'Bonito' :
                     lowerQuestion.includes('corumbá') || lowerQuestion.includes('corumba') ? 'Corumbá' :
                     lowerQuestion.includes('dourados') ? 'Dourados' : 'Mato Grosso do Sul';
        
        response += `Sobre gastronomia em ${city}, posso te dar algumas orientações:\n\n`;
        
        if (city === 'Campo Grande') {
          response += "🍽️ **Gastronomia em Campo Grande:**\n";
          response += "• Feira Central - lugar imperdível para experimentar o sobá (prato típico único!)\n";
          response += "• Restaurantes de comida regional - pintado, pacu, churrasco pantaneiro\n";
          response += "• Gastronomia diversificada - desde comida japonesa até churrascarias\n";
          response += "• Praças de alimentação nos shoppings\n\n";
        } else if (city === 'Bonito') {
          response += "🍽️ **Gastronomia em Bonito:**\n";
          response += "• Restaurantes com foco em comida regional e peixes\n";
          response += "• Opções próximas aos atrativos turísticos\n";
          response += "• Gastronomia que combina com o ecoturismo\n\n";
        } else {
          response += "🍽️ **Gastronomia em MS:**\n";
          response += "• Comida regional única - sobá, chipa, churrasco pantaneiro\n";
          response += "• Peixes do Pantanal - pintado, pacu, dourado\n";
          response += "• Influências indígenas e paraguaias\n\n";
        }
      } else {
        response += "Sobre gastronomia em Mato Grosso do Sul, posso te dar algumas orientações:\n\n";
        response += "🍽️ **Gastronomia Sul-Mato-Grossense:**\n";
        response += "• Sobá - macarrão de origem japonesa, prato único de Campo Grande\n";
        response += "• Chipa - pão de queijo paraguaio\n";
        response += "• Peixes do Pantanal - pintado, pacu, dourado\n";
        response += "• Churrasco pantaneiro - carne bovina de qualidade\n";
        response += "• Sopa Paraguaia - torta salgada deliciosa\n";
        response += "• Tereré - bebida gelada tradicional\n\n";
      }
      
      response += "💡 **Dicas importantes:**\n";
      response += "• Experimente o sobá na Feira Central de Campo Grande\n";
      response += "• Prove os peixes do Pantanal quando visitar a região\n";
      response += "• Não deixe de experimentar a chipa e o tereré\n\n";
      
      if (!hasCity) {
        response += "Para recomendações específicas, me diga qual cidade você tem interesse! Campo Grande, Bonito, Corumbá ou outra?";
      } else {
        response += "⚠️ **Importante:** Para informações específicas sobre restaurantes, horários e preços, recomendo consultar sites especializados como TripAdvisor, Google Maps ou contatar diretamente os estabelecimentos.\n\n";
        response += "Posso te ajudar com outras informações sobre turismo em MS?";
      }
    }
    
    return response;
  }

  /**
   * Formata resposta para guias de turismo, tours e passeios
   */
  private formatTourismGuideResponse(results: any[], question: string): string {
    let response = "🦦 Que legal que você quer conhecer mais sobre turismo em MS! 🗺️\n\n";
    
    const lowerQuestion = question.toLowerCase();
    
    // Detectar se pergunta sobre guia específico
    if (lowerQuestion.includes('guia') && (lowerQuestion.includes('recomenda') || lowerQuestion.includes('qual'))) {
      response += "Sobre guias de turismo em Mato Grosso do Sul, posso te ajudar de várias formas:\n\n";
      response += "🦦 **Eu sou o Guatá!**\n";
      response += "Sou seu guia virtual inteligente de turismo de MS! Posso te ajudar com:\n";
      response += "• Informações sobre destinos e atrações\n";
      response += "• Roteiros personalizados\n";
      response += "• Recomendações de hospedagem, restaurantes e passeios\n";
      response += "• Dicas de viagem e melhores épocas para visitar\n";
      response += "• Informações atualizadas sobre eventos e atrações\n\n";
      
      if (results.length > 0) {
        response += "🌐 **Também encontrei estas informações na web:**\n\n";
        results.slice(0, 3).forEach((result, index) => {
          response += `${index + 1}. ${result.title || 'Informação sobre turismo'}\n`;
          if (result.snippet) {
            response += `   ${result.snippet.substring(0, 150)}...\n`;
          }
          if (result.url) {
            response += `   🔗 [Saiba mais](${result.url})\n`;
          }
          response += `\n`;
        });
      }
      
      response += "💡 Posso te ajudar a montar um roteiro personalizado! Me diga quantos dias você tem e quais cidades te interessam!";
      return response;
    }
    
    // Detectar se pergunta sobre passeios/tours
    if (lowerQuestion.includes('passeio') || lowerQuestion.includes('tour') || lowerQuestion.includes('atração')) {
      response += "Sobre passeios e atrações em Mato Grosso do Sul:\n\n";
      
      if (results.length > 0) {
        results.slice(0, 5).forEach((result, index) => {
          response += `${index + 1}. ${result.title || 'Atração turística'}\n`;
          if (result.snippet) {
            response += `   ${result.snippet.substring(0, 200)}...\n`;
          }
          if (result.url) {
            response += `   🔗 [Saiba mais](${result.url})\n`;
          }
          response += `\n`;
        });
      } else {
        response += "🏞️ **Principais tipos de passeios em MS:**\n";
        response += "• Ecoturismo em Bonito - flutuação, grutas, cachoeiras\n";
        response += "• Observação de animais no Pantanal\n";
        response += "• Turismo cultural em Campo Grande\n";
        response += "• Aventura e esportes aquáticos\n";
        response += "• Gastronomia e cultura regional\n\n";
        response += "Me diga qual cidade ou tipo de passeio te interessa mais!";
      }
      
      return response;
    }
    
    // Resposta genérica para outras perguntas de turismo
    response += "Posso te ajudar com informações sobre turismo em Mato Grosso do Sul!\n\n";
    
    if (results.length > 0) {
      response += "🌐 **Informações encontradas:**\n\n";
      results.slice(0, 3).forEach((result, index) => {
        response += `${index + 1}. ${result.title || 'Informação sobre turismo'}\n`;
        if (result.snippet) {
          response += `   ${result.snippet.substring(0, 150)}...\n`;
        }
        response += `\n`;
      });
    }
    
    response += "💡 O que você gostaria de saber especificamente? Destinos, hospedagem, gastronomia, eventos?";
    return response;
  }

  /**
   * Formata resposta para eventos
   */
  private formatEventResponse(results: any[]): string {
    let response = "🎉 **Eventos em Mato Grosso do Sul**\n\n";
    response += "MS tem uma agenda cultural rica! Aqui estão algumas opções:\n\n";
    
    results.slice(0, 3).forEach((result, index) => {
      response += `**${index + 1}. ${result.title}**\n`;
      if (result.snippet) {
        response += `${result.snippet.substring(0, 150)}...\n`;
      }
      if (result.url) {
        response += `🔗 [Saiba mais](${result.url})\n`;
      }
      response += `\n`;
    });
    
    response += "💡 *Informações atualizadas em tempo real*";
    return response;
  }

  /**
   * Formata resposta específica para Rota Bioceânica
   */
  private formatRotaBioceanicaResponse(results: any[]): string {
    let response = "🦦 A Rota Bioceânica é uma estrada de 2.396 quilômetros que vai conectar o Oceano Atlântico ao Pacífico, passando por Mato Grosso do Sul!\n\n";
    
    response += "🛣️ O que isso significa para nós:\n";
    response += "• Campo Grande será a porta de entrada principal no Brasil\n";
    response += "• Nossos produtos vão chegar ao mundo todo\n";
    response += "• Turistas de todos os cantos vão nos visitar\n";
    response += "• Desenvolvimento do comércio internacional\n\n";
    
    response += "🚀 E o melhor: você poderá viajar de carro até o Chile, passando pelo Pantanal, Paraguai, Argentina e chegando nas montanhas do Chile! É uma aventura épica!\n\n";
    
    response += "📅 A obra está em andamento e deve ser concluída nos próximos anos, transformando MS em um ponto estratégico continental.\n\n";
    
    response += "🎯 Quer saber mais sobre algum aspecto específico? Posso te contar sobre como isso vai mudar o turismo em MS, as cidades que vão se transformar, quando tudo isso vai acontecer, ou como você pode se preparar para essa revolução!";
    return response;
  }

  /**
   * Formata resposta específica para Pantanal
   */
  private formatPantanalResponse(results: any[]): string {
    let response = "🦦 O Pantanal é a maior área úmida do planeta, localizada em Mato Grosso do Sul! É o lugar mais mágico do mundo para observação da vida selvagem.\n\n";
    
    response += "🐊 O que você vai encontrar:\n";
    response += "• Jacarés tomando sol na beira da água (eles são super mansos!)\n";
    response += "• Capivaras nadando tranquilas (as maiores do mundo!)\n";
    response += "• Araras coloridas voando por todo lado\n";
    response += "• Se tiver sorte, uma onça-pintada (o rei do Pantanal!)\n";
    response += "• Pássaros de todos os tipos e cores\n\n";
    
    response += "📅 Melhor época para visitar: Entre maio e setembro, quando está mais seco. Nesse período você consegue andar pelos caminhos e ver os animais com mais facilidade.\n\n";
    
    response += "🎯 Onde começar sua aventura:\n";
    response += "• Corumbá é a porta de entrada clássica\n";
    response += "• Miranda tem pousadas incríveis\n";
    response += "• Aquidauana também é uma opção linda\n\n";
    
    response += "Dica quente do Guatá: Reserve com antecedência, porque todo mundo quer conhecer essa maravilha! E não esqueça o binóculo - você vai querer ver cada detalhe dessa natureza incrível!\n\n";
    
    response += "Está animado para essa aventura? Posso te ajudar a planejar tudo direitinho!";
    return response;
  }

  /**
   * Formata resposta com parceiros priorizados
   */
  private formatPartnersResponse(partnersResult: any, question: string): string {
    let response = "🦦 Que alegria! Encontrei nossos parceiros oficiais da plataforma Descubra Mato Grosso do Sul para você! 🤩\n\n";
    
    if (partnersResult.partnersFound && partnersResult.partnersFound.length > 0) {
      response += "🎯 Nossos parceiros oficiais (sempre damos preferência a eles!):\n\n";
      
      partnersResult.partnersFound.slice(0, 3).forEach((partner: any, index: number) => {
        response += `${index + 1}. ${partner.name}\n`;
        if (partner.city) {
          response += `📍 ${partner.city}\n`;
        }
        if (partner.segment) {
          response += `🏷️ ${partner.segment}\n`;
        }
        if (partner.description) {
          response += `💡 ${partner.description}\n`;
        }
        
        if (partner.contact_email) {
          response += `📧 ${partner.contact_email}\n`;
        }
        if (partner.contact_whatsapp) {
          response += `📱 WhatsApp: ${partner.contact_whatsapp}\n`;
        }
        if (partner.website_link) {
          response += `🌐 ${partner.website_link}\n`;
        }
        
        response += `\n`;
      });
      
      response += "✨ Estes são nossos parceiros oficiais da plataforma! Entre em contato e mencione que conheceu através do Guatá!\n";
    }
    
    return response;
  }

  /**
   * Formata resposta específica para perguntas sobre aquário
   */
  private formatAquarioResponse(results: any[], question: string): string {
    // Procurar informações sobre Bioparque Pantanal nos resultados
    const bioparqueResult = results.find(r => 
      (r.title?.toLowerCase().includes('bioparque') || r.snippet?.toLowerCase().includes('bioparque')) ||
      (r.title?.toLowerCase().includes('aquário') && (r.snippet?.toLowerCase().includes('água doce') || r.snippet?.toLowerCase().includes('agua doce')))
    );
    
    if (bioparqueResult) {
      const snippet = bioparqueResult.snippet || bioparqueResult.description || '';
      let response = "🦦 Que pergunta incrível! 🐠\n\n";
      response += "**O maior aquário de água doce do mundo é o Bioparque Pantanal, localizado em Campo Grande, Mato Grosso do Sul!**\n\n";
      
      if (snippet.length > 50) {
        // Extrair informações relevantes do snippet
        const relevantInfo = snippet.substring(0, 300);
        response += `${relevantInfo}...\n\n`;
      } else {
        response += "É um complexo impressionante com dezenove mil metros quadrados que abriga peixes de água doce de todos os continentes! Você vai ver espécies do Pantanal, da Amazônia, de rios da África, Ásia e muito mais! 🐟\n\n";
      }
      
      response += "📍 **Localização:** Campo Grande, MS\n";
      response += "🌐 É uma experiência única que você não pode perder quando visitar nossa capital!\n\n";
      response += "Quer saber mais sobre o Bioparque Pantanal ou sobre outras atrações de Campo Grande?";
      
      return response;
    }
    
    // Se não encontrou nos resultados, usar conhecimento local
    return "🦦 Que pergunta incrível! 🐠\n\n**O maior aquário de água doce do mundo é o Bioparque Pantanal, localizado em Campo Grande, Mato Grosso do Sul!**\n\nÉ um complexo impressionante com dezenove mil metros quadrados que abriga peixes de água doce de todos os continentes! Você vai ver espécies do Pantanal, da Amazônia, de rios da África, Ásia e muito mais! É uma experiência única que você não pode perder quando visitar nossa capital! 🌟\n\nQuer saber mais sobre o Bioparque Pantanal ou sobre outras atrações de Campo Grande?";
  }

  /**
   * Formatação geral para outras perguntas
   */
  private formatGeneralResponse(results: any[]): string {
    let response = "🦦 ";
    
    // Extrair informações principais dos resultados
    const mainInfo = this.extractMainInformation(results);
    
    if (mainInfo) {
      response += mainInfo;
    } else if (results.length > 0) {
      // Se temos resultados mas não conseguimos extrair info específica, usar o primeiro resultado de forma conversacional
      const firstResult = results[0];
      const snippet = firstResult.snippet || firstResult.description || '';
      const title = firstResult.title || '';
      
      if (snippet && snippet.length > 50) {
        // Usar o snippet de forma mais inteligente e conversacional
        const cleanSnippet = snippet.replace(/\.\.\./g, '').trim();
        response += `Que legal que você quer saber sobre isso! `;
        
        // Combinar informações dos primeiros resultados para resposta mais completa
        if (results.length > 1) {
          const secondSnippet = results[1]?.snippet || '';
          if (secondSnippet.length > 30) {
            response += `${cleanSnippet.substring(0, 250)}...\n\n`;
            response += `Além disso, ${secondSnippet.substring(0, 150)}...\n\n`;
          } else {
            response += `${cleanSnippet.substring(0, 350)}...\n\n`;
          }
        } else {
          response += `${cleanSnippet.substring(0, 350)}...\n\n`;
        }
        
        response += `Quer saber mais detalhes específicos? Posso te ajudar com outras informações sobre Mato Grosso do Sul! ✨`;
      } else if (title) {
        response += `Sobre ${title.toLowerCase()}, posso te contar que é uma informação interessante sobre nossa região. `;
        response += `Que detalhes específicos você gostaria de saber? Estou aqui para te ajudar! 🦦`;
      } else {
        response += "Com base nas informações que tenho, posso te ajudar com detalhes específicos sobre sua pergunta. ";
        response += "Que aspecto você gostaria de saber mais? Posso te dar informações mais detalhadas ou te ajudar com outras questões sobre Mato Grosso do Sul!";
      }
    } else {
      // NUNCA mostrar dados brutos - sempre transformar em resposta conversacional
      response += "Com base nas informações que tenho, posso te ajudar com detalhes específicos sobre sua pergunta. ";
      response += "Que aspecto você gostaria de saber mais? Posso te dar informações mais detalhadas ou te ajudar com outras questões sobre Mato Grosso do Sul!";
    }
    
    return response;
  }

  /**
   * Extrai informações principais dos resultados da pesquisa
   */
  private extractMainInformation(results: any[]): string {
    if (results.length === 0) return "";
    
    const firstResult = results[0];
    const snippet = firstResult.snippet || "";
    const title = firstResult.title || "";
    
    // Detectar perguntas sobre aquário PRIMEIRO
    if ((snippet.toLowerCase().includes('aquário') || snippet.toLowerCase().includes('aquario') || title.toLowerCase().includes('aquário') || title.toLowerCase().includes('aquario')) && 
        (snippet.toLowerCase().includes('água doce') || snippet.toLowerCase().includes('agua doce') || snippet.toLowerCase().includes('maior') || snippet.toLowerCase().includes('bioparque') || title.toLowerCase().includes('bioparque'))) {
      return `🦦 Que pergunta incrível! 🐠\n\n**O maior aquário de água doce do mundo é o Bioparque Pantanal, localizado em Campo Grande, Mato Grosso do Sul!**\n\n${snippet.substring(0, 300)}...\n\n📍 **Localização:** Campo Grande, MS\n🌐 É uma experiência única que você não pode perder quando visitar nossa capital!\n\nQuer saber mais sobre o Bioparque Pantanal ou sobre outras atrações de Campo Grande?`;
    }
    
    // Detectar se é sobre Porto Murtinho e Rota Bioceânica
    if (snippet.toLowerCase().includes('porto murtinho') && snippet.toLowerCase().includes('rota bioceânica')) {
      return `Sim! Porto Murtinho será sim uma das portas de entrada da Rota Bioceânica no Brasil. 

Porto Murtinho está se preparando para ser um hub logístico importante, com a Ponte Internacional da Rota Bioceânica já atingindo 75% de execução e prevista para ser entregue no segundo semestre de 2026.

A cidade está recebendo investimentos públicos, privados e internacionais para se tornar uma nova porta de entrada e saída para o comércio exterior brasileiro com o Pacífico. É uma transformação incrível para a região!`;
    }
    
    // Detectar perguntas específicas sobre Porto Murtinho como porta de entrada
    if (snippet.toLowerCase().includes('porto murtinho') || snippet.toLowerCase().includes('porta de entrada')) {
      return `Sim! Porto Murtinho será sim uma das portas de entrada da Rota Bioceânica no Brasil. A cidade está se preparando para ser um hub logístico importante, com a Ponte Internacional da Rota Bioceânica já atingindo 75% de execução e prevista para ser entregue no segundo semestre de 2026. É uma transformação incrível para a região!`;
    }
    
    // Detectar outras informações específicas sobre Rota Bioceânica
    if (snippet.toLowerCase().includes('ponte') && snippet.toLowerCase().includes('internacional')) {
      return `A Ponte Internacional da Rota Bioceânica está em construção e já atingiu 75% de execução! A previsão é de entrega no segundo semestre de 2026, transformando Porto Murtinho em uma porta de entrada estratégica para o comércio com o Pacífico.`;
    }
    
    // Detectar informações sobre eventos ou festivais
    if (snippet.toLowerCase().includes('evento') || snippet.toLowerCase().includes('festival') || snippet.toLowerCase().includes('festa')) {
      return `Sobre eventos em Mato Grosso do Sul: ${snippet.substring(0, 200)}... É sempre bom saber sobre as atividades culturais e festivais que movimentam nosso estado!`;
    }
    
    // Detectar informações sobre turismo
    if (snippet.toLowerCase().includes('turismo') || snippet.toLowerCase().includes('passeio') || snippet.toLowerCase().includes('atração')) {
      return `Sobre turismo em MS: ${snippet.substring(0, 200)}... Nossa região tem tantas opções incríveis para explorar!`;
    }
    
    // Detectar informações sobre gastronomia e restaurantes
    if (snippet.toLowerCase().includes('comida') || snippet.toLowerCase().includes('gastronomia') || 
        snippet.toLowerCase().includes('restaurante') || snippet.toLowerCase().includes('comer')) {
      // Extrair informações específicas de restaurantes
      const restaurantInfo = this.extractRestaurantInfo(snippet, title);
      if (restaurantInfo) {
        return restaurantInfo;
      }
      return `Sobre gastronomia em MS: ${snippet.substring(0, 200)}... A culinária sul-mato-grossense é uma verdadeira delícia!`;
    }
    
    // Detectar informações sobre guias de turismo, tours, passeios
    if (snippet.toLowerCase().includes('guia') || snippet.toLowerCase().includes('tour') || 
        snippet.toLowerCase().includes('passeio') || snippet.toLowerCase().includes('atração') ||
        snippet.toLowerCase().includes('ponto turístico') || snippet.toLowerCase().includes('ponto turistico')) {
      return `Sobre turismo em MS: ${snippet.substring(0, 250)}... Nossa região tem opções incríveis para explorar!`;
    }
    
    // Detectar perguntas sobre roteiros
    if (snippet.toLowerCase().includes('roteiro') || snippet.toLowerCase().includes('itinerário') || snippet.toLowerCase().includes('dias')) {
      return this.formatItineraryResponse(snippet, title);
    }
    
    // Detectar perguntas sobre distâncias e localização
    if (snippet.toLowerCase().includes('km') || snippet.toLowerCase().includes('distância') || snippet.toLowerCase().includes('distancia')) {
      return this.formatDistanceResponse(snippet, title);
    }
    
    // Formatação geral inteligente - sempre transformar em resposta conversacional
    let info = "";
    if (snippet && snippet.length > 50) {
      // Extrair informações úteis do snippet e transformar em resposta natural
      const cleanSnippet = snippet.replace(/\.\.\./g, '').substring(0, 200);
      
      // Transformar dados brutos em resposta conversacional
      if (cleanSnippet.includes('Municípios') || cleanSnippet.includes('Fronteira')) {
        info = `Sobre a região de fronteira, posso te contar que é uma área estratégica para o desenvolvimento do Mato Grosso do Sul. A localização geográfica é fundamental para o comércio e turismo.`;
      } else if (cleanSnippet.includes('km') || cleanSnippet.includes('distância')) {
        info = `A distância é um fator importante para planejar sua viagem. Posso te ajudar com informações mais específicas sobre o trajeto e sugestões de paradas.`;
      } else if (cleanSnippet.includes('Março') || cleanSnippet.includes('2015')) {
        info = `Essas são informações históricas importantes sobre a região. Posso te contar mais sobre como a área se desenvolveu ao longo dos anos.`;
      } else {
        // Resposta específica para Porto Murtinho e Rota Bioceânica
        if (cleanSnippet.toLowerCase().includes('porto murtinho') || cleanSnippet.toLowerCase().includes('rota bioceânica') || cleanSnippet.toLowerCase().includes('rota bioceanica')) {
          info = `Sim! Porto Murtinho será sim uma das portas de entrada da Rota Bioceânica no Brasil. A cidade está se preparando para ser um hub logístico importante, com a Ponte Internacional da Rota Bioceânica já atingindo 75% de execução e prevista para ser entregue no segundo semestre de 2026. É uma transformação incrível para a região!`;
        } else {
          // Resposta genérica inteligente - usar informações da pesquisa web
          info = `${cleanSnippet}... Com base nas informações encontradas, posso te ajudar com mais detalhes específicos sobre sua pergunta. O que você gostaria de saber mais?`;
        }
      }
    } else if (title) {
      info = `Sobre ${title.toLowerCase()}, encontrei informações relevantes sobre nossa região. Que detalhes específicos você gostaria de saber?`;
    } else {
      info = "Encontrei algumas informações relevantes sobre sua pergunta. Posso te ajudar com mais detalhes específicos!";
    }
    
    return info;
  }

  /**
   * Formata resposta para roteiros/itinerários
   */
  private formatItineraryResponse(snippet: string, title: string, question?: string): string {
    const lowerQuestion = (question || '').toLowerCase();
    const lowerSnippet = snippet.toLowerCase();
    
    // Detectar roteiro de Campo Grande (com ou sem dias específicos)
    if ((lowerQuestion.includes('campo grande') || lowerSnippet.includes('campo grande')) && 
        (lowerQuestion.includes('roteiro') || lowerQuestion.includes('itinerário') || lowerQuestion.includes('dias'))) {
      
      // Detectar número de dias
      const daysMatch = lowerQuestion.match(/(\d+)\s*dias?/);
      const numDays = daysMatch ? parseInt(daysMatch[1]) : 3;
      
      if (numDays === 3) {
        return `🦦 Que alegria te ajudar a montar um roteiro de 3 dias em Campo Grande! É uma experiência incrível! 🚀

📅 ROTEIRO DE 3 DIAS EM CAMPO GRANDE:

DIA 1 - Conhecendo a Cidade Morena
• Manhã: Bioparque Pantanal - Maior aquário de água doce do mundo! É impressionante ver peixes de todos os continentes! 🐠
• Tarde: Parque das Nações Indígenas - Cultura e natureza juntas! Um lugar mágico! ✨
• Noite: Feira Central - Comida boa, artesanato, música ao vivo! É a alma da cidade! 🎵

DIA 2 - Natureza e Cultura
• Manhã: Parque Horto Florestal - Um pedacinho da Amazônia no coração da cidade! 🌿
• Tarde: Orla Morena - Perfeita para ver o pôr do sol e relaxar! 🌅
• Noite: Praça Ary Coelho - O coração pulsante de Campo Grande! 💓

DIA 3 - Experiências Únicas
• Manhã: Mercadão Municipal - Comida típica e artesanato local! 🛍️
• Tarde: Memorial da Cultura Indígena - Conheça a história dos povos originários! 🏛️
• Noite: Aproveite a gastronomia local - Sobá, chipa, churrasco pantaneiro! 🍽️

🎯 Dicas do Guatá:
• Reserve ingressos do Bioparque com antecedência
• Use protetor solar - o sol de MS é forte!
• Experimente o sobá - prato típico único!
• Leve câmera - lugares lindos para fotografar!

Quer que eu detalhe algum dia específico ou te ajude com hospedagem e restaurantes? Estou aqui para te ajudar! 🦦`;
      } else if (numDays === 2) {
        return `🦦 Que legal! Um roteiro de 2 dias em Campo Grande é perfeito para conhecer o essencial! 

📅 ROTEIRO DE 2 DIAS EM CAMPO GRANDE:

DIA 1 - Principais Atrações
• Manhã: Bioparque Pantanal - Imperdível! 🐠
• Tarde: Parque das Nações Indígenas + Horto Florestal
• Noite: Feira Central - Experiência única! 🎵

DIA 2 - Cultura e Natureza
• Manhã: Orla Morena - Pôr do sol incrível! 🌅
• Tarde: Mercadão Municipal + Praça Ary Coelho
• Noite: Gastronomia local - Sobá, chipa! 🍽️

Quer mais detalhes sobre algum lugar específico? 🦦`;
      } else if (numDays >= 4) {
        return `🦦 Nossa, que roteiro incrível! Com ${numDays} dias você vai conhecer Campo Grande profundamente! 

📅 **ROTEIRO DE ${numDays} DIAS EM CAMPO GRANDE:**

**DIA 1-2:** Principais atrações (Bioparque, Parques, Feira Central)
**DIA 3:** Cultura e história (Museus, Memorial Indígena)
**DIA 4+:** Experiências únicas (Gastronomia, Artesanato, Vida noturna)

Posso te montar um roteiro detalhado dia a dia! O que mais te interessa? 🦦`;
      }
    }
    
    // Detectar se é sobre Campo Grande para Porto Murtinho
    if (lowerSnippet.includes('campo grande') && lowerSnippet.includes('porto murtinho')) {
      return `Que aventura incrível! Um roteiro de Campo Grande para Porto Murtinho de moto é uma experiência única!

🛣️ **Roteiro de 3 dias Campo Grande → Porto Murtinho:**

**Dia 1 - Campo Grande para Aquidauana (120km)**
• Saída cedo de Campo Grande
• Parada em Aquidauana para conhecer a cidade histórica
• Hospedagem em Aquidauana

**Dia 2 - Aquidauana para Miranda (80km)**
• Pela manhã, continue até Miranda
• Conheça a cultura pantaneira
• Pernoite em Miranda

**Dia 3 - Miranda para Porto Murtinho (200km)**
• Último trecho até Porto Murtinho
• Chegada na fronteira com o Paraguai
• Conheça a Ponte Internacional da Rota Bioceânica

🎯 **Dicas importantes:**
• Distância total: ~400km
• Estradas em bom estado
• Leve água e protetor solar
• Reserve hospedagem com antecedência

Quer que eu detalhe algum dia específico ou te ajude com outras informações sobre o roteiro?`;
    }
    
    return `🦦 Que legal que você quer montar um roteiro! Posso te ajudar a criar um roteiro personalizado para Mato Grosso do Sul! 

Me conta:
• Quantos dias você tem disponível?
• Quais cidades te interessam mais? (Campo Grande, Bonito, Pantanal, etc.)
• Que tipo de experiência você busca? (Aventura, cultura, natureza, gastronomia)

Com essas informações, vou montar um roteiro perfeito para você! 🚀`;
  }

  /**
   * Extrai informações específicas de restaurantes dos resultados da pesquisa
   */
  private extractRestaurantInfo(snippet: string, title: string): string | null {
    const lowerSnippet = snippet.toLowerCase();
    const lowerTitle = title.toLowerCase();
    
    // Detectar se é sobre restaurantes específicos
    if (lowerSnippet.includes('restaurante') || lowerTitle.includes('restaurante')) {
      // Extrair nome do restaurante
      let restaurantName = '';
      if (lowerTitle.includes('restaurante')) {
        restaurantName = title.split(/restaurante|Restaurante/i)[0].trim();
      }
      
      // Extrair informações relevantes
      let info = '';
      if (restaurantName) {
        info = `Sobre ${restaurantName}: `;
      }
      
      // Extrair tipo de comida, localização, avaliações
      if (lowerSnippet.includes('campo grande')) {
        info += `Restaurante em Campo Grande. `;
      } else if (lowerSnippet.includes('bonito')) {
        info += `Restaurante em Bonito. `;
      } else if (lowerSnippet.includes('corumbá') || lowerSnippet.includes('corumba')) {
        info += `Restaurante em Corumbá. `;
      }
      
      // Adicionar informações do snippet
      const cleanSnippet = snippet.substring(0, 250).replace(/\.\.\./g, '');
      info += cleanSnippet;
      
      return info;
    }
    
    return null;
  }

  /**
   * Formata resposta para distâncias e localização
   */
  private formatDistanceResponse(snippet: string, title: string): string {
    // Extrair informações de distância
    const distanceMatch = snippet.match(/(\d+)\s*km/);
    if (distanceMatch) {
      const distance = distanceMatch[1];
      return `A distância é de aproximadamente ${distance}km. Essa é uma informação importante para planejar sua viagem! Posso te ajudar com mais detalhes sobre o trajeto ou sugestões de paradas.`;
    }
    
    return `Sobre distâncias em MS: ${snippet.substring(0, 200)}... Posso te ajudar com informações mais específicas sobre trajetos!`;
  }

  /**
   * Gera resposta inteligente usando conhecimento local
   */
  private generateIntelligentLocalResponse(question: string): string {
    const lowerQuestion = question.toLowerCase();
    
    // Detectar tipo de pergunta e responder de forma natural e específica
    if (lowerQuestion.includes('bonito')) {
      return `Bonito é a capital do ecoturismo no Brasil! 🌊\n\nCom suas águas cristalinas que parecem de outro planeta, Bonito é um destino único no mundo. Principais atrativos:\n\n• Rio Sucuri - Flutuação em águas cristalinas\n• Gruta do Lago Azul - Um lago subterrâneo de tirar o fôlego\n• Buraco das Araras - Observação de araras em seu habitat natural\n• Rio da Prata - Mergulho em águas transparentes\n• Gruta da Anhumas - Aventura subterrânea incrível\n\nCada lugar tem sua própria magia! Quer saber mais sobre algum passeio específico?`;
    }
    
    if (lowerQuestion.includes('pantanal')) {
      return `O Pantanal é o maior santuário ecológico do mundo! 🐊\n\nÉ a maior área úmida contínua do planeta, um verdadeiro paraíso para quem ama a natureza. Aqui você vai ver:\n\n• Jacarés - Centenas deles em seu habitat natural\n• Capivaras - Os maiores roedores do mundo\n• Aves - Mais de 650 espécies diferentes\n• Ariranhas - As lontras gigantes do Pantanal\n• Onças-pintadas - Com sorte, você pode avistar uma!\n\nA melhor época é de maio a setembro (estação seca) para observação da vida selvagem. É uma experiência que vai te marcar para sempre!`;
    }
    
    if (lowerQuestion.includes('campo grande')) {
      return `Campo Grande é a capital de Mato Grosso do Sul, conhecida como a 'Cidade Morena'! 😊\n\nÉ uma cidade que combina urbanização com natureza de forma única! Principais atrações:\n\n• Bioparque Pantanal - Maior aquário de água doce do mundo!\n• Parque das Nações Indígenas - Onde você sente a energia da nossa cultura\n• Parque Horto Florestal - Um pedacinho da Amazônia no coração da cidade\n• Feira Central - Comida boa, artesanato, música... É a alma da cidade!\n• Orla Morena - Perfeita para ver o pôr do sol\n\nÉ uma cidade que vai te surpreender! O que mais te interessa conhecer?`;
    }
    
    if (lowerQuestion.includes('hotel') || lowerQuestion.includes('hospedagem')) {
      return `Mato Grosso do Sul oferece opções incríveis de hospedagem! 🏨\n\nEm Bonito: Pousadas ecológicas próximas aos atrativos naturais\nNo Pantanal: Fazendas e pousadas tradicionais pantaneiras\nEm Campo Grande: Hotéis urbanos com toda a comodidade\nEm Corumbá: Hospedagem com vista para o Pantanal\n\nCada destino tem seu charme especial! Posso te ajudar a escolher a melhor opção para sua viagem!`;
    }
    
    if (lowerQuestion.includes('comida') || lowerQuestion.includes('gastronomia') || lowerQuestion.includes('restaurante')) {
      return `A gastronomia de Mato Grosso do Sul é uma verdadeira festa para o paladar! 🍽️\n\nPratos típicos imperdíveis:\n• Sobá - Macarrão japonês com toque sul-mato-grossense\n• Chipa - Pão de queijo paraguaio\n• Espetinho - Churrasco no espeto\n• Churrasco Pantaneiro - Carne bovina de qualidade\n• Sopa Paraguaia - Deliciosa torta salgada\n• Tereré - Bebida gelada tradicional\n\nCada prato conta uma história da nossa cultura! Quer saber onde encontrar esses sabores?`;
    }
    
    if (lowerQuestion.includes('roteiro') || lowerQuestion.includes('itinerário') || lowerQuestion.includes('dias')) {
      return `Posso te ajudar a montar roteiros incríveis por Mato Grosso do Sul! 🗺️\n\nRoteiros populares:\n• 3 dias em Bonito - Foco no ecoturismo\n• 5 dias Pantanal - Imersão na natureza\n• 7 dias MS completo - Bonito + Pantanal + Campo Grande\n• Rota Bioceânica - Campo Grande até Porto Murtinho\n\nCada roteiro é uma aventura única! Me conta quantos dias você tem e o que mais te interessa, que eu te ajudo a montar o roteiro perfeito!`;
    }
    
    // Resposta geral natural
    return `Que alegria te ver aqui! Eu sou o Guatá, sua capivara guia de Mato Grosso do Sul! 😊\n\nNosso estado é um verdadeiro paraíso com destinos únicos no mundo:\n\n• Pantanal - Maior área úmida do mundo\n• Bonito - Águas cristalinas de outro planeta\n• Campo Grande - Nossa capital cheia de charme\n• Corumbá - Portal do Pantanal\n• Rota Bioceânica - Conexão com o Pacífico\n\nO que você gostaria de descobrir? Posso te contar sobre destinos, hospedagem, gastronomia, roteiros e muito mais!`;
  }

  /**
   * Gera resposta com conhecimento local
   */
  private generateLocalKnowledgeResponse(question: string): string {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('bonito')) {
      return `Bonito é mundialmente reconhecida como a Capital do Ecoturismo! 🌊 É um lugar mágico com águas cristalinas que parecem de outro mundo. As principais atrações são o Rio Sucuri, Gruta do Lago Azul, Gruta da Anhumas, Buraco das Araras e Rio da Prata. Cada lugar tem sua própria magia! Quer saber mais sobre algum passeio específico?`;
    }
    
    if (lowerQuestion.includes('pantanal')) {
      return `O Pantanal é um santuário ecológico, a maior área úmida contínua do planeta! 🐊 É um lugar de biodiversidade incrível, perfeito para quem ama a natureza e quer ver de perto jacarés, capivaras, aves e, com sorte, até onças-pintadas. A melhor época para visitar é na estação seca (maio a setembro) para observação da vida selvagem.`;
    }
    
    if (lowerQuestion.includes('campo grande')) {
      return `Campo Grande é nossa capital, conhecida como "Cidade Morena"! 🏙️ É um lugar cheio de história e cultura. As principais atrações são a Feira Central (que é um espetáculo à parte), Parque das Nações Indígenas, Memorial da Cultura Indígena, Mercadão Municipal e Praça do Rádio. Tem muita coisa legal para fazer!`;
    }
    
    return `Que pergunta interessante! 🤔 Posso te ajudar com informações sobre destinos, gastronomia, eventos e cultura de Mato Grosso do Sul. Temos lugares incríveis como Bonito, Pantanal, Campo Grande, Corumbá e muito mais. Sobre o que você gostaria de saber mais especificamente?`;
  }

  /**
   * Adiciona personalidade e contexto à resposta
   */
  private addPersonalityAndContext(answer: string, question: string, tourismData: TourismData): string {
    // Adicionar contexto baseado nos dados de turismo
    if (tourismData.hotels && tourismData.hotels.length > 0) {
      answer += `\n\n🦦 *Espero que essas opções te ajudem a encontrar o lugar perfeito para ficar!*`;
    }
    
    if (tourismData.events && tourismData.events.length > 0) {
      answer += `\n\n🎉 *Que legal que você se interessa por eventos! MS tem sempre algo incrível acontecendo.*`;
    }
    
    if (tourismData.restaurants && tourismData.restaurants.length > 0) {
      answer += `\n\n🍽️ *Nossa culinária é uma delícia! Cada prato tem uma história fascinante por trás.*`;
    }
    
    return answer;
  }

  /**
   * Determina estado emocional baseado na pergunta
   */
  private determineEmotionalState(question: string): string {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('obrigado') || lowerQuestion.includes('valeu')) {
      return 'grateful';
    }
    
    if (lowerQuestion.includes('urgente') || lowerQuestion.includes('ajuda')) {
      return 'concerned';
    }
    
    if (lowerQuestion.includes('incrível') || lowerQuestion.includes('maravilhoso')) {
      return 'excited';
    }
    
    return 'helpful';
  }

  /**
   * Gera perguntas de seguimento
   */
  private generateFollowUpQuestions(question: string, tourismData: TourismData): string[] {
    const questions: string[] = [];
    
    if (tourismData.hotels && tourismData.hotels.length > 0) {
      questions.push("Quer saber mais sobre algum hotel específico?");
      questions.push("Posso te ajudar com outras opções de hospedagem?");
    }
    
    if (tourismData.events && tourismData.events.length > 0) {
      questions.push("Interessado em outros eventos da região?");
      questions.push("Quer saber sobre eventos em outras cidades?");
    }
    
    if (tourismData.restaurants && tourismData.restaurants.length > 0) {
      questions.push("Quer conhecer outros restaurantes da região?");
      questions.push("Interessado na culinária típica de MS?");
    }
    
    if (questions.length === 0) {
      questions.push("Posso te ajudar com outras informações?");
      questions.push("Tem outras dúvidas sobre MS?");
    }
    
    return questions.slice(0, 3);
  }

  /**
   * Gera insights de aprendizado
   */
  private generateLearningInsights(question: string, webSearchResponse: RealWebSearchResponse): any {
    return {
      questionType: this.detectQuestionCategory(question),
      userIntent: 'information_seeking',
      behaviorPattern: 'explorer',
      conversationFlow: 'natural',
      predictiveAccuracy: webSearchResponse.usedRealSearch ? 0.9 : 0.7,
      proactiveSuggestions: 0,
      searchEffectiveness: webSearchResponse.usedRealSearch ? 'high' : 'medium',
      dataQuality: webSearchResponse.results.length > 0 ? 'good' : 'limited'
    };
  }

  /**
   * Gera melhorias adaptativas
   */
  private generateAdaptiveImprovements(webSearchResponse: RealWebSearchResponse): string[] {
    const improvements: string[] = [];
    
    // Só sugerir melhorias se realmente houver necessidade
    if (!webSearchResponse.usedRealSearch && webSearchResponse.results.length === 0) {
      improvements.push('Configurar APIs de pesquisa web para dados mais atualizados');
    }
    
    if (webSearchResponse.results.length === 0 && !webSearchResponse.usedRealSearch) {
      improvements.push('Expandir base de conhecimento local');
    }
    
    // Remover melhorias que são sempre verdadeiras (não são mais "melhorias", são características do sistema)
    // improvements.push('Sistema de verificação de informações implementado');
    // improvements.push('Pesquisa web real integrada');
    
    return improvements;
  }

  /**
   * Gera atualizações de memória
   */
  private generateMemoryUpdates(question: string, webSearchResponse: RealWebSearchResponse): any[] {
    return [
      {
        type: 'search_preference',
        content: question,
        confidence: 0.8,
        timestamp: new Date()
      },
      {
        type: 'search_method',
        content: webSearchResponse.searchMethod,
        confidence: 0.9,
        timestamp: new Date()
      }
    ];
  }
}

// Exportar instância única
export const guataIntelligentTourismService = new GuataIntelligentTourismService();

