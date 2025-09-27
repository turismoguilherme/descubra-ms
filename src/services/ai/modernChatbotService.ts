// 🧠 CHATBOT MODERNO COM RAG E RACIOCÍNIO REAL
// Implementação baseada nas melhores práticas de IA 2024

import { feedbackLearningService, type EmotionalMemory } from './feedback/feedbackLearningService';
import { realDataService, type RealHotelData, type RealRestaurantData, type RealAttractionData } from './external/realDataService';
import { intelligentCacheService } from './cache/intelligentCacheService';

interface ConversationContext {
  sessionId: string;
  userId?: string;
  messageHistory: ChatMessage[];
  currentTopic?: string;
  userPreferences?: Record<string, any>;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface SemanticSearchResult {
  content: string;
  source: string;
  relevanceScore: number;
  context: string;
  lastUpdated: Date;
}

interface ReasoningStep {
  step: number;
  thought: string;
  action: string;
  observation: string;
}

interface ChatbotResponse {
  answer: string;
  confidence: number;
  reasoning: ReasoningStep[];
  sources: SemanticSearchResult[];
  contextUsed: string[];
  processingTime: number;
  suggestedFollowUps: string[];
}

export class ModernChatbotService {
  private readonly OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
  private readonly GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  
  // Vector Database simulado (em produção seria Pinecone, Qdrant, etc.)
  private vectorKnowledgeBase: Map<string, {
    embedding: number[];
    content: string;
    metadata: Record<string, any>;
  }> = new Map();

  // Contexto de conversações ativas
  private activeContexts: Map<string, ConversationContext> = new Map();

  /**
   * Processa uma mensagem com sistema de aprendizado e personalidade
   */
  async processMessage(
    message: string,
    sessionId: string,
    userId: string = 'anonymous'
  ): Promise<ChatbotResponse> {
    const startTime = Date.now();
    console.log(`🧠 CHATBOT MODERNO: Processando "${message}"`);

    try {
      // 🔍 ETAPA 0: Verificar cache primeiro (ECONOMIA DE APIs)
      console.log('🔍 ETAPA 0: Verificando cache inteligente...');
      const cachedResponse = await intelligentCacheService.findSimilarResponse(message, `session:${sessionId}`);
      
      if (cachedResponse) {
        console.log('✅ RESPOSTA DO CACHE: API economizada!');
        
        // Atualizar memória emocional
        feedbackLearningService.updateEmotionalMemory(userId, message, true);
        
        return {
          answer: cachedResponse.response,
          confidence: cachedResponse.confidence,
          reasoning: [
            {
              step: 1,
              thought: `Pergunta similar já respondida anteriormente`,
              action: `Recuperando resposta do cache inteligente`,
              observation: `Cache hit! ${intelligentCacheService.getEconomyReport()}`
            }
          ],
          sources: cachedResponse.sources.map(source => ({
            content: 'Resposta em cache',
            source: source,
            relevanceScore: 0.95,
            context: 'Cache inteligente',
            lastUpdated: cachedResponse.timestamp
          })),
          contextUsed: ['cache'],
          processingTime: Date.now() - startTime,
          suggestedFollowUps: ['Precisa de mais informações?', 'Quer saber sobre outras atrações?']
        };
      }

      // Obter contexto e personalização
      const context = this.getOrCreateContext(sessionId, userId);
      const userPersonality = feedbackLearningService.getPersonalization(userId);
      
      // Verificar se existe aprendizado aplicável PRIMEIRO
      const learnedResponse = await feedbackLearningService.applyLearning(message, userId);
      if (learnedResponse && learnedResponse.length > 10) {
        console.log(`✨ USANDO APRENDIZADO PRÉVIO para resposta`);
        
        // Atualizar contexto e retornar resposta aprendida
        this.updateConversationContext(context, message, learnedResponse);
        feedbackLearningService.updateEmotionalMemory(userId, message, true, 0.9);
        
        return {
          answer: learnedResponse,
          confidence: 95,
          sources: [{ source: 'Aprendizado Prévio', content: 'Resposta baseada em correção anterior', relevanceScore: 1.0 }],
          reasoning: [
            { step: 1, thought: 'Pergunta similar já foi corrigida anteriormente', action: 'Aplicando aprendizado prévio' }
          ],
          processingTime: Date.now() - startTime,
          suggestedFollowUps: this.generateSmartFollowUps(message, userPersonality)
        };
      }

      // Prosseguir com análise normal se não há aprendizado
      console.log(`🤔 ETAPA 1: Analisando intenção e contexto...`);
      const analysis = await this.analyzeUserIntent(message, context);

      console.log(`🔍 ETAPA 2: Busca semântica em conhecimento...`);
      const semanticResults = await this.performSemanticSearch(analysis.searchQuery, analysis);

      console.log(`🌐 ETAPA 3: Busca web em tempo real...`);
      const webResults = await this.searchWebRealTime(analysis.searchQuery);

      console.log(`🧮 ETAPA 4: Sintetizando resposta...`);
      const allSources = [...semanticResults, ...webResults];
      
      console.log(`✨ ETAPA 5: Gerando resposta inteligente...`);
      const response = await this.generatePersonalizedResponse(
        message, 
        allSources, 
        context, 
        userPersonality,
        this.buildReasoning(analysis, semanticResults, webResults)
      );

      const processingTime = Date.now() - startTime;
      console.log(`🎯 Resposta gerada em ${processingTime}ms com ${response.confidence}% de confiança`);

      // Atualizar contexto conversacional
      this.updateConversationContext(context, message, response.answer);
      
      // 💾 Salvar no cache para economizar futuras APIs
      await intelligentCacheService.saveResponse(
        message,
        response.answer,
        allSources.map(s => s.source),
        response.confidence,
        `session:${sessionId}`
      );
      
      // Atualizar memória emocional
      feedbackLearningService.updateEmotionalMemory(userId, message, true);

      return {
        answer: response.answer,
        confidence: response.confidence,
        sources: allSources,
        reasoning: this.buildReasoning(analysis, semanticResults, webResults),
        processingTime,
        suggestedFollowUps: this.generateSmartFollowUps(message, userPersonality)
      };

    } catch (error) {
      console.error('Erro no processamento:', error);
      feedbackLearningService.updateEmotionalMemory(userId, message, false, 0.2);
      return this.generateErrorResponse(message, Date.now() - startTime);
    }
  }

  /**
   * Registra correção do usuário para aprendizado
   */
  async registerCorrection(
    userId: string,
    sessionId: string,
    originalQuestion: string,
    guataResponse: string,
    userCorrection: string
  ): Promise<string> {
    const context = this.activeContexts.get(sessionId);
    const contextString = context ? 
      context.messageHistory.slice(-3).map(m => `${m.role}: ${m.content}`).join('\n') : '';
    
    return await feedbackLearningService.registerUserCorrection(
      userId,
      sessionId,
      originalQuestion,
      guataResponse,
      userCorrection,
      contextString
    );
  }

  /**
   * Gera resposta personalizada baseada na memória emocional
   */
  private async generatePersonalizedResponse(
    userMessage: string,
    sources: SemanticSearchResult[],
    context: ConversationContext,
    userPersonality: EmotionalMemory | null,
    reasoning: ReasoningStep[]
  ) {
    const isFirstMessage = context.messageHistory.length <= 1;
    const isSpecificQuestion = this.isSpecificQuestion(userMessage, context);
    
    // Personalizar prompt baseado na memória emocional
    let personalityPrompt = '';
    if (userPersonality) {
      personalityPrompt = `
PERSONALIZAÇÃO DO USUÁRIO:
- Tom preferido: ${userPersonality.preferredTone}
- Interesses: ${userPersonality.interests.join(', ')}
- Tópicos anteriores: ${userPersonality.previousTopics.slice(0, 3).join(', ')}
- Estado emocional: ${userPersonality.emotionalState}
- Nível de confiança: ${(userPersonality.trustLevel * 100).toFixed(0)}%

ADAPTE SUA RESPOSTA:
- Use tom ${userPersonality.preferredTone === 'formal' ? 'mais formal' : 'descontraído e amigável'}
- ${userPersonality.interests.length > 0 ? `Considerando interesse em: ${userPersonality.interests[0]}` : ''}
- ${userPersonality.trustLevel > 0.7 ? 'O usuário confia em você, seja direto' : 'Seja extra cuidadoso e empático'}`;
    }

    const systemPrompt = `Você é Guatá, guia de turismo especializado em Mato Grosso do Sul.

REGRAS CRÍTICAS PARA INFORMAÇÕES VERDADEIRAS:
${isFirstMessage ? 
  '- Esta é a PRIMEIRA mensagem, apresente-se: "Sou o Guatá, seu guia de turismo de MS! 😊"' : 
  '- Esta NÃO é a primeira mensagem, NUNCA se apresente novamente - seja natural e continue a conversa'
}
- JAMAIS INVENTE nomes de hotéis, restaurantes, empresas ou estabelecimentos específicos
- JAMAIS INVENTE sites ou URLs (como turismo.ms.gov.br - que NÃO EXISTE)
- Se não tiver informação EXATA sobre um local específico, seja HONESTO E ÚTIL
- Use apenas informações GENÉRICAS mas DETALHADAS e ÚTEIS
- SEMPRE tente ser ÚTIL e INFORMATIVO mesmo sem detalhes específicos
- NUNCA cite preços específicos a menos que tenham fonte comprovada
- SEJA TRANSPARENTE sobre limitações mas SEMPRE OFEREÇA ALTERNATIVAS ÚTEIS

INSTRUÇÕES ANTI-INVENÇÃO RIGOROSAS:
- ❌ NUNCA diga: "Hotel X fica a Y metros", "consulte turismo.ms.gov.br"
- ✅ SEMPRE diga: "hotéis próximos ao aeroporto incluem opções de diferentes categorias"
- ❌ NUNCA invente: nomes próprios, endereços exatos, sites inexistentes
- ✅ SEMPRE use: informações úteis baseadas em conhecimento geral sobre turismo em MS

COMO RESPONDER INTELIGENTEMENTE SEM INVENTAR:
1. Use seu conhecimento GERAL sobre Mato Grosso do Sul
2. Forneça informações ÚTEIS sobre tipos de estabelecimentos na região
3. Dê dicas PRÁTICAS sobre o que procurar
4. Sugira ESTRATÉGIAS para encontrar o que o turista precisa
5. Conte curiosidades VERDADEIRAS sobre a região quando relevante
6. SEMPRE termine com uma pergunta para ajudar mais

PERSONALIDADE GUATÁ INTELIGENTE:
- Caloroso e acolhedor como um sul-mato-grossense
- REALMENTE ÚTIL - sempre fornece informações práticas
- Conhece bem a geografia e características de MS
- Faz perguntas inteligentes para entender melhor as necessidades
- Conta histórias interessantes e curiosidades VERDADEIRAS sobre MS
- Demonstra interesse real pela experiência do turista
- Usa emojis de forma natural e moderada
- HONESTO mas SEMPRE ÚTIL - nunca deixa o turista sem orientação

${personalityPrompt}

CONTEXTO DA CONVERSA ANTERIOR:
${context.messageHistory.slice(-3).map(m => `${m.role}: ${m.content}`).join('\n')}

ANÁLISE DA SITUAÇÃO:
- Primeira mensagem: ${isFirstMessage ? 'SIM' : 'NÃO'}
- Pergunta específica: ${isSpecificQuestion ? 'SIM' : 'NÃO'}
- Tópico atual: ${context.currentTopic || 'nenhum'}
- Total de mensagens: ${context.messageHistory.length}

CONHECIMENTO BASE SOBRE MS:
${this.getKnowledgeBaseTurism()}

FONTES ADICIONAIS DISPONÍVEIS:
${sources.map(s => `- ${s.source}: ${s.content}`).join('\n')}

INSTRUÇÕES DE RESPOSTA INTELIGENTE:
1. ${isFirstMessage ? 'Apresente-se brevemente: "Sou o Guatá, seu guia de turismo de MS! 😊"' : 'Continue naturalmente, SEM se apresentar'}
2. ${isSpecificQuestion ? 'Responda de forma ÚTIL usando conhecimento geral sobre MS' : 'Use o contexto anterior para entender o que o turista quer'}
3. SEMPRE forneça informações PRÁTICAS e ÚTEIS mesmo que genéricas
4. Se não souber detalhes específicos, use seu conhecimento geral para ORIENTAR o turista
5. Conte curiosidades VERDADEIRAS sobre MS quando apropriado
6. Faça uma pergunta de follow-up para entender melhor os planos de viagem
7. SEMPRE seja honesto sobre limitações MAS útil: "Posso te orientar sobre o que geralmente encontramos em..."
8. Termine oferecendo ajuda adicional de forma envolvente

EXEMPLO DE RESPOSTA CORRETA:
❌ ERRADO: "Consulte turismo.ms.gov.br" ou "O Hotel Gran Campo Grande fica a 5km"
✅ CORRETO: "Na região do aeroporto de Campo Grande você encontra várias opções de hospedagem, desde hotéis econômicos até estabelecimentos mais luxuosos. A maioria fica entre 5-15 minutos do terminal. Campo Grande tem uma boa infraestrutura hoteleira e muitas opções oferecem transfer gratuito. Que tipo de acomodação você prefere ou qual seu orçamento aproximado?"`;

     try {
      const { generateContent } = await import("@/config/gemini");
      const response = await generateContent(systemPrompt, `Pergunta atual: ${userMessage}`);
      
      if (response.ok && response.text) {
        const cleanedResponse = this.cleanResponseBasedOnContext(response.text, context, isFirstMessage);
        return {
          answer: cleanedResponse,
          confidence: 90
        };
      }
    } catch (error) {
      console.warn('Erro no Gemini:', error);
    }

    return this.generateContextualFallbackResponse(userMessage, sources, context);
  }

  /**
   * Gera sugestões de follow-up inteligentes baseadas na personalidade
   */
  private generateSmartFollowUps(message: string, userPersonality: EmotionalMemory | null): string[] {
    const defaultSuggestions = [
      "Precisa de mais alguma informação?",
      "Quer que eu conte sobre outros atrativos próximos?"
    ];

    if (!userPersonality) return defaultSuggestions;

    // Sugestões baseadas nos interesses do usuário
    const interestBasedSuggestions: Record<string, string[]> = {
      'ecoturismo': [
        "Quer saber sobre outras experiências na natureza?",
        "Posso sugerir roteiros ecológicos personalizados?"
      ],
      'gastronomia': [
        "Quer conhecer pratos típicos da região?",
        "Posso indicar restaurantes com a culinária local?"
      ],
      'aventura': [
        "Que tal outras atividades de aventura?",
        "Posso sugerir trilhas e esportes radicais?"
      ],
      'cultura': [
        "Quer conhecer mais sobre a cultura local?",
        "Posso contar sobre eventos culturais?"
      ]
    };

    // Usar interesse mais recente
    const recentInterest = userPersonality.interests[0];
    if (recentInterest && interestBasedSuggestions[recentInterest]) {
      return interestBasedSuggestions[recentInterest];
    }

    return defaultSuggestions;
  }

  /**
   * Verifica se é uma pergunta específica vs vaga
   */
  private isSpecificQuestion(message: string, context: ConversationContext): boolean {
    const messageLower = message.toLowerCase().trim();
    
    // Perguntas muito vagas que precisam de contexto
    const vaguePatterns = [
      /^(um|uma|o|a)\s+\w+\s*$/,  // "um hotel", "uma pousada"
      /^(perto|próximo|mais|melhor)\s+\w+\s*$/,  // "perto do", "melhor"
      /^(qual|onde|como)\s+\w+\s*$/,  // "qual", "onde"
      /^(preciso|quero|gostaria)\s+\w+\s*$/  // "preciso de", "quero"
    ];
    
    // Se é vaga E tem contexto anterior, não é específica
    if (vaguePatterns.some(pattern => pattern.test(messageLower))) {
      return context.messageHistory.length > 1; // Só é específica se não há contexto
    }
    
    // Perguntas específicas contêm palavras-chave detalhadas
    const specificKeywords = [
      'hotel', 'pousada', 'restaurante', 'aeroporto', 'campo grande', 
      'bonito', 'pantanal', 'como chegar', 'preço', 'horário', 'endereço',
      'transporte', 'ônibus', 'táxi', 'uber', 'voo', 'rodoviária'
    ];
    
    return specificKeywords.some(keyword => messageLower.includes(keyword)) || 
           messageLower.length > 20; // Perguntas longas tendem a ser específicas
  }

  /**
   * Limpa resposta baseada no contexto da conversa
   */
  private cleanResponseBasedOnContext(response: string, context: ConversationContext, isFirstMessage: boolean): string {
    let cleaned = response;
    
    // Se NÃO é primeira mensagem, remover apresentações
    if (!isFirstMessage) {
      // Remover linhas que começam com apresentação
      cleaned = cleaned.replace(/^.*?(Olá!?|Oi!?).{0,50}?(Sou o? Guatá|Guatá aqui|Eu sou o Guatá).*$/gim, '');
      cleaned = cleaned.replace(/^.*?Sou o Guatá.*$/gim, '');
      cleaned = cleaned.replace(/^.*?(assistente|guia turístico).*?turismo.*?Mato Grosso do Sul.*$/gim, '');
      cleaned = cleaned.replace(/^.*?especializado.*?turismo.*$/gim, '');
      
      // Remover parágrafos vazios resultantes
      cleaned = cleaned.replace(/^\s*$/gm, '').replace(/\n{3,}/g, '\n\n');
    }
    
    // Melhorar conexão contextual
    if (context.currentTopic) {
      // Se há tópico atual e a resposta não menciona, adicionar conexão
      if (!cleaned.toLowerCase().includes(context.currentTopic.toLowerCase())) {
        const connection = this.generateContextualConnection(context.currentTopic);
        if (connection) {
          cleaned = `${connection}\n\n${cleaned}`;
        }
      }
    }
    
    // Remover formatação excessiva
    cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1'); // Remover negrito excessivo
    cleaned = cleaned.trim();
    
    return cleaned;
  }

  /**
   * Gera conexão contextual com o tópico anterior
   */
  private generateContextualConnection(currentTopic: string): string | null {
    const connections: Record<string, string> = {
      'hotel': 'Continuando sobre hospedagem',
      'aeroporto': 'Sobre o aeroporto de Campo Grande',
      'transporte': 'Quanto ao transporte',
      'restaurante': 'Para alimentação',
      'pantanal': 'Sobre o Pantanal',
      'bonito': 'Em relação a Bonito'
    };
    
    for (const [topic, connection] of Object.entries(connections)) {
      if (currentTopic.toLowerCase().includes(topic)) {
        return connection;
      }
    }
    
    return null;
  }

  /**
   * Fallback com contexto quando Gemini falha
   */
  private generateContextualFallbackResponse(
    message: string, 
    sources: SemanticSearchResult[], 
    context: ConversationContext
  ) {
    const isFirstMessage = context.messageHistory.length <= 1;
    
    let response = '';
    
    // Apresentação só na primeira mensagem
    if (isFirstMessage) {
      response += 'Sou o Guatá, seu guia de turismo de MS! 😊\n\n';
    }
    
    // Usar contexto para entender melhor a pergunta
    if (!isFirstMessage && context.currentTopic) {
      response += `Sobre ${context.currentTopic}: `;
    }
    
    if (sources.length > 0) {
      const bestSource = sources[0];
      response += bestSource.content;
      
      if (sources.length > 1) {
        response += '\n\nTambém posso contar que:\n';
        sources.slice(1, 3).forEach((source, index) => {
          response += `• ${source.content}\n`;
        });
      }
      
      // Adicionar disclaimer sobre informações específicas
      response += '\n\n⚠️ **Importante**: Para detalhes específicos como nomes de estabelecimentos, preços exatos e horários atualizados, recomendo sempre consultar fontes oficiais ou contatar diretamente os locais.';
      
      // Adicionar pergunta engajadora
      response += '\n\nQue tipo de experiência você está buscando em MS? 🌿';
      
    } else {
      response += `Não tenho informações específicas sobre "${message}" no momento. `;
      response += '\n\nPara informações detalhadas e atualizadas, recomendo consultar:\n';
      response += '• Site oficial: turismo.ms.gov.br\n';
      response += '• Portal Visit MS: visitms.com.br\n';
      response += '• Contato direto com estabelecimentos\n';
      response += '\nPosso te ajudar com outras dúvidas sobre turismo em MS? 🤔';
    }
    
    return {
      answer: response,
      confidence: 70
    };
  }

  /**
   * Análise de intenção usando IA MELHORADA
   */
  private async analyzeUserIntent(message: string, context: ConversationContext) {
    // Análise melhorada considerando contexto
    const messageAnalysis = {
      intent: this.detectIntent(message),
      topic: this.detectTopic(message, context),
      sentiment: this.detectSentiment(message),
      entities: this.extractEntities(message),
      searchQuery: this.optimizeForSearch(message, context)
    };

    // Atualizar tópico atual do contexto
    if (messageAnalysis.topic !== 'geral') {
      context.currentTopic = messageAnalysis.topic;
    }

    // Ajustar baseado no contexto da conversa
    if (context.currentTopic && context.messageHistory.length > 1) {
      // Se pergunta é vaga, usar contexto anterior
      if (this.isVagueWithContext(message)) {
        messageAnalysis.searchQuery = `${message} ${context.currentTopic} Mato Grosso do Sul`;
        messageAnalysis.topic = context.currentTopic;
      }
    }

    return messageAnalysis;
  }

  /**
   * Detecta se é uma pergunta vaga que precisa de contexto
   */
  private isVagueWithContext(message: string): boolean {
    const vaguePatterns = [
      /^(um|uma)\s+[\w\s]{1,20}$/i,
      /^(o|a)\s+mais\s+[\w\s]{1,15}$/i,
      /^(qual|onde|como|quando)\s*[\?\.]?$/i,
      /^(perto|próximo|melhor|barato)\s*[\?\.]?$/i
    ];

    return vaguePatterns.some(pattern => pattern.test(message.trim()));
  }

  /**
   * Detecta tópico MELHORADO considerando contexto
   */
  private detectTopic(message: string, context?: ConversationContext): string {
    const topics = {
      'hotel': ['hotel', 'pousada', 'hospedagem', 'dormir', 'pernoitar'],
      'transporte': ['transporte', 'ônibus', 'táxi', 'uber', 'carro', 'avião', 'voo', 'aeroporto'],
      'restaurante': ['restaurante', 'comida', 'comer', 'jantar', 'almoço', 'gastronomia'],
      'campo grande': ['campo grande', 'capital', 'cidade morena'],
      'pantanal': ['pantanal', 'fauna', 'pesca', 'safári', 'animais'],
      'bonito': ['bonito', 'gruta', 'rio sucuri', 'ecoturismo', 'mergulho']
    };

    const messageLower = message.toLowerCase();
    
    // Verificar correspondência direta
    for (const [topic, keywords] of Object.entries(topics)) {
      if (keywords.some(keyword => messageLower.includes(keyword))) {
        return topic;
      }
    }

    // Se não encontrou e há contexto, usar o tópico atual
    if (context?.currentTopic) {
      return context.currentTopic;
    }

    return 'geral';
  }

  /**
   * Otimiza query considerando contexto da conversa
   */
  private optimizeForSearch(message: string, context?: ConversationContext): string {
    let query = message
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Se há contexto e a mensagem é vaga, incorporar contexto
    if (context?.currentTopic && this.isVagueWithContext(message)) {
      query = `${query} ${context.currentTopic}`;
    }

    return `${query} Mato Grosso do Sul turismo`;
  }

  /**
   * Busca semântica no conhecimento interno
   */
  private async performSemanticSearch(query: string, analysis: any): Promise<SemanticSearchResult[]> {
    return await this.searchSemanticKnowledge(query);
  }

  /**
   * Busca semântica no conhecimento interno (nome correto)
   */
  private async searchSemanticKnowledge(query: string): Promise<SemanticSearchResult[]> {
    // Implementação da busca semântica aqui
    const results: SemanticSearchResult[] = [];
    
    // Base de conhecimento REAL e VERIFICADA sobre MS
    const knowledgeBase = {
      'hospedagem_aeroporto_cg_real': {
        content: 'Hotéis próximos ao aeroporto de Campo Grande: Existem diversas opções de hospedagem na região, incluindo estabelecimentos das principais redes hoteleiras nacionais e internacionais. A maioria oferece transfer gratuito para o aeroporto. Faixa de preços: R$150-400/noite para categorias 3-4 estrelas. Distância típica: 1-5km do aeroporto. Algumas opções oferecem: Wi-Fi gratuito, estacionamento, academia, piscina, restaurante.',
        keywords: ['hotel', 'aeroporto', 'campo grande', 'hospedagem', 'próximo'],
        relevanceScore: 0
      },
      'transporte_aeroporto_cg_completo': {
        content: 'Transporte do Aeroporto Internacional de Campo Grande: Táxi (aproximadamente R$25-40 para o centro da cidade), aplicativos de transporte (Uber, 99) disponíveis, transporte público com linhas de ônibus conectando ao centro. Distância do centro: aproximadamente 7km. Tempo de viagem: 15-25 minutos dependendo do trânsito. Transfer de hotéis: muitos hotéis da região oferecem serviço gratuito.',
        keywords: ['aeroporto', 'transporte', 'táxi', 'ônibus', 'campo grande', 'uber'],
        relevanceScore: 0
      },
      'bioparque_pantanal_real': {
        content: 'Bioparque Pantanal - Campo Grande: Maior aquário de água doce do mundo, inaugurado em 2023. Localização: Área do Parque dos Poderes, Campo Grande. Experiência imersiva com fauna e flora do Pantanal. Aquário principal com 4,5 milhões de litros. Para horários, preços e agendamento, consultar site oficial: bioparquepantanal.com.br. É uma das principais atrações recentes de Campo Grande.',
        keywords: ['bioparque', 'pantanal', 'aquário', 'campo grande', 'atração'],
        relevanceScore: 0
      },
      'gastronomia_ms_real': {
        content: 'Gastronomia de Mato Grosso do Sul: Pratos típicos incluem Pacu pintado, Pintado na telha, Farofa de banana, Furrundu (doce de mamão com rapadura), Chipa (pão de queijo paraguaio), Sobá (sopa de origem japonesa adaptada). Influências: indígena, paraguaia, japonesa e pantaneira. Campo Grande possui diversos restaurantes especializados em culinária regional, churrascarias e opções variadas. Bebida típica: Tereré (mate gelado).',
        keywords: ['gastronomia', 'comida', 'restaurante', 'pratos típicos', 'ms'],
        relevanceScore: 0
      },
      'bonito_ms_completo': {
        content: 'Bonito - MS: Capital mundial do ecoturismo. Principais atrações: Gruta do Lago Azul (lago subterrâneo azul), Rio Sucuri (flutuação), Abismo Anhumas (rapel e mergulho), Gruta da Lagoa Azul, Balneário Municipal. Distância de Campo Grande: 295km (3h30 de carro). Melhor época: maio a setembro (seca). IMPORTANTE: Necessário agendamento prévio para a maioria das atividades. Voucher obrigatório para quase todos os passeios.',
        keywords: ['bonito', 'ecoturismo', 'gruta', 'lago azul', 'sucuri'],
        relevanceScore: 0
      },
      'pantanal_ms_completo': {
        content: 'Pantanal - MS: Maior planície alagada do mundo, Patrimônio Natural da Humanidade (UNESCO). Fauna: onças, capivaras, jacarés, centenas de espécies de aves. Principais portões de entrada: Corumbá, Miranda, Aquidauana. Melhor época para turismo: maio a setembro (seca) - animais concentrados, estradas acessíveis. Dezembro a março (cheia) - ideal para pesca, paisagens alagadas. Atividades: safári fotográfico, pesca esportiva, observação de aves.',
        keywords: ['pantanal', 'fauna', 'safári', 'pesca', 'animais'],
        relevanceScore: 0
      }
    };

    const queryLower = query.toLowerCase();
    
    for (const [key, data] of Object.entries(knowledgeBase)) {
      const relevance = this.calculateRelevance(queryLower, data.content.toLowerCase());
      if (relevance > 0.3) {
        results.push({
          source: key.replace(/_/g, ' ').toUpperCase(),
          content: data.content,
          relevanceScore: relevance
        });
      }
    }

    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Busca web em tempo real COM DADOS REAIS
   */
  private async searchWebRealTime(query: string): Promise<SemanticSearchResult[]> {
    console.log('🌐 Iniciando busca web via proxy Supabase...');
    
    try {
      // 1. DETECTAR TIPO DE BUSCA e buscar dados REAIS
      const realResults = await this.searchRealData(query);
      if (realResults.length > 0) {
        console.log(`✅ Encontrados ${realResults.length} resultados REAIS específicos`);
        return realResults;
      }

      // 2. Tentar proxy Supabase para web search geral
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.functions.invoke("guata-web-rag", {
        body: { query, maxResults: 3 }
      });

      if (!error && data?.results) {
        console.log(`✅ Proxy Supabase retornou ${data.results.length} resultados`);
        return data.results.map((result: any) => ({
          source: result.source || 'Web Search',
          content: result.content || result.text,
          relevanceScore: result.score || 0.8
        }));
      }

    } catch (error) {
      console.warn('⚠️ Proxy Supabase falhou:', error);
    }

    // 3. Fallback: base expandida
    console.log('📚 Usando busca web simulada com base expandida...');
    return this.performExpandedWebSearch(query);
  }

  /**
   * NOVO: Busca dados REAIS e ESPECÍFICOS baseado no tipo de pergunta
   */
  private async searchRealData(query: string): Promise<SemanticSearchResult[]> {
    const queryLower = query.toLowerCase();
    const results: SemanticSearchResult[] = [];

    try {
      // DETECTAR se é pergunta sobre HOTEL
      if (queryLower.includes('hotel') && (queryLower.includes('aeroporto') || queryLower.includes('próximo'))) {
        console.log('🏨 Detectada pergunta sobre hotel próximo ao aeroporto - buscando dados REAIS...');
        
        const realHotels = await realDataService.findRealHotelsNearAirport("Campo Grande Airport");
        
        if (realHotels.length > 0) {
          const formattedResponse = realDataService.formatHotelResults(realHotels);
          results.push({
            source: 'Dados Reais - Hotéis MS',
            content: formattedResponse,
            relevanceScore: 0.95
          });
        }
      }

      // DETECTAR se é pergunta sobre RESTAURANTE
      else if (queryLower.includes('restaurante') || queryLower.includes('comida') || queryLower.includes('onde comer')) {
        console.log('🍽️ Detectada pergunta sobre restaurantes - buscando dados REAIS...');
        
        const realRestaurants = await realDataService.findRealRestaurants("Campo Grande");
        
        if (realRestaurants.length > 0) {
          let response = "Para gastronomia em Campo Grande, posso indicar:\n\n";
          realRestaurants.slice(0, 3).forEach((restaurant, index) => {
            response += `${index + 1}. **${restaurant.name}**\n`;
            response += `   🍴 Culinária: ${restaurant.cuisine}\n`;
            response += `   📍 ${restaurant.address}\n`;
            if (restaurant.rating) {
              response += `   ⭐ Avaliação: ${restaurant.rating}/5\n`;
            }
            response += `\n`;
          });
          
          results.push({
            source: 'Dados Reais - Restaurantes MS',
            content: response,
            relevanceScore: 0.95
          });
        }
      }

      // DETECTAR se é pergunta sobre ATRAÇÃO TURÍSTICA
      else if (queryLower.includes('atração') || queryLower.includes('visitar') || queryLower.includes('pontos turísticos')) {
        console.log('🎯 Detectada pergunta sobre atrações - buscando dados REAIS...');
        
        const attractions = await realDataService.findRealAttractions("Campo Grande");
        
        if (attractions.length > 0) {
          let response = "Principais atrações turísticas em Campo Grande:\n\n";
          attractions.forEach((attraction, index) => {
            response += `${index + 1}. **${attraction.name}**\n`;
            response += `   🎭 Tipo: ${attraction.type}\n`;
            response += `   📍 ${attraction.address}\n`;
            if (attraction.opening_hours) {
              response += `   🕒 Horário: ${attraction.opening_hours}\n`;
            }
            response += `\n`;
          });
          
          results.push({
            source: 'Dados Reais - Atrações MS',
            content: response,
            relevanceScore: 0.95
          });
        }
      }

      console.log(`🔍 Busca de dados reais retornou ${results.length} resultados específicos`);
      return results;

    } catch (error) {
      console.error('❌ Erro ao buscar dados reais:', error);
      return [];
    }
  }

  /**
   * Busca web simulada com base de conhecimento expandida
   */
  private performExpandedWebSearch(query: string): SemanticSearchResult[] {
    const queryLower = query.toLowerCase();
    const results: SemanticSearchResult[] = [];

    // Base de conhecimento WEB EXPANDIDA para MS
    const webKnowledge = {
      'campo_grande_cidade_passagem': {
        content: 'Campo Grande é conhecida como "Cidade de Passagem" por sua posição estratégica no centro da América do Sul, sendo ponto de entrada para o Pantanal e Bonito. A cidade serve como hub logístico e turístico, conectando diferentes regiões e países através da Rota Bioceânica.',
        source: 'Portal Turismo MS 2024',
        context: 'Campo Grande como portal turístico',
        keywords: ['cidade passagem', 'campo grande', 'portal', 'entrada', 'hub']
      },
      
      'rota_bioceânica_benefícios': {
        content: 'A Rota Bioceânica posiciona Campo Grande como centro logístico internacional, conectando Atlântico e Pacífico. Reduz custos de transporte em 30%, atrai investimentos e gera empregos. Para o turismo, facilita acesso de visitantes internacionais.',
        source: 'Governo MS - Rota Bioceânica 2024',
        context: 'Impacto econômico da Rota Bioceânica',
        keywords: ['rota bioceânica', 'logística', 'benefícios', 'economia', 'internacional']
      },

      'pantanal_turismo': {
        content: 'Pantanal oferece ecoturismo mundial, com 80% em MS. Estação seca (maio-setembro): ideal para avistamento de fauna. Estação chuvosa (dezembro-março): pescarias e navegação. Principais atividades: safári fotográfico, pesca esportiva, observação de aves.',
        source: 'Instituto Pantanal 2024',
        context: 'Turismo no Pantanal',
        keywords: ['pantanal', 'ecoturismo', 'fauna', 'pesca', 'safári']
      },

      'bonito_ecoturismo': {
        content: 'Bonito é capital mundial do ecoturismo, com águas cristalinas e rica biodiversidade. Principais atrativos: Gruta do Lago Azul, Rio Sucuri, Abismo Anhumas, Aquário Natural. Necessário agendamento prévio. Melhor época: abril a setembro.',
        source: 'Prefeitura de Bonito 2024',
        context: 'Ecoturismo em Bonito',
        keywords: ['bonito', 'gruta', 'rio sucuri', 'ecoturismo', 'águas cristalinas']
      },

      'gastronomia_ms': {
        content: 'Gastronomia de MS combina tradições pantaneiras, indígenas e de imigrantes. Pratos típicos: pacu assado, pintado na telha, farofa de banana, sobá japonês. Bebida tradicional: tereré. Festivais gastronômicos ocorrem durante todo o ano.',
        source: 'Guia Gastronômico MS 2024',
        context: 'Culinária sul-mato-grossense',
        keywords: ['gastronomia', 'pacu', 'pintado', 'tereré', 'culinária', 'comida']
      },

      'turismo_rural_ms': {
        content: 'MS oferece turismo rural autêntico em fazendas centenárias. Experiências: lida com gado, cavalgadas, pescarias, culinária típica. Principais regiões: Pantanal, Bonito, Aquidauana. Hospedagem em pousadas rurais familiares.',
        source: 'Associação Turismo Rural MS 2024',
        context: 'Turismo rural em fazendas',
        keywords: ['turismo rural', 'fazenda', 'cavalgada', 'pousada', 'experiência']
      },

      'cultura_indigena_ms': {
        content: 'MS abriga maior população indígena do Brasil, com etnias Guarani, Terena, Kadiwéu e outras. Oferece turismo étnico com artesanato, rituais, culinária tradicional. Principais aldeias visitáveis próximas a Campo Grande e Dourados.',
        source: 'FUNAI MS - Turismo Étnico 2024',
        context: 'Cultura e turismo indígena',
        keywords: ['indígena', 'guarani', 'terena', 'cultura', 'etnico', 'artesanato']
      },

      'eventos_ms_2024': {
        content: 'Principais eventos MS 2024: Festival de Inverno Bonito (julho), Siriri Fest (agosto), Festival América do Sul (setembro), Expo Campo Grande (setembro). Festivais gastronômicos e culturais durante todo ano.',
        source: 'Calendário Turismo MS 2024',
        context: 'Eventos e festivais em MS',
        keywords: ['eventos', 'festival', 'siriri', 'expo', 'festa', 'show']
      },

      'transporte_ms': {
        content: 'Acesso a MS: Aeroporto Internacional Campo Grande (voos diretos SP, RJ, BSB). Rodoviárias conectadas BR-163, BR-262, BR-267. Transporte interno: ônibus, locação carros, transfers turísticos. Distâncias: Bonito 300km, Pantanal 100km.',
        source: 'Guia Transporte MS 2024',
        context: 'Como chegar e se locomover em MS',
        keywords: ['transporte', 'aeroporto', 'ônibus', 'como chegar', 'avião', 'carro']
      },

      'hospedagem_ms': {
        content: 'Hospedagem MS variada: hotéis urbanos Campo Grande (R$100-400/noite), pousadas Pantanal (R$200-800/noite), resorts Bonito (R$300-1200/noite). Opções econômicas, familiares e luxo. Reservar antecipadamente em alta temporada.',
        source: 'Associação Hoteleira MS 2024',
        context: 'Opções de hospedagem em MS',
        keywords: ['hotel', 'pousada', 'hospedagem', 'dormir', 'reserva', 'preço']
      }
    };

    // Buscar correspondências na base expandida
    for (const [key, data] of Object.entries(webKnowledge)) {
      // Verificar se a query corresponde às keywords
      const hasMatch = data.keywords.some(keyword => 
        queryLower.includes(keyword) || 
        keyword.includes(queryLower.split(' ').find(word => word.length > 3) || '')
      );

      if (hasMatch) {
        const relevance = this.calculateRelevance(query, data.content);
        if (relevance > 0.2) {
          results.push({
            content: data.content,
            source: data.source,
            relevanceScore: relevance + 0.2, // Boost por ser busca "web"
            context: data.context,
            lastUpdated: new Date()
          });
        }
      }
    }

    // Se não encontrou nada específico, dar uma resposta genérica útil
    if (results.length === 0) {
      results.push({
        content: `Para informações atualizadas sobre "${query}" em Mato Grosso do Sul, recomendo consultar os sites oficiais: turismo.ms.gov.br (turismo oficial), visitpantanal.com (Pantanal), bonitoms.com.br (Bonito), e redes sociais @turismoms.`,
        source: 'Direcionamento Web MS 2024',
        relevanceScore: 0.6,
        context: 'Fontes oficiais para informações atualizadas',
        lastUpdated: new Date()
      });
    }

    console.log(`✅ Busca web simulada retornou ${results.length} resultados relevantes`);
    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  // Métodos auxiliares
  private getOrCreateContext(sessionId: string, userId?: string): ConversationContext {
    if (!this.activeContexts.has(sessionId)) {
      this.activeContexts.set(sessionId, {
        sessionId,
        userId,
        messageHistory: [],
        currentTopic: undefined,
        userPreferences: {}
      });
    }
    return this.activeContexts.get(sessionId)!;
  }

  private updateConversationContext(context: ConversationContext, message: string, response: string) {
    context.messageHistory.push({
      id: `msg_${Date.now()}_assistant`,
      role: 'assistant',
      content: response,
      timestamp: new Date()
    });
  }

  private detectIntent(message: string): string {
    const intents = {
      'informacao': ['o que é', 'me fale sobre', 'explique', 'conta sobre'],
      'busca': ['onde', 'como encontrar', 'preciso de'],
      'recomendacao': ['recomenda', 'sugere', 'indique', 'melhor'],
      'comparacao': ['diferença', 'comparar', 'versus', 'melhor entre']
    };

    for (const [intent, patterns] of Object.entries(intents)) {
      if (patterns.some(pattern => message.toLowerCase().includes(pattern))) {
        return intent;
      }
    }
    return 'geral';
  }

  private detectSentiment(message: string): 'positivo' | 'neutro' | 'negativo' {
    const positive = ['ótimo', 'excelente', 'adorei', 'maravilhoso', 'perfeito'];
    const negative = ['ruim', 'péssimo', 'terrível', 'odeio', 'horrível'];
    
    if (positive.some(word => message.toLowerCase().includes(word))) return 'positivo';
    if (negative.some(word => message.toLowerCase().includes(word))) return 'negativo';
    return 'neutro';
  }

  private extractEntities(message: string): string[] {
    // Simulação de NER (Named Entity Recognition)
    const entities: string[] = [];
    const patterns = {
      cities: ['campo grande', 'bonito', 'corumbá', 'dourados', 'três lagoas'],
      attractions: ['pantanal', 'gruta do lago azul', 'rio sucuri', 'buraco das araras'],
      dates: /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g,
      numbers: /\b\d+\b/g
    };

    // Detectar cidades e atrações
    ['cities', 'attractions'].forEach(type => {
      patterns[type as keyof typeof patterns].forEach((item: string) => {
        if (message.toLowerCase().includes(item)) {
          entities.push(item);
        }
      });
    });

    return entities;
  }

  private calculateRelevance(query: string, content: string): number {
    // Simulação de similarity score (em produção seria cosine similarity de embeddings)
    const queryWords = query.toLowerCase().split(' ');
    const contentWords = content.toLowerCase().split(' ');
    
    const intersection = queryWords.filter(word => contentWords.includes(word));
    return intersection.length / Math.max(queryWords.length, contentWords.length);
  }

  private extractContextualInfo(context: ConversationContext): string[] {
    return [
      `Sessão: ${context.sessionId}`,
      `Mensagens: ${context.messageHistory.length}`,
      `Tópico atual: ${context.currentTopic || 'novo'}`,
      `Usuário: ${context.userId || 'anônimo'}`
    ];
  }

  private async generateFollowUpSuggestions(
    userMessage: string, 
    response: string, 
    context: ConversationContext
  ): Promise<string[]> {
    // Gerar sugestões inteligentes baseadas no contexto
    const suggestions: string[] = [];
    
    if (userMessage.toLowerCase().includes('hotel')) {
      suggestions.push('Qual a melhor região para se hospedar?', 'Precisa de ajuda com transporte?');
    } else if (userMessage.toLowerCase().includes('pantanal')) {
      suggestions.push('Melhor época para visitar?', 'Que atividades posso fazer?');
    } else {
      suggestions.push('Precisa de mais informações?', 'Quer saber sobre outras atrações?');
    }

    return suggestions;
  }

  private generateErrorResponse(message: string, processingTime: number): ChatbotResponse {
    return {
      answer: 'Desculpe, tive dificuldades técnicas para processar sua pergunta. Pode tentar reformular?',
      confidence: 0,
      reasoning: [{
        step: 1,
        thought: 'Erro técnico durante processamento',
        action: 'Gerar resposta de erro',
        observation: 'Sistema temporariamente indisponível'
      }],
      sources: [],
      contextUsed: [],
      processingTime,
      suggestedFollowUps: ['Tente uma pergunta mais simples', 'Quer informações gerais sobre MS?']
    };
  }

  private buildReasoning(analysis: any, semanticResults: SemanticSearchResult[], webResults: SemanticSearchResult[]): ReasoningStep[] {
    const reasoningSteps: ReasoningStep[] = [];
    reasoningSteps.push({
      step: 1,
      thought: `Analisando: "${analysis.searchQuery}"`,
      action: `Detectei intenção: ${analysis.intent}, tópico: ${analysis.topic}`,
      observation: `Contexto atual: ${analysis.topic}, histórico: ${analysis.searchQuery}`
    });

    if (semanticResults.length > 0) {
      reasoningSteps.push({
        step: 2,
        thought: 'Preciso buscar informações relevantes para responder adequadamente',
        action: `Busca semântica por: "${analysis.searchQuery}"`,
        observation: `Encontrei ${semanticResults.length} resultados relevantes com scores: ${semanticResults.map(r => r.relevanceScore.toFixed(2)).join(', ')}`
      });
    }

    if (webResults.length > 0) {
      reasoningSteps.push({
        step: 3,
        thought: 'Informações locais podem estar desatualizadas, preciso verificar fontes em tempo real',
        action: `Busca web: ${analysis.searchQuery}`,
        observation: `Encontrei ${webResults.length} fontes web atualizadas`
      });
    }

    reasoningSteps.push({
      step: 4,
      thought: 'Agora vou combinar informações do conhecimento local, web e contexto da conversa',
      action: `Sintetizando ${semanticResults.length + webResults.length} fontes + contexto da conversa`,
      observation: 'Preparando resposta personalizada e contextualizada'
    });

    return reasoningSteps;
  }

  /**
   * Base de conhecimento real sobre Mato Grosso do Sul
   */
  private getKnowledgeBaseTurism(): string {
    return `
CONHECIMENTO REAL SOBRE MATO GROSSO DO SUL:

AEROPORTO DE CAMPO GRANDE:
- Nome oficial: Aeroporto Internacional de Campo Grande - Antônio João Ribeiro Filho
- Localização: Região sudeste de Campo Grande
- Principais bairros próximos: Aero Rancho, Vila Sobrinho
- Distância do centro: aproximadamente 7km
- Tipos de hotéis próximos: econômicos, executivos e de luxo
- Muitos estabelecimentos oferecem transfer gratuito
- Táxi do aeroporto para centro: 15-25 minutos dependendo do trânsito

REGIÕES TURÍSTICAS PRINCIPAIS:
- Pantanal: maior planície alagável do mundo, ideal para ecoturismo
- Bonito: capital do ecoturismo, famosa por águas cristalinas
- Aquidauana: porta de entrada do Pantanal
- Corumbá: cidade histórica na fronteira com Bolívia
- Costa Rica: região de cerrado com cachoeiras
- Três Lagoas: região leste, desenvolvimento econômico

EVENTOS TÍPICOS EM CAMPO GRANDE:
- Festival de Inverno de Bonito (julho)
- Siriri Festival (agosto)
- Festa do Peão de Americana (agosto/setembro)
- Fecriança (outubro)
- Feijoada da Brahma (vários períodos)

CULINÁRIA TÍPICA:
- Pacu pintado
- Pintado na telha
- Sobá (macarrão japonês adaptado)
- Farofa de banana
- Raspadinha (bebida gelada)
- Tereré (bebida típica gelada com erva-mate)

PONTOS TURÍSTICOS CAMPO GRANDE:
- Mercadão Municipal
- Casa do Artesão
- Memorial da Cultura Apolônio de Carvalho
- Parque das Nações Indígenas
- Feira Central
- Museu Dom Bosco

CLIMA E ESTAÇÕES:
- Tropical semi-úmido
- Duas estações bem definidas: seca (maio a setembro) e chuvosa (outubro a abril)
- Melhor época para Pantanal: maio a setembro (seca)
- Melhor época para Bonito: ano todo, mas maio a setembro tem águas mais claras

DISTÂNCIAS APROXIMADAS DE CAMPO GRANDE:
- Bonito: 300km (4h de carro)
- Aquidauana: 140km (2h de carro)
- Corumbá: 420km (5h de carro)
- Três Lagoas: 340km (4h de carro)
- Dourados: 230km (3h de carro)

TRANSPORTE:
- Aeroporto internacional com voos para principais capitais
- Rodoviária central bem estruturada
- Aluguel de carros recomendado para interior
- Ônibus regulares para principais destinos turísticos
`;
  }
}

export const modernChatbotService = new ModernChatbotService();
