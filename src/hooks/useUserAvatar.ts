import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

/**
 * Hook para buscar e gerenciar o avatar do usuário
 * Busca o avatar selecionado do banco e retorna a URL da imagem
 */
export function useUserAvatar() {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
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

        // 1. Buscar selected_avatar do user_profiles
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('selected_avatar')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Erro ao buscar perfil:', profileError);
          
          // Tentar usar avatar_url do user_metadata como fallback
          setAvatarUrl(user.user_metadata?.avatar_url || null);
          setLoading(false);
          return;
        }

        // 2. Se não há selected_avatar, usar avatar_url do user_metadata
        if (!profile?.selected_avatar) {
          
          setAvatarUrl(user.user_metadata?.avatar_url || null);
          setLoading(false);
          return;
        }

        // 3. Buscar image_url do avatar selecionado no pantanal_avatars
        const { data: avatar, error: avatarError } = await supabase
          .from('pantanal_avatars')
          .select('image_url')
          .eq('id', profile.selected_avatar)
          .eq('is_active', true)
          .maybeSingle();

        if (avatarError) {
          console.error('Erro ao buscar avatar:', avatarError);
          
          // Fallback para user_metadata
          setAvatarUrl(user.user_metadata?.avatar_url || null);
          setLoading(false);
          return;
        }

        // 4. Usar image_url do avatar ou fallback
        const finalAvatarUrl = avatar?.image_url || user.user_metadata?.avatar_url || null;
        
        setAvatarUrl(finalAvatarUrl);
      } catch (error: unknown) {
        console.error('Erro geral ao carregar avatar:', error);
        
        setAvatarUrl(user.user_metadata?.avatar_url || null);
      } finally {
        setLoading(false);
      }
    };

    loadAvatar();

    // Escutar mudanças no perfil do usuário
    const channel = supabase
      .channel('user_profile_changes')
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

  return { avatarUrl, loading };
}

