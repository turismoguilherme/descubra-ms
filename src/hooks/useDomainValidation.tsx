import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export interface DomainConfig {
  domain: string;
  isMS: boolean;
  expectedRoutes: string[];
  redirectRoute: string;
}

export const DOMAIN_CONFIGS: Record<string, DomainConfig> = {
  'descubrams.com': {
    domain: 'descubrams.com',
    isMS: true,
    expectedRoutes: ['/descubrams'],
    redirectRoute: '/descubrams'
  },
  'viajartur.com': {
    domain: 'viajartur.com',
    isMS: false,
    expectedRoutes: ['/'],
    redirectRoute: '/'
  },
  'localhost': {
    domain: 'localhost',
    isMS: false, // Em desenvolvimento, usar Viajartur por padrão
    expectedRoutes: ['/', '/descubrams'],
    redirectRoute: '/'
  }
};

export const useDomainValidation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentDomain, setCurrentDomain] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const domain = hostname === 'localhost' ? 'localhost' : hostname;
      setCurrentDomain(domain);

      const config = DOMAIN_CONFIGS[domain] || DOMAIN_CONFIGS['viajartur.com'];

      // Verificar se a rota atual está correta para o domínio
      const isRouteValid = config.expectedRoutes.some(route =>
        location.pathname.startsWith(route) ||
        location.pathname === '/' ||
        location.pathname === ''
      );

      setIsValid(isRouteValid);

      // Se a rota não for válida, redirecionar
      if (!isRouteValid) {
        const redirectPath = location.pathname === '/' || location.pathname === ''
          ? config.redirectRoute
          : `${config.redirectRoute}${location.pathname}`;

        console.log(`🔄 [DomainValidation] Redirecionando ${location.pathname} -> ${redirectPath} (domínio: ${domain})`);
        navigate(redirectPath, { replace: true });
      }
    }
  }, [location.pathname, navigate]);

  const config = DOMAIN_CONFIGS[currentDomain] || DOMAIN_CONFIGS['viajartur.com'];

  return {
    currentDomain,
    isMS: config.isMS,
    isValid,
    config,
    shouldShowMSContent: config.isMS,
    shouldShowViajarContent: !config.isMS
  };
};

export default useDomainValidation;
