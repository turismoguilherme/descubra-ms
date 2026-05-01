/**
 * Resolve horários de exibição para eventos (campos diretos, PT-BR ou embutidos em ISO).
 */

export function extractTimeHmFromIso(value: string | null | undefined): string | undefined {
  if (!value || typeof value !== 'string' || !value.includes('T')) return undefined;
  const afterT = value.split('T')[1];
  if (!afterT) return undefined;
  const m = afterT.match(/^(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : undefined;
}

type TimeSource = {
  start_time?: string | null;
  end_time?: string | null;
  horario_inicio?: string | null;
  horario_fim?: string | null;
  start_date?: string | null;
  data_inicio?: string | null;
  end_date?: string | null;
  data_fim?: string | null;
};

export function resolveEventTimes(row: TimeSource): { start?: string; end?: string } {
  const rawStart = [row.start_time, row.horario_inicio].find((v) => v && String(v).trim());
  const rawEnd = [row.end_time, row.horario_fim].find((v) => v && String(v).trim());
  const startIso = row.start_date ?? row.data_inicio;
  const endIso = row.end_date ?? row.data_fim;

  const start =
    (rawStart && String(rawStart).trim()) || extractTimeHmFromIso(startIso ?? undefined) || undefined;
  const end = (rawEnd && String(rawEnd).trim()) || extractTimeHmFromIso(endIso ?? undefined) || undefined;

  return { start, end };
}

/** Texto único para UI (ex.: modal, cards). Ignora "00:00" como ausente. */
export function formatEventTimeRange(start?: string, end?: string): string {
  const clean = (v?: string) => {
    const t = v?.trim();
    if (!t || t === '00:00' || t === '00:00:00') return undefined;
    return t;
  };
  const s = clean(start);
  const e = clean(end);
  if (s && e && s !== e) return `${s} – ${e}`;
  if (s) return s;
  if (e) return `até ${e}`;
  return '';
}
