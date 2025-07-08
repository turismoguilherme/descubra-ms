
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
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  points?: number;
  proof_type?: string;
  map_image_url?: string;
  stamp_icon_url?: string;
  requires_proof?: boolean;
  city_id?: string;
  checkpoints?: RouteCheckpoint[];
  total_participants?: number;
  completion_rate?: number;
}

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
  created_at: string;
  updated_at: string;
  image_url?: string;
  video_url?: string;
}

export interface CheckpointCreateData {
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  order_index: number;
  required_time_minutes?: number;
  promotional_text?: string;
  validation_radius_meters?: number;
}

export interface RouteCreateData {
  name: string;
  description?: string;
  region: string;
  difficulty_level: "facil" | "medio" | "dificil";
  estimated_duration: number;
  promotional_text?: string;
  video_url?: string;
  is_active: boolean;
  checkpoints?: CheckpointCreateData[];
}

export interface UserBenefit {
  id: string;
  user_id: string;
  benefit_type: string;
  benefit_name: string;
  description?: string;
  is_used: boolean;
  used_at?: string;
  expires_at?: string;
  created_at?: string;
  updated_at?: string;
  benefit_id?: string;
  redemption_code?: string;
}

export interface RouteBenefit {
  id: string;
  route_id?: string;
  title: string;
  description?: string;
  benefit_type: string;
  discount_percentage?: number;
  partner_name?: string;
  where_to_claim?: string;
  how_to_claim: string;
  valid_until?: string;
  is_active: boolean;
  value_percentage?: number;
  value_amount?: number;
  expiry_date?: string;
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
  animal_id?: string;
}

export interface PantanalAnimal {
  id: string;
  name: string;
  scientific_name?: string;
  habitat?: string;
  description?: string;
  conservation_status?: string;
  image_url?: string;
  fun_fact?: string;
  rarity_level?: string;
}

export interface UserPassportStats {
  totalPoints: number;
  completedRoutes: number;
  earnedStamps: number;
  level: string;
  nextLevelProgress: number;
  availableBenefits: number;
  total_points: number;
  total_stamps: number;
  total_routes_completed: number;
  total_benefits_earned: number;
}
