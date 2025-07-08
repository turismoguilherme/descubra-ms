
import { supabase } from "@/integrations/supabase/client";
import type {
  TouristRegion,
  RegionCity,
  EnhancedTouristRoute,
  RouteReward,
  UserPassportProgress,
  DigitalStamp,
  UserReward
} from "@/types/digitalPassport";

// Serviços para Regiões Turísticas
export const fetchTouristRegions = async (): Promise<TouristRegion[]> => {
  const { data, error } = await supabase
    .from('tourist_regions')
    .select('*')
    .order('name');
  
  if (error) throw error;
  
  // A tabela tourist_regions não tem is_active, então definimos como true por padrão
  return (data || []).map(region => ({
    ...region,
    is_active: true
  }));
};

export const fetchRegionById = async (id: string): Promise<TouristRegion | null> => {
  const { data, error } = await supabase
    .from('tourist_regions')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  
  return data ? {
    ...data,
    is_active: true
  } : null;
};

// Serviços para Cidades
export const fetchRegionCities = async (regionId: string): Promise<RegionCity[]> => {
  const { data, error } = await supabase
    .from('region_cities')
    .select('*')
    .eq('region_id', regionId)
    .eq('is_active', true)
    .order('name');
  
  if (error) throw error;
  return data || [];
};

export const fetchAllCities = async (): Promise<RegionCity[]> => {
  const { data, error } = await supabase
    .from('region_cities')
    .select('*')
    .eq('is_active', true)
    .order('name');
  
  if (error) throw error;
  return data || [];
};

// Serviços para Roteiros Melhorados
export const fetchEnhancedRoutes = async (cityId?: string): Promise<EnhancedTouristRoute[]> => {
  let query = supabase
    .from('tourist_routes')
    .select(`
      *,
      city:region_cities(*),
      rewards:route_rewards(*)
    `)
    .eq('is_active', true);

  if (cityId) {
    query = query.eq('city_id', cityId);
  }

  const { data, error } = await query.order('name');
  
  if (error) throw error;
  
  return (data || []).map(route => ({
    ...route,
    difficulty_level: route.difficulty_level as 'facil' | 'medio' | 'dificil',
    rewards: (route.rewards || []).map((reward: any) => ({
      ...reward,
      reward_type: reward.reward_type as 'discount' | 'coupon' | 'gift' | 'certificate'
    }))
  }));
};

export const fetchRoutesByRegion = async (regionId: string): Promise<EnhancedTouristRoute[]> => {
  const { data, error } = await supabase
    .from('tourist_routes')
    .select(`
      *,
      city:region_cities!inner(*),
      rewards:route_rewards(*)
    `)
    .eq('city.region_id', regionId)
    .eq('is_active', true)
    .order('name');
  
  if (error) throw error;
  
  return (data || []).map(route => ({
    ...route,
    difficulty_level: route.difficulty_level as 'facil' | 'medio' | 'dificil',
    rewards: (route.rewards || []).map((reward: any) => ({
      ...reward,
      reward_type: reward.reward_type as 'discount' | 'coupon' | 'gift' | 'certificate'
    }))
  }));
};

// Serviços para Recompensas
export const fetchRouteRewards = async (routeId: string): Promise<RouteReward[]> => {
  const { data, error } = await supabase
    .from('route_rewards')
    .select('*')
    .eq('route_id', routeId)
    .eq('is_active', true);
  
  if (error) throw error;
  
  return (data || []).map(reward => ({
    ...reward,
    reward_type: reward.reward_type as 'discount' | 'coupon' | 'gift' | 'certificate'
  }));
};

export const fetchRegionRewards = async (regionId: string): Promise<RouteReward[]> => {
  const { data, error } = await supabase
    .from('route_rewards')
    .select('*')
    .eq('region_id', regionId)
    .eq('is_active', true);
  
  if (error) throw error;
  
  return (data || []).map(reward => ({
    ...reward,
    reward_type: reward.reward_type as 'discount' | 'coupon' | 'gift' | 'certificate'
  }));
};

export const fetchUserRewards = async (userId: string): Promise<UserReward[]> => {
  const { data, error } = await supabase
    .from('user_rewards')
    .select(`
      *,
      reward:route_rewards(*)
    `)
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });
  
  if (error) throw error;
  
  // Aplicar type assertion para o reward também
  return (data || []).map(userReward => ({
    ...userReward,
    reward: userReward.reward ? {
      ...userReward.reward,
      reward_type: userReward.reward.reward_type as 'discount' | 'coupon' | 'gift' | 'certificate'
    } : undefined
  }));
};

// Serviços para Progressão do Usuário
export const createUserProgress = async (progress: {
  user_id: string;
  region_id?: string;
  city_id?: string;
  route_id?: string;
  completed_at: string;
  points_earned: number;
  stamp_earned?: boolean;
  proof_photo_url?: string;
  user_notes?: string;
}): Promise<UserPassportProgress> => {
  const { data, error } = await supabase
    .from('user_passport_progress')
    .insert(progress)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const fetchUserProgress = async (userId: string): Promise<UserPassportProgress[]> => {
  const { data, error } = await supabase
    .from('user_passport_progress')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

// Serviços para Carimbos Digitais
export const createDigitalStamp = async (stamp: {
  user_id: string;
  region_id?: string;
  city_id?: string;
  route_id?: string;
  stamp_name: string;
  stamp_icon_url?: string;
  cultural_phrase?: string;
  earned_at: string;
  completion_percentage?: number;
}): Promise<DigitalStamp> => {
  const { data, error } = await supabase
    .from('digital_stamps')
    .insert(stamp)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const fetchUserStamps = async (userId: string): Promise<DigitalStamp[]> => {
  const { data, error } = await supabase
    .from('digital_stamps')
    .select('*')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const fetchUserStampsByRegion = async (userId: string, regionId: string): Promise<DigitalStamp[]> => {
  const { data, error } = await supabase
    .from('digital_stamps')
    .select('*')
    .eq('user_id', userId)
    .eq('region_id', regionId)
    .order('earned_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

// Serviços para Recompensas do Usuário
export const createUserReward = async (reward: {
  user_id: string;
  reward_id: string;
  earned_at: string;
  is_claimed?: boolean;
  claimed_at?: string;
  claim_location?: string;
}): Promise<UserReward> => {
  const claimCode = `MS${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  
  const { data, error } = await supabase
    .from('user_rewards')
    .insert({
      ...reward,
      claim_code: claimCode
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const claimUserReward = async (rewardId: string, claimLocation?: string): Promise<UserReward> => {
  const { data, error } = await supabase
    .from('user_rewards')
    .update({
      is_claimed: true,
      claimed_at: new Date().toISOString(),
      claim_location: claimLocation
    })
    .eq('id', rewardId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Serviços para Estatísticas
export const fetchRegionStatistics = async (regionId: string) => {
  const { data, error } = await supabase.rpc('get_region_statistics', {
    region_uuid: regionId
  });
  
  if (error) throw error;
  return data?.[0] || {
    total_users: 0,
    completed_routes: 0,
    most_visited_city: 'N/A',
    average_completion_time: 0
  };
};

// Serviço para verificar proximidade geográfica
export const checkLocationProximity = (
  userLat: number,
  userLng: number,
  targetLat: number,
  targetLng: number,
  radiusMeters: number = 1000
): boolean => {
  const R = 6371000; // Raio da Terra em metros
  const dLat = (targetLat - userLat) * Math.PI / 180;
  const dLng = (targetLng - userLng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(userLat * Math.PI / 180) * Math.cos(targetLat * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance <= radiusMeters;
};
