// Environment configuration for secure token management
export const config = {
  mapbox: {
    // Get token from environment or localStorage as fallback
    getToken: (): string => {
      // In production, this would come from environment variables
      // For now, we use localStorage but with proper validation
      const token = localStorage.getItem('mapbox_token') || '';
      
      // Validate token format (Mapbox tokens start with 'pk.')
      if (token && !token.startsWith('pk.')) {
        console.warn('Invalid Mapbox token format detected');
        return '';
      }
      
      return token;
    },
    
    setToken: (token: string): void => {
      // Validate token before storing
      if (!token.startsWith('pk.')) {
        throw new Error('Invalid Mapbox token format. Token must start with "pk."');
      }
      
      localStorage.setItem('mapbox_token', token);
    },
    
    isValidToken: (token: string): boolean => {
      return token.length > 0 && token.startsWith('pk.') && token.length > 50;
    }
  },
  
  security: {
    // Enhanced rate limiting configuration
    rateLimits: {
      login: { maxAttempts: 5, windowMinutes: 15, blockDurationMinutes: 45 },
      registration: { maxAttempts: 3, windowMinutes: 60, blockDurationMinutes: 60 },
      passwordReset: { maxAttempts: 3, windowMinutes: 60, blockDurationMinutes: 120 },
      aiQueries: { maxAttempts: 50, windowMinutes: 60, blockDurationMinutes: 30 },
      adminOperations: { maxAttempts: 3, windowMinutes: 30, blockDurationMinutes: 120 }
    },
    
    // Session configuration
    session: {
      timeoutMinutes: 240, // 4 hours
      refreshThresholdMinutes: 30, // Refresh token when 30min remaining
      maxConcurrentSessions: 3 // Limit concurrent sessions per user
    },
    
    // Security validation
    validation: {
      passwordMinLength: 8,
      passwordRequireSpecialChars: true,
      passwordRequireNumbers: true,
      passwordRequireUppercase: true,
      maxLoginAttempts: 5,
      sessionIntegrityCheck: true
    },
    
    // Content Security Policy
    csp: {
      enabled: true,
      reportOnly: false,
      directives: [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.gpteng.co",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' data: https:",
        "font-src 'self' data: https://fonts.gstatic.com",
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co"
      ]
    }
  }
};