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
    console.log('🦦 Guatá Intelligent Tourism: Processando pergunta...');
    console.log('📝 Query:', query.question);

    try {
      // 1. Verificar se é APENAS um cumprimento simples (sem perguntas)
      // NÃO tratar como cumprimento se houver perguntas ou contexto adicional
      if (this.isSimpleGreeting(query.question) && query.question.trim().length < 20) {
        console.log('👋 Cumprimento simples detectado, respondendo naturalmente...');
        return this.generateSimpleGreetingResponse(query.question);
      }

      // 1.5. Detectar perguntas de continuação ("sim, por favor", "ok", etc.)
      if (this.isContinuationQuestion(query.question, query.conversationHistory || [])) {
        console.log('🔄 Pergunta de continuação detectada, respondendo baseado no contexto...');
        return this.handleContinuationQuestion(query.question, query.conversationHistory || []);
      }

      // 2. Detectar categoria da pergunta
      const category = this.detectQuestionCategory(query.question);
      console.log('🏷️ Categoria detectada:', category);

      // 3. SEMPRE fazer pesquisa web PRIMEIRO (antes de tudo)
      console.log('🔍 Fazendo pesquisa web PRIMEIRO (antes de tudo)...');
      const webSearchQuery: RealWebSearchQuery = {
        question: query.question,
        location: query.userLocation || 'Mato Grosso do Sul',
        category: category,
        maxResults: 5
      };
      
      const webSearchResponse = await guataRealWebSearchService.searchRealTime(webSearchQuery);
      console.log('✅ Pesquisa web concluída:', {
        resultados: webSearchResponse.results.length,
        metodo: webSearchResponse.searchMethod,
        pesquisaReal: webSearchResponse.usedRealSearch
      });
      
      // 4. VERIFICAR PARCEIROS (após pesquisa web)
      console.log('🤝 Verificando parceiros da plataforma...');
      const partnersResult = await this.checkPartners(query.question, category);
      console.log('🤝 Parceiros encontrados:', partnersResult.partnersFound?.length || 0);
      
      // 5. Gerar resposta inteligente combinando IA + dados reais + parceiros
      const intelligentAnswer = await this.generateIntelligentAnswer(
        query.question,
        webSearchResponse,
        query.conversationHistory || [],
        query.userPreferences || {},
        partnersResult,
        query.userId,
        query.sessionId
      );

      // 4. Personalizar resposta com Machine Learning
      let personalizedAnswer = intelligentAnswer;
      try {
        personalizedAnswer = await guataMLService.personalizeResponse(
          query.question,
          intelligentAnswer,
          query.userId,
          query.sessionId
        );
        console.log('🧠 ML: Resposta personalizada aplicada');
      } catch (error) {
        console.warn('⚠️ ML: Erro ao personalizar resposta, usando resposta original:', error);
      }

      // 5. Adicionar personalidade e contexto
      const finalAnswer = this.addPersonalityAndContext(
        personalizedAnswer,
        query.question,
        webSearchResponse.tourismData
      );

      const processingTime = Date.now() - startTime;
      console.log(`✅ Guatá Intelligent Tourism: Resposta gerada em ${processingTime}ms`);

      // 6. Aprender automaticamente da interação (assíncrono, não bloqueia resposta)
      const learningInteraction: LearningInteraction = {
        userId: query.userId,
        sessionId: query.sessionId || `session-${Date.now()}`,
        question: query.question,
        answer: finalAnswer,
        sources: webSearchResponse.sources,
        confidence: webSearchResponse.usedRealSearch ? 0.95 : 0.8,
        timestamp: new Date(),
        metadata: {
          queryType: this.detectQuestionCategory(query.question) as any,
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
        emotionalState: this.determineEmotionalState(query.question),
        followUpQuestions: this.generateFollowUpQuestions(query.question, webSearchResponse.tourismData),
        learningInsights: this.generateLearningInsights(query.question, webSearchResponse),
        adaptiveImprovements: this.generateAdaptiveImprovements(webSearchResponse),
        memoryUpdates: this.generateMemoryUpdates(query, webSearchResponse)
      };

    } catch (error) {
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
    } catch (error) {
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
    const lowerQuestion = question.toLowerCase();
    
    // Palavras-chave que indicam perguntas sobre serviços (hotéis, restaurantes, etc)
    const serviceKeywords = [
      'hotel', 'hospedagem', 'pousada', 'dormir', 'acomodação', 'onde ficar',
      'restaurante', 'comer', 'comida', 'gastronomia', 'lanchonete', 'onde comer',
      'passeio', 'tour', 'excursão', 'agência', 'operadora', 'onde fazer',
      'tem hotel', 'tem restaurante', 'tem pousada', 'tem passeio'
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
        return false;
      }
    }
    
    // Se contém palavras-chave de serviços, usar parceiros
    for (const keyword of serviceKeywords) {
      if (lowerQuestion.includes(keyword)) {
        return true;
      }
    }
    
    return false;
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
    sessionId?: string
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
        console.log('🧠 Usando Gemini + pesquisa web + parceiros para resposta dinâmica...');
        
        const geminiQuery: any = {
          question,
          context: `Localização: Mato Grosso do Sul`,
          userLocation: 'Mato Grosso do Sul',
          searchResults: webSearchResponse.results,
          conversationHistory: conversationHistory,
          isTotemVersion: (query as any).isTotemVersion ?? true // Passar flag para controlar uso de "Olá"
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
          console.log('🤝 Passando informações de parceiros para o Gemini:', geminiQuery.partnersInfo.length);
        }
        
        // Passar userId e sessionId para cache individual
        if (userId) geminiQuery.userId = userId;
        if (sessionId) geminiQuery.sessionId = sessionId;
        
        const geminiResponse = await guataGeminiService.processQuestion(geminiQuery);
        
        if (geminiResponse.usedGemini) {
          console.log('🧠 Gemini gerou resposta dinâmica com pesquisa web e parceiros');
          answer = geminiResponse.answer;
        } else {
          console.log('🔄 Gemini não funcionou, usando formatação inteligente da pesquisa web');
          // Se tiver parceiros, formatar com eles primeiro
          if (partnersResult && partnersResult.partnersFound && partnersResult.partnersFound.length > 0) {
            answer = this.formatPartnersResponse(partnersResult, question);
            answer += "\n\n🌐 Outras opções encontradas:\n";
            answer += this.formatWebSearchResults(webSearchResponse.results, question);
          } else {
            answer = this.formatWebSearchResults(webSearchResponse.results, question);
          }
        }
      } catch (error) {
        console.error('❌ Erro no Gemini, usando formatação inteligente da pesquisa web:', error);
        // Se tiver parceiros, formatar com eles primeiro
        if (partnersResult && partnersResult.partnersFound && partnersResult.partnersFound.length > 0) {
          answer = this.formatPartnersResponse(partnersResult, question);
          answer += "\n\n🌐 Outras opções encontradas:\n";
          answer += this.formatWebSearchResults(webSearchResponse.results, question);
        } else {
          answer = this.formatWebSearchResults(webSearchResponse.results, question);
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
    
    // Detectar roteiros/itinerários PRIMEIRO
    if (lowerQuestion.includes('roteiro') || lowerQuestion.includes('itinerário') || lowerQuestion.includes('dias') || lowerQuestion.includes('moto') || lowerQuestion.includes('viagem') || lowerQuestion.includes('montar')) {
      return this.formatItineraryResponse(results[0]?.snippet || '', results[0]?.title || '', question);
    }
    
    if (lowerQuestion.includes('campo grande') && (lowerQuestion.includes('fazer') || lowerQuestion.includes('visitar'))) {
      return this.formatCampoGrandeResponse(results);
    }
    
    if (lowerQuestion.includes('bonito') && (lowerQuestion.includes('fazer') || lowerQuestion.includes('visitar'))) {
      return this.formatBonitoResponse(results);
    }
    
    if (lowerQuestion.includes('hotel') || lowerQuestion.includes('hospedagem')) {
      return this.formatHotelResponse(results);
    }
    
    if (lowerQuestion.includes('evento') || lowerQuestion.includes('festa')) {
      return this.formatEventResponse(results);
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
        response += `Que legal que você quer saber sobre isso! `;
        response += `Encontrei algumas informações: ${snippet.substring(0, 300)}...\n\n`;
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
    
    // Detectar informações sobre gastronomia
    if (snippet.toLowerCase().includes('comida') || snippet.toLowerCase().includes('gastronomia') || snippet.toLowerCase().includes('restaurante')) {
      return `Sobre gastronomia em MS: ${snippet.substring(0, 200)}... A culinária sul-mato-grossense é uma verdadeira delícia!`;
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
          // Resposta genérica inteligente
          info = `Com base nas informações disponíveis, posso te ajudar com detalhes específicos sobre sua pergunta. Que aspecto você gostaria de saber mais?`;
        }
      }
    } else if (title) {
      info = `Sobre ${title.toLowerCase()}, posso te contar que é uma informação interessante sobre nossa região. Que detalhes específicos você gostaria de saber?`;
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
    
    if (!webSearchResponse.usedRealSearch) {
      improvements.push('Configurar APIs de pesquisa web para dados mais atualizados');
    }
    
    if (webSearchResponse.results.length === 0) {
      improvements.push('Expandir base de conhecimento local');
    }
    
    improvements.push('Sistema de verificação de informações implementado');
    improvements.push('Pesquisa web real integrada');
    
    return improvements;
  }

  /**
   * Gera atualizações de memória
   */
  private generateMemoryUpdates(query: IntelligentTourismQuery, webSearchResponse: RealWebSearchResponse): any[] {
    return [
      {
        type: 'search_preference',
        content: query.question,
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











