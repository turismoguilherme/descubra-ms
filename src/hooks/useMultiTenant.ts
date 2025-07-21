import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

export const useMultiTenant = () => {
  const location = useLocation();
  const [currentTenant, setCurrentTenant] = useState<string | null>(null);
  const [tenantConfig, setTenantConfig] = useState<any>(null); // Pode ser mais específico com um tipo
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userProfile, loading: authLoading } = useAuth(); // Usar o useAuth

  useEffect(() => {
    const detectAndLoadTenant = async () => {
      console.log("🔍 useMultiTenant: Início do detectAndLoadTenant. authLoading:", authLoading, "userProfile:", userProfile);

      if (authLoading) {
        console.log("🔍 useMultiTenant: authLoading é true, aguardando...");
        return; // Aguarda o userProfile carregar
      }

      setLoading(true);
      setError(null);

      const pathSegments = location.pathname.split('/').filter(Boolean);
      let detectedTenantCode: string | null = null;

      if (pathSegments.length > 0) {
        const possibleTenantCode = pathSegments[0];
        // Uma heurística simples para códigos de tenant de 2 letras (ex: 'ms', 'mt')
        if (possibleTenantCode.length === 2 && possibleTenantCode.match(/[a-z]{2}/)) {
          detectedTenantCode = possibleTenantCode;
        }
      }

      console.log("🔍 useMultiTenant: Tenant detectado do URL:", detectedTenantCode);
      console.log("🔍 useMultiTenant: userProfile no momento da requisição:", userProfile);

      if (detectedTenantCode) {
        try {
          const { data, error: dbError } = await supabase
            .from('flowtrip_states')
            .select('*')
            .eq('code', detectedTenantCode.toUpperCase())
            .eq('is_active', true)
            .maybeSingle();

          console.log("✅ useMultiTenant: Dados recebidos do Supabase para flowtrip_states:", data);
          console.log("❌ useMultiTenant: Erro recebido do Supabase para flowtrip_states:", dbError);

          if (dbError) {
            console.error("Erro ao buscar configuração do tenant:", dbError);
            setError(dbError.message);
          } else if (data) {
            setTenantConfig(data);
            setCurrentTenant(detectedTenantCode);
          } else {
            setError(`Tenant '${detectedTenantCode}' não encontrado ou inativo.`);
          }
        } catch (err: any) {
          console.error("Erro inesperado ao buscar configuração do tenant:", err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      } else {
        // Se não há tenant detectado, assume-se um modo padrão ou global.
        // Você pode carregar uma configuração padrão aqui ou definir como nulo/vazio.
        setTenantConfig(null);
        setCurrentTenant(null);
        setLoading(false);
      }
    };

    detectAndLoadTenant();
  }, [location.pathname, userProfile, authLoading]); // Adicionado userProfile e authLoading como dependências

  return {
    currentTenant,
    tenantConfig,
    loading,
    error,
    isMultiTenantMode: !!currentTenant,
  };
};