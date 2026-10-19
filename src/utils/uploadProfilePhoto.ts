import { supabase } from '@/integrations/supabase/client';

const BUCKET = 'tourism-images';
const FOLDER = 'profile-photos';
const MAX_BYTES = 5 * 1024 * 1024;

const EXT_BY_TYPE: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
};

export async function uploadProfilePhoto(file: File): Promise<{ url?: string; error?: string }> {
  if (!file.type.startsWith('image/')) {
    return { error: 'Envie uma imagem (PNG, JPG ou WEBP).' };
  }
  if (file.size > MAX_BYTES) {
    return { error: 'A imagem deve ter até 5 MB.' };
  }

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: 'Faça login para enviar a foto.' };

  const ext = EXT_BY_TYPE[file.type] ?? 'jpg';
  const path = `${FOLDER}/${auth.user.id}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type,
  });

  if (uploadError) {
    return { error: uploadError.message || 'Falha ao enviar a foto.' };
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data?.publicUrl ? { url: data.publicUrl } : { error: 'Não foi possível obter a URL da foto.' };
}
