import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AccessibilityPreferences } from '@/components/auth/AccessibilityQuestion';

export const useAccessibilityPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<AccessibilityPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar preferências do usuário
  const loadPreferences = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user_accessibility_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (data) {
        setPreferences(data.preferences);
        console.log('🎯 ACCESSIBILITY: Preferências carregadas:', data.preferences);
      }
    } catch (err) {
      console.error('❌ Erro ao carregar preferências:', err);
      setError('Erro ao carregar preferências de acessibilidade');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Salvar preferências do usuário
  const savePreferences = useCallback(async (newPreferences: AccessibilityPreferences) => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: upsertError } = await supabase
        .from('user_accessibility_preferences')
        .upsert({
          user_id: user.id,
          preferences: newPreferences,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (upsertError) {
        throw upsertError;
      }

      setPreferences(newPreferences);
      console.log('✅ ACCESSIBILITY: Preferências salvas:', newPreferences);

      // Aplicar preferências automaticamente
      applyPreferences(newPreferences);

      return data;
    } catch (err) {
      console.error('❌ Erro ao salvar preferências:', err);
      setError('Erro ao salvar preferências de acessibilidade');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Aplicar preferências na interface
  const applyPreferences = useCallback((prefs: AccessibilityPreferences) => {
    const root = document.documentElement;

    // Tamanho da fonte
    if (prefs.prefersLargeText) {
      root.style.fontSize = '18px';
    } else {
      root.style.fontSize = '16px';
    }

    // Alto contraste
    if (prefs.prefersHighContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Reduzir movimento
    if (prefs.prefersReducedMotion) {
      root.style.setProperty('--reduced-motion', 'reduce');
    } else {
      root.style.removeProperty('--reduced-motion');
    }

    // VLibras auto-ativar se necessário
    if (prefs.needsVLibras) {
      setTimeout(() => {
        const vlibrasButton = document.querySelector('[vw-access-button]') as HTMLElement;
        if (vlibrasButton) {
          vlibrasButton.click();
        }
      }, 1000);
    }

    console.log('🎯 ACCESSIBILITY: Preferências aplicadas na interface');
  }, []);

  // Resetar preferências
  const resetPreferences = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('user_accessibility_preferences')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      setPreferences(null);
      
      // Resetar interface
      const root = document.documentElement;
      root.style.fontSize = '16px';
      root.classList.remove('high-contrast');
      root.style.removeProperty('--reduced-motion');

      console.log('🔄 ACCESSIBILITY: Preferências resetadas');
    } catch (err) {
      console.error('❌ Erro ao resetar preferências:', err);
      setError('Erro ao resetar preferências de acessibilidade');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Verificar se usuário tem necessidades específicas
  const hasSpecificNeeds = useCallback(() => {
    if (!preferences) return false;
    
    return preferences.hasAccessibilityNeeds || 
           Object.values(preferences.needs).some(Boolean) ||
           preferences.prefersLargeText ||
           preferences.prefersHighContrast ||
           preferences.prefersReducedMotion ||
           preferences.needsScreenReader ||
           preferences.needsVLibras;
  }, [preferences]);

  // Obter configuração de avatar para VLibras
  const getAvatarConfig = useCallback(() => {
    if (!preferences) return null;

    let config = {
      gender: 'female' as const,
      skinTone: 'medium' as const,
      clothing: 'casual' as const,
      age: 'adult' as const
    };

    // Personalizar baseado nas necessidades
    if (preferences.needs?.visual) {
      config.clothing = 'high-contrast';
    }
    
    if (preferences.needs?.auditory) {
      config.clothing = 'formal';
    }

    if (preferences.needs?.motor) {
      config.clothing = 'casual'; // Roupas mais confortáveis
    }

    // Analisar outras necessidades
    if (preferences.otherNeeds) {
      const needsText = preferences.otherNeeds.toLowerCase();
      
      if (needsText.includes('idoso') || needsText.includes('senior')) {
        config.age = 'senior';
      }
      
      if (needsText.includes('jovem') || needsText.includes('adolescente')) {
        config.age = 'young';
      }
      
      if (needsText.includes('regional') || needsText.includes('local')) {
        config.clothing = 'regional';
      }
    }

    return config;
  }, [preferences]);

  // Carregar preferências na montagem
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  // Aplicar preferências quando carregadas
  useEffect(() => {
    if (preferences) {
      applyPreferences(preferences);
    }
  }, [preferences, applyPreferences]);

  return {
    preferences,
    loading,
    error,
    savePreferences,
    resetPreferences,
    hasSpecificNeeds,
    getAvatarConfig,
    applyPreferences
  };
}; 