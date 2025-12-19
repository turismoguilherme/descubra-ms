import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { corsHeaders } from '../_shared/cors.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-11-20.acacia',
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { 
      requestId,
      amount,
      successUrl,
      cancelUrl
    } = body;

    if (!requestId || !amount) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: requestId, amount' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

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

    // Converter valor para centavos
    const amountInCents = Math.round(parseFloat(amount) * 100);

    // Criar sessão de checkout no Stripe (pagamento único)
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card', 'pix'],
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

