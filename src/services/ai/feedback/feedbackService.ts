// Sistema de Feedback e Aprendizado do Guatá
// Permite que o usuário corrija e melhore as respostas

export interface FeedbackData {
  id: string;
  sessionId: string;
  questionId: string;
  originalQuestion: string;
  originalAnswer: string;
  rating: 'positive' | 'negative' | 'neutral';
  comment?: string;
  correction?: string;
  correctedAnswer?: string;
  timestamp: Date;
  processed: boolean;
  learningApplied: boolean;
}

export interface LearningEntry {
  id: string;
  pattern: string;
  correction: string;
  confidence: number;
  usageCount: number;
  lastUsed: Date;
  createdAt: Date;
}

export interface FeedbackStats {
  totalFeedback: number;
  positiveFeedback: number;
  negativeFeedback: number;
  neutralFeedback: number;
  correctionsApplied: number;
  learningPatterns: number;
}

export class FeedbackService {
  private feedback: Map<string, FeedbackData> = new Map();
  private learningPatterns: Map<string, LearningEntry> = new Map();
  private readonly MIN_CONFIDENCE = 0.7;

  /**
   * Registra feedback do usuário
   */
  registerFeedback(
    sessionId: string,
    questionId: string,
    originalQuestion: string,
    originalAnswer: string,
    rating: FeedbackData['rating'],
    comment?: string,
    correction?: string
  ): string {
    const feedbackId = `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const feedbackData: FeedbackData = {
      id: feedbackId,
      sessionId,
      questionId,
      originalQuestion,
      originalAnswer,
      rating,
      comment,
      correction,
      timestamp: new Date(),
      processed: false,
      learningApplied: false
    };

    this.feedback.set(feedbackId, feedbackData);
    
    console.log(`📊 Feedback registrado: ${rating} para pergunta ${questionId}`);
    
    // Processar feedback automaticamente
    this.processFeedback(feedbackId);
    
    return feedbackId;
  }

  /**
   * Processa feedback para extrair padrões de aprendizado
   */
  private async processFeedback(feedbackId: string): Promise<void> {
    const feedback = this.feedback.get(feedbackId);
    if (!feedback || feedback.processed) return;

    try {
      console.log(`🧠 Processando feedback ${feedbackId} para aprendizado`);
      
      if (feedback.rating === 'negative' && feedback.correction) {
        await this.extractLearningPattern(feedback);
      }
      
      // Marcar como processado
      feedback.processed = true;
      this.feedback.set(feedbackId, feedback);
      
      console.log(`✅ Feedback ${feedbackId} processado com sucesso`);
      
    } catch (error) {
      console.error(`❌ Erro ao processar feedback ${feedbackId}:`, error);
    }
  }

  /**
   * Extrai padrões de aprendizado do feedback negativo
   */
  private async extractLearningPattern(feedback: FeedbackData): Promise<void> {
    if (!feedback.correction) return;

    const originalText = feedback.originalAnswer.toLowerCase();
    const correctionText = feedback.correction.toLowerCase();
    
    // Identificar padrões comuns de erro
    const patterns = this.identifyErrorPatterns(originalText, correctionText);
    
    patterns.forEach(pattern => {
      const existingPattern = this.learningPatterns.get(pattern.key);
      
      if (existingPattern) {
        // Atualizar padrão existente
        existingPattern.confidence = Math.min(1.0, existingPattern.confidence + 0.1);
        existingPattern.usageCount += 1;
        existingPattern.lastUsed = new Date();
        this.learningPatterns.set(pattern.key, existingPattern);
      } else {
        // Criar novo padrão
        const newPattern: LearningEntry = {
          id: `pattern-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          pattern: pattern.key,
          correction: pattern.correction,
          confidence: this.MIN_CONFIDENCE,
          usageCount: 1,
          lastUsed: new Date(),
          createdAt: new Date()
        };
        
        this.learningPatterns.set(pattern.key, newPattern);
        console.log(`🎯 Novo padrão de aprendizado criado: ${pattern.key}`);
      }
    });
  }

  /**
   * Identifica padrões de erro entre resposta original e correção
   */
  private identifyErrorPatterns(original: string, correction: string): Array<{key: string, correction: string}> {
    const patterns: Array<{key: string, correction: string}> = [];
    
    // Padrões comuns de erro em turismo
    const commonPatterns = [
      // Informações incorretas sobre preços
      {
        regex: /(\d+)\s*reais?/gi,
        type: 'price_error'
      },
      // Horários incorretos
      {
        regex: /(\d{1,2})[h:](\d{2})/gi,
        type: 'time_error'
      },
      // Endereços incorretos
      {
        regex: /(rua|av|avenida|rodovia)\s+[^,]+/gi,
        type: 'address_error'
      },
      // Telefones incorretos
      {
        regex: /\(\d{2}\)\s*\d{4,5}-\d{4}/gi,
        type: 'phone_error'
      },
      // Sites incorretos
      {
        regex: /https?:\/\/[^\s]+/gi,
        type: 'website_error'
      }
    ];

    commonPatterns.forEach(({ regex, type }) => {
      const originalMatches = original.match(regex);
      const correctionMatches = correction.match(regex);
      
      if (originalMatches && correctionMatches) {
        originalMatches.forEach((match, index) => {
          const correctionMatch = correctionMatches[index];
          if (match !== correctionMatch) {
            patterns.push({
              key: `${type}:${match}`,
              correction: correctionMatch
            });
          }
        });
      }
    });

    return patterns;
  }

  /**
   * Aplica correções aprendidas a uma nova resposta
   */
  applyLearningCorrections(answer: string): string {
    let correctedAnswer = answer;
    
    this.learningPatterns.forEach((pattern, key) => {
      if (pattern.confidence >= this.MIN_CONFIDENCE) {
        // Aplicar correção se o padrão for encontrado
        if (correctedAnswer.toLowerCase().includes(pattern.pattern.toLowerCase())) {
          correctedAnswer = correctedAnswer.replace(
            new RegExp(pattern.pattern, 'gi'),
            pattern.correction
          );
          
          // Atualizar estatísticas do padrão
          pattern.usageCount += 1;
          pattern.lastUsed = new Date();
          this.learningPatterns.set(key, pattern);
          
          console.log(`🔧 Correção aplicada: ${pattern.pattern} → ${pattern.correction}`);
        }
      }
    });
    
    return correctedAnswer;
  }

  /**
   * Obtém estatísticas de feedback
   */
  getFeedbackStats(): FeedbackStats {
    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;
    let correctionsCount = 0;

    this.feedback.forEach(feedback => {
      switch (feedback.rating) {
        case 'positive':
          positiveCount++;
          break;
        case 'negative':
          negativeCount++;
          if (feedback.correction) correctionsCount++;
          break;
        case 'neutral':
          neutralCount++;
          break;
      }
    });

    return {
      totalFeedback: this.feedback.size,
      positiveFeedback: positiveCount,
      negativeFeedback: negativeCount,
      neutralFeedback: neutralCount,
      correctionsApplied: correctionsCount,
      learningPatterns: this.learningPatterns.size
    };
  }

  /**
   * Obtém feedback por sessão
   */
  getFeedbackBySession(sessionId: string): FeedbackData[] {
    const sessionFeedback: FeedbackData[] = [];
    
    this.feedback.forEach(feedback => {
      if (feedback.sessionId === sessionId) {
        sessionFeedback.push(feedback);
      }
    });
    
    return sessionFeedback.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Obtém padrões de aprendizado mais relevantes
   */
  getTopLearningPatterns(limit: number = 10): LearningEntry[] {
    const patterns = Array.from(this.learningPatterns.values());
    
    return patterns
      .sort((a, b) => {
        // Ordenar por confiança e uso
        const scoreA = a.confidence * Math.log(a.usageCount + 1);
        const scoreB = b.confidence * Math.log(b.usageCount + 1);
        return scoreB - scoreA;
      })
      .slice(0, limit);
  }

  /**
   * Remove padrões de aprendizado obsoletos
   */
  cleanupObsoletePatterns(): void {
    const now = Date.now();
    const OBSOLETE_THRESHOLD = 30 * 24 * 60 * 60 * 1000; // 30 dias
    
    const obsoletePatterns: string[] = [];
    
    this.learningPatterns.forEach((pattern, key) => {
      if (now - pattern.lastUsed.getTime() > OBSOLETE_THRESHOLD && pattern.usageCount < 3) {
        obsoletePatterns.push(key);
      }
    });
    
    obsoletePatterns.forEach(key => {
      this.learningPatterns.delete(key);
      console.log(`🧹 Padrão obsoleto removido: ${key}`);
    });
  }

  /**
   * Exporta dados de aprendizado para análise
   */
  exportLearningData(): {
    feedback: FeedbackData[];
    patterns: LearningEntry[];
    stats: FeedbackStats;
  } {
    return {
      feedback: Array.from(this.feedback.values()),
      patterns: Array.from(this.learningPatterns.values()),
      stats: this.getFeedbackStats()
    };
  }

  /**
   * Importa dados de aprendizado (para backup/restore)
   */
  importLearningData(data: {
    feedback: FeedbackData[];
    patterns: LearningEntry[];
  }): void {
    // Importar feedback
    data.feedback.forEach(feedback => {
      this.feedback.set(feedback.id, feedback);
    });
    
    // Importar padrões
    data.patterns.forEach(pattern => {
      this.learningPatterns.set(pattern.pattern, pattern);
    });
    
    console.log(`📥 Dados de aprendizado importados: ${data.feedback.length} feedbacks, ${data.patterns.length} padrões`);
  }

  /**
   * Gera relatório de aprendizado
   */
  generateLearningReport(): string {
    const stats = this.getFeedbackStats();
    const topPatterns = this.getTopLearningPatterns(5);
    
    let report = `# 📊 RELATÓRIO DE APRENDIZADO DO GUATÁ\n\n`;
    
    report += `## 📈 ESTATÍSTICAS GERAIS\n`;
    report += `- **Total de Feedback:** ${stats.totalFeedback}\n`;
    report += `- **Feedback Positivo:** ${stats.positiveFeedback} (${((stats.positiveFeedback / stats.totalFeedback) * 100).toFixed(1)}%)\n`;
    report += `- **Feedback Negativo:** ${stats.negativeFeedback} (${((stats.negativeFeedback / stats.totalFeedback) * 100).toFixed(1)}%)\n`;
    report += `- **Correções Aplicadas:** ${stats.correctionsApplied}\n`;
    report += `- **Padrões de Aprendizado:** ${stats.learningPatterns}\n\n`;
    
    if (topPatterns.length > 0) {
      report += `## 🎯 PADRÕES DE APRENDIZADO MAIS RELEVANTES\n`;
      topPatterns.forEach((pattern, index) => {
        report += `${index + 1}. **${pattern.pattern}**\n`;
        report += `   - Correção: ${pattern.correction}\n`;
        report += `   - Confiança: ${(pattern.confidence * 100).toFixed(1)}%\n`;
        report += `   - Usos: ${pattern.usageCount}\n`;
        report += `   - Último uso: ${pattern.lastUsed.toLocaleDateString()}\n\n`;
      });
    }
    
    report += `## 💡 RECOMENDAÇÕES\n`;
    
    if (stats.negativeFeedback > stats.positiveFeedback) {
      report += `- ⚠️ **Atenção:** Taxa de feedback negativo alta\n`;
      report += `- 🔍 **Ação:** Revisar respostas sobre temas problemáticos\n`;
    }
    
    if (stats.learningPatterns < 5) {
      report += `- 📚 **Oportunidade:** Poucos padrões de aprendizado\n`;
      report += `- 🎯 **Ação:** Incentivar feedback detalhado dos usuários\n`;
    }
    
    report += `- 📅 **Próxima revisão:** ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}\n`;
    
    return report;
  }
}

// Instância singleton
export const feedbackService = new FeedbackService();

// Limpeza automática a cada hora
setInterval(() => {
  feedbackService.cleanupObsoletePatterns();
}, 60 * 60 * 1000);

