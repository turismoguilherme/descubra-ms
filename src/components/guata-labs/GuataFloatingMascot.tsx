import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGuataLabsContent } from '@/hooks/useGuataLabsContent';
import { isViajarPublicMarketingPath } from '@/utils/isViajarPublicMarketingPath';
import { cn } from '@/lib/utils';

const STORAGE_MIN = 'guata_mascot_minimized';
const STORAGE_DISMISS = 'guata_mascot_panel_closed';

/**
 * Botão flutuante + balão com mensagens curtas (sem chat). Silencioso — só animação CSS.
 */
export default function GuataFloatingMascot() {
  const location = useLocation();
  const { get, imageUrl, loading } = useGuataLabsContent();
  const [minimized, setMinimized] = useState(() => sessionStorage.getItem(STORAGE_MIN) === '1');
  const [open, setOpen] = useState(() => sessionStorage.getItem(STORAGE_DISMISS) !== '1');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const show = mounted && isViajarPublicMarketingPath(location.pathname);

  const message = useMemo(() => {
    const p = location.pathname;
    if (p.startsWith('/casos-sucesso')) return get('guata_msg_floating_casos');
    if (p.startsWith('/contato')) return get('guata_msg_floating_contato');
    return get('guata_msg_floating_home');
  }, [location.pathname, get]);

  if (!show || loading) return null;

  const avatar = imageUrl('guata_mascot_floating');

  const persistMin = (v: boolean) => {
    setMinimized(v);
    sessionStorage.setItem(STORAGE_MIN, v ? '1' : '0');
  };

  const closePanel = () => {
    setOpen(false);
    sessionStorage.setItem(STORAGE_DISMISS, '1');
  };

  if (minimized) {
    return (
      <button
        type="button"
        aria-label="Abrir mensagem do Guatá"
        className="fixed bottom-5 right-5 z-[60] w-14 h-14 rounded-full border-2 border-guata-gold/60 shadow-lg overflow-hidden bg-guata-paper animate-guata-breathe focus:outline-none focus-visible:ring-2 focus-visible:ring-guata-gold"
        onClick={() => {
          persistMin(false);
          setOpen(true);
          sessionStorage.setItem(STORAGE_DISMISS, '0');
        }}
      >
        <img src={avatar} alt="" className="w-full h-full object-cover" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-2">
      {open && (
        <div
          className={cn(
            'max-w-[min(100vw-2rem,320px)] rounded-2xl border border-guata-gold/35 bg-guata-cream/98 p-4 shadow-xl',
            'text-guata-deep text-sm'
          )}
        >
          <div className="flex justify-between gap-2 mb-2">
            <span className="font-semibold text-guata-forest">Guatá</span>
            <button
              type="button"
              className="text-guata-bark/70 hover:text-guata-deep p-0.5"
              aria-label="Fechar"
              onClick={closePanel}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="leading-relaxed mb-4">{message}</p>
          <Button
            asChild
            className="w-full bg-guata-forest hover:bg-guata-deep text-guata-cream font-semibold"
          >
            <Link to="/contato" onClick={() => setOpen(false)}>
              Solicitar demonstração
            </Link>
          </Button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="text-xs text-guata-deep/80 underline-offset-2 hover:underline px-1"
          onClick={() => persistMin(true)}
        >
          Minimizar
        </button>
        <button
          type="button"
          aria-label={open ? 'Fechar balão do Guatá' : 'Abrir mensagem do Guatá'}
          className="w-16 h-16 rounded-full border-2 border-guata-gold/60 shadow-lg overflow-hidden bg-guata-paper animate-guata-breathe focus:outline-none focus-visible:ring-2 focus-visible:ring-guata-gold"
          onClick={() => setOpen((o) => !o)}
        >
          <img src={avatar} alt="" className="w-full h-full object-cover" />
        </button>
      </div>
    </div>
  );
}
