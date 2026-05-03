import { supabase } from '@/integrations/supabase/client';

export type StripeConnectOnboardingPayload = {
  partnerId: string;
  partnerEmail: string;
  partnerName: string;
  returnUrl: string;
  refreshUrl: string;
};

type PublicSupabaseClient = {
  supabaseUrl?: string;
  supabaseKey?: string;
};

function getSupabaseUrlAndAnonKey(): { url: string; anonKey: string } {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
  const envAnon = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();
  const internal = supabase as unknown as PublicSupabaseClient;
  const url = envUrl || internal.supabaseUrl || '';
  const anonKey = envAnon || internal.supabaseKey || '';
  return { url, anonKey };
}

/**
 * Chama stripe-connect-onboarding com fetch explícito (Authorization + apikey),
 * após validar/refrescar sessão — evita 401 por invoke sem headers esperidos pelo gateway.
 */
export async function invokeStripeConnectOnboarding(
  body: StripeConnectOnboardingPayload
): Promise<{ data: { url?: string } | null; error: Error | null }> {
  await supabase.auth.getUser();

  let {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    await supabase.auth.refreshSession();
    ({
      data: { session },
    } = await supabase.auth.getSession());
  }

  if (!session?.access_token) {
    return {
      data: null,
      error: new Error(
        'Sua sessão não está disponível. Faça login novamente ou atualize a página antes de conectar o Stripe.'
      ),
    };
  }

  const { url: supabaseUrl, anonKey } = getSupabaseUrlAndAnonKey();
  if (!supabaseUrl || !anonKey) {
    return {
      data: null,
      error: new Error(
        'Configuração Supabase incompleta no app (URL ou chave anônima). Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.'
      ),
    };
  }

  const endpoint = `${supabaseUrl.replace(/\/$/, '')}/functions/v1/stripe-connect-onboarding`;

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
        apikey: anonKey,
      },
      body: JSON.stringify(body),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { data: null, error: new Error(`Falha de rede ao chamar Stripe Connect: ${msg}`) };
  }

  const json = (await response.json().catch(() => null)) as
    | { url?: string; error?: string; code?: string }
    | null;

  if (!response.ok) {
    const detailed =
      json?.error && json?.code ? `${json.error} [${json.code}]` : json?.error || null;
    const friendly =
      detailed ||
      (response.status === 401
        ? 'O servidor não aceitou seu login ao abrir o Stripe. Atualize a página, entre de novo, ou confira no Supabase (Edge Function stripe-connect-onboarding) se SUPABASE_ANON_KEY e SUPABASE_SERVICE_ROLE_KEY batem com este projeto.'
        : `Erro ${response.status} ao conectar Stripe.`);

    console.error('[stripe-connect-onboarding] HTTP', response.status, { friendly, json });
    return { data: null, error: new Error(friendly) };
  }

  return { data: json as { url?: string } | null, error: null };
}
