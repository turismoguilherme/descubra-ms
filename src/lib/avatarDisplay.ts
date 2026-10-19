import type { User } from '@supabase/supabase-js';

export type AvatarDisplayMode = 'photo' | 'pantanal';

export function getProviderPictureUrl(user: User | null | undefined): string | null {
  if (!user?.user_metadata) return null;
  const meta = user.user_metadata as Record<string, unknown>;
  const url = meta.avatar_url ?? meta.picture;
  if (typeof url === 'string' && url.trim()) return url.trim();
  return null;
}

export function resolveAvatarDisplayMode(
  stored: string | null | undefined,
  hasPhoto: boolean,
  hasPantanalSelection: boolean
): AvatarDisplayMode {
  if (stored === 'photo' || stored === 'pantanal') return stored;
  if (hasPhoto) return 'photo';
  if (hasPantanalSelection) return 'pantanal';
  return 'pantanal';
}

/** URL exibida no menu, perfil e ranking (lado cliente). */
export function resolvePublicAvatarUrl(opts: {
  mode: AvatarDisplayMode;
  profilePhotoUrl?: string | null;
  pantanalImageUrl?: string | null;
  providerPictureUrl?: string | null;
}): string | null {
  const photo = (opts.profilePhotoUrl || '').trim() || opts.providerPictureUrl || null;
  const pantanal = (opts.pantanalImageUrl || '').trim() || null;

  if (opts.mode === 'photo') {
    return photo || pantanal;
  }
  return pantanal || photo;
}
