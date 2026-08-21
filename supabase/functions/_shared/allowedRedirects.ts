/**
 * Lista única de domínios aceitos como destino de redirecionamento
 * (return_url / refresh_url do Stripe, links de retorno em geral).
 *
 * Mantida em um único lugar para não divergir da configuração de CORS.
 */
export const ALLOWED_REDIRECT_DOMAINS: string[] = [
  'localhost',
  '127.0.0.1',
  'lovable.app',
  'lovable.dev',
  'lovableproject.com',
  'vercel.app',
  'viajartur.com',
  'descubrams.com',
  'guatalabs.com',
];

function extraDomainsFromEnv(): string[] {
  const raw = Deno.env.get('ALLOWED_REDIRECT_DOMAINS')?.trim();
  if (!raw) return [];
  return raw
    .split(',')
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Valida uma URL de retorno contra a lista de domínios permitidos.
 * Aceita apenas http (localhost) e https.
 */
export function isAllowedRedirectUrl(url: unknown, supabaseUrl?: string): boolean {
  if (typeof url !== 'string' || !url.trim()) return false;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';

  if (parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && isLocal)) {
    return false;
  }

  const domains = [...ALLOWED_REDIRECT_DOMAINS, ...extraDomainsFromEnv()];

  if (supabaseUrl) {
    try {
      domains.push(new URL(supabaseUrl).hostname.toLowerCase());
    } catch {
      /* ignore */
    }
  }

  return domains.some(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
  );
}
