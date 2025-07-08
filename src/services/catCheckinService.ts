
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
      // Inserir na tabela de check-ins (usando security_logs por enquanto)
      const { data, error } = await supabase
        .from('security_logs')
        .insert({
          action: 'cat_checkin',
          success: checkinData.status === 'confirmado',
          table_name: 'cat_checkins',
          record_id: `${checkinData.cat_name}_${Date.now()}`,
          user_agent: checkinData.device_info,
          error_message: checkinData.status !== 'confirmado' ? 
            `Distância: ${checkinData.distance_from_cat}m` : null
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
        ...checkinData,
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
      // Buscar registro existente
      const { data: existing } = await supabase
        .from('cat_performance')
        .select('*')
        .eq('attendant_name', attendantName)
        .eq('cat_name', catName)
        .eq('date', today)
        .single();

      if (existing) {
        // Atualizar registro existente
        await supabase
          .from('cat_performance')
          .update({
            total_checkins: existing.total_checkins + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        // Criar novo registro
        await supabase
          .from('cat_performance')
          .insert({
            attendant_id: crypto.randomUUID(),
            attendant_name: attendantName,
            cat_name: catName,
            date: today,
            total_checkins: 1
          });
      }
    } catch (error) {
      console.error('Erro ao atualizar métricas de performance:', error);
    }
  }

  // Buscar check-ins de um atendente
  async getAttendantCheckins(limit: number = 10): Promise<CATCheckin[]> {
    try {
      const { data, error } = await supabase
        .from('security_logs')
        .select('*')
        .eq('action', 'cat_checkin')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data?.map(log => ({
        id: log.id,
        attendant_name: 'Atendente', // Extrair do user_agent se necessário
        cat_name: log.record_id?.split('_')[0] || 'CAT',
        latitude: 0, // Dados não disponíveis nesta tabela
        longitude: 0,
        status: log.success ? 'confirmado' : 'fora_da_area' as const,
        distance_from_cat: 0,
        device_info: log.user_agent,
        created_at: log.created_at
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
        .from('security_logs')
        .select('*')
        .eq('action', 'cat_checkin')
        .gte('created_at', `${today}T00:00:00.000Z`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(log => ({
        id: log.id,
        attendant_name: 'Atendente',
        cat_name: log.record_id?.split('_')[0] || 'CAT',
        latitude: 0,
        longitude: 0,
        status: log.success ? 'confirmado' : 'fora_da_area' as const,
        distance_from_cat: 0,
        device_info: log.user_agent,
        created_at: log.created_at
      })) || [];
    } catch (error) {
      console.error('Erro ao buscar check-ins de hoje:', error);
      return [];
    }
  }

  // Obter métricas de performance
  async getPerformanceMetrics(attendantName?: string, period: number = 7): Promise<any[]> {
    try {
      let query = supabase
        .from('cat_performance')
        .select('*')
        .gte('date', new Date(Date.now() - period * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (attendantName) {
        query = query.eq('attendant_name', attendantName);
      }

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
