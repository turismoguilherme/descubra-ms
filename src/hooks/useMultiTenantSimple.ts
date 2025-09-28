import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useMultiTenantSimple = () => {
  const location = useLocation();
  const [currentTenant, setCurrentTenant] = useState<string | null>(null);
  const [tenantConfig, setTenantConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const detectTenant = () => {
      setLoading(true);
      
      const pathSegments = location.pathname.split('/').filter(Boolean);
      let detectedTenantCode: string | null = null;

      if (pathSegments.length > 0) {
        const possibleTenantCode = pathSegments[0];
        const knownTenants = ['ms', 'mt', 'rj', 'sp', 'pr', 'sc', 'rs', 'es', 'mg', 'ba', 'ce', 'pe', 'am', 'pa', 'df', 'go', 'to', 'ap', 'rr', 'ro', 'ac', 'ma', 'pi', 'rn', 'pb', 'se', 'al'];
        if (knownTenants.includes(possibleTenantCode.toLowerCase())) {
          detectedTenantCode = possibleTenantCode.toLowerCase();
        }
      }

      setCurrentTenant(detectedTenantCode);
      
      // Configuração simples para MS
      if (detectedTenantCode === 'ms') {
        setTenantConfig({
          code: 'MS',
          name: 'Mato Grosso do Sul',
          logo_url: '/lovable-uploads/63490622-9b5f-483c-857e-2427e85a58a3.png',
          is_active: true
        });
      }
      
      setLoading(false);
    };

    detectTenant();
  }, [location.pathname]);

  return {
    currentTenant,
    tenantConfig,
    loading,
    error
  };
};

