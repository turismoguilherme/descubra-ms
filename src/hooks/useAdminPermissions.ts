import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { EmployeePermissions } from '@/types/admin';

export interface AdminPermissions {
  // ViaJAR
  viajar: {
    employees: boolean;
    clients: boolean;
    subscriptions: boolean;
    payments: boolean;
    settings: boolean;
  };
  // Descubra MS
  descubra_ms: {
    content: boolean;
    users: boolean;
    cat: boolean;
    settings: boolean;
    menus: boolean;
  };
  // Sistema
  system: {
    fallback: boolean;
    ai_admin: boolean;
    logs: boolean;
  };
}

export const useAdminPermissions = () => {
  const { user, userProfile } = useAuth();

  const permissions = useMemo(() => {
    const role = userProfile?.role || 'user';
    const isAdmin = ['admin', 'tech', 'master_admin'].includes(role);

    // Se for admin, tem acesso total
    if (isAdmin) {
      return {
        viajar: {
          employees: true,
          clients: true,
          subscriptions: true,
          payments: true,
          settings: true,
        },
        descubra_ms: {
          content: true,
          users: true,
          cat: true,
          settings: true,
          menus: true,
        },
        system: {
          fallback: true,
          ai_admin: true,
          logs: true,
        },
      } as AdminPermissions;
    }

    // Se não for admin, buscar permissões do employee
    // Por enquanto, retorna sem permissões (será implementado quando houver employee)
    return {
      viajar: {
        employees: false,
        clients: false,
        subscriptions: false,
        payments: false,
        settings: false,
      },
      descubra_ms: {
        content: false,
        users: false,
        cat: false,
        settings: false,
        menus: false,
      },
      system: {
        fallback: false,
        ai_admin: false,
        logs: false,
      },
    } as AdminPermissions;
  }, [userProfile]);

  const hasPermission = (section: keyof AdminPermissions, feature: string): boolean => {
    return permissions[section][feature as keyof typeof permissions[typeof section]] || false;
  };

  const canAccess = (section: keyof AdminPermissions): boolean => {
    const sectionPerms = permissions[section];
    return Object.values(sectionPerms).some(v => v === true);
  };

  return {
    permissions,
    hasPermission,
    canAccess,
    isAdmin: ['admin', 'tech', 'master_admin'].includes(userProfile?.role || ''),
  };
};

