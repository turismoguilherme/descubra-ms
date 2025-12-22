/**
 * useBusinessSegment Hook
 * Hook para obter configuração de métricas baseada em business_category
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { BusinessMetricsConfig, getBusinessMetricsConfig } from '@/services/business/businessMetricsService';

// Tipo compatível com BusinessType do businessMetricsService
type BusinessType = 'hotel' | 'pousada' | 'hostel' | 'atrativo' | 'restaurante' | 'bar' | 'agencia' | 'outro' | 'guia' | 'transporte' | 'evento';

export type BusinessCategory = 'hotel' | 'pousada' | 'hostel' | 'atrativo' | 'restaurante' | 'bar' | 'agencia' | 'outro';

export interface BusinessSegment {
  category: BusinessCategory | null;
  config: BusinessMetricsConfig | null;
  cityId: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useBusinessSegment(): BusinessSegment {
  const auth = useAuth();
  const { user } = auth || { user: null };
  const [category, setCategory] = useState<BusinessCategory | null>(null);
  const [cityId, setCityId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    loadBusinessSegment();
  }, [user?.id]);

  const loadBusinessSegment = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    const userId = user.id;
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user_profiles')
        .select('business_category, city_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (data) {
        const categoryValue = data.business_category as BusinessCategory;
        setCategory(categoryValue || null);
        setCityId(data.city_id || null);
      }
    } catch (err: any) {
      console.error('Erro ao carregar segmento do negócio:', err);
      setError(err.message || 'Erro ao carregar informações do negócio');
    } finally {
      setIsLoading(false);
    }
  };

  // Obter configuração baseada na categoria
  const config = category ? getBusinessMetricsConfig(category as BusinessType) : null;

  return {
    category,
    config,
    cityId,
    isLoading,
    error,
  };
}

