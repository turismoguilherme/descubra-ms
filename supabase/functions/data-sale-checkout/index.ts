import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { corsHeaders } from '../_shared/cors.ts';
import { requireAdmin, guardResponse, serviceClient } from '../_shared/authGuard.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-11-20.acacia',
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return guardResponse(auth, corsHeaders);

    const body = await req.json();
    const { 
      requestId,
      successUrl,
      cancelUrl
    } = body;

    if (!requestId) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: requestId' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    const supabase = serviceClient();

    // Buscar solicitação de dados
    const { data: request, error: requestError } = await supabase
      .from('data_sale_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (requestError || !request) {
      return new Response(
        JSON.stringify({ error: 'Solicitação não encontrada' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      );
    }

    // Verificar se já está aprovada
    if (request.status !== 'approved') {
      return new Response(
        JSON.stringify({ error: 'Solicitação não está aprovada para pagamento' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // URLs de callback
    const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('/functions/v1', '') || 'http://localhost:3000';
    const defaultSuccessUrl = successUrl || `${baseUrl}/viajar/admin/financial/contact-leads?payment=success&session_id={CHECKOUT_SESSION_ID}`;
    const defaultCancelUrl = cancelUrl || `${baseUrl}/viajar/admin/financial/contact-leads?payment=cancelled`;

    // Valor definido no servidor a partir da solicitação aprovada (nunca do cliente)
    const serverAmount = Number(
      (request as Record<string, unknown>).final_price ??
      (request as Record<string, unknown>).price ??
      (request as Record<string, unknown>).amount ??
      0,
    );

    if (!serverAmount || serverAmount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Valor da solicitação não definido. Defina o preço antes de cobrar.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const amountInCents = Math.round(serverAmount * 100);


    // Criar sessão de checkout no Stripe (pagamento único)
    // Métodos de pagamento: Cartão, PIX e Boleto (habilitados para Brasil)
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card', 'pix', 'boleto'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: 'Relatório de Dados de Turismo',
              description: `Relatório ${request.report_type === 'explanatory' ? 'Tratado' : request.report_type === 'raw_data' ? 'Bruto' : 'Tratado + Bruto'} - Período: ${request.period_start} a ${request.period_end}`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: 'data_sale_report',
        request_id: requestId,
        requester_email: request.requester_email,
        requester_name: request.requester_name,
        report_type: request.report_type,
        period_start: request.period_start,
        period_end: request.period_end,
      },
      success_url: defaultSuccessUrl,
      cancel_url: defaultCancelUrl,
      customer_email: request.requester_email,
      locale: 'pt-BR',
      allow_promotion_codes: true,
    });

    // Atualizar solicitação com session_id
    await supabase
      .from('data_sale_requests')
      .update({ 
        stripe_checkout_session_id: session.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        checkoutUrl: session.url,
        sessionId: session.id,
        requestId: requestId
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Erro ao criar checkout de relatório:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro ao criar sessão de checkout' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

