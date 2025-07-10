
export interface UserProfile {
  role: string;
  city_id: string | null;
  region_id: string | null;
  // Adicionar outros campos do perfil que possam ser úteis globalmente
  user_id: string;
  full_name?: string;
} 