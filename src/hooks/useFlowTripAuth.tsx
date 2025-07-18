import { useState, useEffect } from 'react';
import { useSecureAuth } from './useSecureAuth';
import { supabase } from '@/integrations/supabase/client';
import { FlowTripUserProfile, FlowTripState, UserState, FlowTripRole } from '@/types/flowtrip';

export const useFlowTripAuth = () => {
  const { userRole, isAuthenticated, loading: authLoading } = useSecureAuth();
  const [flowTripUser, setFlowTripUser] = useState<FlowTripUserProfile | null>(null);
  const [currentState, setCurrentState] = useState<FlowTripState | null>(null);
  const [userStates, setUserStates] = useState<UserState[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    if (isAuthenticated) {
      loadFlowTripProfile();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  const loadFlowTripProfile = async () => {
    try {
      setLoading(true);
      
      // Carregar estados do usuário
      const { data: states, error: statesError } = await supabase.rpc('get_user_states', {
        check_user_id: (await supabase.auth.getUser()).data.user?.id
      });

      if (statesError) throw statesError;

      setUserStates(states || []);

      // Definir estado atual (primeiro da lista ou MS como padrão)
      if (states && states.length > 0) {
        const msState = states.find(s => s.state_code === 'ms');
        const defaultState = msState || states[0];
        
        const { data: stateData, error: stateError } = await supabase
          .from('flowtrip_states')
          .select('*')
          .eq('id', defaultState.state_id)
          .single();

        if (!stateError && stateData) {
          const typedStateData = {
            ...stateData,
            plan_type: stateData.plan_type as 'basic' | 'premium' | 'enterprise'
          };
          setCurrentState(typedStateData);
        }
      }

      // Criar perfil FlowTrip
      setFlowTripUser({
        id: (await supabase.auth.getUser()).data.user?.id || '',
        role: userRole as FlowTripRole,
        states: states || [],
        currentState: currentState
      });

    } catch (error) {
      console.error('Erro ao carregar perfil FlowTrip:', error);
    } finally {
      setLoading(false);
    }
  };

  const switchState = async (stateCode: string) => {
    const targetState = userStates.find(s => s.state_code === stateCode);
    if (!targetState) return;

    try {
      const { data: stateData, error } = await supabase
        .from('flowtrip_states')
        .select('*')
        .eq('id', targetState.state_id)
        .single();

      if (!error && stateData) {
        const typedStateData = {
          ...stateData,
          plan_type: stateData.plan_type as 'basic' | 'premium' | 'enterprise'
        };
        setCurrentState(typedStateData);
        setFlowTripUser(prev => prev ? { ...prev, currentState: typedStateData } : null);
      }
    } catch (error) {
      console.error('Erro ao trocar estado:', error);
    }
  };

  const isMasterAdmin = () => {
    return userRole === 'admin' || userRole === 'tech';
  };

  const isStateAdmin = () => {
    return userRole === 'diretor_estadual' || userRole === 'gestor_igr' || userRole === 'gestor_municipal';
  };

  const isAttendant = () => {
    return userRole === 'atendente';
  };

  const isTourist = () => {
    return userRole === 'user' || !userRole;
  };

  const hasPermission = (requiredRole: FlowTripRole | FlowTripRole[]) => {
    if (!userRole) return false;
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(userRole as FlowTripRole);
    }
    
    return userRole === requiredRole;
  };

  return {
    flowTripUser,
    currentState,
    userStates,
    loading: loading || authLoading,
    switchState,
    isMasterAdmin,
    isStateAdmin,
    isAttendant,
    isTourist,
    hasPermission,
    refreshProfile: loadFlowTripProfile
  };
};