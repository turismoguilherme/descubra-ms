/**
 * Utilitário para detectar e redirecionar corretamente após login
 * Garante que usuários do Descubra MS permaneçam no Descubra MS
 * e usuários do ViaJAR permaneçam no ViaJAR
 */

/**
 * Detecta se o usuário está no contexto do Descubra MS
 * Verifica primeiro o domínio (descubrams.com) para evitar confusão
 */
export function isDescubraMSContext(): boolean {
  const hostname = window.location.hostname.toLowerCase();
  const pathname = window.location.pathname.toLowerCase();
  const origin = window.location.origin;

  // Prioridade 1: Detectar explicitamente viajartur.com para evitar falsos positivos
  if (hostname === 'viajartur.com' || hostname.includes('viajartur') || hostname === 'viajar.com') {
    
    return false;
  }
  
  // Prioridade 2: Se está no domínio descubrams.com, sempre é Descubra MS
  if (hostname === 'descubrams.com' || hostname.includes('descubrams')) {
    
    return true;
  }
  
  // Prioridade 3: Se o path indica Descubra MS (e não está em viajartur.com)
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
 * Detecta se o usuário está no contexto do ViaJAR
 */
export function isViaJARContext(): boolean {
  const hostname = window.location.hostname.toLowerCase();
  const pathname = window.location.pathname.toLowerCase();
  
  // Se está no domínio viajartur.com, sempre é ViaJAR
  if (hostname === 'viajartur.com' || hostname.includes('viajartur') || hostname === 'viajar.com') {
    return true;
  }
  
  // Se o path indica ViaJAR (e não está em descubrams.com)
  if (
    pathname.startsWith('/viajar') ||
    pathname.startsWith('/viajartur')
  ) {
    // Garantir que não está em descubrams.com
    if (hostname !== 'descubrams.com' && !hostname.includes('descubrams')) {
      return true;
    }
  }
  
  return false;
}

/**
 * Verifica se está em ambiente localhost/desenvolvimento
 */
function isLocalhost(): boolean {
  const hostname = window.location.hostname.toLowerCase();
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.0.') || hostname.includes('local');
}

/**
 * Obtém o path de redirecionamento correto após login
 * Prioriza detecção por domínio para evitar confusão
 */
export function getLoginRedirectPath(): string {
  const hostname = window.location.hostname.toLowerCase();
  const pathname = window.location.pathname;
  const origin = window.location.origin;
  const isDescubraMS = isDescubraMSContext();
  const isViaJAR = isViaJARContext();

  // Prioridade 0: LOCALHOST - sempre manter no localhost, detectar contexto pelo pathname
  if (isLocalhost()) {
    console.log('🔄 [getLoginRedirectPath] 🏠 Detectado LOCALHOST - mantendo no localhost');
    // Se path indica Descubra MS, redirecionar para /descubrams no localhost
    if (pathname.startsWith('/descubrams') || pathname.startsWith('/ms') || pathname.startsWith('/partner')) {
      console.log('🔄 [getLoginRedirectPath]   ↳ Path indica Descubra MS → /descubrams');
      return '/descubrams';
    }
    // Se path indica ViaJAR, manter ou redirecionar para /
    if (pathname.startsWith('/viajar') || pathname.startsWith('/viajartur')) {
      const currentPath = window.location.pathname;
      const redirectPath = (currentPath.includes('/login') || currentPath.includes('/auth')) ? '/' : (currentPath || '/');
      console.log('🔄 [getLoginRedirectPath]   ↳ Path indica ViaJAR →', redirectPath);
      return redirectPath;
    }
    // Fallback: usar Descubra MS como padrão no localhost (projeto principal)
    const currentPath = window.location.pathname;
    const redirectPath = (currentPath.includes('/login') || currentPath.includes('/auth')) ? '/descubrams' : (currentPath || '/descubrams');
    console.log('🔄 [getLoginRedirectPath]   ↳ Fallback padrão → /descubrams');
    return redirectPath;
  }
  
  // Prioridade 1: Descubra MS - descobrams.com → /descubrams
  if (hostname === 'descubrams.com' || hostname.includes('descubrams')) {
    
    return '/descubrams';
  }
  
  // Prioridade 2: ViaJAR - viajartur.com → / ou /viajar/dashboard
  if (hostname === 'viajartur.com' || hostname.includes('viajartur') || hostname === 'viajar.com') {
    const currentPath = window.location.pathname;
    const redirectPath = (currentPath.includes('/login') || currentPath.includes('/auth')) ? '/' : (currentPath || '/');
    
    return redirectPath;
  }
  
  // Prioridade 3: Detectar por contexto (pathname)
  if (isDescubraMS) {
    
    return '/descubrams';
  }
  
  if (isViaJAR) {
    const currentPath = window.location.pathname;
    const redirectPath = (currentPath.includes('/login') || currentPath.includes('/auth')) ? '/' : (currentPath || '/');
    
    return redirectPath;
  }
  
  // Fallback: Para outros contextos, manter path atual ou home
  const currentPath = window.location.pathname;
  const redirectPath = (currentPath.includes('/login') || currentPath.includes('/auth')) ? '/' : (currentPath || '/');
  
  return redirectPath;
}

/**
 * Obtém o path de redirecionamento para OAuth callback
 * Prioriza detecção por domínio para evitar confusão
 */
export function getOAuthCallbackRedirectPath(): string {
  const hostname = window.location.hostname.toLowerCase();
  const isDescubraMS = isDescubraMSContext();
  const isViaJAR = isViaJARContext();
  const currentPath = window.location.pathname;
  
  // Prioridade 0: LOCALHOST - sempre manter no localhost, detectar contexto pelo pathname
  if (isLocalhost()) {
    console.log('🔄 [getOAuthCallbackRedirectPath] 🏠 Detectado LOCALHOST - mantendo no localhost');
    // Se callback foi para /ms, redirecionar para /descubrams no localhost
    if (currentPath === '/ms' || currentPath.startsWith('/ms/')) {
      console.log('🔄 [getOAuthCallbackRedirectPath]   ↳ Callback /ms → /descubrams');
      return '/descubrams';
    }
    // Se path indica Descubra MS, redirecionar para /descubrams no localhost
    if (currentPath.startsWith('/descubrams') || currentPath.startsWith('/partner')) {
      console.log('🔄 [getOAuthCallbackRedirectPath]   ↳ Path indica Descubra MS → /descubrams');
      return '/descubrams';
    }
    // Se path indica ViaJAR, manter path atual ou /
    if (currentPath.startsWith('/viajar') || currentPath.startsWith('/viajartur')) {
      const redirectPath = currentPath || '/';
      console.log('🔄 [getOAuthCallbackRedirectPath]   ↳ Path indica ViaJAR →', redirectPath);
      return redirectPath;
    }
    // Fallback: usar Descubra MS como padrão no localhost
    console.log('🔄 [getOAuthCallbackRedirectPath]   ↳ Fallback padrão → /descubrams');
    return '/descubrams';
  }
  
  // Prioridade 1: Descubra MS - descobrams.com → /descubrams
  if (hostname === 'descubrams.com' || hostname.includes('descubrams')) {
    return '/descubrams';
  }
  
  // Prioridade 2: ViaJAR - viajartur.com → manter path ou /
  if (hostname === 'viajartur.com' || hostname.includes('viajartur') || hostname === 'viajar.com') {
    // Não redirecionar para /descubrams se estiver em viajartur.com
    if (currentPath === '/ms' || currentPath.startsWith('/ms/')) {
      return '/';
    }
    return currentPath || '/';
  }
  
  // Prioridade 3: Detectar por contexto (pathname)
  if (isDescubraMS) {
    return '/descubrams';
  }
  
  if (isViaJAR) {
    // Não redirecionar para /descubrams se estiver em ViaJAR
    if (currentPath === '/ms' || currentPath.startsWith('/ms/')) {
      return '/';
    }
    return currentPath || '/';
  }
  
  // Fallback: Se o path atual indica Descubra MS mas não está no domínio correto
  if (
    currentPath.startsWith('/descubrams') ||
    currentPath.startsWith('/descubramatogrossodosul')
  ) {
    return '/descubrams';
  }
  
  // Evitar redirecionar para /descubrams se não for contexto Descubra MS
  if (currentPath === '/ms' || currentPath.startsWith('/ms/')) {
    // Se não é Descubra MS, redirecionar para home
    if (!isDescubraMS) {
      return '/';
    }
    return '/descubrams';
  }
  
  return currentPath || '/';
}

