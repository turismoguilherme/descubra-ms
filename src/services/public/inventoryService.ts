/**
 * Tourism Inventory Service
 * Serviço para gerenciamento de inventário turístico no Supabase
 */

import { supabase } from '@/integrations/supabase/client';

export interface TourismAttraction {
  id: string;
  name: string;
  description: string;
  short_description?: string;
  category_id?: string;
  subcategory_id?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  opening_hours?: any; // JSONB
  price_range?: 'free' | 'low' | 'medium' | 'high';
  capacity?: number;
  amenities?: string[]; // JSONB
  images?: string[]; // JSONB
  videos?: string[]; // JSONB
  meta_title?: string;
  meta_description?: string;
  tags?: string[];
  status?: 'draft' | 'pending' | 'approved' | 'rejected';
  is_featured?: boolean;
  is_active?: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface InventoryCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  parent_id?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface InventoryFilters {
  category_id?: string;
  city?: string;
  state?: string;
  status?: string;
  is_active?: boolean;
  is_featured?: boolean;
  search?: string;
  latitude?: number;
  longitude?: number;
  radius_km?: number; // Busca por raio
}

export class InventoryService {
  /**
   * Buscar todas as atrações com filtros opcionais
   */
  async getAttractions(filters?: InventoryFilters): Promise<TourismAttraction[]> {
    try {
      let query = supabase
        .from('tourism_inventory')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters) {
        if (filters.category_id) {
          query = query.eq('category_id', filters.category_id);
        }
        if (filters.city) {
          query = query.eq('city', filters.city);
        }
        if (filters.state) {
          query = query.eq('state', filters.state);
        }
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        if (filters.is_active !== undefined) {
          query = query.eq('is_active', filters.is_active);
        }
        if (filters.is_featured !== undefined) {
          query = query.eq('is_featured', filters.is_featured);
        }
        if (filters.search) {
          query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,address.ilike.%${filters.search}%`);
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      // Se houver filtro de raio, filtrar localmente (Supabase não tem função de distância nativa sem extensão)
      if (filters?.latitude && filters?.longitude && filters?.radius_km && data) {
        const filtered = data.filter((item) => {
          if (!item.latitude || !item.longitude) return false;
          const distance = this.calculateDistance(
            filters.latitude!,
            filters.longitude!,
            Number(item.latitude),
            Number(item.longitude)
          );
          return distance <= filters.radius_km!;
        });
        return filtered as TourismAttraction[];
      }

      return (data || []) as TourismAttraction[];
    } catch (error) {
      console.error('Erro ao buscar atrações:', error);
      return [];
    }
  }

  /**
   * Buscar atração por ID
   */
  async getAttractionById(id: string): Promise<TourismAttraction | null> {
    try {
      const { data, error } = await supabase
        .from('tourism_inventory')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data as TourismAttraction;
    } catch (error) {
      console.error('Erro ao buscar atração:', error);
      return null;
    }
  }

  /**
   * Criar nova atração
   */
  async createAttraction(attraction: Omit<TourismAttraction, 'id' | 'created_at' | 'updated_at'>): Promise<TourismAttraction> {
    try {
      const { data, error } = await supabase
        .from('tourism_inventory')
        .insert({
          ...attraction,
          status: attraction.status || 'draft',
          is_active: attraction.is_active !== undefined ? attraction.is_active : true,
          is_featured: attraction.is_featured || false,
        })
        .select()
        .single();

      if (error) throw error;
      return data as TourismAttraction;
    } catch (error) {
      console.error('Erro ao criar atração:', error);
      throw error;
    }
  }

  /**
   * Atualizar atração
   */
  async updateAttraction(id: string, updates: Partial<TourismAttraction>): Promise<TourismAttraction> {
    try {
      const { data, error } = await supabase
        .from('tourism_inventory')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as TourismAttraction;
    } catch (error) {
      console.error('Erro ao atualizar atração:', error);
      throw error;
    }
  }

  /**
   * Deletar atração
   */
  async deleteAttraction(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tourism_inventory')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar atração:', error);
      throw error;
    }
  }

  /**
   * Buscar categorias
   */
  async getCategories(): Promise<InventoryCategory[]> {
    try {
      const { data, error } = await supabase
        .from('inventory_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return (data || []) as InventoryCategory[];
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      return [];
    }
  }

  /**
   * Calcular distância entre dois pontos (Haversine)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Raio da Terra em km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Exportar atrações para CSV
   */
  async exportToCSV(filters?: InventoryFilters): Promise<string> {
    try {
      const attractions = await this.getAttractions(filters);
      
      if (attractions.length === 0) {
        return 'Nome,Descrição,Endereço,Cidade,Estado,Categoria\n';
      }

      const headers = ['Nome', 'Descrição', 'Endereço', 'Cidade', 'Estado', 'Categoria', 'Status'];
      const rows = attractions.map(attr => [
        attr.name || '',
        (attr.description || '').replace(/,/g, ';'),
        attr.address || '',
        attr.city || '',
        attr.state || '',
        attr.category_id || '',
        attr.status || ''
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      return csv;
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      throw error;
    }
  }
}

export const inventoryService = new InventoryService();








