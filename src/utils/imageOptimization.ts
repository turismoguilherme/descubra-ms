/**
 * Helper para otimização de imagens do Supabase Storage
 * Aplica parâmetros de width e quality para melhorar qualidade e performance
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

  // Se for URL do Supabase Storage, otimizar
  if (url.includes('supabase.co')) {
    // Remover query params existentes e adicionar novos
    const baseUrl = url.split('?')[0];
    let optimizedUrl = `${baseUrl}?width=${width}&quality=${quality}`;
    
    // Adicionar cache busting se solicitado
    if (addCacheBust) {
      optimizedUrl += `&t=${Date.now()}`;
    }
    
    return optimizedUrl;
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
 */
export function optimizeEventCardImage(url: string | null | undefined, addCacheBust: boolean = false): string {
  return optimizeSupabaseImage(url, 1920, 95, addCacheBust);
}

/**
 * Otimiza imagem para uso em modals/lightbox (alta qualidade, tamanho grande)
 */
export function optimizeModalImage(url: string | null | undefined, addCacheBust: boolean = false): string {
  return optimizeSupabaseImage(url, 1920, 95, addCacheBust);
}

