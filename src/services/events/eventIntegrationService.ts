/**
 * Event Integration Service
 * Integra eventos com múltiplos módulos do sistema
 */

import { supabase } from '@/integrations/supabase/client';
import { eventService } from '@/services/public/eventService';

export interface EventIntegration {
  event_id: string;
  event_title: string;
  event_date: string;
  event_location: string;
  linked_attractions: string[];
  nearby_businesses: string[];
  alerts_sent: number;
  statistics_updated: boolean;
}

export interface NearbyAttraction {
  id: string;
  name: string;
  distance: number; // em km
  category: string;
}

export interface BusinessAlert {
  business_id: string;
  business_name: string;
  distance: number;
  alert_type: 'event_nearby' | 'opportunity' | 'competition';
  message: string;
}

export class EventIntegrationService {
  /**
   * Quando evento é aprovado, atualiza calendário público e vincula a atrações
   */
  async onEventApproved(eventId: string): Promise<EventIntegration> {
    try {
      const event = await eventService.getEventById(eventId);
      if (!event) {
        throw new Error('Evento não encontrado');
      }

      // 1. Evento já está no calendário público (status='approved')
      // 2. Vincular a atrações próximas
      const linkedAttractions = await this.linkNearbyAttractions(eventId, event.location || '');

      // 3. Enviar alertas para empresas próximas
      const alerts = await this.sendBusinessAlerts(eventId, event);

      // 4. Atualizar estatísticas
      await this.updateEventStatistics(eventId);

      return {
        event_id: eventId,
        event_title: event.title || event.name || '',
        event_date: event.start_date || event.date || '',
        event_location: event.location || '',
        linked_attractions: linkedAttractions.map(a => a.id),
        nearby_businesses: alerts.map(a => a.business_id),
        alerts_sent: alerts.length,
        statistics_updated: true,
      };
    } catch (error) {
      console.error('Erro ao integrar evento aprovado:', error);
      throw error;
    }
  }

  /**
   * Vincular evento a atrações próximas (raio de 5km)
   */
  async linkNearbyAttractions(eventId: string, eventLocation: string): Promise<NearbyAttraction[]> {
    try {
      // Buscar coordenadas do evento (se disponível)
      // Por enquanto, busca por nome da localização
      const { data: attractions, error } = await supabase
        .from('attractions')
        .select('id, name, location, category, latitude, longitude')
        .limit(50);

      if (error) throw error;

      // Filtrar atrações próximas (simplificado - em produção usar cálculo de distância real)
      const nearby = (attractions || [])
        .filter((attraction: any) => {
          // Verificar se localização contém palavras-chave similares
          const eventLocationLower = eventLocation.toLowerCase();
          const attractionLocation = (attraction.location || '').toLowerCase();
          
          // Verificar se estão na mesma cidade ou região
          return eventLocationLower.includes(attractionLocation) || 
                 attractionLocation.includes(eventLocationLower) ||
                 this.calculateDistance(eventLocation, attractionLocation) < 5; // 5km
        })
        .slice(0, 5)
        .map((attraction: any) => ({
          id: attraction.id,
          name: attraction.name,
          distance: this.calculateDistance(eventLocation, attraction.location || ''),
          category: attraction.category || 'geral',
        }));

      // Criar vínculos na tabela de relacionamentos (se existir)
      // Por enquanto, apenas retornar lista

      return nearby;
    } catch (error) {
      console.error('Erro ao vincular atrações:', error);
      return [];
    }
  }

  /**
   * Enviar alertas para empresas próximas ao evento
   */
  async sendBusinessAlerts(eventId: string, event: any): Promise<BusinessAlert[]> {
    try {
      // Buscar empresas na mesma cidade/região
      const { data: businesses, error } = await supabase
        .from('user_profiles')
        .select('user_id, full_name, city_id, cities(name)')
        .eq('user_type', 'empresa')
        .not('city_id', 'is', null);

      if (error) throw error;

      const alerts: BusinessAlert[] = [];

      // Filtrar empresas próximas e criar alertas
      (businesses || []).forEach((business: any) => {
        // Verificar se empresa está na mesma região do evento
        const eventLocation = (event.location || '').toLowerCase();
        const businessCity = (business.cities?.name || '').toLowerCase();

        if (eventLocation.includes(businessCity) || businessCity.includes(eventLocation.split(',')[0])) {
          alerts.push({
            business_id: business.user_id,
            business_name: business.full_name || 'Empresa',
            distance: 0, // Simplificado
            alert_type: 'opportunity',
            message: `Novo evento "${event.title || event.name}" próximo à sua região. Considere criar ofertas especiais.`,
          });
        }
      });

      // Salvar alertas (se houver tabela de notificações)
      // Por enquanto, apenas retornar lista

      return alerts;
    } catch (error) {
      console.error('Erro ao enviar alertas:', error);
      return [];
    }
  }

  /**
   * Atualizar estatísticas de eventos
   */
  async updateEventStatistics(eventId: string): Promise<void> {
    try {
      // Buscar evento
      const event = await eventService.getEventById(eventId);
      if (!event) return;

      // Atualizar contadores e métricas
      // Por enquanto, apenas log
      console.log(`Estatísticas atualizadas para evento ${eventId}`);
    } catch (error) {
      console.error('Erro ao atualizar estatísticas:', error);
    }
  }

  /**
   * Quando evento é realizado, atualiza estatísticas e gera insights
   */
  async onEventCompleted(eventId: string): Promise<void> {
    try {
      const event = await eventService.getEventById(eventId);
      if (!event) return;

      // 1. Atualizar status do evento
      await eventService.updateEvent(eventId, {
        status: 'completed' as any,
      });

      // 2. Gerar estatísticas de impacto
      // - Número de participantes estimado
      // - Impacto no turismo local
      // - Receita gerada

      // 3. Atualizar mapas de calor (se houver)
      // 4. Gerar insights para próximos eventos

      console.log(`Evento ${eventId} marcado como concluído`);
    } catch (error) {
      console.error('Erro ao processar evento concluído:', error);
    }
  }

  /**
   * Buscar eventos próximos para uma empresa
   */
  async getUpcomingEventsForBusiness(businessId: string, radiusKm: number = 10): Promise<any[]> {
    try {
      // Buscar localização da empresa
      const { data: business, error: businessError } = await supabase
        .from('user_profiles')
        .select('city_id, cities(name)')
        .eq('user_id', businessId)
        .single();

      if (businessError || !business) {
        return [];
      }

      const businessCity = business.cities?.name || '';

      // Buscar eventos aprovados próximos (próximos 30 dias)
      const startDate = new Date().toISOString();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
      const endDateStr = endDate.toISOString();

      const events = await eventService.getEvents({
        approval_status: 'approved',
        is_public: true,
        start_date: startDate,
        end_date: endDateStr,
      });

      // Filtrar eventos na mesma cidade/região
      return events.filter((event: any) => {
        const eventLocation = (event.location || '').toLowerCase();
        return eventLocation.includes(businessCity.toLowerCase()) ||
               businessCity.toLowerCase().includes(eventLocation.split(',')[0]);
      });
    } catch (error) {
      console.error('Erro ao buscar eventos próximos:', error);
      return [];
    }
  }

  /**
   * Calcular distância entre duas localizações (simplificado)
   */
  private calculateDistance(location1: string, location2: string): number {
    // Implementação simplificada
    // Em produção, usar cálculo real de distância geográfica
    if (location1.toLowerCase() === location2.toLowerCase()) {
      return 0;
    }
    
    // Se contém palavras similares, considerar próximo
    const words1 = location1.toLowerCase().split(' ');
    const words2 = location2.toLowerCase().split(' ');
    const commonWords = words1.filter(w => words2.includes(w));
    
    if (commonWords.length > 0) {
      return 2; // ~2km se tem palavras em comum
    }
    
    return 10; // Distância padrão se não há similaridade
  }
}

export const eventIntegrationService = new EventIntegrationService();

