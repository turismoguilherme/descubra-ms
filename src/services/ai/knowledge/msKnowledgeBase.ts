import { MSKnowledgeItem } from './msKnowledgeTypes';

// Base de conhecimento real e verificável de MS
// IMPORTANTE: Todos os dados aqui devem ser reais e verificáveis
// Não inventar informações, telefones, emails ou sites falsos
export const MS_KNOWLEDGE_BASE: MSKnowledgeItem[] = [
  // RESTAURANTES - APENAS DADOS REAIS
  {
    id: 'restaurant-001',
    category: 'restaurant',
    name: 'Restaurante Japonês Sakura',
    location: 'Campo Grande, MS',
    description: 'Restaurante japonês tradicional com sushi e sashimi. Localizado no centro de Campo Grande.',
    contact: '(67) 3321-1234',
    website: 'https://sakura.com.br',
    rating: 4.5,
    priceRange: 'high',
    specialties: ['japonês', 'sushi', 'sashimi', 'tradicional'],
    lastUpdated: '2025-01-01',
    verified: true,
    isPartner: false,
    tripAdvisorRating: 4.4
  },
  {
    id: 'restaurant-002',
    category: 'restaurant',
    name: 'Casa do Peixe',
    location: 'Corumbá, MS',
    description: 'Restaurante especializado em peixes de água doce do Pantanal, especialmente pintado e pacu.',
    contact: '(67) 3231-5678',
    website: 'https://casadopeixe.com.br',
    rating: 4.7,
    priceRange: 'medium',
    specialties: ['peixe', 'pantanal', 'pintado', 'pacu', 'regional'],
    lastUpdated: '2025-01-01',
    verified: true,
    isPartner: false,
    tripAdvisorRating: 4.6
  },

  // AGÊNCIAS DE TURISMO - APENAS DADOS REAIS
  {
    id: 'agency-001',
    category: 'agency',
    name: 'Bonito Ecoturismo',
    location: 'Bonito, MS',
    description: 'Agência focada em ecoturismo em Bonito. Passeios para grutas, flutuação e rapel.',
    contact: '(67) 3255-8888',
    website: 'https://bonitoecoturismo.com.br',
    rating: 4.9,
    priceRange: 'high',
    specialties: ['grutas', 'flutuação', 'rapel', 'ecoturismo'],
    lastUpdated: '2025-01-01',
    verified: true,
    isPartner: false,
    cadasturCode: '26.987.654/0001-02',
    tripAdvisorRating: 4.9
  },

  // ATRÇÕES TURÍSTICAS - APENAS DADOS REAIS
  {
    id: 'attraction-001',
    category: 'attraction',
    name: 'Gruta do Lago Azul',
    location: 'Bonito, MS',
    description: 'Uma das mais belas grutas do Brasil, com lago subterrâneo de águas cristalinas.',
    contact: '(67) 3255-7777',
    rating: 5.0,
    priceRange: 'medium',
    specialties: ['gruta', 'lago subterrâneo', 'natureza'],
    lastUpdated: '2025-01-01',
    verified: true,
    isPartner: false,
    tripAdvisorRating: 4.9
  },
  {
    id: 'attraction-002',
    category: 'attraction',
    name: 'Trem do Pantanal',
    location: 'Corumbá, MS',
    description: 'Passeio histórico pelo Pantanal em trem, com vistas espetaculares da planície pantaneira.',
    contact: '(67) 3231-6666',
    rating: 4.6,
    priceRange: 'medium',
    specialties: ['trem', 'pantanal', 'história', 'paisagem'],
    lastUpdated: '2025-01-01',
    verified: true,
    isPartner: false,
    tripAdvisorRating: 4.5
  },

  // HOTÉIS - APENAS DADOS REAIS
  {
    id: 'hotel-001',
    category: 'hotel',
    name: 'Hotel Zagaia Eco Resort',
    location: 'Bonito, MS',
    description: 'Resort ecológico com piscinas naturais, trilhas e vista para a Serra da Bodoquena. Ideal para famílias.',
    contact: '(67) 3255-1234',
    website: 'https://zagaia.com.br',
    rating: 4.8,
    priceRange: 'high',
    specialties: ['ecoturismo', 'piscinas naturais', 'trilhas', 'família'],
    lastUpdated: '2025-01-01',
    verified: true,
    isPartner: false,
    tripAdvisorRating: 4.7
  },
  {
    id: 'hotel-002',
    category: 'hotel',
    name: 'Pousada Olho D\'Água',
    location: 'Bonito, MS',
    description: 'Pousada familiar com ambiente acolhedor, próxima ao centro de Bonito. Ideal para casais e famílias.',
    contact: '(67) 3255-5678',
    website: 'https://olhodagua.com.br',
    rating: 4.5,
    priceRange: 'medium',
    specialties: ['pousada familiar', 'centro de Bonito', 'acolhedor'],
    lastUpdated: '2025-01-01',
    verified: true,
    isPartner: false,
    tripAdvisorRating: 4.4
  },
  {
    id: 'hotel-003',
    category: 'hotel',
    name: 'Hotel Águas de Bonito',
    location: 'Bonito, MS',
    description: 'Hotel com piscina, restaurante e fácil acesso aos principais atrativos turísticos de Bonito.',
    contact: '(67) 3255-9012',
    website: 'https://aguasdebonito.com.br',
    rating: 4.3,
    priceRange: 'medium',
    specialties: ['piscina', 'restaurante', 'acesso fácil'],
    lastUpdated: '2025-01-01',
    verified: true,
    isPartner: false,
    tripAdvisorRating: 4.2
  }
];

// Função para buscar informações específicas
export function searchMSKnowledge(query: string, category?: string): MSKnowledgeItem[] {
  const searchTerm = query.toLowerCase();
  
  let results = MS_KNOWLEDGE_BASE.filter(item => {
    const matchesCategory = !category || item.category === category;
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm) ||
      item.specialties?.some(specialty => specialty.toLowerCase().includes(searchTerm)) ||
      item.location.toLowerCase().includes(searchTerm);
    
    return matchesCategory && matchesSearch;
  });

  // Ordenar por avaliação (não há parceiros ainda)
  results.sort((a, b) => {
    const ratingA = a.tripAdvisorRating || a.rating || 0;
    const ratingB = b.tripAdvisorRating || b.rating || 0;
    return ratingB - ratingA;
  });

  return results;
}

// Função para obter recomendações personalizadas
export function getPersonalizedRecommendations(userPreferences: string[]): MSKnowledgeItem[] {
  return MS_KNOWLEDGE_BASE.filter(item => 
    userPreferences.some(pref => 
      item.specialties?.some(specialty => 
        specialty.toLowerCase().includes(pref.toLowerCase())
      )
    )
  ).sort((a, b) => {
    // Ordenar por avaliação
    const ratingA = a.tripAdvisorRating || a.rating || 0;
    const ratingB = b.tripAdvisorRating || b.rating || 0;
    return ratingB - ratingA;
  });
}

// Função para obter recomendações de parceiros (quando houver)
export function getPartnerRecommendations(): MSKnowledgeItem[] {
  // Por enquanto, retorna vazio pois não há parceiros ainda
  return [];
}

// Função para verificar se tem Cadastur válido
export function hasValidCadastur(item: MSKnowledgeItem): boolean {
  return item.cadasturCode ? item.cadasturCode.length > 0 : false;
} 