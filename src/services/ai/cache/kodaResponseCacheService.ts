/**
 * 🗄️ KODA RESPONSE CACHE SERVICE
 * Gerencia cache persistente de respostas do Gemini para Koda no Supabase
 * Evita chamadas repetidas à API e persiste entre reinicializações
 * Suporta múltiplos idiomas (EN, FR, PT, ES, HI)
 */

import { supabase } from "@/integrations/supabase/client";
import CryptoJS from "crypto-js";

export interface KodaCacheEntry {
  id: string;
  questionHash: string;
  question: string;
  answer: string;
  language: string; // en, fr, pt, es, hi
  cacheType: 'shared' | 'individual';
  userId?: string;
  sessionId?: string;
  usedCount: number;
  isSuggestion: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface KodaCacheQuery {
  question: string;
  language?: string; // en, fr, pt, es, hi
  userId?: string;
  sessionId?: string;
  isSuggestion?: boolean;
}

export interface KodaCacheResult {
  found: boolean;
  answer?: string;
  entry?: KodaCacheEntry;
}

class KodaResponseCacheService {
  // Durações de cache (em milissegundos)
  private readonly SHARED_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas
  private readonly COMMON_QUESTIONS_CACHE_DURATION = 48 * 60 * 60 * 1000; // 48 horas
  private readonly INDIVIDUAL_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas
  private readonly SUGGESTION_SHARED_CACHE_DURATION = 3 * 60 * 60 * 1000; // 3 horas
  private readonly SUGGESTION_INDIVIDUAL_CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  // Perguntas de sugestão conhecidas (em inglês e francês)
  private readonly SUGGESTION_QUESTIONS = [
    "What are the best places to visit in Banff?",
    "Best time to see the Northern Lights?",
    "Tell me about Canadian cuisine",
    "What to do in Vancouver?",
    "Quels sont les meilleurs endroits à visiter à Banff?",
    "Meilleur moment pour voir les aurores boréales?",
    "Parlez-moi de la cuisine canadienne"
  ];

  /**
   * Gera hash da pergunta normalizada
   */
  private generateQuestionHash(question: string): string {
    const normalized = question.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    return CryptoJS.MD5(normalized).toString();
  }

  /**
   * Verifica se é pergunta de sugestão
   */
  private isSuggestionQuestion(question: string): boolean {
    const normalizedQuestion = question.toLowerCase().trim();
    return this.SUGGESTION_QUESTIONS.some(suggestion => {
      const normalizedSuggestion = suggestion.toLowerCase().trim();
      return normalizedQuestion === normalizedSuggestion || 
             normalizedQuestion.includes(normalizedSuggestion.substring(0, 20)) ||
             normalizedSuggestion.includes(normalizedQuestion.substring(0, 20));
    });
  }

  /**
   * Busca no cache compartilhado
   */
  async getFromSharedCache(query: KodaCacheQuery): Promise<KodaCacheResult> {
    try {
      const questionHash = this.generateQuestionHash(query.question);
      const isSuggestion = query.isSuggestion ?? this.isSuggestionQuestion(query.question);
      const language = query.language || 'en';
      
      const { data, error } = await supabase
        .from('koda_response_cache')
        .select('*')
        .eq('question_hash', questionHash)
        .eq('cache_type', 'shared')
        .eq('language', language)
        .eq('is_suggestion', isSuggestion)
        .gt('expires_at', new Date().toISOString())
        .order('used_count', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        return { found: false };
      }

      await this.incrementUsage(data.id);

      // Verificar se é pergunta muito comum (5+ usos)
      if (data.used_count >= 5 && !isSuggestion) {
        const newExpiresAt = new Date(Date.now() + this.COMMON_QUESTIONS_CACHE_DURATION);
        await supabase
          .from('koda_response_cache')
          .update({ expires_at: newExpiresAt.toISOString() })
          .eq('id', data.id);
      }

      return {
        found: true,
        answer: data.answer,
        entry: this.mapToCacheEntry(data)
      };
    } catch (error) {
      console.warn('⚠️ Erro ao buscar cache compartilhado do Koda:', error);
      return { found: false };
    }
  }

  /**
   * Busca no cache individual
   */
  async getFromIndividualCache(query: KodaCacheQuery): Promise<KodaCacheResult> {
    if (!query.userId && !query.sessionId) {
      return { found: false };
    }

    try {
      const questionHash = this.generateQuestionHash(query.question);
      const isSuggestion = query.isSuggestion ?? this.isSuggestionQuestion(query.question);
      const language = query.language || 'en';

      let queryBuilder = supabase
        .from('koda_response_cache')
        .select('*')
        .eq('question_hash', questionHash)
        .eq('cache_type', 'individual')
        .eq('language', language)
        .eq('is_suggestion', isSuggestion)
        .gt('expires_at', new Date().toISOString());

      if (query.userId) {
        queryBuilder = queryBuilder.eq('user_id', query.userId);
      } else if (query.sessionId) {
        queryBuilder = queryBuilder.eq('session_id', query.sessionId);
      }

      const { data, error } = await queryBuilder
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        return { found: false };
      }

      await this.incrementUsage(data.id);

      return {
        found: true,
        answer: data.answer,
        entry: this.mapToCacheEntry(data)
      };
    } catch (error) {
      console.warn('⚠️ Erro ao buscar cache individual do Koda:', error);
      return { found: false };
    }
  }

  /**
   * Salva no cache compartilhado
   */
  async saveToSharedCache(question: string, answer: string, language: string = 'en'): Promise<void> {
    try {
      const questionHash = this.generateQuestionHash(question);
      const isSuggestion = this.isSuggestionQuestion(question);
      const cacheDuration = isSuggestion 
        ? this.SUGGESTION_SHARED_CACHE_DURATION 
        : this.SHARED_CACHE_DURATION;
      
      const expiresAt = new Date(Date.now() + cacheDuration);

      const { data: existing } = await supabase
        .from('koda_response_cache')
        .select('id')
        .eq('question_hash', questionHash)
        .eq('cache_type', 'shared')
        .eq('language', language)
        .eq('is_suggestion', isSuggestion)
        .gt('expires_at', new Date().toISOString())
        .limit(1)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('koda_response_cache')
          .update({
            answer: answer,
            expires_at: expiresAt.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('koda_response_cache')
          .insert({
            question_hash: questionHash,
            question: question,
            answer: answer,
            language: language,
            cache_type: 'shared',
            is_suggestion: isSuggestion,
            expires_at: expiresAt.toISOString(),
            used_count: 1
          });
      }
    } catch (error) {
      console.warn('⚠️ Erro ao salvar cache compartilhado do Koda:', error);
    }
  }

  /**
   * Salva no cache individual
   */
  async saveToIndividualCache(
    question: string, 
    answer: string, 
    language: string = 'en',
    userId?: string, 
    sessionId?: string
  ): Promise<void> {
    if (!userId && !sessionId) {
      return;
    }

    try {
      const questionHash = this.generateQuestionHash(question);
      const isSuggestion = this.isSuggestionQuestion(question);
      const cacheDuration = isSuggestion 
        ? this.SUGGESTION_INDIVIDUAL_CACHE_DURATION 
        : this.INDIVIDUAL_CACHE_DURATION;
      
      const expiresAt = new Date(Date.now() + cacheDuration);

      let queryBuilder = supabase
        .from('koda_response_cache')
        .select('id')
        .eq('question_hash', questionHash)
        .eq('cache_type', 'individual')
        .eq('language', language)
        .eq('is_suggestion', isSuggestion)
        .gt('expires_at', new Date().toISOString());

      if (userId) {
        queryBuilder = queryBuilder.eq('user_id', userId);
      } else if (sessionId) {
        queryBuilder = queryBuilder.eq('session_id', sessionId);
      }

      const { data: existing } = await queryBuilder.limit(1).maybeSingle();

      if (existing) {
        await supabase
          .from('koda_response_cache')
          .update({
            answer: answer,
            expires_at: expiresAt.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('koda_response_cache')
          .insert({
            question_hash: questionHash,
            question: question,
            answer: answer,
            language: language,
            cache_type: 'individual',
            user_id: userId || null,
            session_id: sessionId || null,
            is_suggestion: isSuggestion,
            expires_at: expiresAt.toISOString(),
            used_count: 1
          });
      }
    } catch (error) {
      console.warn('⚠️ Erro ao salvar cache individual do Koda:', error);
    }
  }

  /**
   * Incrementa contador de uso
   */
  private async incrementUsage(cacheId: string): Promise<void> {
    try {
      const { data: current } = await supabase
        .from('koda_response_cache')
        .select('used_count')
        .eq('id', cacheId)
        .single();
      
      if (current) {
        await supabase
          .from('koda_response_cache')
          .update({ 
            used_count: (current.used_count || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', cacheId);
      }
    } catch (error) {
      console.warn('⚠️ Erro ao incrementar uso do cache do Koda:', error);
    }
  }

  /**
   * Mapeia dados do banco para KodaCacheEntry
   */
  private mapToCacheEntry(data: any): KodaCacheEntry {
    return {
      id: data.id,
      questionHash: data.question_hash,
      question: data.question,
      answer: data.answer,
      language: data.language,
      cacheType: data.cache_type,
      userId: data.user_id,
      sessionId: data.session_id,
      usedCount: data.used_count,
      isSuggestion: data.is_suggestion,
      expiresAt: new Date(data.expires_at),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }
}

export const kodaResponseCacheService = new KodaResponseCacheService();

