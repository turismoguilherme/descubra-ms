/**
 * Attendance Service
 * Serviço para gerenciar registros de atendimento nos CATs
 */

import { supabase } from '@/integrations/supabase/client';

export interface AttendanceRecord {
  id: string;
  attendant_id: string;
  cat_id: string | null;
  tourist_id: string | null;
  attendance_date: string;
  attendance_time: string;
  service_type: 'information' | 'guidance' | 'emergency' | 'translation' | 'other';
  topic: string | null;
  duration_minutes: number | null;
  language: string;
  resolved: boolean;
  satisfaction_rating: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export class AttendanceService {
  /**
   * Salvar registro de atendimento
   */
  async saveAttendanceRecord(
    data: {
      attendant_id: string;
      cat_id?: string;
      tourist_id?: string;
      service_type: AttendanceRecord['service_type'];
      topic?: string;
      duration_minutes?: number;
      language?: string;
      resolved?: boolean;
      satisfaction_rating?: number;
      notes?: string;
    }
  ): Promise<AttendanceRecord> {
    try {
      const { data: record, error } = await supabase
        .from('cat_attendance_records')
        .insert({
          ...data,
          attendance_date: new Date().toISOString().split('T')[0],
          attendance_time: new Date().toISOString(),
          language: data.language || 'pt-BR',
          resolved: data.resolved !== undefined ? data.resolved : true
        })
        .select()
        .single();

      if (error) throw error;
      return record as AttendanceRecord;
    } catch (error) {
      console.error('Erro ao salvar registro de atendimento:', error);
      throw error;
    }
  }

  /**
   * Buscar histórico de atendimentos
   */
  async getAttendanceRecords(filters?: {
    attendant_id?: string;
    cat_id?: string;
    tourist_id?: string;
    startDate?: string;
    endDate?: string;
    service_type?: AttendanceRecord['service_type'];
  }): Promise<AttendanceRecord[]> {
    try {
      let query = supabase
        .from('cat_attendance_records')
        .select('*')
        .order('attendance_date', { ascending: false })
        .order('attendance_time', { ascending: false });

      if (filters?.attendant_id) {
        query = query.eq('attendant_id', filters.attendant_id);
      }

      if (filters?.cat_id) {
        query = query.eq('cat_id', filters.cat_id);
      }

      if (filters?.tourist_id) {
        query = query.eq('tourist_id', filters.tourist_id);
      }

      if (filters?.startDate) {
        query = query.gte('attendance_date', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('attendance_date', filters.endDate);
      }

      if (filters?.service_type) {
        query = query.eq('service_type', filters.service_type);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as AttendanceRecord[];
    } catch (error) {
      console.error('Erro ao buscar registros de atendimento:', error);
      return [];
    }
  }

  /**
   * Buscar registro por ID
   */
  async getAttendanceRecordById(id: string): Promise<AttendanceRecord | null> {
    try {
      const { data, error } = await supabase
        .from('cat_attendance_records')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data as AttendanceRecord;
    } catch (error) {
      console.error('Erro ao buscar registro de atendimento:', error);
      return null;
    }
  }

  /**
   * Atualizar registro de atendimento
   */
  async updateAttendanceRecord(
    id: string,
    updates: Partial<AttendanceRecord>
  ): Promise<AttendanceRecord> {
    try {
      const { data, error } = await supabase
        .from('cat_attendance_records')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as AttendanceRecord;
    } catch (error) {
      console.error('Erro ao atualizar registro de atendimento:', error);
      throw error;
    }
  }

  /**
   * Buscar estatísticas de atendimento
   */
  async getAttendanceStats(filters?: {
    attendant_id?: string;
    cat_id?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    byServiceType: { [key: string]: number };
    averageSatisfaction: number;
    averageDuration: number;
    byDate: { [key: string]: number };
    resolvedRate: number;
  }> {
    try {
      const records = await this.getAttendanceRecords(filters);

      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      const todayRecords = records.filter(r => r.attendance_date === today);
      const weekRecords = records.filter(r => 
        new Date(r.attendance_date) >= weekAgo
      );
      const monthRecords = records.filter(r => 
        new Date(r.attendance_date) >= monthAgo
      );

      const byServiceType: { [key: string]: number } = {};
      records.forEach(r => {
        byServiceType[r.service_type] = (byServiceType[r.service_type] || 0) + 1;
      });

      const ratedRecords = records.filter(r => r.satisfaction_rating !== null);
      const averageSatisfaction = ratedRecords.length > 0
        ? ratedRecords.reduce((sum, r) => sum + (r.satisfaction_rating || 0), 0) / ratedRecords.length
        : 0;

      const recordsWithDuration = records.filter(r => r.duration_minutes !== null);
      const averageDuration = recordsWithDuration.length > 0
        ? recordsWithDuration.reduce((sum, r) => sum + (r.duration_minutes || 0), 0) / recordsWithDuration.length
        : 0;

      const byDate: { [key: string]: number } = {};
      records.forEach(r => {
        byDate[r.attendance_date] = (byDate[r.attendance_date] || 0) + 1;
      });

      const resolvedCount = records.filter(r => r.resolved).length;
      const resolvedRate = records.length > 0
        ? (resolvedCount / records.length) * 100
        : 0;

      return {
        total: records.length,
        today: todayRecords.length,
        thisWeek: weekRecords.length,
        thisMonth: monthRecords.length,
        byServiceType,
        averageSatisfaction: Math.round(averageSatisfaction * 100) / 100,
        averageDuration: Math.round(averageDuration * 100) / 100,
        byDate,
        resolvedRate: Math.round(resolvedRate * 100) / 100
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de atendimento:', error);
      return {
        total: 0,
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        byServiceType: {},
        averageSatisfaction: 0,
        averageDuration: 0,
        byDate: {},
        resolvedRate: 0
      };
    }
  }
}

export const attendanceService = new AttendanceService();

