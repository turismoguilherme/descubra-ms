import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface StateConfig {
  id: string;
  code: string;
  name: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  isActive: boolean;
}

export const useStateConfig = () => {
  const [stateConfig, setStateConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userProfile, loading: authLoading } = useAuth();

  useEffect(() => {
    const fetchStateConfig = async () => {
      if (authLoading) return; // Aguarda o userProfile carregar

      setLoading(true);
      setError(null);

      console.log("🔍 useStateConfig: userProfile no momento da requisição:", userProfile);
      
      // O código 'MS' deve ser dinâmico ou vir de uma configuração de tenant.
      // Por enquanto, vamos usar 'MS' como padrão de exemplo.
      const stateCode = 'MS'; 

      try {
        const { data, error: dbError } = await supabase
          .from('states')
          .select('*')
          .eq('code', stateCode)
          .eq('is_active', true)
          .maybeSingle();

              console.log("✅ useStateConfig: Dados recebidos do Supabase para states:", data);
      console.log("❌ useStateConfig: Erro recebido do Supabase para states:", dbError);

        if (dbError) {
          console.error("Erro ao buscar configuração do estado:", dbError);
          setError(dbError.message);
        } else if (data) {
          setStateConfig(data);
        } else {
          setError("Configuração do estado não encontrada ou inativa.");
        }
      } catch (err: any) {
        console.error("Erro inesperado ao buscar configuração do estado:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStateConfig();
  }, [userProfile, authLoading]); // Adicionado userProfile e authLoading como dependências para re-executar quando mudam

  return { stateConfig, loading, error };
};