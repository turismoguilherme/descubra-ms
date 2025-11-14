/**
 * Serviço de Autenticação com Supabase
 * Gerencia login, logout e perfil do usuário
 */

import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  role: string;
  business_type?: string;
  business_name?: string;
  city_id?: string;
  region_id?: string;
  created_at: string;
  updated_at: string;
}

export class SupabaseAuthService {
  async signUp(email: string, password: string, userData: Partial<UserProfile>) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: userData.role || 'user',
            business_type: userData.business_type,
            business_name: userData.business_name,
            city_id: userData.city_id,
            region_id: userData.region_id,
          }
        }
      });

      if (error) throw error;

      // Criar perfil do usuário na tabela users
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            role: userData.role || 'user',
            business_type: userData.business_type,
            business_name: userData.business_name,
            city_id: userData.city_id,
            region_id: userData.region_id,
          });

        if (profileError) throw profileError;
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async resetPassword(email: string) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Listener para mudanças de autenticação
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user ?? null);
    });
  }
}

export const supabaseAuthService = new SupabaseAuthService();
