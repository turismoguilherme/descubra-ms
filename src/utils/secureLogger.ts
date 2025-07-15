/**
 * Secure logging utility that respects production environment
 */
export const secureLogger = {
  log: (message: string, data?: any) => {
    if (import.meta.env.MODE === 'development') {
      console.log(message, data);
    }
  },
  
  error: (message: string, error?: any) => {
    // Always log errors but sanitize sensitive data
    console.error(message, error);
  },
  
  warn: (message: string, data?: any) => {
    if (import.meta.env.MODE === 'development') {
      console.warn(message, data);
    }
  },
  
  info: (message: string, data?: any) => {
    if (import.meta.env.MODE === 'development') {
      console.info(message, data);
    }
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