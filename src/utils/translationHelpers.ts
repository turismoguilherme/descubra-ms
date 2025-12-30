/**
 * Utilitários para tradução
 */

export type LanguageCode = 'pt-BR' | 'en-US' | 'es-ES' | 'fr-FR' | 'de-DE' | 'it-IT' | 'ja-JP' | 'ko-KR' | 'zh-CN';

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'pt-BR', name: 'Português', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'en-US', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es-ES', name: 'Español', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr-FR', name: 'Français', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de-DE', name: 'Deutsch', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it-IT', name: 'Italiano', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'ja-JP', name: '日本語', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko-KR', name: '한국어', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'zh-CN', name: '中文', nativeName: '中文', flag: '🇨🇳' },
];

export const DEFAULT_LANGUAGE: LanguageCode = 'pt-BR';

/**
 * Detecta o idioma do navegador
 */
export function detectBrowserLanguage(): LanguageCode {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;

  const browserLang = navigator.language || (navigator as any).userLanguage || DEFAULT_LANGUAGE;
  
  // Normalizar código (ex: 'pt' -> 'pt-BR', 'en' -> 'en-US')
  const normalized = normalizeLanguageCode(browserLang);
  
  // Verificar se é um idioma suportado
  const supported = SUPPORTED_LANGUAGES.find(lang => lang.code === normalized);
  
  return supported ? normalized : DEFAULT_LANGUAGE;
}

/**
 * Normaliza código de idioma
 */
export function normalizeLanguageCode(code: string): LanguageCode {
  const lower = code.toLowerCase();
  
  // Mapeamentos comuns
  if (lower.startsWith('pt')) return 'pt-BR';
  if (lower.startsWith('en')) return 'en-US';
  if (lower.startsWith('es')) return 'es-ES';
  if (lower.startsWith('fr')) return 'fr-FR';
  if (lower.startsWith('de')) return 'de-DE';
  if (lower.startsWith('it')) return 'it-IT';
  if (lower.startsWith('ja')) return 'ja-JP';
  if (lower.startsWith('ko')) return 'ko-KR';
  if (lower.startsWith('zh')) return 'zh-CN';
  
  // Tentar encontrar match exato
  const exactMatch = SUPPORTED_LANGUAGES.find(lang => 
    lang.code.toLowerCase() === lower
  );
  
  return exactMatch ? exactMatch.code : DEFAULT_LANGUAGE;
}

/**
 * Verifica se precisa traduzir (não é português)
 */
export function shouldTranslate(languageCode: LanguageCode): boolean {
  return languageCode !== 'pt-BR';
}

/**
 * Obtém informações de um idioma pelo código
 */
export function getLanguageInfo(code: LanguageCode): Language | undefined {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
}

/**
 * Obtém lista de idiomas principais (para seletor compacto)
 */
export function getMainLanguages(): Language[] {
  return SUPPORTED_LANGUAGES.slice(0, 5); // pt-BR, en-US, es-ES, fr-FR, de-DE
}

