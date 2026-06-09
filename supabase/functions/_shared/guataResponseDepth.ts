/** Profundidade de resposta do Guatá — tokens e instruções de formato */

export type GuataResponseDepth = 'compact' | 'standard' | 'deep';

export function inferGuataResponseDepth(question: string): GuataResponseDepth {
  const q = question.toLowerCase().trim();
  if (!q) return 'compact';

  if (/^(oi|olá|ola|hey|bom dia|boa tarde|boa noite|obrigad[oa]|valeu|tchau|ok|okay|sim|não|nao)[\s!.,?]*$/i.test(q)) {
    return 'compact';
  }
  if (q.length < 30 && /^(oi|olá|ola|hey|bom dia|boa tarde|boa noite|obrigad)/i.test(q)) {
    return 'compact';
  }

  const deepMarkers = [
    'roteiro', 'itinerário', 'itinerario', 'história', 'historia',
    'conte sobre', 'me explica', 'detalhad', 'em detalhes', 'planejar', 'planejamento',
    'quantos dias', ' dias em ', 'viagem de ', 'cronograma', 'passo a passo',
    'monta um', 'montar um', 'planeje', 'completo', 'completa',
  ];
  if (deepMarkers.some((m) => q.includes(m)) || /\d+\s*dias/.test(q)) return 'deep';

  const standardMarkers = [
    'o que fazer', 'onde comer', 'onde ficar', 'quais são', 'quais os', 'quais parques',
    'restaurante', 'hotel', 'hospedagem', 'passeio', 'parque', 'pontos turísticos',
    'pontos turisticos', 'atrações', 'atracoes', 'visitar', 'conhecer', 'gastronomia',
    'mais o que', 'e mais', 'o que mais', 'continua', 'me fala mais', 'tem mais',
  ];
  if (standardMarkers.some((m) => q.includes(m))) return 'standard';

  return q.length > 12 ? 'standard' : 'compact';
}

export function guataResponseDepthMaxTokens(depth: GuataResponseDepth): number {
  switch (depth) {
    case 'compact': return 512;
    case 'standard': return 2048;
    case 'deep': return 4096;
  }
}

const GUATA_FINISH_SENTENCE_RULE =
  '- NUNCA corte a resposta no meio de uma frase ou de um item de lista — sempre finalize com frase completa';

export function guataResponseDepthFormatBlock(depth: GuataResponseDepth): string {
  switch (depth) {
    case 'compact':
      return `📏 FORMATO (COMPACTO):
- Máximo 2 a 3 frases curtas
- Responda direto, sem listas longas
- Use no máximo 1 emoji
${GUATA_FINISH_SENTENCE_RULE}`;
    case 'standard':
      return `📏 FORMATO (PADRÃO):
- 1 frase de abertura curta + lista de 5 a 7 sugestões (• ou numerados), cada uma com 1–2 linhas de detalhe prático
- Inclua nomes reais de lugares, períodos (manhã/tarde/noite) quando fizer sentido
- Encerre com 1 pergunta de continuidade personalizada
- NÃO use formatação markdown (sem **negrito**, sem *itálico*)
${GUATA_FINISH_SENTENCE_RULE}`;
    case 'deep':
      return `📏 FORMATO (DETALHADO — ROTEIROS E EXPLICAÇÕES LONGAS):
- Se pedirem roteiro com N dias, cubra TODOS os dias solicitados (Dia 1, Dia 2, … até o último)
- Para cada dia: manhã, tarde e noite com lugares específicos da LISTA BRANCA ou do CONTEXTO
- Seja específico e generoso — o turista quer um guia completo, não um resumo
- Encerre com pergunta de acompanhamento (ex.: ajustar para família, casal ou incluir Bonito/Pantanal)
- NÃO use formatação markdown (sem **negrito**, sem *itálico*)
${GUATA_FINISH_SENTENCE_RULE}`;
  }
}
