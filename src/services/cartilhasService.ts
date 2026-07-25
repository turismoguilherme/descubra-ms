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
        'id,slug,title,subtitle,audience,theme,cover_url,html_url,is_featured,is_active,status,display_order'
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
    {
      cartilha_id: cartilhaId,
      user_id: userId,
      progress_data: progressData,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,cartilha_id' }
  );
  if (error) throw error;
}
