export interface RankingSharePayload {
  name: string;
  pos: number;
  pts: number;
  stamps: number;
  period: string;
}

export function buildRankingSharePath(payload: RankingSharePayload): string {
  const qs = new URLSearchParams({
    name: payload.name,
    pos: String(payload.pos),
    pts: String(payload.pts),
    stamps: String(payload.stamps),
    period: payload.period,
  });
  return `/descubrams/ranking/compartilhar?${qs.toString()}`;
}

/** URL curta com OG para redes (rewrite Vercel → api). */
export function buildRankingOgShareUrl(
  origin: string,
  payload: RankingSharePayload
): string {
  const qs = new URLSearchParams({
    name: payload.name,
    pos: String(payload.pos),
    pts: String(payload.pts),
    stamps: String(payload.stamps),
    period: payload.period,
  });
  return `${origin.replace(/\/$/, '')}/ranking/compartilhar?${qs.toString()}`;
}

export function rankingShareText(payload: RankingSharePayload): string {
  const place = payload.pos > 0 ? `#${payload.pos}` : 'no ranking';
  return `Estou em ${place} no Passaporte Digital do Descubra MS! ${payload.pts} pontos · ${payload.stamps} carimbos (${payload.period}).`;
}

export function parseRankingShareSearch(
  search: string
): RankingSharePayload | null {
  const params = new URLSearchParams(search.startsWith('?') ? search : `?${search}`);
  const name = params.get('name')?.trim();
  const pos = Number(params.get('pos'));
  const pts = Number(params.get('pts'));
  const stamps = Number(params.get('stamps'));
  const period = params.get('period')?.trim() || 'Ranking do mês';
  if (!name && !pos && !pts) return null;
  return {
    name: name || 'Viajante',
    pos: Number.isFinite(pos) ? pos : 0,
    pts: Number.isFinite(pts) ? pts : 0,
    stamps: Number.isFinite(stamps) ? stamps : 0,
    period,
  };
}
