/**
 * Utilitário para detectar e redirecionar corretamente após login
 * Garante que usuários do Descubra MS permaneçam no Descubra MS
 */

/**
 * Detecta se o usuário está no contexto do Descubra MS
 */
export function isDescubraMSContext(): boolean {
  const hostname = window.location.hostname.toLowerCase();
  const pathname = window.location.pathname.toLowerCase();
  
  // Se está no domínio descubrams.com, sempre é Descubra MS
  if (hostname === 'descubrams.com' || hostname.includes('descubrams')) {
    return true;
  }
  
  // Se o path indica Descubra MS
  if (
    pathname.startsWith('/descubrams') ||
    pathname.startsWith('/descubramatogrossodosul') ||
    pathname.startsWith('/ms') ||
    pathname.startsWith('/partner')
  ) {
    return true;
  }
  
  return false;
}

/**
 * Obtém o path de redirecionamento correto após login
 * Sempre retorna '/descubrams' se estiver no contexto Descubra MS
 */
export function getLoginRedirectPath(): string {
  const isDescubraMS = isDescubraMSContext();
  
  if (isDescubraMS) {
    return '/descubrams';
  }
  
  // Para outros contextos (ViaJAR, etc), manter path atual ou redirecionar para home
  const currentPath = window.location.pathname;
  
  // Se está em uma rota de auth, redirecionar para home
  if (currentPath.includes('/login') || currentPath.includes('/auth')) {
    return '/';
  }
  
  return currentPath || '/';
}

/**
 * Obtém o path de redirecionamento para OAuth callback
 * Garante que descubrams.com sempre use /descubrams
 */
export function getOAuthCallbackRedirectPath(): string {
  const hostname = window.location.hostname.toLowerCase();
  const currentPath = window.location.pathname;
  
  // Se está no domínio descubrams.com, sempre redirecionar para /descubrams
  if (hostname === 'descubrams.com' || hostname.includes('descubrams')) {
    return '/descubrams';
  }
  
  // Se o path atual indica Descubra MS, redirecionar para /descubrams
  if (
    currentPath.startsWith('/ms') ||
    currentPath.startsWith('/descubrams') ||
    currentPath.startsWith('/descubramatogrossodosul')
  ) {
    return '/descubrams';
  }
  
  // Para outros contextos, manter path atual (mas não deixar em /ms)
  if (currentPath === '/ms' || currentPath.startsWith('/ms/')) {
    return '/descubrams';
  }
  
  return currentPath || '/';
}

