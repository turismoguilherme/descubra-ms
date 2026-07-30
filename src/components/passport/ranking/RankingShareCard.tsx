import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Download, Link2, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { MyLeaderboardPosition } from '@/services/passport/leaderboardService';
import {
  buildRankingOgShareUrl,
  rankingShareText,
  type RankingSharePayload,
} from '@/utils/rankingShare';

interface RankingShareCardProps {
  displayName: string;
  avatarUrl?: string | null;
  position: MyLeaderboardPosition | null;
  periodLabel?: string;
}

const LOGO_CANDIDATES = [
  '/images/logo-descubra-ms.png',
  '/branding/descubra-ms-mark.png',
  '/images/logo-descubra-ms-v3.png',
];

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function loadFirstLogo(): Promise<HTMLImageElement | null> {
  for (const src of LOGO_CANDIDATES) {
    const img = await loadImage(src);
    if (img) return img;
  }
  return null;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export async function buildRankingStoryBlob(opts: {
  displayName: string;
  avatarUrl?: string | null;
  position: MyLeaderboardPosition;
  periodLabel: string;
}): Promise<Blob> {
  const W = 1080;
  const H = 1920;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas não disponível');

  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#0B3A7A');
  grad.addColorStop(0.55, '#0E8A8A');
  grad.addColorStop(1, '#1FA855');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.arc(120 + i * 140, 200 + (i % 3) * 500, 90 + (i % 4) * 20, 0, Math.PI * 2);
    ctx.fill();
  }

  const logo = await loadFirstLogo();
  if (logo) {
    const logoH = 110;
    const logoW = (logo.width / logo.height) * logoH;
    ctx.drawImage(logo, (W - logoW) / 2, 120, logoW, logoH);
  } else {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Descubra MS', W / 2, 180);
  }

  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.font = '600 36px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Ranking do Passaporte', W / 2, 280);
  ctx.font = '28px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fillText(opts.periodLabel, W / 2, 330);

  roundRect(ctx, 90, 420, W - 180, 980, 40);
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fill();

  const avatar = opts.avatarUrl ? await loadImage(opts.avatarUrl) : null;
  const ax = W / 2;
  const ay = 620;
  const ar = 140;
  ctx.beginPath();
  ctx.arc(ax, ay, ar + 8, 0, Math.PI * 2);
  ctx.fillStyle = '#F5C518';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(ax, ay, ar, 0, Math.PI * 2);
  ctx.fillStyle = '#0B3A7A';
  ctx.fill();
  if (avatar) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(ax, ay, ar - 4, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatar, ax - ar + 4, ay - ar + 4, (ar - 4) * 2, (ar - 4) * 2);
    ctx.restore();
  } else {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 96px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText((opts.displayName || 'V').charAt(0).toUpperCase(), ax, ay + 8);
    ctx.textBaseline = 'alphabetic';
  }

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 52px system-ui, sans-serif';
  ctx.textAlign = 'center';
  const name =
    opts.displayName.length > 28
      ? `${opts.displayName.slice(0, 26)}…`
      : opts.displayName;
  ctx.fillText(name || 'Viajante', W / 2, 860);

  ctx.font = 'bold 120px system-ui, sans-serif';
  ctx.fillStyle = '#F5C518';
  ctx.fillText(`#${opts.position.rank_position}`, W / 2, 1040);

  ctx.font = '36px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fillText(
    `${opts.position.total_points} pontos · ${opts.position.total_stamps} carimbos`,
    W / 2,
    1140
  );

  ctx.font = '28px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillText('descubrams.com.br', W / 2, 1780);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Falha ao gerar imagem'))),
      'image/png'
    );
  });
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function RankingShareCard({
  displayName,
  avatarUrl,
  position,
  periodLabel = 'Ranking do mês',
}: RankingShareCardProps) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const payload: RankingSharePayload | null = useMemo(() => {
    if (!position) return null;
    return {
      name: displayName || 'Viajante',
      pos: position.rank_position,
      pts: position.total_points,
      stamps: position.total_stamps,
      period: periodLabel,
    };
  }, [displayName, periodLabel, position]);

  const shareUrl = useMemo(() => {
    if (!payload || typeof window === 'undefined') return '';
    return buildRankingOgShareUrl(window.location.origin, payload);
  }, [payload]);

  const generate = useCallback(async () => {
    if (!position) {
      toast({
        title: 'Sem posição ainda',
        description: 'Carimbe um roteiro oficial para compartilhar seu ranking.',
        variant: 'destructive',
      });
      return null;
    }
    return buildRankingStoryBlob({
      displayName,
      avatarUrl,
      position,
      periodLabel,
    });
  }, [avatarUrl, displayName, periodLabel, position, toast]);

  const handleNativeShare = async () => {
    if (!payload) return;
    setBusy(true);
    try {
      const blob = await generate();
      if (!blob) return;
      const file = new File([blob], 'ranking-descubra-ms.png', { type: 'image/png' });
      const text = `${rankingShareText(payload)}\n${shareUrl}`;
      const canShareFiles =
        typeof navigator !== 'undefined' &&
        typeof navigator.share === 'function' &&
        (!navigator.canShare || navigator.canShare({ files: [file] }));

      if (canShareFiles) {
        await navigator.share({
          title: 'Meu ranking no Descubra MS',
          text,
          url: shareUrl,
          files: [file],
        });
        return;
      }

      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        await navigator.share({
          title: 'Meu ranking no Descubra MS',
          text,
          url: shareUrl,
        });
        return;
      }

      await navigator.clipboard.writeText(`${text}`);
      toast({
        title: 'Link copiado',
        description: 'Cole no WhatsApp, Instagram ou Facebook.',
      });
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') return;
      toast({
        title: 'Não foi possível compartilhar',
        description: err instanceof Error ? err.message : 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setBusy(false);
    }
  };

  const handleWhatsApp = () => {
    if (!payload) return;
    const text = `${rankingShareText(payload)}\n${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: 'Link copiado' });
    } catch {
      toast({
        title: 'Não foi possível copiar',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = async () => {
    setBusy(true);
    try {
      const blob = await generate();
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ranking-descubra-ms.png';
      a.click();
      URL.revokeObjectURL(url);
      toast({
        title: 'Imagem baixada',
        description: 'Poste nos Stories do Instagram ou Facebook.',
      });
    } catch (err) {
      toast({
        title: 'Erro ao gerar imagem',
        description: err instanceof Error ? err.message : 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        onClick={handleNativeShare}
        disabled={busy || !position}
        className="bg-ms-primary-blue hover:bg-ms-primary-blue/90"
      >
        <Share2 className="mr-2 h-4 w-4" />
        {busy ? 'Gerando…' : 'Compartilhar'}
      </Button>
      <Button
        type="button"
        onClick={handleWhatsApp}
        disabled={!position}
        className="bg-[#25D366] hover:bg-[#1ebe57] text-white"
      >
        <WhatsAppIcon className="mr-2 h-4 w-4" />
        WhatsApp
      </Button>
      <Button type="button" variant="outline" onClick={handleCopyLink} disabled={!position}>
        <Copy className="mr-2 h-4 w-4" />
        Copiar link
      </Button>
      <Button type="button" variant="outline" onClick={handleDownload} disabled={busy || !position}>
        <Download className="mr-2 h-4 w-4" />
        Story
      </Button>
      {shareUrl && (
        <Button type="button" variant="ghost" size="icon" asChild title="Abrir página pública">
          <a href={shareUrl} target="_blank" rel="noopener noreferrer">
            <Link2 className="h-4 w-4" />
          </a>
        </Button>
      )}
    </div>
  );
}
