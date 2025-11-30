// Types for Admin Panel

export interface Employee {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee' | 'editor';
  department: string | null;
  position: string | null;
  hire_date: string | null;
  is_active: boolean;
  permissions: EmployeePermissions | null;
  created_at: string;
  updated_at: string;
}

export interface EmployeePermissions {
  viajar: {
    employees: 'read' | 'write' | 'none';
    clients: 'read' | 'write' | 'none';
    subscriptions: 'read' | 'write' | 'none';
    payments: 'read' | 'write' | 'none';
    settings: 'read' | 'write' | 'none';
  };
  descubra_ms: {
    content: 'read' | 'write' | 'none';
    users: 'read' | 'write' | 'none';
    cat: 'read' | 'write' | 'none';
    settings: 'read' | 'write' | 'none';
    menus: 'read' | 'write' | 'none';
  };
  system: {
    fallback: 'read' | 'write' | 'none';
    ai_admin: 'read' | 'write' | 'none';
    logs: 'read' | 'write' | 'none';
  };
}

export interface ContentVersion {
  id: string;
  content_key: string;
  platform: 'viajar' | 'descubra_ms';
  content_type: 'text' | 'html' | 'markdown';
  content: string;
  version: number;
  is_published: boolean;
  edited_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DynamicMenu {
  id: string;
  platform: 'viajar' | 'descubra_ms';
  menu_type: 'main' | 'footer' | 'sidebar';
  label: string;
  path: string | null;
  icon: string | null;
  order_index: number;
  is_active: boolean;
  requires_auth: boolean;
  roles: string[] | null;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SystemFallback {
  id: string;
  platform: 'viajar' | 'descubra_ms';
  fallback_enabled: boolean;
  fallback_mode: 'maintenance' | 'readonly' | 'redirect' | null;
  maintenance_message: string | null;
  redirect_url: string | null;
  last_check: string | null;
  status: 'healthy' | 'degraded' | 'down';
  created_at: string;
  updated_at: string;
}

export interface PaymentReconciliation {
  id: string;
  subscription_id: string | null;
  stripe_payment_id: string | null;
  amount: number;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_date: string | null;
  reconciled: boolean;
  reconciled_by: string | null;
  reconciled_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AIAdminAction {
  id: string;
  action_type: 'monitor' | 'analyze' | 'suggest' | 'execute';
  platform: 'viajar' | 'descubra_ms' | 'both' | null;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'executed';
  requires_approval: boolean;
  approved_by: string | null;
  executed_at: string | null;
  result: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

