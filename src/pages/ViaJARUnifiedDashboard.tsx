import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';
import { CitySelectionModal } from '@/components/viajar/CitySelectionModal';
import { supabase } from '@/integrations/supabase/client';
import SecretaryDashboard from '@/components/secretary/SecretaryDashboard';
import AttendantDashboardRestored from '@/components/cat/AttendantDashboardRestored';
import PrivateDashboard from '@/pages/PrivateDashboard';

/** Mesmos papéis que acessam `ViaJARAdminPanel` */
const ADMIN_PANEL_ROLES = ['admin', 'master_admin', 'tech'] as const;

export default function ViaJARUnifiedDashboard() {
  let auth = null;
  try {
    auth = useAuth();
  } catch {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
          <p>Carregando sistema de autenticação...</p>
        </div>
      </div>
    );
  }

  const { user, userProfile, loading: authLoading } = auth;
  const { userRole } = useRoleBasedAccess();

  const [needsCitySelection, setNeedsCitySelection] = useState(false);
  const [isCheckingCity, setIsCheckingCity] = useState(true);

  const isSecretary = userRole === 'gestor_municipal';
  const isAttendant = userRole === 'atendente' || userRole === 'cat_attendant';
  const isPrivate = userRole === 'user';

  useEffect(() => {
    const checkCityId = async () => {
      if (!user?.id || !isPrivate) {
        setIsCheckingCity(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('city_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (!data?.city_id) {
          setNeedsCitySelection(true);
        }
      } catch (err) {
        console.error('Erro ao verificar city_id:', err);
      } finally {
        setIsCheckingCity(false);
      }
    };

    checkCityId();
  }, [user?.id, isPrivate]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
          <p className="text-slate-600">Carregando…</p>
        </div>
      </div>
    );
  }

  if (isSecretary) {
    return <SecretaryDashboard />;
  }

  if (isAttendant) {
    return <AttendantDashboardRestored />;
  }

  if (isPrivate) {
    if (isCheckingCity) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
            <p>Carregando...</p>
          </div>
        </div>
      );
    }

    if (needsCitySelection) {
      return (
        <CitySelectionModal
          userId={user?.id || ''}
          onCitySelected={async (_cityId: string) => {
            setNeedsCitySelection(false);
            window.location.reload();
          }}
        />
      );
    }

    return <PrivateDashboard />;
  }

  const forcePrivate = localStorage.getItem('force_private_dashboard');
  if (forcePrivate === 'true') {
    localStorage.removeItem('force_private_dashboard');
    return <PrivateDashboard />;
  }

  if (
    userProfile?.role &&
    ADMIN_PANEL_ROLES.includes(userProfile.role as (typeof ADMIN_PANEL_ROLES)[number])
  ) {
    return <Navigate to="/viajar/admin" replace />;
  }

  /* Papéis ainda permitidos na rota mas sem tela dedicada aqui → hub unificado */
  return <Navigate to="/unified" replace />;
}
