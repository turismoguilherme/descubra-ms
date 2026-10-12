import { useCallback, useMemo, useState } from 'react';

interface CheckpointLike { id: string; order_sequence: number; day_number?: number | null }

/**
 * Ordem personalizada dos pontos escolhida pelo turista (só em roteiros de ordem livre).
 * Guardada no aparelho (não é dado sensível). Pontos novos entram no final.
 */
export function useCustomCheckpointOrder<T extends CheckpointLike>(routeId: string, checkpoints: T[], enabled: boolean) {
  const key = `passport_order_${routeId}`;
  const [ids, setIds] = useState<string[] | null>(() => {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
  });

  const suggested = useMemo(() => [...checkpoints].sort((a, b) =>
    ((a.day_number || 1) - (b.day_number || 1)) || a.order_sequence - b.order_sequence), [checkpoints]);

  const ordered = useMemo<T[]>(() => {
    if (!enabled || !ids) return suggested;
    const byId = new Map(suggested.map((c) => [c.id, c]));
    const picked = ids.map((id) => byId.get(id)).filter(Boolean) as T[];
    const rest = suggested.filter((c) => !ids.includes(c.id));
    return [...picked, ...rest].map((c, i) => ({ ...c, order_sequence: i + 1, day_number: 1 }));
  }, [enabled, ids, suggested]);

  const save = useCallback((next: string[]) => {
    setIds(next);
    localStorage.setItem(key, JSON.stringify(next));
  }, [key]);

  const reset = useCallback(() => {
    setIds(null);
    localStorage.removeItem(key);
  }, [key]);

  return { ordered, isCustom: enabled && !!ids, save, reset };
}
