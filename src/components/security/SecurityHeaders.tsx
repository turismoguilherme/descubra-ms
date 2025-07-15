import { useEffect } from 'react';
import { config } from '@/config/environment';

/**
 * Enhanced Security Headers Component
 * Implementa cabeçalhos de segurança aprimorados
 */
export const SecurityHeaders = () => {
  useEffect(() => {
    // Enhanced Content Security Policy
    if (config.security.csp.enabled) {
      const strictCSP = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.mapbox.com https://cdn.jsdelivr.net",
        "style-src 'self' 'unsafe-inline' https://api.mapbox.com https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://api.mapbox.com https://hvtrpkbjgbuypkskqcqm.supabase.co wss://hvtrpkbjgbuypkskqcqm.supabase.co",
        "worker-src 'self' blob:",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "upgrade-insecure-requests"
      ];

      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = strictCSP.join('; ');
      document.head.appendChild(meta);
    }

    // Enhanced security headers with stricter policies
    const securityMetas = [
      { name: 'referrer', content: 'strict-origin-when-cross-origin' },
      { httpEquiv: 'X-Content-Type-Options', content: 'nosniff' },
      { httpEquiv: 'X-Frame-Options', content: 'DENY' },
      { httpEquiv: 'X-XSS-Protection', content: '1; mode=block' },
      { httpEquiv: 'Strict-Transport-Security', content: 'max-age=31536000; includeSubDomains; preload' },
      { httpEquiv: 'Permissions-Policy', content: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
      { httpEquiv: 'Cross-Origin-Embedder-Policy', content: 'require-corp' },
      { httpEquiv: 'Cross-Origin-Opener-Policy', content: 'same-origin' },
      { httpEquiv: 'Cross-Origin-Resource-Policy', content: 'same-origin' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ];

    securityMetas.forEach(({ name, httpEquiv, content }) => {
      const meta = document.createElement('meta');
      if (name) meta.name = name;
      if (httpEquiv) meta.httpEquiv = httpEquiv;
      meta.content = content;
      document.head.appendChild(meta);
    });

    // Cleanup function
    return () => {
      const metas = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"], meta[name="referrer"], meta[http-equiv="X-Content-Type-Options"], meta[http-equiv="X-Frame-Options"], meta[http-equiv="X-XSS-Protection"], meta[http-equiv="Strict-Transport-Security"], meta[http-equiv="Cross-Origin-Embedder-Policy"], meta[http-equiv="Cross-Origin-Opener-Policy"], meta[http-equiv="Cross-Origin-Resource-Policy"], meta[http-equiv="Permissions-Policy"]');
      metas.forEach(meta => meta.remove());
    };
  }, []);

  return null;
};