
import { supabase } from "@/integrations/supabase/client";

export interface RouteCheckpoint {
  id: string;
  route_id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  order_index: number;
  required_time_minutes?: number;
  promotional_text?: string;
  validation_radius_meters?: number;
  created_at?: string;
  updated_at?: string;
}

export interface UserRouteCheckin {
  id: string;
  user_id: string;
  route_id: string;
  checkpoint_id?: string;
  checkin_at: string;
  latitude?: number;
  longitude?: number;
  photo_url?: string;
  notes?: string;
  created_at?: string;
}

export interface UserStamp {
  id: string;
  user_id: string;
  route_id?: string;
  city_id?: string;
  region_id?: string;
  stamp_name: string;
  stamp_icon_url?: string;
  earned_at: string;
  completion_percentage?: number;
  cultural_phrase?: string;
  created_at?: string;
}

export const fetchTouristRoutes = async () => {
  const { data, error } = await supabase
    .from('tourist_routes')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const fetchRouteById = async (routeId: string) => {
  const { data, error } = await supabase
    .from('tourist_routes')
    .select('*')
    .eq('id', routeId)
    .single();

  if (error) throw error;
  return data;
};

export const fetchRouteCheckpoints = async (routeId: string): Promise<RouteCheckpoint[]> => {
  const { data, error } = await supabase
    .from('route_checkpoints')
    .select('*')
    .eq('route_id', routeId)
    .order('order_index', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const createUserCheckin = async (checkinData: Omit<UserRouteCheckin, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('user_route_checkins')
    .insert([checkinData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateUserPassportStats = async (userId: string, points: number) => {
  const { data: existingProfile, error: fetchError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw fetchError;
  }

  if (existingProfile) {
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ 
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) throw updateError;
  } else {
    const { error: insertError } = await supabase
      .from('user_profiles')
      .insert([{
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);

    if (insertError) throw insertError;
  }

  return true;
};

// Função utilitária para calcular distância
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};
