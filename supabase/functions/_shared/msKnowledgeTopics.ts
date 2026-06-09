/** Espelho de src/services/ai/search/msKnowledgeTopics.ts — fallback offline nas Edge Functions */

interface MSKnowledgeTopic {
  patterns: RegExp[];
  answer: string;
}

const MS_KNOWLEDGE_TOPICS: MSKnowledgeTopic[] = [
  {
    patterns: [
      /turismo\s+de\s+impacto/i,
      /impacto\s+social/i,
      /turismo\s+comunit/i,
      /base\s+comunit/i,
      /tbc\b/i,
      /turismo\s+de\s+base/i,
    ],
    answer:
      'O turismo de impacto social (ou de base comunitária) coloca a comunidade no centro: a viagem gera renda, valoriza cultura e preserva o território. Em MS, isso aparece em experiências com povos indígenas Terena e Guarani-Kaiowá, no Pantanal de Miranda, e em projetos receptivos no interior. Quer exemplos de destinos ou como agendar uma visita?',
  },
  {
    patterns: [
      /turismo\s+sustent/i,
      /sustentabilidade/i,
      /ecoturismo/i,
      /viagem\s+respons/i,
    ],
    answer:
      'Turismo sustentável em MS combina natureza, respeito às comunidades e baixo impacto. Bonito é referência em ecoturismo com cotas e agendamento; o Pantanal valoriza safáris fotográficos e pousadas que apoiam conservação. Quer saber sobre Bonito, Pantanal ou experiências comunitárias?',
  },
  {
    patterns: [
      /comida\s+t[ií]?pica/i,
      /comida\s+(t[ií]pica|tipica).*\bms\b/i,
      /gastronomia/i,
      /culin[aá]ria/i,
      /onde\s+comer/i,
      /o\s+que\s+comer/i,
      /pratos?\s+(t[ií]pic|region)/i,
      /sob[aá]/i,
      /chipa/i,
      /terer[eé]/i,
      /sopa\s+paraguaia/i,
    ],
    answer:
      'A culinária sul-mato-grossense mistura tradições indígenas, paraguaias e pantaneiras. Clássicos: sobá, chipa, sopa paraguaia, pacu assado, arroz carreteiro e tereré. A Feira Central de Campo Grande é imperdível para provar. Quer dicas em Campo Grande, Corumbá ou outra cidade?',
  },
  {
    patterns: [
      /melhor\s+[eé]poca.*pantanal/i,
      /quando\s+ir.*pantanal/i,
      /pantanal.*[eé]poca/i,
    ],
    answer:
      'A melhor época no Pantanal é a estação seca (maio a setembro): a água baixa concentra jacarés, capivaras e aves — ótimo para safáris. Na cheia (dez–mar), a paisagem muda e o acesso pode ser mais difícil. Quer dicas de onde ficar em Corumbá ou Miranda?',
  },
  {
    patterns: [
      /^roteiro/i,
      /planejar\s+(uma\s+)?viagem/i,
      /montar\s+roteiro/i,
      /\d+\s+dias\s+em/i,
    ],
    answer:
      'Para montar um roteiro em MS, vale combinar destinos: Campo Grande (cultura e gastronomia), Bonito (ecoturismo), Pantanal (vida selvagem) ou Corumbá (portal do Pantanal). Me conta quantos dias você tem e se prefere natureza, cultura ou gastronomia.',
  },
  {
    patterns: [/quem\s+[eé]\s+(voc[eê]|o\s+guat)/i, /o\s+que\s+[eé]\s+o\s+guat/i],
    answer:
      'Sou o Guatá, capivara guia de turismo de Mato Grosso do Sul — meu nome vem do guarani e significa caminhar, explorar. Estou aqui para ajudar com destinos, roteiros, gastronomia e cultura de MS. O que você quer descobrir?',
  },
];

export function matchMSKnowledgeTopic(question: string): string | null {
  const q = question.trim();
  if (!q) return null;
  for (const topic of MS_KNOWLEDGE_TOPICS) {
    if (topic.patterns.some((p) => p.test(q))) {
      return topic.answer;
    }
  }
  return null;
}

export function isGenericGuataFallback(text: string): boolean {
  const t = text.trim();
  return (
    /posso te ajudar com destinos, gastronomia/i.test(t) ||
    /busca com ia está temporariamente limitada/i.test(t)
  );
}
