/**
 * 🗣️ LANGUAGE DETECTION SERVICE
 * Detecta o idioma da mensagem do usuário e fornece traduções
 */

export type SupportedLanguage = 'pt' | 'en' | 'es' | 'fr' | 'it' | 'de' | 'hi';

export interface LanguageDetectionResult {
  language: SupportedLanguage;
  confidence: number;
  detectedText: string;
}

class LanguageDetectionService {
  // Palavras-chave comuns em cada idioma
  private languageKeywords: Record<SupportedLanguage, string[]> = {
    pt: ['o', 'a', 'de', 'que', 'e', 'do', 'da', 'em', 'um', 'uma', 'para', 'com', 'não', 'uma', 'os', 'as', 'é', 'são', 'você', 'vc', 'onde', 'como', 'quando', 'quem', 'qual', 'quais'],
    en: ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'where', 'how', 'when', 'who', 'what', 'which'],
    es: ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'ser', 'se', 'no', 'haber', 'por', 'con', 'su', 'para', 'como', 'está', 'son', 'con', 'esta', 'por', 'qué', 'dónde', 'cómo', 'cuándo', 'quién', 'cuál'],
    fr: ['le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir', 'que', 'pour', 'dans', 'ce', 'son', 'une', 'sur', 'avec', 'ne', 'se', 'pas', 'tout', 'plus', 'par', 'grand', 'où', 'comment', 'quand', 'qui', 'quel'],
    it: ['il', 'di', 'che', 'e', 'la', 'a', 'per', 'è', 'sono', 'un', 'una', 'in', 'con', 'non', 'le', 'si', 'lo', 'da', 'come', 'dove', 'quando', 'chi', 'quale'],
    de: ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich', 'des', 'auf', 'für', 'ist', 'im', 'dem', 'nicht', 'ein', 'eine', 'als', 'auch', 'es', 'an', 'wer', 'wie', 'wo', 'wann', 'was', 'welche'],
    hi: ['में', 'है', 'और', 'के', 'की', 'को', 'से', 'पर', 'यह', 'वह', 'क्या', 'कहाँ', 'कैसे', 'कब', 'कौन', 'कौन सा', 'हो', 'था', 'हैं', 'था', 'कर', 'दे', 'ले', 'जा', 'आ', 'रह', 'गया', 'दिया', 'लिया']
  };

  // Saudações comuns em cada idioma
  private greetings: Record<SupportedLanguage, string[]> = {
    pt: ['olá', 'oi', 'bom dia', 'boa tarde', 'boa noite', 'tudo bem', 'como vai'],
    en: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'how are you', 'what\'s up'],
    es: ['hola', 'buenos días', 'buenas tardes', 'buenas noches', '¿cómo estás?', '¿qué tal?'],
    fr: ['bonjour', 'salut', 'bonsoir', 'bonne nuit', 'comment allez-vous', 'ça va'],
    it: ['ciao', 'buongiorno', 'buonasera', 'come stai', 'come va'],
    de: ['hallo', 'guten tag', 'guten morgen', 'guten abend', 'wie geht es', 'wie geht\'s'],
    hi: ['नमस्ते', 'नमस्कार', 'हैलो', 'कैसे हो', 'क्या हाल है', 'सुप्रभात', 'शुभ संध्या']
  };

  /**
   * Detecta o idioma da mensagem
   */
  detectLanguage(text: string): LanguageDetectionResult {
    if (!text || text.trim().length === 0) {
      return { language: 'pt', confidence: 0, detectedText: text };
    }

    const lowerText = text.toLowerCase().trim();
    const words = lowerText.split(/\s+/);
    
    // Contar ocorrências de palavras-chave de cada idioma
    const scores: Record<SupportedLanguage, number> = {
      pt: 0,
      en: 0,
      es: 0,
      fr: 0,
      it: 0,
      de: 0,
      hi: 0
    };

    // Verificar saudações primeiro (mais confiável)
    for (const [lang, langGreetings] of Object.entries(this.greetings)) {
      if (langGreetings.some(greeting => lowerText.includes(greeting))) {
        scores[lang as SupportedLanguage] += 10; // Boost para saudações
      }
    }

    // Contar palavras-chave
    for (const word of words) {
      const cleanWord = word.replace(/[.,!?;:]/g, '');
      for (const [lang, keywords] of Object.entries(this.languageKeywords)) {
        if (keywords.includes(cleanWord)) {
          scores[lang as SupportedLanguage]++;
        }
      }
    }

    // Encontrar idioma com maior score
    let maxScore = 0;
    let detectedLang: SupportedLanguage = 'pt';

    for (const [lang, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        detectedLang = lang as SupportedLanguage;
      }
    }

    // Calcular confiança (baseado no score e comprimento do texto)
    const totalWords = words.length;
    const confidence = totalWords > 0 
      ? Math.min(0.95, Math.max(0.5, maxScore / Math.max(1, totalWords * 0.3)))
      : 0.5;

    return {
      language: detectedLang,
      confidence,
      detectedText: text
    };
  }

  /**
   * Verifica se o texto está em um idioma específico
   */
  isLanguage(text: string, language: SupportedLanguage): boolean {
    const detection = this.detectLanguage(text);
    return detection.language === language && detection.confidence > 0.6;
  }

  /**
   * Retorna o nome do idioma em português
   */
  getLanguageName(language: SupportedLanguage): string {
    const names: Record<SupportedLanguage, string> = {
      pt: 'Português',
      en: 'Inglês',
      es: 'Espanhol',
      fr: 'Francês',
      it: 'Italiano',
      de: 'Alemão',
      hi: 'Hindi'
    };
    return names[language];
  }
}

// Exportar instância única
export const languageDetectionService = new LanguageDetectionService();

