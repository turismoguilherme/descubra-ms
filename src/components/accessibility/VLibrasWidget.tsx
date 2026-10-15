import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MS_PREFIX } from '@/lib/brandRoutes';

/** Rotas públicas do Descubra MS (sem admin Guatá Labs). */
function shouldEnableVLibras(pathname: string): boolean {
  const p = pathname.toLowerCase();
  const isMsPath =
    p === MS_PREFIX ||
    p.startsWith(`${MS_PREFIX}/`) ||
    p.startsWith('/descubramatogrossodosul') ||
    p === '/ms' ||
    p.startsWith('/ms/');
  if (!isMsPath) return false;
  if (p.includes('/admin')) return false;
  return true;
}

let loadPromise: Promise<void> | null = null;

function ensureVlibrasDom(): HTMLElement {
  let root = document.querySelector('[vw]') as HTMLElement | null;
  if (root) return root;

  root = document.createElement('div');
  root.setAttribute('vw', '');
  root.className = 'enabled';
  root.style.display = 'none';
  root.innerHTML = `
    <div vw-access-button class="active"></div>
    <div vw-plugin-wrapper>
      <div class="vw-plugin-top-wrapper"></div>
    </div>
  `;
  document.body.appendChild(root);
  return root;
}

function setVlibrasVisible(visible: boolean) {
  document.querySelectorAll('[vw]').forEach((el) => {
    (el as HTMLElement).style.display = visible ? 'block' : 'none';
  });
}

function loadVLibrasPlugin(): Promise<void> {
  const w = window as Window & { VLibras?: { Widget: new (url: string) => void } };
  if (w.VLibras?.Widget) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    ensureVlibrasDom();
    const existing = document.querySelector('script[data-vlibras-plugin="1"]');
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
    script.async = true;
    script.dataset.vlibrasPlugin = '1';
    script.onload = () => {
      try {
        if (w.VLibras?.Widget) {
          new w.VLibras.Widget('https://vlibras.gov.br/app');
        }
        resolve();
      } catch (e) {
        reject(e);
      }
    };
    script.onerror = () => reject(new Error('Falha ao carregar VLibras'));
    document.body.appendChild(script);
  });

  return loadPromise;
}

/**
 * VLibras apenas no site público Descubra MS (/descubrams/*).
 * Não carrega no Guatá Labs, admin nem rotas legadas fora do prefixo MS.
 */
const VLibrasWidget = () => {
  const location = useLocation();

  useEffect(() => {
    const enabled = shouldEnableVLibras(location.pathname);

    if (!enabled) {
      setVlibrasVisible(false);
      return;
    }

    let cancelled = false;
    loadVLibrasPlugin()
      .then(() => {
        if (!cancelled) setVlibrasVisible(true);
      })
      .catch(() => {
        setVlibrasVisible(false);
      });

    return () => {
      cancelled = true;
      setVlibrasVisible(false);
    };
  }, [location.pathname]);

  return null;
};

export default VLibrasWidget;
