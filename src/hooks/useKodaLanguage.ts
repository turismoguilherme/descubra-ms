import { useState, useEffect } from 'react';

export type KodaLanguage = 'en' | 'fr';

const STORAGE_KEY = 'koda-language';

export function useKodaLanguage() {
  const [language, setLanguage] = useState<KodaLanguage>(() => {
    // Tentar recuperar do localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'fr') {
      return saved;
    }
    // Detectar idioma do navegador
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('fr')) {
      return 'fr';
    }
    // Padrão: inglês
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'fr' : 'en');
  };

  const setLanguageDirect = (lang: KodaLanguage) => {
    setLanguage(lang);
  };

  return {
    language,
    toggleLanguage,
    setLanguage: setLanguageDirect
  };
}

