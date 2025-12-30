/**
 * Language Context
 * Gerencia o idioma atual da aplicação
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { detectBrowserLanguage, DEFAULT_LANGUAGE, type LanguageCode } from '@/utils/translationHelpers';

const LANGUAGE_STORAGE_KEY = 'descubra-ms-language';

interface LanguageContextType {
  language: LanguageCode;
  changeLanguage: (lang: LanguageCode) => Promise<void>;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState<LanguageCode>(DEFAULT_LANGUAGE);
  const [isLoading, setIsLoading] = useState(true);

  // Inicializar idioma
  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        // Tentar carregar do localStorage
        const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as LanguageCode | null;
        
        // Verificar se é um idioma válido
        const validLanguage = savedLanguage && isValidLanguageCode(savedLanguage) 
          ? savedLanguage 
          : detectBrowserLanguage();
        
        // Salvar no localStorage se não estava salvo
        if (!savedLanguage || !isValidLanguageCode(savedLanguage)) {
          localStorage.setItem(LANGUAGE_STORAGE_KEY, validLanguage);
        }
        
        setLanguage(validLanguage);
        
        // Mudar idioma no i18next
        await i18n.changeLanguage(validLanguage);
      } catch (error) {
        console.error('Erro ao inicializar idioma:', error);
        setLanguage(DEFAULT_LANGUAGE);
        await i18n.changeLanguage(DEFAULT_LANGUAGE);
      } finally {
        setIsLoading(false);
      }
    };

    initializeLanguage();
  }, [i18n]);

  const changeLanguage = async (lang: LanguageCode) => {
    try {
      setIsLoading(true);
      
      // Salvar no localStorage
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      
      // Atualizar estado
      setLanguage(lang);
      
      // Mudar idioma no i18next
      await i18n.changeLanguage(lang);
    } catch (error) {
      console.error('Erro ao mudar idioma:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage deve ser usado dentro de um LanguageProvider');
  }
  return context;
}

function isValidLanguageCode(code: string): code is LanguageCode {
  return ['pt-BR', 'en-US', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'ja-JP', 'ko-KR', 'zh-CN'].includes(code);
}

