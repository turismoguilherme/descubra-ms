
import { supabase } from "@/integrations/supabase/client";
import { sanitizeText, sanitizeEmail, validateInput } from "@/utils/sanitization";

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

export interface RateLimitConfig {
  maxAttempts: number;
  windowMinutes: number;
  blockDurationMinutes: number;
}

class EnhancedSecurityService {
  private rateLimitCache = new Map<string, { count: number; timestamp: number; blocked?: boolean }>();

  /**
   * Enhanced security event logging with automatic sanitization
   */
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      const sanitizedEvent = {
        ...event,
        action: sanitizeText(event.action),
        error_message: event.error_message ? sanitizeText(event.error_message) : null,
        metadata: event.metadata ? this.sanitizeMetadata(event.metadata) : null
      };

      const { error } = await supabase.rpc('log_security_event', {
        event_action: sanitizedEvent.action,
        event_user_id: sanitizedEvent.user_id || null,
        event_success: sanitizedEvent.success ?? true,
        event_error_message: sanitizedEvent.error_message || null
      });

      if (error) {
        console.error('Security logging failed:', error);
      }
    } catch (error) {
      console.error('Security event logging exception:', error);
    }
  }

  /**
   * Enhanced rate limiting with progressive penalties
   */
  async checkRateLimit(
    identifier: string, 
    actionType: string, 
    config: RateLimitConfig = { maxAttempts: 5, windowMinutes: 15, blockDurationMinutes: 30 }
  ): Promise<{ allowed: boolean; remainingAttempts?: number; blockExpiry?: Date }> {
    try {
      const key = `${sanitizeText(identifier)}_${sanitizeText(actionType)}`;
      const now = Date.now();
      const windowMs = config.windowMinutes * 60 * 1000;
      const blockMs = config.blockDurationMinutes * 60 * 1000;
      
      const stored = this.rateLimitCache.get(key);
      
      if (stored) {
        // Check if currently blocked
        if (stored.blocked && (now - stored.timestamp) < blockMs) {
          const blockExpiry = new Date(stored.timestamp + blockMs);
          await this.logSecurityEvent({
            action: `rate_limit_blocked_${actionType}`,
            success: false,
            error_message: 'Rate limit exceeded - access blocked',
            metadata: { identifier, actionType, blockExpiry }
          });
          return { allowed: false, blockExpiry };
        }
        
        // Reset if block period expired or window expired
        if (stored.blocked && (now - stored.timestamp) >= blockMs) {
          this.rateLimitCache.delete(key);
        } else if (!stored.blocked && (now - stored.timestamp) >= windowMs) {
          this.rateLimitCache.delete(key);
        } else if (!stored.blocked) {
          // Within window, check attempts
          if (stored.count >= config.maxAttempts) {
            // Block the identifier
            this.rateLimitCache.set(key, { 
              count: stored.count + 1, 
              timestamp: now, 
              blocked: true 
            });
            
            await this.logSecurityEvent({
              action: `rate_limit_exceeded_${actionType}`,
              success: false,
              error_message: 'Rate limit exceeded - blocking access',
              metadata: { identifier, actionType, attempts: stored.count + 1 }
            });
            
            const blockExpiry = new Date(now + blockMs);
            return { allowed: false, blockExpiry };
          } else {
            // Increment attempt count
            this.rateLimitCache.set(key, { 
              count: stored.count + 1, 
              timestamp: stored.timestamp 
            });
            return { 
              allowed: true, 
              remainingAttempts: config.maxAttempts - (stored.count + 1) 
            };
          }
        }
      }
      
      // First attempt or reset condition
      this.rateLimitCache.set(key, { count: 1, timestamp: now });
      return { allowed: true, remainingAttempts: config.maxAttempts - 1 };
      
    } catch (error) {
      console.error('Rate limit check failed:', error);
      await this.logSecurityEvent({
        action: `rate_limit_error_${actionType}`,
        success: false,
        error_message: 'Rate limit system error',
        metadata: { identifier, error: error instanceof Error ? error.message : String(error) }
      });
      // Fail open for system errors
      return { allowed: true };
    }
  }

  /**
   * Validate and sanitize form data
   */
  validateFormData(formData: Record<string, any>): { 
    isValid: boolean; 
    sanitizedData: Record<string, any>; 
    errors: Record<string, string> 
  } {
    const sanitizedData: Record<string, any> = {};
    const errors: Record<string, string> = {};
    let isValid = true;

    for (const [key, value] of Object.entries(formData)) {
      const sanitizedKey = sanitizeText(key);
      
      if (typeof value === 'string') {
        // Special handling for different field types
        if (key.toLowerCase().includes('email')) {
          sanitizedData[sanitizedKey] = sanitizeEmail(value);
          const validation = validateInput(value, {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          });
          if (!validation.isValid) {
            errors[sanitizedKey] = validation.error || 'Email inválido';
            isValid = false;
          }
        } else if (key.toLowerCase().includes('password')) {
          // Don't sanitize passwords, just validate
          const validation = validateInput(value, {
            required: true,
            minLength: 8,
            maxLength: 128
          });
          if (!validation.isValid) {
            errors[sanitizedKey] = validation.error || 'Senha inválida';
            isValid = false;
          } else {
            sanitizedData[sanitizedKey] = value; // Keep original password
          }
        } else {
          sanitizedData[sanitizedKey] = sanitizeText(value);
          const validation = validateInput(value, {
            maxLength: 500
          });
          if (!validation.isValid) {
            errors[sanitizedKey] = validation.error || 'Entrada inválida';
            isValid = false;
          }
        }
      } else {
        sanitizedData[sanitizedKey] = value;
      }
    }

    return { isValid, sanitizedData, errors };
  }

  /**
   * Enhanced admin operation validation with audit trail
   */
  async validateAdminOperation(
    operationType: string,
    tableName?: string,
    recordId?: string
  ): Promise<{ authorized: boolean; auditId?: string }> {
    try {
      // Use is_admin_user instead of is_admin_or_tech
      const { data, error } = await supabase.rpc('is_admin_user', {
        check_user_id: (await supabase.auth.getUser()).data.user?.id
      });
      
      const auditData = {
        action: `admin_validation_${sanitizeText(operationType)}`,
        table_name: tableName ? sanitizeText(tableName) : undefined,
        record_id: recordId ? sanitizeText(recordId) : undefined,
        success: !error && Boolean(data),
        error_message: error?.message,
        metadata: { 
          operation_type: operationType,
          validation_timestamp: new Date().toISOString(),
          security_level: 'admin'
        }
      };

      await this.logSecurityEvent(auditData);

      return { 
        authorized: !error && Boolean(data),
        auditId: auditData.metadata.validation_timestamp
      };
    } catch (error) {
      await this.logSecurityEvent({
        action: `admin_validation_error_${sanitizeText(operationType)}`,
        success: false,
        error_message: error instanceof Error ? error.message : String(error),
        metadata: { operation_type: operationType, security_level: 'admin' }
      });
      return { authorized: false };
    }
  }

  /**
   * Secure user role update using new security functions
   */
  async updateUserRole(targetUserId: string, newRole: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('secure_update_user_role', {
        target_user_id: targetUserId,
        new_role: newRole
      });

      if (error) {
        await this.logSecurityEvent({
          action: 'secure_role_update_failed',
          user_id: targetUserId,
          success: false,
          error_message: error.message,
          metadata: { attempted_role: newRole }
        });
        return false;
      }

      return Boolean(data);
    } catch (error: any) {
      await this.logSecurityEvent({
        action: 'secure_role_update_error',
        user_id: targetUserId,
        success: false,
        error_message: error.message,
        metadata: { attempted_role: newRole }
      });
      return false;
    }
  }

  /**
   * Send critical security alert
   */
  async sendSecurityAlert(alert: {
    type: 'privilege_escalation' | 'suspicious_activity' | 'unauthorized_access';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      await supabase.functions.invoke('security-monitor', {
        body: { alert }
      });
    } catch (error) {
      console.error('Failed to send security alert:', error);
    }
  }

  /**
   * Monitor suspicious activity patterns
   */
  async detectSuspiciousActivity(): Promise<{
    suspicious: boolean;
    patterns: string[];
    severity: 'low' | 'medium' | 'high';
  }> {
    try {
      // Check for multiple failed login attempts from same IP
      const recentFailedLogins = Array.from(this.rateLimitCache.entries())
        .filter(([key, data]) => key.includes('login') && data.count >= 3)
        .length;

      // Check for rapid-fire requests
      const rapidRequests = Array.from(this.rateLimitCache.entries())
        .filter(([, data]) => data.count >= 10 && !data.blocked)
        .length;

      // Check for unusual time patterns
      const now = new Date();
      const currentHour = now.getHours();
      const isUnusualTime = currentHour < 6 || currentHour > 22;

      // Check for geographic anomalies (simulated)
      const suspiciousGeoPatterns = Array.from(this.rateLimitCache.entries())
        .filter(([key, data]) => key.includes('geo_anomaly'))
        .length;

      const patterns: string[] = [];
      let severity: 'low' | 'medium' | 'high' = 'low';

      if (recentFailedLogins > 0) {
        patterns.push(`${recentFailedLogins} usuários com múltiplas tentativas de login falhadas`);
        severity = 'medium';
      }

      if (rapidRequests > 0) {
        patterns.push(`${rapidRequests} usuários com muitas requisições rápidas`);
        severity = severity === 'medium' ? 'high' : 'medium';
      }

      if (isUnusualTime && (recentFailedLogins > 0 || rapidRequests > 0)) {
        patterns.push('Atividade suspeita detectada fora do horário normal');
        severity = 'high';
      }

      if (suspiciousGeoPatterns > 0) {
        patterns.push(`${suspiciousGeoPatterns} padrões geográficos suspeitos detectados`);
        severity = severity === 'high' ? 'high' : 'medium';
      }

      const suspicious = patterns.length > 0;

      if (suspicious) {
        await this.logSecurityEvent({
          action: 'suspicious_activity_detected',
          success: true,
          metadata: { patterns, severity, detection_timestamp: new Date().toISOString() }
        });
      }

      return { suspicious, patterns, severity };
    } catch (error) {
      console.error('Suspicious activity detection failed:', error);
      return { suspicious: false, patterns: [], severity: 'low' };
    }
  }

  /**
   * Advanced threat detection with machine learning-like pattern recognition
   */
  async detectAdvancedThreats(): Promise<{
    threats: Array<{
      type: 'brute_force' | 'credential_stuffing' | 'account_takeover' | 'privilege_escalation';
      confidence: number;
      description: string;
      severity: 'low' | 'medium' | 'high';
      indicators: string[];
    }>;
  }> {
    try {
      const threats = [];
      
      // Brute force detection
      const bruteForceAttempts = Array.from(this.rateLimitCache.entries())
        .filter(([key, data]) => key.includes('login') && data.count >= 5)
        .length;

      if (bruteForceAttempts > 2) {
        threats.push({
          type: 'brute_force' as const,
          confidence: Math.min(bruteForceAttempts * 0.15, 0.95),
          description: 'Múltiplas tentativas de login em curto período',
          severity: 'high' as const,
          indicators: [`${bruteForceAttempts} padrões de força bruta detectados`]
        });
      }

      // Credential stuffing detection
      const credentialStuffingPattern = Array.from(this.rateLimitCache.entries())
        .filter(([key, data]) => key.includes('registration') && data.count >= 3)
        .length;

      if (credentialStuffingPattern > 1) {
        threats.push({
          type: 'credential_stuffing' as const,
          confidence: 0.7,
          description: 'Possível tentativa de credential stuffing',
          severity: 'medium' as const,
          indicators: ['Múltiplas tentativas de registro com padrões suspeitos']
        });
      }

      if (threats.length > 0) {
        await this.logSecurityEvent({
          action: 'advanced_threat_detected',
          success: true,
          metadata: { threats, detection_timestamp: new Date().toISOString() }
        });
      }

      return { threats };
    } catch (error) {
      console.error('Advanced threat detection failed:', error);
      return { threats: [] };
    }
  }

  /**
   * Simplified security monitoring (removed real-time intervals)
   */
  async startSecurityMonitoring(): Promise<void> {
    // Remove automatic monitoring to prevent performance issues
    // Monitoring will be done on-demand when needed
    console.log('Security monitoring initialized (on-demand mode)');
  }

  /**
   * Sanitize metadata objects recursively
   */
  private sanitizeMetadata(metadata: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(metadata)) {
      const sanitizedKey = sanitizeText(key);
      
      if (typeof value === 'string') {
        sanitized[sanitizedKey] = sanitizeText(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[sanitizedKey] = this.sanitizeMetadata(value);
      } else {
        sanitized[sanitizedKey] = value;
      }
    }
    
    return sanitized;
  }

  /**
   * Clear expired rate limit entries (call periodically)
   */
  clearExpiredEntries(): void {
    const now = Date.now();
    const thirtyMinutes = 30 * 60 * 1000;
    
    for (const [key, data] of this.rateLimitCache.entries()) {
      if (now - data.timestamp > thirtyMinutes) {
        this.rateLimitCache.delete(key);
      }
    }
  }
}

export const enhancedSecurityService = new EnhancedSecurityService();

// Simplified cleanup - remove automatic intervals
if (typeof window !== 'undefined') {
  // Clean up expired entries only when needed, not automatically
  // Log removido para reduzir verbosidade
}
