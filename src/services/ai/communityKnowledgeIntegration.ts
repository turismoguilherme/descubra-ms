// Community Knowledge Integration Service
// Integra conhecimento da comunidade com o sistema Guatá

export interface CommunityKnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: string;
  location?: string;
  author: string;
  createdAt: Date;
  verified: boolean;
  rating: number;
  tags: string[];
}

export interface CommunityKnowledgeQuery {
  query: string;
  category?: string;
  location?: string;
  limit?: number;
}

export class CommunityKnowledgeIntegration {
  private knowledgeItems: CommunityKnowledgeItem[] = [];

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Dados mockados para demonstração
    this.knowledgeItems = [
      {
        id: '1',
        title: 'Melhor época para visitar Bonito',
        content: 'A melhor época para visitar Bonito é entre maio e setembro, quando o clima está mais seco e as águas mais cristalinas.',
        category: 'turismo',
        location: 'Bonito',
        author: 'Comunidade',
        createdAt: new Date('2024-01-15'),
        verified: true,
        rating: 4.8,
        tags: ['bonito', 'turismo', 'clima', 'época']
      },
      {
        id: '2',
        title: 'Restaurantes típicos em Campo Grande',
        content: 'Recomendo o Restaurante do Peixe e o Casa do Peixe para experimentar a culinária local.',
        category: 'gastronomia',
        location: 'Campo Grande',
        author: 'Comunidade',
        createdAt: new Date('2024-01-20'),
        verified: true,
        rating: 4.5,
        tags: ['gastronomia', 'campo-grande', 'restaurantes']
      }
    ];
  }

  async searchKnowledge(query: CommunityKnowledgeQuery): Promise<CommunityKnowledgeItem[]> {
    const { query: searchQuery, category, location, limit = 10 } = query;
    
    let results = this.knowledgeItems.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (category) {
      results = results.filter(item => item.category === category);
    }

    if (location) {
      results = results.filter(item => 
        !item.location || item.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Ordenar por rating e data
    results.sort((a, b) => {
      if (a.rating !== b.rating) {
        return b.rating - a.rating;
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    return results.slice(0, limit);
  }

  async addKnowledge(item: Omit<CommunityKnowledgeItem, 'id' | 'createdAt'>): Promise<CommunityKnowledgeItem> {
    const newItem: CommunityKnowledgeItem = {
      ...item,
      id: `community-${Date.now()}`,
      createdAt: new Date()
    };

    this.knowledgeItems.push(newItem);
    return newItem;
  }

  async getKnowledgeByCategory(category: string): Promise<CommunityKnowledgeItem[]> {
    return this.knowledgeItems.filter(item => item.category === category);
  }

  async getKnowledgeByLocation(location: string): Promise<CommunityKnowledgeItem[]> {
    return this.knowledgeItems.filter(item => 
      item.location && item.location.toLowerCase().includes(location.toLowerCase())
    );
  }

  async getVerifiedKnowledge(): Promise<CommunityKnowledgeItem[]> {
    return this.knowledgeItems.filter(item => item.verified);
  }

  async getTopRatedKnowledge(limit: number = 5): Promise<CommunityKnowledgeItem[]> {
    return this.knowledgeItems
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }
}

// Exportar instância única
export const communityKnowledgeIntegration = new CommunityKnowledgeIntegration();


