import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, Cloud, ExternalLink, Loader2, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  fetchPublicCartilhas,
  fetchCartilhaProgress,
  upsertCartilhaProgress,
} from '@/services/cartilhasService';
import type { CartilhaItem } from '@/data/cartilhasCatalog';

const CartilhaViewer = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [cartilha, setCartilha] = useState<CartilhaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [cloudStatus, setCloudStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const items = await fetchPublicCartilhas();
      if (cancelled) return;
      const found = items.find((c) => c.slug === slug) || null;
      setCartilha(found);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    const onMessage = async (event: MessageEvent) => {
      const msg = event.data;
      if (!msg || typeof msg !== 'object') return;
      if (!cartilha?.id) return;

      if (msg.type === 'guata-cartilha-progress-request') {
        if (!user) return;
        try {
          const cloud = await fetchCartilhaProgress(cartilha.id, user.id);
          iframeRef.current?.contentWindow?.postMessage(
            { type: 'guata-cartilha-progress-hydrate', payload: cloud },
            '*'
          );
        } catch (e) {
          console.error('Erro ao hidratar progresso:', e);
        }
        return;
      }

      if (msg.type === 'guata-cartilha-progress') {
        if (!user) {
          setCloudStatus('idle');
          return;
        }
        setCloudStatus('saving');
        try {
          await upsertCartilhaProgress(cartilha.id, user.id, msg.payload);
          setCloudStatus('saved');
        } catch (e) {
          console.error('Erro ao salvar progresso:', e);
          setCloudStatus('error');
        }
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [cartilha?.id, user]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950 text-white">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!cartilha || cartilha.status !== 'available' || !cartilha.htmlPath) {
    return <Navigate to="/descubrams/cartilhas" replace />;
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-slate-950">
      <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-800 bg-slate-900 text-white shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/descubrams/cartilhas"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-2 text-xs font-semibold transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
          <div className="min-w-0">
            <h1 className="font-semibold text-sm truncate">{cartilha.title}</h1>
            <p className="text-[11px] text-slate-400 truncate">
              {user
                ? cloudStatus === 'saving'
                  ? 'Salvando progresso na nuvem…'
                  : cloudStatus === 'saved'
                    ? 'Progresso salvo na sua conta'
                    : cloudStatus === 'error'
                      ? 'Falha ao salvar na nuvem (mantido neste aparelho)'
                      : 'Progresso sincroniza com sua conta'
                : 'Leitura livre · faça login para salvar progresso na nuvem'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!user ? (
            <Link
              to={`/descubrams/login?redirect=${encodeURIComponent(`/descubrams/cartilhas/${cartilha.slug}`)}`}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 px-3 py-2 text-xs font-bold transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              Entrar para salvar
            </Link>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-emerald-300 font-semibold px-2">
              <Cloud className="w-3.5 h-3.5" />
              Conta conectada
            </span>
          )}
          <a
            href={cartilha.htmlPath}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-xs font-bold transition-colors"
          >
            Nova aba
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      <iframe
        ref={iframeRef}
        src={cartilha.htmlPath}
        title={cartilha.title}
        className="flex-1 w-full border-0 bg-slate-950"
        allow="fullscreen"
      />
    </div>
  );
};

export default CartilhaViewer;
