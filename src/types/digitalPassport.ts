
// Tipos para o sistema de Passaporte Digital gamificado
export interface TouristRegion {
  id: string;
  name: string;
  description?: string;
  visual_art_url?: string;
  video_url?: string;
  guardian_avatar_url?: string;
  map_image_url?: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface RegionCity {
  id: string;
  region_id: string;
  name: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  icon_url?: string;
  cultural_description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RouteReward {
  id: string;
  route_id?: string;
  region_id?: string;
  title: string;
  description: string;
  reward_type: 'discount' | 'coupon' | 'gift' | 'certificate';
  discount_percentage?: number;
  partner_name?: string;
  partner_contact?: string;
  how_to_claim: string;
  where_to_claim?: string;
  valid_until?: string;
  max_uses?: number;
  current_uses: number;
  is_active: boolean;
  created_at: string;
}

export interface UserPassportProgress {
  id: string;
  user_id: string;
  region_id?: string;
  city_id?: string;
  route_id?: string;
  completed_at: string;
  points_earned: number;
  stamp_earned: boolean;
  proof_photo_url?: string;
  user_notes?: string;
}

export interface DigitalStamp {
  id: string;
  user_id: string;
  region_id?: string;
  city_id?: string;
  route_id?: string;
  stamp_name: string;
  stamp_icon_url?: string;
  cultural_phrase?: string;
  earned_at: string;
  completion_percentage: number;
}

export interface UserReward {
  id: string;
  user_id: string;
  reward_id: string;
  earned_at: string;
  claimed_at?: string;
  is_claimed: boolean;
  claim_code?: string;
  claim_location?: string;
  reward?: RouteReward;
}

export interface EnhancedTouristRoute {
  id: string;
  name: string;
  description?: string;
  region: string;
  city_id?: string;
  difficulty_level: 'facil' | 'medio' | 'dificil';
  estimated_duration: number;
  promotional_text?: string;
  video_url?: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  points: number;
  requires_proof: boolean;
  proof_type: string;
  map_image_url?: string;
  stamp_icon_url?: string;
  city?: RegionCity;
  rewards?: RouteReward[];
}

// Tipos para checkpoints (reutilizando do passport.ts existente)
export interface RouteCheckpoint {
  id: string;
  route_id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  order_index: number;
  required_time_minutes?: number;
  validation_radius_meters?: number;
  promotional_text?: string;
  video_url?: string;
  image_url?: string;
  created_at: string;
}
