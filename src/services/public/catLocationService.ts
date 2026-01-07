/**
 * CAT Location Service
 * Serviço para gerenciamento de localizações de CATs no Supabase
 */

import { supabase } from '@/integrations/supabase/client';

export interface CATLocation {
  id: string;
  name: string;
  address?: string;
  city: string;
  state?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  coordinates?: { lat: number; lng: number }; // JSONB - formato alternativo
  radius?: number; // em metros (para compatibilidade)
  radius_km?: number; // em quilômetros (campo da tabela)
  is_active: boolean;
  contact_phone?: string;
  contact_email?: string;
  phone?: string; // alias para contact_phone
  email?: string; // alias para contact_email
  working_hours?: string;
  opening_hours?: string; // alias para working_hours
  services?: string[];
  zip_code?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CATLocationFilters {
  city?: string;
  state?: string;
  is_active?: boolean;
  search?: string;
}

export class CATLocationService {
  /**
   * Buscar todas as localizações de CATs com filtros opcionais
   */
  async getCATLocations(filters?: CATLocationFilters): Promise<CATLocation[]> {
    try {
      let query = supabase
        .from('cat_locations')
        .select('*')
        .order('name', { ascending: true });

      if (filters) {
        if (filters.city) {
          query = query.eq('city', filters.city);
        }
        if (filters.state) {
          query = query.eq('region', filters.state); // Usar 'region' ao invés de 'state'
        }
        if (filters.is_active !== undefined) {
          query = query.eq('is_active', filters.is_active);
        }
        if (filters.search) {
          query = query.or(`name.ilike.%${filters.search}%,address.ilike.%${filters.search}%`);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Normalizar resposta para incluir aliases
      return (data || []).map((item: any) => ({
        ...item,
        phone: item.contact_phone,
        email: item.contact_email,
        opening_hours: item.working_hours,
        latitude: item.latitude || item.coordinates?.lat,
        longitude: item.longitude || item.coordinates?.lng,
        radius: item.radius_km ? item.radius_km * 1000 : undefined, // Converter km para metros para compatibilidade
      })) as CATLocation[];
    } catch (error) {
      console.error('Erro ao buscar localizações de CATs:', error);
      return [];
    }
  }

  /**
   * Buscar localização de CAT por ID
   */
  async getCATLocationById(id: string): Promise<CATLocation | null> {
    try {
      const { data, error } = await supabase
        .from('cat_locations')
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
        phone: result.contact_phone,
        email: result.contact_email,
        opening_hours: result.working_hours,
        latitude: result.latitude || result.coordinates?.lat,
        longitude: result.longitude || result.coordinates?.lng,
        radius: result.radius_km ? result.radius_km * 1000 : undefined,
      } as CATLocation;
    } catch (error) {
      console.error('Erro ao buscar localização de CAT:', error);
      return null;
    }
  }

  /**
   * Criar nova localização de CAT
   */
  async createCATLocation(cat: Omit<CATLocation, 'id' | 'created_at' | 'updated_at'>): Promise<CATLocation> {
    try {

      // Converter latitude/longitude para coordinates se necessário
      const insertData: any = {
        name: cat.name,
        address: cat.address || '',
        city: cat.city || '',
        state: cat.state,
        region: cat.region,
        is_active: cat.is_active !== undefined ? cat.is_active : true,
        contact_phone: cat.phone || cat.contact_phone,
        contact_email: cat.email || cat.contact_email,
        working_hours: cat.opening_hours || cat.working_hours,
        services: cat.services || [],
      };

      // Usar latitude/longitude diretamente (schema atual do banco)
      if (cat.latitude !== undefined && cat.longitude !== undefined) {
        insertData.latitude = cat.latitude;
        insertData.longitude = cat.longitude;
      } else if (cat.coordinates) {
        insertData.latitude = cat.coordinates.lat;
        insertData.longitude = cat.coordinates.lng;
      }

      // Converter radius (metros) para radius_km (quilômetros) se fornecido
      if (cat.radius !== undefined) {
        insertData.radius_km = cat.radius / 1000; // Converter metros para km
      } else if (cat.radius_km !== undefined) {
        insertData.radius_km = cat.radius_km;
      }


      const { data, error } = await supabase
        .from('cat_locations')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      
      // Normalizar resposta
      const result = data as any;
      return {
        ...result,
        phone: result.contact_phone,
        email: result.contact_email,
        opening_hours: result.working_hours,
        latitude: result.latitude || result.coordinates?.lat,
        longitude: result.longitude || result.coordinates?.lng,
        radius: result.radius_km ? result.radius_km * 1000 : undefined,
      } as CATLocation;
    } catch (error) {
      console.error('Erro ao criar localização de CAT:', error);
      throw error;
    }
  }

  /**
   * Atualizar localização de CAT
   */
  async updateCATLocation(id: string, updates: Partial<CATLocation>): Promise<CATLocation> {
    try {
      const updateData: any = { ...updates };
      
      // Converter radius (metros) para radius_km (quilômetros) se fornecido
      if (updateData.radius !== undefined) {
        updateData.radius_km = updateData.radius / 1000; // Converter metros para km
        delete updateData.radius;
      }
      
      // Mapear aliases
      if (updateData.phone) {
        updateData.contact_phone = updateData.phone;
        delete updateData.phone;
      }
      if (updateData.email) {
        updateData.contact_email = updateData.email;
        delete updateData.email;
      }
      if (updateData.opening_hours) {
        updateData.working_hours = updateData.opening_hours;
        delete updateData.opening_hours;
      }

      const { data, error } = await supabase
        .from('cat_locations')
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
        phone: result.contact_phone,
        email: result.contact_email,
        opening_hours: result.working_hours,
        latitude: result.latitude || result.coordinates?.lat,
        longitude: result.longitude || result.coordinates?.lng,
        radius: result.radius_km ? result.radius_km * 1000 : undefined,
      } as CATLocation;
    } catch (error) {
      console.error('Erro ao atualizar localização de CAT:', error);
      throw error;
    }
  }

  /**
   * Deletar localização de CAT
   */
  async deleteCATLocation(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('cat_locations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar localização de CAT:', error);
      throw error;
    }
  }

  /**
   * Verificar se uma coordenada está dentro do raio de um CAT
   */
  isWithinCATRadius(
    catLat: number | undefined,
    catLng: number | undefined,
    catRadius: number,
    userLat: number,
    userLng: number
  ): boolean {
    if (!catLat || !catLng) return false;
    const distance = this.calculateDistance(catLat, catLng, userLat, userLng);
    return distance <= catRadius;
  }

  /**
   * Calcular distância entre dois pontos (Haversine) em metros
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Raio da Terra em metros
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
}

export const catLocationService = new CATLocationService();

