/**
 * Hook para tradução de conteúdo dinâmico
 * Combina react-i18next (UI estática) com traduções dinâmicas do banco
 */

import { useTranslation } from 'react-i18next';
import { useLanguage } from './useLanguage';
import { type LanguageCode } from '@/utils/translationHelpers';

export function useTranslationDynamic() {
  const { t, i18n } = useTranslation();
  const { language } = useLanguage();

  /**
   * Traduz conteúdo dinâmico
   * Busca tradução no banco ou retorna conteúdo original
   */
  const translateDynamic = <T extends string | null | undefined>(
    content: T,
    translatedContent: T,
    fallback?: T
  ): T => {
    // Se o idioma atual é português, retornar conteúdo original
    if (language === 'pt-BR') {
      return content || fallback || ('' as T);
    }

    // Se existe tradução, usar ela
    if (translatedContent) {
      return translatedContent;
    }

    // Fallback para conteúdo original ou fallback fornecido
    return content || fallback || ('' as T);
  };

  /**
   * Verifica se precisa traduzir
   */
  const shouldTranslate = (): boolean => {
    return language !== 'pt-BR';
  };

  /**
   * Obtém código do idioma atual
   */
  const getCurrentLanguage = (): LanguageCode => {
    return language;
  };

  return {
    t, // Função do react-i18next para UI estática
    translateDynamic,
    shouldTranslate,
    getCurrentLanguage,
    language,
    i18n,
  };
}

