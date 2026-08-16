export type GuataResponseDepth = 'compact' | 'standard' | 'deep';

const COMPACT_EXACT = /^(oi|olá|ola|hey|bom dia|boa tarde|boa noite|obrigad[oa]|valeu|tchau|ok|okay|sim|não|nao)[\s!.,?]*$/i;

const COMPACT_PREFIXES = [
  'oi ', 'olá ', 'ola ', 'hey ', 'bom dia', 'boa tarde', 'boa noite',
  'obrigado', 'obrigada', 'valeu', 'tchau',
];

const DEEP_MARKERS = [
  'roteiro', 'itinerário', 'itinerario', 'história', 'historia',
  'conte sobre', 'me explica', 'detalhad', 'em detalhes', 'planejar', 'planejamento',
  'quantos dias', ' dias em ', 'viagem de ', 'cronograma', 'passo a passo',
  'monta um', 'montar um', 'planeje', 'planejamento de',
];

const STANDARD_MARKERS = [
  'o que fazer', 'onde comer', 'onde ficar', 'quais são', 'quais os', 'quais parques',
  'melhor restaurante', 'melhor hotel', 'restaurante', 'hotel', 'hospedagem',
  'passeio', 'parque', 'pontos turísticos', 'pontos turisticos', 'atrações', 'atracoes',
  'visitar', 'conhecer', 'gastronomia', 'comida típica', 'evento', 'agenda',
  'mais o que', 'e mais', 'o que mais', 'continua', 'mais detalhes',
  'me fala mais', 'e também', 'tem mais', 'outras opções', 'outras opcoes',
];

/** Classifica profundidade da resposta: compacto | padrão | detalhado. */
export function inferGuataResponseDepth(question: string): GuataResponseDepth {
  const q = question.toLowerCase().trim();
  if (!q) return 'compact';

  if (q.length < 20 && COMPACT_EXACT.test(q)) return 'compact';
  if (q.length < 30 && COMPACT_PREFIXES.some((p) => q.startsWith(p))) return 'compact';

  if (DEEP_MARKERS.some((m) => q.includes(m))) return 'deep';
  if (STANDARD_MARKERS.some((m) => q.includes(m))) return 'standard';

  return q.length > 12 ? 'standard' : 'compact';
}

export function guataResponseDepthMaxTokens(depth: GuataResponseDepth): number {
  switch (depth) {
    case 'compact':
      return 400;
    case 'standard':
    case 'deep':
      return 2048;
  }
}

const GUATA_FINISH_SENTENCE_RULE = `- NUNCA corte a resposta no meio de uma frase ou de um item de lista — sempre finalize com frase completa`;

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
- 1 frase de abertura curta + lista de 4 a 6 itens (• ou numerados, 1 linha cada) + 1 pergunta de continuidade
- Útil e completo, sem parágrafos longos de "encanto"; extraia nomes e lugares do contexto
- NÃO use formatação markdown (sem **negrito**, sem *itálico*)
${GUATA_FINISH_SENTENCE_RULE}`;
    case 'deep':
      return `📏 FORMATO (DETALHADO):
- Resposta completa: parágrafos, cronograma por dias ou explicações amplas quando fizer sentido
- Seja ESPECÍFICO e DETALHADO — use todo o contexto relevante
- Encerre com pergunta de acompanhamento natural
- NÃO use formatação markdown (sem **negrito**, sem *itálico*)
${GUATA_FINISH_SENTENCE_RULE}`;
  }
}
