/**
 * 🏛️ Base de Conhecimento Específica de Mato Grosso do Sul
 * 
 * Dados REAIS e VERIFICADOS sobre turismo em MS
 * Utilizada como fallback inteligente quando a busca web falha
 */

import { matchMSKnowledgeTopic } from './msKnowledgeTopics';

export interface MSLocation {
  id: string;
  name: string;
  category: 'atracao' | 'restaurante' | 'hotel' | 'evento' | 'servico';
  city: string;
  address: string;
  coordinates?: { lat: number; lng: number };
  description: string;
  hours?: string;
  contact?: {
    phone?: string;
    website?: string;
    email?: string;
  };
  price_range?: string;
  accessibility?: string;
  last_verified: string;
  confidence: number;
  tags: string[];
}

export class MSKnowledgeBase {
  private static readonly VERIFIED_LOCATIONS: MSLocation[] = [
    // ATRAÇÕES PRINCIPAIS - CAMPO GRANDE
    {
      id: 'aquario-do-pantanal',
      name: 'Aquário do Pantanal',
      category: 'atracao',
      city: 'Campo Grande',
      address: 'Av. Afonso Pena, 7000 - Rita Vieira, Campo Grande - MS, 79124-020',
      coordinates: { lat: -20.4428, lng: -54.5646 },
      description: 'Aquário com espécies de peixes do Pantanal. Para informações atualizadas sobre funcionamento, consulte órgãos oficiais de turismo.',
      hours: 'Verificar funcionamento atual com órgãos de turismo',
      contact: {
        phone: 'Consultar Fundtur-MS: (67) 3318-5000',
        website: 'https://turismo.ms.gov.br',
        email: 'fundtur@ms.gov.br'
      },
      price_range: 'Consultar valores atuais',
      accessibility: 'Verificar acessibilidade atual',
      last_verified: '2025-01-18',
      confidence: 0.7,
      tags: ['aquário', 'pantanal', 'peixes', 'família', 'verificar_funcionamento']
    },
    {
      id: 'feira-central-cg',
      name: 'Feira Central de Campo Grande',
      category: 'atracao',
      city: 'Campo Grande',
      address: 'Av. Calógeras, s/n - Centro, Campo Grande - MS',
      coordinates: { lat: -20.4648, lng: -54.6178 },
      description: 'Feira com produtos regionais, artesanato e gastronomia típica sul-mato-grossense.',
      hours: 'Quarta a sexta: 16h às 23h | Sábado e domingo: 11h às 23h',
      price_range: 'Variado (R$ 5 a R$ 50)',
      last_verified: '2025-01-18',
      confidence: 0.90,
      tags: ['feira', 'artesanato', 'gastronomia', 'regional', 'noite', 'fim de semana']
    },
    {
      id: 'parque-nacoes-indigenas',
      name: 'Parque das Nações Indígenas',
      category: 'atracao',
      city: 'Campo Grande',
      address: 'Av. Afonso Pena - Vila Ipiranga, Campo Grande - MS',
      coordinates: { lat: -20.4533, lng: -54.6064 },
      description: 'Maior parque urbano de Campo Grande, com lago, trilhas, quadras esportivas e espaços para piquenique.',
      hours: 'Diariamente: 5h às 22h',
      price_range: 'Gratuito',
      accessibility: 'Parcialmente acessível',
      last_verified: '2025-01-18',
      confidence: 0.90,
      tags: ['parque', 'urbano', 'trilhas', 'esporte', 'família', 'caminhada', 'gratuito']
    },
    {
      id: 'museu-culturas-dom-bosco',
      name: 'Museu das Culturas Dom Bosco',
      category: 'atracao',
      city: 'Campo Grande',
      address: 'Av. Mato Grosso, 1.440 - Vila Ipiranga, Campo Grande - MS',
      coordinates: { lat: -20.4489, lng: -54.6063 },
      description: 'Museu com acervo de culturas indígenas, minerais, fósseis e arte regional.',
      hours: 'Terça a sexta: 8h às 17h | Sábado: 8h às 16h',
      contact: {
        phone: 'Consultar UCDB: (67) 3312-3300',
        website: 'https://ucdb.br'
      },
      price_range: 'R$ 5 a R$ 10',
      accessibility: 'Acessível para cadeirantes',
      last_verified: '2025-01-18',
      confidence: 0.85,
      tags: ['museu', 'cultura', 'indígena', 'arte', 'história', 'educativo']
    },

    // ATRAÇÕES - BONITO
    {
      id: 'gruta-azul-bonito',
      name: 'Gruta do Lago Azul',
      category: 'atracao',
      city: 'Bonito',
      address: 'Estrada da Gruta do Lago Azul, Bonito - MS',
      coordinates: { lat: -21.1617, lng: -56.4728 },
      description: 'Caverna com lago subterrâneo de águas cristalinas azul-turquesa.',
      hours: 'Diariamente: 8h às 15h (última entrada)',
      price_range: 'R$ 35 a R$ 50 (varia por agência)',
      last_verified: '2025-01-18',
      confidence: 0.90,
      tags: ['gruta', 'lago azul', 'caverna', 'águas cristalinas', 'bonito']
    },
    {
      id: 'rio-da-prata',
      name: 'Rio da Prata',
      category: 'atracao',
      city: 'Bonito',
      address: 'Estrada do Rio da Prata, Bonito - MS',
      coordinates: { lat: -21.0852, lng: -56.5269 },
      description: 'Rio de águas cristalinas ideal para flutuação e observação de peixes.',
      hours: 'Diariamente: 7h às 16h (agendamento necessário)',
      price_range: 'R$ 80 a R$ 150 (inclui equipamentos)',
      accessibility: 'Trilha de dificuldade moderada',
      last_verified: '2025-01-18',
      confidence: 0.85,
      tags: ['rio', 'flutuação', 'águas cristalinas', 'peixes', 'ecoturismo', 'natureza']
    },
    {
      id: 'abismo-anhumas',
      name: 'Abismo Anhumas',
      category: 'atracao',
      city: 'Bonito',
      address: 'Fazenda Anhumas, Bonito - MS',
      coordinates: { lat: -21.0433, lng: -56.5847 },
      description: 'Caverna subterrânea com lago cristalino, acesso por rapel de 72 metros.',
      hours: 'Diariamente: 7h às 14h (agendamento obrigatório)',
      price_range: 'R$ 350 a R$ 450 (inclui equipamentos e instrutor)',
      accessibility: 'Atividade de aventura - não recomendada para crianças menores de 14 anos',
      last_verified: '2025-01-18',
      confidence: 0.85,
      tags: ['caverna', 'rapel', 'aventura', 'lago', 'ecoturismo', 'radical']
    },

    // PANTANAL
    {
      id: 'pantanal-ms',
      name: 'Pantanal Sul-Mato-Grossense',
      category: 'atracao',
      city: 'Corumbá',
      address: 'Região do Pantanal - MS',
      coordinates: { lat: -19.0078, lng: -57.6547 },
      description: 'Patrimônio da Humanidade pela UNESCO, maior planície alagável do mundo. Rica biodiversidade com mais de 650 espécies de aves.',
      hours: 'Acesso através de agências especializadas e pousadas',
      contact: {
        website: 'https://visitms.com.br/pantanal'
      },
      price_range: 'Pacotes a partir de R$ 200/dia (inclui hospedagem e refeições)',
      last_verified: '2025-01-18',
      confidence: 0.95,
      tags: ['pantanal', 'unesco', 'natureza', 'fauna', 'flora', 'aves', 'pesca', 'ecoturismo']
    },

    // RESTAURANTES E GASTRONOMIA
    {
      id: 'casa-do-peixe',
      name: 'Casa do Peixe',
      category: 'restaurante',
      city: 'Campo Grande',
      address: 'Região Central de Campo Grande',
      description: 'Restaurante especializado em peixes de água doce típicos do Pantanal como pintado, pacu e piranha.',
      hours: 'Segunda a sábado: 11h às 22h | Domingo: 11h às 16h',
      price_range: 'R$ 40 a R$ 80 por pessoa',
      last_verified: '2025-01-18',
      confidence: 0.75,
      tags: ['restaurante', 'peixe', 'pantanal', 'regional', 'pintado', 'pacu', 'piranha']
    },
    {
      id: 'mercadao-municipal-cg',
      name: 'Mercadão Municipal de Campo Grande',
      category: 'atracao',
      city: 'Campo Grande',
      address: 'Av. Calógeras, 2.078 - Centro, Campo Grande - MS',
      coordinates: { lat: -20.4648, lng: -54.6234 },
      description: 'Mercado tradicional com produtos regionais, frutas do cerrado, artesanato e comidas típicas.',
      hours: 'Segunda a sábado: 6h às 18h | Domingo: 6h às 12h',
      price_range: 'Variado (R$ 3 a R$ 30)',
      accessibility: 'Parcialmente acessível',
      last_verified: '2025-01-18',
      confidence: 0.85,
      tags: ['mercado', 'produtos regionais', 'frutas', 'cerrado', 'artesanato', 'comida típica']
    },

    // HOTÉIS E HOSPEDAGEM
    {
      id: 'pousadas-bonito',
      name: 'Pousadas em Bonito',
      category: 'hotel',
      city: 'Bonito',
      address: 'Centro de Bonito - MS',
      description: 'Bonito oferece diversas opções de hospedagem, desde pousadas familiares até resorts de ecoturismo.',
      price_range: 'R$ 80 a R$ 400/noite (varia por temporada)',
      contact: {
        website: 'https://visitbonito.com.br'
      },
      last_verified: '2025-01-18',
      confidence: 0.80,
      tags: ['hospedagem', 'pousada', 'resort', 'ecoturismo', 'bonito']
    },

    // SERVIÇOS E INFORMAÇÕES
    {
      id: 'fundtur-ms',
      name: 'Fundação de Turismo de Mato Grosso do Sul',
      category: 'servico',
      city: 'Campo Grande',
      address: 'Av. Noroeste, 5140 - Três Lagoas, Campo Grande - MS',
      description: 'Órgão oficial de turismo do estado, fornece informações e apoio aos turistas.',
      contact: {
        phone: '(67) 3318-5000',
        website: 'https://fundtur.ms.gov.br',
        email: 'atendimento@fundtur.ms.gov.br'
      },
      hours: 'Segunda a sexta: 7h às 13h',
      last_verified: '2025-01-18',
      confidence: 0.95,
      tags: ['turismo', 'informações', 'oficial', 'governo', 'apoio']
    },
    {
      id: 'furnas-boa-sorte',
      name: 'Comunidade Quilombola Furnas da Boa Sorte',
      category: 'atracao',
      city: 'Corguinho',
      address: 'Serra de Maracaju — região de Corguinho, MS (~99 km de Campo Grande)',
      coordinates: { lat: -21.8333, lng: -55.4167 },
      description:
        'Comunidade quilombola no planalto da Serra de Maracaju, entre Cerrado e Pantanal. ' +
        'Projeto de turismo de base comunitária (TBC) com trilhas, cachoeiras, observação de aves, ' +
        'artesanato (telhas, peneiras) e receptivo comunitário em implantação com apoio da Fundtur-MS. ' +
        'Território em processo de regularização fundiária; visitas devem ser agendadas com a associação/comunidade. ' +
        'Não confundir com Furnas do Dionísio (Jaraguari), outro quilombo com estrutura turística já estabelecida.',
      hours: 'Visitas mediante agendamento com a comunidade ou agências parceiras',
      contact: {
        phone: 'Agendar via Fundtur-MS ou agências de turismo de Corguinho/Campo Grande',
        website: 'https://turismo.ms.gov.br',
      },
      price_range: 'Consultar valores e disponibilidade ao agendar',
      accessibility: 'Trilhas em terreno rural; confirmar condições com a comunidade',
      last_verified: '2026-03-06',
      confidence: 0.9,
      tags: [
        'furnas',
        'boa sorte',
        'quilombola',
        'quilombo',
        'comunidade',
        'corguinho',
        'maracaju',
        'ecoturismo',
        'turismo comunitario',
        'trilha',
        'cachoeira',
        'artesanato',
        'cerrado',
        'pantanal',
      ],
    },
    {
      id: 'aldeia-babacu',
      name: 'Aldeia Babaçu (Comunidade Terena)',
      category: 'atracao',
      city: 'Miranda',
      address: 'Zona rural de Miranda - MS (região do Pantanal de Miranda)',
      coordinates: { lat: -20.2406, lng: -56.3781 },
      description:
        'Comunidade indígena do povo Terena no Pantanal de Miranda. Experiência de turismo de base comunitária ' +
        'autorizada pela FUNAI (projeto Bruaca), conduzida pelos próprios moradores. Inclui conversa sobre história ' +
        'Terena, caminhada leve (~3 km, 2–3 h), plantas medicinais, frutos da estação, espaço das artesãs (cerâmica e cestaria) ' +
        'e troca sobre língua, costumes e espiritualidade. Estrutura simples e autêntica — não é atrativo turístico tradicional. ' +
        'Agende com antecedência; a cerca de 70 km de Bonito, boa opção combinada com Pantanal.',
      hours: 'Visitas agendadas — saídas costumam ser 08h ou 14h (confirmar com a comunidade/agência)',
      contact: {
        phone: 'Agendar via agências de Miranda/Bonito ou projeto Bruaca',
        website: 'https://turismo.ms.gov.br',
      },
      price_range: 'Consultar valores e disponibilidade ao agendar',
      accessibility: 'Caminhada leve em terreno rural; confirmar condições com a comunidade',
      last_verified: '2026-03-06',
      confidence: 0.92,
      tags: [
        'aldeia',
        'babacu',
        'babaçu',
        'terena',
        'indigena',
        'indígena',
        'miranda',
        'pantanal',
        'turismo comunitario',
        'artesanato',
        'cultura',
        'bruaca',
        'funai',
      ],
    },
    {
      id: 'turismo-na-escola-ms',
      name: 'Turismo na Escola (MS)',
      category: 'servico',
      city: 'Mato Grosso do Sul',
      address: 'Programa estadual — Fundtur-MS / Secretaria de Turismo',
      description:
        'Programa de educação patrimonial e turismo escolar em Mato Grosso do Sul, promovido pela Fundtur-MS. ' +
        'Leva estudantes a conhecer patrimônio cultural, natural e histórico do estado — museus, parques, ' +
        'comunidades tradicionais e destinos como Pantanal, Bonito e Campo Grande. Escolas interessadas devem ' +
        'contatar a Fundtur-MS ou a Secretaria de Educação do município para inscrição e roteiros.',
      contact: {
        phone: 'Fundtur-MS: (67) 3318-5000',
        website: 'https://turismo.ms.gov.br',
        email: 'fundtur@ms.gov.br',
      },
      hours: 'Atividades em dias letivos — agendar com antecedência pela escola',
      price_range: 'Gratuito ou com apoio da rede pública (confirmar com Fundtur)',
      last_verified: '2026-03-06',
      confidence: 0.88,
      tags: [
        'turismo',
        'escola',
        'turismo escolar',
        'turismo na escola',
        'educacao',
        'educação',
        'patrimonio',
        'patrimônio',
        'estudantes',
        'fundtur',
        'programa',
      ],
    },
    {
      id: 'cac-bonito',
      name: 'Centro de Atendimento ao Turista de Bonito',
      category: 'servico',
      city: 'Bonito',
      address: 'Rua Cel. Pilad Rebuá, 1864 - Centro, Bonito - MS',
      coordinates: { lat: -21.1289, lng: -56.4889 },
      description: 'Centro oficial de informações turísticas de Bonito com mapas, roteiros e agendamento de passeios.',
      contact: {
        phone: '(67) 3255-1850',
        website: 'https://bonito.ms.gov.br'
      },
      hours: 'Segunda a sexta: 8h às 17h | Sábado: 8h às 12h',
      price_range: 'Gratuito',
      last_verified: '2025-01-18',
      confidence: 0.90,
      tags: ['informações', 'turismo', 'mapas', 'roteiros', 'agendamento', 'oficial']
    }
  ];

  /**
   * Buscar locais por palavra-chave
   */
  private static normalizeSearchText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private static readonly SEARCH_STOPWORDS = new Set([
    'turismo', 'comunidade', 'da', 'de', 'do', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas',
    'ms', 'mato', 'grosso', 'sul', 'boa', 'sorte', 'o', 'a', 'os', 'as', 'e', 'ou', 'para',
    'com', 'sem', 'qual', 'quais', 'sao', 'principal', 'principais', 'pontos', 'turisticos',
    'atracao', 'atracoes', 'visitar', 'conhecer', 'sobre', 'como', 'onde', 'que', 'fazer',
  ]);

  /** Evita "que" dentro de "parque", "em" solto, etc. */
  private static termMatchesInText(text: string, term: string): boolean {
    if (!term || this.SEARCH_STOPWORDS.has(term)) return false;
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (term.length <= 4) {
      return new RegExp(`(?:^|\\W)${escaped}(?:$|\\W)`, 'i').test(text);
    }
    return text.includes(term);
  }

  private static readonly KNOWN_CITIES: Record<string, string> = {
    corumba: 'Corumbá',
    'campo grande': 'Campo Grande',
    bonito: 'Bonito',
    dourados: 'Dourados',
    miranda: 'Miranda',
    aquidauana: 'Aquidauana',
    'tres lagoas': 'Três Lagoas',
    'três lagoas': 'Três Lagoas',
  };

  private static readonly CITY_GUIDES: Record<
    string,
    { tagline: string; highlights: string[] }
  > = {
    Corumbá: {
      tagline: 'Capital do Pantanal e porta de entrada para o maior bioma úmido do mundo',
      highlights: [
        'Passeios de barco pelo Rio Paraguai com observação de fauna',
        'Casario histórico e forte influência boliviana na cultura local',
        'Portal para safáris no Pantanal (onças, jacarés, aves)',
        'Pesca esportiva e ecoturismo nas regiões de Miranda e Aquidauana',
        'Forte Coimbra e Estrada Parque do Pantanal',
      ],
    },
    'Campo Grande': {
      tagline: 'Cidade Morena — capital com parques, gastronomia e cultura',
      highlights: [
        'Parque das Nações Indígenas — maior parque urbano da cidade',
        'Feira Central — sobá, artesanato e música ao vivo',
        'Bioparque Pantanal — aquário de água doce',
        'Mercadão Municipal e Memorial da Cultura Indígena',
      ],
    },
    Bonito: {
      tagline: 'Capital do ecoturismo com águas cristalinas',
      highlights: [
        'Flutuação no Rio Sucuri e Gruta do Lago Azul',
        'Buraco das Araras e Rio da Prata',
        'Centro de Atendimento ao Turista para agendamento de passeios',
      ],
    },
  };

  static extractCityFromQuestion(question: string): string | null {
    const q = this.normalizeSearchText(question);
    for (const [key, label] of Object.entries(this.KNOWN_CITIES)) {
      if (q.includes(key)) return label;
    }
    const m = q.match(
      /(?:que\s+)?(?:fazer|visitar|conhecer|comer|ficar|hospedar).{0,40}?\b(?:em|no|na)\s+([a-z\s]{3,30})/,
    );
    if (m?.[1]) {
      const raw = m[1].trim().split(/\s+/).slice(0, 3).join(' ');
      for (const [key, label] of Object.entries(this.KNOWN_CITIES)) {
        if (raw.includes(key) || key.includes(raw)) return label;
      }
    }
    return null;
  }

  static formatCityGuideResponse(city: string): string {
    const guide = this.CITY_GUIDES[city];
    const places = this.getLocationsByCity(city).filter((p) => p.category === 'atracao');
    const openings = [
      `🦦 ${city} é demais! Deixa eu te contar o que fazer por lá:`,
      `🦦 Que legal que você quer explorar ${city}! Olha só:`,
      `🦦 ${city} tem muito a oferecer — aqui vão ideias para sua visita:`,
    ];
    const opening = openings[Math.floor(Math.random() * openings.length)];

    const bullets: string[] = [];
    if (guide) {
      bullets.push(guide.tagline);
      for (const h of guide.highlights) {
        if (bullets.length >= 6) break;
        bullets.push(h);
      }
    }
    for (const place of places) {
      if (bullets.length >= 6) break;
      const short = place.name.replace(/\s*\([^)]*\)/, '').trim();
      const hint = place.description.split(/[.!?]/)[0]?.trim();
      if (hint && !bullets.some((b) => b.includes(short))) {
        bullets.push(`${short} — ${hint.length > 100 ? `${hint.slice(0, 97)}...` : hint}`);
      }
    }

    const items = bullets
      .slice(0, 6)
      .map((b) => `• ${b.replace(/^•\s*/, '')}`)
      .join('\n');

    return `${opening}\n\n${items}\n\nQuer roteiro, melhor época ou como chegar em ${city}?`;
  }

  /** Ponto de entrada: tópicos → cidade → lugar específico (match forte). */
  static answerForQuestion(question: string): string | null {
    const topicAnswer = matchMSKnowledgeTopic(question);
    if (topicAnswer) return topicAnswer;

    const city = this.extractCityFromQuestion(question);
    if (city && /fazer|visitar|conhecer|passeio|roteiro|pontos|atracoes|atrações|comer|ficar/i.test(question)) {
      return this.formatCityGuideResponse(city);
    }
    const hits = this.searchLocations(question);
    if (hits.length === 0) return null;
    const terms = this.normalizeSearchText(question)
      .split(/\s+/)
      .filter((t) => t.length > 1 && !this.SEARCH_STOPWORDS.has(t));
    const { score, specificHits } = this.scoreLocationMatch(hits[0], terms);
    if (specificHits < 1 && score < 4) return null;
    return this.formatGuataChatResponse(hits[0]);
  }

  private static scoreLocationMatch(
    location: MSLocation,
    terms: string[],
  ): { score: number; specificHits: number } {
    const searchText = this.normalizeSearchText(`
      ${location.name}
      ${location.description}
      ${location.city}
      ${location.tags.join(' ')}
    `);
    const nameText = this.normalizeSearchText(location.name);
    const cityText = this.normalizeSearchText(location.city);

    let score = 0;
    let specificHits = 0;

    for (const term of terms) {
      if (this.SEARCH_STOPWORDS.has(term)) continue;
      if (!this.termMatchesInText(searchText, term)) continue;
      score += 1;
      if (term.length >= 4) specificHits += 1;
      if (this.termMatchesInText(nameText, term)) score += 3;
      if (this.termMatchesInText(cityText, term)) score += 5;
    }

    return { score, specificHits };
  }

  static searchLocations(query: string, category?: string): MSLocation[] {
    const city = this.extractCityFromQuestion(query);
    const searchTerms = this.normalizeSearchText(query)
      .split(/\s+/)
      .filter((t) => t.length > 1 && !this.SEARCH_STOPWORDS.has(t));

    if (searchTerms.length === 0 && !city) return [];

    let filteredLocations = this.VERIFIED_LOCATIONS;

    if (category) {
      filteredLocations = filteredLocations.filter((loc) => loc.category === category);
    }

    const scored = filteredLocations
      .map((location) => ({
        location,
        ...this.scoreLocationMatch(location, searchTerms),
        cityBoost: city && location.city === city ? 20 : 0,
      }))
      .filter(
        ({ score, specificHits, cityBoost }) =>
          cityBoost > 0 || specificHits >= 1 || score >= 3,
      )
      .sort((a, b) => {
        if (b.cityBoost !== a.cityBoost) return b.cityBoost - a.cityBoost;
        if (b.score !== a.score) return b.score - a.score;
        return b.location.confidence - a.location.confidence;
      });

    return scored.map((s) => s.location);
  }

  /**
   * Obter informações detalhadas de um local
   */
  static getLocationDetails(locationId: string): MSLocation | null {
    return this.VERIFIED_LOCATIONS.find(loc => loc.id === locationId) || null;
  }

  /**
   * Buscar por cidade
   */
  static getLocationsByCity(city: string): MSLocation[] {
    return this.VERIFIED_LOCATIONS.filter(loc => 
      loc.city.toLowerCase().includes(city.toLowerCase())
    );
  }

  /**
   * Buscar por categoria
   */
  static getLocationsByCategory(category: string): MSLocation[] {
    return this.VERIFIED_LOCATIONS.filter(loc => loc.category === category);
  }

  /**
   * Resposta no tom do Guatá (chat): abertura + itens + pergunta final.
   * Usado quando a IA está indisponível mas temos o lugar na base local.
   */
  static formatGuataChatResponse(location: MSLocation): string {
    const shortName = location.name.replace(/\s*\([^)]*\)/, '').trim();
    const isIndigenous =
      location.tags.some((t) => /indigen/i.test(t)) ||
      /aldeia|terena|comunidade/i.test(location.name);

    const openings = isIndigenous
      ? [
          `🦦 A ${shortName} é uma experiência linda de cultura viva em ${location.city}!`,
          `🦦 Que pergunta especial! A ${shortName}, em ${location.city}, é turismo de base comunitária conduzido pelos moradores.`,
        ]
      : location.category === 'atracao'
        ? [
            `🦦 ${shortName} é um destaque em ${location.city} — deixa eu te contar!`,
            `🦦 Que legal que você quer saber sobre ${shortName} em ${location.city}!`,
          ]
        : [
            `🦦 Sobre ${shortName} em ${location.city}, aqui vai o que é bom saber:`,
            `🦦 Que bom que você perguntou sobre ${shortName}!`,
          ];

    const opening = openings[Math.floor(Math.random() * openings.length)];
    const bullets: string[] = [];

    const sentences = location.description
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 15);

    for (const sentence of sentences) {
      if (bullets.length >= 4) break;
      const line = sentence.length > 130 ? `${sentence.slice(0, 127).trim()}...` : sentence;
      bullets.push(line);
    }

    if (location.hours) {
      const h = location.hours;
      if (!bullets.some((b) => b.includes(h.slice(0, Math.min(25, h.length))))) {
        bullets.push(h);
      }
    }

    if (location.price_range) {
      const p = location.price_range;
      if (/consultar/i.test(p)) {
        bullets.push('Valores e vagas: confirme ao agendar');
      } else if (!bullets.some((b) => b.toLowerCase().includes('valor') || b.toLowerCase().includes('preço'))) {
        bullets.push(p);
      }
    }

    if (location.contact?.phone) {
      bullets.push(
        /agendar/i.test(location.contact.phone)
          ? location.contact.phone
          : `Contato: ${location.contact.phone}`,
      );
    }

    const items = bullets
      .slice(0, 6)
      .map((b) => `• ${b.replace(/^•\s*/, '')}`)
      .join('\n');

    const followUps = isIndigenous
      ? [
          'Quer combinar com Pantanal, saber como agendar ou montar um roteiro pela região?',
          'Posso te ajudar com como chegar ou o que levar para a visita?',
        ]
      : [
          'Quer saber como chegar, melhor época ou combinar com outros roteiros da região?',
          'Posso te ajudar com mais detalhes ou destinos perto?',
        ];

    const followUp = followUps[Math.floor(Math.random() * followUps.length)];
    return `${opening}\n\n${items}\n\n${followUp}`;
  }

  /**
   * Ficha técnica (uso interno / admin) — não é o formato do chat Guatá.
   */
  static formatLocationResponse(location: MSLocation): string {
    const parts = [
      `📍 **${location.name}** - ${location.city}`,
      `📝 ${location.description}`,
    ];
    
    if (location.address) {
      parts.push(`🏠 **Endereço:** ${location.address}`);
    }
    
    if (location.hours) {
      parts.push(`🕒 **Horários:** ${location.hours}`);
    }
    
    if (location.price_range) {
      parts.push(`💰 **Preços:** ${location.price_range}`);
    }
    
    if (location.contact?.phone) {
      parts.push(`📞 **Contato:** ${location.contact.phone}`);
    }
    
    if (location.contact?.website) {
      parts.push(`🌐 **Site:** ${location.contact.website}`);
    }
    
    if (location.accessibility) {
      parts.push(`♿ **Acessibilidade:** ${location.accessibility}`);
    }
    
    parts.push(`✅ **Informação verificada em:** ${location.last_verified}`);
    
    return parts.join('\n');
  }

  /**
   * Validar se um local ainda está ativo/aberto
   */
  static isLocationActive(location: MSLocation): boolean {
    const lastVerified = new Date(location.last_verified);
    const now = new Date();
    const daysDiff = (now.getTime() - lastVerified.getTime()) / (1000 * 3600 * 24);
    
    // Considerar ativo se verificado nos últimos 30 dias
    return daysDiff <= 30 && location.confidence >= 0.75;
  }

  /**
   * Obter sugestões por proximidade (se coordenadas disponíveis)
   */
  static getNearbyLocations(lat: number, lng: number, radius: number = 50): MSLocation[] {
    return this.VERIFIED_LOCATIONS.filter(location => {
      if (!location.coordinates) return false;
      
      const distance = this.calculateDistance(
        lat, lng, 
        location.coordinates.lat, 
        location.coordinates.lng
      );
      
      return distance <= radius;
    });
  }

  /**
   * Calcular distância entre coordenadas (fórmula haversine)
   */
  private static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}
