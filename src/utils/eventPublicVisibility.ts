/**
 * Regras de exibição pública de eventos (Descubra MS).
 * "Ainda ativo" = agora (instante UTC) ainda não passou do fim do evento,
 * interpretando data+hora no fuso America/Campo_Grande.
 */

export const MS_EVENTS_TIMEZONE = 'America/Campo_Grande';

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

type Wall = { y: number; mo: number; da: number; h: number; mi: number; se: number };

function utcMsToWall(t: number, tz: string): Wall {
  const f = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const parts = f.formatToParts(new Date(t));
  const map: Record<string, number> = {};
  for (const p of parts) {
    if (p.type !== 'literal') map[p.type] = parseInt(p.value, 10);
  }
  return {
    y: map.year,
    mo: map.month,
    da: map.day,
    h: map.hour,
    mi: map.minute,
    se: map.second,
  };
}

function wallEquals(a: Wall, y: number, mo: number, da: number, h: number, mi: number, se: number): boolean {
  return a.y === y && a.mo === mo && a.da === da && a.h === h && a.mi === mi && a.se === se;
}

/**
 * Converte data civil + hora (relógio em MS) para instante UTC em ms.
 * Procura em janela de ±48h a partir do meio-dia UTC do dia (robusto a DST/offset).
 */
export function wallClockToUtcMs(dateYmd: string, timeHms: string, tz: string): number {
  const [Y, M, D] = dateYmd.split('-').map((x) => parseInt(x, 10));
  const tp = timeHms.split(':').map((x) => parseInt(x, 10));
  const h = tp[0] ?? 0;
  const mi = tp[1] ?? 0;
  const se = tp[2] ?? 0;

  const anchor = Date.UTC(Y, M - 1, D, 12, 0, 0);
  for (let deltaMin = -48 * 60; deltaMin <= 48 * 60; deltaMin++) {
    const t = anchor + deltaMin * 60_000;
    const w = utcMsToWall(t, tz);
    if (wallEquals(w, Y, M, D, h, mi, se)) return t;
  }
  return anchor;
}

/** Hoje como YYYY-MM-DD no fuso de MS (útil para logs / fallback). */
export function getTodayYmdInMS(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: MS_EVENTS_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function instantToYmdInMS(isoLike: string): string | null {
  const d = new Date(isoLike);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: MS_EVENTS_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

/**
 * Normaliza valor do banco para YYYY-MM-DD comparável (civil em MS se for timestamp).
 */
export function toComparableYmd(value: string | null | undefined): string | null {
  if (value == null || value === '') return null;
  const s = String(value).trim();
  if (DATE_ONLY.test(s)) return s;
  return instantToYmdInMS(s);
}

function normalizeTimeForWallClock(raw: string | null | undefined): string {
  const t = (raw || '').trim();
  if (!t) return '23:59:59';
  const parts = t.split(':');
  const h = parts[0] ?? '0';
  const m = parts[1] ?? '00';
  const s = parts[2] ?? '00';
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}:${s.padStart(2, '0')}`;
}

function pickEndTime(row: EventRowDates): string {
  const v = (row.end_time ?? row.horario_fim ?? '').trim();
  return normalizeTimeForWallClock(v || null);
}

export type EventRowDates = {
  data_inicio?: string | null;
  data_fim?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  horario_inicio?: string | null;
  horario_fim?: string | null;
};

/**
 * Instant UTC (ms) do fim do evento para comparação com Date.now().
 */
export function getEventEndUtcMs(row: EventRowDates): number | null {
  const endRaw = row.data_fim ?? row.end_date ?? row.data_inicio ?? row.start_date;
  const startRaw = row.data_inicio ?? row.start_date;
  if (!endRaw || !startRaw) return null;

  const s = String(endRaw).trim();

  // Timestamp completo (não é só YYYY-MM-DD): usar instante guardado
  if (!DATE_ONLY.test(s) && s.includes('T')) {
    const parsed = Date.parse(s);
    if (!Number.isNaN(parsed)) return parsed;
  }

  const dateYmd = toComparableYmd(s);
  if (!dateYmd) return null;

  const timeStr = pickEndTime(row);
  try {
    return wallClockToUtcMs(dateYmd, timeStr, MS_EVENTS_TIMEZONE);
  } catch {
    return null;
  }
}

/**
 * O evento ainda pode aparecer para o visitante: instante atual não passou do fim (data+hora em MS).
 */
export function isEventActiveForPublicListing(row: EventRowDates): boolean {
  const endMs = getEventEndUtcMs(row);
  if (endMs == null) return false;
  return Date.now() < endMs;
}
