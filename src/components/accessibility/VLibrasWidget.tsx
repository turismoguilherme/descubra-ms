import { useEffect } from 'react';

interface VLibrasWidgetProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme?: 'light' | 'dark';
  autoStart?: boolean;
  avatarConfig?: {
    gender?: 'male' | 'female';
    skinTone?: 'light' | 'medium' | 'dark';
    clothing?: 'casual' | 'formal' | 'regional';
    age?: 'young' | 'adult' | 'senior';
  };
}

const VLibrasWidget: React.FC<VLibrasWidgetProps> = ({
  position = 'bottom-right',
  theme = 'light',
  autoStart = false,
  avatarConfig
}) => {
  useEffect(() => {
    // Verificar se o VLibras já foi carregado
    if (window.VLibras) {
      console.log('🎯 VLibras já carregado');
      return;
    }

    // Carregar o script do VLibras
    const script = document.createElement('script');
    script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
    script.async = true;
    script.onload = () => {
      console.log('✅ VLibras carregado com sucesso');
      
      // Inicializar o widget
      if (window.VLibras) {
        new window.VLibras.Widget('https://vlibras.gov.br/app');
        
        // Configurar avatar personalizado se disponível
        if (avatarConfig) {
          configureAvatar(avatarConfig);
        }
        
        // Configurações adicionais
        if (autoStart) {
          // Auto-iniciar se configurado
          setTimeout(() => {
            const accessButton = document.querySelector('[vw-access-button]') as HTMLElement;
            if (accessButton) {
              accessButton.click();
            }
          }, 1000);
        }
      }
    };
    
    script.onerror = () => {
      console.error('❌ Erro ao carregar VLibras');
    };

    document.head.appendChild(script);

    // Cleanup
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [autoStart, avatarConfig]);

  // Configurar avatar personalizado
  const configureAvatar = (config: NonNullable<typeof avatarConfig>) => {
    try {
      // Aguardar o widget carregar completamente
      setTimeout(() => {
        const avatarContainer = document.querySelector('[vw-avatar]') as HTMLElement;
        if (avatarContainer) {
          console.log('🎭 VLibras: Configurando avatar personalizado:', config);
          
          // Aplicar configurações de avatar
          if (config.gender) {
            avatarContainer.setAttribute('data-gender', config.gender);
          }
          
          if (config.skinTone) {
            avatarContainer.setAttribute('data-skin-tone', config.skinTone);
          }
          
          if (config.clothing) {
            avatarContainer.setAttribute('data-clothing', config.clothing);
          }
          
          if (config.age) {
            avatarContainer.setAttribute('data-age', config.age);
          }
        }
      }, 2000);
    } catch (error) {
      console.error('❌ Erro ao configurar avatar:', error);
    }
  };

  // Estilos baseados na posição
  const getPositionStyles = () => {
    switch (position) {
      case 'bottom-left':
        return { bottom: '20px', left: '20px' };
      case 'top-right':
        return { top: '20px', right: '20px' };
      case 'top-left':
        return { top: '20px', left: '20px' };
      default: // bottom-right
        return { bottom: '20px', right: '20px' };
    }
  };

  return (
    <>
      {/* Widget VLibras padrão do governo */}
      <div 
        data-vw="true" 
        className="enabled"
        style={{
          position: 'fixed',
          zIndex: 9999,
          ...getPositionStyles()
        }}
        data-avatar-config={JSON.stringify(avatarConfig)}
      >
        <div vw-access-button="true" className="active"></div>
        <div vw-plugin-wrapper="true">
          <div className="vw-plugin-top-wrapper"></div>
        </div>
      </div>

      {/* Estilos customizados para melhor integração */}
      <style>{`
        [vw-access-button] {
          background-color: #0066cc !important;
          border-radius: 50% !important;
          box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3) !important;
          transition: all 0.3s ease !important;
        }
        
        [vw-access-button]:hover {
          transform: scale(1.1) !important;
          box-shadow: 0 6px 16px rgba(0, 102, 204, 0.4) !important;
        }
        
        .vw-plugin-top-wrapper {
          border-radius: 12px !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
        }

        /* Estilos para avatar personalizado */
        [vw-avatar] {
          transition: all 0.3s ease !important;
        }

        [vw-avatar][data-gender="female"] {
          /* Estilos específicos para avatar feminino */
        }

        [vw-avatar][data-gender="male"] {
          /* Estilos específicos para avatar masculino */
        }

        [vw-avatar][data-skin-tone="dark"] {
          /* Estilos para tom de pele escuro */
        }

        [vw-avatar][data-clothing="regional"] {
          /* Estilos para roupas regionais */
        }

        [vw-avatar][data-age="senior"] {
          /* Estilos para avatar idoso */
        }
      `}</style>
    </>
  );
};

export default VLibrasWidget; 