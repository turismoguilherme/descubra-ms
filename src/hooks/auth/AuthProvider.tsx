import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/auth";
import { AuthContext, AuthContextType } from "./AuthContext";
import { useToast } from "@/hooks/use-toast";
import { signUpService } from "./services/index";
import { signInWithProviderService } from "./services/signInWithProviderService";

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAndSetUserProfile = useCallback(async (user: User | null) => {
    console.log("🔄 AUTH: fetchAndSetUserProfile chamado com user:", user?.id);

    if (!user) {
      setUserProfile(null);
      setIsProfileComplete(null);
      console.log("🔄 AUTH: Usuário nulo, perfil resetado.");
      return;
    }

    try {
      // 1. Garantir que um perfil básico exista para o usuário autenticado.
      // Isso lida com casos onde usuários se cadastram via provedores sociais e um perfil ainda não foi criado.
      const initialProfileData = {
        user_id: user.id,
        full_name: user.user_metadata?.full_name || user.email || 'Novo Usuário', // Usar nome da meta ou email como fallback
      };

      console.log("🔄 AUTH: Tentando upsert básico do perfil...", initialProfileData);
      const { data: upsertedProfile, error: upsertError } = await supabase
        .from('user_profiles')
        .upsert(initialProfileData, { onConflict: 'user_id' })
        .select('full_name, id, created_at, updated_at') // Selecionar campos necessários para o retorno
        .single();

      if (upsertError) {
        console.error("❌ AUTH: Erro no upsert inicial do perfil:", upsertError);
        throw upsertError;
      }

      console.log("✅ AUTH: Perfil básico upserted/existente:", upsertedProfile);

      // 2. Buscar o perfil completo do usuário (incluindo o ID do perfil da tabela user_profiles)
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('full_name, id') // Selecione apenas o que está em user_profiles
        .eq('user_id', user.id) // Correção: Usar user_id para vincular ao auth.users.id
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error("❌ AUTH: Erro ao buscar profileData:", profileError);
        throw profileError;
      }

      // ... restante do código para buscar roleData e combinar ...

      // 3. Buscar o papel (role) do usuário
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role, city_id, region_id')
        .eq('user_id', user.id) // Usar user_id para vincular ao auth.users.id
        .maybeSingle();

      if (roleError && roleError.code !== 'PGRST116') {
        console.error("❌ AUTH: Erro ao buscar roleData:", roleError);
        throw roleError;
      }

      console.log("✅ AUTH: roleData encontrado:", roleData);

      const combinedProfile: UserProfile = {
        id: user.id,
        full_name: profileData?.full_name || user.user_metadata?.full_name || user.email || 'Novo Usuário',
        role: roleData?.role || 'authenticated', // Definir um role padrão se não encontrado
        city_id: roleData?.city_id || null,
        region_id: roleData?.region_id || null,
        email: user.email || '',
        created_at: upsertedProfile?.created_at || new Date().toISOString(),
        updated_at: upsertedProfile?.updated_at || new Date().toISOString(),
      };

      setUserProfile(combinedProfile);
      setIsProfileComplete(!!profileData && !!roleData); // Perfil completo se ambos existirem
      console.log("✅ AUTH: Perfil combinado e estado completo:", combinedProfile, "isProfileComplete:", !!profileData && !!roleData);

    } catch (error) {
      console.error("❌ AUTH: Erro geral no fetchAndSetUserProfile:", error);
      setUserProfile(null);
      setIsProfileComplete(null);
    }
  }, [supabase]);

  useEffect(() => {
    const getInitialSession = async () => {
      console.log("🔄 AUTH: getInitialSession iniciado.");
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      console.log("✅ AUTH: Sessão inicial obtida:", session);
      // CORREÇÃO OFICIAL: Evitar deadlock despachando a chamada para fora do fluxo síncrono.
      setTimeout(() => {
        fetchAndSetUserProfile(session?.user ?? null).finally(() => {
          setLoading(false);
          console.log("✅ AUTH: getInitialSession concluído, loading = false.");
        });
      }, 0);
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log("🔄 AUTH: onAuthStateChange disparado. Evento:", _event, "Sessão:", session);
        setSession(session);
        // CORREÇÃO OFICIAL: Evitar deadlock despachando a chamada para fora do fluxo síncrono.
        setTimeout(() => {
          fetchAndSetUserProfile(session?.user ?? null).finally(() => {
            // Apenas para o listener, podemos não precisar do loading, 
            // mas é bom ter para consistência se a sessão mudar.
            if (loading) setLoading(false);
            console.log("✅ AUTH: onAuthStateChange concluído.");
          });
        }, 0);
      }
    );

    return () => {
      subscription.unsubscribe();
      console.log("🗑️ AUTH: onAuthStateChange subscription unsubscribed.");
    };
  }, [fetchAndSetUserProfile, loading]);

  const signUp = async (email: string, password: string, fullName: string) => {
    const result = await signUpService(email, password, fullName);
    if (result.data.user) {
      await fetchAndSetUserProfile(result.data.user); // Atualiza perfil após cadastro
    }
    return result;
  };
  
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast({
        title: "Login bem-sucedido!",
        description: "Bem-vindo de volta!",
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast({
        title: "Sessão encerrada",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao fazer logout:", error);
      toast({
        title: "Erro ao desconectar",
        description: error.message || "Não foi possível desconectar.",
        variant: "destructive",
      });
    }
  };

  const signInWithProvider = async (provider: 'google' | 'facebook') => {
    const result = await signInWithProviderService(provider);
    return result;
  };

  const value: AuthContextType = {
    user,
    session,
    userProfile,
    isProfileComplete,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithProvider,
    fetchUserProfile: fetchAndSetUserProfile, // Expor a função mesclada
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};