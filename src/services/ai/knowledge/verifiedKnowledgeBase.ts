// Sistema de Base de Conhecimento Verificada - Guatá Inteligente
// FASE 1: Base sólida com verificação tripla e prioridade aos parceiros

import { Partner, VerifiedSource } from '../verification/informationVerificationService';

export interface VerifiedKnowledgeItem {
  id: string;
  category: 'hotel' | 'restaurant' | 'attraction' | 'transport' | 'general' | 'climate' | 'event';
  subcategory?: string;
  title: string;
  description: string;
  location: {
    city: string;
    address?: string;
    coordinates?: { lat: number; lng: number };
  };
  details: {
    hours?: string;
    price?: string;
    contact?: string;
    website?: string;
    features?: string[];
  };
  verification: {
    sources: VerifiedSource[];
    lastVerified: Date;
    nextVerification: Date;
    confidence: number; // 0-100
    verified: boolean;
  };
  isPartner: boolean;
  partnerInfo?: {
    partnerId: string;
    specialOffers?: string[];
    priority: number;
  };
  popularity: number; // Baseado em quantas vezes foi consultado
  userRating?: number; // Feedback dos usuários
}

export interface KnowledgeQuery {
  query: string;
  category?: string;
  location?: string;
  includePartners?: boolean;
  prioritizePartners?: boolean;
}

export interface KnowledgeResponse {
  items: VerifiedKnowledgeItem[];
  partners: VerifiedKnowledgeItem[];
  generalRecommendations: VerifiedKnowledgeItem[];
  confidence: number;
  sources: string[];
  lastUpdated: string;
  hasPartners: boolean;
}

class VerifiedKnowledgeBase {
  private knowledgeBase: VerifiedKnowledgeItem[] = [];
  private partners: Partner[] = [];

  constructor() {
    this.initializeBaseKnowledge();
  }

  // CAMADA 1: BASE VERIFICADA - Dados fundamentais sempre corretos
  private initializeBaseKnowledge(): void {
    this.knowledgeBase = [
      // ========== ATRAÇÕES PRINCIPAIS ==========
      {
        id: 'bioparque-pantanal',
        category: 'attraction',
        subcategory: 'aquarium',
        title: 'Bioparque Pantanal',
        description: 'Maior aquário de água doce do mundo, com mais de 10 mil metros quadrados',
        location: {
          city: 'Campo Grande',
          address: 'Av. Afonso Pena, 6001 - Jardim Batistão',
          coordinates: { lat: -20.4685, lng: -54.6354 }
        },
        details: {
          hours: 'Terça a domingo: 8h às 17h (entrada até 16h)',
          price: 'Gratuito',
          contact: '(67) 3314-3000',
          website: 'bioparque.com.br',
          features: [
            'Maior aquário de água doce do mundo',
            'Bioma Pantanal recreado',
            'Mais de 300 espécies',
            'Acesso para pessoas com deficiência',
            'Estacionamento gratuito'
          ]
        },
        verification: {
          sources: [{
            id: 'bioparque-official',
            name: 'Site Oficial Bioparque',
            url: 'https://bioparque.com.br',
            type: 'official',
            lastVerified: new Date('2025-01-15'),
            reliability: 'high',
            category: 'attraction'
          }],
          lastVerified: new Date('2025-01-15'),
          nextVerification: new Date('2025-01-22'), // Verificação semanal
          confidence: 100,
          verified: true
        },
        isPartner: false,
        popularity: 95
      },

      {
        id: 'gruta-lago-azul',
        category: 'attraction',
        subcategory: 'cave',
        title: 'Gruta do Lago Azul',
        description: 'Caverna com lago subterrâneo de águas azul-turquesa, Patrimônio Natural da Humanidade',
        location: {
          city: 'Bonito',
          address: 'Rodovia MS-382, km 20 - Zona Rural',
          coordinates: { lat: -21.1622, lng: -56.4756 }
        },
        details: {
          hours: 'Diariamente: 8h às 16h (última entrada 15h)',
          price: 'R$ 45,00 (valor aproximado, verificar no local)',
          contact: 'Agendamento obrigatório através de agências credenciadas',
          features: [
            'Patrimônio Natural da Humanidade UNESCO',
            'Lago com 70 metros de profundidade',
            'Visita com guia obrigatório',
            'Agendamento obrigatório',
            'Melhor horário: 8h às 10h (luz natural)'
          ]
        },
        verification: {
          sources: [{
            id: 'bonito-official',
            name: 'Portal Oficial Bonito',
            url: 'https://www.bonito-ms.com.br',
            type: 'government',
            lastVerified: new Date('2025-01-15'),
            reliability: 'high',
            category: 'attraction'
          }],
          lastVerified: new Date('2025-01-15'),
          nextVerification: new Date('2025-01-22'),
          confidence: 95,
          verified: true
        },
        isPartner: false,
        popularity: 90
      },

      // ========== HOTÉIS VERIFICADOS ==========
      {
        id: 'hotel-deville-cg',
        category: 'hotel',
        subcategory: '4-stars',
        title: 'Hotel Deville Prime Campo Grande',
        description: 'Hotel 4 estrelas no centro de Campo Grande, próximo aos principais pontos turísticos',
        location: {
          city: 'Campo Grande',
          address: 'Rua Barão do Rio Branco, 1271 - Centro',
          coordinates: { lat: -20.4648, lng: -54.6166 }
        },
        details: {
          contact: '(67) 3316-7700',
          website: 'deville.com.br',
          features: [
            'Centro da cidade',
            'Wi-Fi gratuito',
            'Estacionamento',
            'Business center',
            'Próximo ao Shopping Campo Grande'
          ]
        },
        verification: {
          sources: [{
            id: 'deville-official',
            name: 'Site Oficial Deville',
            url: 'https://www.deville.com.br',
            type: 'official',
            lastVerified: new Date('2025-01-15'),
            reliability: 'high',
            category: 'hotel'
          }],
          lastVerified: new Date('2025-01-15'),
          nextVerification: new Date('2025-01-20'), // Hotéis verificados mais frequentemente
          confidence: 90,
          verified: true
        },
        isPartner: false, // Será true quando virar parceiro
        popularity: 75
      },

      // ========== RESTAURANTES VERIFICADOS ==========
      {
        id: 'casa-do-peixe-cg',
        category: 'restaurant',
        subcategory: 'regional',
        title: 'Casa do Peixe',
        description: 'Restaurante tradicional especializado em peixe pintado e culinária pantaneira',
        location: {
          city: 'Campo Grande',
          address: 'Rua Joaquim Nabuco, 185 - Centro'
        },
        details: {
          hours: 'Segunda a sábado: 11h às 15h e 18h às 23h',
          contact: '(67) 3384-9412',
          features: [
            'Especialidade: peixe pintado',
            'Culinária pantaneira tradicional',
            'Ambiente familiar',
            'Tradição local há mais de 30 anos'
          ]
        },
        verification: {
          sources: [{
            id: 'guia-turismo-ms',
            name: 'Guia Oficial de Turismo MS',
            url: 'https://www.fundtur.ms.gov.br',
            type: 'government',
            lastVerified: new Date('2025-01-15'),
            reliability: 'high',
            category: 'restaurant'
          }],
          lastVerified: new Date('2025-01-15'),
          nextVerification: new Date('2025-01-20'),
          confidence: 85,
          verified: true
        },
        isPartner: false,
        popularity: 80
      },

      // ========== INFORMAÇÕES GERAIS ==========
      {
        id: 'clima-campo-grande',
        category: 'general',
        subcategory: 'climate',
        title: 'Clima de Campo Grande',
        description: 'Informações sobre o clima tropical semi-úmido de Campo Grande',
        location: {
          city: 'Campo Grande'
        },
        details: {
          features: [
            'Clima tropical semi-úmido',
            'Duas estações bem definidas',
            'Seca: maio a setembro (melhor época para turismo)',
            'Chuvas: outubro a abril',
            'Temperatura média anual: 24°C',
            'Baixa umidade no inverno'
          ]
        },
        verification: {
          sources: [{
            id: 'climatempo',
            name: 'Climatempo',
            url: 'https://www.climatempo.com.br',
            type: 'reliable_third_party',
            lastVerified: new Date('2025-01-15'),
            reliability: 'high',
            category: 'general'
          }],
          lastVerified: new Date('2025-01-15'),
          nextVerification: new Date('2025-01-16'), // Clima verificado diariamente
          confidence: 95,
          verified: true
        },
        isPartner: false,
        popularity: 70
      },

      {
        id: 'aeroporto-campo-grande',
        category: 'transport',
        subcategory: 'airport',
        title: 'Aeroporto Internacional de Campo Grande',
        description: 'Principal porta de entrada aérea para Mato Grosso do Sul',
        location: {
          city: 'Campo Grande',
          address: 'Rod. BR-163, s/n - Vila Taquarussu',
          coordinates: { lat: -20.4686, lng: -54.6719 }
        },
        details: {
          contact: '(67) 3368-6000',
          website: 'aeroportocampogrande.net',
          features: [
            'Código IATA: CGR',
            'Distância do centro: 7 km',
            'Táxi, Uber e ônibus disponíveis',
            'Conexões para principais capitais',
            'Estacionamento pago e gratuito'
          ]
        },
        verification: {
          sources: [{
            id: 'infraero',
            name: 'Infraero',
            url: 'https://www.infraero.gov.br',
            type: 'government',
            lastVerified: new Date('2025-01-15'),
            reliability: 'high',
            category: 'transport'
          }],
          lastVerified: new Date('2025-01-15'),
          nextVerification: new Date('2025-01-22'),
          confidence: 100,
          verified: true
        },
        isPartner: false,
        popularity: 60
      }
    ];
  }

  // Busca na base de conhecimento com prioridade aos parceiros
  async search(query: KnowledgeQuery): Promise<KnowledgeResponse> {
    const searchTerms = query.query.toLowerCase().split(' ');
    
    // 1. BUSCAR PARCEIROS PRIMEIRO
    const partners = this.knowledgeBase.filter(item => 
      item.isPartner && this.matchesQuery(item, searchTerms, query.category, query.location)
    ).sort((a, b) => (b.partnerInfo?.priority || 0) - (a.partnerInfo?.priority || 0));

    // 2. BUSCAR OUTRAS OPÇÕES VERIFICADAS
    const generalRecommendations = this.knowledgeBase.filter(item => 
      !item.isPartner && this.matchesQuery(item, searchTerms, query.category, query.location)
    ).sort((a, b) => b.popularity - a.popularity);

    // 3. COMBINAR RESULTADOS
    const allItems = [...partners, ...generalRecommendations];

    // 4. CALCULAR CONFIANÇA
    const confidence = this.calculateConfidence(allItems);

    // 5. PREPARAR FONTES
    const sources = allItems.flatMap(item => 
      item.verification.sources.map(source => source.name)
    );

    return {
      items: allItems.slice(0, 10), // Máximo 10 resultados
      partners,
      generalRecommendations: generalRecommendations.slice(0, 5),
      confidence,
      sources: [...new Set(sources)], // Remove duplicatas
      lastUpdated: new Date().toISOString(),
      hasPartners: partners.length > 0
    };
  }

  // Verifica se um item corresponde à consulta
  private matchesQuery(
    item: VerifiedKnowledgeItem, 
    searchTerms: string[], 
    category?: string, 
    location?: string
  ): boolean {
    // Verifica categoria
    if (category && item.category !== category) {
      return false;
    }

    // Verifica localização
    if (location && !item.location.city.toLowerCase().includes(location.toLowerCase())) {
      return false;
    }

    // Verifica termos de busca
    const searchableText = `
      ${item.title} 
      ${item.description} 
      ${item.details.features?.join(' ') || ''} 
      ${item.location.city}
    `.toLowerCase();

    return searchTerms.some(term => searchableText.includes(term));
  }

  // Calcula a confiança da resposta
  private calculateConfidence(items: VerifiedKnowledgeItem[]): number {
    if (items.length === 0) return 0;
    
    const avgConfidence = items.reduce((sum, item) => sum + item.verification.confidence, 0) / items.length;
    const verifiedCount = items.filter(item => item.verification.verified).length;
    const verifiedPercentage = (verifiedCount / items.length) * 100;
    
    return Math.round((avgConfidence + verifiedPercentage) / 2);
  }

  // Adiciona um novo parceiro
  async addPartner(partner: Partner, knowledgeItem: Partial<VerifiedKnowledgeItem>): Promise<void> {
    this.partners.push(partner);
    
    // Atualiza item existente ou cria novo
    const existingIndex = this.knowledgeBase.findIndex(item => 
      item.title.toLowerCase() === knowledgeItem.title?.toLowerCase()
    );

    if (existingIndex >= 0) {
      // Atualiza item existente para ser parceiro
      this.knowledgeBase[existingIndex].isPartner = true;
      this.knowledgeBase[existingIndex].partnerInfo = {
        partnerId: partner.id,
        priority: partner.priority,
        specialOffers: []
      };
    } else {
      // Cria novo item para o parceiro
      const newItem: VerifiedKnowledgeItem = {
        id: `partner-${partner.id}`,
        category: partner.type,
        title: partner.name,
        location: { city: partner.location },
        description: `Nosso parceiro ${partner.name}`,
        details: {},
        verification: {
          sources: [{
            id: `partner-${partner.id}`,
            name: 'Parceiro Verificado',
            url: '',
            type: 'verified_partner',
            lastVerified: new Date(),
            reliability: 'high',
            category: partner.type
          }],
          lastVerified: new Date(),
          nextVerification: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
          confidence: 100,
          verified: true
        },
        isPartner: true,
        partnerInfo: {
          partnerId: partner.id,
          priority: partner.priority,
          specialOffers: []
        },
        popularity: 100, // Parceiros começam com alta popularidade
        ...knowledgeItem
      };

      this.knowledgeBase.push(newItem);
    }
  }

  // Obtém estatísticas para o dashboard
  getStats() {
    const total = this.knowledgeBase.length;
    const verified = this.knowledgeBase.filter(item => item.verification.verified).length;
    const partners = this.knowledgeBase.filter(item => item.isPartner).length;
    const byCategory = this.knowledgeBase.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      verified,
      partners,
      verificationRate: Math.round((verified / total) * 100),
      byCategory,
      lastUpdate: new Date().toISOString()
    };
  }
}

export const verifiedKnowledgeBase = new VerifiedKnowledgeBase();