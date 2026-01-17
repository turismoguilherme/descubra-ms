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
    // #region agent log
    const isDev = import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const debugLogEndpoint = isDev ? 'http://127.0.0.1:7242' : '';
    fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SecurityHeaders.tsx:16',message:'SecurityHeaders useEffect iniciado',data:{isDev,hostname:window.location.hostname,env:import.meta.env.MODE},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    // Remover meta tags CSP existentes ANTES de criar novas (evita múltiplas meta tags)
    const existingCSP = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]');
    fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SecurityHeaders.tsx:21',message:'CSP meta tags encontradas antes da remoção',data:{count:existingCSP.length},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'B'})}).catch(()=>{});
    existingCSP.forEach(meta => meta.remove());
    
    // Verificar se há headers HTTP CSP aplicados
    const responseHeaders = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SecurityHeaders.tsx:25',message:'Verificando headers HTTP CSP',data:{isDev,hasResponseHeaders:!!responseHeaders},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'C'})}).catch(()=>{});
    
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

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SecurityHeaders.tsx:42',message:'CSP directives criadas',data:{connectSrc,cspLength:cspDirectives.length},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'D'})}).catch(()=>{});
    // #endregion

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
        // #region agent log
        if (httpEquiv === 'Content-Security-Policy') {
          fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SecurityHeaders.tsx:68',message:'Meta tag CSP criada',data:{content:content.substring(0,100)},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'E'})}).catch(()=>{});
        }
        // #endregion
      }
    });
    
    // #region agent log
    // Tentar fazer uma requisição de teste para verificar se CSP está bloqueando
    setTimeout(() => {
      fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SecurityHeaders.tsx:75',message:'Teste de conexão após CSP configurado',data:{success:true},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'F'})}).catch((err) => {
        fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SecurityHeaders.tsx:75',message:'Erro ao conectar após CSP',data:{error:err.message},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'F'})}).catch(()=>{});
      });
    }, 100);
    // #endregion

    // Cleanup function
    return () => {
      const metas = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"], meta[name="referrer"], meta[http-equiv="X-Content-Type-Options"], meta[http-equiv="X-XSS-Protection"], meta[http-equiv="Strict-Transport-Security"]');
      metas.forEach(meta => meta.remove());
    };
  }, []);

  return null; // Este componente não renderiza nada
};
