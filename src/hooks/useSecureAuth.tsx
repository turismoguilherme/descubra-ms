
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";

export type UserRole = 
  | 'admin' 
  | 'tech' 
  | 'diretor_estadual'
  | 'gestor_igr'
  | 'gestor_municipal'
  | 'atendente'
  | 'user';

export const useSecureAuth = () => {
  const { user, session, userProfile, loading: authLoading, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Deriva o estado de autenticação e papéis a partir do AuthProvider
  const {
    role,
    cityId,
    regionId,
    isAuthenticated,
    isGestor,
    isAdmin,
    isDiretorEstadual,
    isGestorIgr,
    isGestorMunicipal,
    isAtendente
  } = useMemo(() => {
    const profile = userProfile;
    const currentRole = profile?.role as UserRole || null;

    return {
      role: currentRole,
      cityId: profile?.city_id || null,
      regionId: profile?.region_id || null,
      isAuthenticated: !!session && !!profile,
      isAdmin: currentRole === 'admin' || currentRole === 'tech',
      isDiretorEstadual: currentRole === 'diretor_estadual',
      isGestorIgr: currentRole === 'gestor_igr',
      isGestorMunicipal: currentRole === 'gestor_municipal',
      isAtendente: currentRole === 'atendente',
      isGestor: ['admin', 'tech', 'diretor_estadual', 'gestor_igr', 'gestor_municipal', 'atendente'].includes(currentRole || ''),
    };
  }, [session, userProfile]);
  
  // Rota recomendada com base no papel do usuário
  const getDashboardRoute = () => {
    if (isAdmin) return '/technical-admin';
    if (isDiretorEstadual || isGestorIgr) return '/management'; // Painel principal para visão macro
    if (isGestorMunicipal) return '/municipal-admin';
    if (isAtendente) return '/cat-attendant';
    return '/'; // Rota padrão para usuários comuns ou se não houver rota específica
  };

  const handleSecureLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error: unknown) {
      console.error("Erro no logout:", error);
      toast({
        title: "Erro no logout",
        description: error.message || "Erro inesperado",
        variant: "destructive",
      });
    }
  };

  return {
    user,
    session,
    profile: userProfile,
    role,
    cityId,
    regionId,
    isAuthenticated,
    isGestor,
    isAdmin,
    isDiretorEstadual,
    isGestorIgr,
    isGestorMunicipal,
    isAtendente,
    getDashboardRoute,
    loading: authLoading,
    handleSecureLogout,
  };
};
