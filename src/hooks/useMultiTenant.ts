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
      console.log("🔍 useMultiTenant: Início do detectAndLoadTenant. authLoading:", authLoading, "userProfile:", userProfile, "current location.pathname:", location.pathname);

      if (authLoading) {
        console.log("🔍 useMultiTenant: authLoading é true, aguardando userProfile carregar. authLoading:", authLoading, "userProfile:", userProfile);
        return; // Aguarda o userProfile carregar
      }

      setLoading(true);
      setError(null);

      const pathSegments = location.pathname.split('/').filter(Boolean);
      let detectedTenantCode: string | null = null;

      if (pathSegments.length > 0) {
        const possibleTenantCode = pathSegments[0];
        // Uma heurística simples para códigos de tenant de 2 letras (ex: 'ms', 'mt')
        // Modificado para verificar explicitamente os tenants conhecidos em minúsculas.
        const knownTenants = ['ms', 'mt', 'rj', 'sp', 'pr', 'sc', 'rs', 'es', 'mg', 'ba', 'ce', 'pe', 'am', 'pa', 'df', 'go', 'to', 'ap', 'rr', 'ro', 'ac', 'ma', 'pi', 'rn', 'pb', 'se', 'al']; // Adicione mais conforme necessário
        if (knownTenants.includes(possibleTenantCode.toLowerCase())) {
          detectedTenantCode = possibleTenantCode.toLowerCase();
        }
      }

      console.log("🔍 useMultiTenant: Tenant detectado do URL:", detectedTenantCode);
      console.log("🔍 useMultiTenant: userProfile no momento da requisição:", userProfile);

      if (detectedTenantCode) {
        try {
          console.log("🔍 useMultiTenant: Buscando tenant no Supabase com código:", detectedTenantCode.toUpperCase());
          const { data, error: dbError } = await supabase
            .from('overflow_one_states')
            .select('*')
            .eq('code', detectedTenantCode.toUpperCase())
            .eq('is_active', true)
            .maybeSingle();

                  console.log("✅ useMultiTenant: Dados recebidos do Supabase para overflow_one_states:", data);
        console.log("❌ useMultiTenant: Erro recebido do Supabase para overflow_one_states:", dbError);

          if (dbError) {
            console.error("❌ useMultiTenant: Erro ao buscar configuração do tenant:", dbError);
            setError(dbError.message);
          } else if (data) {
            setTenantConfig(data);
            setCurrentTenant(detectedTenantCode);
            console.log("✅ useMultiTenant: Tenant configurado:", data);
            console.log("🔍 useMultiTenant: tenantConfig.logo_url:", data.logo_url);
            console.log("🔍 useMultiTenant: tenantConfig.name:", data.name);
          } else {
            console.warn("⚠️ useMultiTenant: Tenant não encontrado ou inativo no DB.");
            setError(`Tenant '${detectedTenantCode}' não encontrado ou inativo.`);
          }
        } catch (err: any) {
          console.error("❌ useMultiTenant: Erro inesperado ao buscar configuração do tenant:", err);
          setError(err.message);
        } finally {
          setLoading(false);
          console.log("🏁 useMultiTenant: Finalizado carregamento de tenant. Loading:", false, "Tenant Config:", tenantConfig);
        }
      } else {
        // Se não há tenant detectado, assume-se um modo padrão ou global.
        // Você pode carregar uma configuração padrão aqui ou definir como nulo/vazio.
        console.log("🔍 useMultiTenant: Nenhum tenant detectado na URL. Definindo como padrão/global.");
        setTenantConfig(null);
        setCurrentTenant(null);
        setLoading(false);
        console.log("🏁 useMultiTenant: Finalizado carregamento de tenant. Loading:", false, "Tenant Config:", null);
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