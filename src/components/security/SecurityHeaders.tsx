import { useEffect } from 'react';

/**
 * Componente para configurar cabeçalhos de segurança via meta tags
 * Deve ser incluído no head da aplicação
 */
export const SecurityHeaders = () => {
  useEffect(() => {
    // Configurar CSP padrão com segurança aprimorada
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' https://cdn.gpteng.co", // Removido 'unsafe-inline' e 'unsafe-eval' por segurança
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // Mantido 'unsafe-inline' apenas para styles
      "img-src 'self' data: https://flowtrip.com.br https://*.supabase.co https://images.unsplash.com https://cdn.pixabay.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com https://api.sympla.com.br",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'", // Previne clickjacking
      "object-src 'none'" // Bloqueia plugins perigosos
    ].join('; ');

    // Configurar meta tags de segurança
    const securityMetas = [
      { httpEquiv: 'Content-Security-Policy', content: cspDirectives },
      { name: 'referrer', content: 'strict-origin-when-cross-origin' },
      { httpEquiv: 'X-Content-Type-Options', content: 'nosniff' },
      { httpEquiv: 'X-XSS-Protection', content: '1; mode=block' },
      { httpEquiv: 'Strict-Transport-Security', content: 'max-age=31536000; includeSubDomains; preload' },
      { httpEquiv: 'Permissions-Policy', content: 'camera=(), microphone=(), geolocation=()' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ];

    // Adicionar meta tags
    securityMetas.forEach(({ name, httpEquiv, content }) => {
      const meta = document.createElement('meta');
      if (name) meta.name = name;
      if (httpEquiv) meta.httpEquiv = httpEquiv;
      meta.content = content;
      document.head.appendChild(meta);
    });

    // Cleanup function
    return () => {
      const metas = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"], meta[name="referrer"], meta[http-equiv="X-Content-Type-Options"], meta[http-equiv="X-XSS-Protection"], meta[http-equiv="Strict-Transport-Security"]');
      metas.forEach(meta => meta.remove());
    };
  }, []);

  return null; // Este componente não renderiza nada
};