import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import Stripe from 'https://esm.sh/stripe@14.5.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY não configurada');
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Variáveis de ambiente do Supabase não configuradas');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { partnerId, partnerEmail, partnerName, returnUrl, refreshUrl } = await req.json();

    if (!partnerId || !partnerEmail || !partnerName) {
      throw new Error('Dados do parceiro incompletos');
    }

    console.log('Criando/recuperando conta Stripe Connect para:', partnerEmail);

    // Verificar se o parceiro já tem uma conta Stripe Connect
    const { data: partner, error: partnerError } = await supabase
      .from('institutional_partners')
      .select('stripe_account_id, stripe_connect_status')
      .eq('id', partnerId)
      .single();

    if (partnerError) {
      throw new Error(`Erro ao buscar parceiro: ${partnerError.message}`);
    }

    let accountId = partner?.stripe_account_id;

    // Se não tem conta, criar uma nova conta Express
    if (!accountId) {
      console.log('Criando nova conta Stripe Connect Express...');
      
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'BR',
        email: partnerEmail,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual', // ou 'company' dependendo do person_type
        metadata: {
          partner_id: partnerId,
          platform: 'descubra_ms',
        },
      });

      accountId = account.id;

      // Salvar o account_id no banco
      const { error: updateError } = await supabase
        .from('institutional_partners')
        .update({
          stripe_account_id: accountId,
          stripe_connect_status: 'pending',
        })
        .eq('id', partnerId);

      if (updateError) {
        console.error('Erro ao salvar stripe_account_id:', updateError);
        // Não falhar, continuar com o onboarding
      }

      console.log('Conta criada com sucesso:', accountId);
    }

    // Gerar link de onboarding
    console.log('Gerando link de onboarding para conta:', accountId);
    
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl || `${returnUrl}?stripe_connect=refresh`,
      return_url: returnUrl || `${returnUrl}?stripe_connect=success`,
      type: 'account_onboarding',
    });

    console.log('Link de onboarding gerado:', accountLink.url);

    return new Response(
      JSON.stringify({
        url: accountLink.url,
        accountId: accountId,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Erro no stripe-connect-onboarding:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Erro interno',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

