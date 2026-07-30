import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { MyLeaderboardPosition } from '@/services/passport/leaderboardService';

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

export default function RankingShareCard({
  displayName,
  avatarUrl,
  position,
  periodLabel = 'Ranking do mês',
}: RankingShareCardProps) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

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

  const handleShare = async () => {
    setBusy(true);
    try {
      const blob = await generate();
      if (!blob) return;
      const file = new File([blob], 'ranking-descubra-ms.png', { type: 'image/png' });
      const canShareFiles =
        typeof navigator !== 'undefined' &&
        typeof navigator.share === 'function' &&
        (!navigator.canShare || navigator.canShare({ files: [file] }));

      if (canShareFiles) {
        await navigator.share({
          title: 'Meu ranking no Descubra MS',
          text: `Estou em #${position?.rank_position} no Passaporte Digital!`,
          files: [file],
        });
        return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ranking-descubra-ms.png';
      a.click();
      URL.revokeObjectURL(url);
      toast({
        title: 'Imagem baixada',
        description: 'Compartilhe o arquivo nas suas redes.',
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
        onClick={handleShare}
        disabled={busy || !position}
        className="bg-ms-primary-blue hover:bg-ms-primary-blue/90"
      >
        <Share2 className="mr-2 h-4 w-4" />
        {busy ? 'Gerando…' : 'Compartilhar'}
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={handleDownload}
        disabled={busy || !position}
      >
        <Download className="mr-2 h-4 w-4" />
        Baixar story
      </Button>
    </div>
  );
}
