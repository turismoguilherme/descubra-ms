
import { supabase } from "@/integrations/supabase/client";

export interface CATLocation {
  cat_name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  address?: string;
}

export interface CATCheckin {
  id?: string;
  attendant_id?: string;
  attendant_name: string;
  cat_name: string;
  latitude: number;
  longitude: number;
  status: 'confirmado' | 'fora_da_area' | 'erro';
  distance_from_cat: number;
  device_info?: string;
  created_at?: string;
}

// Localizações oficiais dos CATs em Mato Grosso do Sul
const CAT_LOCATIONS: CATLocation[] = [
  {
    cat_name: 'CAT Campo Grande',
    latitude: -20.4697,
    longitude: -54.6201,
    radius_meters: 100,
    address: 'Centro, Campo Grande - MS'
  },
  {
    cat_name: 'CAT Bonito',
    latitude: -21.1293,
    longitude: -56.4891,
    radius_meters: 100,
    address: 'Centro, Bonito - MS'
  },
  {
    cat_name: 'CAT Corumbá',
    latitude: -19.0078,
    longitude: -57.6547,
    radius_meters: 100,
    address: 'Centro, Corumbá - MS'
  },
  {
    cat_name: 'CAT Dourados',
    latitude: -22.2211,
    longitude: -54.8056,
    radius_meters: 100,
    address: 'Centro, Dourados - MS'
  },
  {
    cat_name: 'CAT Ponta Porã',
    latitude: -22.5355,
    longitude: -55.7255,
    radius_meters: 100,
    address: 'Centro, Ponta Porã - MS'
  }
];

class CATCheckinService {
  // Obter todas as localizações dos CATs
  getAllCATLocations(): CATLocation[] {
    return CAT_LOCATIONS;
  }

  // Obter localização específica de um CAT
  async getCATLocation(catName: string): Promise<CATLocation | null> {
    const location = CAT_LOCATIONS.find(cat => cat.cat_name === catName);
    return location || null;
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

  // Registrar check-in no banco de dados
  async registerCheckin(checkinData: Omit<CATCheckin, 'id'>): Promise<CATCheckin | null> {
    try {
      // Inserir na tabela de check-ins
      const { data, error } = await supabase
        .from('cat_checkins')
        .insert({
          cat_name: checkinData.cat_name,
          status: checkinData.status,
          latitude: checkinData.latitude,
          longitude: checkinData.longitude,
          distance_from_cat: checkinData.distance_from_cat,
          user_id: checkinData.attendant_id || null
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao registrar check-in:', error);
        return null;
      }

      // Atualizar métricas de performance
      await this.updatePerformanceMetrics(checkinData.attendant_name, checkinData.cat_name);

      return {
        id: data.id,
        attendant_id: checkinData.attendant_id,
        attendant_name: checkinData.attendant_name,
        cat_name: data.cat_name,
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        status: data.status as 'confirmado' | 'fora_da_area',
        distance_from_cat: data.distance_from_cat || 0,
        device_info: checkinData.device_info,
        created_at: data.created_at
      };
    } catch (error) {
      console.error('Erro no registro de check-in:', error);
      return null;
    }
  }

  // Atualizar métricas de performance do atendente
  private async updatePerformanceMetrics(attendantName: string, catName: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      // Usar user_interactions para tracking de performance
      await supabase
        .from('user_interactions')
        .insert({
          interaction_type: 'cat_checkin',
          metadata: {
            attendant_name: attendantName,
            cat_name: catName,
            date: today
          }
        });
    } catch (error) {
      console.error('Erro ao atualizar métricas de performance:', error);
    }
  }

  // Buscar check-ins de um atendente
  async getAttendantCheckins(limit: number = 10): Promise<CATCheckin[]> {
    try {
      const { data, error } = await supabase
        .from('cat_checkins')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data?.map(checkin => ({
        id: checkin.id,
        attendant_id: checkin.user_id || '',
        attendant_name: 'Atendente',
        cat_name: checkin.cat_name,
        latitude: checkin.latitude || 0,
        longitude: checkin.longitude || 0,
        status: checkin.status as 'confirmado' | 'fora_da_area',
        distance_from_cat: checkin.distance_from_cat || 0,
        device_info: '',
        created_at: checkin.created_at
      })) || [];
    } catch (error) {
      console.error('Erro ao buscar check-ins:', error);
      return [];
    }
  }

  // Buscar check-ins de hoje
  async getTodayCheckins(): Promise<CATCheckin[]> {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const { data, error } = await supabase
        .from('cat_checkins')
        .select('*')
        .gte('created_at', `${today}T00:00:00.000Z`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(checkin => ({
        id: checkin.id,
        attendant_id: checkin.user_id || '',
        attendant_name: 'Atendente',
        cat_name: checkin.cat_name,
        latitude: checkin.latitude || 0,
        longitude: checkin.longitude || 0,
        status: checkin.status as 'confirmado' | 'fora_da_area',
        distance_from_cat: checkin.distance_from_cat || 0,
        device_info: '',
        created_at: checkin.created_at
      })) || [];
    } catch (error) {
      console.error('Erro ao buscar check-ins de hoje:', error);
      return [];
    }
  }

  // Obter métricas de performance
  async getPerformanceMetrics(attendantName?: string, period: number = 7): Promise<any[]> {
    try {
      // Usar user_interactions para métricas de performance
      let query = supabase
        .from('user_interactions')
        .select('*')
        .eq('interaction_type', 'cat_checkin')
        .gte('created_at', new Date(Date.now() - period * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar métricas de performance:', error);
      return [];
    }
  }
}

export const catCheckinService = new CATCheckinService();
