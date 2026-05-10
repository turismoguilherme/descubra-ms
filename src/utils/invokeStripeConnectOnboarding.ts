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

function getSupabaseUrlAndApiKey(): { url: string; apiKey: string } {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
  const envPublishable = (
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined
  )?.trim();
  const envAnon = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();
  const internal = supabase as unknown as PublicSupabaseClient;
  const url = envUrl || internal.supabaseUrl || '';
  const apiKey = envPublishable || envAnon || internal.supabaseKey || '';
  return { url, apiKey };
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

  const { url: supabaseUrl, apiKey } = getSupabaseUrlAndApiKey();
  if (!supabaseUrl || !apiKey) {
    return {
      data: null,
      error: new Error(
        'Configuração Supabase incompleta no app. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY ou VITE_SUPABASE_ANON_KEY.'
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
        apikey: apiKey,
      },
      body: JSON.stringify(body),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { data: null, error: new Error(`Falha de rede ao chamar Stripe Connect: ${msg}`) };
  }

  const json = (await response.json().catch(() => null)) as
    | { url?: string; error?: string; code?: string; diagnostic?: string }
    | null;

  if (!response.ok) {
    const diag =
      typeof json?.diagnostic === 'string' && json.diagnostic.trim()
        ? ` ${json.diagnostic.trim()}`
        : '';
    const detailed =
      json?.error && json?.code ? `${json.error} [${json.code}]` : json?.error || null;
    const friendly =
      (detailed ? `${detailed}${diag}` : null) ||
      (response.status === 401
        ? `Unauthorized.${diag || ' Atualize a página, faça login de novo ou faça deploy das Edge Functions (stripe-connect-onboarding) com o código mais recente.'}`
        : `Erro ${response.status} ao conectar Stripe.`);

    console.error('[stripe-connect-onboarding] HTTP', response.status, { friendly, json });
    return { data: null, error: new Error(friendly) };
  }

  return { data: json as { url?: string } | null, error: null };
}
