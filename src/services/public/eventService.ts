/**
 * Event Management Service
 * Serviço para gerenciamento de eventos turísticos no Supabase
 */

import { supabase } from '@/integrations/supabase/client';

export interface TourismEvent {
  id: string;
  name: string; // A tabela usa 'name' não 'title'
  title?: string; // alias para name
  description?: string;
  location?: string;
  start_date: string; // ISO string - A tabela usa 'start_date' não 'date'
  date?: string; // alias para start_date
  end_date?: string; // ISO string
  image_url?: string;
  images?: string[]; // Para compatibilidade
  visibility_end_date?: string;
  is_visible?: boolean;
  is_public?: boolean; // alias para is_visible
  auto_hide?: boolean;
  created_by?: string;
  city_id?: string;
  state_id?: string;
  city?: string; // Para compatibilidade
  state?: string; // Para compatibilidade
  category?: 'cultural' | 'gastronomic' | 'sports' | 'religious' | 'entertainment' | 'business'; // Não está na tabela
  expected_audience?: number; // Não está na tabela
  budget?: number; // Não está na tabela
  status?: 'planned' | 'active' | 'completed' | 'cancelled'; // Não está na tabela
  approval_status?: 'pending' | 'approved' | 'rejected'; // Status de aprovação para eventos do MS
  contact_phone?: string; // Não está na tabela
  contact_email?: string; // Não está na tabela
  contact_website?: string; // Não está na tabela
  features?: string[]; // Não está na tabela
  created_at?: string;
  updated_at?: string;
}

export interface EventFilters {
  category?: string;
  status?: string;
  approval_status?: 'pending' | 'approved' | 'rejected';
  city?: string;
  state?: string;
  start_date?: string;
  end_date?: string;
  is_public?: boolean;
  search?: string;
}

export class EventService {
  /**
   * Buscar todos os eventos com filtros opcionais
   */
  async getEvents(filters?: EventFilters): Promise<TourismEvent[]> {
    try {
      let query = supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: true });

      if (filters) {
        if (filters.category) {
          query = query.eq('category', filters.category);
        }
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        if (filters.approval_status) {
          query = query.eq('approval_status', filters.approval_status);
        }
        if (filters.city) {
          query = query.eq('city', filters.city);
        }
        if (filters.state) {
          query = query.eq('state', filters.state);
        }
        if (filters.is_public !== undefined) {
          query = query.eq('is_visible', filters.is_public);
        }
        if (filters.start_date) {
          query = query.gte('start_date', filters.start_date);
        }
        if (filters.end_date) {
          query = query.lte('end_date', filters.end_date);
        }
        if (filters.search) {
          query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,location.ilike.%${filters.search}%`);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Normalizar resposta para incluir aliases
      return (data || []).map((item: any) => ({
        ...item,
        title: item.name,
        date: item.start_date,
        is_public: item.is_visible,
        images: item.images && Array.isArray(item.images) && item.images.length > 0 
          ? item.images 
          : (item.image_url ? [item.image_url] : []),
      })) as TourismEvent[];
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      return [];
    }
  }

  /**
   * Buscar evento por ID
   */
  async getEventById(id: string): Promise<TourismEvent | null> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      // Normalizar resposta
      const result = data as any;
      return {
        ...result,
        title: result.name,
        date: result.start_date,
        is_public: result.is_visible,
        images: result.image_url ? [result.image_url] : [],
      } as TourismEvent;
    } catch (error) {
      console.error('Erro ao buscar evento:', error);
      return null;
    }
  }

  /**
   * Criar novo evento
   */
  async createEvent(event: Omit<TourismEvent, 'id' | 'created_at' | 'updated_at'>): Promise<TourismEvent> {
    try {
      // Converter para formato da tabela
      const insertData: any = {
        name: event.title || event.name || '',
        description: event.description,
        location: event.location,
        start_date: event.date || event.start_date,
        end_date: event.end_date,
        image_url: event.image_url || (event.images && event.images[0]),
        images: event.images && Array.isArray(event.images) ? event.images : undefined,
        category: event.category,
        status: event.status,
        approval_status: event.approval_status,
        expected_audience: event.expected_audience,
        budget: event.budget,
        contact_phone: event.contact_phone,
        contact_email: event.contact_email,
        contact_website: event.contact_website,
        features: event.features,
        is_visible: event.is_public !== undefined ? event.is_public : (event.is_visible !== undefined ? event.is_visible : true),
        created_by: event.created_by,
        city_id: event.city_id,
        state_id: event.state_id,
      };

      const { data, error } = await supabase
        .from('events')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      
      // Normalizar resposta
      const result = data as any;
      return {
        ...result,
        title: result.name,
        date: result.start_date,
        is_public: result.is_visible,
        images: result.images && Array.isArray(result.images) && result.images.length > 0
          ? result.images
          : (result.image_url ? [result.image_url] : []),
      } as TourismEvent;
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      throw error;
    }
  }

  /**
   * Atualizar evento
   */
  async updateEvent(id: string, updates: Partial<TourismEvent>): Promise<TourismEvent> {
    try {
      // Converter updates para formato da tabela
      const updateData: any = { ...updates };
      if (updateData.title) {
        updateData.name = updateData.title;
        delete updateData.title;
      }
      if (updateData.date) {
        updateData.start_date = updateData.date;
        delete updateData.date;
      }
      if (updateData.is_public !== undefined) {
        updateData.is_visible = updateData.is_public;
        delete updateData.is_public;
      }
      // Tratar imagens: se for array, usar primeira como image_url e salvar array completo
      if (updateData.images) {
        if (Array.isArray(updateData.images) && updateData.images.length > 0) {
          updateData.image_url = updateData.images[0];
          // Manter o array de imagens se a coluna existir
          // Se não existir, apenas usar image_url
        } else if (typeof updateData.images === 'string') {
          updateData.image_url = updateData.images;
          delete updateData.images;
        }
      }

      const { data, error } = await supabase
        .from('events')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Normalizar resposta
      const result = data as any;
      return {
        ...result,
        title: result.name,
        date: result.start_date,
        is_public: result.is_visible,
        images: result.images && Array.isArray(result.images) && result.images.length > 0
          ? result.images
          : (result.image_url ? [result.image_url] : []),
      } as TourismEvent;
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      throw error;
    }
  }

  /**
   * Deletar evento
   */
  async deleteEvent(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar evento:', error);
      throw error;
    }
  }

  /**
   * Buscar eventos por período
   */
  async getEventsByPeriod(startDate: string, endDate: string): Promise<TourismEvent[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('start_date', startDate)
        .lte('start_date', endDate)
        .order('start_date', { ascending: true });

      if (error) throw error;
      
      // Normalizar resposta
      return (data || []).map((item: any) => ({
        ...item,
        title: item.name,
        date: item.start_date,
        is_public: item.is_visible,
        images: item.image_url ? [item.image_url] : [],
      })) as TourismEvent[];
    } catch (error) {
      console.error('Erro ao buscar eventos por período:', error);
      return [];
    }
  }
}

export const eventService = new EventService();

