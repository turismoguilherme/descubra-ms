
export interface UserData {
  id: string;
  name: string;
  email: string;
  full_name: string;
  user_type: string;
  role: string;
  region: string;
  status: string;
  created_at: string;
  last_sign_in_at?: string;
  phone?: string;
  city?: string;
}

export interface UserStatistics {
  role_name: string;
  user_count: number;
  active_count: number;
}
