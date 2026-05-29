type VercelRequest = {
  query: Record<string, string | string[] | undefined>;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  setHeader: (name: string, value: string) => VercelResponse;
  send: (body: string) => void;
};

const SITE_ORIGIN = (process.env.SITE_ORIGIN || 'https://descubrams.com').replace(/\/$/, '');
const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/branding/descubra-ms-mark.png`;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;

interface PublicEventRow {
  id: string;
  titulo?: string | null;
  descricao?: string | null;
  local?: string | null;
  data_inicio?: string | null;
  imagem_principal?: string | null;
  logo_evento?: string | null;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDateShort(iso?: string | null): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

function resolveOgImage(row: PublicEventRow): string {
  const candidate = (row.logo_evento || row.imagem_principal || '').trim();
  if (candidate.startsWith('http://') || candidate.startsWith('https://')) {
    return candidate;
  }
  return DEFAULT_OG_IMAGE;
}

function buildOgHtml(options: {
  title: string;
  description: string;
  ogImage: string;
  pageUrl: string;
  appUrl: string;
}): string {
  const title = escapeHtml(options.title);
  const description = escapeHtml(options.description);
  const ogImage = escapeHtml(options.ogImage);
  const pageUrl = escapeHtml(options.pageUrl);
  const appUrl = escapeHtml(options.appUrl);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} | Descubra MS</title>
  <meta name="description" content="${description}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Descubra Mato Grosso do Sul" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:url" content="${pageUrl}" />
  <meta property="og:locale" content="pt_BR" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${ogImage}" />
  <link rel="canonical" href="${pageUrl}" />
  <meta http-equiv="refresh" content="0;url=${appUrl}" />
</head>
<body>
  <p>Redirecionando para o evento… <a href="${appUrl}">Clique aqui</a> se não for redirecionado.</p>
  <script>window.location.replace(${JSON.stringify(options.appUrl)});</script>
</body>
</html>`;
}

async function fetchPublicEvent(id: string): Promise<PublicEventRow | null> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;

  const select =
    'id,titulo,descricao,local,data_inicio,imagem_principal,logo_evento';
  const restUrl = `${SUPABASE_URL}/rest/v1/events_public?id=eq.${encodeURIComponent(id)}&select=${select}&limit=1`;

  const response = await fetch(restUrl, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });

  if (!response.ok) return null;
  const rows = (await response.json()) as PublicEventRow[];
  return rows?.[0] ?? null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const rawId = req.query.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const fallbackApp = `${SITE_ORIGIN}/descubrams/eventos`;

  if (!id) {
    res.status(400).setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(
      buildOgHtml({
        title: 'Eventos',
        description: 'Calendário de eventos no Descubra Mato Grosso do Sul',
        ogImage: DEFAULT_OG_IMAGE,
        pageUrl: `${SITE_ORIGIN}/evento`,
        appUrl: fallbackApp,
      })
    );
    return;
  }

  try {
    const row = await fetchPublicEvent(id);
    const appUrl = `${SITE_ORIGIN}/descubrams/eventos?evento=${encodeURIComponent(id)}`;
    const pageUrl = `${SITE_ORIGIN}/evento/${encodeURIComponent(id)}`;

    if (!row) {
      res.status(404).setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(
        buildOgHtml({
          title: 'Evento não encontrado',
          description: 'Este evento não está disponível no Descubra MS.',
          ogImage: DEFAULT_OG_IMAGE,
          pageUrl,
          appUrl: fallbackApp,
        })
      );
      return;
    }

    const title = row.titulo?.trim() || 'Evento';
    const datePart = formatDateShort(row.data_inicio);
    const locationPart = row.local?.trim() || '';
    const meta = [datePart, locationPart].filter(Boolean).join(' · ');
    const description =
      row.descricao?.trim()?.slice(0, 160) ||
      (meta ? `${title} — ${meta}` : `Confira ${title} no Descubra MS`);

    res.status(200);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.send(
      buildOgHtml({
        title,
        description,
        ogImage: resolveOgImage(row),
        pageUrl,
        appUrl,
      })
    );
  } catch {
    res.status(500).setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(
      buildOgHtml({
        title: 'Descubra MS',
        description: 'Eventos em Mato Grosso do Sul',
        ogImage: DEFAULT_OG_IMAGE,
        pageUrl: `${SITE_ORIGIN}/evento/${encodeURIComponent(id)}`,
        appUrl: fallbackApp,
      })
    );
  }
}
