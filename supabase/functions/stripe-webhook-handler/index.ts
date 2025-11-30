import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { corsHeaders } from '../_shared/cors.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-11-20.acacia',
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

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

    let event: Stripe.Event;
    
    try {
      // Validar assinatura do webhook
      if (!webhookSecret) {
        throw new Error('STRIPE_WEBHOOK_SECRET não configurado');
      }
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Erro ao validar webhook:', err.message);
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
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        // Verificar se é pagamento de evento ou assinatura
        if (session.metadata?.type === 'event_sponsorship') {
          await handleEventPaymentCompleted(session, supabase);
        } else {
          await handleCheckoutCompleted(session, supabase);
        }
        break;
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription, supabase);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice, supabase);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice, supabase);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, supabase);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, supabase);
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

// Handler específico para pagamento de eventos em destaque
async function handleEventPaymentCompleted(session: Stripe.Checkout.Session, supabase: any) {
  console.log('Pagamento de evento em destaque completado:', session.id);
  
  try {
    const metadata = session.metadata || {};
    const eventId = metadata.event_id;
    const eventName = metadata.event_name;
    const organizerEmail = metadata.organizer_email;

    if (!eventId) {
      console.error('Event ID faltando no metadata');
      return;
    }

    // Atualizar evento para patrocinado
    const { error } = await supabase
      .from('events')
      .update({
        is_sponsored: true,
        is_visible: true,
        sponsor_tier: 'destaque',
        sponsor_payment_status: 'paid',
        sponsor_start_date: new Date().toISOString().split('T')[0],
        // Destaque válido por 30 dias
        sponsor_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      })
      .eq('id', eventId);

    if (error) {
      console.error('Erro ao atualizar evento:', error);
    } else {
      console.log(`Evento ${eventId} marcado como patrocinado`);
      
      // Enviar email de confirmação para o organizador
      try {
        const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR');
        
        await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-notification-email`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'event_payment_confirmed',
            to: organizerEmail,
            data: {
              organizerName: metadata.organizer_name,
              eventName: eventName,
              validUntil: validUntil,
            },
          }),
        });
        console.log('Email de confirmação enviado');
      } catch (emailError) {
        console.error('Erro ao enviar email:', emailError);
      }
    }

  } catch (error) {
    console.error('Erro ao processar pagamento de evento:', error);
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, supabase: any) {
  console.log('Checkout completado:', session.id);
  
  try {
    const metadata = session.metadata || {};
    const userId = metadata.supabase_user_id;
    const planId = metadata.plan_id;
    const billingPeriod = metadata.billing_period;

    if (!userId || !planId) {
      console.error('Metadata faltando no checkout session');
      return;
    }

    // Buscar subscription criada pelo checkout
    if (session.subscription && typeof session.subscription === 'string') {
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      await handleSubscriptionCreated(subscription, supabase);
    }

    console.log('Checkout processado com sucesso');
  } catch (error) {
    console.error('Erro ao processar checkout:', error);
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription, supabase: any) {
  console.log('Nova assinatura criada:', subscription.id);
  
  try {
    // Buscar customer no Stripe para obter email
    const customer = await stripe.customers.retrieve(subscription.customer as string);
    const customerEmail = typeof customer === 'object' && !customer.deleted ? customer.email : null;
    const metadata = subscription.metadata || {};
    const userId = metadata.supabase_user_id || (typeof customer === 'object' && !customer.deleted ? customer.metadata?.supabase_user_id : null);

    // Obter informações do plano
    const priceItem = subscription.items.data[0];
    const planId = metadata.plan_id || priceItem?.price.lookup_key || 'unknown';
    const monthlyAmount = priceItem?.price.unit_amount ? priceItem.price.unit_amount / 100 : 0;

    // Criar ou atualizar registro na tabela master_clients
    const { error } = await supabase
      .from('master_clients')
      .upsert({
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer as string,
        contact_email: customerEmail,
        status: subscription.status === 'active' || subscription.status === 'trialing' ? 'active' : 'prospect',
        subscription_plan: planId,
        monthly_fee: monthlyAmount,
        contract_start_date: new Date(subscription.current_period_start * 1000).toISOString().split('T')[0],
        contract_end_date: new Date(subscription.current_period_end * 1000).toISOString().split('T')[0],
        auto_renewal: !subscription.cancel_at_period_end,
        state_name: metadata.state_name || 'Estado Novo',
        client_name: metadata.client_name || customerEmail?.split('@')[0] || 'Cliente Novo'
      }, {
        onConflict: 'stripe_subscription_id'
      });
    
    if (error) {
      console.error('Erro ao criar/atualizar cliente:', error);
    } else {
      console.log('Cliente criado/atualizado com sucesso');
    }

    // Criar registro na tabela subscriptions (se existir)
    if (userId) {
      const { error: subError } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          plan_id: planId,
          status: subscription.status === 'trialing' ? 'trial' : subscription.status,
          billing_period: subscription.items.data[0]?.price.recurring?.interval === 'year' ? 'annual' : 'monthly',
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          amount: monthlyAmount,
          currency: 'BRL',
        }, {
          onConflict: 'user_id'
        });

      if (subError) {
        console.error('Erro ao criar assinatura no banco:', subError);
      }
    }
  } catch (error) {
    console.error('Erro ao processar nova assinatura:', error);
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice, supabase: any) {
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

async function handlePaymentFailed(invoice: Stripe.Invoice, supabase: any) {
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

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, supabase: any) {
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

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabase: any) {
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







