// @ts-nocheck
/**
 * 🦦 GUATÁ KNOWLEDGE BASE SERVICE
 * Serviço para consultar e gerenciar a base de conhecimento persistente do Guatá
 * Armazena respostas curadas para perguntas frequentes e conceitos importantes
 */

import { supabase } from "@/integrations/supabase/client";

export interface KnowledgeBaseEntry {
  id: string;
  pergunta: string;
  pergunta_normalizada: string;
  resposta: string;
  tipo: 'conceito' | 'local' | 'pessoa' | 'evento' | 'geral';
  tags: string[];
  fonte: 'manual' | 'gemini' | 'web';
  ativo: boolean;
  ultima_atualizacao: string;
  criado_em: string;
  usado_por: number;
}

export interface KnowledgeBaseSearchResult {
  found: boolean;
  answer?: string;
  confidence?: number;
  source?: string;
  entryId?: string;
}

export interface KnowledgeBaseAddOptions {
  tipo?: 'conceito' | 'local' | 'pessoa' | 'evento' | 'geral';
  tags?: string[];
  fonte?: 'manual' | 'gemini' | 'web';
}

class GuataKnowledgeBaseService {
  /**
   * Normaliza pergunta para busca eficiente
   * Remove acentos, converte para lowercase, remove pontuação e espaços extras
   */
  normalizeQuestion(question: string): string {
    if (!question) return '';
    
    return question
      .toLowerCase()
      .normalize('NFD') // Decompõe caracteres acentuados
      .replace(/[\u0300-\u036f]/g, '') // Remove diacríticos (acentos)
      .replace(/[^\w\s]/g, ' ') // Remove pontuação
      .replace(/\s+/g, ' ') // Remove espaços múltiplos
      .trim();
  }

  /**
   * Calcula similaridade simples entre duas strings normalizadas
   * Retorna valor entre 0 e 1 (1 = idêntico, 0 = completamente diferente)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    if (!str1 || !str2) return 0;
    
    const words1 = str1.split(/\s+/).filter(w => w.length > 2); // Palavras com mais de 2 caracteres
    const words2 = str2.split(/\s+/).filter(w => w.length > 2);
    
    if (words1.length === 0 || words2.length === 0) return 0;
    
    // Palavras comuns
    const commonWords = words1.filter(word => words2.includes(word));
    
    // Similaridade baseada em palavras comuns
    const similarity = commonWords.length / Math.max(words1.length, words2.length);
    
    return similarity;
  }

  /**
   * Busca na Knowledge Base
   * Primeiro tenta match exato, depois busca por similaridade
   */
  async searchKnowledgeBase(
    question: string,
    options?: { minSimilarity?: number }
  ): Promise<KnowledgeBaseSearchResult> {
    const minSimilarity = options?.minSimilarity ?? 0.75;
    const normalizedQuestion = this.normalizeQuestion(question);
    
    if (!normalizedQuestion) {
      return { found: false };
    }

    try {
      // 1. Tentar match exato primeiro (mais rápido)
      const { data: exactMatch, error: exactError } = await supabase
        .from('guata_knowledge_base')
        .select('*')
        .eq('pergunta_normalizada', normalizedQuestion)
        .eq('ativo', true)
        .limit(1);

      // Tratar erros silenciosamente (tabela pode não existir ou RLS bloqueando)
      if (exactError) {
        // Erros esperados: tabela não existe, RLS bloqueando, não autenticado
        // Não logar esses erros para não poluir o console
        const isExpectedError = 
          exactError.code === 'PGRST116' || 
          exactError.code === 'PGRST301' || 
          exactError.code === '42P01' || // relation does not exist
          exactError.status === 404 || 
          exactError.status === 401 ||
          exactError.message?.includes('does not exist') ||
          exactError.message?.includes('relation');
        
        if (isExpectedError) {
          // Erro esperado, continuar fluxo normalmente sem logar
          return { found: false };
        }
        // Outros erros inesperados: logar apenas em desenvolvimento
        if (import.meta.env.DEV) {
          console.warn('⚠️ [KB] Erro inesperado ao buscar match exato:', exactError.message);
        }
        return { found: false };
      }

      if (exactMatch && exactMatch.length > 0) {
        const entry = exactMatch[0] as KnowledgeBaseEntry;
        
        // Incrementar contador de uso (assíncrono, não bloqueia)
        this.incrementUsage(entry.id).catch(() => {
          // Erro não crítico, ignorar silenciosamente
        });
        
        return {
          found: true,
          answer: entry.resposta,
          confidence: 0.95,
          source: entry.fonte,
          entryId: entry.id
        };
      }

      // 2. Se não encontrou match exato, buscar por similaridade
      const { data: allEntries, error: similarityError } = await supabase
        .from('guata_knowledge_base')
        .select('*')
        .eq('ativo', true);

      // Tratar erros silenciosamente
      if (similarityError) {
        const isExpectedError = 
          similarityError.code === 'PGRST116' || 
          similarityError.code === 'PGRST301' || 
          similarityError.code === '42P01' ||
          similarityError.status === 404 || 
          similarityError.status === 401 ||
          similarityError.message?.includes('does not exist') ||
          similarityError.message?.includes('relation');
        
        if (isExpectedError) {
          return { found: false };
        }
        // Outros erros inesperados: logar apenas em desenvolvimento
        if (import.meta.env.DEV) {
          console.warn('⚠️ [KB] Erro inesperado ao buscar entradas:', similarityError.message);
        }
        return { found: false };
      }

      if (!allEntries || allEntries.length === 0) {
        return { found: false };
      }

      // Calcular similaridade para cada entrada
      let bestMatch: KnowledgeBaseEntry | null = null;
      let bestSimilarity = 0;

      for (const entry of allEntries as KnowledgeBaseEntry[]) {
        const similarity = this.calculateSimilarity(
          normalizedQuestion,
          entry.pergunta_normalizada
        );

        if (similarity >= minSimilarity && similarity > bestSimilarity) {
          bestSimilarity = similarity;
          bestMatch = entry;
        }
      }

      if (bestMatch) {
        // Incrementar contador de uso (assíncrono, não bloqueia)
        this.incrementUsage(bestMatch.id).catch(() => {
          // Erro não crítico, ignorar silenciosamente
        });
        
        return {
          found: true,
          answer: bestMatch.resposta,
          confidence: bestSimilarity,
          source: bestMatch.fonte,
          entryId: bestMatch.id
        };
      }

      return { found: false };

    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      // Em caso de erro, retornar "não encontrado" para continuar fluxo normal
      // Não logar erros esperados (tabela não existe, etc)
      const isExpectedError = 
        err?.message?.includes('does not exist') ||
        err?.message?.includes('relation') ||
        err?.code === '42P01';
      
      if (!isExpectedError && import.meta.env.DEV) {
        const errMsg = err?.message || (error instanceof Error ? error.message : String(error));
        console.warn('⚠️ [KB] Erro inesperado ao buscar na Knowledge Base:', errMsg);
      }
      return { found: false };
    }
  }

  /**
   * Incrementa contador de uso de uma entrada
   */
  private async incrementUsage(entryId: string): Promise<void> {
    try {
      // Usar RPC function se disponível
      const { error: rpcError } = await supabase.rpc('increment_guata_kb_usage', {
        kb_id: entryId
      });

      if (rpcError) {
        // Fallback: Buscar valor atual e incrementar
        const { data: entry } = await supabase
          .from('guata_knowledge_base')
          .select('usado_por')
          .eq('id', entryId)
          .single();

        if (entry) {
          await supabase
            .from('guata_knowledge_base')
            .update({ usado_por: (entry.usado_por || 0) + 1 })
            .eq('id', entryId);
        }
      }
    } catch (error: unknown) {
      console.warn('⚠️ [KB] Erro ao incrementar uso (não crítico):', error);
    }
  }

  /**
   * Adiciona entrada à Knowledge Base
   * Para uso futuro (admin panel, auto-população, etc.)
   */
  async addToKnowledgeBase(
    question: string,
    answer: string,
    metadata?: KnowledgeBaseAddOptions
  ): Promise<{ success: boolean; entryId?: string; error?: string }> {
    try {
      const normalizedQuestion = this.normalizeQuestion(question);
      
      if (!normalizedQuestion || !answer) {
        return { success: false, error: 'Pergunta e resposta são obrigatórias' };
      }

      const { data, error } = await supabase
        .from('guata_knowledge_base')
        .insert({
          pergunta: question,
          pergunta_normalizada: normalizedQuestion,
          resposta: answer,
          tipo: metadata?.tipo || 'geral',
          tags: metadata?.tags || [],
          fonte: metadata?.fonte || 'manual',
          ativo: true
        })
        .select('id')
        .single();

      if (error) {
        console.error('❌ [KB] Erro ao adicionar entrada:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ [KB] Entrada adicionada com sucesso:', data.id);
      return { success: true, entryId: data.id };

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ [KB] Erro ao adicionar entrada:', err);
      return { success: false, error: err.message || 'Erro desconhecido' };
    }
  }

  /**
   * Busca todas as entradas ativas (para admin panel futuro)
   */
  async getAllEntries(): Promise<KnowledgeBaseEntry[]> {
    try {
      const { data, error } = await supabase
        .from('guata_knowledge_base')
        .select('*')
        .eq('ativo', true)
        .order('usado_por', { ascending: false });

      if (error) throw error;
      return (data || []) as KnowledgeBaseEntry[];

    } catch (error: unknown) {
      console.error('❌ [KB] Erro ao buscar todas as entradas:', error);
      return [];
    }
  }
}

// Exportar instância única
export const guataKnowledgeBaseService = new GuataKnowledgeBaseService();

