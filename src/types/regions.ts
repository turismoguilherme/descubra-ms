// Tipos para as regiões turísticas do MS

export interface TourismRegion {
  id: string;
  name: string;
  slug: string;
  description: string;
  cities: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface MSRegion extends TourismRegion {
  // Propriedades específicas do MS
  state: 'MS';
  tourism_type: 'ecoturismo' | 'turismo_rural' | 'turismo_urbano' | 'turismo_aventura' | 'turismo_cultural' | 'turismo_fronteira';
  highlights: string[];
  best_season: string[];
  accessibility_info?: string;
}

// Configuração das 10 regiões do MS
export const MS_REGIONS: Omit<MSRegion, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    name: 'Bonito / Serra da Bodoquena',
    slug: 'bonito-serra-bodoquena',
    description: 'Região conhecida por suas águas cristalinas, grutas e cachoeiras. Destino principal para ecoturismo e turismo de aventura.',
    cities: ['Bonito', 'Bodoquena', 'Jardim', 'Bela Vista', 'Caracol', 'Guia Lopes da Laguna', 'Nioaque', 'Porto Murtinho'],
    coordinates: { lat: -21.1261, lng: -56.4846 },
    state: 'MS',
    tourism_type: 'ecoturismo',
    highlights: ['Grutas', 'Cachoeiras', 'Rios cristalinos', 'Flutuação', 'Rapel'],
    best_season: ['Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro']
  },
  {
    name: 'Pantanal',
    slug: 'pantanal',
    description: 'Maior planície alagada do mundo, rica em biodiversidade. Ideal para observação de fauna e flora, pesca esportiva e turismo rural.',
    cities: ['Corumbá', 'Aquidauana', 'Miranda', 'Anastácio', 'Ladário'],
    coordinates: { lat: -19.0084, lng: -57.6517 },
    state: 'MS',
    tourism_type: 'turismo_rural',
    highlights: ['Observação de fauna', 'Pesca esportiva', 'Passeios de barco', 'Fazendas históricas'],
    best_season: ['Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro']
  },
  {
    name: 'Caminho dos Ipês',
    slug: 'caminho-ipes',
    description: 'Rota turística que conecta Campo Grande às principais cidades do estado, conhecida pela beleza dos ipês amarelos na primavera.',
    cities: ['Campo Grande', 'Corguinho', 'Dois Irmãos do Buriti', 'Jaraguari', 'Nova Alvorada do Sul', 'Ribas do Rio Pardo', 'Rio Negro', 'Sidrolândia', 'Terenos'],
    coordinates: { lat: -20.4486, lng: -54.6295 },
    state: 'MS',
    tourism_type: 'turismo_urbano',
    highlights: ['Ipês amarelos', 'Gastronomia', 'Cultura urbana', 'Parques'],
    best_season: ['Setembro', 'Outubro', 'Novembro']
  },
  {
    name: 'Rota Norte',
    slug: 'rota-norte',
    description: 'Região de transição entre Cerrado e Pantanal, com destaque para o turismo rural, pesca e ecoturismo.',
    cities: ['Alcinópolis', 'Bandeirantes', 'Camapuã', 'Costa Rica', 'Coxim', 'Figueirão', 'Paraíso das Águas', 'Pedro Gomes', 'Rio Verde de Mato Grosso', 'São Gabriel do Oeste', 'Sonora'],
    coordinates: { lat: -18.5122, lng: -54.6365 },
    state: 'MS',
    tourism_type: 'turismo_rural',
    highlights: ['Pesca esportiva', 'Turismo rural', 'Cerrado', 'Rios'],
    best_season: ['Abril', 'Maio', 'Junho', 'Julho', 'Agosto']
  },
  {
    name: 'Costa Leste',
    slug: 'costa-leste',
    description: 'Região banhada pelo Rio Paraná, com destaque para pesca esportiva, turismo náutico e belezas naturais.',
    cities: ['Água Clara', 'Anaurilândia', 'Aparecida do Taboado', 'Bataguassu', 'Brasilândia', 'Selvíria', 'Três Lagoas'],
    coordinates: { lat: -20.4486, lng: -51.5522 },
    state: 'MS',
    tourism_type: 'turismo_aventura',
    highlights: ['Pesca esportiva', 'Turismo náutico', 'Rio Paraná', 'Praias fluviais'],
    best_season: ['Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto']
  },
  {
    name: 'Grande Dourados',
    slug: 'grande-dourados',
    description: 'Região multicultural com forte influência indígena e de imigrantes. Destaque para gastronomia, cultura e turismo urbano.',
    cities: ['Caarapó', 'Dourados', 'Fátima do Sul', 'Itaporã', 'Laguna Carapã', 'Ponta Porã'],
    coordinates: { lat: -22.2208, lng: -54.8121 },
    state: 'MS',
    tourism_type: 'turismo_cultural',
    highlights: ['Cultura indígena', 'Gastronomia', 'Universidades', 'Comércio'],
    best_season: ['Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro']
  },
  {
    name: 'Sete Caminhos da Natureza / Cone Sul',
    slug: 'sete-caminhos-natureza',
    description: 'Região de fronteira com o Paraguai, conhecida por suas belezas naturais, cachoeiras e turismo de aventura.',
    cities: ['Eldorado', 'Iguatemi', 'Itaquiraí', 'Japorã', 'Mundo Novo', 'Naviraí'],
    coordinates: { lat: -23.1106, lng: -54.2483 },
    state: 'MS',
    tourism_type: 'turismo_aventura',
    highlights: ['Cachoeiras', 'Turismo de aventura', 'Fronteira', 'Natureza'],
    best_season: ['Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro']
  },
  {
    name: 'Vale das Águas',
    slug: 'vale-aguas',
    description: 'Região rica em recursos hídricos, com destaque para pesca esportiva, turismo rural e ecoturismo.',
    cities: ['Angélica', 'Batayporã', 'Ivinhema', 'Jateí', 'Nova Andradina', 'Novo Horizonte do Sul', 'Taquarussu'],
    coordinates: { lat: -22.2308, lng: -53.3441 },
    state: 'MS',
    tourism_type: 'turismo_rural',
    highlights: ['Pesca esportiva', 'Rios', 'Turismo rural', 'Recursos hídricos'],
    best_season: ['Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto']
  },
  {
    name: 'Vale do Aporé',
    slug: 'vale-apore',
    description: 'Região de fronteira com Goiás, conhecida por suas paisagens naturais e turismo rural.',
    cities: ['Cassilândia', 'Inocência', 'Paranaíba'],
    coordinates: { lat: -19.1136, lng: -51.7342 },
    state: 'MS',
    tourism_type: 'turismo_rural',
    highlights: ['Paisagens naturais', 'Turismo rural', 'Fronteira com Goiás'],
    best_season: ['Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro']
  },
  {
    name: 'Caminho da Fronteira',
    slug: 'caminho-fronteira',
    description: 'Região de fronteira com o Paraguai, com destaque para o turismo de compras, cultura e história.',
    cities: ['Amambai', 'Aral Moreira', 'Coronel Sapucaia', 'Paranhos', 'Sete Quedas'],
    coordinates: { lat: -23.1056, lng: -55.2253 },
    state: 'MS',
    tourism_type: 'turismo_fronteira',
    highlights: ['Turismo de compras', 'Fronteira', 'Cultura paraguaia', 'História'],
    best_season: ['Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro']
  }
];

// Hook para gerenciar regiões
export interface UseRegionsReturn {
  regions: TourismRegion[];
  loading: boolean;
  error: string | null;
  getRegionBySlug: (slug: string) => TourismRegion | undefined;
  getRegionsByCity: (city: string) => TourismRegion[];
  getRegionsByType: (type: MSRegion['tourism_type']) => MSRegion[];
} 