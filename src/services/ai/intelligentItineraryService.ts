/**
 * 🗺️ Serviço de Roteiros Inteligentes
 * 
 * Gera roteiros personalizados usando dados REAIS de MS
 * Combina locais verificados, parceiros e sugestões da comunidade
 */

import { MSKnowledgeBase, MSLocation } from './search/msKnowledgeBase';
import { PartnersIntegrationService, PartnerRecommendation } from './partnersIntegrationService';

export interface ItineraryRequest {
  destination: string;
  days: number;
  budget: 'baixo' | 'medio' | 'alto';
  interests: string[]; // ['natureza', 'cultura', 'gastronomia', 'aventura', 'família']
  group_type: 'sozinho' | 'casal' | 'família' | 'amigos' | 'grupo';
  mobility: 'carro' | 'transporte_publico' | 'a_pe';
}

export interface ItineraryDay {
  day: number;
  title: string;
  locations: Array<{
    location: MSLocation;
    time_slot: string;
    duration: string;
    transport_info?: string;
    why_recommended: string;
  }>;
  partners: PartnerRecommendation[];
  estimated_cost: string;
  tips: string[];
}

export interface GeneratedItinerary {
  title: string;
  summary: string;
  total_days: number;
  estimated_total_cost: string;
  days: ItineraryDay[];
  general_tips: string[];
  emergency_contacts: Array<{
    name: string;
    phone: string;
    service: string;
  }>;
}

export class IntelligentItineraryService {

  /**
   * Gerar roteiro inteligente baseado nas preferências
   */
  static async generateItinerary(request: ItineraryRequest): Promise<GeneratedItinerary> {
    console.log(`🗺️ Gerando roteiro para ${request.destination} - ${request.days} dias`);

    try {
      // 1. Buscar locais relevantes na base de MS
      const relevantLocations = this.findRelevantLocations(request);
      
      // 2. Buscar parceiros relevantes
      const relevantPartners = await this.findRelevantPartners(request);
      
      // 3. Organizar por dias
      const organizedDays = this.organizeDays(request, relevantLocations, relevantPartners);
      
      // 4. Gerar dicas e informações
      const generalTips = this.generateGeneralTips(request);
      const emergencyContacts = this.getEmergencyContacts(request.destination);
      
      return {
        title: `Roteiro ${request.days} ${request.days === 1 ? 'dia' : 'dias'} em ${request.destination}`,
        summary: this.generateSummary(request, relevantLocations.length),
        total_days: request.days,
        estimated_total_cost: this.calculateTotalCost(request, relevantLocations, relevantPartners),
        days: organizedDays,
        general_tips: generalTips,
        emergency_contacts: emergencyContacts
      };

    } catch (error) {
      console.error('❌ Erro ao gerar roteiro:', error);
      
      // Fallback com roteiro básico
      return this.generateBasicItinerary(request);
    }
  }

  /**
   * Encontrar locais relevantes na base de MS
   */
  private static findRelevantLocations(request: ItineraryRequest): MSLocation[] {
    // Buscar por cidade/destino
    let locations = MSKnowledgeBase.getLocationsByCity(request.destination);
    
    // Se não encontrar por cidade, buscar em toda a base
    if (locations.length === 0) {
      const searchTerms = request.destination.toLowerCase().split(' ');
      for (const term of searchTerms) {
        const found = MSKnowledgeBase.searchLocations(term);
        locations.push(...found);
      }
    }
    
    // Filtrar por interesses
    if (request.interests.length > 0) {
      locations = locations.filter(location => {
        return request.interests.some(interest => {
          const interestKeywords = this.getInterestKeywords(interest);
          return interestKeywords.some(keyword => 
            location.tags.includes(keyword) || 
            location.description.toLowerCase().includes(keyword)
          );
        });
      });
    }
    
    // Filtrar por orçamento
    locations = this.filterByBudget(locations, request.budget);
    
    // Ordenar por relevância e confiança
    return locations
      .filter(loc => MSKnowledgeBase.isLocationActive(loc))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, request.days * 3); // Máximo 3 locais por dia
  }

  /**
   * Buscar parceiros relevantes
   */
  private static async findRelevantPartners(request: ItineraryRequest): Promise<PartnerRecommendation[]> {
    try {
      const searchQuery = `${request.destination} ${request.interests.join(' ')} ${request.group_type}`;
      const partners = await PartnersIntegrationService.searchRelevantPartners(searchQuery, request.destination);
      
      return partners.slice(0, request.days * 2); // Máximo 2 parceiros por dia
    } catch (error) {
      console.error('❌ Erro ao buscar parceiros:', error);
      return [];
    }
  }

  /**
   * Organizar locais e parceiros por dias
   */
  private static organizeDays(
    request: ItineraryRequest, 
    locations: MSLocation[], 
    partners: PartnerRecommendation[]
  ): ItineraryDay[] {
    const days: ItineraryDay[] = [];
    const locationsPerDay = Math.ceil(locations.length / request.days);
    const partnersPerDay = Math.ceil(partners.length / request.days);
    
    for (let dayNum = 1; dayNum <= request.days; dayNum++) {
      const startIdx = (dayNum - 1) * locationsPerDay;
      const dayLocations = locations.slice(startIdx, startIdx + locationsPerDay);
      
      const partnerStartIdx = (dayNum - 1) * partnersPerDay;
      const dayPartners = partners.slice(partnerStartIdx, partnerStartIdx + partnersPerDay);
      
      const dayItinerary = this.createDayItinerary(dayNum, request, dayLocations, dayPartners);
      days.push(dayItinerary);
    }
    
    return days;
  }

  /**
   * Criar roteiro de um dia específico
   */
  private static createDayItinerary(
    dayNum: number, 
    request: ItineraryRequest, 
    locations: MSLocation[], 
    partners: PartnerRecommendation[]
  ): ItineraryDay {
    const timeSlots = ['Manhã (8h-12h)', 'Tarde (13h-17h)', 'Noite (18h-22h)'];
    const dayLocations = locations.map((location, index) => {
      const timeSlot = timeSlots[index % timeSlots.length];
      
      return {
        location,
        time_slot: timeSlot,
        duration: this.calculateDuration(location),
        transport_info: this.getTransportInfo(location, request.mobility),
        why_recommended: this.generateRecommendationReason(location, request)
      };
    });
    
    const estimatedCost = this.calculateDayCost(locations, partners, request.budget);
    const tips = this.generateDayTips(dayNum, locations, request);
    
    return {
      day: dayNum,
      title: this.generateDayTitle(dayNum, locations),
      locations: dayLocations,
      partners,
      estimated_cost: estimatedCost,
      tips
    };
  }

  /**
   * Mapear interesses para palavras-chave
   */
  private static getInterestKeywords(interest: string): string[] {
    const keywordMap = {
      'natureza': ['parque', 'rio', 'trilha', 'ecoturismo', 'pantanal', 'fauna', 'flora'],
      'cultura': ['museu', 'cultura', 'história', 'arte', 'indígena', 'tradicional'],
      'gastronomia': ['restaurante', 'comida', 'regional', 'peixe', 'mercado', 'feira'],
      'aventura': ['rapel', 'caverna', 'radical', 'aventura', 'flutuação', 'trilha'],
      'família': ['família', 'educativo', 'gratuito', 'acessível', 'parque', 'aquário']
    };
    
    return keywordMap[interest as keyof typeof keywordMap] || [interest];
  }

  /**
   * Filtrar locais por orçamento
   */
  private static filterByBudget(locations: MSLocation[], budget: string): MSLocation[] {
    if (budget === 'baixo') {
      return locations.filter(loc => 
        !loc.price_range || 
        loc.price_range.includes('Gratuito') ||
        loc.price_range.includes('R$ 5') ||
        loc.price_range.includes('R$ 10')
      );
    }
    
    if (budget === 'alto') {
      return locations; // Todos os locais
    }
    
    // Orçamento médio - filtrar os muito caros
    return locations.filter(loc => 
      !loc.price_range || 
      !loc.price_range.includes('R$ 300') ||
      !loc.price_range.includes('R$ 400')
    );
  }

  /**
   * Calcular duração estimada da visita
   */
  private static calculateDuration(location: MSLocation): string {
    const durationMap = {
      'atracao': '2-3 horas',
      'restaurante': '1-2 horas',
      'hotel': 'Pernoite',
      'servico': '30 minutos',
      'evento': 'Conforme programação'
    };
    
    return durationMap[location.category] || '1-2 horas';
  }

  /**
   * Gerar informações de transporte
   */
  private static getTransportInfo(location: MSLocation, mobility: string): string {
    if (mobility === 'carro') {
      return `🚗 Acesso de carro até ${location.address}`;
    }
    
    if (mobility === 'transporte_publico') {
      return `🚌 Consulte linhas de ônibus para ${location.city}`;
    }
    
    return `🚶 A pé (consulte distância até ${location.address})`;
  }

  /**
   * Gerar razão da recomendação
   */
  private static generateRecommendationReason(location: MSLocation, request: ItineraryRequest): string {
    const reasons = [];
    
    if (location.price_range?.includes('Gratuito') && request.budget === 'baixo') {
      reasons.push('entrada gratuita');
    }
    
    if (request.interests.some(interest => 
      this.getInterestKeywords(interest).some(keyword => location.tags.includes(keyword))
    )) {
      reasons.push('alinha com seus interesses');
    }
    
    if (location.accessibility?.includes('Acessível') && request.group_type === 'família') {
      reasons.push('acessível para toda família');
    }
    
    reasons.push('local verificado e confiável');
    
    return `Recomendado porque: ${reasons.join(', ')}`;
  }

  /**
   * Calcular custo estimado do dia
   */
  private static calculateDayCost(locations: MSLocation[], partners: PartnerRecommendation[], budget: string): string {
    const baseCosts = {
      'baixo': { min: 20, max: 60 },
      'medio': { min: 60, max: 150 },
      'alto': { min: 150, max: 400 }
    };
    
    const range = baseCosts[budget as keyof typeof baseCosts];
    return `R$ ${range.min} a R$ ${range.max} por pessoa`;
  }

  /**
   * Gerar dicas do dia
   */
  private static generateDayTips(dayNum: number, locations: MSLocation[], request: ItineraryRequest): string[] {
    const tips = [];
    
    if (dayNum === 1) {
      tips.push('🌅 Comece cedo para aproveitar melhor o dia');
      tips.push('💧 Leve água e protetor solar');
    }
    
    if (locations.some(loc => loc.tags.includes('agendamento'))) {
      tips.push('📅 Alguns locais precisam de agendamento prévio');
    }
    
    if (locations.some(loc => loc.category === 'restaurante')) {
      tips.push('🍽️ Experimente a gastronomia regional');
    }
    
    if (request.mobility === 'carro') {
      tips.push('🅿️ Verifique disponibilidade de estacionamento');
    }
    
    return tips;
  }

  /**
   * Gerar título do dia
   */
  private static generateDayTitle(dayNum: number, locations: MSLocation[]): string {
    if (locations.length === 0) return `Dia ${dayNum}`;
    
    const mainCategory = locations[0].category;
    const cityName = locations[0].city;
    
    const titleMap = {
      'atracao': `Explorando ${cityName}`,
      'restaurante': `Sabores de ${cityName}`,
      'hotel': `Hospedagem em ${cityName}`,
      'servico': `Informações e Serviços`
    };
    
    return `Dia ${dayNum}: ${titleMap[mainCategory] || `Descobrindo ${cityName}`}`;
  }

  /**
   * Gerar dicas gerais
   */
  private static generateGeneralTips(request: ItineraryRequest): string[] {
    const tips = [
      '📱 Tenha o mapa offline baixado',
      '🏥 Anote números de emergência',
      '💳 Leve dinheiro e cartão',
      '🧴 Use repelente e protetor solar',
      '📸 Respeite a natureza ao fotografar'
    ];
    
    if (request.destination.toLowerCase().includes('bonito')) {
      tips.push('🏊 Traga roupas de banho para as atividades aquáticas');
      tips.push('👟 Use calçados adequados para trilhas');
    }
    
    if (request.destination.toLowerCase().includes('pantanal')) {
      tips.push('🦟 Leve repelente extra para o Pantanal');
      tips.push('👁️ Binóculos são úteis para observação da fauna');
    }
    
    return tips;
  }

  /**
   * Obter contatos de emergência
   */
  private static getEmergencyContacts(destination: string): Array<{name: string; phone: string; service: string}> {
    const baseContacts = [
      { name: 'SAMU', phone: '192', service: 'Emergência médica' },
      { name: 'Bombeiros', phone: '193', service: 'Emergência e resgate' },
      { name: 'Polícia Militar', phone: '190', service: 'Segurança pública' }
    ];
    
    if (destination.toLowerCase().includes('bonito')) {
      baseContacts.push({
        name: 'Centro de Atendimento ao Turista',
        phone: '(67) 3255-1850',
        service: 'Informações turísticas'
      });
    }
    
    baseContacts.push({
      name: 'Fundtur-MS',
      phone: '(67) 3318-5000',
      service: 'Turismo estadual'
    });
    
    return baseContacts;
  }

  /**
   * Gerar resumo do roteiro
   */
  private static generateSummary(request: ItineraryRequest, locationsCount: number): string {
    return `Roteiro personalizado para ${request.group_type} interessado em ${request.interests.join(', ')}. 
    Inclui ${locationsCount} locais verificados em ${request.destination}, 
    adequado para orçamento ${request.budget} com transporte ${request.mobility}.`;
  }

  /**
   * Calcular custo total estimado
   */
  private static calculateTotalCost(
    request: ItineraryRequest, 
    locations: MSLocation[], 
    partners: PartnerRecommendation[]
  ): string {
    const baseCosts = {
      'baixo': { daily: 40, total: 40 * request.days },
      'medio': { daily: 100, total: 100 * request.days },
      'alto': { daily: 300, total: 300 * request.days }
    };
    
    const cost = baseCosts[request.budget as keyof typeof baseCosts];
    return `R$ ${cost.total} a R$ ${cost.total * 1.5} (${request.days} dias)`;
  }

  /**
   * Fallback para roteiro básico
   */
  private static generateBasicItinerary(request: ItineraryRequest): GeneratedItinerary {
    const basicLocations = MSKnowledgeBase.searchLocations(request.destination).slice(0, 3);
    
    return {
      title: `Roteiro Básico - ${request.destination}`,
      summary: `Roteiro simplificado para ${request.destination} com locais principais verificados.`,
      total_days: request.days,
      estimated_total_cost: 'R$ 50 a R$ 200 por dia',
      days: [{
        day: 1,
        title: `Descobrindo ${request.destination}`,
        locations: basicLocations.map(loc => ({
          location: loc,
          time_slot: 'Dia todo',
          duration: '2-3 horas',
          why_recommended: 'Local verificado na base de conhecimento'
        })),
        partners: [],
        estimated_cost: 'R$ 50 a R$ 100',
        tips: ['Consulte horários de funcionamento', 'Leve água e protetor solar']
      }],
      general_tips: ['Verifique condições climáticas', 'Tenha contatos de emergência'],
      emergency_contacts: this.getEmergencyContacts(request.destination)
    };
  }

  /**
   * Validar e otimizar roteiro gerado
   */
  static validateItinerary(itinerary: GeneratedItinerary): boolean {
    return (
      itinerary.days.length > 0 &&
      itinerary.days.every(day => day.locations.length > 0) &&
      itinerary.emergency_contacts.length > 0
    );
  }
}
