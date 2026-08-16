/**
 * Rotas da landing pública ViaJAR / Guatá Labs (navbar marketing + legal).
 * Exclui dashboards, login, admin e produtos paralelos (Koda, Descubra MS, etc.).
 */
export function isViajarPublicMarketingPath(pathname: string): boolean {
  const p = pathname.replace(/\\/g, '/').replace(/\/+$/, '') || '/';

  const blockedPrefixes = [
    '/viajar/admin',
    '/viajar/login',
    '/viajar/register',
    '/viajar/forgot-password',
    '/viajar/dashboard',
    '/viajar/master-dashboard',
    '/viajar/onboarding',
    '/viajar/smart-onboarding',
    '/viajar/diagnostico',
    '/viajar/inventario',
    '/viajar/relatorios',
    '/viajar/leads',
    '/viajar/setor-publico',
    '/viajar/intelligence',
    '/viajar/cat-dashboard',
    '/viajar/attendant-checkin',
    '/descubrams',
    '/partner',
    '/koda',
    '/chatguata',
    '/eventos',
    '/secretary-dashboard',
    '/attendant-dashboard',
    '/private-dashboard',
    '/unified',
    '/minhas-reservas',
    '/reservas',
  ];

  if (p === '/ms' || p.startsWith('/ms/')) return false;

  for (const prefix of blockedPrefixes) {
    if (p === prefix || p.startsWith(`${prefix}/`)) return false;
  }

  const exact = new Set([
    '/',
    '/viajar',
    '/solucoes',
    '/casos-sucesso',
    '/precos',
    '/sobre',
    '/contato',
    '/dados-turismo',
    '/viajar/privacidade',
    '/viajar/termos',
    '/viajar/cookies',
    '/viajar/pricing',
    '/documentacao',
  ]);

  return exact.has(p);
}
