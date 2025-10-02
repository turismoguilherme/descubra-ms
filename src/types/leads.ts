export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  source: LeadSource;
  status: LeadStatus;
  priority: LeadPriority;
  assigned_to?: string; // User ID
  value?: number; // Estimated deal value
  notes?: string;
  tags: string[];
  custom_fields: Record<string, any>;
  last_contact_date?: string;
  next_follow_up?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface LeadSource {
  id: string;
  name: string;
  description?: string;
  color: string;
  is_active: boolean;
  created_at: string;
}

export interface LeadStatus {
  id: string;
  name: string;
  description?: string;
  color: string;
  order: number;
  is_final: boolean; // true for "Won" or "Lost"
  is_active: boolean;
  created_at: string;
}

export interface LeadPriority {
  id: string;
  name: string;
  description?: string;
  color: string;
  order: number;
  is_active: boolean;
  created_at: string;
}

export interface LeadActivity {
  id: string;
  lead_id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task' | 'status_change';
  title: string;
  description?: string;
  date: string;
  duration?: number; // in minutes
  outcome?: string;
  created_by: string;
  created_at: string;
}

export interface LeadPipeline {
  id: string;
  name: string;
  description?: string;
  stages: LeadPipelineStage[];
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  created_by: string;
}

export interface LeadPipelineStage {
  id: string;
  pipeline_id: string;
  name: string;
  description?: string;
  order: number;
  color: string;
  probability: number; // 0-100
  is_active: boolean;
  created_at: string;
}

export interface LeadFilter {
  status?: string[];
  source?: string[];
  priority?: string[];
  assigned_to?: string[];
  created_date_from?: string;
  created_date_to?: string;
  value_min?: number;
  value_max?: number;
  tags?: string[];
  search?: string;
}

export interface LeadStats {
  total_leads: number;
  new_leads: number;
  qualified_leads: number;
  converted_leads: number;
  total_value: number;
  conversion_rate: number;
  avg_deal_size: number;
  leads_by_status: { status: string; count: number; value: number }[];
  leads_by_source: { source: string; count: number; value: number }[];
  leads_by_month: { month: string; count: number; value: number }[];
}
