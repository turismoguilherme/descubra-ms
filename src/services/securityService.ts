
import { supabase } from "@/integrations/supabase/client";

// Estas funções de segurança são SECURITY DEFINER e tiveram o EXECUTE revogado
// do papel `authenticated` no endurecimento de segurança do banco. O log sério
// acontece no servidor (edge functions com service_role). No cliente, tratamos
// o "permission denied" (42501) como esperado e evitamos poluir o console.
function isPermissionDenied(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { code?: string; message?: string };
  return e.code === "42501" || /permission denied/i.test(e.message ?? "");
}

export interface SecurityEvent {
  user_id?: string;
  action: string;
  table_name?: string;
  record_id?: string;
  ip_address?: string;
  user_agent?: string;
  success?: boolean;
  error_message?: string;
  metadata?: Record<string, any>;
}

export const securityService = {
  // Enhanced security event logging with metadata support
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    
    try {
      const metadata = {
        ip_address: event.ip_address,
        user_agent: event.user_agent,
        ...event.metadata
      };

      const { error } = await supabase.rpc('log_enhanced_security_event', {
        event_action: event.action,
        event_user_id: event.user_id || null,
        event_success: event.success ?? true,
        event_error_message: event.error_message || null,
        event_metadata: metadata
      });

      if (error && !isPermissionDenied(error)) {
        console.error('Error logging security event:', error);
      }
    } catch (error) {
      if (!isPermissionDenied(error)) {
        console.error('Failed to log security event:', error);
      }
    }
  },

  // Detect suspicious user activity
  async detectSuspiciousActivity(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase.rpc('detect_suspicious_activity', {
        check_user_id: userId
      });

      if (error) {
        if (!isPermissionDenied(error)) {
          console.error('Error detecting suspicious activity:', error);
        }
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to detect suspicious activity:', error);
      return null;
    }
  },

  // Simple rate limiting check (fallback implementation)
  async checkRateLimit(
    identifier: string, 
    actionType: string, 
    maxAttempts: number = 5, 
    windowMinutes: number = 15
  ): Promise<boolean> {
    try {
      // For now, implement a simple localStorage-based rate limiting
      const key = `rate_limit_${identifier}_${actionType}`;
      const stored = localStorage.getItem(key);
      const now = Date.now();
      
      if (stored) {
        const { attempts, timestamp } = JSON.parse(stored);
        const windowMs = windowMinutes * 60 * 1000;
        
        if (now - timestamp < windowMs) {
          if (attempts >= maxAttempts) {
            return false;
          }
          localStorage.setItem(key, JSON.stringify({ 
            attempts: attempts + 1, 
            timestamp 
          }));
        } else {
          localStorage.setItem(key, JSON.stringify({ 
            attempts: 1, 
            timestamp: now 
          }));
        }
      } else {
        localStorage.setItem(key, JSON.stringify({ 
          attempts: 1, 
          timestamp: now 
        }));
      }
      
      return true;
    } catch (error) {
      console.error('Failed to check rate limit:', error);
      return true; // Allow on error
    }
  },

  // Validate admin operations using existing function
  async validateAdminOperation(
    operationType: string,
    tableName?: string,
    recordId?: string
  ): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase.rpc('is_admin_user', {
        check_user_id: user.id
      });

      if (error) {
        console.error('Error validating admin operation:', error);
        return false;
      }

      // Log the operation attempt
      await this.logSecurityEvent({
        action: `admin_operation_${operationType}`,
        table_name: tableName,
        record_id: recordId,
        success: Boolean(data),
        metadata: { operation_type: operationType }
      });

      return Boolean(data);
    } catch (error) {
      console.error('Failed to validate admin operation:', error);
      return false;
    }
  },

  // Get security audit logs
  async getSecurityLogs(limit: number = 50): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching security logs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch security logs:', error);
      return [];
    }
  }
};
