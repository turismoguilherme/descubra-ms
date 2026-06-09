/** Visitante sem login: não usar string sentinela como UUID no Supabase. */
export function normalizeGuataUserId(userId?: string | null): string | undefined {
  if (!userId) return undefined;
  const trimmed = userId.trim();
  if (!trimmed || trimmed === 'convidado' || trimmed === 'anonymous' || trimmed === 'guest') {
    return undefined;
  }
  return trimmed;
}
