import { supabase } from '@/integrations/supabase/client';

// Tipos para o sistema de CATs
export interface CATLocation {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  region: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  tolerance_meters: number; // Tolerância para validação de presença
  contact: {
    phone?: string;
    email?: string;
    manager_name?: string;
  };
  hours: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  services: string[]; // Serviços oferecidos
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id: string;
  cat_id: string;
  attendant_id: string;
  attendant_name: string;
  clock_in_time: string;
  clock_out_time?: string;
  clock_in_location: {
    lat: number;
    lng: number;
    accuracy?: number;
  };
  clock_out_location?: {
    lat: number;
    lng: number;
    accuracy?: number;
  };
  total_hours?: number;
  notes?: string;
  status: 'active' | 'completed' | 'invalid';
  validation_status: 'valid' | 'invalid' | 'pending';
  created_at: string;
}

export interface CATStats {
  cat_id: string;
  cat_name: string;
  total_attendance_days: number;
  total_hours_worked: number;
  average_hours_per_day: number;
  attendance_rate: number; // Porcentagem de dias com presença
  last_attendance: string;
  current_attendants: number;
}

export class CATLocationService {
  // Calcular distância entre dois pontos (fórmula de Haversine)
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Raio da Terra em metros
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  // Validar se o atendente está dentro da tolerância do CAT
  validateAttendance(catLocation: CATLocation, userLat: number, userLng: number): {
    isValid: boolean;
    distance: number;
    tolerance: number;
  } {
    const distance = this.calculateDistance(
      catLocation.coordinates.lat,
      catLocation.coordinates.lng,
      userLat,
      userLng
    );

    const isValid = distance <= catLocation.tolerance_meters;

    return {
      isValid,
      distance: Math.round(distance),
      tolerance: catLocation.tolerance_meters
    };
  }

  // Cadastrar novo CAT
  async createCAT(catData: Omit<CATLocation, 'id' | 'created_at' | 'updated_at'>): Promise<CATLocation> {
    try {
      const { data, error } = await supabase
        .from('cat_locations')
        .insert([{
          ...catData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      console.log('✅ CAT cadastrado com sucesso:', data.name);
      return data;
    } catch (error) {
      console.error('❌ Erro ao cadastrar CAT:', error);
      throw error;
    }
  }

  // Atualizar CAT
  async updateCAT(id: string, updates: Partial<CATLocation>): Promise<CATLocation> {
    try {
      const { data, error } = await supabase
        .from('cat_locations')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ CAT atualizado com sucesso:', data.name);
      return data;
    } catch (error) {
      console.error('❌ Erro ao atualizar CAT:', error);
      throw error;
    }
  }

  // Listar todos os CATs
  async getAllCATs(): Promise<CATLocation[]> {
    try {
      const { data, error } = await supabase
        .from('cat_locations')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('❌ Erro ao listar CATs:', error);
      throw error;
    }
  }

  // Buscar CAT por ID
  async getCATById(id: string): Promise<CATLocation | null> {
    try {
      const { data, error } = await supabase
        .from('cat_locations')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return data;
    } catch (error) {
      console.error('❌ Erro ao buscar CAT:', error);
      throw error;
    }
  }

  // Registrar entrada do atendente
  async registerClockIn(
    catId: string,
    attendantId: string,
    attendantName: string,
    latitude: number,
    longitude: number,
    accuracy?: number
  ): Promise<AttendanceRecord> {
    try {
      // Buscar informações do CAT
      const catLocation = await this.getCATById(catId);
      if (!catLocation) {
        throw new Error('CAT não encontrado');
      }

      // Validar localização
      const validation = this.validateAttendance(catLocation, latitude, longitude);
      
      if (!validation.isValid) {
        throw new Error(`Localização inválida. Distância: ${validation.distance}m, Tolerância: ${validation.tolerance}m`);
      }

      // Verificar se já existe entrada ativa
      const activeEntry = await this.getActiveAttendance(attendantId);
      if (activeEntry) {
        throw new Error('Já existe uma entrada ativa para este atendente');
      }

      // Registrar entrada
      const { data, error } = await supabase
        .from('attendance_records')
        .insert([{
          cat_id: catId,
          attendant_id: attendantId,
          attendant_name: attendantName,
          clock_in_time: new Date().toISOString(),
          clock_in_location: {
            lat: latitude,
            lng: longitude,
            accuracy
          },
          status: 'active',
          validation_status: 'valid',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Entrada registrada com sucesso para:', attendantName);
      return data;
    } catch (error) {
      console.error('❌ Erro ao registrar entrada:', error);
      throw error;
    }
  }

  // Registrar saída do atendente
  async registerClockOut(
    attendantId: string,
    latitude?: number,
    longitude?: number,
    accuracy?: number,
    notes?: string
  ): Promise<AttendanceRecord> {
    try {
      // Buscar entrada ativa
      const activeEntry = await this.getActiveAttendance(attendantId);
      if (!activeEntry) {
        throw new Error('Nenhuma entrada ativa encontrada');
      }

      const clockOutTime = new Date().toISOString();
      const clockInTime = new Date(activeEntry.clock_in_time);
      const totalHours = (new Date(clockOutTime).getTime() - clockInTime.getTime()) / (1000 * 60 * 60);

      // Atualizar registro
      const { data, error } = await supabase
        .from('attendance_records')
        .update({
          clock_out_time: clockOutTime,
          clock_out_location: latitude && longitude ? {
            lat: latitude,
            lng: longitude,
            accuracy
          } : null,
          total_hours: Math.round(totalHours * 100) / 100,
          notes: notes || activeEntry.notes,
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', activeEntry.id)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Saída registrada com sucesso. Total de horas:', totalHours);
      return data;
    } catch (error) {
      console.error('❌ Erro ao registrar saída:', error);
      throw error;
    }
  }

  // Buscar entrada ativa do atendente
  async getActiveAttendance(attendantId: string): Promise<AttendanceRecord | null> {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('attendant_id', attendantId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return data;
    } catch (error) {
      console.error('❌ Erro ao buscar entrada ativa:', error);
      throw error;
    }
  }

  // Obter histórico de presença
  async getAttendanceHistory(
    attendantId?: string,
    catId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<AttendanceRecord[]> {
    try {
      let query = supabase
        .from('attendance_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (attendantId) {
        query = query.eq('attendant_id', attendantId);
      }

      if (catId) {
        query = query.eq('cat_id', catId);
      }

      if (startDate) {
        query = query.gte('created_at', startDate);
      }

      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar histórico:', error);
      throw error;
    }
  }

  // Obter estatísticas dos CATs
  async getCATStats(catId?: string, period?: { start: string; end: string }): Promise<CATStats[]> {
    try {
      // Buscar todos os CATs se não especificado
      const cats = catId ? [await this.getCATById(catId)] : await this.getAllCATs();
      const stats: CATStats[] = [];

      for (const cat of cats) {
        if (!cat) continue;

        // Buscar registros do período
        const records = await this.getAttendanceHistory(
          undefined,
          cat.id,
          period?.start,
          period?.end
        );

        // Calcular estatísticas
        const totalDays = records.length;
        const totalHours = records.reduce((sum, record) => sum + (record.total_hours || 0), 0);
        const averageHours = totalDays > 0 ? totalHours / totalDays : 0;
        
        // Calcular taxa de presença (assumindo 22 dias úteis por mês)
        const workingDays = period ? this.calculateWorkingDays(period.start, period.end) : 22;
        const attendanceRate = (totalDays / workingDays) * 100;

        // Contar atendentes ativos
        const activeAttendants = records.filter(r => r.status === 'active').length;

        stats.push({
          cat_id: cat.id,
          cat_name: cat.name,
          total_attendance_days: totalDays,
          total_hours_worked: Math.round(totalHours * 100) / 100,
          average_hours_per_day: Math.round(averageHours * 100) / 100,
          attendance_rate: Math.round(attendanceRate * 100) / 100,
          last_attendance: records[0]?.created_at || '',
          current_attendants: activeAttendants
        });
      }

      return stats;
    } catch (error) {
      console.error('❌ Erro ao calcular estatísticas:', error);
      throw error;
    }
  }

  // Calcular dias úteis entre duas datas
  private calculateWorkingDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let workingDays = 0;

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0 = Domingo, 6 = Sábado
        workingDays++;
      }
    }

    return workingDays;
  }

  // Obter atendentes ativos em tempo real
  async getActiveAttendants(): Promise<AttendanceRecord[]> {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select(`
          *,
          cat_locations (
            name,
            address,
            city
          )
        `)
        .eq('status', 'active')
        .order('clock_in_time');

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar atendentes ativos:', error);
      throw error;
    }
  }

  // Validar presença em lote (para gestores)
  async validateBatchAttendance(attendanceIds: string[]): Promise<{
    valid: string[];
    invalid: string[];
    errors: string[];
  }> {
    const result = {
      valid: [] as string[],
      invalid: [] as string[],
      errors: [] as string[]
    };

    for (const id of attendanceIds) {
      try {
        const { data, error } = await supabase
          .from('attendance_records')
          .select(`
            *,
            cat_locations (
              coordinates,
              tolerance_meters
            )
          `)
          .eq('id', id)
          .single();

        if (error) {
          result.errors.push(`Erro ao buscar registro ${id}: ${error.message}`);
          continue;
        }

        if (!data) {
          result.invalid.push(id);
          continue;
        }

        // Validar localização
        const validation = this.validateAttendance(
          data.cat_locations,
          data.clock_in_location.lat,
          data.clock_in_location.lng
        );

        // Atualizar status de validação
        await supabase
          .from('attendance_records')
          .update({
            validation_status: validation.isValid ? 'valid' : 'invalid'
          })
          .eq('id', id);

        if (validation.isValid) {
          result.valid.push(id);
        } else {
          result.invalid.push(id);
        }

      } catch (error) {
        result.errors.push(`Erro ao processar ${id}: ${error}`);
      }
    }

    return result;
  }
}

// Instância singleton
export const catLocationService = new CATLocationService(); 