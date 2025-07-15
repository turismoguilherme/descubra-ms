
export interface UserProfile {
  role: string;
  city_id: string | null;
  region_id: string | null;
  user_id?: string;
  full_name?: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}