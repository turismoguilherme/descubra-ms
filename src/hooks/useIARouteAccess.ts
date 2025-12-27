import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook para verificar se o usuário tem acesso pago aos Roteiros por IA
 */
export const useIARouteAccess = () => {
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      try {
        // Verificar se usuário tem pagamento registrado para Roteiros IA
        // Por enquanto, vamos verificar em uma tabela de pagamentos ou user_metadata
        // Se não existir, criar uma forma simples de verificar
        
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
      } catch (error) {
        console.error('Erro ao verificar acesso:', error);
        // Em caso de erro, permitir acesso temporariamente (não bloquear)
        setHasAccess(true);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [user]);

  return {
    hasAccess,
    loading,
  };
};





