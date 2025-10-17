import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
  user_id: string;
  full_name?: string;
  role?: string;
  city_id?: string;
  region_id?: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: string;
  region?: string;
  city_id?: string;
  region_id?: string;
}

export const useSecureAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const isAuthenticated = !!session?.user;
  const isAdmin = role?.role === 'admin' || role?.role === 'tech';
  const isManager = ['admin', 'tech', 'municipal_manager', 'gestor', 'municipal'].includes(role?.role || '');
  const isGestor = role?.role === 'gestor' || role?.role === 'municipal_manager';
  const isAttendant = role?.role === 'atendente';
  const isDiretorEstadual = role?.role === 'diretor_estadual';
  const isGestorIgr = role?.role === 'gestor_igr';
  const isGestorMunicipal = role?.role === 'gestor_municipal';
  
  // Legacy properties for backward compatibility
  const userRole = role?.role || 'user';
  const userRegion = role?.region || '';
  const cityId = role?.city_id || '';
  const regionId = role?.region_id || '';

  // Helper function to get dashboard route based on role
  const getDashboardRoute = () => {
    if (!role) return '/';
    switch (role.role) {
      case 'admin':
      case 'tech':
        return '/technical-admin';
      case 'municipal_manager':
      case 'gestor':
        return '/municipal-admin';
      case 'atendente':
        return '/cat-attendant';
      default:
        return '/';
    }
  };

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch user profile
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      // Fetch user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      setProfile(profileData);
      setRole(roleData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const refreshUserPermissions = async () => {
    if (session?.user) {
      await fetchUserData(session.user.id);
      toast({
        title: "Permissões atualizadas",
        description: "Suas permissões foram atualizadas com sucesso.",
      });
    }
  };

  const handleSecureLogout = async () => {
    try {
      setLoading(true);
      
      // Clear state first
      setUser(null);
      setSession(null);
      setProfile(null);
      setRole(null);
      
      // Clear localStorage
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      // Sign out from Supabase
      await supabase.auth.signOut({ scope: 'global' });
      
      // Force page refresh
      window.location.href = '/ms';
    } catch (error) {
      console.error('Logout error:', error);
      // Force refresh even if logout fails
      window.location.href = '/ms';
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer user data fetching to prevent deadlocks
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setRole(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    session,
    profile,
    role,
    cityId,
    regionId,
    isAuthenticated,
    isAdmin,
    isManager,
    isGestor,
    isAttendant,
    isDiretorEstadual,
    isGestorIgr,
    isGestorMunicipal,
    loading,
    // Legacy properties
    userRole,
    userRegion,
    getDashboardRoute,
    refreshUserPermissions,
    handleSecureLogout,
  };
};