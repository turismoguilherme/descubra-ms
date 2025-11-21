/**
 * Tourist Service Service
 * Serviço para gerenciar registros de atendimento presencial aos turistas
 */

import { supabase } from '@/integrations/supabase/client';

export interface TouristService {
  id?: string;
  attendant_id: string;
  cat_id?: string;
  cat_name?: string;
  service_date: Date | string;
  service_type: 'informacao' | 'orientacao' | 'venda' | 'reclamacao' | 'outro';
  tourist_origin_country?: string;
  tourist_origin_state?: string;
  tourist_origin_city?: string;
  tourist_motive?: string;
  service_duration_minutes?: number;
  satisfaction_rating?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceStats {
  totalServices: number;
  byType: Record<string, number>;
  byOrigin: {
    country: Record<string, number>;
    state: Record<string, number>;
  };
  averageDuration: number;
  averageSatisfaction: number;
  servicesByDay: Array<{ date: string; count: number }>;
  peakHours: Array<{ hour: number; count: number }>;
}

export class TouristServiceService {
  /**
   * Criar novo registro de atendimento
   */
  async createService(service: TouristService): Promise<TouristService> {
    try {
      const { data, error } = await supabase
        .from('tourist_services')
        .insert({
          attendant_id: service.attendant_id,
          cat_id: service.cat_id || null,
          cat_name: service.cat_name || null,
          service_date: service.service_date instanceof Date 
            ? service.service_date.toISOString() 
            : service.service_date,
          service_type: service.service_type,
          tourist_origin_country: service.tourist_origin_country || null,
          tourist_origin_state: service.tourist_origin_state || null,
          tourist_origin_city: service.tourist_origin_city || null,
          tourist_motive: service.tourist_motive || null,
          service_duration_minutes: service.service_duration_minutes || null,
          satisfaction_rating: service.satisfaction_rating || null,
          notes: service.notes || null,
        })
        .select()
        .single();

      if (error) throw error;

      return this.mapToTouristService(data);
    } catch (error) {
      console.error('Erro ao criar serviço:', error);
      throw error;
    }
  }

  /**
   * Buscar registros de um atendente
   */
  async getAttendantServices(
    attendantId: string,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<TouristService[]> {
    try {
      let query = supabase
        .from('tourist_services')
        .select('*')
        .eq('attendant_id', attendantId)
        .order('service_date', { ascending: false });

      if (dateFrom) {
        query = query.gte('service_date', dateFrom.toISOString());
      }

      if (dateTo) {
        query = query.lte('service_date', dateTo.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(item => this.mapToTouristService(item));
    } catch (error) {
      console.error('Erro ao buscar serviços do atendente:', error);
      return [];
    }
  }

  /**
   * Buscar serviços por CAT
   */
  async getServicesByCAT(
    catId?: string,
    catName?: string,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<TouristService[]> {
    try {
      let query = supabase
        .from('tourist_services')
        .select('*')
        .order('service_date', { ascending: false });

      if (catId) {
        query = query.eq('cat_id', catId);
      } else if (catName) {
        query = query.ilike('cat_name', `%${catName}%`);
      }

      if (dateFrom) {
        query = query.gte('service_date', dateFrom.toISOString());
      }

      if (dateTo) {
        query = query.lte('service_date', dateTo.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(item => this.mapToTouristService(item));
    } catch (error) {
      console.error('Erro ao buscar serviços por CAT:', error);
      return [];
    }
  }

  /**
   * Obter estatísticas de atendimentos
   */
  async getServiceStats(
    cityId?: string,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<ServiceStats> {
    try {
      const startDate = dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = dateTo || new Date();

      let query = supabase
        .from('tourist_services')
        .select('*')
        .gte('service_date', startDate.toISOString())
        .lte('service_date', endDate.toISOString());

      // Filtrar por cidade se fornecido
      if (cityId) {
        // Buscar atendentes da cidade
        const { data: attendants } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('city_id', cityId)
          .eq('user_role', 'atendente');

        if (attendants && attendants.length > 0) {
          const attendantIds = attendants.map(a => a.id);
          query = query.in('attendant_id', attendantIds);
        } else {
          // Nenhum atendente na cidade, retornar stats vazias
          return this.getEmptyStats();
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      return this.calculateStats(data || []);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return this.getEmptyStats();
    }
  }

  /**
   * Calcular estatísticas a partir dos dados
   */
  private calculateStats(services: any[]): ServiceStats {
    const stats: ServiceStats = {
      totalServices: services.length,
      byType: {},
      byOrigin: {
        country: {},
        state: {},
      },
      averageDuration: 0,
      averageSatisfaction: 0,
      servicesByDay: [],
      peakHours: [],
    };

    if (services.length === 0) return stats;

    // Por tipo
    services.forEach(service => {
      const type = service.service_type || 'outro';
      stats.byType[type] = (stats.byType[type] || 0) + 1;
    });

    // Por origem
    services.forEach(service => {
      if (service.tourist_origin_country) {
        const country = service.tourist_origin_country;
        stats.byOrigin.country[country] = (stats.byOrigin.country[country] || 0) + 1;
      }
      if (service.tourist_origin_state) {
        const state = service.tourist_origin_state;
        stats.byOrigin.state[state] = (stats.byOrigin.state[state] || 0) + 1;
      }
    });

    // Duração média
    const durations = services
      .filter(s => s.service_duration_minutes)
      .map(s => s.service_duration_minutes);
    if (durations.length > 0) {
      stats.averageDuration = Math.round(
        durations.reduce((sum, d) => sum + d, 0) / durations.length
      );
    }

    // Satisfação média
    const ratings = services
      .filter(s => s.satisfaction_rating)
      .map(s => s.satisfaction_rating);
    if (ratings.length > 0) {
      stats.averageSatisfaction = Math.round(
        (ratings.reduce((sum, r) => sum + r, 0) / ratings.length) * 10
      ) / 10;
    }

    // Por dia
    const byDay: Record<string, number> = {};
    services.forEach(service => {
      const date = new Date(service.service_date).toISOString().split('T')[0];
      byDay[date] = (byDay[date] || 0) + 1;
    });
    stats.servicesByDay = Object.entries(byDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Horários de pico
    const byHour: Record<number, number> = {};
    services.forEach(service => {
      const hour = new Date(service.service_date).getHours();
      byHour[hour] = (byHour[hour] || 0) + 1;
    });
    stats.peakHours = Object.entries(byHour)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return stats;
  }

  /**
   * Retornar estatísticas vazias
   */
  private getEmptyStats(): ServiceStats {
    return {
      totalServices: 0,
      byType: {},
      byOrigin: {
        country: {},
        state: {},
      },
      averageDuration: 0,
      averageSatisfaction: 0,
      servicesByDay: [],
      peakHours: [],
    };
  }

  /**
   * Mapear dados do banco para interface
   */
  private mapToTouristService(data: any): TouristService {
    return {
      id: data.id,
      attendant_id: data.attendant_id,
      cat_id: data.cat_id,
      cat_name: data.cat_name,
      service_date: data.service_date,
      service_type: data.service_type,
      tourist_origin_country: data.tourist_origin_country,
      tourist_origin_state: data.tourist_origin_state,
      tourist_origin_city: data.tourist_origin_city,
      tourist_motive: data.tourist_motive,
      service_duration_minutes: data.service_duration_minutes,
      satisfaction_rating: data.satisfaction_rating,
      notes: data.notes,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  }
}

export const touristServiceService = new TouristServiceService();

