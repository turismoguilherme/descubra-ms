// Serviço simplificado de recomendações personalizadas
// Funcionalidade básica para manter compatibilidade

export interface UserProfile {
  role: string;
  cityId?: string;
  regionId?: string;
  interests: string[];
  previousActions: string[];
  preferredTimeframes: string[];
}

export interface PersonalizedRecommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  timeframe: string;
  expectedImpact: string;
  implementationDifficulty: 'easy' | 'medium' | 'hard';
  cost: 'low' | 'medium' | 'high';
  createdAt: string;
}

class PersonalizedRecommendationsService {
  async generatePersonalizedRecommendations(userProfile: UserProfile): Promise<PersonalizedRecommendation[]> {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const recommendations: PersonalizedRecommendation[] = [
      {
        id: 'rec_1',
        title: 'Campanha de Marketing Digital',
        description: 'Implementar campanhas focadas em redes sociais para aumentar a visibilidade do destino',
        category: 'marketing',
        priority: 'high',
        timeframe: 'short_term',
        expectedImpact: 'Aumento de 30% na visibilidade online',
        implementationDifficulty: 'medium',
        cost: 'medium',
        createdAt: new Date().toISOString()
      },
      {
        id: 'rec_2',
        title: 'Melhorias na Infraestrutura',
        description: 'Investir em sinalização turística e melhorias nos pontos de interesse',
        category: 'infrastructure',
        priority: 'medium',
        timeframe: 'medium_term',
        expectedImpact: 'Melhoria na experiência do visitante',
        implementationDifficulty: 'hard',
        cost: 'high',
        createdAt: new Date().toISOString()
      },
      {
        id: 'rec_3',
        title: 'Eventos Sazonais',
        description: 'Criar calendário de eventos para atrair turistas durante todo o ano',
        category: 'events',
        priority: 'medium',
        timeframe: 'long_term',
        expectedImpact: 'Aumento na ocupação hoteleira',
        implementationDifficulty: 'medium',
        cost: 'medium',
        createdAt: new Date().toISOString()
      }
    ];
    
    // Filtrar por interesses do usuário
    return recommendations.filter(rec => 
      userProfile.interests.includes(rec.category) ||
      userProfile.preferredTimeframes.includes(rec.timeframe)
    );
  }

  async getRecommendationById(id: string): Promise<PersonalizedRecommendation | null> {
    const recommendations = await this.generatePersonalizedRecommendations({
      role: 'Gestor',
      interests: ['marketing', 'infrastructure', 'events'],
      previousActions: [],
      preferredTimeframes: ['short_term', 'medium_term']
    });
    
    return recommendations.find(rec => rec.id === id) || null;
  }

  async updateUserPreferences(userId: string, preferences: Partial<UserProfile>): Promise<void> {
    // Simular atualização de preferências
    console.log('Atualizando preferências do usuário:', userId, preferences);
  }

  async getRecommendationStats(): Promise<{
    total: number;
    implemented: number;
    pending: number;
    averageImpact: string;
  }> {
    return {
      total: 15,
      implemented: 8,
      pending: 7,
      averageImpact: 'Alto'
    };
  }
}

export const personalizedRecommendationsService = new PersonalizedRecommendationsService();
































