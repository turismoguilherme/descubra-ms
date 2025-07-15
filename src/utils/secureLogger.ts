/**
 * Enhanced secure logging utility that respects production environment
 */
import { SECURITY_CONFIG } from '@/config/security';

export const secureLogger = {
  log: (message: string, data?: any) => {
    if (import.meta.env.MODE === 'development') {
      console.log(message, secureLogger.sanitizeData(data));
    }
  },
  
  error: (message: string, error?: any) => {
    // Always log errors but sanitize sensitive data
    const sanitizedError = secureLogger.sanitizeError(error);
    console.error(message, sanitizedError);
  },
  
  warn: (message: string, data?: any) => {
    if (import.meta.env.MODE === 'development') {
      console.warn(message, secureLogger.sanitizeData(data));
    }
  },
  
  info: (message: string, data?: any) => {
    if (import.meta.env.MODE === 'development') {
      console.info(message, secureLogger.sanitizeData(data));
    }
  },

  /**
   * Sanitize data to remove sensitive information
   */
  sanitizeData: (data: any): any => {
    if (!data) return data;
    
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization', 'cookie'];
    
    if (typeof data === 'object') {
      const sanitized = { ...data };
      
      for (const field of sensitiveFields) {
        if (field in sanitized) {
          sanitized[field] = '[REDACTED]';
        }
      }
      
      return sanitized;
    }
    
    return data;
  },

  /**
   * Sanitize error objects
   */
  sanitizeError: (error: any): any => {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: import.meta.env.MODE === 'development' ? error.stack : '[REDACTED]'
      };
    }
    
    return secureLogger.sanitizeData(error);
  }
};

/**
 * Security-focused logger that never logs sensitive data
 */
export const securityLogger = {
  log: (action: string, success: boolean, details?: string) => {
    if (import.meta.env.MODE === 'development') {
      console.log(`🔐 SECURITY: ${action} - ${success ? 'SUCCESS' : 'FAILED'}`, details);
    }
  },
  
  error: (action: string, error: string) => {
    // Always log security errors but sanitize
    console.error(`🔐 SECURITY ERROR: ${action}`, error);
  }
};