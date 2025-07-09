
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export type UserRole = 'admin' | 'tech' | 'municipal' | 'municipal_manager' | 'gestor' | 'atendente' | 'user';

export const useSecureAuth = () => {
  const { user, session, loading: authLoading, signOut } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userRegion, setUserRegion] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const refreshUserPermissions = async () => {
    if (!user?.id) {
      setUserRole(null);
      setUserRegion(null);
      return;
    }
    
    console.log("🔄 Buscando permissões para usuário:", user.email);
    
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role, region')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.log("⚠️ Usuário sem role definida:", error.message);
        setUserRole('user'); // Default role
        setUserRegion(null);
      } else if (data) {
        console.log("✅ Role encontrada:", data.role);
        setUserRole(data.role as UserRole);
        setUserRegion(data.region || null);
      }
    } catch (error) {
      console.error("❌ Erro ao buscar permissões:", error);
      setUserRole('user'); // Default fallback
      setUserRegion(null);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      if (authLoading) return;

      if (user?.id) {
        await refreshUserPermissions();
      } else {
        setUserRole(null);
        setUserRegion(null);
      }
      
      setLoading(false);
    };

    checkAuth();
  }, [user?.id, authLoading]);

  const isAuthenticated = !!session;
  const isManager = userRole && ['admin', 'tech', 'municipal', 'municipal_manager', 'gestor', 'atendente'].includes(userRole);
  const isAdmin = userRole === 'admin' || userRole === 'tech';
  const isMunicipalManager = userRole === 'municipal_manager' || userRole === 'gestor' || userRole === 'municipal';
  const isAttendant = userRole === 'atendente';

  // Get recommended dashboard route based on role
  const getDashboardRoute = () => {
    if (isAdmin) return '/technical-admin';
    if (isMunicipalManager) return '/municipal-admin';
    if (isAttendant) return '/cat-attendant';
    return '/management';
  };

  const handleSecureLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error: any) {
      console.error("Erro no logout:", error);
      toast({
        title: "Erro no logout",
        description: error.message || "Erro inesperado",
        variant: "destructive",
      });
    }
  };

  console.log("🔐 Estado de autenticação:", {
    isAuthenticated,
    userRole,
    isManager,
    isAdmin,
    userEmail: user?.email
  });

  return {
    user,
    session,
    userRole,
    userRegion,
    isAuthenticated,
    isManager,
    isAdmin,
    isMunicipalManager,
    isAttendant,
    getDashboardRoute,
    loading: authLoading || loading,
    handleSecureLogout,
    refreshUserPermissions
  };
};
