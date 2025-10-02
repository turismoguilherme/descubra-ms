/**
 * Sistema de Aprendizado Contínuo para o Guatá
 * Permite que o chatbot aprenda com correções e melhore respostas futuras
 */

export interface UserCorrection {
  id: string;
  userId: string;
  sessionId: string;
  originalQuestion: string;
  guataResponse: string;
  userCorrection: string;
  correctionType: 'factual' | 'tone' | 'completeness' | 'relevance';
  timestamp: Date;
  context: string;
  verified: boolean;
}

export interface LearningPattern {
  pattern: string;
  category: string;
  improvedResponse: string;
  confidence: number;
  usageCount: number;
  lastUsed: Date;
  effectiveness: number; // 0-1 baseado em feedback posterior
}

export interface EmotionalMemory {
  userId: string;
  preferredTone: 'formal' | 'casual' | 'enthusiastic' | 'calm';
  interests: string[];
  previousTopics: string[];
  emotionalState: 'excited' | 'planning' | 'concerned' | 'curious';
  lastInteraction: Date;
  trustLevel: number; // 0-1, aumenta com interações positivas
}

class FeedbackLearningService {
  private corrections: Map<string, UserCorrection> = new Map();
  private learningPatterns: Map<string, LearningPattern> = new Map();
  private emotionalMemory: Map<string, EmotionalMemory> = new Map();
  
  /**
   * Registra uma correção do usuário
   */
  async registerUserCorrection(
    userId: string,
    sessionId: string,
    originalQuestion: string,
    guataResponse: string,
    userCorrection: string,
    context: string
  ): Promise<string> {
    const correctionId = `correction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const correction: UserCorrection = {
      id: correctionId,
      userId,
      sessionId,
      originalQuestion,
      guataResponse,
      userCorrection,
      correctionType: this.detectCorrectionType(userCorrection),
      timestamp: new Date(),
      context,
      verified: false
    };

    this.corrections.set(correctionId, correction);
    
    // Processar aprendizado imediatamente
    await this.processLearningFromCorrection(correction);
    
    console.log(`📝 Correção registrada: ${correctionId}`);
    return correctionId;
  }

  /**
   * Processa o aprendizado a partir de uma correção
   */
  private async processLearningFromCorrection(correction: UserCorrection) {
    const pattern = this.extractPattern(correction.originalQuestion);
    const category = this.categorizeLearning(correction);
    
    const learningPattern: LearningPattern = {
      pattern,
      category,
      improvedResponse: correction.userCorrection,
      confidence: 0.8, // Iniciar com alta confiança para correções diretas
      usageCount: 0,
      lastUsed: new Date(),
      effectiveness: 1.0 // Assumir efetividade inicial alta
    };

    const patternKey = `${category}_${pattern}`;
    this.learningPatterns.set(patternKey, learningPattern);
    
    console.log(`🧠 Padrão aprendido: ${patternKey}`);
  }

  /**
   * Aplica aprendizado a uma nova pergunta
   */
  async applyLearning(question: string, userId: string): Promise<string | null> {
    const questionPattern = this.extractPattern(question);
    
    // Buscar padrão similar aprendido
    for (const [key, pattern] of this.learningPatterns.entries()) {
      if (this.isPatternMatch(questionPattern, pattern.pattern)) {
        // Atualizar estatísticas de uso
        pattern.usageCount++;
        pattern.lastUsed = new Date();
        
        console.log(`✨ Aplicando aprendizado: ${key} (usado ${pattern.usageCount} vezes)`);
        return pattern.improvedResponse;
      }
    }

    return null; // Nenhum aprendizado aplicável encontrado
  }

  /**
   * Atualiza memória emocional do usuário
   */
  updateEmotionalMemory(
    userId: string, 
    question: string, 
    responseReceived: boolean,
    userSatisfaction?: number
  ) {
    let memory = this.emotionalMemory.get(userId);
    
    if (!memory) {
      memory = {
        userId,
        preferredTone: 'casual',
        interests: [],
        previousTopics: [],
        emotionalState: 'curious',
        lastInteraction: new Date(),
        trustLevel: 0.5
      };
    }

    // Detectar interesses
    const detectedInterests = this.detectInterests(question);
    memory.interests = [...new Set([...memory.interests, ...detectedInterests])];
    
    // Detectar tópicos
    const topic = this.detectTopicFromQuestion(question);
    if (topic) {
      memory.previousTopics = [topic, ...memory.previousTopics.slice(0, 4)]; // Manter últimos 5
    }

    // Ajustar nível de confiança
    if (userSatisfaction !== undefined) {
      if (userSatisfaction > 0.7) {
        memory.trustLevel = Math.min(1.0, memory.trustLevel + 0.1);
      } else if (userSatisfaction < 0.3) {
        memory.trustLevel = Math.max(0.0, memory.trustLevel - 0.05);
      }
    }

    memory.lastInteraction = new Date();
    this.emotionalMemory.set(userId, memory);
    
    console.log(`💭 Memória emocional atualizada para ${userId}: trustLevel=${memory.trustLevel.toFixed(2)}`);
  }

  /**
   * Obtém personalização baseada na memória emocional
   */
  getPersonalization(userId: string): EmotionalMemory | null {
    return this.emotionalMemory.get(userId) || null;
  }

  /**
   * Sugere melhorias para o prompt baseado no aprendizado
   */
  suggestPromptImprovement(category: string): string {
    const categoryPatterns = Array.from(this.learningPatterns.values())
      .filter(p => p.category === category)
      .sort((a, b) => b.effectiveness - a.effectiveness);

    if (categoryPatterns.length === 0) return '';

    const topPattern = categoryPatterns[0];
    return `Para perguntas sobre ${category}, considere: ${topPattern.improvedResponse}`;
  }

  /**
   * Relatório de aprendizado
   */
  getLearningReport(): {
    totalCorrections: number;
    totalPatterns: number;
    categories: Record<string, number>;
    mostEffectivePatterns: LearningPattern[];
    usersWithMemory: number;
  } {
    const categories: Record<string, number> = {};
    
    for (const pattern of this.learningPatterns.values()) {
      categories[pattern.category] = (categories[pattern.category] || 0) + 1;
    }

    const mostEffective = Array.from(this.learningPatterns.values())
      .sort((a, b) => b.effectiveness * b.usageCount - a.effectiveness * a.usageCount)
      .slice(0, 5);

    return {
      totalCorrections: this.corrections.size,
      totalPatterns: this.learningPatterns.size,
      categories,
      mostEffectivePatterns: mostEffective,
      usersWithMemory: this.emotionalMemory.size
    };
  }

  // Métodos auxiliares privados
  private detectCorrectionType(correction: string): UserCorrection['correctionType'] {
    const lowerCorrection = correction.toLowerCase();
    
    if (lowerCorrection.includes('errado') || lowerCorrection.includes('incorreto')) {
      return 'factual';
    } else if (lowerCorrection.includes('tom') || lowerCorrection.includes('forma')) {
      return 'tone';
    } else if (lowerCorrection.includes('faltou') || lowerCorrection.includes('mais')) {
      return 'completeness';
    } else {
      return 'relevance';
    }
  }

  private extractPattern(question: string): string {
    // Simplificar pergunta para encontrar padrão
    return question
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .slice(0, 5) // Primeiras 5 palavras
      .join(' ');
  }

  private categorizeLearning(correction: UserCorrection): string {
    const question = correction.originalQuestion.toLowerCase();
    
    if (question.includes('hotel') || question.includes('hospedagem')) return 'hospedagem';
    if (question.includes('restaurante') || question.includes('comida')) return 'gastronomia';
    if (question.includes('transporte') || question.includes('aeroporto')) return 'transporte';
    if (question.includes('pantanal')) return 'pantanal';
    if (question.includes('bonito')) return 'bonito';
    if (question.includes('campo grande')) return 'campo_grande';
    
    return 'geral';
  }

  private isPatternMatch(pattern1: string, pattern2: string): boolean {
    const words1 = pattern1.split(' ');
    const words2 = pattern2.split(' ');
    
    const commonWords = words1.filter(word => words2.includes(word));
    return commonWords.length >= Math.min(2, Math.min(words1.length, words2.length) / 2);
  }

  private detectInterests(question: string): string[] {
    const interests: string[] = [];
    const lowerQuestion = question.toLowerCase();
    
    const interestMap = {
      'ecoturismo': ['natureza', 'gruta', 'rio', 'mergulho', 'animais'],
      'gastronomia': ['comida', 'restaurante', 'pratos', 'bebida'],
      'aventura': ['trilha', 'rapel', 'adrenalina', 'esporte'],
      'cultura': ['história', 'museu', 'cultura', 'tradição'],
      'relaxamento': ['spa', 'descanso', 'tranquilo', 'paz']
    };

    for (const [interest, keywords] of Object.entries(interestMap)) {
      if (keywords.some(keyword => lowerQuestion.includes(keyword))) {
        interests.push(interest);
      }
    }

    return interests;
  }

  private detectTopicFromQuestion(question: string): string | null {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('hotel') || lowerQuestion.includes('hospedagem')) return 'hotel';
    if (lowerQuestion.includes('transporte') || lowerQuestion.includes('aeroporto')) return 'transporte';
    if (lowerQuestion.includes('restaurante')) return 'restaurante';
    if (lowerQuestion.includes('pantanal')) return 'pantanal';
    if (lowerQuestion.includes('bonito')) return 'bonito';
    
    return null;
  }
}

export const feedbackLearningService = new FeedbackLearningService();












