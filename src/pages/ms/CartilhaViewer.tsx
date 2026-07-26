import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, Cloud, ExternalLink, Loader2, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  fetchPublicCartilhas,
  fetchCartilhaProgress,
  upsertCartilhaProgress,
} from '@/services/cartilhasService';
import type { CartilhaItem } from '@/data/cartilhasCatalog';
import { isNativeApp } from '@/native/capacitorBridge';

/** Garante URL same-origin para o iframe (evita bloqueio de frame). */
function resolveCartilhaEmbedSrc(htmlPath?: string | null): string {
  if (!htmlPath) return '';
  try {
    if (htmlPath.startsWith('http://') || htmlPath.startsWith('https://')) {
      const url = new URL(htmlPath);
      if (typeof window !== 'undefined' && url.origin === window.location.origin) {
        return `${url.pathname}${url.search}${url.hash}`;
      }
      return htmlPath;
    }
  } catch {
    /* ignore */
  }
  return htmlPath.startsWith('/') ? htmlPath : `/${htmlPath}`;
}

const CartilhaViewer = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [cartilha, setCartilha] = useState<CartilhaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [cloudStatus, setCloudStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const native = useMemo(() => isNativeApp(), []);

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

      // Abrir links das aulas: dentro do app o target="_blank" do iframe é bloqueado
      if (msg.type === 'guata-cartilha-open-link' && typeof msg.url === 'string') {
        const url: string = msg.url;
        if (!/^https?:\/\//i.test(url)) return;
        try {
          if (native) {
            const { Browser } = await import('@capacitor/browser');
            await Browser.open({ url });
          } else {
            window.open(url, '_blank', 'noopener,noreferrer');
          }
        } catch {
          window.open(url, '_blank', 'noopener,noreferrer');
        }
        return;
      }

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
  }, [cartilha?.id, user, native]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-[#0B3D2E] text-white px-6">
        <img
          src="/images/logo-descubra-ms.png"
          alt=""
          className="w-40 max-w-[55vw] h-auto md:w-24"
        />
        <Loader2 className="w-7 h-7 animate-spin text-white/90" />
        <p className="text-sm text-white/80">Abrindo cartilha…</p>
      </div>
    );
  }

  if (!cartilha || cartilha.status !== 'available' || !cartilha.htmlPath) {
    return <Navigate to="/descubrams/cartilhas" replace />;
  }

  const embedSrc = resolveCartilhaEmbedSrc(cartilha.htmlPath);

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col bg-slate-950"
      style={{
        paddingTop: native ? 'env(safe-area-inset-top)' : undefined,
        paddingBottom: native ? 'env(safe-area-inset-bottom)' : undefined,
      }}
    >
      <header className="flex items-center justify-between gap-2 px-2.5 py-2 sm:px-4 sm:py-3 border-b border-slate-800 bg-slate-900 text-white shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            to="/descubrams/cartilhas"
            className="inline-flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2 py-1.5 text-xs font-semibold transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden xs:inline sm:inline">Voltar</span>
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="font-semibold text-xs sm:text-sm truncate">{cartilha.title}</h1>
            <p className="hidden sm:block text-[11px] text-slate-400 truncate">
              {user
                ? cloudStatus === 'saving'
                  ? 'Salvando progresso…'
                  : cloudStatus === 'saved'
                    ? 'Progresso salvo'
                    : cloudStatus === 'error'
                      ? 'Falha ao salvar (mantido neste aparelho)'
                      : 'Progresso na sua conta'
                : 'Leitura livre · entre para salvar progresso'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!user ? (
            <Link
              to={`/descubrams/login?redirect=${encodeURIComponent(`/descubrams/cartilhas/${cartilha.slug}`)}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 px-2 py-1.5 text-[11px] sm:text-xs font-bold transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="sm:hidden">Entrar</span>
              <span className="hidden sm:inline">Entrar para salvar</span>
            </Link>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-emerald-300 font-semibold px-2">
              <Cloud className="w-3.5 h-3.5" />
              Conta conectada
            </span>
          )}
          {/* Nova aba só no desktop do site — no celular/app a leitura fica in-app */}
          {!native && (
            <a
              href={embedSrc || cartilha.htmlPath}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-xs font-bold transition-colors"
            >
              Nova aba
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </header>

      <iframe
        ref={iframeRef}
        src={embedSrc}
        title={cartilha.title}
        className="flex-1 w-full border-0 bg-slate-950 min-h-0"
        allow="fullscreen"
      />
    </div>
  );
};

export default CartilhaViewer;
