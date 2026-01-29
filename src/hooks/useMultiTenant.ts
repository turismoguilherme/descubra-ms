import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import { logger } from '@/utils/logger';

export const useMultiTenant = () => {
  const location = useLocation();
  const [currentTenant, setCurrentTenant] = useState<string | null>(null);
  const [tenantConfig, setTenantConfig] = useState<any>(null); // Pode ser mais específico com um tipo
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Usar try-catch para evitar erro quando não há AuthProvider
  let userProfile = null;
  let authLoading = false;
  
  try {
    const auth = useAuth();
    userProfile = auth.userProfile;
    authLoading = auth.loading;
  } catch (error: unknown) {
    logger.dev("🔍 useMultiTenant: AuthProvider não disponível, continuando sem usuário");
  }

  useEffect(() => {
    const detectAndLoadTenant = async () => {
      if (authLoading) {
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

      if (detectedTenantCode) {
        try {
          logger.dev("🔍 useMultiTenant: Buscando tenant no Supabase com código:", detectedTenantCode.toUpperCase());
          const { data, error: dbError } = await supabase
            .from('states')
            .select('*')
            .eq('code', detectedTenantCode.toUpperCase())
            .eq('is_active', true)
            .maybeSingle();

          if (dbError) {
            logger.error("❌ useMultiTenant: Erro ao buscar configuração do tenant:", dbError);
            setError(dbError.message);
          } else if (data) {
            setTenantConfig(data);
            setCurrentTenant(detectedTenantCode);
            logger.dev("✅ useMultiTenant: Tenant configurado");
          } else {
            logger.warn("⚠️ useMultiTenant: Tenant não encontrado ou inativo no DB.");
            setError(`Tenant '${detectedTenantCode}' não encontrado ou inativo.`);
          }
        } catch (err: unknown) {
          logger.error("❌ useMultiTenant: Erro inesperado ao buscar configuração do tenant:", err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      } else {
        // Se não há tenant detectado, assume-se um modo padrão ou global.
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