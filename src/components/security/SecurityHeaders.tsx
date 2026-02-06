import { useEffect } from 'react';

/**
 * Componente para configurar cabeçalhos de segurança via meta tags
 * Deve ser incluído no head da aplicação
 * 
 * NOTA: CSP completo deve ser configurado no servidor (Vercel/Netlify) em produção.
 * Esta configuração permite VLibras e recursos externos necessários.
 */
export const SecurityHeaders = () => {
  useEffect(() => {
    // CSP permissivo para desenvolvimento e VLibras
    // Em produção, configurar CSP mais restritivo via headers HTTP no servidor

    // Remover meta tags CSP existentes ANTES de criar novas (evita múltiplas meta tags)
    const existingCSP = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]');
    existingCSP.forEach(meta => meta.remove());
    
    // Verificar se está em ambiente de desenvolvimento
    const isDev = import.meta.env.DEV || 
      (typeof window !== 'undefined' && (
        window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1'
      ));
    
    const connectSrc = isDev 
      ? "'self' https: wss: blob: http://127.0.0.1:* http://localhost:*"
      : "'self' https: wss: blob:";
    const cspDirectives = [
      "default-src 'self' https: blob: data:",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: blob:",
      "script-src-elem 'self' 'unsafe-inline' https: blob:",
      "style-src 'self' 'unsafe-inline' https:",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https:",
      `connect-src ${connectSrc}`,
      "frame-src 'self' https:",
      "worker-src 'self' blob: https:",
      "media-src 'self' blob: https:",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'"
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

    // Adicionar meta tags (inserir no início do head para garantir prioridade)
    securityMetas.forEach(({ name, httpEquiv, content }) => {
      // Verificar se já existe antes de criar
      const existing = name 
        ? document.querySelector(`meta[name="${name}"]`)
        : document.querySelector(`meta[http-equiv="${httpEquiv}"]`);
      
      if (existing) {
        existing.setAttribute('content', content);
      } else {
        const meta = document.createElement('meta');
        if (name) meta.name = name;
        if (httpEquiv) meta.httpEquiv = httpEquiv;
        meta.content = content;
        // Inserir no início do head para garantir que seja aplicado primeiro
        document.head.insertBefore(meta, document.head.firstChild);
        
      }
    });

    // Cleanup function
    return () => {
      const metas = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"], meta[name="referrer"], meta[http-equiv="X-Content-Type-Options"], meta[http-equiv="X-XSS-Protection"], meta[http-equiv="Strict-Transport-Security"]');
      metas.forEach(meta => meta.remove());
    };
  }, []);

  return null; // Este componente não renderiza nada
};
