
// Regiões turísticas oficiais do Mato Grosso do Sul com coordenadas corrigidas
export const regioesTuristicas = [
  { id: 1, nome: "Pantanal", cor: "#228B22", lat: -18.5, lng: -56.5 },
  { id: 2, nome: "Bonito/Serra da Bodoquena", cor: "#1E90FF", lat: -21.1, lng: -56.5 },
  { id: 3, nome: "Campo Grande e Região", cor: "#FF6347", lat: -20.5, lng: -54.6 },
  { id: 4, nome: "Corumbá", cor: "#FFD700", lat: -19.0, lng: -57.6 },
  { id: 5, nome: "Costa Leste", cor: "#FF4500", lat: -20.5, lng: -51.5 },
  { id: 6, nome: "Caminhos da Fronteira", cor: "#32CD32", lat: -22.5, lng: -55.7 },
  { id: 7, nome: "Grande Dourados", cor: "#9370DB", lat: -22.2, lng: -54.8 },
  { id: 8, nome: "Cerrado Pantanal", cor: "#8FBC8F", lat: -18.7, lng: -54.5 },
  { id: 9, nome: "Cone Sul", cor: "#DA70D6", lat: -23.2, lng: -54.2 },
  { id: 10, nome: "Portal Sul", cor: "#FF69B4", lat: -22.8, lng: -53.8 },
  { id: 11, nome: "Rota das Águas", cor: "#00CED1", lat: -20.8, lng: -56.2 },
  { id: 12, nome: "Serra de Maracaju", cor: "#4682B4", lat: -20.8, lng: -55.2 }
];

// Destinos expandidos por região turística
export const destinos = [
  // Pantanal
  { id: 1, nome: "Corumbá", regiao: "Pantanal", lat: -19.0094, lng: -57.6534 },
  { id: 2, nome: "Aquidauana", regiao: "Pantanal", lat: -20.4697, lng: -55.7868 },
  { id: 3, nome: "Miranda", regiao: "Pantanal", lat: -20.2378, lng: -56.3966 },
  { id: 4, nome: "Anastácio", regiao: "Pantanal", lat: -20.4889, lng: -55.8017 },
  { id: 5, nome: "Nioaque", regiao: "Pantanal", lat: -21.1384, lng: -55.8269 },
  
  // Bonito/Serra da Bodoquena
  { id: 6, nome: "Bonito", regiao: "Bonito/Serra da Bodoquena", lat: -21.1268, lng: -56.4844 },
  { id: 7, nome: "Jardim", regiao: "Bonito/Serra da Bodoquena", lat: -21.4816, lng: -56.1403 },
  { id: 8, nome: "Bodoquena", regiao: "Bonito/Serra da Bodoquena", lat: -20.5363, lng: -56.7193 },
  { id: 9, nome: "Guia Lopes da Laguna", regiao: "Bonito/Serra da Bodoquena", lat: -21.4555, lng: -56.0947 },
  { id: 10, nome: "Caracol", regiao: "Bonito/Serra da Bodoquena", lat: -22.7543, lng: -55.7264 },
  
  // Campo Grande e Região
  { id: 11, nome: "Campo Grande", regiao: "Campo Grande e Região", lat: -20.4695, lng: -54.6201 },
  { id: 12, nome: "Sidrolândia", regiao: "Campo Grande e Região", lat: -20.9307, lng: -54.9608 },
  { id: 13, nome: "Nova Alvorada do Sul", regiao: "Campo Grande e Região", lat: -21.4308, lng: -54.3806 },
  { id: 14, nome: "Terenos", regiao: "Campo Grande e Região", lat: -20.4417, lng: -54.8597 },
  { id: 15, nome: "Rochedo", regiao: "Campo Grande e Região", lat: -19.9583, lng: -54.8889 },
  
  // Costa Leste
  { id: 16, nome: "Três Lagoas", regiao: "Costa Leste", lat: -20.7849, lng: -51.7007 },
  { id: 17, nome: "Brasilândia", regiao: "Costa Leste", lat: -21.2553, lng: -52.0364 },
  { id: 18, nome: "Água Clara", regiao: "Costa Leste", lat: -20.4441, lng: -52.8677 },
  { id: 19, nome: "Ribas do Rio Pardo", regiao: "Costa Leste", lat: -20.4442, lng: -53.7575 },
  { id: 20, nome: "Aparecida do Taboado", regiao: "Costa Leste", lat: -20.0897, lng: -51.0958 },
  
  // Grande Dourados
  { id: 21, nome: "Dourados", regiao: "Grande Dourados", lat: -22.2230, lng: -54.8120 },
  { id: 22, nome: "Douradina", regiao: "Grande Dourados", lat: -22.3083, lng: -54.8333 },
  { id: 23, nome: "Fátima do Sul", regiao: "Grande Dourados", lat: -22.3667, lng: -54.5000 },
  { id: 24, nome: "Glória de Dourados", regiao: "Grande Dourados", lat: -22.3500, lng: -54.2167 },
  { id: 25, nome: "Caarapó", regiao: "Grande Dourados", lat: -22.6417, lng: -54.8167 },
  
  // Caminhos da Fronteira
  { id: 26, nome: "Ponta Porã", regiao: "Caminhos da Fronteira", lat: -22.5296, lng: -55.7203 },
  { id: 27, nome: "Antonio João", regiao: "Caminhos da Fronteira", lat: -22.1833, lng: -55.9500 },
  { id: 28, nome: "Bela Vista", regiao: "Caminhos da Fronteira", lat: -22.1083, lng: -56.5167 },
  
  // Cerrado Pantanal
  { id: 29, nome: "Coxim", regiao: "Cerrado Pantanal", lat: -18.5063, lng: -54.7583 },
  { id: 30, nome: "Pedro Gomes", regiao: "Cerrado Pantanal", lat: -18.0997, lng: -54.5553 },
  { id: 31, nome: "São Gabriel do Oeste", regiao: "Cerrado Pantanal", lat: -19.3917, lng: -54.5583 },
  { id: 32, nome: "Sonora", regiao: "Cerrado Pantanal", lat: -17.5667, lng: -54.7500 },
  
  // Cone Sul
  { id: 33, nome: "Naviraí", regiao: "Cone Sul", lat: -23.0647, lng: -54.1889 },
  { id: 34, nome: "Eldorado", regiao: "Cone Sul", lat: -23.7833, lng: -54.2833 },
  { id: 35, nome: "Mundo Novo", regiao: "Cone Sul", lat: -23.9333, lng: -54.2167 },
  { id: 36, nome: "Iguatemi", regiao: "Cone Sul", lat: -23.6783, lng: -54.5556 },
  
  // Portal Sul
  { id: 37, nome: "Ivinhema", regiao: "Portal Sul", lat: -22.3000, lng: -53.8167 },
  { id: 38, nome: "Nova Andradina", regiao: "Portal Sul", lat: -22.2324, lng: -53.3434 },
  { id: 39, nome: "Batayporã", regiao: "Portal Sul", lat: -22.2833, lng: -53.2667 },
  { id: 40, nome: "Anaurilândia", regiao: "Portal Sul", lat: -22.1833, lng: -52.7167 }
];

// CATs expandidos por região
export const cats = [
  {
    id: 1,
    nome: "CAT Campo Grande - Centro",
    endereco: "Av. Afonso Pena, 7000 - Centro",
    horario: "Segunda a Sexta: 8h às 18h, Sábado: 8h às 12h",
    coordenadas: { lat: -20.4697, lng: -54.6201 },
    cidade: "Campo Grande",
    regiao: "Campo Grande e Região",
    telefone: "(67) 3314-3828"
  },
  {
    id: 2,
    nome: "CAT Bonito",
    endereco: "Rua Cel. Pilad Rebuá, 1780 - Centro",
    horario: "Segunda a Domingo: 8h às 18h",
    coordenadas: { lat: -21.1261, lng: -56.4514 },
    cidade: "Bonito",
    regiao: "Bonito/Serra da Bodoquena",
    telefone: "(67) 3255-1850"
  },
  {
    id: 3,
    nome: "CAT Corumbá - Fronteira",
    endereco: "Rua Delamare, 1546 - Centro",
    horario: "Segunda a Sexta: 8h às 18h",
    coordenadas: { lat: -19.0078, lng: -57.6506 },
    cidade: "Corumbá",
    regiao: "Pantanal",
    telefone: "(67) 3234-9434"
  },
  {
    id: 4,
    nome: "CAT Dourados",
    endereco: "Av. Weimar Gonçalves Torres, 825",
    horario: "Segunda a Sexta: 8h às 18h",
    coordenadas: { lat: -22.2210, lng: -54.8011 },
    cidade: "Dourados",
    regiao: "Grande Dourados",
    telefone: "(67) 3411-7670"
  },
  {
    id: 5,
    nome: "CAT Três Lagoas",
    endereco: "Av. Ranulpho Marques Leal, 3484",
    horario: "Segunda a Sexta: 8h às 17h",
    coordenadas: { lat: -20.7849, lng: -51.7007 },
    cidade: "Três Lagoas",
    regiao: "Costa Leste",
    telefone: "(67) 3929-1159"
  },
  {
    id: 6,
    nome: "CAT Ponta Porã - Fronteira",
    endereco: "Rua Guia Lopes, 1009 - Centro",
    horario: "Segunda a Sexta: 8h às 17h",
    coordenadas: { lat: -22.5296, lng: -55.7203 },
    cidade: "Ponta Porã",
    regiao: "Caminhos da Fronteira",
    telefone: "(67) 3431-1648"
  },
  {
    id: 7,
    nome: "CAT Aquidauana - Portal Pantanal",
    endereco: "Rua Manoel Antonio Paes de Barros, 275",
    horario: "Segunda a Sexta: 8h às 17h",
    coordenadas: { lat: -20.4697, lng: -55.7868 },
    cidade: "Aquidauana",
    regiao: "Pantanal",
    telefone: "(67) 3241-4747"
  },
  {
    id: 8,
    nome: "CAT Jardim",
    endereco: "Praça do Rádio, s/n - Centro",
    horario: "Segunda a Sexta: 8h às 17h",
    coordenadas: { lat: -21.4816, lng: -56.1403 },
    cidade: "Jardim",
    regiao: "Bonito/Serra da Bodoquena",
    telefone: "(67) 3251-1733"
  },
  {
    id: 9,
    nome: "CAT Coxim - Cerrado",
    endereco: "Rua 13 de Maio, 1055 - Centro",
    horario: "Segunda a Sexta: 8h às 17h",
    coordenadas: { lat: -18.5063, lng: -54.7583 },
    cidade: "Coxim",
    regiao: "Cerrado Pantanal",
    telefone: "(67) 3291-1484"
  },
  {
    id: 10,
    nome: "CAT Miranda - Estrada Parque",
    endereco: "Praça Barão do Rio Branco, s/n",
    horario: "Segunda a Sexta: 8h às 17h",
    coordenadas: { lat: -20.2378, lng: -56.3966 },
    cidade: "Miranda",
    regiao: "Pantanal",
    telefone: "(67) 3242-1242"
  }
];
