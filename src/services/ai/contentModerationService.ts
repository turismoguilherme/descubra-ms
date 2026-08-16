/**
 * Content Moderation Service
 * Serviço para moderação de conteúdo usando IA (Gemini) e regras pré-definidas
 * 
 * Funcionalidades:
 * - Verificação de apologia a temas inadequados
 * - Detecção de palavrões
 * - Análise contextual com IA
 * - Sistema de pontuação para aprovação automática
 */

import { generateContent } from '@/config/gemini';

// Lista de palavrões em português brasileiro (lista básica - pode ser expandida)
const PROFANITY_WORDS = [
  // Palavrões comuns
  'caralho', 'porra', 'puta', 'puto', 'foda', 'foder', 'fodido', 'fodida',
  'merda', 'bosta', 'cacete', 'caceta', 'cu', 'buceta', 'xoxota', 'xavasca',
  'viado', 'viadão', 'bicha', 'baitola', 'traveco', 'travesti',
  'filho da puta', 'fdp', 'vsf', 'vai se foder', 'vai tomar no cu',
  // Variações e gírias
  'crl', 'pqp', 'ptqp', 'vtnc', 'vtmnc',
  // Palavras ofensivas
  'idiota', 'imbecil', 'burro', 'burra', 'retardado', 'retardada',
];

// Temas proibidos (palavras-chave que indicam conteúdo inadequado)
const PROHIBITED_TOPICS = [
  // Violência
  'assassinato', 'homicídio', 'matar', 'morte violenta', 'sangue', 'arma', 'tiro',
  // Drogas ilícitas
  'maconha', 'cocaína', 'crack', 'heroína', 'lsd', 'ecstasy', 'drogas ilícitas',
  // Discriminação
  'racismo', 'nazismo', 'fascismo', 'homofobia', 'xenofobia', 'preconceito',
  // Conteúdo sexual explícito
  'pornografia', 'sexo explícito', 'nudez', 'erótico explícito',
  // Outros
  'terrorismo', 'extremismo', 'apologia ao crime',
];

// Palavras de spam
const SPAM_WORDS = [
  'teste', 'test', 'spam', 'xxx', 'promoção urgente', 'clique aqui agora',
  'ganhe dinheiro fácil', 'trabalhe em casa', 'enriquecer rápido',
];

export interface ModerationResult {
  approved: boolean;
  score: number; // 0-100
  flags: {
    hasProfanity: boolean;
    hasProhibitedTopic: boolean;
    hasSpam: boolean;
    aiAnalysis: {
      isAppropriate: boolean;
      confidence: number;
      reason?: string;
    };
  };
  reason?: string;
  needsHumanReview: boolean;
}

export interface ContentAnalysis {
  content: string;
  contentType: 'event' | 'email' | 'comment' | 'description';
  context?: Record<string, any>;
}

class ContentModerationService {
  /**
   * Verifica se conteúdo contém palavrões
   */
  private checkProfanity(content: string): boolean {
    const normalizedContent = content.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    for (const word of PROFANITY_WORDS) {
      const normalizedWord = word.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (normalizedContent.includes(normalizedWord)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Verifica se conteúdo faz apologia a temas proibidos
   */
  private checkProhibitedTopics(content: string): boolean {
    const normalizedContent = content.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    for (const topic of PROHIBITED_TOPICS) {
      const normalizedTopic = topic.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (normalizedContent.includes(normalizedTopic)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Verifica se conteúdo é spam
   */
  private checkSpam(content: string): boolean {
    const normalizedContent = content.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    for (const spamWord of SPAM_WORDS) {
      const normalizedSpam = spamWord.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (normalizedContent.includes(normalizedSpam)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Analisa conteúdo com IA (Gemini) para verificar se é apropriado
   */
  private async analyzeContentWithAI(content: string, contentType: string): Promise<{
    isAppropriate: boolean;
    confidence: number;
    reason?: string;
  }> {
    try {
      const prompt = `Você é um moderador de conteúdo para uma plataforma de turismo do Mato Grosso do Sul.

Analise o seguinte conteúdo e determine se é apropriado para ser publicado em uma plataforma de turismo familiar.

CONTEÚDO:
"${content}"

TIPO DE CONTEÚDO: ${contentType}

INSTRUÇÕES:
1. Verifique se o conteúdo contém palavrões, linguagem ofensiva ou inadequada
2. Verifique se faz apologia a violência, drogas, discriminação ou outros temas proibidos
3. Verifique se é spam ou conteúdo duplicado
4. Verifique se é apropriado para uma plataforma de turismo familiar
5. Verifique se o tom e linguagem são profissionais

RESPONDA APENAS EM JSON NO SEGUINTE FORMATO:
{
  "isAppropriate": true/false,
  "confidence": 0.0-1.0,
  "reason": "explicação breve do motivo"
}

Seja rigoroso mas justo. Conteúdo de turismo deve ser profissional e adequado para todas as idades.`;

      const result = await generateContent(prompt);
      
      if (!result.ok) {
        console.warn('⚠️ [ContentModeration] Erro ao analisar com IA, usando fallback');
        return {
          isAppropriate: true, // Em caso de erro, ser permissivo
          confidence: 0.5,
          reason: 'Análise de IA não disponível',
        };
      }

      try {
        // Tentar extrair JSON da resposta
        const jsonMatch = result.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            isAppropriate: parsed.isAppropriate !== false,
            confidence: parsed.confidence || 0.5,
            reason: parsed.reason,
          };
        }
      } catch (parseError) {
        console.warn('⚠️ [ContentModeration] Erro ao parsear resposta da IA:', parseError);
      }

      // Fallback: analisar texto da resposta
      const responseText = result.text.toLowerCase();
      if (responseText.includes('não apropriado') || responseText.includes('inadequado') || responseText.includes('rejeitar')) {
        return {
          isAppropriate: false,
          confidence: 0.7,
          reason: 'IA identificou conteúdo inadequado',
        };
      }

      return {
        isAppropriate: true,
        confidence: 0.8,
        reason: 'IA não identificou problemas',
      };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ [ContentModeration] Erro na análise com IA:', err);
      return {
        isAppropriate: true, // Em caso de erro, ser permissivo
        confidence: 0.5,
        reason: 'Erro na análise de IA',
      };
    }
  }

  /**
   * Modera conteúdo completo e retorna resultado com pontuação
   */
  async moderateContent(analysis: ContentAnalysis): Promise<ModerationResult> {
    const { content, contentType, context } = analysis;
    
    console.log(`🔍 [ContentModeration] Analisando conteúdo do tipo: ${contentType}`);

    // Verificações básicas
    const hasProfanity = this.checkProfanity(content);
    const hasProhibitedTopic = this.checkProhibitedTopics(content);
    const hasSpam = this.checkSpam(content);

    // Análise com IA
    const aiAnalysis = await this.analyzeContentWithAI(content, contentType);

    // Calcular pontuação (0-100)
    let score = 100;

    // Penalidades
    if (hasProfanity) {
      score -= 40;
      console.log('⚠️ [ContentModeration] Palavrão detectado');
    }
    if (hasProhibitedTopic) {
      score -= 50;
      console.log('⚠️ [ContentModeration] Tema proibido detectado');
    }
    if (hasSpam) {
      score -= 30;
      console.log('⚠️ [ContentModeration] Spam detectado');
    }
    if (!aiAnalysis.isAppropriate) {
      score -= (1 - aiAnalysis.confidence) * 30;
      console.log('⚠️ [ContentModeration] IA identificou conteúdo inadequado');
    }

    // Ajustar pontuação baseado na confiança da IA
    if (aiAnalysis.isAppropriate && aiAnalysis.confidence > 0.8) {
      score += 10; // Bonus por alta confiança
    }

    // Garantir que score está entre 0 e 100
    score = Math.max(0, Math.min(100, score));

    // Determinar aprovação
    const approved = score >= 90;
    const needsHumanReview = score >= 70 && score < 90;

    // Gerar motivo se rejeitado
    let reason: string | undefined;
    if (!approved) {
      const reasons: string[] = [];
      if (hasProfanity) reasons.push('contém palavrões');
      if (hasProhibitedTopic) reasons.push('faz apologia a temas proibidos');
      if (hasSpam) reasons.push('identificado como spam');
      if (!aiAnalysis.isAppropriate) reasons.push(aiAnalysis.reason || 'conteúdo inadequado');
      reason = reasons.join(', ');
    }

    const result: ModerationResult = {
      approved,
      score: Math.round(score),
      flags: {
        hasProfanity,
        hasProhibitedTopic,
        hasSpam,
        aiAnalysis,
      },
      reason,
      needsHumanReview,
    };

    console.log(`📊 [ContentModeration] Resultado: ${approved ? 'APROVADO' : 'REJEITADO'} (Score: ${score})`);

    return result;
  }

  /**
   * Modera um evento específico
   */
  async moderateEvent(event: {
    name?: string;
    title?: string;
    description?: string;
    [key: string]: any;
  }): Promise<ModerationResult> {
    // Combinar todos os campos de texto do evento
    const contentParts: string[] = [];
    if (event.name) contentParts.push(event.name);
    if (event.title) contentParts.push(event.title);
    if (event.description) contentParts.push(event.description);

    const fullContent = contentParts.join(' ');

    return this.moderateContent({
      content: fullContent,
      contentType: 'event',
      context: event,
    });
  }
}

export const contentModerationService = new ContentModerationService();

