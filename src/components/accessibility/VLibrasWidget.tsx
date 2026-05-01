import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * VLibras é carregado no index.html.
 * Controla visibilidade do widget nas páginas do Descubra MS e oculta no admin.
 */
const VLibrasWidget = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    const isDescubraMS =
      path.startsWith('/descubrams') ||
      path.startsWith('/descubramatogrossodosul') ||
      path.startsWith('/ms') ||
      path === '/chatguata';

    const isAdminArea =
      path.startsWith('/viajar/admin') || path.startsWith('/admin');

    const vlibrasContainer = document.querySelector('[vw]') as HTMLElement | null;

    if (!vlibrasContainer) return;

    if (isAdminArea) {
      vlibrasContainer.style.display = 'none';
      return;
    }
    if (isDescubraMS) {
      vlibrasContainer.style.display = 'block';
      return;
    }
    vlibrasContainer.style.display = 'none';
  }, [location.pathname]);

  return null;
};

export default VLibrasWidget;
