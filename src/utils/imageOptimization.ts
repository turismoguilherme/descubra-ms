/**
 * Helper para otimização de imagens do Supabase Storage
 * Aplica parâmetros de width e quality para melhorar qualidade e performance
 * 
 * IMPORTANTE: O Supabase requer o uso de /render/image/ em vez de /object/ para aplicar transformações
 */

/**
 * Otimiza URL de imagem do Supabase Storage adicionando parâmetros de qualidade
 * @param url - URL da imagem (pode ser do Supabase ou externa)
 * @param width - Largura desejada em pixels (padrão: 1920)
 * @param quality - Qualidade da imagem 0-100 (padrão: 95)
 * @param addCacheBust - Adicionar timestamp para quebrar cache (padrão: false)
 * @returns URL otimizada ou original se não for do Supabase
 */
export function optimizeSupabaseImage(
  url: string | null | undefined,
  width: number = 1920,
  quality: number = 95,
  addCacheBust: boolean = false
): string {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'imageOptimization.ts:optimizeSupabaseImage:entry',message:'Entrada na função optimizeSupabaseImage',data:{url:url?.substring(0,100),urlLength:url?.length,width,quality,addCacheBust},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  
  if (!url || typeof url !== 'string') {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'imageOptimization.ts:optimizeSupabaseImage:empty',message:'URL vazia ou inválida',data:{url,type:typeof url},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    return '';
  }

  // NOTA: O endpoint /render/image/ do Supabase não está disponível/habilitado neste projeto
  // Por isso, retornamos a URL original diretamente para evitar erros de carregamento
  // A compressão já foi feita no upload (EventImageUpload.tsx), então a qualidade já está otimizada
  
  // Se for URL do Supabase Storage, retornar URL original (já otimizada no upload)
  if (url.includes('supabase.co') && url.includes('/storage/v1/')) {
    // Remover query params existentes para garantir URL limpa
    const baseUrl = url.split('?')[0];
    
    // Adicionar cache busting se solicitado
    if (addCacheBust) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'imageOptimization.ts:optimizeSupabaseImage:supabase-cache',message:'Retornando URL original do Supabase com cache bust',data:{originalUrl:url.substring(0,100),baseUrl:baseUrl.substring(0,100)},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      return `${baseUrl}?t=${Date.now()}`;
    }
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'imageOptimization.ts:optimizeSupabaseImage:supabase',message:'Retornando URL original do Supabase (sem otimização)',data:{originalUrl:url.substring(0,100),baseUrl:baseUrl.substring(0,100),reason:'render/image endpoint não disponível'},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    return baseUrl;
  }

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'imageOptimization.ts:optimizeSupabaseImage:non-supabase',message:'URL não é do Supabase, retornando original',data:{url:url.substring(0,100),isSupabase:url.includes('supabase.co'),hasStorage:url.includes('/storage/v1/')},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'C'})}).catch(()=>{});
  // #endregion

  // Retornar URL original se não for do Supabase
  return url;
}

/**
 * Otimiza imagem para uso em thumbnails (menor qualidade, menor tamanho)
 */
export function optimizeThumbnail(url: string | null | undefined, addCacheBust: boolean = false): string {
  return optimizeSupabaseImage(url, 800, 90, addCacheBust);
}

/**
 * Otimiza imagem para uso em cards de eventos (alta qualidade para melhor visualização)
 * NOTA: Usa URL original diretamente pois /render/image/ não está disponível
 */
export function optimizeEventCardImage(url: string | null | undefined, addCacheBust: boolean = false): string {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'imageOptimization.ts:optimizeEventCardImage:entry',message:'Entrada na função optimizeEventCardImage',data:{url:url?.substring(0,100),urlLength:url?.length,addCacheBust},timestamp:Date.now(),sessionId:'debug-session',runId:'card-fix',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  if (!url || typeof url !== 'string') {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'imageOptimization.ts:optimizeEventCardImage:empty',message:'URL vazia ou inválida',data:{url,type:typeof url},timestamp:Date.now(),sessionId:'debug-session',runId:'card-fix',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return '';
  }
  
  // NOTA: O endpoint /render/image/ do Supabase não está disponível/habilitado neste projeto
  // Por isso, retornamos a URL original diretamente para evitar erros de carregamento
  // A compressão já foi feita no upload (EventImageUpload.tsx), então a qualidade já está otimizada
  
  // Se for URL do Supabase Storage, retornar URL original (já otimizada no upload)
  if (url.includes('supabase.co') && url.includes('/storage/v1/')) {
    const baseUrl = url.split('?')[0];
    
    // Adicionar cache busting se solicitado
    if (addCacheBust) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'imageOptimization.ts:optimizeEventCardImage:supabase-cache',message:'Retornando URL original do Supabase com cache bust',data:{originalUrl:url.substring(0,100),baseUrl:baseUrl.substring(0,100)},timestamp:Date.now(),sessionId:'debug-session',runId:'card-fix',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return `${baseUrl}?t=${Date.now()}`;
    }
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'imageOptimization.ts:optimizeEventCardImage:supabase',message:'Retornando URL original do Supabase (sem otimização)',data:{originalUrl:url.substring(0,100),baseUrl:baseUrl.substring(0,100),reason:'render/image endpoint não disponível'},timestamp:Date.now(),sessionId:'debug-session',runId:'card-fix',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    return baseUrl;
  }

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'imageOptimization.ts:optimizeEventCardImage:non-supabase',message:'URL não é do Supabase, retornando original',data:{url:url.substring(0,100),isSupabase:url.includes('supabase.co'),hasStorage:url.includes('/storage/v1/')},timestamp:Date.now(),sessionId:'debug-session',runId:'card-fix',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  // Retornar URL original se não for do Supabase
  return url;
}

/**
 * Otimiza imagem para uso em modals/lightbox (alta qualidade, tamanho grande)
 */
export function optimizeModalImage(url: string | null | undefined, addCacheBust: boolean = false): string {
  return optimizeSupabaseImage(url, 1920, 95, addCacheBust);
}

