import { supabase } from "@/integrations/supabase/client";

interface SecurityAuditEvent {
  action: string;
  userId?: string;
  success: boolean;
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

interface SecurityViolation {
  type: 'rate_limit' | 'invalid_access' | 'suspicious_activity' | 'privilege_escalation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export class SecurityAuditService {
  /**
   * Log eventos de segurança com contexto adicional
   */
  async logSecurityEvent(event: SecurityAuditEvent): Promise<void> {
    try {
      // Capturar informações adicionais do contexto
      const enhancedEvent = {
        ...event,
        ipAddress: event.ipAddress || this.getCurrentIP(),
        userAgent: event.userAgent || navigator.userAgent,
        timestamp: new Date().toISOString(),
        sessionId: this.getSessionId(),
        metadata: {
          ...event.metadata,
          url: window.location.href,
          referrer: document.referrer
        }
      };

      // Log no console para desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Security Event:', enhancedEvent);
      }

      // Enviar para o Supabase
      await supabase.rpc('log_security_event', {
        event_action: enhancedEvent.action,
        event_user_id: enhancedEvent.userId || null,
        event_success: enhancedEvent.success,
        event_error_message: enhancedEvent.errorMessage || null,
        event_ip_address: enhancedEvent.ipAddress || null,
        event_user_agent: enhancedEvent.userAgent || null
      });

    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  /**
   * Detectar e reportar violações de segurança
   */
  async reportSecurityViolation(violation: SecurityViolation): Promise<void> {
    await this.logSecurityEvent({
      action: `security_violation_${violation.type}`,
      userId: violation.userId,
      success: false,
      errorMessage: violation.description,
      metadata: {
        violationType: violation.type,
        severity: violation.severity,
        ...violation.metadata
      }
    });

    // Para violações críticas, podemos implementar alertas adicionais
    if (violation.severity === 'critical') {
      console.error('🚨 CRITICAL SECURITY VIOLATION:', violation);
      // Aqui poderia enviar notificações para administradores
    }
  }

  /**
   * Monitorar tentativas suspeitas de acesso
   */
  async monitorSuspiciousActivity(userId: string, action: string): Promise<boolean> {
    try {
      // Verificar padrões suspeitos nos últimos logs
      const { data: recentLogs } = await supabase
        .from('security_audit_log')
        .select('*')
        .eq('user_id', userId)
        .eq('action', action)
        .eq('success', false)
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Última hora
        .order('created_at', { ascending: false })
        .limit(10);

      const failedAttempts = recentLogs?.length || 0;
      
      if (failedAttempts >= 5) {
        await this.reportSecurityViolation({
          type: 'suspicious_activity',
          severity: 'high',
          description: `Multiple failed attempts detected for action: ${action}`,
          userId,
          metadata: { failedAttempts, action }
        });
        return true; // Atividade suspeita detectada
      }

      return false;
    } catch (error) {
      console.error('Error monitoring suspicious activity:', error);
      return false;
    }
  }

  /**
   * Validar integridade da sessão
   */
  validateSessionIntegrity(): boolean {
    try {
      const session = supabase.auth.getSession();
      if (!session) return true; // Sem sessão ativa

      // Verificar se a sessão não foi modificada
      const sessionData = localStorage.getItem('supabase.auth.token');
      if (!sessionData) return false;

      // Validações básicas de integridade
      const parsed = JSON.parse(sessionData);
      return !!(parsed.access_token && parsed.refresh_token);
    } catch (error) {
      console.error('Session integrity check failed:', error);
      return false;
    }
  }

  /**
   * Limpar dados sensíveis em caso de violação
   */
  securityCleanup(): void {
    try {
      // Limpar localStorage sensível
      const sensitiveKeys = ['mapbox_token', 'user_preferences', 'temp_data'];
      sensitiveKeys.forEach(key => localStorage.removeItem(key));

      // Limpar cookies não essenciais
      document.cookie.split(";").forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        if (!name.includes('essential')) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        }
      });

      console.log('🧹 Security cleanup completed');
    } catch (error) {
      console.error('Security cleanup failed:', error);
    }
  }

  private getCurrentIP(): string {
    // Placeholder - em produção, isso seria obtido do servidor
    return 'unknown';
  }

  private getSessionId(): string {
    let sessionId = localStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  }
}

export const securityAuditService = new SecurityAuditService();