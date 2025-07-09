
export interface CATLocation {
  id: string;
  name: string;
  address?: string;
  city: string;
  region?: string;
  latitude: number;
  longitude: number;
  contact_phone?: string;
  contact_email?: string;
  working_hours?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CATCheckin {
  id: string;
  user_id: string;
  cat_name: string;
  latitude: number;
  longitude: number;
  distance_from_cat?: number;
  status: string;
  timestamp: string;
  created_at?: string;
  checkin_time?: string; // Alias para timestamp para compatibilidade
}
