import { supabase } from "@/integrations/supabase/client";

interface RateLimitEntry {
  count: number;
  windowStart: number;
  blocked: boolean;
  blockExpiry?: number;
}

interface SecurityAlert {
  type: 'rate_limit_exceeded' | 'suspicious_pattern' | 'geo_anomaly' | 'brute_force';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metadata: Record<string, any>;
}

class ServerSideSecurityService {
  private static instance: ServerSideSecurityService;
  private rateLimitStore = new Map<string, RateLimitEntry>();
  private securityAlerts: SecurityAlert[] = [];

  static getInstance(): ServerSideSecurityService {
    if (!ServerSideSecurityService.instance) {
      ServerSideSecurityService.instance = new ServerSideSecurityService();
    }
    return ServerSideSecurityService.instance;
  }

  /**
   * Enhanced server-side rate limiting with geographic considerations
   */
  async checkAdvancedRateLimit(
    identifier: string,
    actionType: string,
    config: {
      maxAttempts: number;
      windowMinutes: number;
      blockDurationMinutes: number;
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<{
    allowed: boolean;
    remainingAttempts?: number;
    blockExpiry?: Date;
    securityLevel: 'normal' | 'elevated' | 'high';
  }> {
    const now = Date.now();
    const windowMs = config.windowMinutes * 60 * 1000;
    const blockMs = config.blockDurationMinutes * 60 * 1000;
    const key = `${identifier}_${actionType}`;

    try {
      // Check existing rate limit
      const existing = this.rateLimitStore.get(key);
      
      if (existing) {
        // Check if blocked
        if (existing.blocked && existing.blockExpiry && now < existing.blockExpiry) {
          return {
            allowed: false,
            blockExpiry: new Date(existing.blockExpiry),
            securityLevel: 'high'
          };
        }

        // Reset if window expired
        if (now - existing.windowStart > windowMs) {
          this.rateLimitStore.delete(key);
        } else {
          // Increment attempt count
          const newCount = existing.count + 1;
          
          if (newCount > config.maxAttempts) {
            // Block the identifier
            const blockExpiry = now + blockMs;
            this.rateLimitStore.set(key, {
              ...existing,
              count: newCount,
              blocked: true,
              blockExpiry
            });

            // Generate security alert
            await this.generateSecurityAlert({
              type: 'rate_limit_exceeded',
              severity: newCount > config.maxAttempts * 2 ? 'critical' : 'high',
              description: `Rate limit exceeded for ${actionType}`,
              metadata: {
                identifier,
                actionType,
                attemptCount: newCount,
                ipAddress: config.ipAddress,
                userAgent: config.userAgent
              }
            });

            return {
              allowed: false,
              blockExpiry: new Date(blockExpiry),
              securityLevel: 'high'
            };
          }

          // Update count
          this.rateLimitStore.set(key, {
            ...existing,
            count: newCount
          });

          const remainingAttempts = config.maxAttempts - newCount;
          const securityLevel = remainingAttempts <= 2 ? 'elevated' : 'normal';

          return {
            allowed: true,
            remainingAttempts,
            securityLevel
          };
        }
      }

      // First attempt or reset
      this.rateLimitStore.set(key, {
        count: 1,
        windowStart: now,
        blocked: false
      });

      return {
        allowed: true,
        remainingAttempts: config.maxAttempts - 1,
        securityLevel: 'normal'
      };

    } catch (error) {
      console.error('Advanced rate limit check failed:', error);
      // Fail secure - allow but log
      await this.logSecurityEvent('rate_limit_system_error', {
        error: error instanceof Error ? error.message : String(error),
        identifier,
        actionType
      });
      return { allowed: true, securityLevel: 'normal' };
    }
  }

  /**
   * Generate and process security alerts
   */
  private async generateSecurityAlert(alert: SecurityAlert): Promise<void> {
    this.securityAlerts.push(alert);

    // Log alert to database
    await this.logSecurityEvent('security_alert_generated', {
      alert_type: alert.type,
      severity: alert.severity,
      description: alert.description,
      metadata: alert.metadata
    });

    // Send to monitoring service if critical
    if (alert.severity === 'critical') {
      try {
        await supabase.functions.invoke('security-monitor', {
          body: { alert }
        });
      } catch (error) {
        console.error('Failed to send critical alert:', error);
      }
    }
  }

  /**
   * Detect suspicious patterns across multiple dimensions
   */
  async detectAdvancedSuspiciousPatterns(): Promise<{
    patterns: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high';
      description: string;
      confidence: number;
    }>;
    overallRisk: 'low' | 'medium' | 'high' | 'critical';
  }> {
    const patterns = [];
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    // Pattern 1: Multiple blocked IPs
    const blockedEntries = Array.from(this.rateLimitStore.values())
      .filter(entry => entry.blocked && entry.blockExpiry && entry.blockExpiry > now);

    if (blockedEntries.length > 5) {
      patterns.push({
        type: 'distributed_attack',
        severity: 'high' as const,
        description: `${blockedEntries.length} endereços bloqueados simultaneamente`,
        confidence: 0.85
      });
    }

    // Pattern 2: Rapid successive attempts across different identifiers
    const recentEntries = Array.from(this.rateLimitStore.entries())
      .filter(([, entry]) => now - entry.windowStart < oneHour)
      .filter(([, entry]) => entry.count > 3);

    if (recentEntries.length > 10) {
      patterns.push({
        type: 'coordinated_attack',
        severity: 'high' as const,
        description: `${recentEntries.length} identidades com múltiplas tentativas na última hora`,
        confidence: 0.78
      });
    }

    // Pattern 3: Time-based anomalies
    const currentHour = new Date().getHours();
    const isOffHours = currentHour < 6 || currentHour > 22;
    
    if (isOffHours && recentEntries.length > 3) {
      patterns.push({
        type: 'off_hours_activity',
        severity: 'medium' as const,
        description: 'Atividade suspeita detectada fora do horário comercial',
        confidence: 0.65
      });
    }

    // Determine overall risk
    let overallRisk: 'low' | 'medium' | 'high' | 'critical' = 'low';
    
    const highSeverityCount = patterns.filter(p => p.severity === 'high').length;
    const mediumSeverityCount = patterns.filter(p => p.severity === 'medium').length;

    if (highSeverityCount >= 2) {
      overallRisk = 'critical';
    } else if (highSeverityCount >= 1) {
      overallRisk = 'high';
    } else if (mediumSeverityCount >= 2) {
      overallRisk = 'medium';
    }

    return { patterns, overallRisk };
  }

  /**
   * Enhanced CSRF token generation and validation
   */
  generateCSRFToken(): string {
    const timestamp = Date.now();
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    const randomString = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
    
    return btoa(`${timestamp}_${randomString}`);
  }

  validateCSRFToken(token: string, maxAgeMinutes: number = 30): boolean {
    try {
      const decoded = atob(token);
      const [timestampStr] = decoded.split('_');
      const timestamp = parseInt(timestampStr, 10);
      const now = Date.now();
      const maxAge = maxAgeMinutes * 60 * 1000;

      return (now - timestamp) <= maxAge;
    } catch {
      return false;
    }
  }

  /**
   * Security headers for enhanced protection
   */
  getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vlibras.gov.br https://www.vlibras.gov.br; style-src 'self' 'unsafe-inline' https://vlibras.gov.br https://www.vlibras.gov.br; img-src 'self' data: blob: https: https://vlibras.gov.br https://www.vlibras.gov.br; font-src 'self' https: https://vlibras.gov.br https://www.vlibras.gov.br; connect-src 'self' https://*.supabase.co https://vlibras.gov.br https://www.vlibras.gov.br https://api.sympla.com.br; frame-src 'self' https://vlibras.gov.br https://www.vlibras.gov.br; worker-src 'self' blob: https://vlibras.gov.br https://www.vlibras.gov.br; media-src 'self' blob: https://vlibras.gov.br https://www.vlibras.gov.br;",
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    };
  }

  /**
   * Log security events to database
   */
  private async logSecurityEvent(action: string, metadata: Record<string, any>): Promise<void> {
    try {
      await supabase.rpc('log_enhanced_security_event', {
        event_action: action,
        event_success: true,
        event_metadata: metadata
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    const expiredKeys = [];

    for (const [key, entry] of this.rateLimitStore.entries()) {
      // Remove entries older than 2 hours
      if (now - entry.windowStart > 2 * 60 * 60 * 1000) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.rateLimitStore.delete(key));

    // Clean up old alerts (keep only last 100)
    if (this.securityAlerts.length > 100) {
      this.securityAlerts.splice(0, this.securityAlerts.length - 100);
    }
  }

  /**
   * Get current security status
   */
  getSecurityStatus(): {
    activeBlocks: number;
    totalAttempts: number;
    recentAlerts: SecurityAlert[];
    systemHealth: 'healthy' | 'warning' | 'critical';
  } {
    const now = Date.now();
    const activeBlocks = Array.from(this.rateLimitStore.values())
      .filter(entry => entry.blocked && entry.blockExpiry && entry.blockExpiry > now).length;

    const totalAttempts = Array.from(this.rateLimitStore.values())
      .reduce((sum, entry) => sum + entry.count, 0);

    const recentAlerts = this.securityAlerts.slice(-10);

    let systemHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (activeBlocks > 10) {
      systemHealth = 'critical';
    } else if (activeBlocks > 5 || recentAlerts.filter(a => a.severity === 'high').length > 0) {
      systemHealth = 'warning';
    }

    return {
      activeBlocks,
      totalAttempts,
      recentAlerts,
      systemHealth
    };
  }
}

export const serverSideSecurityService = ServerSideSecurityService.getInstance();

// Cleanup interval (run every 30 minutes)
if (typeof window !== 'undefined') {
  setInterval(() => {
    serverSideSecurityService.cleanup();
  }, 30 * 60 * 1000);
}
