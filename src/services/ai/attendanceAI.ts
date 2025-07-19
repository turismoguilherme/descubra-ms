// Sistema de IA de Atendimento Presencial - Fase 4
// Assistente inteligente para atendentes dos CATs

import { AttendanceAIMessage, TouristProfile, TranslationRequest, RouteSuggestion, AccessibilitySupport } from './types';

// Configurações da IA de Atendimento
const AI_CONFIG = {
  // Configurações de tradução
  TRANSLATION: {
    supportedLanguages: ['pt-BR', 'en-US', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'ja-JP', 'ko-KR', 'zh-CN'],
    defaultLanguage: 'pt-BR',
    fallbackLanguage: 'en-US'
  },
  
  // Configurações de roteiros
  ROUTES: {
    maxSuggestions: 5,
    categories: ['ecoturismo', 'cultura', 'aventura', 'gastronomia', 'historia', 'relaxamento'],
    durationOptions: ['1-3 dias', '4-7 dias', '8-14 dias', '15+ dias']
  },
  
  // Configurações de acessibilidade
  ACCESSIBILITY: {
    supportedFeatures: ['wheelchair', 'visual_impairment', 'hearing_impairment', 'mobility_assistance'],
    priorityLevels: ['low', 'medium', 'high', 'critical']
  },
  
  // Configurações de reservas
  BOOKING: {
    supportedServices: ['hotel', 'restaurant', 'transport', 'activity', 'guide'],
    confirmationMethods: ['email', 'sms', 'whatsapp', 'phone']
  }
};

// Classe principal da IA de Atendimento
export class AttendanceAI {
  private static instance: AttendanceAI;
  private conversationHistory: AttendanceAIMessage[] = [];
  private touristProfiles: Map<string, TouristProfile> = new Map();
  private isOnline: boolean = false;
  private currentLanguage: string = AI_CONFIG.TRANSLATION.defaultLanguage;

  private constructor() {
    this.initializeAI();
  }

  static getInstance(): AttendanceAI {
    if (!AttendanceAI.instance) {
      AttendanceAI.instance = new AttendanceAI();
    }
    return AttendanceAI.instance;
  }

  // Inicializar a IA
  private async initializeAI(): Promise<void> {
    try {
      console.log('🤖 Inicializando IA de Atendimento...');
      
      // Simular inicialização
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.isOnline = true;
      console.log('✅ IA de Atendimento online');
    } catch (error) {
      console.error('❌ Erro ao inicializar IA:', error);
      this.isOnline = false;
    }
  }

  // Verificar status da IA
  getStatus(): { online: boolean; language: string; activeConversations: number } {
    return {
      online: this.isOnline,
      language: this.currentLanguage,
      activeConversations: this.conversationHistory.length
    };
  }

  // Tradução automática
  async translateText(text: string, targetLanguage: string): Promise<string> {
    if (!this.isOnline) {
      throw new Error('IA offline - tradução não disponível');
    }

    try {
      console.log(`🌐 Traduzindo: "${text}" para ${targetLanguage}`);
      
      // Simular tradução (aqui seria integração com API real)
      const translations: Record<string, Record<string, string>> = {
        'en-US': {
          'Olá, como posso ajudar?': 'Hello, how can I help you?',
          'Bem-vindo ao Mato Grosso do Sul': 'Welcome to Mato Grosso do Sul',
          'Gostaria de informações sobre Bonito?': 'Would you like information about Bonito?',
          'Temos várias opções de roteiros': 'We have several itinerary options',
          'Posso ajudar com reservas': 'I can help with bookings'
        },
        'es-ES': {
          'Olá, como posso ajudar?': 'Hola, ¿cómo puedo ayudarte?',
          'Bem-vindo ao Mato Grosso do Sul': 'Bienvenido a Mato Grosso do Sul',
          'Gostaria de informações sobre Bonito?': '¿Te gustaría información sobre Bonito?',
          'Temos várias opções de roteiros': 'Tenemos varias opciones de itinerarios',
          'Posso ajudar com reservas': 'Puedo ayudar con reservas'
        }
      };

      // Verificar se temos tradução direta
      if (translations[targetLanguage] && translations[targetLanguage][text]) {
        return translations[targetLanguage][text];
      }

      // Fallback: retornar texto original com indicação
      return `[${targetLanguage}] ${text}`;
    } catch (error) {
      console.error('❌ Erro na tradução:', error);
      return text; // Retornar texto original em caso de erro
    }
  }

  // Detectar idioma do turista
  async detectLanguage(text: string): Promise<string> {
    try {
      // Simular detecção de idioma
      const languagePatterns = {
        'en-US': /\b(the|and|or|but|in|on|at|to|for|of|with|by)\b/i,
        'es-ES': /\b(el|la|los|las|y|o|pero|en|con|por|para|de|del)\b/i,
        'fr-FR': /\b(le|la|les|et|ou|mais|dans|avec|pour|de|du|des)\b/i,
        'de-DE': /\b(der|die|das|und|oder|aber|in|mit|für|von|zu|den)\b/i
      };

      for (const [lang, pattern] of Object.entries(languagePatterns)) {
        if (pattern.test(text)) {
          return lang;
        }
      }

      return AI_CONFIG.TRANSLATION.defaultLanguage;
    } catch (error) {
      console.error('❌ Erro na detecção de idioma:', error);
      return AI_CONFIG.TRANSLATION.fallbackLanguage;
    }
  }

  // Sugerir roteiros personalizados
  async suggestRoutes(touristProfile: TouristProfile): Promise<RouteSuggestion[]> {
    if (!this.isOnline) {
      throw new Error('IA offline - sugestões não disponíveis');
    }

    try {
      console.log('🗺️ Gerando sugestões de roteiros para:', touristProfile.name);
      
      const suggestions: RouteSuggestion[] = [];
      
      // Roteiro baseado em interesses
      if (touristProfile.interests.includes('ecoturismo')) {
        suggestions.push({
          id: 'eco-1',
          name: 'Roteiro Ecoturismo Bonito',
          description: 'Gruta do Lago Azul, Rio Sucuri, Buraco das Araras',
          duration: '3 dias',
          difficulty: 'moderado',
          price: 'R$ 800-1200',
          highlights: ['Gruta do Lago Azul', 'Rio Sucuri', 'Buraco das Araras'],
          accessibility: ['wheelchair_partial', 'visual_guide'],
          languages: ['pt-BR', 'en-US', 'es-ES']
        });
      }

      if (touristProfile.interests.includes('cultura')) {
        suggestions.push({
          id: 'culture-1',
          name: 'Roteiro Cultural Campo Grande',
          description: 'Museus, gastronomia local, história indígena',
          duration: '2 dias',
          difficulty: 'fácil',
          price: 'R$ 400-600',
          highlights: ['Museu de Arte Contemporânea', 'Feira Central', 'Memorial da Cultura'],
          accessibility: ['wheelchair_full', 'audio_guide'],
          languages: ['pt-BR', 'en-US']
        });
      }

      if (touristProfile.interests.includes('aventura')) {
        suggestions.push({
          id: 'adventure-1',
          name: 'Roteiro Aventura Pantanal',
          description: 'Safari fotográfico, observação de fauna',
          duration: '4 dias',
          difficulty: 'difícil',
          price: 'R$ 1500-2000',
          highlights: ['Safari Pantanal', 'Observação de Aves', 'Pesca Esportiva'],
          accessibility: ['wheelchair_partial'],
          languages: ['pt-BR', 'en-US', 'es-ES']
        });
      }

      return suggestions.slice(0, AI_CONFIG.ROUTES.maxSuggestions);
    } catch (error) {
      console.error('❌ Erro ao gerar sugestões:', error);
      return [];
    }
  }

  // Assistência para pessoas com deficiência
  async provideAccessibilitySupport(request: AccessibilitySupport): Promise<string> {
    if (!this.isOnline) {
      throw new Error('IA offline - suporte não disponível');
    }

    try {
      console.log('♿ Fornecendo suporte de acessibilidade:', request.type);
      
      const supportResponses: Record<string, string> = {
        'wheelchair': 'Temos rampas de acesso e banheiros adaptados. Posso indicar os melhores roteiros acessíveis.',
        'visual_impairment': 'Oferecemos guias com audiodescrição e mapas táteis. Posso descrever os destinos em detalhes.',
        'hearing_impairment': 'Temos intérpretes de Libras e informações visuais. Posso comunicar por texto.',
        'mobility_assistance': 'Oferecemos acompanhamento especializado e equipamentos de mobilidade.'
      };

      return supportResponses[request.type] || 'Vou verificar as opções de acessibilidade disponíveis para você.';
    } catch (error) {
      console.error('❌ Erro no suporte de acessibilidade:', error);
      return 'Desculpe, não consegui processar sua solicitação de acessibilidade.';
    }
  }

  // Assistência para reservas
  async assistBooking(service: string, details: any): Promise<{ success: boolean; confirmation: string; bookingId?: string }> {
    if (!this.isOnline) {
      throw new Error('IA offline - reservas não disponíveis');
    }

    try {
      console.log('📅 Assistindo reserva:', service);
      
      // Simular processo de reserva
      const bookingId = `BK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const confirmation = `Reserva confirmada! ID: ${bookingId}. Detalhes enviados por email.`;
      
      return {
        success: true,
        confirmation,
        bookingId
      };
    } catch (error) {
      console.error('❌ Erro na assistência de reserva:', error);
      return {
        success: false,
        confirmation: 'Desculpe, não consegui processar sua reserva. Tente novamente.'
      };
    }
  }

  // Processar mensagem do turista
  async processMessage(message: string, touristId?: string): Promise<AttendanceAIMessage> {
    if (!this.isOnline) {
      throw new Error('IA offline - processamento não disponível');
    }

    try {
      console.log('💬 Processando mensagem:', message);
      
      // Detectar idioma
      const detectedLanguage = await this.detectLanguage(message);
      
      // Criar ou recuperar perfil do turista
      let touristProfile = touristId ? this.touristProfiles.get(touristId) : null;
      if (!touristProfile) {
        touristProfile = {
          id: touristId || `tourist-${Date.now()}`,
          name: 'Visitante',
          language: detectedLanguage,
          interests: [],
          accessibility: [],
          preferences: {}
        };
        this.touristProfiles.set(touristProfile.id, touristProfile);
      }

      // Analisar intenção da mensagem
      const intent = this.analyzeIntent(message);
      
      // Gerar resposta baseada na intenção
      let response = '';
      let suggestions: RouteSuggestion[] = [];
      
      switch (intent) {
        case 'greeting':
          response = await this.translateText('Olá! Bem-vindo ao Mato Grosso do Sul. Como posso ajudá-lo hoje?', detectedLanguage);
          break;
          
        case 'information_request':
          response = await this.translateText('Posso fornecer informações sobre destinos, roteiros, reservas e muito mais. O que você gostaria de saber?', detectedLanguage);
          break;
          
        case 'route_request':
          suggestions = await this.suggestRoutes(touristProfile);
          response = await this.translateText(`Encontrei ${suggestions.length} roteiros que podem interessar você. Posso detalhar cada um deles.`, detectedLanguage);
          break;
          
        case 'booking_request':
          response = await this.translateText('Posso ajudá-lo com reservas de hotéis, restaurantes, transportes e atividades. Que tipo de reserva você precisa?', detectedLanguage);
          break;
          
        case 'accessibility_request':
          const accessibilityResponse = await this.provideAccessibilitySupport({ type: 'general', details: {} });
          response = await this.translateText(accessibilityResponse, detectedLanguage);
          break;
          
        default:
          response = await this.translateText('Desculpe, não entendi sua solicitação. Pode reformular?', detectedLanguage);
      }

      // Criar mensagem de resposta
      const aiMessage: AttendanceAIMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai_response',
        content: response,
        timestamp: new Date().toISOString(),
        language: detectedLanguage,
        suggestions,
        touristId: touristProfile.id
      };

      // Adicionar ao histórico
      this.conversationHistory.push(aiMessage);
      
      return aiMessage;
    } catch (error) {
      console.error('❌ Erro no processamento de mensagem:', error);
      throw error;
    }
  }

  // Analisar intenção da mensagem
  private analyzeIntent(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('olá') || lowerMessage.includes('oi') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return 'greeting';
    }
    
    if (lowerMessage.includes('informação') || lowerMessage.includes('saber') || lowerMessage.includes('information') || lowerMessage.includes('know')) {
      return 'information_request';
    }
    
    if (lowerMessage.includes('roteiro') || lowerMessage.includes('itinerário') || lowerMessage.includes('route') || lowerMessage.includes('tour')) {
      return 'route_request';
    }
    
    if (lowerMessage.includes('reserva') || lowerMessage.includes('booking') || lowerMessage.includes('agendar') || lowerMessage.includes('book')) {
      return 'booking_request';
    }
    
    if (lowerMessage.includes('acessibilidade') || lowerMessage.includes('deficiência') || lowerMessage.includes('accessibility') || lowerMessage.includes('disability')) {
      return 'accessibility_request';
    }
    
    return 'unknown';
  }

  // Obter histórico de conversa
  getConversationHistory(touristId?: string): AttendanceAIMessage[] {
    if (touristId) {
      return this.conversationHistory.filter(msg => msg.touristId === touristId);
    }
    return this.conversationHistory;
  }

  // Limpar histórico
  clearHistory(): void {
    this.conversationHistory = [];
    console.log('🧹 Histórico de conversas limpo');
  }

  // Obter estatísticas
  getStats(): { totalConversations: number; totalTourists: number; averageResponseTime: number } {
    return {
      totalConversations: this.conversationHistory.length,
      totalTourists: this.touristProfiles.size,
      averageResponseTime: 1.2 // Mock - implementar cálculo real
    };
  }
}

// Instância singleton
export const attendanceAI = AttendanceAI.getInstance();

// Utilitários
export const formatAIMessage = (message: AttendanceAIMessage): string => {
  return `[${message.language.toUpperCase()}] ${message.content}`;
};

export const validateTouristProfile = (profile: TouristProfile): boolean => {
  return !!(profile.id && profile.name && profile.language);
}; 