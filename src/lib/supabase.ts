/**
 * Configuração do Supabase
 * Cliente para conexão com o banco de dados
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para o banco de dados
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: string;
          business_type?: string;
          business_name?: string;
          city_id?: string;
          region_id?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          role: string;
          business_type?: string;
          business_name?: string;
          city_id?: string;
          region_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: string;
          business_type?: string;
          business_name?: string;
          city_id?: string;
          region_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      tourism_attractions: {
        Row: {
          id: string;
          name: string;
          description: string;
          category: string;
          address: string;
          latitude: number;
          longitude: number;
          images: string[];
          rating: number;
          price_range: string;
          opening_hours: string;
          contact_phone?: string;
          contact_email?: string;
          contact_website?: string;
          features: string[];
          is_active: boolean;
          verified: boolean;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          category: string;
          address: string;
          latitude: number;
          longitude: number;
          images?: string[];
          rating?: number;
          price_range: string;
          opening_hours: string;
          contact_phone?: string;
          contact_email?: string;
          contact_website?: string;
          features?: string[];
          is_active?: boolean;
          verified?: boolean;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          category?: string;
          address?: string;
          latitude?: number;
          longitude?: number;
          images?: string[];
          rating?: number;
          price_range?: string;
          opening_hours?: string;
          contact_phone?: string;
          contact_email?: string;
          contact_website?: string;
          features?: string[];
          is_active?: boolean;
          verified?: boolean;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      tourism_events: {
        Row: {
          id: string;
          title: string;
          description: string;
          start_date: string;
          end_date?: string;
          location: string;
          category: string;
          expected_audience: number;
          budget: number;
          status: string;
          images: string[];
          contact_phone?: string;
          contact_email?: string;
          contact_website?: string;
          features: string[];
          is_public: boolean;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          start_date: string;
          end_date?: string;
          location: string;
          category: string;
          expected_audience: number;
          budget: number;
          status: string;
          images?: string[];
          contact_phone?: string;
          contact_email?: string;
          contact_website?: string;
          features?: string[];
          is_public?: boolean;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          start_date?: string;
          end_date?: string;
          location?: string;
          category?: string;
          expected_audience?: number;
          budget?: number;
          status?: string;
          images?: string[];
          contact_phone?: string;
          contact_email?: string;
          contact_website?: string;
          features?: string[];
          is_public?: boolean;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      attendance_records: {
        Row: {
          id: string;
          attendant_id: string;
          attendant_name: string;
          cat_location: string;
          check_in_time: string;
          check_out_time?: string;
          total_hours?: number;
          latitude: number;
          longitude: number;
          address: string;
          notes?: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          attendant_id: string;
          attendant_name: string;
          cat_location: string;
          check_in_time: string;
          check_out_time?: string;
          total_hours?: number;
          latitude: number;
          longitude: number;
          address: string;
          notes?: string;
          status: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          attendant_id?: string;
          attendant_name?: string;
          cat_location?: string;
          check_in_time?: string;
          check_out_time?: string;
          total_hours?: number;
          latitude?: number;
          longitude?: number;
          address?: string;
          notes?: string;
          status?: string;
          created_at?: string;
        };
      };
      diagnostic_results: {
        Row: {
          id: string;
          user_id: string;
          business_type: string;
          answers: any;
          score: number;
          recommendations: string[];
          strengths: string[];
          weaknesses: string[];
          action_plan: string[];
          estimated_roi: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_type: string;
          answers: any;
          score: number;
          recommendations: string[];
          strengths: string[];
          weaknesses: string[];
          action_plan: string[];
          estimated_roi: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          business_type?: string;
          answers?: any;
          score?: number;
          recommendations?: string[];
          strengths?: string[];
          weaknesses?: string[];
          action_plan?: string[];
          estimated_roi?: number;
          created_at?: string;
        };
      };
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
