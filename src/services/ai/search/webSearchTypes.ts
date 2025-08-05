// Tipos para o sistema de busca web do Guatá

export interface TrustedSource {
  name: string;
  domain: string;
  priority: number;
  category: 'official' | 'tourism' | 'news' | 'business';
}

export interface ValidatedSearchResult {
  title: string;
  content?: string;
  url: string;
  snippet?: string;
  lastUpdated: string;
  confidence: number;
  category: string;
  isFromTrustedSource?: boolean;
  source?: any;
  isVerified?: boolean;
}

export interface SearchCacheEntry {
  query: string;
  results: ValidatedSearchResult[];
  timestamp: number;
}

export interface WebSearchResult {
  title: string;
  content: string;
  url: string;
  snippet?: string;
  lastUpdated?: string;
}

// Fontes confiáveis para turismo em MS
export const TRUSTED_SOURCES: TrustedSource[] = [
  // Fontes oficiais
  {
    name: 'Fundtur-MS',
    domain: 'fundtur.ms',
    priority: 10,
    category: 'official'
  },
  {
    name: 'Governo MS',
    domain: 'ms.gov.br',
    priority: 9,
    category: 'official'
  },
  {
    name: 'Prefeitura de Campo Grande',
    domain: 'cgms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Bonito',
    domain: 'bonito.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Corumbá',
    domain: 'corumba.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Dourados',
    domain: 'dourados.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Três Lagoas',
    domain: 'treslagoas.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Aquidauana',
    domain: 'aquidauana.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Coxim',
    domain: 'coxim.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Miranda',
    domain: 'miranda.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Ladário',
    domain: 'ladario.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Anastácio',
    domain: 'anastacio.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Bodoquena',
    domain: 'bodoquena.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Jardim',
    domain: 'jardim.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Nioaque',
    domain: 'nioaque.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Porto Murtinho',
    domain: 'portomurtinho.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Rio Verde',
    domain: 'rioverde.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Terenos',
    domain: 'terenos.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Sidrolândia',
    domain: 'sidrolandia.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Nova Andradina',
    domain: 'novaandradina.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Naviraí',
    domain: 'navirai.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Ponta Porã',
    domain: 'pontapora.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Amambai',
    domain: 'amambai.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Iguatemi',
    domain: 'iguatemi.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Mundo Novo',
    domain: 'mundonovo.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Eldorado',
    domain: 'eldorado.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Itaquiraí',
    domain: 'itaquirai.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Japorã',
    domain: 'japora.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Sete Quedas',
    domain: 'setequedas.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Tacuru',
    domain: 'tacuru.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Aral Moreira',
    domain: 'aralmoreira.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Coronel Sapucaia',
    domain: 'coronelsapucaia.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Paranhos',
    domain: 'paranhos.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Juti',
    domain: 'juti.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Jateí',
    domain: 'jatei.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Caarapó',
    domain: 'caarapo.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Fátima do Sul',
    domain: 'fatimadosul.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Vicentina',
    domain: 'vicentina.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Glória de Dourados',
    domain: 'gloriadedourados.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Deodápolis',
    domain: 'deodapolis.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Maracaju',
    domain: 'maracaju.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Rio Brilhante',
    domain: 'riobrilhante.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Douradina',
    domain: 'douradina.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Itaporã',
    domain: 'itapora.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Angélica',
    domain: 'angelica.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Ivinhema',
    domain: 'ivinhema.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Nova Alvorada do Sul',
    domain: 'novaalvoradadosul.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Bataguassu',
    domain: 'bataguassu.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Anaurilândia',
    domain: 'anaurilandia.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Batayporã',
    domain: 'bataypora.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Taquarussu',
    domain: 'taquarussu.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Brasilândia',
    domain: 'brasilandia.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Corguinho',
    domain: 'corguinho.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Rochedo',
    domain: 'rochedo.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Bandeirantes',
    domain: 'bandeirantes.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Jaraguari',
    domain: 'jaraguari.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Ribas do Rio Pardo',
    domain: 'ribasdoriopardo.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Água Clara',
    domain: 'aguaclara.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Camapuã',
    domain: 'camapua.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Costa Rica',
    domain: 'costarica.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Chapadão do Sul',
    domain: 'chapadaodosul.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Paraíso das Águas',
    domain: 'paraisodasaguas.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Alcinópolis',
    domain: 'alcinopolis.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Sonora',
    domain: 'sonora.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Pedro Gomes',
    domain: 'pedrogomes.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Rio Negro',
    domain: 'rionegro.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Bela Vista',
    domain: 'belavista.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Caracol',
    domain: 'caracol.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Guia Lopes da Laguna',
    domain: 'guialopesdalaguna.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Nossa Senhora de Fátima',
    domain: 'nossasenhoradefatima.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Antônio João',
    domain: 'antoniojoao.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Laguna Carapã',
    domain: 'lagunacarapa.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Japorã',
    domain: 'japora.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Sete Quedas',
    domain: 'setequedas.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Tacuru',
    domain: 'tacuru.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Aral Moreira',
    domain: 'aralmoreira.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Coronel Sapucaia',
    domain: 'coronelsapucaia.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Paranhos',
    domain: 'paranhos.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Juti',
    domain: 'juti.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Jateí',
    domain: 'jatei.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Caarapó',
    domain: 'caarapo.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Fátima do Sul',
    domain: 'fatimadosul.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Vicentina',
    domain: 'vicentina.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Glória de Dourados',
    domain: 'gloriadedourados.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Deodápolis',
    domain: 'deodapolis.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Maracaju',
    domain: 'maracaju.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Rio Brilhante',
    domain: 'riobrilhante.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Douradina',
    domain: 'douradina.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Itaporã',
    domain: 'itapora.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Angélica',
    domain: 'angelica.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Ivinhema',
    domain: 'ivinhema.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Nova Alvorada do Sul',
    domain: 'novaalvoradadosul.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Bataguassu',
    domain: 'bataguassu.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Anaurilândia',
    domain: 'anaurilandia.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Batayporã',
    domain: 'bataypora.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Taquarussu',
    domain: 'taquarussu.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Brasilândia',
    domain: 'brasilandia.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Corguinho',
    domain: 'corguinho.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Rochedo',
    domain: 'rochedo.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Bandeirantes',
    domain: 'bandeirantes.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Jaraguari',
    domain: 'jaraguari.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Ribas do Rio Pardo',
    domain: 'ribasdoriopardo.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Água Clara',
    domain: 'aguaclara.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Camapuã',
    domain: 'camapua.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Costa Rica',
    domain: 'costarica.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Chapadão do Sul',
    domain: 'chapadaodosul.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Paraíso das Águas',
    domain: 'paraisodasaguas.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Alcinópolis',
    domain: 'alcinopolis.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Sonora',
    domain: 'sonora.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Pedro Gomes',
    domain: 'pedrogomes.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Rio Negro',
    domain: 'rionegro.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Bela Vista',
    domain: 'belavista.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Caracol',
    domain: 'caracol.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Guia Lopes da Laguna',
    domain: 'guialopesdalaguna.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Nossa Senhora de Fátima',
    domain: 'nossasenhoradefatima.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Antônio João',
    domain: 'antoniojoao.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  {
    name: 'Prefeitura de Laguna Carapã',
    domain: 'lagunacarapa.ms.gov.br',
    priority: 8,
    category: 'official'
  },
  // Fontes de turismo
  {
    name: 'Descubra MS',
    domain: 'descubrams.com.br',
    priority: 7,
    category: 'tourism'
  },
  {
    name: 'Bonito MS',
    domain: 'bonito.ms.gov.br',
    priority: 7,
    category: 'tourism'
  },
  {
    name: 'Pantanal MS',
    domain: 'pantanal.ms.gov.br',
    priority: 7,
    category: 'tourism'
  },
  {
    name: 'Turismo MS',
    domain: 'turismo.ms.gov.br',
    priority: 7,
    category: 'tourism'
  },
  // Fontes de notícias
  {
    name: 'G1 MS',
    domain: 'g1.globo.com',
    priority: 6,
    category: 'news'
  },
  {
    name: 'Campo Grande News',
    domain: 'campograndenews.com.br',
    priority: 6,
    category: 'news'
  },
  {
    name: 'Midiamax',
    domain: 'midiamax.com.br',
    priority: 6,
    category: 'news'
  },
  {
    name: 'Correio do Estado',
    domain: 'correiodoestado.com.br',
    priority: 6,
    category: 'news'
  },
  // Fontes de negócios
  {
    name: 'Sebrae MS',
    domain: 'sebrae.com.br',
    priority: 5,
    category: 'business'
  },
  {
    name: 'Sistema FIEMS',
    domain: 'fiems.com.br',
    priority: 5,
    category: 'business'
  }
]; 
