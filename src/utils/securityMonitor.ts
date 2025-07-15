/**
 * Enhanced Security Monitoring Utility
 */
import { securityLogger } from './secureLogger';
import { SECURITY_CONFIG } from '@/config/security';

interface SecurityEvent {
  type: 'suspicious_activity' | 'invalid_access' | 'rate_limit_exceeded' | 'session_anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  details?: string;
  metadata?: Record<string, any>;
}

class SecurityMonitor {
  private static instance: SecurityMonitor;
  private loginAttempts = new Map<string, { count: number; timestamp: number }>();

  public static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor();
    }
    return SecurityMonitor.instance;
  }

  /**
   * Monitor login attempts for rate limiting
   */
  public monitorLoginAttempt(email: string, success: boolean): boolean {
    const now = Date.now();
    const key = email.toLowerCase();
    const windowMs = SECURITY_CONFIG.RATE_LIMIT.WINDOW_MINUTES * 60 * 1000;
    
    if (!this.loginAttempts.has(key)) {
      this.loginAttempts.set(key, { count: 0, timestamp: now });
    }

    const attempt = this.loginAttempts.get(key)!;
    
    // Reset window if expired
    if (now - attempt.timestamp > windowMs) {
      attempt.count = 0;
      attempt.timestamp = now;
    }

    if (!success) {
      attempt.count++;
      
      if (attempt.count >= SECURITY_CONFIG.RATE_LIMIT.LOGIN_ATTEMPTS) {
        this.reportSecurityEvent({
          type: 'rate_limit_exceeded',
          severity: 'medium',
          details: `Login rate limit exceeded for ${email}`,
          metadata: { email, attempts: attempt.count }
        });
        return false; // Block further attempts
      }
    } else {
      // Reset on successful login
      attempt.count = 0;
    }

    return true;
  }

  /**
   * Report security events
   */
  public reportSecurityEvent(event: SecurityEvent): void {
    securityLogger.log(
      `SECURITY_EVENT_${event.type.toUpperCase()}`,
      event.severity === 'critical' || event.severity === 'high',
      JSON.stringify({
        type: event.type,
        severity: event.severity,
        userId: event.userId,
        details: event.details,
        metadata: event.metadata,
        timestamp: new Date().toISOString()
      })
    );

    // In production, you might want to send critical events to external monitoring
    if (event.severity === 'critical') {
      this.handleCriticalEvent(event);
    }
  }

  /**
   * Handle critical security events
   */
  private handleCriticalEvent(event: SecurityEvent): void {
    // In production, implement:
    // - Send alerts to security team
    // - Log to external SIEM
    // - Implement automated responses (block IP, disable account, etc.)
    if (import.meta.env.MODE === 'development') {
      console.warn('CRITICAL SECURITY EVENT:', event);
    }
  }

  /**
   * Validate session integrity
   */
  public validateSessionIntegrity(userId: string, sessionData: any): boolean {
    try {
      // Basic session validation
      if (!userId || !sessionData) {
        this.reportSecurityEvent({
          type: 'session_anomaly',
          severity: 'medium',
          userId,
          details: 'Invalid session data detected'
        });
        return false;
      }

      // Add more sophisticated checks as needed
      return true;
    } catch (error) {
      this.reportSecurityEvent({
        type: 'session_anomaly',
        severity: 'high',
        userId,
        details: 'Session validation error'
      });
      return false;
    }
  }

  /**
   * Clean up old data
   */
  public cleanup(): void {
    const now = Date.now();
    const windowMs = SECURITY_CONFIG.RATE_LIMIT.WINDOW_MINUTES * 60 * 1000;

    for (const [key, attempt] of this.loginAttempts.entries()) {
      if (now - attempt.timestamp > windowMs) {
        this.loginAttempts.delete(key);
      }
    }
  }
}

export const securityMonitor = SecurityMonitor.getInstance();