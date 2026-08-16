export type UserType = 'empresa' | 'atendente' | 'gestor_municipal' | 'gestor_estadual' | 'master_admin';

export interface OverflowOneUserProfile {
  user_id: string;
  company_name: string;
  contact_person: string;
  user_type: UserType;
  role: 'admin' | 'manager' | 'user';
  subscription_plan: 'basic' | 'premium' | 'enterprise';
  subscription_status: 'active' | 'suspended' | 'cancelled';
  created_at?: string;
  updated_at?: string;
}
