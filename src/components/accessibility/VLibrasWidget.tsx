import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * VLibras Widget - Controle de Visibilidade
 * 
 * O VLibras é carregado globalmente no index.html.
 * Este componente controla a visibilidade do widget apenas nas páginas do Descubra MS.
 */
const VLibrasWidget = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Verificar se estamos em uma página do Descubra MS
    const isDescubraMS = location.pathname.startsWith('/descubrams') || 
                         location.pathname.startsWith('/ms') ||
                         location.pathname === '/chatguata';
    
    // Ocultar VLibras na área admin
    const isAdminArea = location.pathname.startsWith('/viajar/admin') || 
                        location.pathname.startsWith('/admin');
    
    // Encontrar o container do VLibras
    const vlibrasContainer = document.querySelector('[vw]') as HTMLElement;
    
    if (vlibrasContainer) {
      if (isAdminArea) {
        // Esconder VLibras na área admin
        vlibrasContainer.style.display = 'none';
        console.log('🔵 VLibras oculto - Área Admin');
      } else if (isDescubraMS) {
        // Mostrar VLibras nas páginas do Descubra MS
        vlibrasContainer.style.display = 'block';
        console.log('✅ VLibras visível - Descubra MS');
      } else {
        // Esconder VLibras em outras páginas
        vlibrasContainer.style.display = 'none';
        console.log('🔵 VLibras oculto - Página fora do Descubra MS');
      }
    }
  }, [location.pathname]);

  return null;
};

export default VLibrasWidget;
