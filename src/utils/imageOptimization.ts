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

  if (!url || typeof url !== 'string') {
    
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
      
      return `${baseUrl}?t=${Date.now()}`;
    }

    return baseUrl;
  }

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

  if (!url || typeof url !== 'string') {
    
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
      
      return `${baseUrl}?t=${Date.now()}`;
    }

    return baseUrl;
  }

  // Retornar URL original se não for do Supabase
  return url;
}

/**
 * Otimiza imagem para uso em modals/lightbox (alta qualidade, tamanho grande)
 */
export function optimizeModalImage(url: string | null | undefined, addCacheBust: boolean = false): string {
  return optimizeSupabaseImage(url, 1920, 95, addCacheBust);
}

