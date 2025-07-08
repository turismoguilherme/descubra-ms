
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
        p_user_id: sanitizedEvent.user_id || null,
        p_action: sanitizedEvent.action,
        p_success: sanitizedEvent.success ?? true,
        p_error_message: sanitizedEvent.error_message || null,
        p_metadata: sanitizedEvent.metadata ? JSON.stringify(sanitizedEvent.metadata) : null
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
      const { data, error } = await supabase.rpc('is_admin_or_tech');
      
      const auditData = {
        action: `admin_validation_${sanitizeText(operationType)}`,
        table_name: tableName ? sanitizeText(tableName) : undefined,
        record_id: recordId ? sanitizeText(recordId) : undefined,
        success: !error && data,
        error_message: error?.message,
        metadata: { 
          operation_type: operationType,
          validation_timestamp: new Date().toISOString(),
          security_level: 'admin'
        }
      };

      await this.logSecurityEvent(auditData);

      return { 
        authorized: !error && data as boolean,
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

// Clean up expired entries every 10 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    enhancedSecurityService.clearExpiredEntries();
  }, 10 * 60 * 1000);
}
