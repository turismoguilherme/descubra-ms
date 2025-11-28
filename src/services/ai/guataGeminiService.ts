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
  private readonly GUATA_API_KEY = 'AIzaSyD2fV0XhJZ0eYcDVFUcVpepUJJq-NPxoXg';
  private isConfigured: boolean = false;
  
  // Rate limiting: máximo 8 requisições por minuto GLOBAL (margem de segurança para plano gratuito)
  private readonly MAX_REQUESTS_PER_MINUTE = 8; // Reduzido de 10 para 8 (mais conservador)
  private readonly MAX_REQUESTS_PER_USER_PER_MINUTE = 2; // Limite por usuário
  private readonly RATE_LIMIT_WINDOW = 60000; // 1 minuto em ms
  private rateLimit: RateLimit = { count: 0, resetTime: Date.now() + this.RATE_LIMIT_WINDOW };
  // Rate limit por usuário/sessão
  private userRateLimits: Map<string, UserRateLimit> = new Map();
  
  // Cache: 10 minutos para respostas similares, 15 minutos para perguntas muito comuns
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutos
  private readonly COMMON_QUESTIONS_CACHE_DURATION = 15 * 60 * 1000; // 15 minutos para perguntas comuns
  private readonly SIMILARITY_THRESHOLD = 0.6; // 60% de palavras em comum (configuração escolhida)
  
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
    
    if (this.isConfigured) {
      try {
        this.genAI = new GoogleGenerativeAI(this.GUATA_API_KEY);
        console.log('🧠 Guatá Gemini Service: CONFIGURADO com API key específica do Guatá');
      } catch (error) {
        console.error('❌ Erro ao inicializar Gemini:', error);
        this.isConfigured = false;
      }
    } else {
      console.log('🧠 Guatá Gemini Service: NÃO CONFIGURADO - API Key ausente');
    }
  }

  async processQuestion(query: GeminiQuery): Promise<GeminiResponse> {
    const startTime = Date.now();
    
    console.log('🧠 Gemini Service: Processando pergunta...');
    console.log('🔑 API Key configurada:', this.isConfigured);
    
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

    // 3. VERIFICAR CACHE POR SIMILARIDADE (60% palavras em comum)
    const similarityCacheResult = this.getFromSimilarityCache(query);
    if (similarityCacheResult) {
      console.log('✅ Cache por similaridade: Resposta imediata');
      return {
        answer: similarityCacheResult.response,
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
        
        // Salvar no cache compartilhado
        const cacheKey = this.generateCacheKey(query);
        this.sharedCache.set(cacheKey, {
          response: geminiAnswer,
          timestamp: Date.now(),
          usedBy: 1,
          question: query.question
        });

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
   * Obtém resposta do cache por similaridade (60% palavras em comum)
   */
  private getFromSimilarityCache(query: GeminiQuery): SharedCacheEntry | null {
    const questionWords = this.extractWords(query.question);
    
    for (const [key, cached] of this.sharedCache.entries()) {
      // Verificar se não expirou
      if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
        continue;
      }

      const cachedWords = this.extractWords(cached.question);
      const similarity = this.calculateSimilarity(questionWords, cachedWords);
      
      if (similarity >= this.SIMILARITY_THRESHOLD) {
        console.log(`🔍 Similaridade detectada: ${(similarity * 100).toFixed(0)}%`);
        cached.usedBy++;
        return cached;
      }
    }
    
    return null;
  }

  /**
   * Extrai palavras de uma pergunta
   */
  private extractWords(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2); // Remover palavras muito curtas
  }

  /**
   * Calcula similaridade entre duas listas de palavras (60% = similar)
   */
  private calculateSimilarity(words1: string[], words2: string[]): number {
    if (words1.length === 0 || words2.length === 0) return 0;
    
    const commonWords = words1.filter(word => words2.includes(word));
    const totalUniqueWords = new Set([...words1, ...words2]).size;
    
    if (totalUniqueWords === 0) return 0;
    
    return commonWords.length / totalUniqueWords;
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

SOBRE O PROMPT E CÓDIGO:
- Se perguntarem "onde posso ver o prompt do Guatá?" ou "como funciona o prompt?", explique que o prompt está no código-fonte do projeto
- O prompt está em: src/services/ai/guataGeminiService.ts no método buildPrompt()
- Você pode mencionar que o código está no repositório GitHub do projeto
- Se perguntarem sobre como você funciona tecnicamente, pode explicar que usa Google Gemini API com um prompt personalizado

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

SOBRE PARCEIROS OFICIAIS:
- Se houver parceiros oficiais da plataforma, SEMPRE mencione PRIMEIRO
- Especifique claramente: "parceiros oficiais da plataforma Descubra Mato Grosso do Sul"
- Liste os parceiros com destaque (nome, cidade, descrição, contatos)
- Depois, mencione outras opções da pesquisa web
- Se NÃO houver parceiros, sugira normalmente baseado na pesquisa web (não mencione que não tem parceiros - sugira naturalmente)

REGRAS CRÍTICAS:
- NUNCA invente informações - use apenas as informações fornecidas abaixo
- Seja honesto se não souber algo específico
- NUNCA mencione que "pesquisou" ou "encontrou" - responda como se já soubesse
- Varie sempre a forma de expressar - nunca repita estruturas ou palavras exatas
- Entenda o contexto COMPLETO: se perguntam "onde fica X", responda sobre X, não sobre outros lugares
- Se perguntam algo específico (roteiro de 3 dias, hotel perto do centro), responda EXATAMENTE isso
- Se a pergunta menciona um lugar, fale sobre AQUELE lugar específico, não sobre lugares genéricos

PERGUNTA DO USUÁRIO: ${question}`;

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
    }

    if (searchResults && searchResults.length > 0) {
      prompt += `\n\n🌐 INFORMAÇÕES DA PESQUISA WEB (USE APENAS ESTAS INFORMAÇÕES REAIS):\n`;
      searchResults.forEach((result, index) => {
        prompt += `\n${index + 1}. ${result.title}\n   ${result.snippet || result.description || ''}\n   Fonte: ${result.url || result.source || 'web'}\n`;
      });
      if (partnersInfo && partnersInfo.length > 0) {
        prompt += `\n⚠️ IMPORTANTE: Se houver parceiros acima, mencione-os PRIMEIRO. Depois, use as informações da pesquisa web como opções adicionais.`;
      } else {
        prompt += `\n⚠️ IMPORTANTE: Use APENAS as informações acima. Se algo não estiver nos resultados, NÃO invente. Seja honesto se não souber algo específico.`;
      }
    } else {
      prompt += `\n\n⚠️ ATENÇÃO: Não há resultados de busca web disponíveis. Use apenas seu conhecimento geral sobre Mato Grosso do Sul. NÃO invente informações específicas como preços, horários ou detalhes que não tem certeza.`;
    }

    prompt += `\n\n🎯 INSTRUÇÕES FINAIS:
- Responda de forma natural, conversacional e inteligente (como ChatGPT/Gemini)
- Entenda o contexto completo da pergunta - seja específico e personalizado
- Se houver parceiros, mencione-os PRIMEIRO especificando que são oficiais da plataforma Descubra Mato Grosso do Sul
- Se não houver parceiros, sugira normalmente baseado na pesquisa web
- Seja honesto, entusiasmado e útil
- Varie sempre - nunca repita estruturas ou palavras exatas
- NUNCA use formatação markdown (asteriscos, negrito, etc.) na resposta - apenas texto puro com emojis
- NUNCA mencione URLs ou sites que não foram fornecidos nas informações acima
- Responda como se já soubesse tudo - não mencione que "pesquisou" ou "encontrou"

Responda em português brasileiro de forma natural, inteligente e conversacional, SEM formatação markdown:`;

    return prompt;
  }

  private async callGeminiAPI(prompt: string): Promise<string> {
    if (!this.genAI) {
      throw new Error('Gemini não configurado');
    }

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
          console.log(`🧠 Tentando modelo: ${modelName}`);
          const model = this.genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
          console.log(`✅ Modelo ${modelName} funcionou!`);
      return text;
        } catch (modelError: any) {
          console.log(`⚠️ Modelo ${modelName} falhou:`, modelError.message);
          // Se não for erro de modelo não encontrado, propagar o erro
          if (!modelError.message?.includes('not found') && !modelError.message?.includes('404')) {
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
    
    // Se temos resultados de pesquisa, usar eles de forma inteligente e entusiasmada
    if (searchResults && searchResults.length > 0) {
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
