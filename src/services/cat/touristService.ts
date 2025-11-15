/**
 * Tourist Service
 * Serviço para gerenciar turistas atendidos nos CATs
 */

import { supabase } from '@/integrations/supabase/client';

export interface Tourist {
  id: string;
  cat_id: string | null;
  attendant_id: string | null;
  name: string | null;
  origin_country: string | null;
  origin_state: string | null;
  origin_city: string | null;
  email: string | null;
  phone: string | null;
  visit_date: string;
  visit_time: string;
  interests: string[] | null;
  questions_asked: string[] | null;
  rating: number | null;
  feedback: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export class TouristService {
  /**
   * Registrar turista atendido
   */
  async registerTourist(
    data: {
      cat_id?: string;
      attendant_id?: string;
      name?: string;
      origin_country?: string;
      origin_state?: string;
      origin_city?: string;
      email?: string;
      phone?: string;
      interests?: string[];
      questions_asked?: string[];
    }
  ): Promise<Tourist> {
    try {
      const { data: tourist, error } = await supabase
        .from('cat_tourists')
        .insert({
          ...data,
          visit_date: new Date().toISOString().split('T')[0],
          visit_time: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return tourist as Tourist;
    } catch (error) {
      console.error('Erro ao registrar turista:', error);
      throw error;
    }
  }

  /**
   * Listar turistas
   */
  async getTourists(filters?: {
    cat_id?: string;
    attendant_id?: string;
    startDate?: string;
    endDate?: string;
    is_active?: boolean;
  }): Promise<Tourist[]> {
    try {
      let query = supabase
        .from('cat_tourists')
        .select('*')
        .order('visit_date', { ascending: false })
        .order('visit_time', { ascending: false });

      if (filters?.cat_id) {
        query = query.eq('cat_id', filters.cat_id);
      }

      if (filters?.attendant_id) {
        query = query.eq('attendant_id', filters.attendant_id);
      }

      if (filters?.startDate) {
        query = query.gte('visit_date', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('visit_date', filters.endDate);
      }

      if (filters?.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as Tourist[];
    } catch (error) {
      console.error('Erro ao buscar turistas:', error);
      return [];
    }
  }

  /**
   * Buscar turista por ID
   */
  async getTouristById(id: string): Promise<Tourist | null> {
    try {
      const { data, error } = await supabase
        .from('cat_tourists')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data as Tourist;
    } catch (error) {
      console.error('Erro ao buscar turista:', error);
      return null;
    }
  }

  /**
   * Atualizar dados do turista
   */
  async updateTourist(
    id: string,
    updates: Partial<Tourist>
  ): Promise<Tourist> {
    try {
      const { data, error } = await supabase
        .from('cat_tourists')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Tourist;
    } catch (error) {
      console.error('Erro ao atualizar turista:', error);
      throw error;
    }
  }

  /**
   * Adicionar avaliação do turista
   */
  async addRating(
    id: string,
    rating: number,
    feedback?: string
  ): Promise<Tourist> {
    try {
      const { data, error } = await supabase
        .from('cat_tourists')
        .update({
          rating,
          feedback: feedback || null
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Tourist;
    } catch (error) {
      console.error('Erro ao adicionar avaliação:', error);
      throw error;
    }
  }

  /**
   * Deletar turista (soft delete)
   */
  async deleteTourist(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('cat_tourists')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar turista:', error);
      throw error;
    }
  }

  /**
   * Buscar estatísticas de atendimento
   */
  async getTouristStats(filters?: {
    cat_id?: string;
    attendant_id?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    averageRating: number;
    byOrigin: { [key: string]: number };
    byDate: { [key: string]: number };
  }> {
    try {
      const tourists = await this.getTourists({
        ...filters,
        is_active: true
      });

      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      const todayTourists = tourists.filter(t => t.visit_date === today);
      const weekTourists = tourists.filter(t => 
        new Date(t.visit_date) >= weekAgo
      );
      const monthTourists = tourists.filter(t => 
        new Date(t.visit_date) >= monthAgo
      );

      const ratedTourists = tourists.filter(t => t.rating !== null);
      const averageRating = ratedTourists.length > 0
        ? ratedTourists.reduce((sum, t) => sum + (t.rating || 0), 0) / ratedTourists.length
        : 0;

      const byOrigin: { [key: string]: number } = {};
      tourists.forEach(t => {
        const origin = t.origin_state || t.origin_country || 'Desconhecido';
        byOrigin[origin] = (byOrigin[origin] || 0) + 1;
      });

      const byDate: { [key: string]: number } = {};
      tourists.forEach(t => {
        byDate[t.visit_date] = (byDate[t.visit_date] || 0) + 1;
      });

      return {
        total: tourists.length,
        today: todayTourists.length,
        thisWeek: weekTourists.length,
        thisMonth: monthTourists.length,
        averageRating: Math.round(averageRating * 100) / 100,
        byOrigin,
        byDate
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return {
        total: 0,
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        averageRating: 0,
        byOrigin: {},
        byDate: {}
      };
    }
  }
}

export const touristService = new TouristService();

