/**
 * CORS configuration with security best practices
 * Allows only specific origins instead of wildcard
 */

// Get allowed origins from environment or use defaults
const getAllowedOrigins = (): string[] => {
  const envOrigins = Deno.env.get('ALLOWED_ORIGINS');
  if (envOrigins) {
    return envOrigins.split(',').map(origin => origin.trim());
  }
  
  // Default allowed origins - should be configured via environment variables
  return [
    // Produção
    'https://www.viajartur.com',
    'https://viajartur.com',
    'https://descubra-ms.vercel.app',
    'https://*.vercel.app',
    // Desenvolvimento - aceita portas dinâmicas
    'http://localhost',
    'http://127.0.0.1'
  ];
};

/**
 * Check if origin matches localhost with any port
 */
const isLocalhostOrigin = (origin: string): boolean => {
  return /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
};

/**
 * Check if origin is allowed
 */
const isOriginAllowed = (origin: string | null): boolean => {
  if (!origin) return false;
  
  // Allow any localhost origin (any port)
  if (isLocalhostOrigin(origin)) {
    return true;
  }
  
  const allowedOrigins = getAllowedOrigins();
  
  return allowedOrigins.some(allowed => {
    // Support wildcard subdomains
    if (allowed.startsWith('https://*.') || allowed.startsWith('http://*.')) {
      const domain = allowed.replace(/^https?:\/\/\*\./, '');
      return origin.endsWith(domain);
    }
    
    // Exact match
    return origin === allowed;
  });
};

/**
 * Get CORS headers based on request origin
 */
export const getCorsHeaders = (origin: string | null): Record<string, string> => {
  const allowedOrigin = isOriginAllowed(origin) ? origin : getAllowedOrigins()[0];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin || '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with, accept',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'true',
    // Security headers
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  };
};

/**
 * Legacy CORS headers for backward compatibility (less secure)
 * Use getCorsHeaders() instead when possible
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with, accept',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'true',
  // Security headers
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};
