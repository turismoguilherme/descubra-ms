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
    // Rate limiting configuration
    rateLimits: {
      login: { maxAttempts: 5, windowMinutes: 15 },
      registration: { maxAttempts: 3, windowMinutes: 60 },
      passwordReset: { maxAttempts: 3, windowMinutes: 60 },
      aiQueries: { maxAttempts: 100, windowMinutes: 60 }
    },
    
    // Session configuration
    session: {
      timeoutMinutes: 240, // 4 hours
      refreshThresholdMinutes: 30 // Refresh token when 30min remaining
    }
  }
};