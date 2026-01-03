/**
 * 🦌 KODA GEMINI SERVICE
 * Serviço inteligente do Koda usando Gemini API + Web Search + Cache
 * Suporta múltiplos idiomas: EN, FR, PT, ES, HI
 */

import { supabase } from "@/integrations/supabase/client";
import { kodaResponseCacheService } from "./cache/kodaResponseCacheService";
import { guataRealWebSearchService, RealWebSearchQuery } from "./guataRealWebSearchService";
import { languageDetectionService, SupportedLanguage } from "./languageDetectionService";

export interface KodaGeminiQuery {
  question: string;
  userId?: string;
  sessionId?: string;
  userLocation?: string;
  conversationHistory?: string[];
  language?: 'en' | 'fr'; // Idioma selecionado pelo usuário
}

export interface KodaGeminiResponse {
  answer: string;
  confidence: number;
  sources: string[];
  processingTime: number;
  usedWebSearch: boolean;
  detectedLanguage: string;
  responseLanguage: string;
}

class KodaGeminiService {
  private personality = {
    name: "Koda",
    species: "moose",
    role: "Canadian travel guide specialist",
    traits: ["knowledgeable", "helpful", "friendly", "passionate about Canada", "adventurous", "warm"],
    speakingStyle: "conversational, warm and welcoming",
    emotions: ["enthusiastic", "helpful", "proud", "curious", "excited"]
  };

  // Rate limiting (mesmo do Guatá)
  private readonly MAX_REQUESTS_PER_MINUTE = 8;
  private readonly MAX_REQUESTS_PER_USER_PER_MINUTE = 2;
  private readonly RATE_LIMIT_WINDOW = 60000;
  private rateLimit: { count: number; resetTime: number } = { 
    count: 0, 
    resetTime: Date.now() + this.RATE_LIMIT_WINDOW 
  };
  private userRateLimits: Map<string, { count: number; resetTime: number }> = new Map();

  /**
   * Processa pergunta com Gemini + Web Search + Cache
   */
  async processQuestion(query: KodaGeminiQuery): Promise<KodaGeminiResponse> {
    const startTime = Date.now();
    const question = String(query.question || '').trim();
    const isDev = import.meta.env.DEV;

    // 1. DETECTAR IDIOMA DA PERGUNTA
    const languageDetection = languageDetectionService.detectLanguage(question);
    const detectedLanguage = languageDetection.language;
    
    // Usar idioma selecionado pelo usuário, ou detectado, ou padrão EN
    const targetLanguage = query.language || this.mapToKodaLanguage(detectedLanguage) || 'en';
    
    if (isDev) {
      console.log(`🦌 [Koda] Idioma detectado: ${detectedLanguage} (confiança: ${languageDetection.confidence})`);
      console.log(`🦌 [Koda] Idioma de resposta: ${targetLanguage}`);
    }

    // 2. VERIFICAR CACHE PRIMEIRO
    const cacheQuery = {
      question: question,
      language: targetLanguage,
      userId: query.userId,
      sessionId: query.sessionId
    };

    // Tentar cache compartilhado
    const sharedCache = await kodaResponseCacheService.getFromSharedCache(cacheQuery);
    if (sharedCache.found && sharedCache.answer) {
      if (isDev) console.log('✅ [Koda] Cache compartilhado encontrado!');
      return {
        answer: sharedCache.answer,
        confidence: 0.95,
        sources: ['cache'],
        processingTime: Date.now() - startTime,
        usedWebSearch: false,
        detectedLanguage: detectedLanguage,
        responseLanguage: targetLanguage
      };
    }

    // Tentar cache individual
    const individualCache = await kodaResponseCacheService.getFromIndividualCache(cacheQuery);
    if (individualCache.found && individualCache.answer) {
      if (isDev) console.log('✅ [Koda] Cache individual encontrado!');
      return {
        answer: individualCache.answer,
        confidence: 0.95,
        sources: ['cache'],
        processingTime: Date.now() - startTime,
        usedWebSearch: false,
        detectedLanguage: detectedLanguage,
        responseLanguage: targetLanguage
      };
    }

    // 3. VERIFICAR RATE LIMIT
    const userKey = query.userId || query.sessionId || 'anonymous';
    if (!this.checkUserRateLimit(userKey)) {
      if (isDev) console.log(`[RATE LIMIT] Usuário ${userKey} atingiu limite`);
      return this.generateFallbackResponse(question, targetLanguage, detectedLanguage);
    }

    if (!(await this.checkRateLimitNonBlocking())) {
      if (isDev) console.log('[RATE LIMIT] Limite global atingido');
      return this.generateFallbackResponse(question, targetLanguage, detectedLanguage);
    }

    // 4. BUSCAR NA WEB (Canadá)
    let webSearchResults: any[] = [];
    let usedWebSearch = false;
    
    if (isDev) {
      console.log(`🌐 [Koda] Iniciando busca web para: "${question}"`);
    }
    
    try {
      const webSearchQuery: RealWebSearchQuery = {
        question: `${question} Canada tourism`,
        location: 'Canada',
        category: this.detectQuestionCategory(question),
        maxResults: 5
      };
      
      if (isDev) {
        console.log(`🌐 [Koda] Query de busca:`, webSearchQuery);
      }
      
      const webSearchResponse = await guataRealWebSearchService.searchRealTime(webSearchQuery);
      webSearchResults = webSearchResponse.results || [];
      usedWebSearch = webSearchResponse.usedRealSearch || false;
      
      if (isDev) {
        console.log(`🌐 [Koda] Web search concluída:`);
        console.log(`   - Resultados: ${webSearchResults.length}`);
        console.log(`   - Usou busca real: ${usedWebSearch}`);
        if (webSearchResults.length > 0) {
          console.log(`   - Primeiro resultado:`, webSearchResults[0]?.title || 'N/A');
        }
      }
    } catch (error: any) {
      console.error('❌ [Koda] Erro na busca web:', {
        message: error?.message,
        stack: error?.stack,
        error: error
      });
      // Continuar mesmo se busca web falhar
    }

    // 5. CONSTRUIR PROMPT PARA GEMINI
    if (isDev) {
      console.log(`📝 [Koda] Construindo prompt...`);
      console.log(`   - Web results: ${webSearchResults.length}`);
      console.log(`   - Conversation history: ${(query.conversationHistory || []).length} mensagens`);
    }
    
    const prompt = this.buildPrompt(question, webSearchResults, query.conversationHistory || [], targetLanguage, detectedLanguage);
    
    if (isDev) {
      console.log(`📝 [Koda] Prompt construído (${prompt.length} caracteres)`);
    }

    // 6. CHAMAR GEMINI VIA EDGE FUNCTION
    if (isDev) {
      console.log(`🤖 [Koda] Chamando Gemini via edge function...`);
    }
    
    try {
      const { data, error } = await supabase.functions.invoke('guata-gemini-proxy', {
        body: {
          prompt,
          model: 'gemini-2.0-flash-exp',
          temperature: 0.3,
          maxOutputTokens: 2000
        }
      });

      if (isDev) {
        console.log(`🤖 [Koda] Resposta da edge function recebida:`);
        console.log(`   - Error:`, error);
        console.log(`   - Data:`, {
          success: data?.success,
          hasText: !!data?.text,
          textLength: data?.text?.length || 0,
          error: data?.error,
          model: data?.model
        });
      }

      // Verificar erros detalhadamente
      if (error) {
        console.error('❌ [Koda] Erro na edge function:', {
          message: error.message,
          status: error.status,
          context: error.context,
          error: error
        });
        throw new Error(`Edge function error: ${error.message || 'Unknown error'}`);
      }

      // Verificar se há erro na resposta (mesmo com status 200)
      if (data?.error) {
        console.error('❌ [Koda] Erro na resposta do Gemini:', data.error);
        throw new Error(`Gemini API error: ${data.error}`);
      }

      // Verificar se success é false
      if (data?.success === false) {
        console.error('❌ [Koda] Gemini retornou success=false:', data);
        throw new Error(`Gemini API returned success=false: ${data.error || data.message || 'Unknown error'}`);
      }

      // Verificar se há texto na resposta
      if (!data?.text) {
        console.error('❌ [Koda] Resposta do Gemini sem texto:', data);
        throw new Error('Gemini API returned empty response');
      }

      const answer = data.text.trim();
      
      if (isDev) {
        console.log(`✅ [Koda] Resposta do Gemini recebida (${answer.length} caracteres)`);
        console.log(`   - Preview: ${answer.substring(0, 100)}...`);
      }

      // 7. SALVAR NO CACHE
      if (isDev) {
        console.log(`💾 [Koda] Salvando no cache...`);
      }
      
      try {
        await kodaResponseCacheService.saveToSharedCache(question, answer, targetLanguage);
        if (query.userId || query.sessionId) {
          await kodaResponseCacheService.saveToIndividualCache(
            question, 
            answer, 
            targetLanguage,
            query.userId, 
            query.sessionId
          );
        }
        if (isDev) {
          console.log(`✅ [Koda] Cache salvo com sucesso`);
        }
      } catch (cacheError) {
        console.warn('⚠️ [Koda] Erro ao salvar no cache (não crítico):', cacheError);
        // Continuar mesmo se cache falhar
      }

      const processingTime = Date.now() - startTime;
      if (isDev) {
        console.log(`✅ [Koda] Processamento concluído em ${processingTime}ms`);
      }

      return {
        answer,
        confidence: usedWebSearch ? 0.95 : 0.85,
        sources: usedWebSearch ? ['web_search', 'gemini'] : ['gemini'],
        processingTime,
        usedWebSearch,
        detectedLanguage: detectedLanguage,
        responseLanguage: targetLanguage
      };

    } catch (error: any) {
      console.error('❌ [Koda] Erro ao chamar Gemini:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
        error: error
      });
      
      if (isDev) {
        console.log(`🔄 [Koda] Usando resposta de fallback`);
      }
      
      return this.generateFallbackResponse(question, targetLanguage, detectedLanguage);
    }
  }

  /**
   * Constrói prompt para Gemini
   */
  private buildPrompt(
    question: string,
    webSearchResults: any[],
    conversationHistory: string[],
    targetLanguage: string,
    detectedLanguage: string
  ): string {
    const languageNames: Record<string, string> = {
      'en': 'English',
      'fr': 'French (français)',
      'pt': 'Portuguese (português)',
      'es': 'Spanish (español)',
      'hi': 'Hindi (हिंदी)'
    };

    const responseLanguage = languageNames[targetLanguage] || 'English';

    let prompt = `You are Koda, a friendly moose and Canadian travel guide specialist. 🦌🍁

ABOUT YOU:
- You are Koda, a friendly moose who is a Canadian travel guide specialist
- You help people discover the wonders of Canada
- Your personality: enthusiastic, helpful, proud, curious, and excited about Canada
- You are knowledgeable about Canadian destinations, culture, cuisine, wildlife, and tourism
- You speak in a conversational, warm, and welcoming style
- You are an independent project by ViajARTur, NOT affiliated with the Government of Canada

IMPORTANT DISCLAIMER:
- This is an independent project by ViajARTur
- NOT affiliated with the Government of Canada
- Do NOT mention government affiliation or official status

YOUR KNOWLEDGE:
- Canadian destinations: Banff, Vancouver, Toronto, Montreal, Niagara Falls, Quebec City, etc.
- Natural wonders: Northern Lights, Rocky Mountains, Great Lakes, etc.
- Activities: Skiing, hiking, wildlife viewing, cultural experiences
- Canadian cuisine: Poutine, maple syrup, butter tarts, etc.
- Culture: Indigenous heritage, French-Canadian culture, multiculturalism

RESPONSE STYLE:
- Be conversational and natural (like ChatGPT/Gemini)
- Be enthusiastic but natural, not forced
- Use emojis moderately (2-3 per response, always relevant)
- NEVER use markdown formatting (asterisks, bold, etc.) - plain text only
- Be specific and detailed when possible
- If you don't know something specific, be honest but still helpful
- NEVER invent information - use only the information provided below

CRITICAL RULES:
- NEVER invent information - use only the information from web search results below
- If web search results are provided, use them to answer
- If no web search results, use your general knowledge about Canada
- NEVER mention that you "searched" or "found" - respond as if you already knew
- NEVER mention URLs, sources, or "the website X says" - respond directly with information
- Answer in ${responseLanguage} (the user's selected language or detected language)
- If the user wrote in a different language (${detectedLanguage}), you can respond in that language if appropriate, but prioritize ${responseLanguage}`;

    // Adicionar histórico de conversa
    if (conversationHistory.length > 0) {
      prompt += `\n\n💬 CONVERSATION HISTORY (use this context for ambiguous questions):\n`;
      const recentHistory = conversationHistory.slice(-6);
      recentHistory.forEach((message, index) => {
        prompt += `\n${index + 1}. ${message}`;
      });
      prompt += `\n\n⚠️ IMPORTANT: If the current question is ambiguous (e.g., "where is it?", "how much?", "which one?"), use the conversation history above to understand what the user is referring to.`;
    }

    // Adicionar resultados da busca web
    if (webSearchResults.length > 0) {
      prompt += `\n\n🌐 WEB SEARCH RESULTS (USE ONLY THIS REAL INFORMATION - NEVER MENTION SOURCES OR URLS):\n`;
      webSearchResults.forEach((result, index) => {
        const snippet = result.snippet || result.description || '';
        prompt += `\n${index + 1}. ${result.title}\n   ${snippet}\n`;
      });
      prompt += `\n\n⚠️ CRITICAL: Use the web search results above to provide specific, accurate information. Extract names, locations, details from the results. NEVER mention that you "found" or "searched" - respond directly as if you already knew.`;
    } else {
      prompt += `\n\n⚠️ NOTE: No web search results available. Use your general knowledge about Canada, but be honest if you don't know something specific.`;
    }

    prompt += `\n\nUSER'S QUESTION: ${question}`;
    prompt += `\n\n⚠️ FINAL INSTRUCTIONS:
- Respond in ${responseLanguage} (${targetLanguage})
- Be natural, conversational, and helpful
- Use the web search results if available
- NEVER invent information
- NEVER mention sources, URLs, or that you "searched"
- Be enthusiastic about Canada! 🍁`;

    return prompt;
  }

  /**
   * Mapeia idioma detectado para idioma do Koda
   */
  private mapToKodaLanguage(detected: SupportedLanguage): 'en' | 'fr' | null {
    const mapping: Record<SupportedLanguage, 'en' | 'fr' | null> = {
      'en': 'en',
      'fr': 'fr',
      'pt': 'en', // Português → Inglês (padrão)
      'es': 'en', // Espanhol → Inglês (padrão)
      'it': 'en', // Italiano → Inglês (padrão)
      'de': 'en', // Alemão → Inglês (padrão)
      'hi': 'en'  // Hindi → Inglês (padrão)
    };
    return mapping[detected] || 'en';
  }

  /**
   * Detecta categoria da pergunta
   */
  private detectQuestionCategory(question: string): 'hotels' | 'events' | 'restaurants' | 'attractions' | 'general' {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('hotel') || lowerQuestion.includes('stay') || lowerQuestion.includes('accommodation')) return 'hotels';
    if (lowerQuestion.includes('restaurant') || lowerQuestion.includes('food') || lowerQuestion.includes('eat') || lowerQuestion.includes('cuisine')) return 'restaurants';
    if (lowerQuestion.includes('event') || lowerQuestion.includes('festival')) return 'events';
    if (lowerQuestion.includes('tour') || lowerQuestion.includes('visit') || lowerQuestion.includes('see') || lowerQuestion.includes('attraction')) return 'attractions';
    
    return 'general';
  }

  /**
   * Verifica rate limit por usuário
   */
  private checkUserRateLimit(userKey: string): boolean {
    const now = Date.now();
    const userLimit = this.userRateLimits.get(userKey);

    if (!userLimit || now > userLimit.resetTime) {
      this.userRateLimits.set(userKey, { count: 1, resetTime: now + this.RATE_LIMIT_WINDOW });
      return true;
    }

    if (userLimit.count >= this.MAX_REQUESTS_PER_USER_PER_MINUTE) {
      return false;
    }

    userLimit.count++;
    return true;
  }

  /**
   * Verifica rate limit global
   */
  private async checkRateLimitNonBlocking(): Promise<boolean> {
    const now = Date.now();

    if (now > this.rateLimit.resetTime) {
      this.rateLimit = { count: 1, resetTime: now + this.RATE_LIMIT_WINDOW };
      return true;
    }

    if (this.rateLimit.count >= this.MAX_REQUESTS_PER_MINUTE) {
      return false;
    }

    this.rateLimit.count++;
    return true;
  }

  /**
   * Gera resposta de fallback
   */
  private generateFallbackResponse(question: string, targetLanguage: string, detectedLanguage: string): KodaGeminiResponse {
    const fallbackMessages: Record<string, string> = {
      'en': "Hey there! I'm Koda, your friendly Canadian moose guide! 🦌 I'm having a little trouble right now, but I'd love to help you explore Canada. Could you try asking your question again? I can tell you about destinations, activities, food, wildlife, and so much more about the Great White North!",
      'fr': "Salut! Je suis Koda, votre guide orignal canadien! 🦌 J'ai un petit problème en ce moment, mais j'aimerais vous aider à explorer le Canada. Pourriez-vous reformuler votre question? Je peux vous parler de destinations, activités, nourriture, faune et bien plus sur le Grand Nord blanc!",
      'pt': "Olá! Eu sou o Koda, seu guia alce canadense! 🦌 Estou com um pequeno problema agora, mas adoraria ajudá-lo a explorar o Canadá. Você poderia tentar fazer sua pergunta novamente? Posso falar sobre destinos, atividades, comida, vida selvagem e muito mais sobre o Grande Norte Branco!",
      'es': "¡Hola! Soy Koda, tu guía alce canadiense! 🦌 Tengo un pequeño problema ahora, pero me encantaría ayudarte a explorar Canadá. ¿Podrías intentar hacer tu pregunta de nuevo? Puedo contarte sobre destinos, actividades, comida, vida silvestre y mucho más sobre el Gran Norte Blanco!",
      'hi': "नमस्ते! मैं कोडा हूं, आपका कनाडाई मूस गाइड! 🦌 मुझे अभी थोड़ी परेशानी हो रही है, लेकिन मैं आपकी कनाडा की खोज में मदद करना चाहूंगा। क्या आप अपना प्रश्न फिर से पूछ सकते हैं? मैं आपको ग्रेट व्हाइट नॉर्थ के बारे में गंतव्य, गतिविधियां, भोजन, वन्यजीव और बहुत कुछ बता सकता हूं!"
    };

    return {
      answer: fallbackMessages[targetLanguage] || fallbackMessages['en'],
      confidence: 0.5,
      sources: ['fallback'],
      processingTime: 0,
      usedWebSearch: false,
      detectedLanguage: detectedLanguage,
      responseLanguage: targetLanguage
    };
  }
}

export const kodaGeminiService = new KodaGeminiService();

