/**
 * Validador de Escopo de Turismo
 * Detecta perguntas fora do escopo de turismo e mensagens inapropriadas
 * Retorna respostas educadas redirecionando para turismo (sem mencionar explicitamente o bloqueio)
 */

export interface ValidationResult {
  isTourismRelated: boolean;
  shouldBlock: boolean;
  isInappropriate: boolean;
  reason?: string;
  redirectResponse?: string;
}

export class TourismScopeValidator {
  // Palavras curtas: exigem match de palavra inteira (evita "furnas" → "urna")
  private readonly OFF_SCOPE_SHORT_WORDS = ['rg', 'cpf', 'cnh', 'app', 'urna', 'taxa'];

  // Palavras-chave que indicam FORA do escopo de turismo
  private readonly OFF_SCOPE_KEYWORDS = [
    // Serviços governamentais
    'detran', 'ipva', 'licença', 'documento',
    'imposto', 'tributo', 'receita federal', 'burocracia',
    'protocolo', 'processo administrativo',

    // Política (exceto turismo)
    'eleição', 'candidato', 'partido', 'votar', 'governo',

    // Saúde/Educação (exceto turismo)
    'hospital', 'médico', 'remédio', 'escola', 'universidade', 'ensino',

    // Tecnologia (exceto apps de turismo)
    'programação', 'código', 'software', 'aplicativo',

    // Finanças (exceto câmbio para turismo)
    'investimento', 'banco', 'empréstimo', 'financiamento', 'crédito',

    // Outros estados (exceto se relacionado a MS)
    'são paulo', 'rio de janeiro', 'minas gerais', 'paraná', 'santa catarina',
  ];

  // Palavras-chave que indicam DENTRO do escopo de turismo
  private readonly TOURISM_KEYWORDS = [
    'turismo', 'viagem', 'destino', 'passeio', 'atração', 'ponto turístico',
    'hotel', 'pousada', 'hospedagem', 'restaurante', 'comida', 'gastronomia',
    'evento', 'festival', 'roteiro', 'itinerário', 'bonito', 'pantanal',
    'campo grande', 'corumbá', 'dourados', 'visitar', 'conhecer', 'explorar',
    'trilha', 'cachoeira', 'ecoturismo', 'natureza', 'cultura', 'história',
    'artesanato', 'feira', 'museu', 'parque', 'monumento', 'praia',
    'flutuação', 'snorkel', 'safari', 'observação', 'pássaros', 'animais',
    'pesca', 'cavalgada', 'caminhada', 'tours', 'excursão',
    'comunidade', 'quilombola', 'quilombo', 'aldeia', 'furnas', 'corguinho',
    'miranda', 'jaraguari', 'atracao', 'atração', 'atracoes', 'atrações',
    'cat', 'centro de atendimento ao turista', 'centro de atendimento', 'atendimento ao turista',
    'rota bioceânica', 'rota bioceanica', 'bioceânica', 'bioceanica',
    'infraestrutura turística', 'infraestrutura turistica', 'serviço de turismo',
    'guia de turismo', 'agência de turismo', 'agencia de turismo', 'operadora de turismo',
    'informação turística', 'informacao turistica', 'posto de informação', 'posto de informacao',
    'turismo escolar', 'turismo na escola', 'educação patrimonial', 'educacao patrimonial',
  ];

  // Palavras-chave inapropriadas/ofensivas
  private readonly INAPPROPRIATE_KEYWORDS = [
    'idiota', 'burro', 'estúpido', 'imbecil', 'retardado', 'burra',
    'racismo', 'homofobia', 'xenofobia', 'preconceito', 'nazista',
    'matar', 'assassinar', 'violência extrema',
    'spam', 'hack', 'crack', 'pirataria', 'ignore previous instructions',
    'forget everything', 'new instructions', 'override', 'jailbreak',
    'developer mode', 'dan mode', 'system:',
  ];

  private matchesWholeWord(text: string, word: string): boolean {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(?:^|\\W)${escaped}(?:$|\\W)`, 'i').test(text);
  }

  private hasOffScopeKeyword(text: string): boolean {
    for (const keyword of this.OFF_SCOPE_SHORT_WORDS) {
      if (this.matchesWholeWord(text, keyword)) return true;
    }
    return this.OFF_SCOPE_KEYWORDS.some((keyword) => text.includes(keyword));
  }

  /**
   * Valida se a pergunta está dentro do escopo de turismo
   */
  validateQuestion(question: string): ValidationResult {
    const lowerQuestion = question.toLowerCase().trim();

    const isInappropriate = this.INAPPROPRIATE_KEYWORDS.some((keyword) =>
      lowerQuestion.includes(keyword),
    );

    if (isInappropriate) {
      return {
        isTourismRelated: false,
        shouldBlock: true,
        isInappropriate: true,
        reason: 'Mensagem contém conteúdo inapropriado',
        redirectResponse:
          '🦦 Desculpe, mas não posso responder a esse tipo de pergunta. Posso te ajudar com informações sobre turismo em Mato Grosso do Sul! 😊',
      };
    }

    const hasTourismKeywords = this.TOURISM_KEYWORDS.some((keyword) =>
      lowerQuestion.includes(keyword),
    );

    const hasOffScopeKeywords = this.hasOffScopeKeyword(lowerQuestion);

    if (hasOffScopeKeywords && !hasTourismKeywords) {
      return {
        isTourismRelated: false,
        shouldBlock: true,
        isInappropriate: false,
        reason: 'Pergunta fora do escopo de turismo',
        redirectResponse:
          '🦦 Olá! Eu sou o Guatá, seu guia inteligente de turismo de Mato Grosso do Sul! 😊\n\nPosso te ajudar com informações sobre destinos, atrações, gastronomia, hospedagem, eventos e roteiros turísticos em MS.\n\nO que você gostaria de saber sobre turismo em Mato Grosso do Sul? 🌟',
      };
    }

    if (hasTourismKeywords || !hasOffScopeKeywords) {
      return {
        isTourismRelated: true,
        shouldBlock: false,
        isInappropriate: false,
      };
    }

    return {
      isTourismRelated: false,
      shouldBlock: false,
      isInappropriate: false,
    };
  }
}
