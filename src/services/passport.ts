
import { supabase } from "@/integrations/supabase/client";
import { offlineCacheService } from "../offlineCacheService";

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
    .from('routes')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const fetchRouteById = async (routeId: string) => {
  const { data, error } = await supabase
    .from('routes')
    .select('*')
    .eq('id', routeId)
    .single();

  if (error) throw error;
  return data;
};

export const fetchRouteCheckpoints = async (routeId: string): Promise<RouteCheckpoint[]> => {
  if (offlineCacheService.isOnline()) {
    try {
      const { data, error } = await supabase
        .from('route_checkpoints')
        .select('*')
        .eq('route_id', routeId)
        .order('order_sequence', { ascending: true });

      if (error) throw error;
      
      const checkpoints = (data || []).map(checkpoint => ({
        ...checkpoint,
        order_index: checkpoint.order_sequence,
        latitude: checkpoint.latitude || 0,
        longitude: checkpoint.longitude || 0
      }));
      
      // Cachear a rota e seus checkpoints
      const routeData = await fetchRouteById(routeId); // Supondo que fetchRouteById traga a rota completa
      if (routeData) {
        await offlineCacheService.cacheRoute(routeData, checkpoints);
      }
      
      return checkpoints;
    } catch (error) {
      console.warn("Erro ao buscar checkpoints online, tentando offline:", error);
      // Se falhar online, tenta buscar do cache
      const { checkpoints } = await offlineCacheService.getCachedRoute(routeId);
      return checkpoints;
    }
  } else {
    // Se estiver offline, busca diretamente do cache
    const { checkpoints } = await offlineCacheService.getCachedRoute(routeId);
    return checkpoints;
  }
};

export const createUserCheckin = async (checkinData: Omit<UserRouteCheckin, 'id' | 'created_at'>) => {
  if (offlineCacheService.isOnline()) {
    try {
      const { data, error } = await supabase
        .from('passport_stamps')
        .insert([{
          user_id: checkinData.user_id,
          route_id: checkinData.route_id,
          checkpoint_id: checkinData.checkpoint_id,
          latitude: checkinData.latitude,
          longitude: checkinData.longitude,
          stamp_type: 'route_checkin',
          stamped_at: checkinData.checkin_at
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Retorna em formato esperado
      return {
        id: data.id,
        user_id: data.user_id,
        route_id: data.route_id || '',
        checkpoint_id: data.checkpoint_id,
        checkin_at: data.stamped_at || checkinData.checkin_at,
        latitude: data.latitude,
        longitude: data.longitude,
        created_at: data.stamped_at
      };
    } catch (error) {
      console.warn("Erro ao criar checkin online, salvando offline:", error);
      // Salva offline se houver erro ou estiver offline
      const stamp: UserStamp = {
        id: `offline-stamp-${Date.now()}`,
        user_id: checkinData.user_id,
        route_id: checkinData.route_id,
        checkpoint_id: checkinData.checkpoint_id,
        stamp_name: `Check-in em ${checkinData.checkpoint_id}`,
        earned_at: new Date().toISOString(),
        // Adicionar outros campos relevantes que possam ser necessários para sincronização
        cultural_phrase: 'Check-in offline pendente',
        completion_percentage: 0, // Placeholder
        stamp_icon_url: '', // Placeholder
      };
      await offlineCacheService.addStampToCache(stamp);
      // Retorna um objeto com uma ID temporária para a UI poder reagir
      return {
        ...checkinData, 
        id: stamp.id,
        created_at: stamp.earned_at
      };
    }
  } else {
    // Se estiver offline, salva diretamente no cache
    const stamp: UserStamp = {
      id: `offline-stamp-${Date.now()}`,
      user_id: checkinData.user_id,
      route_id: checkinData.route_id,
      checkpoint_id: checkinData.checkpoint_id,
      stamp_name: `Check-in em ${checkinData.checkpoint_id}`,
      earned_at: new Date().toISOString(),
      // Adicionar outros campos relevantes que possam ser necessários para sincronização
      cultural_phrase: 'Check-in offline pendente',
      completion_percentage: 0, // Placeholder
      stamp_icon_url: '', // Placeholder
    };
    await offlineCacheService.addStampToCache(stamp);
    // Retorna um objeto com uma ID temporária para a UI poder reagir
    return {
      ...checkinData, 
      id: stamp.id,
      created_at: stamp.earned_at
    };
  }
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
