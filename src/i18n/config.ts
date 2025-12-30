/**
 * Configuração do i18next
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ptBR from './locales/pt-BR/common.json';
import enUS from './locales/en-US/common.json';
import esES from './locales/es-ES/common.json';
import frFR from './locales/fr-FR/common.json';
import deDE from './locales/de-DE/common.json';

import ptBRPages from './locales/pt-BR/pages.json';
import enUSPages from './locales/en-US/pages.json';
import esESPages from './locales/es-ES/pages.json';
import frFRPages from './locales/fr-FR/pages.json';
import deDEPages from './locales/de-DE/pages.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'pt-BR': {
        common: ptBR,
        pages: ptBRPages,
      },
      'en-US': {
        common: enUS,
        pages: enUSPages,
      },
      'es-ES': {
        common: esES,
        pages: esESPages,
      },
      'fr-FR': {
        common: frFR,
        pages: frFRPages,
      },
      'de-DE': {
        common: deDE,
        pages: deDEPages,
      },
    },
    defaultNS: 'common',
    fallbackLng: 'pt-BR',
    returnEmptyString: false,
    returnNull: false,
    interpolation: {
      escapeValue: false, // React já escapa valores
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'descubra-ms-language',
      caches: ['localStorage'],
    },
  });

export default i18n;

