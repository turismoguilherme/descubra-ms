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
    MAX_LOG_RETENTION_DAYS: 30,
  },

  // Additional security configurations
  AUTHENTICATION: {
    SESSION_TIMEOUT_WARNING_MINUTES: 5,
    REQUIRE_EMAIL_VERIFICATION: true,
    ENABLE_MFA: false, // Can be enabled in future
    LOCKOUT_DURATION_MINUTES: 30,
  },

  // Content filtering
  CONTENT_SECURITY: {
    ENABLE_XSS_PROTECTION: true,
    ENABLE_CSRF_PROTECTION: true,
    SANITIZE_HTML_INPUT: true,
  },
} as const;