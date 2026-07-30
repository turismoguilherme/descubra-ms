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

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] || '';
  return value || '';
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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
  <p>Redirecionando para o ranking… <a href="${appUrl}">Clique aqui</a> se não for redirecionado.</p>
  <script>window.location.replace(${JSON.stringify(options.appUrl)});</script>
</body>
</html>`;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const name = first(req.query.name) || 'Viajante';
  const pos = Number(first(req.query.pos)) || 0;
  const pts = Number(first(req.query.pts)) || 0;
  const stamps = Number(first(req.query.stamps)) || 0;
  const period = first(req.query.period) || 'Ranking do mês';

  const qs = new URLSearchParams({
    name,
    pos: String(pos),
    pts: String(pts),
    stamps: String(stamps),
    period,
  });

  const pageUrl = `${SITE_ORIGIN}/ranking/compartilhar?${qs.toString()}`;
  const appUrl = `${SITE_ORIGIN}/descubrams/ranking/compartilhar?${qs.toString()}`;
  const title =
    pos > 0
      ? `${name} está em #${pos} no Passaporte Digital`
      : `${name} no Passaporte Digital — Descubra MS`;
  const description = `${period}: ${pts} pontos · ${stamps} carimbos. Explore Mato Grosso do Sul com o Descubra MS.`;

  res.status(200);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  res.send(
    buildOgHtml({
      title,
      description,
      ogImage: DEFAULT_OG_IMAGE,
      pageUrl,
      appUrl,
    })
  );
}
