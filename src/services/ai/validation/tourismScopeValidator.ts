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
  // Palavras-chave que indicam FORA do escopo de turismo
  private readonly OFF_SCOPE_KEYWORDS = [
    // Serviços governamentais
    'detran', 'ipva', 'licença', 'cnh', 'documento', 'rg', 'cpf',
    'imposto', 'taxa', 'tributo', 'receita federal', 'burocracia',
    'protocolo', 'processo administrativo',
    
    // Política (exceto turismo)
    'eleição', 'candidato', 'partido', 'votar', 'urna', 'governo',
    
    // Saúde/Educação (exceto turismo)
    'hospital', 'médico', 'remédio', 'escola', 'universidade', 'ensino',
    
    // Tecnologia (exceto apps de turismo)
    'programação', 'código', 'software', 'aplicativo', 'app',
    
    // Finanças (exceto câmbio para turismo)
    'investimento', 'banco', 'empréstimo', 'financiamento', 'crédito',
    
    // Outros estados (exceto se relacionado a MS)
    'são paulo', 'rio de janeiro', 'minas gerais', 'paraná', 'santa catarina'
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
    'pesca', 'cavalgada', 'trilha', 'caminhada', 'tours', 'excursão',
    // Infraestrutura e serviços de turismo
    'cat', 'centro de atendimento ao turista', 'centro de atendimento', 'atendimento ao turista',
    'rota bioceânica', 'rota bioceanica', 'bioceânica', 'bioceanica',
    'infraestrutura turística', 'infraestrutura turistica', 'serviço de turismo',
    'guia de turismo', 'agência de turismo', 'agencia de turismo', 'operadora de turismo',
    'informação turística', 'informacao turistica', 'posto de informação', 'posto de informacao'
  ];
  
  // Palavras-chave inapropriadas/ofensivas
  private readonly INAPPROPRIATE_KEYWORDS = [
    // Ofensas
    'idiota', 'burro', 'estúpido', 'imbecil', 'retardado', 'burra',
    
    // Discriminação
    'racismo', 'homofobia', 'xenofobia', 'preconceito', 'nazista',
    
    // Violência
    'matar', 'assassinar', 'violência extrema',
    
    // Spam/Jailbreak
    'spam', 'hack', 'crack', 'pirataria', 'ignore previous instructions',
    'forget everything', 'new instructions', 'override', 'jailbreak',
    'developer mode', 'dan mode', 'system:'
  ];
  
  /**
   * Valida se a pergunta está dentro do escopo de turismo
   */
  validateQuestion(question: string): ValidationResult {
    const lowerQuestion = question.toLowerCase().trim();
    
    // 1. Verificar se é inapropriada
    const isInappropriate = this.INAPPROPRIATE_KEYWORDS.some(
      keyword => lowerQuestion.includes(keyword)
    );
    
    if (isInappropriate) {
      return {
        isTourismRelated: false,
        shouldBlock: true,
        isInappropriate: true,
        reason: 'Mensagem contém conteúdo inapropriado',
        redirectResponse: '🦦 Desculpe, mas não posso responder a esse tipo de pergunta. Posso te ajudar com informações sobre turismo em Mato Grosso do Sul! 😊'
      };
    }
    
    // 2. Verificar se tem palavras de turismo
    const hasTourismKeywords = this.TOURISM_KEYWORDS.some(
      keyword => lowerQuestion.includes(keyword)
    );
    
    // 3. Verificar se tem palavras fora do escopo
    const hasOffScopeKeywords = this.OFF_SCOPE_KEYWORDS.some(
      keyword => lowerQuestion.includes(keyword)
    );
    
    // 4. Decisão: Se tem palavras fora do escopo E não tem palavras de turismo = BLOQUEAR
    if (hasOffScopeKeywords && !hasTourismKeywords) {
      return {
        isTourismRelated: false,
        shouldBlock: true,
        isInappropriate: false,
        reason: 'Pergunta fora do escopo de turismo',
        redirectResponse: '🦦 Olá! Eu sou o Guatá, seu guia inteligente de turismo de Mato Grosso do Sul! 😊\n\nPosso te ajudar com informações sobre destinos, atrações, gastronomia, hospedagem, eventos e roteiros turísticos em MS.\n\nO que você gostaria de saber sobre turismo em Mato Grosso do Sul? 🌟'
      };
    }
    
    // 5. Se tem palavras de turismo OU não tem palavras problemáticas = OK
    if (hasTourismKeywords || !hasOffScopeKeywords) {
      return {
        isTourismRelated: true,
        shouldBlock: false,
        isInappropriate: false
      };
    }
    
    // 6. Caso ambíguo: não tem palavras claras de turismo nem fora do escopo
    // Neste caso, permitir mas adicionar instrução no prompt para o Gemini verificar
    return {
      isTourismRelated: false, // Ambíguo
      shouldBlock: false,
      isInappropriate: false
    };
  }
}

