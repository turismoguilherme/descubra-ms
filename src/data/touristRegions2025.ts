// Regiões Turísticas Oficiais do Mato Grosso do Sul - 2025
// Fonte: Secretaria de Estado de Turismo, Esporte e Cultura (SETESC)
// Manual Informativo Regionalização do Turismo MS 2025

export interface TouristRegion2025 {
  id: string;
  name: string;
  slug: string;
  color: string;
  colorHover: string;
  description: string;
  cities: string[];
  highlights: string[];
  image: string;
}

export const touristRegions2025: TouristRegion2025[] = [
  {
    id: "pantanal",
    name: "Pantanal",
    slug: "pantanal",
    color: "#FFCA28", // Amarelo-mostarda
    colorHover: "#FFB300",
    description: "A maior planície alagável do mundo, santuário de vida selvagem com onças-pintadas, ariranhas e mais de 650 espécies de aves.",
    cities: ["Corumbá", "Ladário", "Aquidauana", "Miranda", "Anastácio"],
    highlights: ["Safari fotográfico", "Pesca esportiva", "Observação de fauna", "Passeios de barco"],
    image: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800"
  },
  {
    id: "bonito-serra-bodoquena",
    name: "Bonito-Serra da Bodoquena",
    slug: "bonito-serra-bodoquena",
    color: "#4FC3F7", // Azul-claro
    colorHover: "#29B6F6",
    description: "Paraíso do ecoturismo com rios de águas cristalinas, grutas, cachoeiras e flutuação em meio à natureza preservada.",
    cities: ["Bonito", "Jardim", "Bodoquena", "Guia Lopes da Laguna", "Nioaque", "Porto Murtinho", "Bela Vista"],
    highlights: ["Flutuação", "Mergulho em grutas", "Cachoeiras", "Balneários"],
    image: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800"
  },
  {
    id: "campo-grande-ipes",
    name: "Campo Grande dos Ipês",
    slug: "campo-grande-ipes",
    color: "#7E57C2", // Roxo
    colorHover: "#673AB7",
    description: "A capital sul-mato-grossense, cidade planejada com amplas avenidas, rica gastronomia e atrativos culturais.",
    cities: ["Campo Grande", "Terenos", "Sidrolândia", "Nova Alvorada do Sul", "Rochedo", "Corguinho", "Rio Negro", "Jaraguari", "Ribas do Rio Pardo"],
    highlights: ["Gastronomia regional", "Parques urbanos", "Museus", "Feiras e eventos"],
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800"
  },
  {
    id: "caminhos-fronteira",
    name: "Caminhos da Fronteira",
    slug: "caminhos-fronteira",
    color: "#8D6E63", // Marrom
    colorHover: "#6D4C41",
    description: "Região de fronteira com Paraguai, rica em cultura, história e comércio internacional.",
    cities: ["Ponta Porã", "Antônio João", "Aral Moreira", "Coronel Sapucaia", "Paranhos", "Sete Quedas", "Caracol", "Amambai"],
    highlights: ["Compras", "Gastronomia de fronteira", "Turismo histórico", "Cultura guarani"],
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"
  },
  {
    id: "caminhos-natureza-cone-sul",
    name: "Caminhos da Natureza-Cone Sul",
    slug: "caminhos-natureza-cone-sul",
    color: "#FF9800", // Laranja
    colorHover: "#F57C00",
    description: "Natureza exuberante no extremo sul do estado, com rios, cachoeiras e rica biodiversidade.",
    cities: ["Naviraí", "Eldorado", "Mundo Novo", "Iguatemi", "Itaquiraí", "Japorã", "Tacuru", "Sete Quedas"],
    highlights: ["Cachoeiras", "Rios para banho", "Pesca", "Turismo rural"],
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800"
  },
  {
    id: "celeiro-ms",
    name: "Celeiro do MS",
    slug: "celeiro-ms",
    color: "#CE93D8", // Lilás
    colorHover: "#BA68C8",
    description: "Região de forte produção agrícola, com turismo rural e eventos ligados ao agronegócio.",
    cities: ["Dourados", "Maracaju", "Rio Brilhante", "Itaporã", "Douradina", "Fátima do Sul", "Vicentina", "Caarapó", "Laguna Carapã", "Juti", "Deodápolis", "Glória de Dourados"],
    highlights: ["Turismo rural", "Agroturismo", "Eventos country", "Gastronomia regional"],
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800"
  },
  {
    id: "costa-leste",
    name: "Costa Leste",
    slug: "costa-leste",
    color: "#EF5350", // Vermelho
    colorHover: "#E53935",
    description: "Região banhada pelo Rio Paraná, com praias de água doce e desenvolvimento econômico.",
    cities: ["Três Lagoas", "Aparecida do Taboado", "Paranaíba", "Cassilândia", "Inocência", "Selvíria", "Brasilândia", "Santa Rita do Pardo", "Água Clara"],
    highlights: ["Praias fluviais", "Pesca esportiva", "Esportes náuticos", "Turismo de negócios"],
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800"
  },
  {
    id: "rota-cerrado-pantanal",
    name: "Rota Cerrado Pantanal",
    slug: "rota-cerrado-pantanal",
    color: "#66BB6A", // Verde
    colorHover: "#43A047",
    description: "Transição entre o Cerrado e o Pantanal, com paisagens únicas e rica biodiversidade.",
    cities: ["Coxim", "São Gabriel do Oeste", "Rio Verde de Mato Grosso", "Camapuã", "Pedro Gomes", "Sonora", "Costa Rica", "Alcinópolis", "Figueirão", "Chapadão do Sul"],
    highlights: ["Pesca", "Cachoeiras", "Turismo ecológico", "Observação de aves"],
    image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800"
  },
  {
    id: "vale-das-aguas",
    name: "Vale das Águas",
    slug: "vale-das-aguas",
    color: "#42A5F5", // Azul
    colorHover: "#1E88E5",
    description: "Região rica em recursos hídricos, com rios e cachoeiras ideais para o turismo de aventura.",
    cities: ["Nova Andradina", "Ivinhema", "Batayporã", "Taquarussu", "Novo Horizonte do Sul", "Anaurilândia", "Bataguassu"],
    highlights: ["Cachoeiras", "Rios", "Pesca", "Turismo de aventura"],
    image: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800"
  }
];

// Função para buscar região por slug
export const getRegionBySlug = (slug: string): TouristRegion2025 | undefined => {
  return touristRegions2025.find(region => region.slug === slug);
};

// Função para buscar região por cidade
export const getRegionByCity = (cityName: string): TouristRegion2025 | undefined => {
  return touristRegions2025.find(region => 
    region.cities.some(city => city.toLowerCase() === cityName.toLowerCase())
  );
};

// Cores para uso no mapa SVG (baseadas no mapa oficial de 2022/2025)
export const regionColors = {
  pantanal: { fill: "#FFCA28", hover: "#FFB300" },                         // Amarelo-mostarda
  "bonito-serra-bodoquena": { fill: "#4FC3F7", hover: "#29B6F6" },        // Azul-claro
  "campo-grande-ipes": { fill: "#7E57C2", hover: "#673AB7" },             // Roxo
  "caminhos-fronteira": { fill: "#8D6E63", hover: "#6D4C41" },            // Marrom
  "caminhos-natureza-cone-sul": { fill: "#FF9800", hover: "#F57C00" },    // Laranja
  "celeiro-ms": { fill: "#CE93D8", hover: "#BA68C8" },                    // Lilás
  "costa-leste": { fill: "#EF5350", hover: "#E53935" },                   // Vermelho
  "rota-cerrado-pantanal": { fill: "#66BB6A", hover: "#43A047" },         // Verde
  "vale-das-aguas": { fill: "#42A5F5", hover: "#1E88E5" }                 // Azul
};

