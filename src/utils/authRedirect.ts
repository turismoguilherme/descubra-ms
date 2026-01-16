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
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authRedirect.ts:isDescubraMSContext:ENTRY',message:'Detectando contexto Descubra MS',data:{hostname,pathname,origin,href:window.location.href},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,B'})}).catch(()=>{});
  // #endregion
  
  // Prioridade 1: Detectar explicitamente viajartur.com para evitar falsos positivos
  if (hostname === 'viajartur.com' || hostname.includes('viajartur') || hostname === 'viajar.com') {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authRedirect.ts:isDescubraMSContext:VIAJAR_DETECTED',message:'ViaJAR detectado, retornando false',data:{hostname,pathname},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return false;
  }
  
  // Prioridade 2: Se está no domínio descubrams.com, sempre é Descubra MS
  if (hostname === 'descubrams.com' || hostname.includes('descubrams')) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authRedirect.ts:isDescubraMSContext:DESCUBRAMS_DETECTED',message:'Descubra MS detectado por hostname, retornando true',data:{hostname,pathname},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return true;
  }
  
  // Prioridade 3: Se o path indica Descubra MS (e não está em viajartur.com)
  if (
    pathname.startsWith('/descubrams') ||
    pathname.startsWith('/descubramatogrossodosul') ||
    pathname.startsWith('/ms') ||
    pathname.startsWith('/partner')
  ) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authRedirect.ts:isDescubraMSContext:PATHNAME_DETECTED',message:'Descubra MS detectado por pathname, retornando true',data:{hostname,pathname},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    return true;
  }
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authRedirect.ts:isDescubraMSContext:RETURN_FALSE',message:'Nenhum indicador Descubra MS encontrado, retornando false',data:{hostname,pathname},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,B'})}).catch(()=>{});
  // #endregion
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
 * Obtém o path de redirecionamento correto após login
 * Prioriza detecção por domínio para evitar confusão
 */
export function getLoginRedirectPath(): string {
  const hostname = window.location.hostname.toLowerCase();
  const pathname = window.location.pathname;
  const origin = window.location.origin;
  const isDescubraMS = isDescubraMSContext();
  const isViaJAR = isViaJARContext();
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authRedirect.ts:getLoginRedirectPath:ENTRY',message:'Calculando path de redirecionamento',data:{hostname,pathname,origin,isDescubraMS,isViaJAR},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,B,C'})}).catch(()=>{});
  // #endregion
  
  // Prioridade 1: Descubra MS - descobrams.com → /descubrams
  if (hostname === 'descubrams.com' || hostname.includes('descubrams')) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authRedirect.ts:getLoginRedirectPath:RETURN_DESCUBRAMS',message:'Retornando /descubrams (hostname match)',data:{hostname,pathname},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return '/descubrams';
  }
  
  // Prioridade 2: ViaJAR - viajartur.com → / ou /viajar/dashboard
  if (hostname === 'viajartur.com' || hostname.includes('viajartur') || hostname === 'viajar.com') {
    const currentPath = window.location.pathname;
    const redirectPath = (currentPath.includes('/login') || currentPath.includes('/auth')) ? '/' : (currentPath || '/');
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authRedirect.ts:getLoginRedirectPath:RETURN_VIAJAR',message:'Retornando path ViaJAR',data:{hostname,pathname,currentPath,redirectPath},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return redirectPath;
  }
  
  // Prioridade 3: Detectar por contexto (pathname)
  if (isDescubraMS) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authRedirect.ts:getLoginRedirectPath:RETURN_DESCUBRAMS_CONTEXT',message:'Retornando /descubrams (contexto detectado)',data:{hostname,pathname,isDescubraMS},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    return '/descubrams';
  }
  
  if (isViaJAR) {
    const currentPath = window.location.pathname;
    const redirectPath = (currentPath.includes('/login') || currentPath.includes('/auth')) ? '/' : (currentPath || '/');
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authRedirect.ts:getLoginRedirectPath:RETURN_VIAJAR_CONTEXT',message:'Retornando path ViaJAR (contexto detectado)',data:{hostname,pathname,isViaJAR,redirectPath},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    return redirectPath;
  }
  
  // Fallback: Para outros contextos, manter path atual ou home
  const currentPath = window.location.pathname;
  const redirectPath = (currentPath.includes('/login') || currentPath.includes('/auth')) ? '/' : (currentPath || '/');
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authRedirect.ts:getLoginRedirectPath:RETURN_FALLBACK',message:'Retornando path fallback',data:{hostname,pathname,currentPath,redirectPath},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
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

