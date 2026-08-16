/**
 * 🗄️ GUATÁ RESPONSE CACHE SERVICE
 * Gerencia cache persistente de respostas do Gemini no Supabase
 * Evita chamadas repetidas à API e persiste entre reinicializações
 */

import { supabase } from "@/integrations/supabase/client";
import CryptoJS from "crypto-js";
import { normalizeGuataUserId } from "@/utils/guataGuestUser";

export interface CacheEntry {
  id: string;
  questionHash: string;
  question: string;
  answer: string;
  cacheType: 'shared' | 'individual';
  userId?: string;
  sessionId?: string;
  usedCount: number;
  isSuggestion: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CacheQuery {
  question: string;
  userId?: string;
  sessionId?: string;
  isSuggestion?: boolean;
}

export interface CacheResult {
  found: boolean;
  answer?: string;
  entry?: CacheEntry;
}

class GuataResponseCacheService {
  // Durações de cache (em milissegundos)
  private readonly SHARED_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas
  private readonly COMMON_QUESTIONS_CACHE_DURATION = 48 * 60 * 60 * 1000; // 48 horas (para perguntas muito comuns)
  private readonly INDIVIDUAL_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas
  private readonly SUGGESTION_SHARED_CACHE_DURATION = 3 * 60 * 60 * 1000; // 3 horas (para sugestões)
  private readonly SUGGESTION_INDIVIDUAL_CACHE_DURATION = 5 * 60 * 1000; // 5 minutos (para sugestões individuais)

  // Perguntas de sugestão conhecidas
  private readonly SUGGESTION_QUESTIONS = [
    "Quais são os melhores passeios em Bonito?",
    "Melhor época para visitar o Pantanal?",
    "Me conte sobre a comida típica de MS",
    "O que fazer em Corumbá?",
    "O que fazer em Campo Grande?",
    "Quais são os principais pontos turísticos de Campo Grande?"
  ];

  /**
   * Gera hash da pergunta normalizada
   */
  private generateQuestionHash(question: string): string {
    const normalized = question.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Usar hash MD5 (rápido e suficiente para cache)
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
  async getFromSharedCache(query: CacheQuery): Promise<CacheResult> {
    try {
      const questionHash = this.generateQuestionHash(query.question);
      const isSuggestion = query.isSuggestion ?? this.isSuggestionQuestion(query.question);
      
      // Determinar duração baseado no tipo
      const cacheDuration = isSuggestion 
        ? this.SUGGESTION_SHARED_CACHE_DURATION 
        : this.SHARED_CACHE_DURATION;

      const { data, error } = await supabase
        .from('guata_response_cache')
        .select('*')
        .eq('question_hash', questionHash)
        .eq('cache_type', 'shared')
        .eq('is_suggestion', isSuggestion)
        .gt('expires_at', new Date().toISOString())
        .order('used_count', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        return { found: false };
      }

      // Incrementar contador de uso
      await this.incrementUsage(data.id);

      // Verificar se é pergunta muito comum (5+ usos) e ajustar expiração se necessário
      if (data.used_count >= 5 && !isSuggestion) {
        // Atualizar expiração para 48h se for muito comum
        const newExpiresAt = new Date(Date.now() + this.COMMON_QUESTIONS_CACHE_DURATION);
        await supabase
          .from('guata_response_cache')
          .update({ expires_at: newExpiresAt.toISOString() })
          .eq('id', data.id);
      }

      return {
        found: true,
        answer: data.answer,
        entry: this.mapToCacheEntry(data)
      };
    } catch (error) {
      console.warn('⚠️ Erro ao buscar cache compartilhado:', error);
      return { found: false };
    }
  }

  /**
   * Busca no cache individual
   */
  async getFromIndividualCache(query: CacheQuery): Promise<CacheResult> {
    const userId = normalizeGuataUserId(query.userId);
    if (!userId && !query.sessionId) {
      return { found: false };
    }

    try {
      const questionHash = this.generateQuestionHash(query.question);
      const isSuggestion = query.isSuggestion ?? this.isSuggestionQuestion(query.question);
      
      const cacheDuration = isSuggestion 
        ? this.SUGGESTION_INDIVIDUAL_CACHE_DURATION 
        : this.INDIVIDUAL_CACHE_DURATION;

      let queryBuilder = supabase
        .from('guata_response_cache')
        .select('*')
        .eq('question_hash', questionHash)
        .eq('cache_type', 'individual')
        .eq('is_suggestion', isSuggestion)
        .gt('expires_at', new Date().toISOString());

      if (userId) {
        queryBuilder = queryBuilder.eq('user_id', userId);
      } else if (query.sessionId) {
        queryBuilder = queryBuilder
          .eq('session_id', query.sessionId)
          .is('user_id', null);
      }

      const { data, error } = await queryBuilder
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        return { found: false };
      }

      // Incrementar contador de uso
      await this.incrementUsage(data.id);

      return {
        found: true,
        answer: data.answer,
        entry: this.mapToCacheEntry(data)
      };
    } catch (error) {
      console.warn('⚠️ Erro ao buscar cache individual:', error);
      return { found: false };
    }
  }

  /**
   * Busca por similaridade semântica (75%+ similaridade)
   * Usa busca full-text do PostgreSQL
   */
  async getFromSimilarityCache(query: CacheQuery, threshold: number = 0.75): Promise<CacheResult> {
    try {
      const isSuggestion = query.isSuggestion ?? this.isSuggestionQuestion(query.question);
      const cacheDuration = isSuggestion 
        ? this.SUGGESTION_SHARED_CACHE_DURATION 
        : this.SHARED_CACHE_DURATION;

      // Buscar perguntas similares usando full-text search
      const { data, error } = await supabase
        .from('guata_response_cache')
        .select('*')
        .eq('cache_type', 'shared')
        .eq('is_suggestion', isSuggestion)
        .gt('expires_at', new Date().toISOString())
        .order('used_count', { ascending: false })
        .limit(50); // Limitar para análise de similaridade

      if (error || !data || data.length === 0) {
        return { found: false };
      }

      // Calcular similaridade com cada entrada
      const questionWords = this.extractWords(query.question);
      let bestMatch: any = null;
      let bestSimilarity = 0;

      for (const entry of data) {
        const cachedWords = this.extractWords(entry.question);
        const similarity = this.calculateSimilarity(questionWords, cachedWords);

        if (similarity >= threshold && similarity > bestSimilarity) {
          bestSimilarity = similarity;
          bestMatch = entry;
        }
      }

      if (bestMatch) {
        // Incrementar contador de uso
        await this.incrementUsage(bestMatch.id);

        console.log(`🔍 Cache semântico: Similaridade ${(bestSimilarity * 100).toFixed(0)}% - Reutilizando resposta`);
        
        return {
          found: true,
          answer: bestMatch.answer,
          entry: this.mapToCacheEntry(bestMatch)
        };
      }

      return { found: false };
    } catch (error) {
      console.warn('⚠️ Erro ao buscar cache semântico:', error);
      return { found: false };
    }
  }

  /**
   * Salva no cache compartilhado
   */
  async saveToSharedCache(question: string, answer: string): Promise<void> {
    try {
      const questionHash = this.generateQuestionHash(question);
      const isSuggestion = this.isSuggestionQuestion(question);
      const cacheDuration = isSuggestion 
        ? this.SUGGESTION_SHARED_CACHE_DURATION 
        : this.SHARED_CACHE_DURATION;
      
      const expiresAt = new Date(Date.now() + cacheDuration);

      // Verificar se já existe
      const { data: existing } = await supabase
        .from('guata_response_cache')
        .select('id')
        .eq('question_hash', questionHash)
        .eq('cache_type', 'shared')
        .eq('is_suggestion', isSuggestion)
        .gt('expires_at', new Date().toISOString())
        .limit(1)
        .maybeSingle();

      if (existing) {
        // Atualizar existente
        await supabase
          .from('guata_response_cache')
          .update({
            answer: answer,
            expires_at: expiresAt.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        // Criar novo
        await supabase
          .from('guata_response_cache')
          .insert({
            question_hash: questionHash,
            question: question,
            answer: answer,
            cache_type: 'shared',
            is_suggestion: isSuggestion,
            expires_at: expiresAt.toISOString(),
            used_count: 1
          });
      }
    } catch (error) {
      console.warn('⚠️ Erro ao salvar cache compartilhado:', error);
    }
  }

  /**
   * Salva no cache individual
   */
  async saveToIndividualCache(question: string, answer: string, userId?: string, sessionId?: string): Promise<void> {
    const normalizedUserId = normalizeGuataUserId(userId);
    if (!normalizedUserId && !sessionId) {
      return;
    }

    try {
      const questionHash = this.generateQuestionHash(question);
      const isSuggestion = this.isSuggestionQuestion(question);
      const cacheDuration = isSuggestion 
        ? this.SUGGESTION_INDIVIDUAL_CACHE_DURATION 
        : this.INDIVIDUAL_CACHE_DURATION;
      
      const expiresAt = new Date(Date.now() + cacheDuration);

      // Verificar se já existe
      let queryBuilder = supabase
        .from('guata_response_cache')
        .select('id')
        .eq('question_hash', questionHash)
        .eq('cache_type', 'individual')
        .eq('is_suggestion', isSuggestion)
        .gt('expires_at', new Date().toISOString());

      if (normalizedUserId) {
        queryBuilder = queryBuilder.eq('user_id', normalizedUserId);
      } else if (sessionId) {
        queryBuilder = queryBuilder
          .eq('session_id', sessionId)
          .is('user_id', null);
      }

      const { data: existing } = await queryBuilder.limit(1).maybeSingle();

      if (existing) {
        // Atualizar existente
        await supabase
          .from('guata_response_cache')
          .update({
            answer: answer,
            expires_at: expiresAt.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        // Criar novo
        await supabase
          .from('guata_response_cache')
          .insert({
            question_hash: questionHash,
            question: question,
            answer: answer,
            cache_type: 'individual',
            user_id: normalizedUserId ?? null,
            session_id: sessionId || null,
            is_suggestion: isSuggestion,
            expires_at: expiresAt.toISOString(),
            used_count: 1
          });
      }
    } catch (error) {
      console.warn('⚠️ Erro ao salvar cache individual:', error);
    }
  }

  /**
   * Incrementa contador de uso
   */
  private async incrementUsage(cacheId: string): Promise<void> {
    try {
      // Tentar usar a função RPC primeiro
      const { error: rpcError } = await supabase.rpc('increment_guata_cache_usage', { cache_id: cacheId });
      
      if (rpcError) {
        // Se a função não existir, buscar o valor atual e incrementar
        const { data: current } = await supabase
          .from('guata_response_cache')
          .select('used_count')
          .eq('id', cacheId)
          .single();
        
        if (current) {
          await supabase
            .from('guata_response_cache')
            .update({ 
              used_count: (current.used_count || 0) + 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', cacheId);
        }
      }
    } catch (error) {
      console.warn('⚠️ Erro ao incrementar uso do cache:', error);
    }
  }

  /**
   * Limpa cache expirado
   */
  async cleanExpiredCache(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('clean_expired_guata_cache');
      if (error) {
        // Se a função não existir, fazer delete manual
        const { error: deleteError } = await supabase
          .from('guata_response_cache')
          .delete()
          .lt('expires_at', new Date().toISOString());
        
        if (deleteError) {
          console.warn('⚠️ Erro ao limpar cache expirado:', deleteError);
          return 0;
        }
        return 0; // Não sabemos quantos foram deletados
      }
      return data || 0;
    } catch (error) {
      console.warn('⚠️ Erro ao limpar cache expirado:', error);
      return 0;
    }
  }

  /**
   * Extrai palavras de uma pergunta
   */
  private extractWords(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .filter(word => !['que', 'qual', 'quais', 'onde', 'como', 'quando'].includes(word));
  }

  /**
   * Calcula similaridade semântica
   */
  private calculateSimilarity(words1: string[], words2: string[]): number {
    if (words1.length === 0 || words2.length === 0) return 0;
    
    const stopWords = new Set(['que', 'qual', 'quais', 'onde', 'como', 'quando', 'por', 'para', 'com', 'de', 'em', 'a', 'o', 'e', 'do', 'da', 'no', 'na']);
    const importantWords1 = words1.filter(w => !stopWords.has(w));
    const importantWords2 = words2.filter(w => !stopWords.has(w));
    
    const commonImportant = importantWords1.filter(word => importantWords2.includes(word));
    const importantSimilarity = importantWords1.length > 0 && importantWords2.length > 0
      ? commonImportant.length / Math.max(importantWords1.length, importantWords2.length)
      : 0;
    
    const commonWords = words1.filter(word => words2.includes(word));
    const totalUniqueWords = new Set([...words1, ...words2]).size;
    const generalSimilarity = totalUniqueWords > 0 ? commonWords.length / totalUniqueWords : 0;
    
    return (importantSimilarity * 0.7) + (generalSimilarity * 0.3);
  }

  /**
   * Mapeia dados do banco para CacheEntry
   */
  private mapToCacheEntry(data: any): CacheEntry {
    return {
      id: data.id,
      questionHash: data.question_hash,
      question: data.question,
      answer: data.answer,
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

// Exportar instância única
export const guataResponseCacheService = new GuataResponseCacheService();

