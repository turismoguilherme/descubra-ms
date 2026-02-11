// @ts-nocheck
/**
 * Hook para obter e gerenciar o tipo de negócio do usuário
 * Retorna o business_type do perfil do usuário
 */

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type BusinessType = 
  | 'hotel' 
  | 'pousada' 
  | 'restaurante' 
  | 'agencia' 
  | 'guia' 
  | 'atracao' 
  | 'transporte' 
  | 'evento' 
  | 'outro' 
  | null;

export const useBusinessType = () => {
  const { user, userProfile } = useAuth();
  const [businessType, setBusinessType] = useState<BusinessType>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBusinessType = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        // Primeiro, tentar obter do userProfile (já carregado)
        if (userProfile?.business_type) {
          setBusinessType(userProfile.business_type as BusinessType);
          setIsLoading(false);
          return;
        }

        // Se não estiver no userProfile, buscar diretamente do Supabase
        const { data, error } = await supabase
          .from('users')
          .select('business_type')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Erro ao buscar business_type:', error);
        } else if (data?.business_type) {
          setBusinessType(data.business_type as BusinessType);
        }
      } catch (error) {
        console.error('Erro ao carregar business_type:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBusinessType();
  }, [user?.id, userProfile?.business_type]);

  const updateBusinessType = async (newBusinessType: BusinessType) => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('users')
        .update({ business_type: newBusinessType })
        .eq('id', user.id);

      if (error) {
        console.error('Erro ao atualizar business_type:', error);
        return false;
      }

      setBusinessType(newBusinessType);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar business_type:', error);
      return false;
    }
  };

  return {
    businessType,
    isLoading,
    updateBusinessType
  };
};

