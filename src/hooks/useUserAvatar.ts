import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  getProviderPictureUrl,
  resolveAvatarDisplayMode,
  resolvePublicAvatarUrl,
  type AvatarDisplayMode,
} from '@/lib/avatarDisplay';

/**
 * Foto pública do usuário (menu, ranking compartilhado, etc.)
 */
export function useUserAvatar() {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<AvatarDisplayMode>('pantanal');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setAvatarUrl(null);
      setLoading(false);
      return;
    }

    const loadAvatar = async () => {
      try {
        setLoading(true);

        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('selected_avatar, avatar_url, avatar_display_mode')
          .eq('user_id', user.id)
          .maybeSingle();

        const providerPicture = getProviderPictureUrl(user);

        if (profileError) {
          setAvatarUrl(providerPicture);
          setLoading(false);
          return;
        }

        let pantanalImage: string | null = null;
        if (profile?.selected_avatar) {
          const { data: avatar } = await supabase
            .from('pantanal_avatars')
            .select('image_url')
            .eq('id', profile.selected_avatar)
            .eq('is_active', true)
            .maybeSingle();
          pantanalImage = avatar?.image_url ?? null;
        }

        const profilePhoto = profile?.avatar_url || null;
        const mode = resolveAvatarDisplayMode(
          profile?.avatar_display_mode,
          Boolean((profilePhoto || '').trim() || providerPicture),
          Boolean(profile?.selected_avatar)
        );

        setDisplayMode(mode);
        setAvatarUrl(
          resolvePublicAvatarUrl({
            mode,
            profilePhotoUrl: profilePhoto,
            pantanalImageUrl: pantanalImage,
            providerPictureUrl: providerPicture,
          })
        );
      } catch {
        setAvatarUrl(getProviderPictureUrl(user));
      } finally {
        setLoading(false);
      }
    };

    loadAvatar();

    const channel = supabase
      .channel(`user_profile_avatar_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_profiles',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadAvatar();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { avatarUrl, displayMode, loading };
}
