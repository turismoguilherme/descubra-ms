import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Mock do Stripe para demonstração (em produção usar: import Stripe from 'https://esm.sh/stripe@12.0.0')
const mockStripe = {
  webhooks: {
    constructEvent: (body: string, signature: string, secret: string) => {
      // Simular validação de webhook
      if (!signature || !secret) {
        throw new Error('Invalid signature');
      }
      return JSON.parse(body);
    }
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();
    
    if (!signature) {
      return new Response(JSON.stringify({ error: 'Missing stripe signature' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    let event: any;
    
    try {
      // Em produção: event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
      event = mockStripe.webhooks.constructEvent(body, signature, 'mock_secret');
    } catch (err: any) {
      return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Processar diferentes tipos de eventos
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object, supabase);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object, supabase);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object, supabase);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object, supabase);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object, supabase);
        break;
      default:
        console.log(`Evento não processado: ${event.type}`);
    }
    
    return new Response(JSON.stringify({ received: true, event_type: event.type }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error('Erro na Edge Function stripe-webhook-handler:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

// Funções de manipulação de eventos
async function handleSubscriptionCreated(subscription: any, supabase: any) {
  console.log('Nova assinatura criada:', subscription.id);
  
  try {
    // Criar registro na tabela master_clients
    const { error } = await supabase
      .from('master_clients')
      .insert({
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer,
        status: 'active',
        subscription_plan: subscription.items.data[0]?.price.lookup_key || 'unknown',
        monthly_fee: subscription.items.data[0]?.price.unit_amount / 100,
        contract_start_date: new Date(subscription.current_period_start * 1000).toISOString().split('T')[0],
        contract_end_date: new Date(subscription.current_period_end * 1000).toISOString().split('T')[0],
        auto_renewal: subscription.cancel_at_period_end ? false : true,
        state_name: 'Estado Novo', // Será atualizado quando o cliente completar o onboarding
        client_name: 'Cliente Novo'
      });
    
    if (error) {
      console.error('Erro ao criar cliente:', error);
    } else {
      console.log('Cliente criado com sucesso');
    }
  } catch (error) {
    console.error('Erro ao processar nova assinatura:', error);
  }
}

async function handlePaymentSucceeded(invoice: any, supabase: any) {
  console.log('Pagamento realizado com sucesso:', invoice.id);
  
  try {
    // Registrar o pagamento na tabela master_financial_records
    const { error } = await supabase
      .from('master_financial_records')
      .insert({
        record_type: 'revenue',
        amount: invoice.amount_paid / 100,
        description: `Pagamento da assinatura ${invoice.subscription}`,
        stripe_invoice_id: invoice.id,
        stripe_subscription_id: invoice.subscription,
        status: 'paid',
        paid_date: new Date().toISOString().split('T')[0]
      });
    
    if (error) {
      console.error('Erro ao registrar pagamento:', error);
    } else {
      console.log('Pagamento registrado com sucesso');
    }
  } catch (error) {
    console.error('Erro ao processar pagamento:', error);
  }
}

async function handlePaymentFailed(invoice: any, supabase: any) {
  console.log('Falha no pagamento:', invoice.id);
  
  try {
    // Atualizar status do cliente para 'overdue'
    const { error } = await supabase
      .from('master_clients')
      .update({ status: 'overdue' })
      .eq('stripe_subscription_id', invoice.subscription);
    
    if (error) {
      console.error('Erro ao atualizar status do cliente:', error);
    } else {
      console.log('Status do cliente atualizado para inadimplente');
    }
  } catch (error) {
    console.error('Erro ao processar falha de pagamento:', error);
  }
}

async function handleSubscriptionUpdated(subscription: any, supabase: any) {
  console.log('Assinatura atualizada:', subscription.id);
  
  try {
    // Atualizar dados da assinatura
    const { error } = await supabase
      .from('master_clients')
      .update({
        subscription_plan: subscription.items.data[0]?.price.lookup_key || 'unknown',
        monthly_fee: subscription.items.data[0]?.price.unit_amount / 100,
        contract_end_date: new Date(subscription.current_period_end * 1000).toISOString().split('T')[0],
        auto_renewal: subscription.cancel_at_period_end ? false : true,
        status: subscription.status
      })
      .eq('stripe_subscription_id', subscription.id);
    
    if (error) {
      console.error('Erro ao atualizar assinatura:', error);
    } else {
      console.log('Assinatura atualizada com sucesso');
    }
  } catch (error) {
    console.error('Erro ao processar atualização da assinatura:', error);
  }
}

async function handleSubscriptionDeleted(subscription: any, supabase: any) {
  console.log('Assinatura cancelada:', subscription.id);
  
  try {
    // Atualizar status do cliente para 'cancelled'
    const { error } = await supabase
      .from('master_clients')
      .update({ 
        status: 'cancelled',
        contract_end_date: new Date().toISOString().split('T')[0]
      })
      .eq('stripe_subscription_id', subscription.id);
    
    if (error) {
      console.error('Erro ao cancelar assinatura:', error);
    } else {
      console.log('Assinatura cancelada com sucesso');
    }
  } catch (error) {
    console.error('Erro ao processar cancelamento da assinatura:', error);
  }
}







