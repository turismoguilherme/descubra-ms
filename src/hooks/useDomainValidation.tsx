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
    isMS: false, // Em desenvolvimento, mostrar tudo por padrão
    expectedRoutes: ['/', '/descubrams'],
    redirectRoute: '/'
  }
};

export const useDomainValidation = () => {
  const [currentDomain, setCurrentDomain] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const domain = hostname === 'localhost' ? 'localhost' : hostname;
      setCurrentDomain(domain);

      // Em produção, o redirecionamento é feito pelo vercel.json
      // Aqui apenas detectamos o domínio para renderização condicional
      setIsValid(true);
    }
  }, []);

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
