// @ts-nocheck
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook para verificar se o usuário tem acesso pago aos Roteiros Personalizados
 * Inclui modo de teste para desenvolvimento e administradores
 */
export const useIARouteAccess = () => {
  const { user, userProfile } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isTestMode, setIsTestMode] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setHasAccess(false);
        setIsTestMode(false);
        setLoading(false);
        return;
      }

      try {
        // ===== MODO DE TESTE =====
        // Verificar se está em ambiente de desenvolvimento
        const isDev = import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        // Verificar se o usuário é admin/tech
        const userRole = userProfile?.role || user.user_metadata?.role || 'user';
        const isAdmin = ['admin', 'tech', 'master_admin'].includes(userRole);
        
        // Lista de emails permitidos para teste (configurável via variável de ambiente)
        const testEmails = (import.meta.env.VITE_IA_ROUTES_TEST_EMAILS || '').split(',').filter(Boolean);
        const isTestEmail = user.email && testEmails.length > 0 && testEmails.includes(user.email.toLowerCase());
        
        // Habilitar modo de teste se:
        // 1. Está em ambiente de desenvolvimento E (é admin OU email está na lista de teste)
        // 2. OU é admin em qualquer ambiente
        const testModeEnabled = (isDev && (isAdmin || isTestEmail)) || isAdmin;
        
        if (testModeEnabled) {
          console.log('🧪 Modo de teste ativado para Roteiros Personalizados:', {
            isDev,
            isAdmin,
            userRole,
            email: user.email,
            isTestEmail
          });
          setHasAccess(true);
          setIsTestMode(true);
          setLoading(false);
          return;
        }

        // ===== VERIFICAÇÃO DE PAGAMENTO =====
        // Verificar se usuário tem pagamento registrado para Roteiros Personalizados
        
        // Opção 1: Verificar em user_metadata
        const iaRoutePaid = user.user_metadata?.ia_route_paid === true;
        
        // Opção 2: Verificar em tabela específica (se existir)
        const { data: payment } = await supabase
          .from('user_feature_payments')
          .select('id')
          .eq('user_id', user.id)
          .eq('feature', 'ia_routes')
          .eq('status', 'paid')
          .maybeSingle();

        setHasAccess(iaRoutePaid || !!payment);
        setIsTestMode(false);
      } catch (error: unknown) {
        console.error('Erro ao verificar acesso:', error);
        // Em caso de erro, permitir acesso temporariamente apenas em desenvolvimento
        const isDev = import.meta.env.DEV || window.location.hostname === 'localhost';
        setHasAccess(isDev);
        setIsTestMode(isDev);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [user, userProfile]);

  return {
    hasAccess,
    isTestMode,
    loading,
  };
};

