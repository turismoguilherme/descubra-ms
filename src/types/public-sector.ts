export interface CATAttendant {
  id: string;
  name: string;
  email: string;
  phone: string;
  cat_location: string;
  cat_name: string;
  role: 'attendant' | 'supervisor' | 'manager';
  is_active: boolean;
  working_hours: {
    monday: { start: string; end: string; is_working: boolean };
    tuesday: { start: string; end: string; is_working: boolean };
    wednesday: { start: string; end: string; is_working: boolean };
    thursday: { start: string; end: string; is_working: boolean };
    friday: { start: string; end: string; is_working: boolean };
    saturday: { start: string; end: string; is_working: boolean };
    sunday: { start: string; end: string; is_working: boolean };
  };
  created_at: string;
  updated_at: string;
}

export interface CATLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  phone: string;
  email: string;
  opening_hours: string;
  services: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TouristService {
  id: string;
  name: string;
  description: string;
  category: 'information' | 'assistance' | 'emergency' | 'booking' | 'transport' | 'accommodation';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'available' | 'busy' | 'maintenance' | 'unavailable';
  location_id: string;
  attendant_id?: string;
  estimated_duration: number; // in minutes
  is_public_service: boolean;
  created_at: string;
  updated_at: string;
}

export interface TouristInteraction {
  id: string;
  tourist_name: string;
  tourist_email?: string;
  tourist_phone?: string;
  tourist_origin: string;
  interaction_type: 'in_person' | 'phone' | 'email' | 'chat' | 'whatsapp';
  service_requested: string;
  service_provided: string;
  satisfaction_rating?: number; // 1-5
  feedback?: string;
  duration_minutes: number;
  attendant_id: string;
  location_id: string;
  status: 'completed' | 'pending' | 'cancelled' | 'escalated';
  created_at: string;
  updated_at: string;
}

export interface PublicReport {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'custom';
  period_start: string;
  period_end: string;
  data: {
    total_interactions: number;
    interactions_by_type: Record<string, number>;
    interactions_by_location: Record<string, number>;
    interactions_by_attendant: Record<string, number>;
    satisfaction_average: number;
    most_requested_services: Array<{ service: string; count: number }>;
    tourist_origins: Array<{ origin: string; count: number }>;
    peak_hours: Array<{ hour: string; count: number }>;
  };
  generated_by: string;
  generated_at: string;
  is_public: boolean;
}

export interface EmergencyAlert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location_id: string;
  affected_services: string[];
  status: 'active' | 'resolved' | 'cancelled';
  created_by: string;
  created_at: string;
  resolved_at?: string;
  resolution_notes?: string;
}

export interface PublicSectorStats {
  total_interactions: number;
  interactions_today: number;
  interactions_this_week: number;
  interactions_this_month: number;
  active_attendants: number;
  total_locations: number;
  average_satisfaction: number;
  emergency_alerts: number;
  peak_hour: string;
  most_popular_service: string;
  interactions_by_hour: Array<{ hour: string; count: number }>;
  interactions_by_day: Array<{ day: string; count: number }>;
  satisfaction_trend: Array<{ date: string; rating: number }>;
  top_attendants: Array<{ attendant: string; interactions: number; rating: number }>;
  top_locations: Array<{ location: string; interactions: number }>;
}
