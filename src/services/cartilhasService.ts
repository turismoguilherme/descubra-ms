import { supabase } from '@/integrations/supabase/client';
import {
  CARTILHAS_FALLBACK,
  mapDbCartilha,
  type CartilhaItem,
} from '@/data/cartilhasCatalog';

export async function fetchPublicCartilhas(): Promise<CartilhaItem[]> {
  try {
    const { data, error } = await supabase
      .from('guata_cartilhas')
      .select(
        'id,slug,title,subtitle,audience,theme,cover_url,html_url,is_featured,is_active,status,display_order,content_data'
      )
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) return CARTILHAS_FALLBACK;
    return data.map(mapDbCartilha);
  } catch (e) {
    console.error('Erro ao carregar cartilhas:', e);
    return CARTILHAS_FALLBACK;
  }
}

export async function fetchCartilhaProgress(cartilhaId: string, userId: string) {
  const { data, error } = await supabase
    .from('guata_cartilha_progress')
    .select('progress_data')
    .eq('cartilha_id', cartilhaId)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data?.progress_data || null;
}

export async function upsertCartilhaProgress(
  cartilhaId: string,
  userId: string,
  progressData: unknown
) {
  const { error } = await supabase.from('guata_cartilha_progress').upsert(
    [
      {
        cartilha_id: cartilhaId,
        user_id: userId,
        progress_data: progressData as never,
        updated_at: new Date().toISOString(),
      },
    ],
    { onConflict: 'user_id,cartilha_id' }
  );

  if (error) throw error;
}

export async function updateCartilhaContentData(
  cartilhaId: string,
  contentData: Record<string, unknown>
) {
  const { error } = await supabase
    .from('guata_cartilhas')
    .update({
      content_data: contentData as never,
      updated_at: new Date().toISOString(),
    })
    .eq('id', cartilhaId);

  if (error) throw error;
}

/** Upload de imagem do mascote (admin) → URL pública no bucket guata-cartilhas */
export async function uploadCartilhaAsset(file: Blob, filename: string) {
  const path = `assets/${crypto.randomUUID()}-${filename}`;
  const { error } = await supabase.storage.from('guata-cartilhas').upload(path, file, {
    contentType: file.type || 'image/png',
    upsert: true,
  });
  if (error) throw error;
  const { data } = supabase.storage.from('guata-cartilhas').getPublicUrl(path);
  return data.publicUrl;
}
