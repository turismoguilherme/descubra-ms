import { useEffect, useState, useCallback } from 'react';

interface VLibrasConfig {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme?: 'light' | 'dark';
  autoStart?: boolean;
  enableNotifications?: boolean;
}

interface VLibrasState {
  isLoaded: boolean;
  isActive: boolean;
  isTranslating: boolean;
  error: string | null;
}

export const useVLibras = (config: VLibrasConfig = {}) => {
  const [state, setState] = useState<VLibrasState>({
    isLoaded: false,
    isActive: false,
    isTranslating: false,
    error: null
  });

  const {
    position = 'bottom-right',
    theme = 'light',
    autoStart = false,
    enableNotifications = true
  } = config;

  // Carregar o VLibras
  const loadVLibras = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null }));

      // Verificar se já está carregado
      if (window.VLibras) {
        setState(prev => ({ ...prev, isLoaded: true }));
        return;
      }

      // Carregar o script
      const script = document.createElement('script');
      script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
      script.async = true;

      script.onload = () => {
        console.log('✅ VLibras carregado com sucesso');
        setState(prev => ({ ...prev, isLoaded: true }));

        // Inicializar widget
        if (window.VLibras) {
          new window.VLibras.Widget('https://vlibras.gov.br/app');
          
          // Auto-iniciar se configurado
          if (autoStart) {
            setTimeout(() => {
              activateVLibras();
            }, 1000);
          }

          // Notificação de sucesso
          if (enableNotifications) {
            console.log('🎯 VLibras ativo e pronto para uso');
          }
        }
      };

      script.onerror = () => {
        const error = 'Erro ao carregar VLibras';
        console.error('❌', error);
        setState(prev => ({ ...prev, error }));
      };

      document.head.appendChild(script);
    } catch (error) {
      const errorMessage = 'Erro inesperado ao carregar VLibras';
      console.error('❌', errorMessage, error);
      setState(prev => ({ ...prev, error: errorMessage }));
    }
  }, [autoStart, enableNotifications]);

  // Ativar VLibras
  const activateVLibras = useCallback(() => {
    try {
      const accessButton = document.querySelector('[vw-access-button]') as HTMLElement;
      if (accessButton) {
        accessButton.click();
        setState(prev => ({ ...prev, isActive: true }));
        console.log('🎯 VLibras ativado');
      }
    } catch (error) {
      console.error('❌ Erro ao ativar VLibras:', error);
    }
  }, []);

  // Desativar VLibras
  const deactivateVLibras = useCallback(() => {
    try {
      const closeButton = document.querySelector('[vw-close-button]') as HTMLElement;
      if (closeButton) {
        closeButton.click();
        setState(prev => ({ ...prev, isActive: false }));
        console.log('🎯 VLibras desativado');
      }
    } catch (error) {
      console.error('❌ Erro ao desativar VLibras:', error);
    }
  }, []);

  // Traduzir texto específico
  const translateText = useCallback((text: string) => {
    try {
      setState(prev => ({ ...prev, isTranslating: true }));
      
      // Simular tradução (o VLibras faz isso automaticamente)
      console.log('📝 Traduzindo texto:', text);
      
      // Ativar VLibras se não estiver ativo
      if (!state.isActive) {
        activateVLibras();
      }
      
      setTimeout(() => {
        setState(prev => ({ ...prev, isTranslating: false }));
      }, 2000);
    } catch (error) {
      console.error('❌ Erro ao traduzir texto:', error);
      setState(prev => ({ ...prev, isTranslating: false }));
    }
  }, [state.isActive, activateVLibras]);

  // Carregar VLibras na montagem do componente
  useEffect(() => {
    loadVLibras();
  }, [loadVLibras]);

  // Configurar tema
  useEffect(() => {
    if (state.isLoaded) {
      const widget = document.querySelector('[vw-plugin-wrapper]') as HTMLElement;
      if (widget) {
        widget.setAttribute('data-theme', theme);
      }
    }
  }, [state.isLoaded, theme]);

  return {
    ...state,
    loadVLibras,
    activateVLibras,
    deactivateVLibras,
    translateText
  };
};

// Declaração global para TypeScript
declare global {
  interface Window {
    VLibras: {
      Widget: new (url: string) => any;
    };
  }
} 