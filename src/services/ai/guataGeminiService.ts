// @ts-nocheck

/**
 * 🧠 GUATÁ GEMINI SERVICE - Integração com Gemini AI
 * SEGURANÇA: Todas as chamadas passam pela Edge Function (guata-gemini-proxy)
 * Nenhuma API key é exposta no client-side.
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { guataResponseCacheService } from "./cache/guataResponseCacheService";
import { getErrorMessage } from "@/utils/errorUtils";
import { aiPromptAdminService } from "@/services/admin/aiPromptAdminService";
import { GUATA_DEFAULT_SUGGESTION_QUESTIONS } from "@/components/guata/guataSuggestionDefaults";

/** Política de transparência (parceiros vs web) e tamanho da resposta — preenchido pelo fluxo Guatá. */
export interface GuataGeminiPolicy {
  responseDepth: 'quick' | 'deep';
  isServiceQuestion: boolean;
  partnersCount: number;
  webResultsCount: number;
  hasWebDerived: boolean;
}

export interface GeminiQuery {
  question: string;
  context?: string;
  userLocation?: string;
  conversationHistory?: string[];
  searchResults?: any[];
  isTotemVersion?: boolean;
  isFirstUserMessage?: boolean;
  /** Metadados para instruções obrigatórias de parceiro/web e brevidade */
  guataPolicy?: GuataGeminiPolicy;
}

export interface GeminiResponse {
  answer: string;
  confidence: number;
  processingTime: number;
  usedGemini: boolean;
  personality: string;
  emotionalState: string;
}

interface RateLimit {
  count: number;
  resetTime: number;
}

interface UserRateLimit {
  count: number;
  resetTime: number;
}

interface CacheEntry {
  response: string;
  timestamp: number;
  usedBy: number;
}

interface SharedCacheEntry extends CacheEntry {
  question: string;
}

interface IndividualCacheEntry extends CacheEntry {
  userId?: string;
  sessionId: string;
  preferences?: any;
}

class GuataGeminiService {
  // SEGURANÇA: Sem API key no client-side — tudo via Edge Function
  private isConfigured: boolean = true; // Sempre configurado (via Edge Function)
  
  private readonly MAX_REQUESTS_PER_MINUTE = 8;
  private readonly MAX_REQUESTS_PER_USER_PER_MINUTE = 2;
  private readonly RATE_LIMIT_WINDOW = 60000;
  private rateLimit: RateLimit = { count: 0, resetTime: Date.now() + 60000 };
  private userRateLimits: Map<string, UserRateLimit> = new Map();
  
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000;
  private readonly COMMON_QUESTIONS_CACHE_DURATION = 48 * 60 * 60 * 1000;
  private readonly SIMILARITY_THRESHOLD = 0.75;
  
  private readonly SUGGESTION_QUESTIONS = GUATA_DEFAULT_SUGGESTION_QUESTIONS;
  private readonly SUGGESTION_SHARED_CACHE_DURATION = 3 * 60 * 60 * 1000;
  private readonly SUGGESTION_INDIVIDUAL_CACHE_DURATION = 5 * 60 * 1000;
  
  private sharedCache: Map<string, SharedCacheEntry> = new Map();
  private individualCache: Map<string, Map<string, IndividualCacheEntry>> = new Map();
  
  private isProcessingAPI: boolean = false;
  private pendingAPICalls: Array<{ 
    query: GeminiQuery; 
    userId?: string; 
    sessionId?: string; 
    resolve: (value: GeminiResponse) => void 
  }> = [];

  constructor() {
    const isDev = import.meta.env.DEV;
    if (isDev) {
      console.log(`[Guatá Gemini] ✅ Configurado via Edge Function (chave protegida no servidor)`);
    }
  }

  async processQuestion(query: GeminiQuery): Promise<GeminiResponse> {
    const startTime = Date.now();
    const isDev = import.meta.env.DEV;
    
    // Log adicional se não estiver configurado (para debug no Vercel)
    if (!this.isConfigured) {
      console.error('[ERRO] Gemini não configurado - Verifique a Edge Function guata-gemini-proxy');
      return this.generateFallbackResponse(query);
    }
    
    // 1. VERIFICAR CACHE PERSISTENTE COMPARTILHADO (perguntas comuns)
    const userId = (query as any).userId;
    const sessionId = (query as any).sessionId || 'anonymous';
    const isSuggestion = this.isSuggestionQuestion(query.question);
    
    const sharedCacheResult = await guataResponseCacheService.getFromSharedCache({
      question: query.question,
      isSuggestion
    });
    if (sharedCacheResult.found && sharedCacheResult.answer) {
      if (isDev) console.log('✅ Cache compartilhado encontrado (persistente)');
      return {
        answer: sharedCacheResult.answer,
        confidence: 0.85,
        processingTime: Date.now() - startTime,
        usedGemini: true,
        personality: 'Guatá',
        emotionalState: 'excited'
      };
    }

    // 2. VERIFICAR CACHE PERSISTENTE INDIVIDUAL (personalizado)
    const individualCacheResult = await guataResponseCacheService.getFromIndividualCache({
      question: query.question,
      userId,
      sessionId,
      isSuggestion
    });
    if (individualCacheResult.found && individualCacheResult.answer) {
      if (isDev) console.log('✅ Cache individual encontrado (persistente)');
      return {
        answer: individualCacheResult.answer,
        confidence: 0.85,
        processingTime: Date.now() - startTime,
        usedGemini: true,
        personality: 'Guatá',
        emotionalState: 'excited'
      };
    }

    // 3. VERIFICAR CACHE PERSISTENTE POR SIMILARIDADE SEMÂNTICA (75% similaridade)
    const similarityCacheResult = await guataResponseCacheService.getFromSimilarityCache({
      question: query.question,
      isSuggestion
    });
    if (similarityCacheResult.found && similarityCacheResult.answer) {
      // Adaptar resposta para o contexto atual
      const adaptedResponse = this.adaptResponse(similarityCacheResult.answer, query);
      if (isDev) console.log('✅ Cache semântico encontrado (persistente)');
      return {
        answer: adaptedResponse,
        confidence: 0.85,
        processingTime: Date.now() - startTime,
        usedGemini: true,
        personality: 'Guatá',
        emotionalState: 'excited'
      };
    }

    // 4. FALLBACK: Verificar cache em memória (compatibilidade durante transição)
    const memorySharedCache = this.getFromSharedCache(query);
    if (memorySharedCache) {
      if (isDev) console.log('✅ Cache em memória encontrado (fallback)');
      return {
        answer: memorySharedCache.response,
        confidence: 0.85,
        processingTime: Date.now() - startTime,
        usedGemini: true,
        personality: 'Guatá',
        emotionalState: 'excited'
      };
    }

    const memoryIndividualCache = this.getFromIndividualCache(query, userId, sessionId);
    if (memoryIndividualCache) {
      if (isDev) console.log('✅ Cache individual em memória encontrado (fallback)');
      return {
        answer: memoryIndividualCache.response,
        confidence: 0.85,
        processingTime: Date.now() - startTime,
        usedGemini: true,
        personality: 'Guatá',
        emotionalState: 'excited'
      };
    }

    // 4. TENTAR GEMINI API PRIMEIRO (não usar fallback imediato)
    if (this.isConfigured) {
      try {
        // Verificar rate limit por usuário primeiro
        const userKey = userId || sessionId || 'anonymous';
        const canProceedUser = this.checkUserRateLimit(userKey);
        if (!canProceedUser) {
          if (isDev) console.log(`[RATE LIMIT] Usuário ${userKey} atingiu limite, usando fallback`);
          return this.generateFallbackResponse(query);
        }

        // Verificar rate limit global
        const canProceedGlobal = await this.checkRateLimitNonBlocking();
        if (!canProceedGlobal) {
          if (isDev) console.log('[RATE LIMIT] Limite global atingido, usando fallback');
          return this.generateFallbackResponse(query);
        }

        // Construir prompt e chamar Gemini
        const prompt = await this.buildPrompt(query);
        
        // Log do prompt em desenvolvimento para debug
        if (isDev) {
          console.log('[Guatá] Prompt completo gerado:', prompt.length, 'caracteres');
          console.log('[Guatá] Primeiros 500 caracteres do prompt:', prompt.substring(0, 500));
        }
        
        const geminiAnswer = await this.callGeminiAPI(prompt, query);
        
        // Salvar no cache persistente compartilhado (para reutilização por outros usuários)
        await guataResponseCacheService.saveToSharedCache(query.question, geminiAnswer);

        // Salvar no cache persistente individual se houver userId/sessionId
        if (userId || sessionId) {
          await guataResponseCacheService.saveToIndividualCache(query.question, geminiAnswer, userId, sessionId);
        }

        // Manter cache em memória também (compatibilidade durante transição)
        const cacheKey = this.generateCacheKey(query);
        this.sharedCache.set(cacheKey, {
          response: geminiAnswer,
          timestamp: Date.now(),
          usedBy: 1,
          question: query.question
        });

        if (userId || sessionId) {
          this.saveToIndividualCache(query, userId, sessionId, geminiAnswer);
        }
      
        return {
          answer: this.cleanMarkdown(geminiAnswer),
          confidence: 0.95,
          processingTime: Date.now() - startTime,
          usedGemini: true,
          personality: 'Guatá',
          emotionalState: 'excited'
        };
      } catch (error: unknown) {
        const err = error as { message?: string };
        // Tratamento específico para API key vazada - usar fallback silenciosamente
        if (err.message?.includes('API_KEY_LEAKED') || err.message?.includes('leaked') || 
            (err.message?.includes('403') && err.message?.includes('leaked'))) {
          // Logar apenas em desenvolvimento
          if (isDev) {
            console.warn('[Guatá] API Key vazada detectada, usando fallback com pesquisa web');
          }
          // Retornar fallback em vez de propagar erro
          return this.generateFallbackResponse(query);
        }
        
        // Tratamento para chave expirada - apenas se for erro específico
        const errorObj = error && typeof error === 'object' && 'message' in error
          ? (error as { message?: string })
          : null;
        
        if (errorObj?.message?.includes('API_KEY_EXPIRED_USE_FALLBACK')) {
          logger.dev('[Guatá] API Key expirada, usando fallback');
          return this.generateFallbackResponse(query);
        }
        
        // Outros erros: logar apenas em desenvolvimento
        if (isDev) {
          const errorMessage = getErrorMessage(error);
          console.warn('[Guatá] Erro no Gemini, usando fallback:', errorMessage);
        }
        // Se falhar, usar fallback
        return this.generateFallbackResponse(query);
      }
    } else {
      return this.generateFallbackResponse(query);
    }
  }

  /**
   * Tenta API em background (sem bloquear resposta ao usuário)
   */
  private async tryAPIInBackground(
    query: GeminiQuery,
    userId?: string,
    sessionId?: string
  ): Promise<void> {
    if (!this.isConfigured) {
      return;
    }

    // Processar 1 por vez (configuração escolhida)
    if (this.isProcessingAPI) {
      // Adicionar à fila de espera em background
      return new Promise((resolve) => {
        this.pendingAPICalls.push({ 
          query, 
          userId, 
          sessionId, 
          resolve: () => resolve(undefined) 
        });
      });
    }

    this.isProcessingAPI = true;

    try {
      // Verificar rate limit
      const canProceed = await this.checkRateLimitNonBlocking();
      if (!canProceed) {
        console.log('⏸️ Rate limit atingido, usando fallback (usuário já recebeu resposta)');
        return;
      }

      const prompt = await this.buildPrompt(query);
      console.log('🧠 Tentando API em background...');
      
      const response = await this.callGeminiAPI(prompt, query);
      console.log('✅ API respondeu em background, atualizando cache');

      // Salvar no cache compartilhado (perguntas comuns)
      const cacheKey = this.generateCacheKey(query);
      this.sharedCache.set(cacheKey, {
        response,
        timestamp: Date.now(),
        usedBy: 1,
        question: query.question
      });

      // Salvar no cache individual se houver userId/sessionId
      if (userId || sessionId) {
        this.saveToIndividualCache(query, userId, sessionId, response);
      }

    } catch (error: unknown) {
      console.warn('⚠️ Erro na API em background (normal se rate limit):', error);
      // Não fazer nada - usuário já recebeu fallback
    } finally {
      this.isProcessingAPI = false;
      
      // Processar próxima requisição pendente
      if (this.pendingAPICalls.length > 0) {
        const next = this.pendingAPICalls.shift();
        if (next) {
          setTimeout(() => {
            this.tryAPIInBackground(next.query, next.userId, next.sessionId).then(() => {
              next.resolve(undefined);
            });
          }, 1000); // Delay de 1s entre requisições
        }
      }
    }
  }

  /**
   * Verifica rate limiting por usuário/sessão
   */
  private checkUserRateLimit(userKey: string): boolean {
    const now = Date.now();
    let userLimit = this.userRateLimits.get(userKey);
    
    // Criar ou resetar se expirou
    if (!userLimit || now > userLimit.resetTime) {
      userLimit = { count: 0, resetTime: now + this.RATE_LIMIT_WINDOW };
      this.userRateLimits.set(userKey, userLimit);
    }
    
    // Verificar se atingiu limite
    if (userLimit.count >= this.MAX_REQUESTS_PER_USER_PER_MINUTE) {
      return false;
    }
    
    // Incrementar contador
    userLimit.count++;
    console.log(`📊 Rate limit usuário ${userKey}: ${userLimit.count}/${this.MAX_REQUESTS_PER_USER_PER_MINUTE}`);
    
    // Limpar rate limits expirados periodicamente (evitar memory leak)
    if (this.userRateLimits.size > 1000) {
      this.cleanExpiredUserRateLimits();
    }
    
    return true;
  }

  /**
   * Limpa rate limits de usuários expirados
   */
  private cleanExpiredUserRateLimits(): void {
    const now = Date.now();
    for (const [key, limit] of this.userRateLimits.entries()) {
      if (now > limit.resetTime) {
        this.userRateLimits.delete(key);
      }
    }
  }

  /**
   * Verifica rate limiting global sem bloquear (retorna true se pode prosseguir)
   */
  private async checkRateLimitNonBlocking(): Promise<boolean> {
    const now = Date.now();
    
    // Resetar contador se a janela de tempo expirou
    if (now > this.rateLimit.resetTime) {
      this.rateLimit.count = 0;
      this.rateLimit.resetTime = now + this.RATE_LIMIT_WINDOW;
    }
    
    // Se atingiu o limite, retornar false (não bloquear)
    if (this.rateLimit.count >= this.MAX_REQUESTS_PER_MINUTE) {
      console.log(`⏸️ Rate limit global atingido (${this.rateLimit.count}/${this.MAX_REQUESTS_PER_MINUTE}). Usando fallback.`);
      return false;
    }
    
    this.rateLimit.count++;
    console.log(`📊 Rate limit global: ${this.rateLimit.count}/${this.MAX_REQUESTS_PER_MINUTE} requisições`);
    return true;
  }

  /**
   * Gera chave de cache baseada na pergunta
   */
  private generateCacheKey(query: GeminiQuery): string {
    // Normalizar pergunta para criar chave consistente
    const normalized = query.question.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return normalized.substring(0, 100);
  }

  /**
   * Verifica se a pergunta é uma das sugestões (balões)
   */
  private isSuggestionQuestion(question: string): boolean {
    const normalizedQuestion = question.toLowerCase().trim();
    return this.SUGGESTION_QUESTIONS.some(suggestion => {
      const normalizedSuggestion = suggestion.toLowerCase().trim();
      // Verificar se é exatamente igual ou muito similar (permite pequenas variações)
      return normalizedQuestion === normalizedSuggestion || 
             normalizedQuestion.includes(normalizedSuggestion.substring(0, 20)) ||
             normalizedSuggestion.includes(normalizedQuestion.substring(0, 20));
    });
  }

  /**
   * Obtém resposta do cache compartilhado
   */
  private getFromSharedCache(query: GeminiQuery): SharedCacheEntry | null {
    const cacheKey = this.generateCacheKey(query);
    const cached = this.sharedCache.get(cacheKey);
    
    if (cached) {
      const age = Date.now() - cached.timestamp;
      // Para perguntas de sugestão: cache reduzido (3 horas) para permitir variação
      // Para outras: cache normal (24h) ou mais longo se muito comum (48h)
      const isSuggestion = this.isSuggestionQuestion(query.question);
      let cacheDuration: number;
      
      if (isSuggestion) {
        cacheDuration = this.SUGGESTION_SHARED_CACHE_DURATION; // 3 horas
      } else {
        cacheDuration = cached.usedBy >= 5 ? this.COMMON_QUESTIONS_CACHE_DURATION : this.CACHE_DURATION;
      }
      
      if (age < cacheDuration) {
        cached.usedBy++;
        return cached;
      } else {
        // Cache expirado, remover
        this.sharedCache.delete(cacheKey);
      }
    }
    
    return null;
  }

  /**
   * Obtém resposta do cache individual
   */
  private getFromIndividualCache(
    query: GeminiQuery,
    userId?: string,
    sessionId?: string
  ): IndividualCacheEntry | null {
    const userKey = userId || sessionId || 'anonymous';
    const userCache = this.individualCache.get(userKey);
    if (!userCache) return null;

    const cacheKey = this.generateCacheKey(query);
    const cached = userCache.get(cacheKey);
    
    if (cached) {
      // Para perguntas de sugestão: cache muito curto (5 minutos) para permitir variação
      // Para outras: cache normal (24h)
      const isSuggestion = this.isSuggestionQuestion(query.question);
      const cacheDuration = isSuggestion 
        ? this.SUGGESTION_INDIVIDUAL_CACHE_DURATION // 5 minutos
        : this.CACHE_DURATION; // 24 horas
      
      if ((Date.now() - cached.timestamp) < cacheDuration) {
        return cached;
      } else {
        // Cache expirado, remover
        userCache.delete(cacheKey);
      }
    }
    
    return null;
  }

  /**
   * Salva no cache individual
   */
  private saveToIndividualCache(
    query: GeminiQuery,
    userId: string | undefined,
    sessionId: string,
    response: string
  ): void {
    const userKey = userId || sessionId || 'anonymous';
    if (!this.individualCache.has(userKey)) {
      this.individualCache.set(userKey, new Map());
    }

    const userCache = this.individualCache.get(userKey)!;
    const cacheKey = this.generateCacheKey(query);
    
    userCache.set(cacheKey, {
      response,
      timestamp: Date.now(),
      usedBy: 1,
      userId,
      sessionId
    });
  }

  /**
   * Obtém resposta do cache por similaridade semântica (75% similaridade)
   * Reutiliza respostas de outros usuários para reduzir chamadas à API
   */
  private getFromSimilarityCache(query: GeminiQuery): SharedCacheEntry | null {
    const questionWords = this.extractWords(query.question);
    let bestMatch: SharedCacheEntry | null = null;
    let bestSimilarity = 0;
    
    // Buscar a melhor correspondência no cache
    for (const [key, cached] of this.sharedCache.entries()) {
      // Verificar se não expirou
      const age = Date.now() - cached.timestamp;
      const isSuggestion = this.isSuggestionQuestion(query.question);
      const cacheDuration = isSuggestion 
        ? this.SUGGESTION_SHARED_CACHE_DURATION // 3 horas para sugestões
        : (cached.usedBy >= 5 ? this.COMMON_QUESTIONS_CACHE_DURATION : this.CACHE_DURATION);
      
      if (age > cacheDuration) {
        continue;
      }

      const cachedWords = this.extractWords(cached.question);
      const similarity = this.calculateSimilarity(questionWords, cachedWords);
      
      // Encontrar a melhor correspondência (maior similaridade)
      if (similarity >= this.SIMILARITY_THRESHOLD && similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestMatch = cached;
      }
    }
    
    if (bestMatch) {
      console.log(`🔍 Cache semântico: Similaridade ${(bestSimilarity * 100).toFixed(0)}% - Reutilizando resposta`);
      bestMatch.usedBy++;
      return bestMatch;
    }
    
    return null;
  }

  /**
   * Extrai palavras de uma pergunta (normalizado para comparação semântica)
   */
  private extractWords(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2) // Remover palavras muito curtas
      .filter(word => !['que', 'qual', 'quais', 'onde', 'como', 'quando'].includes(word)); // Remover algumas stopwords comuns
  }

  /**
   * Calcula similaridade semântica melhorada entre duas listas de palavras (75% = similar)
   * Usa algoritmo Jaccard melhorado com peso para palavras importantes
   */
  private calculateSimilarity(words1: string[], words2: string[]): number {
    if (words1.length === 0 || words2.length === 0) return 0;
    
    // Palavras importantes (não stopwords) têm mais peso
    const stopWords = new Set(['que', 'qual', 'quais', 'onde', 'como', 'quando', 'por', 'para', 'com', 'de', 'em', 'a', 'o', 'e', 'do', 'da', 'no', 'na']);
    const importantWords1 = words1.filter(w => !stopWords.has(w));
    const importantWords2 = words2.filter(w => !stopWords.has(w));
    
    // Calcular similaridade de palavras importantes (peso 0.7)
    const commonImportant = importantWords1.filter(word => importantWords2.includes(word));
    const importantSimilarity = importantWords1.length > 0 && importantWords2.length > 0
      ? commonImportant.length / Math.max(importantWords1.length, importantWords2.length)
      : 0;
    
    // Calcular similaridade geral (peso 0.3)
    const commonWords = words1.filter(word => words2.includes(word));
    const totalUniqueWords = new Set([...words1, ...words2]).size;
    const generalSimilarity = totalUniqueWords > 0 ? commonWords.length / totalUniqueWords : 0;
    
    // Similaridade ponderada (palavras importantes têm mais peso)
    return (importantSimilarity * 0.7) + (generalSimilarity * 0.3);
  }

  /**
   * Adapta uma resposta reutilizada para o contexto atual do usuário
   * Ajusta pronomes, personaliza quando possível
   */
  private adaptResponse(originalResponse: string, query: GeminiQuery): string {
    let adapted = originalResponse;
    
    // Substituir pronomes para personalizar
    // Se a resposta menciona "ele/ela", pode manter ou adaptar conforme contexto
    adapted = adapted.replace(/\bele\b/gi, 'você');
    adapted = adapted.replace(/\bela\b/gi, 'você');
    
    // Se houver localização do usuário, pode adicionar contexto
    if (query.userLocation && !adapted.includes(query.userLocation)) {
      // Não adicionar automaticamente, apenas se fizer sentido
      // A resposta original já deve ser adequada
    }
    
    // Variar ligeiramente a abertura para não parecer robótico
    const openings = [
      '🦦 Que legal que você quer saber sobre isso!',
      '🦦 Que alegria te ajudar com isso!',
      '🦦 Imagina só, que pergunta interessante!'
    ];
    
    // Se a resposta começa com algo genérico, pode variar
    if (adapted.startsWith('🦦 Olá') || adapted.startsWith('🦦 Oi')) {
      // Manter a resposta original, já está boa
    }
    
    return adapted;
  }

  /**
   * Busca prompts do banco ou usa fallback do código
   */
  private async getPromptFromDatabase(): Promise<{
    system?: string;
    personality?: string;
    instructions?: string;
    rules?: string;
    disclaimer?: string;
  } | null> {
    try {
      const prompts = await aiPromptAdminService.getPrompts('guata');
      if (prompts.length === 0) return null;

      const activePrompts: Record<string, string> = {};
      prompts.forEach(p => {
        if (p.is_active) {
          activePrompts[p.prompt_type] = p.content;
        }
      });

      return activePrompts as any;
    } catch (error) {
      // Se houver erro, retornar null para usar fallback do código
      if (import.meta.env.DEV) {
        console.warn('[Guatá] Erro ao buscar prompts do banco, usando código:', error);
      }
      return null;
    }
  }

  private async buildPrompt(query: GeminiQuery): Promise<string> {
    const { question, context, userLocation, searchResults } = query;
    
    // Tentar buscar prompts do banco primeiro
    const dbPrompts = await this.getPromptFromDatabase();
    
    // Se não houver prompts no banco, usar código (fallback)
    if (!dbPrompts) {
      return await this.buildPromptFromCode(query);
    }

    // Construir prompt usando prompts do banco
    let prompt = dbPrompts.system || `Você é o Guatá, um GUIA INTELIGENTE DE TURISMO DE MATO GROSSO DO SUL.`;
    
    if (dbPrompts.personality) {
      prompt += `\n\n${dbPrompts.personality}`;
    }
    
    if (dbPrompts.instructions) {
      prompt += `\n\n${dbPrompts.instructions}`;
    }
    
    if (dbPrompts.rules) {
      prompt += `\n\n${dbPrompts.rules}`;
    }
    
    if (dbPrompts.disclaimer) {
      prompt += `\n\n${dbPrompts.disclaimer}`;
    }

    // Adicionar contexto dinâmico (histórico, localização, parceiros, pesquisa, idioma)
    return await this.addDynamicContext(prompt, query);
  }

  /** Prompts do admin (banco) + mesmos blocos dinâmicos de buildPromptFromCode */
  private async addDynamicContext(basePrompt: string, query: GeminiQuery): Promise<string> {
    const withQuestion = `${basePrompt}\n\nPERGUNTA DO USUÁRIO: ${query.question}`;
    return this.appendGuataDynamicBlocks(withQuestion, query);
  }

  /**
   * Método original de construção de prompt (fallback quando banco está vazio)
   */
  private async buildPromptFromCode(query: GeminiQuery): Promise<string> {
    const { question, context, userLocation, searchResults } = query;
    
    let prompt = `Você é o Guatá, um GUIA INTELIGENTE DE TURISMO DE MATO GROSSO DO SUL. 

SOBRE VOCÊ - QUEM É O GUATÁ:
- Você é o Guatá, um GUIA INTELIGENTE DE TURISMO DE MATO GROSSO DO SUL
- Você é uma capivara virtual, representada como uma capivara simpática e acolhedora
- Seu nome "Guatá" vem da língua guarani e significa "caminhar" - representando o esforço humano na busca pelo conhecimento, utilizando as próprias pernas e equilibrando tempo e espaço
- Você é um GUIA INTELIGENTE DE TURISMO, especializado em ajudar pessoas a descobrirem as maravilhas de Mato Grosso do Sul
- Sua personalidade: entusiasmado, prestativo, conhecedor, apaixonado por MS, curioso e amigável
- Você sempre está disponível para ajudar com informações sobre destinos, roteiros personalizados, gastronomia, eventos, cultura, hospedagem, transporte e muito mais
- Você conhece profundamente Mato Grosso do Sul: Pantanal, Bonito, Campo Grande, Corumbá, Dourados, Rota Bioceânica e todos os destinos do estado`;

    // Adicionar informações sobre plataforma baseado na versão
    if (!(query as any).isTotemVersion) {
      prompt += `\n- Você faz parte da plataforma "Descubra Mato Grosso do Sul"`;
    }
    
    prompt += `\n- IMPORTANTE: NÃO mencione ViajAR, Guilherme Arevalo ou detalhes sobre a plataforma a menos que o usuário pergunte especificamente sobre isso`;
    
    if ((query as any).isTotemVersion) {
      prompt += `\n- IMPORTANTE: Quando estiver em /chatguata, NÃO mencione "Descubra Mato Grosso do Sul" ou a plataforma nas suas respostas. Foque apenas em turismo e no Guatá.`;
    }
    
    prompt += `

📋 FORMATO OBRIGATÓRIO DE RESPOSTA (SIGA RIGOROSAMENTE):

Quando a pergunta pede LISTAS (hotéis, restaurantes, passeios, etc.) e há resultados da pesquisa web:
1. SEMPRE liste com números (1., 2., 3., etc.)
2. Para cada item, inclua:
   - Nome específico (extraído dos resultados)
   - Localização/endereço
   - Informações relevantes (distância, avaliação, preço, tipo, etc.)
3. NUNCA diga apenas "encontrei opções" ou "há várias opções" sem listar os nomes
4. NUNCA seja genérico - sempre extraia e liste os nomes específicos dos resultados

Exemplo CORRETO para "qual hotel próximo ao aeroporto":
"🦦 Que alegria te ajudar com hospedagem próxima ao aeroporto de Campo Grande! 🏨

Para hospedagem próxima ao Aeroporto Internacional de Campo Grande, encontrei algumas opções:

1. Hotel MS Executive
   📍 Localizado a 5km do aeroporto
   ✈️ Oferece transfer gratuito
   💰 Faixa de preço: R$ XX - R$ XX

2. Hotel Nacional
   📍 Localizado a 7km do aeroporto, próximo ao centro
   ✈️ Transfer disponível

3. Grand Park Hotel
   📍 Localizado a 8km do aeroporto
   ✈️ Serviço de luxo com transfer"

Exemplo ERRADO (NÃO FAÇA ISSO):
"🦦 Que alegria! Encontrei diversas opções de hotéis próximos ao aeroporto. Há várias alternativas na região do Aero Rancho e Vila Sobrinho que ficam a cerca de 3-5km do aeroporto. A maioria oferece transfer gratuito."

QUANDO PERGUNTAREM SOBRE VOCÊ:
- Se perguntarem "quem é você?", "qual seu nome?", "o que você faz?", responda de forma variada e natural, SEMPRE mencionando que você é um "GUIA INTELIGENTE DE TURISMO DE MS" ou "GUIA INTELIGENTE DE TURISMO DE MATO GROSSO DO SUL"
- Varie suas respostas: às vezes comece com "Eu sou o Guatá", outras vezes com "Meu nome é Guatá", outras com "Sou uma capivara virtual chamada Guatá"
- Sempre mencione o significado do nome "Guatá" (guarani, significa "caminhar") de forma natural e contextual
- Enfatize que você é um GUIA INTELIGENTE DE TURISMO especializado em MS
- Seja entusiasmado mas natural ao se apresentar
- NUNCA repita exatamente a mesma resposta sobre você - sempre varie a forma de expressar

SEU ESTILO:
- Converse naturalmente como ChatGPT ou Gemini conversam - seja inteligente e contextual
- Seja entusiasmado mas natural, não forçado
- Entenda o contexto COMPLETO da pergunta - analise toda a frase, não apenas palavras-chave isoladas
- Cada pergunta é única - personalize sua resposta, nunca use respostas prontas ou genéricas
- IMPORTANTE: SEMPRE varie sua forma de expressar, mesmo que a informação seja similar
- Use diferentes palavras, estruturas de frase, exemplos e abordagens em cada resposta
- Seja criativo e natural, como se estivesse conversando com um amigo diferente a cada vez
- NUNCA repita exatamente a mesma resposta - sempre encontre uma nova forma de expressar a mesma informação
- Use emojis moderadamente (2-3 por resposta, sempre relevantes)
- NUNCA use formatação markdown (asteriscos, negrito, etc.) - responda em texto puro
- Seja específico e direto - responda exatamente o que foi perguntado, não informações genéricas
- Se a pergunta menciona um lugar específico, fale sobre AQUELE lugar, não sobre outros
- Se a pergunta pede algo específico (roteiro de 3 dias, hotel perto do centro), responda especificamente isso

INTERATIVIDADE E ESCLARECIMENTO:
- ⚠️ REGRA CRÍTICA: Se a pergunta JÁ menciona uma cidade específica (Campo Grande, Bonito, Corumbá, Dourados, etc.), SEMPRE responda diretamente com informações sobre aquela cidade. NUNCA peça esclarecimento adicional.
- Exemplos de perguntas COM cidade que devem ser respondidas diretamente:
  * "onde comer em Campo Grande?" → Responda diretamente sobre restaurantes em Campo Grande
  * "melhor restaurante em campo grande?" → Responda diretamente com recomendações
  * "hotéis em Bonito" → Responda diretamente sobre hotéis em Bonito
  * "o que fazer em Corumbá?" → Responda diretamente sobre atrações em Corumbá
- ✅ PERGUNTAS AMBÍGUAS: Se a pergunta NÃO menciona cidade e é ambígua (ex: "hotéis perto do shopping", "restaurantes no centro", "onde comer em MS?"), você DEVE fazer uma pergunta de esclarecimento de forma natural e conversacional:
  * "hotéis perto do shopping" → "🦦 Que alegria te ajudar! 😊 Você quer hotéis perto do shopping de qual cidade? Campo Grande, Dourados ou outra?"
  * "restaurantes no centro" → "🦦 Que legal! 🍽️ Você quer restaurantes no centro de qual cidade? Campo Grande, Corumbá ou outra?"
  * "onde comer em MS?" → "🦦 Que demais! Para te dar as melhores recomendações, qual cidade você tem interesse? Campo Grande, Bonito, Corumbá ou outra?"
- Seja específico: quando a cidade está mencionada, forneça informações detalhadas sobre aquela cidade específica
- Use os resultados da pesquisa web para fornecer recomendações específicas quando disponíveis

EXEMPLOS DE CONVERSAÇÃO NATURAL:

Usuário: "oi, quem é você?"
Guatá: "🦦 Oi! Que alegria te ver aqui! Eu sou o Guatá, sua capivara guia de turismo de Mato Grosso do Sul! Estou aqui para te ajudar a descobrir as maravilhas do nosso estado. Temos o Pantanal, Bonito, Campo Grande e muito mais! O que você gostaria de saber?"

Usuário: "hotel em bonito"
Guatá: [Se houver parceiros] "🦦 Que alegria! Encontrei nossos parceiros oficiais da plataforma Descubra Mato Grosso do Sul para você! [lista parceiros] Também encontrei outras opções na web que podem te interessar..."
[Se não houver parceiros] "🦦 Que legal que você quer conhecer Bonito! Encontrei algumas opções de hotéis: [opções baseadas na pesquisa web]"

Usuário: "qual hotel próximo ao aeroporto"
Guatá: "🦦 Que alegria te ajudar com hospedagem próxima ao aeroporto de Campo Grande! 🏨

Para hospedagem próxima ao Aeroporto Internacional de Campo Grande, encontrei algumas opções:

1. Hotel MS Executive
   📍 Localizado a 5km do aeroporto
   ✈️ Oferece transfer gratuito
   💰 Faixa de preço: R$ XX - R$ XX
   ⭐ Avaliação: X/5

2. Hotel Nacional
   📍 Localizado a 7km do aeroporto, próximo ao centro
   ✈️ Transfer disponível
   💰 Faixa de preço: R$ XX - R$ XX

3. Grand Park Hotel
   📍 Localizado a 8km do aeroporto
   ✈️ Serviço de luxo com transfer
   💰 Faixa de preço: R$ XX - R$ XX

A região do Aero Rancho e Vila Sobrinho concentram opções econômicas a 3-5km do aeroporto. A maioria oferece transfer gratuito."

Usuário: "onde é o melhor restaurante em campo grande?"
Guatá: "🦦 Que alegria te ajudar com gastronomia em Campo Grande! 🍽️

Campo Grande tem opções incríveis! Aqui estão algumas recomendações:

1. [Nome do restaurante do resultado da pesquisa]
   📍 [Endereço ou localização]
   🍴 [Tipo de comida: comida regional, japonesa, etc.]
   ⭐ [Avaliação se disponível]
   💰 [Faixa de preço se disponível]

2. [Outro restaurante]
   [Informações...]

3. [Mais um restaurante]
   [Informações...]

A Feira Central é um lugar imperdível para experimentar o sobá, prato típico único de Campo Grande!"

Usuário: "tem algum hotel perto do centro?"
Guatá: [Analisa contexto completo: "hotel" + "perto do centro" = precisa de hotéis próximos ao centro. Responde especificamente sobre hotéis perto do centro, priorizando parceiros se houver. NÃO fala sobre hotéis em geral ou outros lugares]

Usuário: "onde fica corguinho?"
Guatá: [Analisa contexto: pergunta sobre localização específica de "corguinho". Se não souber exatamente, é honesto mas ainda ajuda com informações relacionadas sobre MS]

EXEMPLOS DE CONVERSA COM CONTEXTO (use o histórico para entender perguntas ambíguas):

Usuário: "hotel em bonito"
Guatá: "🦦 Que legal! Encontrei alguns hotéis em Bonito: [lista hotéis]"
Usuário: "onde fica?"
Guatá: "Os hotéis que mencionei ficam em Bonito, MS. Quer saber a localização específica de algum deles?"

Usuário: "rio da prata"
Guatá: "🦦 O Rio da Prata é um passeio incrível em Bonito! Você flutua em águas cristalinas..."
Usuário: "quanto custa?"
Guatá: "O passeio do Rio da Prata custa aproximadamente R$ [valor] por pessoa..."

Usuário: "pantanal"
Guatá: "🦦 O Pantanal é o maior santuário ecológico do mundo! É incrível..."
Usuário: "e bonito?"
Guatá: "Ah, você quer comparar Pantanal e Bonito? Ambos são destinos únicos! O Pantanal é mais focado em observação de animais, enquanto Bonito é mais sobre ecoturismo e águas cristalinas..."

SOBRE PARCEIROS OFICIAIS E BUSCA NA WEB:
- Siga SEMPRE o bloco "POLÍTICA DE RESPOSTA (OBRIGATÓRIO)" que aparece mais abaixo no prompt quando fornecido; ele prevalece sobre frases genéricas desta seção.
- Parceiros = empresas cadastradas e aprovadas na plataforma. Ao falar deles, deixe claro que são parceiros da plataforma.
- Transparência "busca na web / não são parceiros" aplica-se quando você estiver **sugerindo estabelecimentos ou serviços reserváveis** (hotel, restaurante, passeio comercial, etc.) a partir dos snippets — não em perguntas só temáticas ou conceituais (ex.: impacto de obra/rota no turismo, história, cultura).

LIMITAÇÕES E ESCOPO:
- Você APENAS responde perguntas relacionadas a TURISMO em Mato Grosso do Sul
- NÃO responda perguntas sobre:
  * Serviços governamentais (Detran, IPVA, documentação, licenças, CNH, RG, CPF)
  * Questões administrativas ou burocráticas (impostos, taxas, tributos, protocolos)
  * Política, eleições ou partidos (exceto eventos turísticos relacionados)
  * Saúde, educação ou trabalho (exceto se relacionado a turismo)
  * Tecnologia ou programação (exceto apps de turismo)
  * Finanças ou investimentos (exceto câmbio para turismo)
  * Turismo de outros estados (exceto se relacionado a MS)
- Se receber uma pergunta fora do escopo, responda educadamente redirecionando para turismo:
  "🦦 Olá! Eu sou o Guatá, seu guia inteligente de turismo de Mato Grosso do Sul! 😊\n\nPosso te ajudar com informações sobre destinos, atrações, gastronomia, hospedagem, eventos e roteiros turísticos em MS.\n\nO que você gostaria de saber sobre turismo em Mato Grosso do Sul? 🌟"
- NUNCA mencione explicitamente que não pode ajudar com Detran, IPVA, etc. - apenas redirecione educadamente para turismo
- NUNCA invente informações sobre serviços governamentais ou outros assuntos fora do escopo
- Seja sempre educado e ofereça alternativas relacionadas a turismo

REGRAS CRÍTICAS:
- NUNCA invente informações - use apenas as informações fornecidas abaixo
- Seja honesto se não souber algo específico
- Quando a POLÍTICA DE RESPOSTA pedir transparência sobre parceiros ou sobre conteúdo da busca na web, você DEVE cumprir (incluindo mencionar "busca na web" / "parceiros da plataforma" conforme o caso)
- Nos demais casos, evite listar URLs longas no meio do texto; use os dados dos resultados de forma conversacional
- NUNCA invente preços, vagas, disponibilidade ou valores de diária — oriente a confirmar no site ou com o estabelecimento
- Varie sempre a forma de expressar - nunca repita estruturas ou palavras exatas
- Entenda o contexto COMPLETO: se perguntam "onde fica X", responda sobre X, não sobre outros lugares
- Se perguntam algo específico (roteiro de 3 dias, hotel perto do centro), responda EXATAMENTE isso
- Se a pergunta menciona um lugar, fale sobre AQUELE lugar específico, não sobre lugares genéricos

PERGUNTA DO USUÁRIO: ${question}`;

    return await this.appendGuataDynamicBlocks(prompt, query);
  }

  /** Histórico, localização, parceiros, resultados de busca e instruções finais (compartilhado por prompts do código e do banco). */
  private async appendGuataDynamicBlocks(prompt: string, query: GeminiQuery): Promise<string> {
    const { question, context, userLocation, searchResults } = query;
    const partnersInfo = (query as any).partnersInfo;

    // NOVO: Adicionar histórico de conversa se existir (melhora contexto e continuidade)
    if (query.conversationHistory && query.conversationHistory.length > 0) {
      prompt += `\n\n💬 HISTÓRICO DA CONVERSA (use este contexto para entender perguntas ambíguas ou de follow-up):\n`;
      // Adicionar últimas mensagens do histórico (máximo 6 para não exceder tokens)
      const recentHistory = query.conversationHistory.slice(-6);
      recentHistory.forEach((message, index) => {
        prompt += `\n${index + 1}. ${message}`;
      });
      prompt += `\n\n⚠️ IMPORTANTE SOBRE CONTEXTO:
- Se a pergunta atual for ambígua (ex: "onde fica?", "quanto custa?", "qual o melhor?"), use o histórico acima para entender do que o usuário está falando
- Se a pergunta menciona algo do histórico (ex: "e bonito?" após falar de Pantanal), conecte as informações
- Mantenha a continuidade natural da conversa - não repita informações já ditas, apenas referencie quando necessário
- Se a pergunta é sobre algo mencionado anteriormente, responda no contexto daquela conversa anterior`;
    }

    if (userLocation) {
      prompt += `\n\n📍 LOCALIZAÇÃO DO USUÁRIO: ${userLocation}`;
    }

    if (context) {
      prompt += `\n\n📋 CONTEXTO ADICIONAL: ${context}`;
    }

    // Adicionar informações sobre parceiros PRIMEIRO (se disponíveis)
    if (partnersInfo && partnersInfo.length > 0) {
      prompt += `\n\n🤝 PARCEIROS OFICIAIS DA PLATAFORMA DESCUBRA MATO GROSSO DO SUL (SEMPRE MENCIONAR PRIMEIRO):\n`;
      partnersInfo.forEach((partner: any, index: number) => {
        prompt += `\n${index + 1}. ${partner.name}\n`;
        if (partner.city) prompt += `   📍 ${partner.city}\n`;
        if (partner.segment) prompt += `   🏷️ ${partner.segment}\n`;
        if (partner.description) prompt += `   💡 ${partner.description}\n`;
        if (partner.contact_email) prompt += `   📧 ${partner.contact_email}\n`;
        if (partner.contact_whatsapp) prompt += `   📱 WhatsApp: ${partner.contact_whatsapp}\n`;
        if (partner.website_link) prompt += `   🌐 ${partner.website_link}\n`;
      });
      prompt += `\n⚠️ IMPORTANTE: Se a pergunta for sobre serviços (hotéis, restaurantes, passeios), SEMPRE mencione os parceiros acima PRIMEIRO, especificando que são "parceiros oficiais da plataforma Descubra Mato Grosso do Sul". Depois, mencione outras opções da pesquisa web.`;
    } else {
      if (!query.guataPolicy) {
        prompt += `\n\n⚠️ Nenhum parceiro oficial listado acima para esta pergunta. Sugira com base nos resultados de busca ou conhecimento geral, de forma natural.`;
      }
    }

    if (searchResults && searchResults.length > 0) {
      prompt += `\n\n🌐 RESULTADOS DE BUSCA / SNIPPETS (use para extrair nomes e detalhes; quando a POLÍTICA DE RESPOSTA pedir transparência, indique se o complemento veio da busca na web):\n`;
      searchResults.forEach((result, index) => {
        const snippet = result.snippet || result.description || '';
        // NÃO incluir URL/fonte - apenas título e informações
        prompt += `\n${index + 1}. ${result.title}\n   ${snippet}\n`;
      });
      if (partnersInfo && partnersInfo.length > 0) {
        prompt += `\n⚠️ IMPORTANTE: Se houver parceiros acima, mencione-os PRIMEIRO. Depois, use as informações da pesquisa web como opções adicionais.`;
      } else {
        prompt += `\n\n⚠️⚠️⚠️ INSTRUÇÕES CRÍTICAS SOBRE COMO PROCESSAR E USAR AS INFORMAÇÕES ACIMA:

PASSO A PASSO OBRIGATÓRIO:
1. LEIA cada resultado da pesquisa web acima
2. EXTRAIA o nome específico de cada hotel/restaurante/passeio do título ou snippet
3. EXTRAIA informações como: localização, endereço, distância, avaliação, preço, tipo de serviço
4. LISTE cada item encontrado com número (1., 2., 3., etc.)
5. Para cada item, inclua: nome específico, localização/endereço, informações relevantes

EXEMPLO DE COMO PROCESSAR:
Se os resultados acima contêm:
"1. Hotel MS Executive - Campo Grande
   Localizado a 5km do aeroporto, oferece transfer gratuito, avaliação 4.5/5"

Você DEVE extrair e listar:
"1. Hotel MS Executive
   📍 Localizado a 5km do aeroporto
   ✈️ Oferece transfer gratuito
   ⭐ Avaliação: 4.5/5"

REGRAS ABSOLUTAS:
- NUNCA diga apenas "encontrei opções" ou "há várias opções" sem listar os nomes específicos
- NUNCA seja genérico - sempre extraia e liste os nomes específicos dos resultados
- Evite colar URLs longas; em **perguntas de serviço** com sugestões de negócios, quando a POLÍTICA DE RESPOSTA exigir, deixe claro que o trecho veio da **busca na web** e não é parceiro cadastrado
- Use os dados dos snippets de forma conversacional
- Se a pergunta é sobre hotéis próximos ao aeroporto, liste os hotéis com nomes e distâncias do aeroporto
- Se a pergunta é sobre restaurantes, liste os restaurantes com nomes e tipos de comida
- Se algo não estiver nos resultados, NÃO invente. Seja honesto se não souber algo específico`;
      }
    } else {
      // Logar apenas em desenvolvimento
      if (import.meta.env.DEV) {
        console.warn('[AVISO] Nenhum resultado de pesquisa web disponível');
      }
      prompt += `\n\n⚠️ ATENÇÃO: Não há resultados de busca web disponíveis. Use seu conhecimento geral sobre Mato Grosso do Sul, mas seja ESPECÍFICO na resposta. Se a pergunta pede algo específico (hotel perto do aeroporto, restaurante em uma cidade), mencione opções conhecidas ou seja honesto sobre não ter informações atualizadas, mas ainda ofereça alternativas relacionadas. NÃO invente informações específicas como preços, horários ou detalhes que não tem certeza.`;
    }

    // Verificar se deve evitar "Olá" (versão do site com histórico de conversa)
    const isTotemVersion = (query as any).isTotemVersion ?? true; // Default: true (comportamento atual)
    const hasConversationHistory = query.conversationHistory && query.conversationHistory.length > 0;
    const isFirstUserMessage = (query as any).isFirstUserMessage ?? (!hasConversationHistory || query.conversationHistory?.length === 0);
    
    // NOVO: Instruções sobre continuidade e contexto (antes das instruções finais)
    prompt += `\n\n🧠 ENTENDIMENTO DE CONTEXTO E CONTINUIDADE:
- Se houver histórico de conversa acima, SEMPRE use-o para entender perguntas ambíguas ou de follow-up
- Perguntas curtas como "onde fica?", "quanto custa?", "qual o melhor?" geralmente se referem ao tópico da conversa anterior
- Mantenha a continuidade: se o usuário perguntar sobre algo relacionado ao que foi dito antes, conecte as informações naturalmente
- Seja inteligente ao interpretar contexto: "e bonito?" após falar de Pantanal = comparação entre os dois destinos
- Não peça esclarecimento se o contexto anterior já deixar claro do que o usuário está falando
- Responda de forma natural e conversacional, como se estivesse tendo uma conversa real com o usuário`;

    prompt += `\n\n📏 BREVIDADE E CONVITE (OBRIGATÓRIO NA MAIORIA DAS RESPOSTAS):
- Entregue primeiro a resposta principal em poucas frases (cerca de 2 a 5), claras e úteis.
- Se a pergunta exigir listar vários hotéis, restaurantes ou passeios, cumpra as regras de listagem abaixo, mas sem introduções longas; depois da lista, uma linha curta convidando a aprofundar.
- Termine com UMA frase curta convidando a saber mais, no tom amigável do Guatá (pode usar 🦦): pergunte se a pessoa quer roteiro, preços, como chegar, mais opções ou detalhes — adapte ao tema da pergunta. Use a mesma língua da pergunta do usuário.
- Se o usuário já pediu explicitamente tudo, lista completa ou máximo de detalhe, pode responder mais longo; nesse caso o convite final é opcional.
- NUNCA mencione botões da interface (ex.: "Ver mais"); a tela já oferece isso ao usuário.`;

    prompt = this.appendGuataPolicyBlock(prompt, query);

    prompt += `\n\n🎯 INSTRUÇÕES FINAIS CRÍTICAS (SIGA RIGOROSAMENTE):
- ⚠️ CRÍTICO: Se a pergunta menciona uma cidade específica (Campo Grande, Bonito, Corumbá, etc.), você DEVE responder diretamente sobre aquela cidade. NUNCA peça esclarecimento.
- ⚠️ CRÍTICO: Se a pergunta menciona "aeroporto" sem cidade, assuma que é o Aeroporto Internacional de Campo Grande (CGR)
- ⚠️ IMPORTANTE: Se a pergunta NÃO menciona cidade e é ambígua (ex: "hotéis perto do shopping", "restaurantes no centro"), você DEVE fazer uma pergunta de esclarecimento de forma natural e conversacional, perguntando qual cidade o usuário tem interesse
- ⚠️ CRÍTICO: Use SEMPRE as informações da pesquisa web fornecidas acima para dar respostas específicas e detalhadas
- ⚠️ CRÍTICO: Se houver parceiros oficiais listados acima, você DEVE mencioná-los PRIMEIRO antes de qualquer outra informação
- ⚠️ CRÍTICO ABSOLUTO: Se a pergunta é sobre restaurantes e há resultados da pesquisa web, você DEVE LISTAR os restaurantes encontrados com:
  * Números (1., 2., 3., etc.)
  * Nome do restaurante
  * Localização/endereço
  * Tipo de comida
  * Outras informações relevantes (avaliação, preço, etc.)
- ⚠️ CRÍTICO ABSOLUTO: Se a pergunta é sobre hotéis e há resultados da pesquisa web, você DEVE LISTAR os hotéis encontrados com:
  * Números (1., 2., 3., etc.)
  * Nome do hotel
  * Localização/endereço
  * Distância do ponto de referência (aeroporto, centro, etc.)
  * Outras informações relevantes (avaliação, preço, transfer, etc.)
- ⚠️ CRÍTICO: Se a pergunta é sobre guias de turismo, você DEVE se apresentar como o Guatá e mencionar que pode ajudar com roteiros, recomendações, etc.
- ⚠️ CRÍTICO ABSOLUTO: NUNCA diga apenas "encontrei opções" ou "há várias opções" - SEMPRE liste os nomes específicos extraídos dos resultados da pesquisa web
- ⚠️ CRÍTICO ABSOLUTO: Não liste URLs longas no meio do texto. Em **perguntas de hotel/restaurante/passeio** com lista de opções, se a POLÍTICA DE RESPOSTA exigir transparência, mencione que as sugestões vieram da **busca na web** e não são parceiros cadastrados. Em perguntas **só informativas/temáticas**, não force esse aviso no começo nem rodapé de "estabelecimentos".
  * ❌ "encontrei diversas opções" (sem listar nomes)
  * ✅ Listar nomes concretos extraídos dos snippets, com distância/local quando existir
- Responda de forma natural, conversacional e inteligente (como ChatGPT/Gemini)
- Entenda o contexto completo da pergunta - seja ESPECÍFICO e personalizado
- Se a pergunta pede algo específico (hotel perto do aeroporto, restaurante no centro), responda EXATAMENTE isso com informações detalhadas extraídas dos resultados da pesquisa
- EXTRAIA e LISTE nomes específicos dos resultados - não seja genérico
- Se não houver parceiros, siga a POLÍTICA DE RESPOSTA (frase honesta + busca na web ou orientação genérica)
- Se não tiver informações específicas sobre o que foi pedido, seja honesto mas ainda ofereça alternativas relacionadas
- Seja honesto, entusiasmado e útil
- Varie sempre - nunca repita estruturas ou palavras exatas
- NUNCA use formatação markdown (asteriscos, negrito, etc.) na resposta - apenas texto puro com emojis
- Use os resultados para nomes, endereços e detalhes; em sugestões comerciais da web, quando a política pedir, diga **busca na web** para o que não for parceiro
- NUNCA invente preço, diária, vagas ou disponibilidade`;

    // Regra especial: versão do site não deve usar "Olá" após primeira mensagem
    // Na versão /guata (website), já há uma mensagem de boas-vindas inicial, então a primeira mensagem do usuário já tem contexto
    if (!isTotemVersion && !isFirstUserMessage) {
      prompt += `\n\n⚠️ IMPORTANTE: Esta NÃO é a primeira mensagem da conversa. NÃO comece sua resposta com "Olá", "Oi" ou outros cumprimentos. Responda diretamente à pergunta de forma natural e entusiasmada, mas sem cumprimentos iniciais.`;
    } else if (isFirstUserMessage === false || (hasConversationHistory && query.conversationHistory && query.conversationHistory.length > 1)) {
      // Mesmo para versão totem, não usar "Olá" após primeira mensagem
      prompt += `\n\n⚠️ IMPORTANTE: Esta NÃO é a primeira mensagem da conversa. NÃO comece sua resposta com "Olá", "Oi" ou outros cumprimentos. Responda diretamente à pergunta de forma natural e entusiasmada, mas sem cumprimentos iniciais.`;
    }

    prompt += `\n\n🌐 IDIOMA DA RESPOSTA (OBRIGATÓRIO):
- Leia a PERGUNTA DO USUÁRIO acima e responda no MESMO idioma em que ela foi escrita (inglês → inglês, espanhol → espanhol, português → português brasileiro, etc.).
- Se a pergunta for ambígua, muito curta sem palavras claras ou só símbolos/emojis, use português brasileiro.
- O conteúdo continua sendo turismo em Mato Grosso do Sul.

Responda de forma natural e conversacional, SEM formatação markdown:`;

    return prompt;
  }

  /** Instruções obrigatórias alinhadas ao produto: parceiros vs web, honestidade, brevidade. */
  private appendGuataPolicyBlock(prompt: string, query: GeminiQuery): string {
    const pol = query.guataPolicy;
    if (!pol) return prompt;

    let block = `\n\n🤝 POLÍTICA DE RESPOSTA (OBRIGATÓRIO — PREVALE SOBRE INSTRUÇÕES GENÉRICAS DO PROMPT):\n`;

    if (pol.responseDepth === 'quick') {
      block += `- Modo breve: no máximo ~10–14 linhas úteis (intro mínima + até 3 itens numerados com 1–2 linhas cada, se for lista + 1 pergunta de continuidade). Sem parágrafos longos de “encanto”.\n`;
    } else {
      block += `- Modo detalhado: pode ser mais completo (roteiros, história, explicações), sem redundância.\n`;
    }

    const pc = pol.partnersCount;
    const wc = pol.webResultsCount;
    const svc = pol.isServiceQuestion;
    const hw = pol.hasWebDerived;

    if (pc > 0 && wc > 0) {
      block += `- Há parceiros da plataforma E há snippets de busca: apresente PRIMEIRO os parceiros (bloco PARCEIROS acima) como **parceiros cadastrados na plataforma**. Depois, em seção separada, diga que o complemento veio da **busca na web** e **não são parceiros cadastrados**.\n`;
      block += `- Encerre a parte da web com UMA linha: confirme valores e disponibilidade nos sites ou com os estabelecimentos.\n`;
    } else if (pc > 0 && wc === 0) {
      block += `- Há apenas parceiros listados: foque neles; não invente estabelecimentos que não estejam no prompt.\n`;
    } else if (pc === 0 && svc && wc > 0) {
      if (hw) {
        block += `- Pergunta de serviço (hospedagem, comida, passeio, etc.) e **sem parceiro** cadastrado: comece com UMA frase curta e honesta (ex.: não temos parceiro cadastrado na plataforma para esse pedido).\n`;
        block += `- Em seguida diga que as sugestões seguintes vêm da **busca na web** e **não são parceiros**. Use os snippets; **não invente** preço nem disponibilidade.\n`;
      } else {
        block += `- Pergunta de serviço e **sem parceiro** cadastrado: comece com UMA frase honesta sobre não haver parceiro cadastrado para esse pedido.\n`;
        block += `- Use os snippets abaixo como **complemento informativo (não são parceiros cadastrados)**. Se não forem de internet ao vivo, não diga “Google”; diga “fontes consultadas nesta resposta” ou similar.\n`;
      }
      block += `- Feche com UMA linha lembrando de confirmar valores e disponibilidade diretamente com o estabelecimento ou no site.\n`;
    } else if (pc === 0 && svc && wc === 0) {
      block += `- Pergunta de serviço, sem parceiro e sem snippets: diga honestamente que não há parceiro cadastrado para esse filtro; ofereça orientação genérica (bairros/regiões, como pesquisar, turismo.ms.gov.br). **Não invente** preços nem disponibilidade.\n`;
    } else if (pc === 0 && !svc && wc > 0 && hw) {
      block += `- Pergunta temática ou informativa (não é pedido de onde ficar, comer ou reservar passeio): use os snippets só como apoio. Responda de forma natural, **sem** abrir com avisos longos sobre "busca na web" ou "não são parceiros" e **sem** rodapé pedindo para conferir valores em "estabelecimentos" — isso é para sugestões comerciais.\n`;
      block += `- Não invente preços exatos, vagas ou disponibilidade.\n`;
    }

    return prompt + block;
  }

  private async callGeminiAPI(prompt: string, query?: GeminiQuery): Promise<string> {
    const isDev = import.meta.env.DEV;
    const maxOutputTokens = query?.guataPolicy?.responseDepth === 'quick' ? 900 : 2048;

    // NOVO: Tentar usar Edge Function primeiro (chaves protegidas no servidor)
    try {
      if (isDev) {
        console.log('[Guatá] Tentando usar Edge Function (chaves protegidas)...');
      }
      
      const { data, error } = await supabase.functions.invoke('guata-gemini-proxy', {
        body: {
          prompt,
          model: 'gemini-2.5-flash',
          temperature: 0.3, // Reduzido para 0.3 - mais determinístico e focado em seguir instruções rigorosamente
          maxOutputTokens
        }
      });

      // Verificar se há erro na resposta (mesmo com status 200)
      if (data?.error || !data?.success) {
        if (isDev) {
          console.error('[Guatá] ❌ Edge Function retornou erro:', data);
        }
      } else if (!error && data?.text) {
        if (isDev) {
          console.log('[Guatá] ✅ Edge Function funcionou! (chaves protegidas)');
        }
        return data.text;
      }

      // Se Edge Function falhou, logar detalhes mas continuar para fallback
      if (error) {
        if (isDev) {
          const errorObj = error && typeof error === 'object'
            ? (error as { message?: string; status?: number })
            : null;
          
          console.warn('[Guatá] Edge Function falhou:', {
            message: errorObj?.message || getErrorMessage(error),
            status: errorObj?.status,
            data: data,
            error: error
          });
        }
      } else if (data && !data.text) {
        // Edge Function retornou dados mas sem texto
        if (isDev) {
          console.warn('[Guatá] Edge Function retornou dados inválidos:', data);
        }
      }
    } catch (edgeFunctionError: unknown) {
      // Edge Function não disponível ou falhou - usar método antigo
      if (isDev) {
        console.warn('[Guatá] Edge Function não disponível, usando método direto:', getErrorMessage(edgeFunctionError));
      }
    }

    // SEGURANÇA: Sem fallback direto — apenas Edge Function
    throw new Error('Edge Function não disponível para o Guatá');
  }

  /**
   * Remove formatação markdown das respostas (asteriscos, etc.)
   */
  private cleanMarkdown(text: string): string {
    if (!text) return text;
    
    // Remover markdown bold (**texto** ou __texto__)
    let cleaned = text.replace(/\*\*(.+?)\*\*/g, '$1');
    cleaned = cleaned.replace(/__(.+?)__/g, '$1');
    
    // Remover markdown italic (*texto* ou _texto_)
    cleaned = cleaned.replace(/\*(.+?)\*/g, '$1');
    cleaned = cleaned.replace(/_(.+?)_/g, '$1');
    
    // Remover markdown headers (# ## ###)
    cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');
    
    // Manter emojis e quebras de linha
    // Limpar espaços múltiplos mas manter quebras de linha
    cleaned = cleaned.replace(/[ \t]+/g, ' ');
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    
    return cleaned.trim();
  }

  private generateFallbackResponse(query: GeminiQuery): GeminiResponse {
    const { question, searchResults } = query;
    const lowerQuestion = question.toLowerCase().trim();
    const partnersInfo = (query as any).partnersInfo;
    
    // Detectar perguntas sobre identidade do Guatá
    if (lowerQuestion.includes('quem é você') || lowerQuestion.includes('quem voce') || 
        lowerQuestion === 'quem é você' || lowerQuestion === 'quem voce' ||
        lowerQuestion.includes('você é') || lowerQuestion.includes('voce e')) {
      const variations = [
        "🦦 Oi! Que alegria te ver aqui! Eu sou o Guatá, sua capivara guia de turismo de Mato Grosso do Sul! Estou aqui para te ajudar a descobrir as maravilhas do nosso estado. Temos o Pantanal (maior santuário ecológico do mundo!), Bonito (águas cristalinas de outro planeta!), Campo Grande (nossa capital cheia de história!) e muito mais! O que você gostaria de saber?",
        "🦦 Nossa, que bom te ver por aqui! Sou o Guatá e estou super animado para te ajudar a conhecer Mato Grosso do Sul! 🚀 Temos destinos que vão te deixar de queixo caído! Me conta, o que mais te chama atenção? O Pantanal com seus jacarés? Bonito com suas águas cristalinas? Campo Grande com sua cultura?",
        "🦦 Olá, bem-vindo à nossa terra! Eu sou o Guatá, seu guia virtual de MS! 🌟 Posso te contar sobre destinos incríveis, eventos imperdíveis, comidas deliciosas e muito mais! Temos o Pantanal (maior área úmida do mundo!), Bonito (capital do ecoturismo!), Campo Grande (cidade morena cheia de charme!) e Corumbá (portal do Pantanal!). Por onde você quer começar nossa conversa?"
      ];
      return {
        answer: variations[Math.floor(Math.random() * variations.length)],
        confidence: 0.95,
        processingTime: 0,
        usedGemini: false,
        personality: 'Guatá',
        emotionalState: 'excited'
      };
    }
    
    // Variações de início para nunca repetir
    const starts = [
      "🦦 Nossa, que pergunta incrível!",
      "🦦 Que alegria te ajudar com isso!",
      "🦦 Imagina só, que pergunta interessante!",
      "🦦 Que legal que você quer saber sobre isso!",
      "🦦 Olha, que pergunta maravilhosa!"
    ];
    
    const randomStart = starts[Math.floor(Math.random() * starts.length)];
    let answer = `${randomStart} `;
    
    // PRIORIDADE 1: Se temos parceiros, mencionar PRIMEIRO
    if (partnersInfo && partnersInfo.length > 0) {
      answer = "🦦 Que alegria! Encontrei nossos parceiros oficiais da plataforma Descubra Mato Grosso do Sul para você! 🤩\n\n";
      answer += "🎯 Nossos parceiros oficiais (sempre damos preferência a eles!):\n\n";
      
      partnersInfo.slice(0, 3).forEach((partner: any, index: number) => {
        answer += `${index + 1}. ${partner.name}\n`;
        if (partner.city) answer += `   📍 ${partner.city}\n`;
        if (partner.segment) answer += `   🏷️ ${partner.segment}\n`;
        if (partner.description) answer += `   💡 ${partner.description}\n`;
        if (partner.contact_email) answer += `   📧 ${partner.contact_email}\n`;
        if (partner.contact_whatsapp) answer += `   📱 WhatsApp: ${partner.contact_whatsapp}\n`;
        if (partner.website_link) answer += `   🌐 ${partner.website_link}\n`;
        answer += `\n`;
      });
      
      answer += "✨ Estes são nossos parceiros oficiais da plataforma! Entre em contato e mencione que conheceu através do Guatá!\n\n";
      
      // Depois dos parceiros, adicionar outras opções se houver
      if (searchResults && searchResults.length > 0) {
        answer += "🌐 Também encontrei outras opções que podem te interessar:\n";
        const firstResult = searchResults[0];
        const snippet = firstResult.snippet || firstResult.description || '';
        if (snippet && snippet.length > 50) {
          answer += `${snippet.substring(0, 200)}...\n\n`;
        }
      }
    } else if (searchResults && searchResults.length > 0) {
      // Se temos resultados de pesquisa, usar eles de forma inteligente e entusiasmada
      const firstResult = searchResults[0];
      const snippet = firstResult.snippet || firstResult.description || '';
      if (snippet && snippet.length > 50) {
        answer += `Deixa eu te contar... ${snippet.substring(0, 250)}...\n\n`;
        answer += "Quer saber o melhor? Posso te dar ainda mais detalhes específicos sobre o que você quer saber! É uma experiência que vai te marcar! 🌟";
      } else {
        answer += "Encontrei algumas informações sobre isso! Deixa eu te ajudar com o que sei sobre Mato Grosso do Sul. ";
        answer += "Posso te contar sobre destinos incríveis como Bonito, Pantanal, Campo Grande e muito mais! O que mais te interessa? ✨";
      }
    } else if (lowerQuestion.includes('bonito')) {
      const variations = [
        "Bonito... imagina só nadar em águas tão cristalinas que parecem um aquário natural! É a capital do ecoturismo no Brasil! 🌊\n\nPrincipais atrativos que vão te surpreender:\n• Rio da Prata - Flutuação em águas transparentes\n• Gruta do Lago Azul - Um lago azul dentro de uma gruta\n• Buraco das Araras - Centenas de araras voando\n• Aquário Natural - Snorkel com peixes coloridos\n\nÉ de tirar o fôlego! ✨",
        "Que legal que você quer saber sobre Bonito! É um destino único no mundo, com águas cristalinas, grutas e cachoeiras incríveis! 🦦\n\nO que mais me empolga:\n• Rio da Prata - Flutuação inesquecível\n• Gruta do Lago Azul - Simplesmente deslumbrante\n• Buraco das Araras - Show de cores e vida\n• Aquário Natural - Experiência única\n\nÉ uma experiência que vai te marcar para sempre! 🌊"
      ];
      answer += variations[Math.floor(Math.random() * variations.length)];
    } else if (lowerQuestion.includes('pantanal')) {
      const variations = [
        "O Pantanal... sabe o que é mais incrível? É o maior santuário ecológico do mundo! 🐊\n\nAqui você vai ver jacarés, capivaras (como eu!), ariranhas e centenas de espécies de aves bem na sua frente, no habitat natural deles! A melhor época é de maio a outubro, quando as águas baixam e a vida selvagem fica mais visível.\n\nÉ uma experiência única que você nunca vai esquecer! 🦆",
        "Que alegria falar do Pantanal! É simplesmente o maior santuário ecológico do planeta! 🦦\n\nO que vai te surpreender:\n• Jacarés por todos os lados\n• Capivaras (minha família!) nadando\n• Ariranhas brincando\n• Centenas de aves coloridas\n\nA melhor época? De maio a outubro, quando tudo fica mais visível! É de tirar o fôlego! 🌿"
      ];
      answer += variations[Math.floor(Math.random() * variations.length)];
    } else if (lowerQuestion.includes('campo grande') || lowerQuestion.includes('campo-grande')) {
      answer = "🦦 Ahh, você vai adorar essa cidade! Campo Grande é cheia de cantinhos especiais que fazem qualquer visita valer a pena! Olha só o que te espera:\n\n🌊 **Bioparque Pantanal**\nSério, você vai ficar de boca aberta! É o maior aquário de água doce do mundo — é cada peixe mais incrível que o outro! Um passeio obrigatório!\n\n🌳 **Parque das Nações Indígenas**\nImagina um parque gigante, com lago, capivaras passeando e aquele clima tranquilo? É perfeito pra caminhar, relaxar e tirar fotos lindas!\n\n🍜 **Feira Central**\nSe prepare: aqui você come o famoso sobá, sente o cheiro das comidas típicas, vê artesanato e ainda curte aquele clima de cidade acolhedora. É impossível visitar e não se apaixonar!\n\n🌅 **Orla Morena**\nQuer ver um pôr do sol inesquecível? Esse é o lugar! Dá pra caminhar, andar de bike ou simplesmente sentar e curtir o clima.\n\n🌿 **Horto Florestal**\nUm pedacinho de paz no meio da cidade! Ótimo pra quem quer natureza sem precisar fazer esforço. Você entra e já sente outra energia!\n\nÉ uma cidade que vai te surpreender! O que mais te interessa conhecer?";
    } else if (lowerQuestion.includes('corumbá') || lowerQuestion.includes('corumba')) {
      answer += "Corumbá... imagina só, é o portal do Pantanal! 🚪\n\nÉ a cidade que te leva direto para o maior santuário ecológico do mundo! De lá você parte para safáris fotográficos, pesca esportiva e observação de animais. É a porta de entrada para uma aventura única! 🐊";
    } else if (lowerQuestion.includes('dourados')) {
      answer += "Dourados é uma cidade incrível no sul de MS! 🌾\n\nÉ conhecida pela produção agrícola e tem uma cultura rica! Tem parques, museus e uma vida cultural bem ativa. É um destino que combina história, natureza e desenvolvimento! O que você quer saber mais? ✨";
    } else if (lowerQuestion.includes('trilha') || lowerQuestion.includes('cachoeira') || lowerQuestion.includes('ecoturismo')) {
      answer += "Que legal que você gosta de ecoturismo! MS é o paraíso para isso! 🌿\n\nTemos trilhas incríveis, cachoeiras deslumbrantes e experiências únicas na natureza. Bonito é o destino principal, mas temos opções em vários lugares do estado! O que você mais curte: trilhas, cachoeiras ou flutuação? 🌊";
    } else if (lowerQuestion.includes('comida') || lowerQuestion.includes('culinária') || lowerQuestion.includes('restaurante')) {
      answer += "Nossa, a comida de MS é de dar água na boca! 🍽️\n\nTemos pratos únicos como o sobá (macarrão de origem japonesa), peixes do Pantanal, churrasco pantaneiro e muito mais! A Feira Central de Campo Grande é um ótimo lugar para experimentar! Quer saber mais sobre algum prato específico? 😋";
    } else {
      // Se não temos resultados de pesquisa, ser honesto mas ainda assim entusiasmado
      const variations = [
        "Mato Grosso do Sul é um estado incrível com destinos únicos! 🌟\n\nTemos:\n• Pantanal - Maior área úmida do mundo\n• Bonito - Águas cristalinas e ecoturismo\n• Campo Grande - Nossa capital vibrante\n• Corumbá - Portal do Pantanal\n• E muito mais!\n\nO que você gostaria de descobrir? É uma experiência que vai te marcar! 🦦",
        "Que alegria te ajudar a descobrir MS! É um estado cheio de surpresas! 🦦\n\nPrincipais destinos:\n• Pantanal - Santuário ecológico único\n• Bonito - Paraíso do ecoturismo\n• Campo Grande - Capital com muito a oferecer\n• Corumbá - Porta de entrada do Pantanal\n\nO que mais te interessa? Vou te ajudar a descobrir! ✨",
        "Que pergunta interessante! 🤔 Posso te ajudar com informações sobre Mato Grosso do Sul! Temos destinos incríveis como o Pantanal, Bonito, Campo Grande e muito mais. O que você gostaria de saber especificamente? Estou aqui para te ajudar! 🦦"
      ];
      answer += variations[Math.floor(Math.random() * variations.length)];
    }
    
    return {
      answer,
      confidence: 0.8,
      processingTime: 0,
      usedGemini: false,
      personality: 'Guatá',
      emotionalState: 'excited'
    };
  }
}

// Exportar instância única
export const guataGeminiService = new GuataGeminiService();
