import { useEffect } from 'react';
import { config } from '@/config/environment';

/**
 * Componente para configurar cabeçalhos de segurança via meta tags
 * Deve ser incluído no head da aplicação
 */
export const SecurityHeaders = () => {
  useEffect(() => {
    // Configure Content Security Policy
    if (config.security.csp.enabled) {
      const cspContent = config.security.csp.directives.join('; ');
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = cspContent;
      document.head.appendChild(meta);
    }

    // Configure outros cabeçalhos de segurança via meta tags
    const securityMetas = [
      { name: 'referrer', content: 'strict-origin-when-cross-origin' },
      { httpEquiv: 'X-Content-Type-Options', content: 'nosniff' },
      { httpEquiv: 'X-Frame-Options', content: 'DENY' },
      { httpEquiv: 'X-XSS-Protection', content: '1; mode=block' },
      { httpEquiv: 'Strict-Transport-Security', content: 'max-age=31536000; includeSubDomains' }
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
      // Remove meta tags on unmount if needed
      const metas = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"], meta[name="referrer"], meta[http-equiv="X-Content-Type-Options"], meta[http-equiv="X-Frame-Options"], meta[http-equiv="X-XSS-Protection"], meta[http-equiv="Strict-Transport-Security"]');
      metas.forEach(meta => meta.remove());
    };
  }, []);

  return null; // Este componente não renderiza nada
};