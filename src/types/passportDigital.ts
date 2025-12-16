// Tipos para o sistema de Passaporte Digital Gamificado

export interface PassportConfiguration {
  id: string;
  route_id: string;
  stamp_theme: string;
  stamp_fragments: number;
  video_url?: string | null;
  description?: string | null;
  map_config: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
}

export interface PassportReward {
  id: string;
  route_id: string;
  partner_name: string;
  reward_type: 'desconto' | 'brinde' | 'experiencia' | 'outros';
  reward_description?: string | null;
  reward_code_prefix?: string | null;
  discount_percentage?: number | null;
  partner_address?: string | null;
  partner_phone?: string | null;
  partner_email?: string | null;
  is_active: boolean;
  max_vouchers?: number | null;
  max_per_user?: number | null;
  is_fallback?: boolean | null;
  expires_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserReward {
  id: string;
  user_id: string;
  reward_id: string;
  route_id: string;
  voucher_code: string;
  is_used: boolean;
  used_at?: string | null;
  created_at: string;
  reward?: PassportReward;
}

export interface OfflineCheckin {
  id: string;
  user_id: string;
  checkpoint_id: string;
  route_id: string;
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  photo_url?: string | null;
  photo_metadata?: Record<string, any> | null;
  device_info?: string | null;
   partner_code_input?: string | null;
  synced: boolean;
  synced_at?: string | null;
  created_at: string;
  validated: boolean;
  validation_error?: string | null;
}

export interface UserPassport {
  id: string;
  user_id: string;
  passport_number: string;
  created_at: string;
  updated_at: string;
}

export interface RouteCheckpointExtended {
  id: string;
  route_id: string;
  destination_id?: string | null;
  order_sequence: number;
  name: string;
  description?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  is_mandatory: boolean;
  created_at?: string | null;
  // Campos adicionais do passaporte
  stamp_fragment_number?: number | null;
  geofence_radius?: number | null;
  requires_photo?: boolean | null;
  validation_mode?: 'geofence' | 'code' | 'mixed' | null;
  partner_code?: string | null;
}

export interface RouteExtended {
  id: string;
  name: string;
  description?: string | null;
  region?: string | null;
  difficulty?: string | null;
  estimated_duration?: string | null;
  distance_km?: number | null;
  image_url?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  city_id?: string | null;
  state_id?: string | null;
  // Campos adicionais do passaporte
  video_url?: string | null;
  passport_number_prefix?: string | null;
  // Relacionamentos
  configuration?: PassportConfiguration | null;
  checkpoints?: RouteCheckpointExtended[];
  rewards?: PassportReward[];
}

export interface StampProgress {
  route_id: string;
  theme: string;
  total_fragments: number;
  collected_fragments: number;
  completion_percentage: number;
  fragments: Array<{
    checkpoint_id: string;
    checkpoint_name: string;
    fragment_number: number;
    collected: boolean;
    collected_at?: string;
  }>;
}

export interface CheckinResult {
  success: boolean;
  checkpoint_id: string;
  route_id: string;
  stamp_earned: boolean;
  fragment_collected?: number;
  points_earned: number;
  route_completed: boolean;
  rewards_unlocked?: UserReward[];
  error?: string;
}

export interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

export interface GeofenceValidation {
  valid: boolean;
  distance: number;
  within_radius: boolean;
  checkpoint_id: string;
  checkpoint_name: string;
  required_radius: number;
}

export interface OfflineSyncStatus {
  is_online: boolean;
  pending_checkins: number;
  last_sync?: string;
  syncing: boolean;
}

