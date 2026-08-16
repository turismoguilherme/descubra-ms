// Sistema de Memória de Sessão do Guatá
// Mantém contexto e personalização durante a conversa

export interface SessionMemory {
  sessionId: string;
  userId?: string;
  startTime: Date;
  lastActivity: Date;
  conversationHistory: ConversationEntry[];
  userPreferences: UserPreferences;
  context: ConversationContext;
  feedback: FeedbackEntry[];
}

export interface ConversationEntry {
  id: string;
  timestamp: Date;
  type: 'user' | 'assistant';
  content: string;
  questionType?: string;
  confidence?: number;
  sources?: string[];
}

export interface UserPreferences {
  travelStyle: 'adventure' | 'cultural' | 'relaxation' | 'family' | 'luxury';
  budget: 'low' | 'medium' | 'high';
  groupSize: number;
  interests: string[];
  previousDestinations: string[];
  preferredActivities: string[];
}

export interface ConversationContext {
  currentTopic: string;
  lastQuestion: string;
  mentionedDestinations: string[];
  mentionedActivities: string[];
  pendingSuggestions: string[];
  userMood: 'curious' | 'planning' | 'urgent' | 'casual';
}

export interface FeedbackEntry {
  id: string;
  timestamp: Date;
  questionId: string;
  rating: 'positive' | 'negative' | 'neutral';
  comment?: string;
  correction?: string;
  originalAnswer: string;
}

export class SessionMemoryService {
  private sessions: Map<string, SessionMemory> = new Map();
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos

  /**
   * Cria ou recupera uma sessão
   */
  createOrGetSession(sessionId: string, userId?: string): SessionMemory {
    let session = this.sessions.get(sessionId);
    
    if (!session) {
      session = this.createNewSession(sessionId, userId);
      this.sessions.set(sessionId, session);
      console.log(`🧠 Nova sessão criada: ${sessionId}`);
    } else {
      // Atualizar última atividade
      session.lastActivity = new Date();
    }
    
    return session;
  }

  /**
   * Cria uma nova sessão
   */
  private createNewSession(sessionId: string, userId?: string): SessionMemory {
    return {
      sessionId,
      userId,
      startTime: new Date(),
      lastActivity: new Date(),
      conversationHistory: [],
      userPreferences: this.initializeUserPreferences(),
      context: this.initializeConversationContext(),
      feedback: []
    };
  }

  /**
   * Inicializa preferências padrão do usuário
   */
  private initializeUserPreferences(): UserPreferences {
    return {
      travelStyle: 'cultural',
      budget: 'medium',
      groupSize: 1,
      interests: [],
      previousDestinations: [],
      preferredActivities: []
    };
  }

  /**
   * Inicializa contexto da conversa
   */
  private initializeConversationContext(): ConversationContext {
    return {
      currentTopic: 'general',
      lastQuestion: '',
      mentionedDestinations: [],
      mentionedActivities: [],
      pendingSuggestions: [],
      userMood: 'curious'
    };
  }

  /**
   * Adiciona entrada na conversa
   */
  addConversationEntry(
    sessionId: string, 
    type: 'user' | 'assistant', 
    content: string, 
    metadata?: Partial<ConversationEntry>
  ): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const entry: ConversationEntry = {
      id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type,
      content,
      ...metadata
    };

    session.conversationHistory.push(entry);
    session.lastActivity = new Date();

    // Atualizar contexto baseado na entrada
    this.updateConversationContext(session, entry);
    
    console.log(`📝 Entrada adicionada à sessão ${sessionId}: ${type}`);
  }

  /**
   * Atualiza contexto da conversa baseado na entrada
   */
  private updateConversationContext(session: SessionMemory, entry: ConversationEntry): void {
    if (entry.type === 'user') {
      session.context.lastQuestion = entry.content;
      session.context.userMood = this.analyzeUserMood(entry.content);
      
      // Extrair destinos mencionados
      const destinations = this.extractDestinations(entry.content);
      session.context.mentionedDestinations.push(...destinations);
      
      // Extrair atividades mencionadas
      const activities = this.extractActivities(entry.content);
      session.context.mentionedActivities.push(...activities);
    }
  }

  /**
   * Analisa o humor do usuário baseado na pergunta
   */
  private analyzeUserMood(content: string): ConversationContext['userMood'] {
    const text = content.toLowerCase();
    
    if (text.includes('urgente') || text.includes('agora') || text.includes('hoje')) {
      return 'urgent';
    }
    
    if (text.includes('planejar') || text.includes('roteiro') || text.includes('itinerário')) {
      return 'planning';
    }
    
    if (text.includes('curioso') || text.includes('quero saber') || text.includes('conte')) {
      return 'curious';
    }
    
    return 'casual';
  }

  /**
   * Extrai destinos mencionados na pergunta
   */
  private extractDestinations(content: string): string[] {
    const destinations = [
      'Bonito', 'Campo Grande', 'Corumbá', 'Dourados', 'Três Lagoas',
      'Ponta Porã', 'Aquidauana', 'Coxim', 'Nova Andradina', 'Paranaíba',
      'Rio Verde de Mato Grosso', 'Sidrolândia', 'Naviraí', 'Maracaju',
      'Jardim', 'Bodoquena', 'Miranda', 'Anastácio', 'Ladário'
    ];
    
    return destinations.filter(dest => 
      content.toLowerCase().includes(dest.toLowerCase())
    );
  }

  /**
   * Extrai atividades mencionadas na pergunta
   */
  private extractActivities(content: string): string[] {
    const activities = [
      'ecoturismo', 'trilha', 'rapel', 'rafting', 'snorkeling',
      'passeio de barco', 'observação de aves', 'fotografia',
      'gastronomia', 'cultura', 'história', 'museu', 'igreja',
      'shopping', 'parque', 'praça', 'teatro', 'cinema'
    ];
    
    return activities.filter(activity => 
      content.toLowerCase().includes(activity)
    );
  }

  /**
   * Atualiza preferências do usuário baseado na conversa
   */
  updateUserPreferences(sessionId: string, updates: Partial<UserPreferences>): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.userPreferences = { ...session.userPreferences, ...updates };
    console.log(`👤 Preferências atualizadas para sessão ${sessionId}`);
  }

  /**
   * Adiciona feedback do usuário
   */
  addFeedback(
    sessionId: string, 
    questionId: string, 
    rating: FeedbackEntry['rating'], 
    comment?: string, 
    correction?: string,
    originalAnswer?: string
  ): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const feedback: FeedbackEntry = {
      id: `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      questionId,
      rating,
      comment,
      correction,
      originalAnswer: originalAnswer || ''
    };

    session.feedback.push(feedback);
    console.log(`📊 Feedback adicionado: ${rating} para pergunta ${questionId}`);
  }

  /**
   * Obtém histórico da conversa
   */
  getConversationHistory(sessionId: string, limit: number = 10): ConversationEntry[] {
    const session = this.sessions.get(sessionId);
    if (!session) return [];

    return session.conversationHistory.slice(-limit);
  }

  /**
   * Obtém contexto da conversa
   */
  getConversationContext(sessionId: string): ConversationContext | null {
    const session = this.sessions.get(sessionId);
    return session?.context || null;
  }

  /**
   * Obtém preferências do usuário
   */
  getUserPreferences(sessionId: string): UserPreferences | null {
    const session = this.sessions.get(sessionId);
    return session?.userPreferences || null;
  }

  /**
   * Gera resumo da sessão para IA
   */
  generateSessionSummary(sessionId: string): string {
    const session = this.sessions.get(sessionId);
    if (!session) return '';

    const history = session.conversationHistory.slice(-5); // Últimas 5 entradas
    const preferences = session.userPreferences;
    const context = session.context;

    let summary = `## 📋 RESUMO DA SESSÃO ${sessionId}\n\n`;
    
    if (history.length > 0) {
      summary += `### 💬 ÚLTIMAS INTERAÇÕES:\n`;
      history.forEach(entry => {
        const type = entry.type === 'user' ? '👤' : '🤖';
        summary += `${type} ${entry.content.substring(0, 100)}...\n`;
      });
      summary += '\n';
    }

    if (preferences.interests.length > 0) {
      summary += `### 🎯 INTERESSES IDENTIFICADOS:\n`;
      summary += `${preferences.interests.join(', ')}\n\n`;
    }

    if (context.mentionedDestinations.length > 0) {
      summary += `### 🗺️ DESTINOS MENCIONADOS:\n`;
      summary += `${context.mentionedDestinations.join(', ')}\n\n`;
    }

    if (context.mentionedActivities.length > 0) {
      summary += `### 🎪 ATIVIDADES MENCIONADAS:\n`;
      summary += `${context.mentionedActivities.join(', ')}\n\n`;
    }

    summary += `### 🎭 HUMOR DO USUÁRIO: ${context.userMood}\n`;
    summary += `### 💰 ESTILO DE VIAGEM: ${preferences.travelStyle}\n`;
    summary += `### 👥 TAMANHO DO GRUPO: ${preferences.groupSize} pessoa(s)\n`;

    return summary;
  }

  /**
   * Limpa sessões expiradas
   */
  cleanupExpiredSessions(): void {
    const now = Date.now();
    const expiredSessions: string[] = [];

    this.sessions.forEach((session, sessionId) => {
      if (now - session.lastActivity.getTime() > this.SESSION_TIMEOUT) {
        expiredSessions.push(sessionId);
      }
    });

    expiredSessions.forEach(sessionId => {
      this.sessions.delete(sessionId);
      console.log(`🧹 Sessão expirada removida: ${sessionId}`);
    });
  }

  /**
   * Obtém estatísticas das sessões
   */
  getSessionStats(): {
    totalSessions: number;
    activeSessions: number;
    totalConversations: number;
    totalFeedback: number;
  } {
    let totalConversations = 0;
    let totalFeedback = 0;

    this.sessions.forEach(session => {
      totalConversations += session.conversationHistory.length;
      totalFeedback += session.feedback.length;
    });

    return {
      totalSessions: this.sessions.size,
      activeSessions: this.sessions.size,
      totalConversations,
      totalFeedback
    };
  }
}

// Instância singleton
export const sessionMemoryService = new SessionMemoryService();

// Limpeza automática a cada 5 minutos
setInterval(() => {
  sessionMemoryService.cleanupExpiredSessions();
}, 5 * 60 * 1000);

