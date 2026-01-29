
import { supabase } from "@/integrations/supabase/client";

export interface CATLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  allowed_radius: number;
  address?: string;
  working_hours?: {
    start: string;
    end: string;
  };
}

export interface CATCheckin {
  id?: string;
  attendant_id?: string;
  location_id?: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  checkin_time?: string;
  checkout_time?: string;
  is_valid: boolean;
  distance_from_cat?: number;
  device_info?: Record<string, any>;
  created_at?: string;
}

class CATCheckinService {
  // Obter todas as localizações dos CATs do banco
  async getAllCATLocations(): Promise<CATLocation[]> {
    try {
      const { data, error } = await supabase
        .from('attendant_allowed_locations')
        .select('id, name, latitude, longitude, allowed_radius, address, working_hours')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      return (data || []).map(loc => ({
        id: loc.id,
        name: loc.name,
        latitude: parseFloat(loc.latitude.toString()),
        longitude: parseFloat(loc.longitude.toString()),
        allowed_radius: loc.allowed_radius,
        address: loc.address || undefined,
        working_hours: loc.working_hours as { start: string; end: string } | undefined,
      }));
    } catch (error: unknown) {
      console.error('Erro ao buscar localizações dos CATs:', error);
      return [];
    }
  }

  // Obter localização de um CAT específico por nome
  async getCATLocation(catName: string): Promise<CATLocation | null> {
    try {
      const { data, error } = await supabase
        .from('attendant_allowed_locations')
        .select('id, name, latitude, longitude, allowed_radius, address, working_hours')
        .ilike('name', `%${catName}%`)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (!data) return null;

      return {
        id: data.id,
        name: data.name,
        latitude: parseFloat(data.latitude.toString()),
        longitude: parseFloat(data.longitude.toString()),
        allowed_radius: data.allowed_radius,
        address: data.address || undefined,
        working_hours: data.working_hours as { start: string; end: string } | undefined,
      };
    } catch (error: unknown) {
      console.error('Erro ao buscar localização do CAT:', error);
      return null;
    }
  }

  // Obter localizações autorizadas para um atendente
  async getAttendantLocations(attendantId: string): Promise<CATLocation[]> {
    try {
      const { data, error } = await supabase
        .from('attendant_location_assignments')
        .select(`
          location_id,
          attendant_allowed_locations (
            id,
            name,
            latitude,
            longitude,
            allowed_radius,
            address,
            working_hours
          )
        `)
        .eq('attendant_id', attendantId)
        .eq('is_active', true);

      if (error) throw error;

      return (data || [])
        .map((assignment: any) => assignment.attendant_allowed_locations)
        .filter(Boolean)
        .map((loc: any) => ({
          id: loc.id,
          name: loc.name,
          latitude: parseFloat(loc.latitude.toString()),
          longitude: parseFloat(loc.longitude.toString()),
          allowed_radius: loc.allowed_radius,
          address: loc.address || undefined,
          working_hours: loc.working_hours as { start: string; end: string } | undefined,
        }));
    } catch (error: unknown) {
      console.error('Erro ao buscar localizações do atendente:', error);
      return [];
    }
  }

  // Calcular distância entre duas coordenadas usando fórmula de Haversine
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Raio da Terra em metros
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLon = this.degreesToRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.degreesToRadians(lat1)) * Math.cos(this.degreesToRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private degreesToRadians(degrees: number): number {
    return degrees * (Math.PI/180);
  }

  // Registrar check-in usando função do Supabase (valida distância e horário)
  async registerCheckin(
    attendantId: string,
    latitude: number,
    longitude: number,
    accuracy?: number
  ): Promise<{ success: boolean; message: string; data?: CATCheckin; error?: string }> {
    try {
      // Usar função do Supabase para validar e registrar check-in
      const { data, error } = await supabase.rpc('validate_attendant_checkin', {
        p_attendant_id: attendantId,
        p_check_lat: latitude,
        p_check_lng: longitude,
        p_check_accuracy: accuracy || 100,
      });

      if (error) throw error;

      if (data.success) {
        // Buscar check-in recém-criado
        const { data: checkinData, error: fetchError } = await supabase
          .from('attendant_checkins')
          .select('*')
          .eq('attendant_id', attendantId)
          .order('checkin_time', { ascending: false })
          .limit(1)
          .single();

        if (fetchError) {
          console.error('Erro ao buscar check-in criado:', fetchError);
        }

        return {
          success: true,
          message: data.message,
          data: checkinData ? {
            id: checkinData.id,
            attendant_id: checkinData.attendant_id,
            location_id: checkinData.location_id,
            latitude: parseFloat(checkinData.latitude.toString()),
            longitude: parseFloat(checkinData.longitude.toString()),
            accuracy: checkinData.accuracy || undefined,
            checkin_time: checkinData.checkin_time,
            is_valid: checkinData.is_valid,
            distance_from_cat: checkinData.distance_from_cat ? parseFloat(checkinData.distance_from_cat.toString()) : undefined,
            device_info: checkinData.device_info as Record<string, any> | undefined,
            created_at: checkinData.created_at,
          } : undefined,
        };
      } else {
        return {
          success: false,
          message: data.message,
          error: data.message,
        };
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro no registro de check-in:', err);
      return {
        success: false,
        message: err.message || 'Erro ao registrar check-in',
        error: err.message,
      };
    }
  }

  // Registrar check-out
  async registerCheckout(
    attendantId: string,
    checkinId: string,
    latitude: number,
    longitude: number
  ): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('attendant_checkins')
        .update({
          checkout_time: new Date().toISOString(),
          checkout_latitude: latitude,
          checkout_longitude: longitude,
          updated_at: new Date().toISOString(),
        })
        .eq('id', checkinId)
        .eq('attendant_id', attendantId)
        .is('checkout_time', null); // Apenas se ainda não tiver checkout

      if (error) throw error;

      return {
        success: true,
        message: 'Check-out registrado com sucesso',
      };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao registrar check-out:', err);
      return {
        success: false,
        message: err.message || 'Erro ao registrar check-out',
      };
    }
  }

  // Obter check-in ativo do atendente (sem checkout)
  async getActiveCheckin(attendantId: string): Promise<CATCheckin | null> {
    try {
      const { data, error } = await supabase
        .from('attendant_checkins')
        .select('*')
        .eq('attendant_id', attendantId)
        .is('checkout_time', null)
        .eq('is_valid', true)
        .order('checkin_time', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (!data) return null;

      return {
        id: data.id,
        attendant_id: data.attendant_id,
        location_id: data.location_id,
        latitude: parseFloat(data.latitude.toString()),
        longitude: parseFloat(data.longitude.toString()),
        accuracy: data.accuracy || undefined,
        checkin_time: data.checkin_time,
        is_valid: data.is_valid,
        distance_from_cat: data.distance_from_cat ? parseFloat(data.distance_from_cat.toString()) : undefined,
        device_info: data.device_info as Record<string, any> | undefined,
        created_at: data.created_at,
      };
    } catch (error: unknown) {
      console.error('Erro ao buscar check-in ativo:', error);
      return null;
    }
  }

  // Buscar check-ins de um atendente
  async getAttendantCheckins(attendantId: string, limit: number = 10): Promise<CATCheckin[]> {
    try {
      const { data, error } = await supabase
        .from('attendant_checkins')
        .select('*')
        .eq('attendant_id', attendantId)
        .order('checkin_time', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(checkin => ({
        id: checkin.id,
        attendant_id: checkin.attendant_id,
        location_id: checkin.location_id,
        latitude: parseFloat(checkin.latitude.toString()),
        longitude: parseFloat(checkin.longitude.toString()),
        accuracy: checkin.accuracy || undefined,
        checkin_time: checkin.checkin_time,
        checkout_time: checkin.checkout_time,
        is_valid: checkin.is_valid,
        distance_from_cat: checkin.distance_from_cat ? parseFloat(checkin.distance_from_cat.toString()) : undefined,
        device_info: checkin.device_info as Record<string, any> | undefined,
        created_at: checkin.created_at,
      }));
    } catch (error: unknown) {
      console.error('Erro ao buscar check-ins:', error);
      return [];
    }
  }

  // Buscar check-ins de hoje (todos os atendentes)
  async getTodayCheckins(): Promise<CATCheckin[]> {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const { data, error } = await supabase
        .from('attendant_checkins')
        .select('*')
        .gte('checkin_time', `${today}T00:00:00.000Z`)
        .order('checkin_time', { ascending: false });

      if (error) throw error;

      return (data || []).map(checkin => ({
        id: checkin.id,
        attendant_id: checkin.attendant_id,
        location_id: checkin.location_id,
        latitude: parseFloat(checkin.latitude.toString()),
        longitude: parseFloat(checkin.longitude.toString()),
        accuracy: checkin.accuracy || undefined,
        checkin_time: checkin.checkin_time,
        checkout_time: checkin.checkout_time,
        is_valid: checkin.is_valid,
        distance_from_cat: checkin.distance_from_cat ? parseFloat(checkin.distance_from_cat.toString()) : undefined,
        device_info: checkin.device_info as Record<string, any> | undefined,
        created_at: checkin.created_at,
      }));
    } catch (error: unknown) {
      console.error('Erro ao buscar check-ins de hoje:', error);
      return [];
    }
  }

  // Obter estatísticas de check-ins usando função do Supabase
  async getCheckinStats(cityId?: string, regionId?: string, dateFrom?: Date, dateTo?: Date): Promise<any> {
    try {
      const { data, error } = await supabase.rpc('get_attendant_checkin_stats', {
        p_city_id: cityId || null,
        p_region_id: regionId || null,
        p_date_from: dateFrom?.toISOString().split('T')[0] || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        p_date_to: dateTo?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      });

      if (error) throw error;

      return data;
    } catch (error: unknown) {
      console.error('Erro ao buscar estatísticas:', error);
      return null;
    }
  }
}

export const catCheckinService = new CATCheckinService();
