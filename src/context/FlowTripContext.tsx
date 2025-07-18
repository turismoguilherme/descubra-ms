import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FlowTripContextType, State, UserLevel, PassportStamp, Achievement } from '@/types/flowtrip';
import { useAuth } from '@/hooks/useAuth';

const FlowTripContext = createContext<FlowTripContextType | undefined>(undefined);

export const useFlowTrip = () => {
  const context = useContext(FlowTripContext);
  if (!context) {
    throw new Error('useFlowTrip must be used within a FlowTripProvider');
  }
  return context;
};

interface FlowTripProviderProps {
  children: ReactNode;
}

export const FlowTripProvider: React.FC<FlowTripProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [currentState, setCurrentState] = useState<State | null>(null);
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
  const [passportStamps, setPassportStamps] = useState<PassportStamp[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Inicializar com estado do MS por padrão
  useEffect(() => {
    const loadDefaultState = async () => {
      try {
        const { data: states } = await supabase
          .from('states')
          .select('*')
          .eq('code', 'MS')
          .single();

        if (states) {
          setCurrentState(states);
        }
      } catch (error) {
        console.error('Error loading default state:', error);
      }
    };

    loadDefaultState();
  }, []);

  // Carregar dados do usuário quando mudar o estado atual
  useEffect(() => {
    if (user && currentState) {
      refreshUserData();
    }
  }, [user, currentState]);

  const refreshUserData = async () => {
    if (!user || !currentState) return;

    setIsLoading(true);
    try {
      // Carregar nível do usuário
      const { data: levelData } = await supabase
        .from('user_levels')
        .select('*')
        .eq('user_id', user.id)
        .eq('state_id', currentState.id)
        .single();

      if (levelData) {
        setUserLevel(levelData);
      }

      // Carregar selos do passaporte
      const { data: stampsData } = await supabase
        .from('passport_stamps')
        .select('*')
        .eq('user_id', user.id)
        .eq('state_id', currentState.id)
        .order('stamped_at', { ascending: false });

      if (stampsData) {
        setPassportStamps(stampsData);
      }

      // Carregar conquistas (implementar depois)
      setAchievements([]);
    } catch (error) {
      console.error('Error refreshing user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addPoints = async (points: number, activity_type = 'manual') => {
    if (!user || !currentState) return;

    try {
      await supabase.rpc('update_user_points', {
        p_user_id: user.id,
        p_state_id: currentState.id,
        p_points: points
      });

      // Atualizar dados locais
      await refreshUserData();
    } catch (error) {
      console.error('Error adding points:', error);
    }
  };

  const addStamp = async (stamp: Omit<PassportStamp, 'id' | 'user_id' | 'stamped_at'>) => {
    if (!user || !currentState) return;

    try {
      const { data } = await supabase
        .from('passport_stamps')
        .insert({
          ...stamp,
          user_id: user.id,
          state_id: currentState.id
        })
        .select()
        .single();

      if (data) {
        setPassportStamps(prev => [data, ...prev]);
        
        // Adicionar pontos automaticamente
        await addPoints(stamp.points_earned, stamp.activity_type);
      }
    } catch (error) {
      console.error('Error adding stamp:', error);
    }
  };

  const value: FlowTripContextType = {
    currentState,
    userLevel,
    passportStamps,
    achievements,
    isLoading,
    setCurrentState,
    addPoints,
    addStamp,
    refreshUserData
  };

  return (
    <FlowTripContext.Provider value={value}>
      {children}
    </FlowTripContext.Provider>
  );
};