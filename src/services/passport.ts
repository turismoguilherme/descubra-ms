import { supabase } from "@/integrations/supabase/client";

export interface TouristRoute {
  id: string;
  name: string;
  description?: string;
  region?: string;
  difficulty_level: "facil" | "medio" | "dificil";
  estimated_duration: number;
  promotional_text?: string;
  video_url?: string;
  is_active: boolean;
}

export interface RouteCreateData {
  name: string;
  description?: string;
  region?: string;
  difficulty_level: "facil" | "medio" | "dificil";
  estimated_duration: number;
  is_active: boolean;
  checkpoints?: {
    name: string;
    description?: string;
    latitude: number;
    longitude: number;
    order_index: number;
  }[];
}

export const fetchTouristRoutes = async () => {
  const { data, error } = await supabase
    .from('routes')
    .select('*')
    .eq('is_active', true);
  
  if (error) throw error;
  return data;
};

export const fetchRouteById = async (id: string) => {
  const { data, error } = await supabase
    .from('routes')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const fetchRouteCheckpoints = async (routeId: string) => {
  const { data, error } = await supabase
    .from('route_checkpoints')
    .select('*')
    .eq('route_id', routeId)
    .order('order_sequence');
  
  if (error) throw error;
  return data;
};

export const createUserCheckin = async (userId: string, routeId: string, checkpointId: string) => {
  const { data, error } = await supabase
    .from('passport_stamps')
    .insert([{
      user_id: userId,
      route_id: routeId,
      stamp_type: 'checkpoint',
      stamped_at: new Date().toISOString()
    }]);
  
  if (error) throw error;
  return data;
};

export const updateUserPassportStats = async (userId: string, points: number) => {
  const { error } = await supabase.rpc('update_user_points', {
    p_user_id: userId,
    p_state_id: 'ms-pantanal',
    p_points: points
  });
  
  if (error) throw error;
};