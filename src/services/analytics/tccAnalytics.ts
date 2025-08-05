// Sistema de Analytics para TCC

export interface TCCSession {
  id: string;
  startTime: string;
  endTime?: string;
  totalMessages: number;
  totalTime: number;
  feedbackCount: { positive: number; negative: number };
  popularTopics: string[];
  userInteractions: TCCInteraction[];
  deviceInfo: {
    userAgent: string;
    screenSize: string;
    language: string;
  };
  location?: {
    city?: string;
    region?: string;
    country?: string;
  };
}

export interface TCCInteraction {
  type: 'message' | 'feedback' | 'clear' | 'suggestion_click' | 'page_view';
  timestamp: string;
  data?: any;
  sessionId: string;
}

export interface TCCAnalytics {
  sessions: TCCSession[];
  totalSessions: number;
  averageSessionTime: number;
  averageMessagesPerSession: number;
  satisfactionRate: number;
  mostPopularTopics: string[];
  deviceBreakdown: { [key: string]: number };
  timeDistribution: { [key: string]: number };
}

class TCCAnalyticsService {
  private sessions: TCCSession[] = [];
  private currentSession: TCCSession | null = null;

  /**
   * Iniciar nova sessão
   */
  startSession(): TCCSession {
    const session: TCCSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      startTime: new Date().toISOString(),
      totalMessages: 0,
      totalTime: 0,
      feedbackCount: { positive: 0, negative: 0 },
      popularTopics: [],
      userInteractions: [],
      deviceInfo: {
        userAgent: navigator.userAgent,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language
      }
    };

    this.currentSession = session;
    this.sessions.push(session);
    
    // Salvar no localStorage
    this.saveToStorage();
    
    console.log('📊 TCC Analytics: Nova sessão iniciada:', session.id);
    return session;
  }

  /**
   * Finalizar sessão atual
   */
  endSession(): void {
    if (this.currentSession) {
      this.currentSession.endTime = new Date().toISOString();
      this.saveToStorage();
      console.log('📊 TCC Analytics: Sessão finalizada:', this.currentSession.id);
      this.currentSession = null;
    }
  }

  /**
   * Registrar interação
   */
  recordInteraction(type: TCCInteraction['type'], data?: any): void {
    if (!this.currentSession) {
      this.startSession();
    }

    const interaction: TCCInteraction = {
      type,
      timestamp: new Date().toISOString(),
      data,
      sessionId: this.currentSession!.id
    };

    this.currentSession!.userInteractions.push(interaction);

    // Atualizar estatísticas baseadas no tipo
    switch (type) {
      case 'message':
        this.currentSession!.totalMessages++;
        if (data?.message) {
          this.updatePopularTopics(data.message);
        }
        break;
      case 'feedback':
        if (data?.positive) {
          this.currentSession!.feedbackCount.positive++;
        } else {
          this.currentSession!.feedbackCount.negative++;
        }
        break;
    }

    this.saveToStorage();
  }

  /**
   * Atualizar tempo da sessão
   */
  updateSessionTime(seconds: number): void {
    if (this.currentSession) {
      this.currentSession.totalTime = seconds;
      this.saveToStorage();
    }
  }

  /**
   * Atualizar tópicos populares
   */
  private updatePopularTopics(message: string): void {
    const topics = this.extractTopics(message);
    this.currentSession!.popularTopics.push(...topics);
    
    // Manter apenas os top 10
    this.currentSession!.popularTopics = this.currentSession!.popularTopics.slice(-10);
  }

  /**
   * Extrair tópicos da mensagem
   */
  private extractTopics(message: string): string[] {
    const topics: string[] = [];
    const lowerMessage = message.toLowerCase();
    
    // Palavras-chave para categorização
    const keywords = {
      'bonito': 'Bonito',
      'campo grande': 'Campo Grande',
      'pantanal': 'Pantanal',
      'hotel': 'Hospedagem',
      'restaurante': 'Gastronomia',
      'trilha': 'Ecoturismo',
      'gruta': 'Ecoturismo',
      'roteiro': 'Planejamento',
      'preço': 'Informações',
      'como chegar': 'Transporte',
      'atração': 'Turismo',
      'passeio': 'Turismo'
    };

    for (const [keyword, category] of Object.entries(keywords)) {
      if (lowerMessage.includes(keyword)) {
        topics.push(category);
      }
    }

    return topics;
  }

  /**
   * Gerar relatório completo
   */
  generateReport(): TCCAnalytics {
    const totalSessions = this.sessions.length;
    const totalTime = this.sessions.reduce((sum, session) => sum + session.totalTime, 0);
    const totalMessages = this.sessions.reduce((sum, session) => sum + session.totalMessages, 0);
    const totalFeedback = this.sessions.reduce((sum, session) => 
      sum + session.feedbackCount.positive + session.feedbackCount.negative, 0
    );
    const positiveFeedback = this.sessions.reduce((sum, session) => 
      sum + session.feedbackCount.positive, 0
    );

    // Calcular satisfação
    const satisfactionRate = totalFeedback > 0 ? (positiveFeedback / totalFeedback) * 100 : 0;

    // Tópicos mais populares
    const allTopics = this.sessions.flatMap(session => session.popularTopics);
    const topicCounts: { [key: string]: number } = {};
    allTopics.forEach(topic => {
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });
    const mostPopularTopics = Object.entries(topicCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([topic]) => topic);

    // Distribuição de dispositivos
    const deviceBreakdown: { [key: string]: number } = {};
    this.sessions.forEach(session => {
      const device = this.categorizeDevice(session.deviceInfo.userAgent);
      deviceBreakdown[device] = (deviceBreakdown[device] || 0) + 1;
    });

    // Distribuição de tempo
    const timeDistribution: { [key: string]: number } = {};
    this.sessions.forEach(session => {
      const timeRange = this.categorizeTime(session.totalTime);
      timeDistribution[timeRange] = (timeDistribution[timeRange] || 0) + 1;
    });

    return {
      sessions: this.sessions,
      totalSessions,
      averageSessionTime: totalSessions > 0 ? totalTime / totalSessions : 0,
      averageMessagesPerSession: totalSessions > 0 ? totalMessages / totalSessions : 0,
      satisfactionRate,
      mostPopularTopics,
      deviceBreakdown,
      timeDistribution
    };
  }

  /**
   * Categorizar dispositivo
   */
  private categorizeDevice(userAgent: string): string {
    if (userAgent.includes('Mobile')) return 'Mobile';
    if (userAgent.includes('Tablet')) return 'Tablet';
    return 'Desktop';
  }

  /**
   * Categorizar tempo de sessão
   */
  private categorizeTime(seconds: number): string {
    if (seconds < 60) return '0-1 min';
    if (seconds < 300) return '1-5 min';
    if (seconds < 900) return '5-15 min';
    return '15+ min';
  }

  /**
   * Exportar dados para CSV
   */
  exportToCSV(): string {
    const headers = [
      'Session ID',
      'Start Time',
      'End Time',
      'Total Messages',
      'Total Time (seconds)',
      'Positive Feedback',
      'Negative Feedback',
      'Popular Topics',
      'Device Type',
      'Screen Size'
    ];

    const rows = this.sessions.map(session => [
      session.id,
      session.startTime,
      session.endTime || '',
      session.totalMessages,
      session.totalTime,
      session.feedbackCount.positive,
      session.feedbackCount.negative,
      session.popularTopics.join(';'),
      this.categorizeDevice(session.deviceInfo.userAgent),
      session.deviceInfo.screenSize
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csvContent;
  }

  /**
   * Salvar no localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem('guata_tcc_sessions', JSON.stringify(this.sessions));
    } catch (error) {
      console.error('❌ Erro ao salvar analytics:', error);
    }
  }

  /**
   * Carregar do localStorage
   */
  loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('guata_tcc_sessions');
      if (stored) {
        this.sessions = JSON.parse(stored);
        console.log('📊 TCC Analytics: Dados carregados:', this.sessions.length, 'sessões');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar analytics:', error);
    }
  }

  /**
   * Limpar dados antigos (mais de 30 dias)
   */
  cleanupOldData(): void {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    this.sessions = this.sessions.filter(session => {
      const sessionDate = new Date(session.startTime);
      return sessionDate > thirtyDaysAgo;
    });

    this.saveToStorage();
    console.log('📊 TCC Analytics: Dados antigos removidos');
  }

  /**
   * Obter sessão atual
   */
  getCurrentSession(): TCCSession | null {
    return this.currentSession;
  }

  /**
   * Obter estatísticas em tempo real
   */
  getRealTimeStats(): {
    currentSession: TCCSession | null;
    totalSessions: number;
    totalMessages: number;
    satisfactionRate: number;
  } {
    const totalSessions = this.sessions.length;
    const totalMessages = this.sessions.reduce((sum, session) => sum + session.totalMessages, 0);
    const totalFeedback = this.sessions.reduce((sum, session) => 
      sum + session.feedbackCount.positive + session.feedbackCount.negative, 0
    );
    const positiveFeedback = this.sessions.reduce((sum, session) => 
      sum + session.feedbackCount.positive, 0
    );
    const satisfactionRate = totalFeedback > 0 ? (positiveFeedback / totalFeedback) * 100 : 0;

    return {
      currentSession: this.currentSession,
      totalSessions,
      totalMessages,
      satisfactionRate
    };
  }
}

export const tccAnalyticsService = new TCCAnalyticsService();

// Carregar dados salvos ao inicializar
tccAnalyticsService.loadFromStorage(); 