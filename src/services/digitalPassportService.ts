
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
  // Como não temos tabela region_cities, retornamos dados mockados
  const mockCities: RegionCity[] = [
    {
      id: '1',
      region_id: regionId,
      name: 'Campo Grande',
      description: 'Capital de Mato Grosso do Sul',
      latitude: -20.4697,
      longitude: -54.6201,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
  
  return mockCities;
};

export const fetchAllCities = async (): Promise<RegionCity[]> => {
  // Como não temos tabela region_cities, retornamos dados mockados
  const mockCities: RegionCity[] = [
    {
      id: '1',
      region_id: 'ms-pantanal',
      name: 'Campo Grande',
      description: 'Capital de Mato Grosso do Sul',
      latitude: -20.4697,
      longitude: -54.6201,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      region_id: 'ms-pantanal',
      name: 'Bonito',
      description: 'Capital do Ecoturismo',
      latitude: -21.1293,
      longitude: -56.4891,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
  
  return mockCities;
};

// Serviços para Roteiros Melhorados
export const fetchEnhancedRoutes = async (cityId?: string): Promise<EnhancedTouristRoute[]> => {
  let query = supabase
    .from('routes')
    .select(`
      *,
      checkpoints:route_checkpoints(*)
    `)
    .eq('is_active', true);

  const { data, error } = await query.order('name');
  
  if (error) throw error;
  
  return (data || []).map(route => ({
    id: route.id,
    name: route.name,
    description: route.description || '',
    region: route.region || 'N/A',
    difficulty_level: (route.difficulty as 'facil' | 'medio' | 'dificil') || 'facil',
    estimated_duration: 60, // Default 60 minutes
    promotional_text: '',
    video_url: '',
    is_active: route.is_active || false,
    created_by: route.created_by,
    created_at: route.created_at,
    updated_at: route.updated_at,
    points: 10, // Default points
    requires_proof: false,
    proof_type: 'photo',
    rewards: [] // No rewards for now
  }));
};

export const fetchRoutesByRegion = async (regionId: string): Promise<EnhancedTouristRoute[]> => {
  const { data, error } = await supabase
    .from('routes')
    .select(`
      *,
      checkpoints:route_checkpoints(*)
    `)
    .eq('region', regionId)
    .eq('is_active', true)
    .order('name');
  
  if (error) throw error;
  
  return (data || []).map(route => ({
    id: route.id,
    name: route.name,
    description: route.description || '',
    region: route.region || 'N/A',
    difficulty_level: (route.difficulty as 'facil' | 'medio' | 'dificil') || 'facil',
    estimated_duration: 60, // Default 60 minutes
    promotional_text: '',
    video_url: '',
    is_active: route.is_active || false,
    created_by: route.created_by,
    created_at: route.created_at,
    updated_at: route.updated_at,
    points: 10, // Default points
    requires_proof: false,
    proof_type: 'photo',
    rewards: [] // No rewards for now
  }));
};

// Serviços para Recompensas (Mockados por enquanto)
export const fetchRouteRewards = async (routeId: string): Promise<RouteReward[]> => {
  return []; // Empty array - tables don't exist yet
};

export const fetchRegionRewards = async (regionId: string): Promise<RouteReward[]> => {
  return []; // Empty array - tables don't exist yet
};

export const fetchUserRewards = async (userId: string): Promise<UserReward[]> => {
  return []; // Empty array - tables don't exist yet
};

// Serviços para Progressão do Usuário (usando passport_stamps)
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
  // Use passport_stamps instead
  const { data, error } = await supabase
    .from('passport_stamps')
    .insert({
      user_id: progress.user_id,
      route_id: progress.route_id,
      stamp_type: 'route_completion',
      stamped_at: progress.completed_at
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    user_id: data.user_id,
    route_id: data.route_id,
    completed_at: data.stamped_at || progress.completed_at,
    points_earned: progress.points_earned,
    stamp_earned: true
  };
};

export const fetchUserProgress = async (userId: string): Promise<UserPassportProgress[]> => {
  const { data, error } = await supabase
    .from('passport_stamps')
    .select('*')
    .eq('user_id', userId)
    .order('stamped_at', { ascending: false });
  
  if (error) throw error;
  
  return (data || []).map(stamp => ({
    id: stamp.id,
    user_id: stamp.user_id,
    route_id: stamp.route_id,
    completed_at: stamp.stamped_at || '',
    points_earned: 10,
    stamp_earned: true
  }));
};

// Serviços para Carimbos Digitais (Mockados - tabelas não existem)
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
  return {
    id: crypto.randomUUID(),
    user_id: stamp.user_id,
    region_id: stamp.region_id,
    city_id: stamp.city_id,
    route_id: stamp.route_id,
    stamp_name: stamp.stamp_name,
    stamp_icon_url: stamp.stamp_icon_url,
    cultural_phrase: stamp.cultural_phrase,
    earned_at: stamp.earned_at,
    completion_percentage: stamp.completion_percentage || 100
  };
};

export const fetchUserStamps = async (userId: string): Promise<DigitalStamp[]> => {
  return []; // Empty array - tables don't exist yet
};

export const fetchUserStampsByRegion = async (userId: string, regionId: string): Promise<DigitalStamp[]> => {
  return []; // Empty array - tables don't exist yet
};

// Serviços para Recompensas do Usuário (Mockados - tabelas não existem)
export const createUserReward = async (reward: {
  user_id: string;
  reward_id: string;
  earned_at: string;
  is_claimed?: boolean;
  claimed_at?: string;
  claim_location?: string;
}): Promise<UserReward> => {
  return {
    id: crypto.randomUUID(),
    user_id: reward.user_id,
    reward_id: reward.reward_id,
    earned_at: reward.earned_at,
    is_claimed: reward.is_claimed || false,
    claimed_at: reward.claimed_at,
    claim_location: reward.claim_location,
    claim_code: `MS${Date.now()}`
  };
};

export const claimUserReward = async (rewardId: string, claimLocation?: string): Promise<UserReward> => {
  return {
    id: rewardId,
    user_id: '',
    reward_id: '',
    earned_at: new Date().toISOString(),
    is_claimed: true,
    claimed_at: new Date().toISOString(),
    claim_location: claimLocation,
    claim_code: `MS${Date.now()}`
  };
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
