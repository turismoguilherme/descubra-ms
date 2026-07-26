import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, Cloud, ExternalLink, Loader2, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  fetchPublicCartilhas,
  fetchCartilhaProgress,
  upsertCartilhaProgress,
  updateCartilhaContentData,
  uploadCartilhaAsset,
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

function dataUrlToBlob(dataUrl: string): { blob: Blob; filename: string } | null {
  const match = /^data:([^;]+);base64,(.+)$/i.exec(dataUrl);
  if (!match) return null;
  const mime = match[1] || 'image/png';
  const bin = atob(match[2]);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const ext = mime.includes('jpeg') ? 'jpg' : mime.includes('webp') ? 'webp' : 'png';
  return { blob: new Blob([bytes], { type: mime }), filename: `mascot.${ext}` };
}

const ADMIN_ROLES = new Set(['admin', 'tech', 'master_admin', 'diretor_estadual']);

const CartilhaViewer = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user, userProfile } = useAuth();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [cartilha, setCartilha] = useState<CartilhaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [cloudStatus, setCloudStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const native = useMemo(() => isNativeApp(), []);
  const isCloudAdmin = ADMIN_ROLES.has(userProfile?.role || '');

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

  const pushContentHydrate = (payload: Record<string, unknown> | null | undefined) => {
    if (!payload || Object.keys(payload).length === 0) {
      console.log('[CartilhaViewer] hydrate skip: empty payload');
      return;
    }
    // Ignore snapshots vazios/corrompidos (ex.: {"qr":{"qr-ms":""}})
    const texts = payload.texts && typeof payload.texts === 'object' ? Object.keys(payload.texts as object).length : 0;
    const mascots =
      payload.mascots && typeof payload.mascots === 'object'
        ? Object.values(payload.mascots as Record<string, unknown>).some((u) => typeof u === 'string' && u.trim())
        : false;
    const partners = Array.isArray(payload.partners) && payload.partners.length > 0;
    const qr =
      payload.qr && typeof payload.qr === 'object'
        ? Object.values(payload.qr as Record<string, unknown>).some((u) => typeof u === 'string' && u.trim())
        : false;
    if (!texts && !mascots && !partners && !qr) {
      console.log('[CartilhaViewer] hydrate skip: not meaningful', payload);
      return;
    }
    console.log('[CartilhaViewer] hydrate push', { texts, mascots, partners, qr });
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'guata-cartilha-content-hydrate', payload },
      '*'
    );
  };

  useEffect(() => {
    const onMessage = async (event: MessageEvent) => {
      const msg = event.data;
      if (!msg || typeof msg !== 'object') return;

      if (msg.type === 'guata-cartilha-open-link' && typeof msg.url === 'string') {
        const url: string = msg.url;
        if (!/^https?:\/\//i.test(url)) return;
        try {
          if (native) {
            const { Browser } = await import(/* @vite-ignore */ '@capacitor/browser');
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

      if (msg.type === 'guata-cartilha-content-request') {
        pushContentHydrate(cartilha.contentData || null);
        iframeRef.current?.contentWindow?.postMessage(
          {
            type: 'guata-cartilha-content-auth',
            canSaveCloud: !!(user && isCloudAdmin),
          },
          '*'
        );
        return;
      }

      if (msg.type === 'guata-cartilha-content-save') {
        if (!user || !isCloudAdmin) {
          iframeRef.current?.contentWindow?.postMessage(
            {
              type: 'guata-cartilha-content-save-result',
              ok: false,
              error: 'Faça login como administrador no Descubra MS para salvar na nuvem.',
            },
            '*'
          );
          return;
        }
        setCloudStatus('saving');
        try {
          const payload =
            msg.payload && typeof msg.payload === 'object'
              ? (msg.payload as Record<string, unknown>)
              : {};
          await updateCartilhaContentData(cartilha.id, payload);
          setCartilha((prev) => (prev ? { ...prev, contentData: payload } : prev));
          setCloudStatus('saved');
          iframeRef.current?.contentWindow?.postMessage(
            { type: 'guata-cartilha-content-save-result', ok: true },
            '*'
          );
        } catch (e) {
          console.error('Erro ao salvar conteúdo da cartilha:', e);
          setCloudStatus('error');
          iframeRef.current?.contentWindow?.postMessage(
            {
              type: 'guata-cartilha-content-save-result',
              ok: false,
              error: e instanceof Error ? e.message : 'Falha ao salvar',
            },
            '*'
          );
        }
        return;
      }

      if (msg.type === 'guata-cartilha-upload-image' && typeof msg.dataUrl === 'string') {
        if (!user || !isCloudAdmin) {
          iframeRef.current?.contentWindow?.postMessage(
            {
              type: 'guata-cartilha-upload-result',
              requestId: msg.requestId,
              ok: false,
              error: 'Login admin necessário para enviar imagem.',
            },
            '*'
          );
          return;
        }
        try {
          const parsed = dataUrlToBlob(msg.dataUrl);
          if (!parsed) throw new Error('Imagem inválida');
          const publicUrl = await uploadCartilhaAsset(parsed.blob, parsed.filename);
          iframeRef.current?.contentWindow?.postMessage(
            {
              type: 'guata-cartilha-upload-result',
              requestId: msg.requestId,
              ok: true,
              url: publicUrl,
              targetId: msg.targetId,
            },
            '*'
          );
        } catch (e) {
          iframeRef.current?.contentWindow?.postMessage(
            {
              type: 'guata-cartilha-upload-result',
              requestId: msg.requestId,
              ok: false,
              error: e instanceof Error ? e.message : 'Upload falhou',
            },
            '*'
          );
        }
        return;
      }

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
  }, [cartilha?.id, cartilha?.contentData, user, isCloudAdmin, native]);

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
                  ? 'Salvando…'
                  : cloudStatus === 'saved'
                    ? 'Salvo na nuvem'
                    : cloudStatus === 'error'
                      ? 'Falha ao salvar (mantido neste aparelho)'
                      : isCloudAdmin
                        ? 'Admin · edições salvam na nuvem'
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
        onLoad={() => pushContentHydrate(cartilha.contentData || null)}
      />
    </div>
  );
};

export default CartilhaViewer;
