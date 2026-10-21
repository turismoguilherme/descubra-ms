/** Mensagem legível para erros do Supabase/PostgREST no toast. */
export function formatSupabaseError(error: unknown): string {
  if (!error) return 'Erro desconhecido';

  if (error instanceof Error && error.message && error.message !== '[object Object]') {
    return error.message;
  }

  const postgrest = error as {
    message?: string;
    code?: string;
    details?: string;
    hint?: string;
  };

  if (postgrest.code === 'PGRST202') {
    return 'Função não encontrada no banco. Aplique as migrações do passaporte no Supabase.';
  }

  const parts = [postgrest.message, postgrest.details, postgrest.hint].filter(Boolean);
  if (parts.length > 0) return parts.join(' — ');

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}
