/**
 * Content Translation Service
 * Gerencia traduções de conteúdo editável (institutional_content)
 */

import { supabase } from '@/integrations/supabase/client';
import { translationManager } from './TranslationManager';
import type { LanguageCode } from '@/utils/translationHelpers';

export interface ContentTranslation {
  id: string;
  content_key: string;
  platform: string;
  section: string;
  language_code: string;
  content: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ContentData {
  content_key: string;
  content_value: string;
  platform?: string;
  section?: string;
}

class ContentTranslationService {
  /**
   * Busca tradução de um conteúdo
   */
  async getTranslation(
    contentKey: string,
    languageCode: LanguageCode,
    platform?: string,
    section?: string
  ): Promise<ContentTranslation | null> {
    try {
      let query = supabase
        .from('content_translations')
        .select('*')
        .eq('content_key', contentKey)
        .eq('language_code', languageCode);

      if (platform) {
        query = query.eq('platform', platform);
      }
      if (section) {
        query = query.eq('section', section);
      }

      const { data, error } = await query.single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar tradução de conteúdo:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('Erro ao buscar tradução de conteúdo:', error);
      return null;
    }
  }

  /**
   * Cria tradução para um conteúdo (lazy translation)
   */
  async createTranslation(
    content: ContentData,
    targetLanguage: LanguageCode
  ): Promise<ContentTranslation | null> {
    try {
      // Traduzir o conteúdo
      const result = await translationManager.translateText(
        content.content_value,
        {
          targetLanguage,
          context: `Conteúdo editável: ${content.content_key}`
        }
      );

      if (!result.success) {
        console.warn('Não foi possível traduzir conteúdo:', content.content_key);
        return null;
      }

      const translatedContent = {
        content_value: result.translatedText,
      };

      const { data, error } = await supabase
        .from('content_translations')
        .insert({
          content_key: content.content_key,
          platform: content.platform || 'descubra_ms',
          section: content.section || 'general',
          language_code: targetLanguage,
          content: translatedContent,
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar tradução de conteúdo:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao criar tradução de conteúdo:', error);
      return null;
    }
  }

  /**
   * Busca ou cria tradução (lazy translation)
   */
  async getOrCreateTranslation(
    content: ContentData,
    targetLanguage: LanguageCode
  ): Promise<ContentTranslation | null> {
    // Se já é português, não precisa traduzir
    if (targetLanguage === 'pt-BR') {
      return null;
    }

    // Buscar tradução existente
    const existing = await this.getTranslation(
      content.content_key,
      targetLanguage,
      content.platform,
      content.section
    );

    if (existing) {
      return existing;
    }

    // Criar nova tradução
    return await this.createTranslation(content, targetLanguage);
  }

  /**
   * Busca múltiplas traduções de uma vez
   */
  async getTranslations(
    contentKeys: string[],
    languageCode: LanguageCode,
    platform?: string
  ): Promise<Map<string, ContentTranslation>> {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentTranslationService.ts:147',message:'getTranslations chamado',data:{languageCode,count:contentKeys.length,keys:contentKeys.slice(0,3)},sessionId:'debug-session',runId:'run1',hypothesisId:'H1',timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    const translationMap = new Map<string, ContentTranslation>();

    try {
      let query = supabase
        .from('content_translations')
        .select('*')
        .in('content_key', contentKeys)
        .eq('language_code', languageCode);

      if (platform) {
        query = query.eq('platform', platform);
      }

      const { data, error } = await query;

      if (error) {
        // Se a tabela não existir (404 ou 42P01), retornar mapa vazio (traduções ainda não foram criadas)
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          console.log('Tabela content_translations não existe ainda. Traduções serão criadas quando necessário.');
          return translationMap;
        }
        console.error('Erro ao buscar traduções:', error);
        return translationMap;
      }

      (data || []).forEach((translation) => {
        translationMap.set(translation.content_key, translation);
      });
    } catch (error) {
      console.error('Erro ao buscar traduções:', error);
    }

    return translationMap;
  }

  /**
   * Atualiza tradução existente
   */
  async updateTranslation(
    translationId: string,
    content: Record<string, any>
  ): Promise<ContentTranslation | null> {
    try {
      const { data, error } = await supabase
        .from('content_translations')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', translationId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar tradução:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao atualizar tradução:', error);
      return null;
    }
  }
}

export const contentTranslationService = new ContentTranslationService();

