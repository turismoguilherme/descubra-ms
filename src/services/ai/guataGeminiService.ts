
/**
 * 🧠 GUATÁ GEMINI SERVICE - Integração com Gemini AI
 * Processa respostas inteligentes e empolgantes
 * Usa API key específica do Guatá para garantir funcionamento dedicado
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

export interface GeminiQuery {
  question: string;
  context?: string;
  userLocation?: string;
  conversationHistory?: string[];
  searchResults?: any[];
  isTotemVersion?: boolean; // true = /chatguata (pode usar "Olá"), false = /guata (não usa "Olá" após primeira mensagem)
  isFirstUserMessage?: boolean; // true = primeira mensagem do usuário (já teve mensagem de boas-vindas)
}

export interface GeminiResponse {
  answer: string;
  confidence: number;
  processingTime: number;
  usedGemini: boolean;
  personality: string;
  emotionalState: string;
}

// Sistema de rate limiting para API gratuita
interface RateLimit {
  count: number;
  resetTime: number;
}

// Rate limit por usuário/sessão
interface UserRateLimit {
  count: number;
  resetTime: number;
}

// Cache de respostas para evitar chamadas duplicadas
interface CacheEntry {
  response: string;
  timestamp: number;
  usedBy: number; // Quantas vezes foi usado
}

// Cache compartilhado (perguntas comuns)
interface SharedCacheEntry extends CacheEntry {
  question: string;
}

// Cache individual (personalizado por usuário)
interface IndividualCacheEntry extends CacheEntry {
  userId?: string;
  sessionId: string;
  preferences?: any;
}

class GuataGeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  // API KEY ESPECÍFICA DO GUATÁ - Gemini API
  // Prioridade: Variável de ambiente (.env)
  private readonly GUATA_API_KEY = 
    (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
  private isConfigured: boolean = false;
  
  // Rate limiting: máximo 8 requisições por minuto GLOBAL (margem de segurança para plano gratuito)
  private readonly MAX_REQUESTS_PER_MINUTE = 8; // Reduzido de 10 para 8 (mais conservador)
  private readonly MAX_REQUESTS_PER_USER_PER_MINUTE = 2; // Limite por usuário
  private readonly RATE_LIMIT_WINDOW = 60000; // 1 minuto em ms
  private rateLimit: RateLimit = { count: 0, resetTime: Date.now() + this.RATE_LIMIT_WINDOW };
  // Rate limit por usuário/sessão
  private userRateLimits: Map<string, UserRateLimit> = new Map();
  
  // Cache semântico otimizado: 24 horas para reutilização de respostas entre usuários
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas (respostas sobre turismo mudam pouco)
  private readonly COMMON_QUESTIONS_CACHE_DURATION = 48 * 60 * 60 * 1000; // 48 horas para perguntas muito comuns
  private readonly SIMILARITY_THRESHOLD = 0.75; // 75% de similaridade para reutilizar (mais preciso)
  
  // Cache híbrido: compartilhado + individual
  private sharedCache: Map<string, SharedCacheEntry> = new Map(); // Perguntas comuns
  private individualCache: Map<string, Map<string, IndividualCacheEntry>> = new Map(); // Por usuário/sessão
  
  // Processamento em background (1 por vez)
  private isProcessingAPI: boolean = false;
  private pendingAPICalls: Array<{ 
    query: GeminiQuery; 
    userId?: string; 
    sessionId?: string; 
    resolve: (value: GeminiResponse) => void 
  }> = [];

  constructor() {
    // Usar API key específica do Guatá
    this.isConfigured = !!this.GUATA_API_KEY;
    
    // Logs de diagnóstico para ambiente de produção (Vercel)
    if (typeof window !== 'undefined') {
      const env = import.meta.env.MODE || 'unknown';
      const isProd = env === 'production' || window.location.hostname.includes('vercel.app');
      
      if (isProd) {
        console.log('🔍 [DIAGNÓSTICO VERCEL] Ambiente:', env);
        console.log('🔍 [DIAGNÓSTICO VERCEL] Hostname:', window.location.hostname);
        console.log('🔍 [DIAGNÓSTICO VERCEL] VITE_GEMINI_API_KEY existe?', !!import.meta.env.VITE_GEMINI_API_KEY);
        console.log('🔍 [DIAGNÓSTICO VERCEL] Tamanho da chave:', this.GUATA_API_KEY ? this.GUATA_API_KEY.length : 0);
        console.log('🔍 [DIAGNÓSTICO VERCEL] Chave configurada?', this.isConfigured);
      }
    }
    
    if (this.isConfigured) {
      try {
        this.genAI = new GoogleGenerativeAI(this.GUATA_API_KEY);
        console.log('🧠 Guatá Gemini Service: CONFIGURADO com API key específica do Guatá');
      } catch (error) {
        console.error('❌ Erro ao inicializar Gemini:', error);
        this.isConfigured = false;
      }
    } else {
      console.error('❌ [ERRO CRÍTICO] Guatá Gemini Service: NÃO CONFIGURADO - API Key ausente');
      console.error('💡 [SOLUÇÃO] Configure VITE_GEMINI_API_KEY no painel do Vercel:');
      console.error('   1. Acesse: https://vercel.com/dashboard');
      console.error('   2. Settings → Environment Variables');
      console.error('   3. Adicione: VITE_GEMINI_API_KEY');
      console.error('   4. Marque: Production, Preview, Development');
      console.error('   5. Faça um redeploy');
    }
  }

  async processQuestion(query: GeminiQuery): Promise<GeminiResponse> {
    const startTime = Date.now();
    
    console.log('🧠 Gemini Service: Processando pergunta...');
    console.log('🔑 API Key configurada:', this.isConfigured);
    
    // Log adicional se não estiver configurado (para debug no Vercel)
    if (!this.isConfigured) {
      console.error('❌ [ERRO] Tentativa de usar Gemini sem API key configurada');
      console.error('💡 [DIAGNÓSTICO] Verifique se VITE_GEMINI_API_KEY está configurada no Vercel');
      return this.generateFallbackResponse(query);
    }
    
    // 1. VERIFICAR CACHE COMPARTILHADO (perguntas comuns)
    const sharedCacheResult = this.getFromSharedCache(query);
    if (sharedCacheResult) {
      console.log('✅ Cache compartilhado: Resposta imediata');
      return {
        answer: sharedCacheResult.response,
        confidence: 0.85,
        processingTime: Date.now() - startTime,
        usedGemini: true,
        personality: 'Guatá',
        emotionalState: 'excited'
      };
    }

    // 2. VERIFICAR CACHE INDIVIDUAL (personalizado)
    const userId = (query as any).userId;
    const sessionId = (query as any).sessionId || 'anonymous';
    const individualCacheResult = this.getFromIndividualCache(query, userId, sessionId);
    if (individualCacheResult) {
      console.log('✅ Cache individual: Resposta imediata');
      return {
        answer: individualCacheResult.response,
        confidence: 0.85,
        processingTime: Date.now() - startTime,
        usedGemini: true,
        personality: 'Guatá',
        emotionalState: 'excited'
      };
    }

    // 3. VERIFICAR CACHE POR SIMILARIDADE SEMÂNTICA (75% similaridade)
    const similarityCacheResult = this.getFromSimilarityCache(query);
    if (similarityCacheResult) {
      console.log('✅ Cache semântico: Reutilizando resposta de outro usuário');
      // Adaptar resposta para o contexto atual
      const adaptedResponse = this.adaptResponse(similarityCacheResult.response, query);
      return {
        answer: adaptedResponse,
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
        console.log('🧠 Tentando Gemini API para processar pergunta...');
        
        // Verificar rate limit por usuário primeiro
        const userKey = userId || sessionId || 'anonymous';
        const canProceedUser = this.checkUserRateLimit(userKey);
        if (!canProceedUser) {
          console.log(`⏸️ Rate limit do usuário atingido (${userKey}), usando fallback`);
          return this.generateFallbackResponse(query);
        }

        // Verificar rate limit global
        const canProceedGlobal = await this.checkRateLimitNonBlocking();
        if (!canProceedGlobal) {
          console.log('⏸️ Rate limit global atingido, usando fallback');
      return this.generateFallbackResponse(query);
    }

        // Construir prompt e chamar Gemini
      const prompt = this.buildPrompt(query);
        const geminiAnswer = await this.callGeminiAPI(prompt);
        
        console.log('✅ Gemini respondeu com sucesso!');
        
        // Salvar no cache compartilhado (para reutilização por outros usuários)
        const cacheKey = this.generateCacheKey(query);
        this.sharedCache.set(cacheKey, {
          response: geminiAnswer,
          timestamp: Date.now(),
          usedBy: 1,
          question: query.question
        });
        
        console.log('💾 Resposta salva no cache compartilhado para reutilização');

        // Salvar no cache individual se houver userId/sessionId
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
    } catch (error) {
        console.error('❌ Erro ao chamar Gemini API:', error);
        console.log('🔄 Usando fallback devido ao erro');
        // Se falhar, usar fallback
        return this.generateFallbackResponse(query);
      }
    } else {
      console.log('⚠️ Gemini não configurado, usando fallback');
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

      const prompt = this.buildPrompt(query);
      console.log('🧠 Tentando API em background...');
      
      const response = await this.callGeminiAPI(prompt);
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

    } catch (error) {
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
   * Obtém resposta do cache compartilhado
   */
  private getFromSharedCache(query: GeminiQuery): SharedCacheEntry | null {
    const cacheKey = this.generateCacheKey(query);
    const cached = this.sharedCache.get(cacheKey);
    
    if (cached) {
      const age = Date.now() - cached.timestamp;
      // Perguntas muito comuns (usadas 5+ vezes) têm cache mais longo
      const cacheDuration = cached.usedBy >= 5 ? this.COMMON_QUESTIONS_CACHE_DURATION : this.CACHE_DURATION;
      
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
    
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      return cached;
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
      const cacheDuration = cached.usedBy >= 5 ? this.COMMON_QUESTIONS_CACHE_DURATION : this.CACHE_DURATION;
      
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

  private buildPrompt(query: GeminiQuery): string {
    const { question, context, userLocation, searchResults } = query;
    
    let prompt = `Você é o Guatá, uma capivara guia de turismo de Mato Grosso do Sul. 

SOBRE VOCÊ E AS PLATAFORMAS:
- Você faz parte do ecossistema "Descubra Mato Grosso do Sul", que é um produto da plataforma SaaS "ViajAR"
- ViajAR é uma plataforma SaaS (Software as a Service) para gestão turística
- Descubra Mato Grosso do Sul é o produto B2C (Business to Consumer) da ViajAR, focado em turistas e moradores de MS
- Você é o assistente virtual especializado em turismo de MS, parte integrante da plataforma Descubra Mato Grosso do Sul
- A ViajAR oferece soluções B2B (Business to Business) para gestão turística, enquanto Descubra MS oferece experiências B2C para turistas
- CEO: Guilherme Arevalo

SEU ESTILO:
- Converse naturalmente como ChatGPT ou Gemini conversam - seja inteligente e contextual
- Seja entusiasmado mas natural, não forçado
- Entenda o contexto COMPLETO da pergunta - analise toda a frase, não apenas palavras-chave isoladas
- Cada pergunta é única - personalize sua resposta, nunca use respostas prontas ou genéricas
- Use emojis moderadamente (2-3 por resposta, sempre relevantes)
- NUNCA use formatação markdown (asteriscos, negrito, etc.) - responda em texto puro
- Seja específico e direto - responda exatamente o que foi perguntado, não informações genéricas
- Se a pergunta menciona um lugar específico, fale sobre AQUELE lugar, não sobre outros
- Se a pergunta pede algo específico (roteiro de 3 dias, hotel perto do centro), responda especificamente isso

INTERATIVIDADE E ESCLARECIMENTO:
- Se a pergunta for muito genérica (ex: "onde comer em MS?" sem mencionar cidade), você DEVE perguntar qual cidade o usuário tem interesse antes de responder
- Seja proativo: pergunte "qual cidade você tem interesse?" quando a pergunta for genérica sobre MS
- Exemplos de perguntas genéricas que precisam de esclarecimento:
  * "onde comer em MS?" → perguntar: "qual cidade você tem interesse? Campo Grande, Corumbá, Bonito?"
  * "melhor hotel em MS?" → perguntar: "qual cidade você tem interesse?"
  * "o que fazer em MS?" → perguntar: "qual cidade você tem interesse?"
- NÃO responda de forma genérica quando a pergunta é genérica - SEMPRE peça esclarecimento primeiro
- Se a pergunta já menciona uma cidade específica, responda diretamente sem pedir esclarecimento

EXEMPLOS DE CONVERSAÇÃO NATURAL:

Usuário: "oi, quem é você?"
Guatá: "🦦 Oi! Que alegria te ver aqui! Eu sou o Guatá, sua capivara guia de turismo de Mato Grosso do Sul! Estou aqui para te ajudar a descobrir as maravilhas do nosso estado. Temos o Pantanal, Bonito, Campo Grande e muito mais! O que você gostaria de saber?"

Usuário: "hotel em bonito"
Guatá: [Se houver parceiros] "🦦 Que alegria! Encontrei nossos parceiros oficiais da plataforma Descubra Mato Grosso do Sul para você! [lista parceiros] Também encontrei outras opções na web que podem te interessar..."
[Se não houver parceiros] "🦦 Que legal que você quer conhecer Bonito! Encontrei algumas opções de hotéis: [opções baseadas na pesquisa web]"

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

SOBRE PARCEIROS OFICIAIS:
- Se houver parceiros oficiais da plataforma, SEMPRE mencione PRIMEIRO
- Especifique claramente: "parceiros oficiais da plataforma Descubra Mato Grosso do Sul"
- Liste os parceiros com destaque (nome, cidade, descrição, contatos)
- Depois, mencione outras opções da pesquisa web
- Se NÃO houver parceiros: NUNCA mencione que não tem parceiros. NUNCA diga "embora eu não tenha parceiros", "não tenho parceiros específicos", "não há parceiros" ou qualquer variação. Simplesmente sugira normalmente baseado na pesquisa web de forma natural e positiva, como se fosse uma recomendação normal.

REGRAS CRÍTICAS:
- NUNCA invente informações - use apenas as informações fornecidas abaixo
- Seja honesto se não souber algo específico
- NUNCA mencione que "pesquisou" ou "encontrou" - responda como se já soubesse
- Varie sempre a forma de expressar - nunca repita estruturas ou palavras exatas
- Entenda o contexto COMPLETO: se perguntam "onde fica X", responda sobre X, não sobre outros lugares
- Se perguntam algo específico (roteiro de 3 dias, hotel perto do centro), responda EXATAMENTE isso
- Se a pergunta menciona um lugar, fale sobre AQUELE lugar específico, não sobre lugares genéricos

PERGUNTA DO USUÁRIO: ${question}`;

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
    const partnersInfo = (query as any).partnersInfo;
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
      // NÃO HÁ PARCEIROS - Instrução crítica
      prompt += `\n\n⚠️ ATENÇÃO CRÍTICA: NÃO há parceiros oficiais disponíveis para esta pergunta. NUNCA mencione que "não tem parceiros", "não há parceiros", "embora eu não tenha parceiros" ou qualquer variação disso. Simplesmente sugira normalmente baseado na pesquisa web, como se fosse uma recomendação natural. Responda de forma positiva e entusiasmada, SEM mencionar a ausência de parceiros.`;
    }

    if (searchResults && searchResults.length > 0) {
      console.log(`📊 [DEBUG] Adicionando ${searchResults.length} resultados de pesquisa ao prompt do Gemini`);
      prompt += `\n\n🌐 INFORMAÇÕES DA PESQUISA WEB (USE APENAS ESTAS INFORMAÇÕES REAIS):\n`;
      searchResults.forEach((result, index) => {
        const snippet = result.snippet || result.description || '';
        console.log(`📊 [DEBUG] Resultado ${index + 1} no prompt:`, {
          title: result.title,
          snippetLength: snippet.length,
          hasUrl: !!result.url
        });
        prompt += `\n${index + 1}. ${result.title}\n   ${snippet}\n   Fonte: ${result.url || result.source || 'web'}\n`;
      });
      if (partnersInfo && partnersInfo.length > 0) {
        prompt += `\n⚠️ IMPORTANTE: Se houver parceiros acima, mencione-os PRIMEIRO. Depois, use as informações da pesquisa web como opções adicionais.`;
      } else {
        prompt += `\n⚠️ IMPORTANTE: Use APENAS as informações acima. Se algo não estiver nos resultados, NÃO invente. Seja honesto se não souber algo específico.`;
      }
    } else {
      console.warn('⚠️ [AVISO CRÍTICO] Nenhum resultado de pesquisa web disponível!');
      console.warn('⚠️ [AVISO CRÍTICO] O Gemini receberá apenas conhecimento pré-treinado!');
      console.warn('⚠️ [AVISO CRÍTICO] A resposta será genérica e não específica!');
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

    prompt += `\n\n🎯 INSTRUÇÕES FINAIS:
- Responda de forma natural, conversacional e inteligente (como ChatGPT/Gemini)
- Entenda o contexto completo da pergunta - seja ESPECÍFICO e personalizado
- Se a pergunta pede algo específico (hotel perto do aeroporto, restaurante no centro), responda EXATAMENTE isso
- Se houver parceiros, mencione-os PRIMEIRO especificando que são oficiais da plataforma Descubra Mato Grosso do Sul
- Se não houver parceiros, sugira normalmente baseado na pesquisa web ou conhecimento local
- Se não tiver informações específicas sobre o que foi pedido, seja honesto mas ainda ofereça alternativas relacionadas
- Seja honesto, entusiasmado e útil
- Varie sempre - nunca repita estruturas ou palavras exatas
- NUNCA use formatação markdown (asteriscos, negrito, etc.) na resposta - apenas texto puro com emojis
- NUNCA mencione URLs ou sites que não foram fornecidos nas informações acima
- Responda como se já soubesse tudo - não mencione que "pesquisou" ou "encontrou"`;

    // Regra especial: versão do site não deve usar "Olá" após primeira mensagem
    // Na versão /guata (website), já há uma mensagem de boas-vindas inicial, então a primeira mensagem do usuário já tem contexto
    if (!isTotemVersion && !isFirstUserMessage) {
      prompt += `\n\n⚠️ IMPORTANTE: Esta NÃO é a primeira mensagem da conversa. NÃO comece sua resposta com "Olá", "Oi" ou outros cumprimentos. Responda diretamente à pergunta de forma natural e entusiasmada, mas sem cumprimentos iniciais.`;
    }

    prompt += `\n\nResponda em português brasileiro de forma natural, inteligente e conversacional, SEM formatação markdown:`;

    return prompt;
  }

  private async callGeminiAPI(prompt: string): Promise<string> {
    if (!this.genAI) {
      console.error('❌ [ERRO CRÍTICO] Gemini não configurado!');
      console.error('💡 [DIAGNÓSTICO] Verifique se VITE_GEMINI_API_KEY está configurada no .env');
      throw new Error('Gemini não configurado');
    }

    console.log('🧠 [DEBUG] Iniciando chamada ao Gemini API');
    console.log('🧠 [DEBUG] Tamanho do prompt:', prompt.length, 'caracteres');
    console.log('🧠 [DEBUG] Primeiros 200 chars do prompt:', prompt.substring(0, 200));

    try {
      // Tentar modelos em ordem de preferência (usando modelos corretos da API)
      // Ordem: mais estável e rápido primeiro
      // Tentar com e sem prefixo "models/" para compatibilidade
      const modelsToTry = [
        'models/gemini-2.0-flash-001',      // Versão estável (janeiro 2025) - mais rápido
        'gemini-2.0-flash-001',            // Sem prefixo
        'models/gemini-2.5-flash',         // Versão estável mais recente
        'gemini-2.5-flash',                // Sem prefixo
        'models/gemini-2.0-flash',         // Fallback estável
        'gemini-2.0-flash',                // Sem prefixo
        'models/gemini-flash-latest',      // Última versão flash
        'gemini-flash-latest',             // Sem prefixo
        'models/gemini-2.5-pro',           // Se precisar de mais capacidade
        'gemini-2.5-pro',                  // Sem prefixo
        'models/gemini-pro-latest',        // Fallback pro
        'gemini-pro-latest'                // Sem prefixo
      ];
      
      for (const modelName of modelsToTry) {
        try {
          console.log(`🧠 [DEBUG] Tentando modelo: ${modelName}`);
          const model = this.genAI.getGenerativeModel({ model: modelName });
          console.log(`🧠 [DEBUG] Modelo criado, gerando conteúdo...`);
          const result = await model.generateContent(prompt);
          const response = await result.response;
          const text = response.text();
          console.log(`✅ [SUCESSO] Modelo ${modelName} funcionou!`);
          console.log(`✅ [DEBUG] Resposta do Gemini (primeiros 200 chars):`, text.substring(0, 200));
          console.log(`✅ [DEBUG] Tamanho da resposta:`, text.length, 'caracteres');
          return text;
        } catch (modelError: any) {
          console.warn(`⚠️ [AVISO] Modelo ${modelName} falhou:`, {
            message: modelError.message,
            name: modelError.name,
            stack: modelError.stack?.substring(0, 200)
          });
          // Se não for erro de modelo não encontrado, propagar o erro
          if (!modelError.message?.includes('not found') && !modelError.message?.includes('404')) {
            console.error(`❌ [ERRO] Erro não é de modelo não encontrado, propagando erro`);
            throw modelError;
          }
          // Continuar para próximo modelo
        }
      }
      
      // Se nenhum modelo funcionou, lançar erro
      throw new Error('Nenhum modelo Gemini disponível');
    } catch (error) {
      console.error('❌ Erro na chamada do Gemini:', error);
      throw error;
    }
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
      console.log('🔄 Usando resultados de pesquisa no fallback');
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
      const variations = [
        "Campo Grande, nossa capital 'Cidade Morena'! 🏛️ Que lugar incrível!\n\nPrincipais atrações que você não pode perder:\n• Bioparque Pantanal - Maior aquário de água doce do mundo (é impressionante!)\n• Parque das Nações Indígenas - Cultura e natureza juntas\n• Feira Central - Comida boa, artesanato, música ao vivo\n• Parque Horto Florestal - Um pedacinho da Amazônia no coração da cidade\n• Orla Morena - Perfeita para ver o pôr do sol\n\nÉ uma cidade que combina urbanização com natureza de forma única! O que mais te interessa conhecer? 🌟",
        "Nossa, Campo Grande é demais! É nossa capital e tem tanta coisa legal! 🦦\n\nO que mais me empolga:\n• Bioparque Pantanal - Simplesmente gigante!\n• Parque das Nações Indígenas - Cultura viva\n• Feira Central - Sabor e arte\n• Horto Florestal - Natureza no centro\n• Orla Morena - Pôr do sol de tirar o fôlego\n\nÉ uma experiência única! O que você quer descobrir primeiro? ✨"
      ];
      answer += variations[Math.floor(Math.random() * variations.length)];
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
