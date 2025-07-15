/**
 * Security configuration constants
 */
export const SECURITY_CONFIG = {
  // Minimum password requirements
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SYMBOLS: true,
  },
  
  // Rate limiting
  RATE_LIMIT: {
    LOGIN_ATTEMPTS: 5,
    WINDOW_MINUTES: 15,
    PASSWORD_RESET_ATTEMPTS: 3,
    PASSWORD_RESET_WINDOW_MINUTES: 60,
  },
  
  // Session configuration
  SESSION: {
    TIMEOUT_MINUTES: 480, // 8 hours
    EXTEND_ON_ACTIVITY: true,
  },
  
  // Content Security Policy
  CSP: {
    ENABLED: true,
    STRICT_MODE: true,
  },
  
  // Logging configuration
  LOGGING: {
    SECURITY_EVENTS: true,
    PERFORMANCE_EVENTS: false,
    DEBUG_IN_PRODUCTION: false,
  },
} as const;