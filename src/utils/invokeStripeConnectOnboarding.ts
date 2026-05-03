import { supabase } from '@/integrations/supabase/client';

export type StripeConnectOnboardingPayload = {
  partnerId: string;
  partnerEmail: string;
  partnerName: string;
  returnUrl: string;
  refreshUrl: string;
};

/**
 * Garante access_token e envia Authorization explicitamente para a Edge Function
 * (evita 401 por corrida com refresh de sessão / invoke sem header).
 */
export async function invokeStripeConnectOnboarding(
  body: StripeConnectOnboardingPayload
): Promise<{ data: { url?: string } | null; error: Error | null }> {
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

  const { data, error } = await supabase.functions.invoke('stripe-connect-onboarding', {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    body,
  });

  if (error) {
    // Tentar extrair mensagem detalhada do corpo da resposta da Edge Function
    let detailedMessage: string | null = null;
    try {
      const ctx = (error as { context?: { response?: Response } }).context;
      if (ctx?.response) {
        const cloned = ctx.response.clone();
        const json = (await cloned.json().catch(() => null)) as
          | { error?: string; code?: string; type?: string }
          | null;
        if (json?.error) {
          detailedMessage = json.code ? `${json.error} [${json.code}]` : json.error;
        }
      }
    } catch {
      /* ignore */
    }

    const raw = error.message ?? '';
    const friendly =
      detailedMessage ||
      (raw.includes('non-2xx') || raw.includes('401')
        ? 'O servidor não aceitou a requisição ao abrir o Stripe. Atualize a página e confira se as secrets STRIPE_SECRET_KEY, SUPABASE_URL, SUPABASE_ANON_KEY e SUPABASE_SERVICE_ROLE_KEY estão configuradas.'
        : raw);

    console.error('[stripe-connect-onboarding] erro:', { raw, detailedMessage });
    return { data: data as { url?: string } | null, error: new Error(friendly) };
  }

  return { data: data as { url?: string } | null, error: null };
}
