import { 
  DynamicItinerary, 
  ItineraryAttraction, 
  RoutePoint, 
  ItineraryRequest, 
  ItineraryResponse 
} from './itineraryTypes';
import { searchMSKnowledge } from '../ai/knowledge/msKnowledgeBase';
import { reservationService } from '../reservations/reservationService';

class ItineraryService {
  private itineraries: DynamicItinerary[] = [];

  /**
   * Gerar roteiro dinâmico baseado nos interesses do usuário
   */
  async generateItinerary(request: ItineraryRequest): Promise<ItineraryResponse> {
    console.log(`🗺️ Gerando roteiro para: ${request.location}`);
    
    try {
      // Buscar atrações disponíveis
      const attractions = await this.getAvailableAttractions(request.interests, request.location);
      
      // Buscar parceiros para reservas
      const partners = await reservationService.getAvailablePartners();
      
      // Gerar roteiro otimizado
      const itinerary = await this.createOptimizedItinerary(request, attractions, partners);
      
      // Salvar roteiro
      this.itineraries.push(itinerary);
      
      console.log(`✅ Roteiro gerado com ${itinerary.attractions.length} atrações`);
      
      return {
        success: true,
        itinerary: itinerary,
        message: 'Roteiro personalizado gerado com sucesso'
      };
      
    } catch (error) {
      console.error('❌ Erro ao gerar roteiro:', error);
      return {
        success: false,
        error: 'Erro interno ao gerar roteiro'
      };
    }
  }

  /**
   * Buscar atrações disponíveis baseadas nos interesses
   */
  private async getAvailableAttractions(interests: string[], location: string): Promise<ItineraryAttraction[]> {
    const attractions: ItineraryAttraction[] = [];
    
    // Buscar na base de conhecimento
    const knowledgeItems = searchMSKnowledge('', 'attraction');
    
    // Filtrar por interesses e localização
    const filteredItems = knowledgeItems.filter(item => {
      const matchesInterest = interests.some(interest => 
        item.specialties?.some(specialty => 
          specialty.toLowerCase().includes(interest.toLowerCase())
        ) || item.category.toLowerCase().includes(interest.toLowerCase())
      );
      
      const matchesLocation = item.location.toLowerCase().includes(location.toLowerCase()) ||
                             location.toLowerCase().includes('ms') ||
                             location.toLowerCase().includes('mato grosso do sul');
      
      return matchesInterest && matchesLocation;
    });

    // Converter para ItineraryAttraction
    filteredItems.forEach((item, index) => {
      attractions.push({
        id: `attraction-${index}`,
        name: item.name,
        type: 'attraction',
        location: item.location,
        description: item.description,
        estimatedTime: this.estimateTime(item.category, item.specialties),
        estimatedCost: this.estimateCost(item.priceRange),
        priority: this.determinePriority(item.rating, item.isPartner),
        day: 1,
        order: index + 1
      });
    });

    return attractions;
  }

  /**
   * Criar roteiro otimizado
   */
  private async createOptimizedItinerary(
    request: ItineraryRequest, 
    attractions: ItineraryAttraction[], 
    partners: any[]
  ): Promise<DynamicItinerary> {
    const itineraryId = `itinerary-${Date.now()}`;
    const startDate = new Date(request.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + request.duration - 1);

    // Organizar atrações por dia
    const attractionsPerDay = this.distributeAttractions(attractions, request.duration);
    
    // Gerar pontos de rota
    const routePoints = this.generateRoutePoints(attractionsPerDay, partners, request.location);

    const itinerary: DynamicItinerary = {
      id: itineraryId,
      userId: 'user-' + Date.now(), // Mock user ID
      title: `Roteiro ${request.interests.join(', ')} - ${request.location}`,
      duration: request.duration,
      interests: request.interests,
      budget: request.budget,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      attractions: attractionsPerDay.flat(),
      route: routePoints,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return itinerary;
  }

  /**
   * Distribuir atrações pelos dias
   */
  private distributeAttractions(attractions: ItineraryAttraction[], days: number): ItineraryAttraction[][] {
    const attractionsPerDay: ItineraryAttraction[][] = [];
    
    // Ordenar por prioridade
    const sortedAttractions = attractions.sort((a, b) => {
      const priorityOrder = { 'must': 3, 'should': 2, 'optional': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    // Distribuir pelos dias
    for (let day = 1; day <= days; day++) {
      const dayAttractions = sortedAttractions.filter((_, index) => index % days === day - 1);
      
      // Atualizar dia e ordem
      dayAttractions.forEach((attraction, index) => {
        attraction.day = day;
        attraction.order = index + 1;
      });
      
      attractionsPerDay.push(dayAttractions);
    }

    return attractionsPerDay;
  }

  /**
   * Gerar pontos de rota
   */
  private generateRoutePoints(
    attractionsPerDay: ItineraryAttraction[][], 
    partners: any[], 
    location: string
  ): RoutePoint[] {
    const routePoints: RoutePoint[] = [];
    
    attractionsPerDay.forEach((dayAttractions, dayIndex) => {
      const day = dayIndex + 1;
      
      // Ponto de início do dia
      routePoints.push({
        id: `start-day-${day}`,
        name: `Início do Dia ${day}`,
        type: 'start',
        location: {
          lat: -20.4486, // Campo Grande coordinates
          lng: -54.6295,
          address: location
        },
        estimatedTime: 0,
        estimatedCost: 0,
        day: day,
        order: 0
      });

      // Atrações do dia
      dayAttractions.forEach((attraction, index) => {
        routePoints.push({
          id: `attraction-${attraction.id}`,
          name: attraction.name,
          type: 'attraction',
          location: {
            lat: -20.4486 + (index * 0.01), // Mock coordinates
            lng: -54.6295 + (index * 0.01),
            address: attraction.location
          },
          estimatedTime: attraction.estimatedTime * 60, // Converter para minutos
          estimatedCost: attraction.estimatedCost,
          day: day,
          order: index + 1,
          notes: attraction.description
        });
      });

      // Ponto de fim do dia
      routePoints.push({
        id: `end-day-${day}`,
        name: `Fim do Dia ${day}`,
        type: 'end',
        location: {
          lat: -20.4486,
          lng: -54.6295,
          address: location
        },
        estimatedTime: 0,
        estimatedCost: 0,
        day: day,
        order: dayAttractions.length + 1
      });
    });

    return routePoints;
  }

  /**
   * Estimar tempo baseado na categoria e especialidades
   */
  private estimateTime(category: string, specialties?: string[]): number {
    const baseTimes: { [key: string]: number } = {
      'hotel': 0,
      'restaurant': 2,
      'attraction': 4,
      'tour': 6,
      'transport': 1
    };

    let baseTime = baseTimes[category] || 2;
    
    if (specialties) {
      if (specialties.some(s => s.includes('trilha'))) baseTime += 2;
      if (specialties.some(s => s.includes('gruta'))) baseTime += 1;
      if (specialties.some(s => s.includes('pantanal'))) baseTime += 3;
    }

    return Math.min(baseTime, 8); // Máximo 8 horas
  }

  /**
   * Estimar custo baseado na faixa de preço
   */
  private estimateCost(priceRange?: string): number {
    const costRanges: { [key: string]: number } = {
      'low': 50,
      'medium': 150,
      'high': 300,
      'luxury': 500
    };

    return costRanges[priceRange || 'medium'] || 150;
  }

  /**
   * Determinar prioridade baseada na avaliação e se é parceiro
   */
  private determinePriority(rating?: number, isPartner?: boolean): 'must' | 'should' | 'optional' {
    if (isPartner) return 'must';
    if (rating && rating >= 4.5) return 'must';
    if (rating && rating >= 4.0) return 'should';
    return 'optional';
  }

  /**
   * Buscar roteiros do usuário
   */
  async getUserItineraries(userId: string): Promise<DynamicItinerary[]> {
    return this.itineraries.filter(itinerary => itinerary.userId === userId);
  }

  /**
   * Buscar roteiro específico
   */
  async getItinerary(itineraryId: string): Promise<DynamicItinerary | null> {
    return this.itineraries.find(itinerary => itinerary.id === itineraryId) || null;
  }

  /**
   * Atualizar status do roteiro
   */
  async updateItineraryStatus(itineraryId: string, status: DynamicItinerary['status']): Promise<boolean> {
    const itinerary = this.itineraries.find(i => i.id === itineraryId);
    if (itinerary) {
      itinerary.status = status;
      itinerary.updatedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  /**
   * Deletar roteiro
   */
  async deleteItinerary(itineraryId: string): Promise<boolean> {
    const index = this.itineraries.findIndex(i => i.id === itineraryId);
    if (index !== -1) {
      this.itineraries.splice(index, 1);
      return true;
    }
    return false;
  }
}

export const itineraryService = new ItineraryService(); 