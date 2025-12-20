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
        // Verificar tipo de pagamento
        if (session.metadata?.type === 'event_sponsorship') {
          await handleEventPaymentCompleted(session, supabase);
        } else if (session.metadata?.type === 'partner_reservation') {
          await handleReservationPaymentCompleted(session, supabase);
        } else if (session.metadata?.type === 'data_sale_report') {
          await handleDataSalePaymentCompleted(session, supabase);
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
    const { error: eventError } = await supabase
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

    if (eventError) {
      console.error('Erro ao atualizar evento:', eventError);
    } else {
      console.log(`Evento ${eventId} marcado como patrocinado`);
      
      // Registrar pagamento em master_financial_records
      const amountPaid = session.amount_total ? session.amount_total / 100 : 499.90; // R$ 499,90 em centavos
      const { error: financialError } = await supabase
        .from('master_financial_records')
        .insert({
          record_type: 'revenue',
          amount: amountPaid,
          description: `Pagamento de evento em destaque: ${eventName || 'Evento'}`,
          stripe_invoice_id: session.payment_intent as string,
          status: 'paid',
          paid_date: new Date().toISOString().split('T')[0],
          source: 'event_sponsor',
          currency: 'BRL',
          metadata: {
            event_id: eventId,
            event_name: eventName,
            organizer_email: organizerEmail,
            checkout_session_id: session.id,
          },
        });

      if (financialError) {
        console.error('Erro ao registrar pagamento em master_financial_records:', financialError);
      } else {
        console.log('Pagamento registrado em master_financial_records');
      }
      
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
    const isPartnerSubscription = metadata.type === 'partner_subscription';

    // Obter informações do plano
    const priceItem = subscription.items.data[0];
    const planId = metadata.plan_id || priceItem?.price.lookup_key || 'unknown';
    const monthlyAmount = priceItem?.price.unit_amount ? priceItem.price.unit_amount / 100 : 0;

    // Se for assinatura de parceiro, atualizar institutional_partners
    if (isPartnerSubscription && customerEmail) {
      const { error: partnerError } = await supabase
        .from('institutional_partners')
        .update({
          stripe_customer_id: subscription.customer as string,
          stripe_subscription_id: subscription.id,
          subscription_status: subscription.status === 'trialing' ? 'trialing' : subscription.status,
          monthly_fee: monthlyAmount,
          subscription_start_date: new Date(subscription.current_period_start * 1000).toISOString(),
          subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
          status: subscription.status === 'active' || subscription.status === 'trialing' ? 'approved' : 'pending',
          is_active: subscription.status === 'active' || subscription.status === 'trialing',
        })
        .eq('contact_email', customerEmail);

      if (partnerError) {
        console.error('Erro ao atualizar parceiro:', partnerError);
      } else {
        console.log('Parceiro atualizado com sucesso');
      }
      return; // Não processar como cliente ViaJAR
    }

    // Criar ou atualizar registro na tabela master_clients (ViaJAR)
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
    // Verificar se é assinatura de parceiro
    const subscriptionId = invoice.subscription as string;
    if (subscriptionId) {
      const { data: subscription } = await supabase
        .from('institutional_partners')
        .select('id, name, contact_email, stripe_subscription_id')
        .eq('stripe_subscription_id', subscriptionId)
        .maybeSingle();

      if (subscription) {
        // É assinatura de parceiro - registrar transação
        const { data: transaction, error: transactionError } = await supabase
          .from('partner_transactions')
          .insert({
            partner_id: subscription.id,
            transaction_type: 'subscription_payment',
            amount: -(invoice.amount_paid / 100), // Negativo (despesa)
            description: `Pagamento de assinatura mensal - ${subscription.name}`,
            stripe_invoice_id: invoice.id,
            stripe_subscription_id: subscriptionId,
            status: 'paid',
            paid_date: new Date().toISOString(),
            metadata: {
              subscription_id: subscriptionId,
              invoice_id: invoice.id,
              invoice_url: invoice.hosted_invoice_url,
            },
          })
          .select()
          .single();

        if (transactionError) {
          console.warn('Erro ao registrar transação de assinatura (não crítico):', transactionError);
        } else {
          // Criar notificação
          try {
            const { error: notificationError } = await supabase
              .from('partner_notifications')
              .insert({
                partner_id: subscription.id,
                type: 'subscription_payment',
                title: 'Pagamento de Assinatura',
                message: `Pagamento de assinatura mensal de R$ ${(invoice.amount_paid / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} realizado com sucesso.`,
                transaction_id: transaction.id,
                email_sent: false,
                metadata: {
                  invoice_id: invoice.id,
                  invoice_url: invoice.hosted_invoice_url,
                },
              });

            if (!notificationError && subscription.contact_email) {
              // Enviar email
              try {
                await supabase.functions.invoke('send-notification-email', {
                  body: {
                    type: 'partner_notification',
                    to: subscription.contact_email,
                    data: {
                      title: 'Pagamento de Assinatura Confirmado',
                      message: `Seu pagamento de assinatura mensal foi confirmado.`,
                      type: 'subscription_payment',
                    },
                  },
                });

                await supabase
                  .from('partner_notifications')
                  .update({
                    email_sent: true,
                    email_sent_at: new Date().toISOString(),
                  })
                  .eq('transaction_id', transaction.id)
                  .eq('type', 'subscription_payment');
              } catch (emailError) {
                console.warn('Erro ao enviar email (não crítico):', emailError);
              }
            }
          } catch (notifErr) {
            console.warn('Erro ao criar notificação (não crítico):', notifErr);
          }
        }

        if (transactionError) {
          console.warn('Erro ao registrar transação de assinatura (não crítico):', transactionError);
        }

        // Criar notificação
        const { error: notificationError } = await supabase
          .from('partner_notifications')
          .insert({
            partner_id: subscription.id,
            type: 'subscription_renewed',
            title: 'Assinatura Renovada',
            message: `Seu pagamento de assinatura mensal foi processado com sucesso. Valor: R$ ${(invoice.amount_paid / 100).toFixed(2)}`,
            email_sent: false,
            metadata: {
              invoice_id: invoice.id,
              amount: invoice.amount_paid / 100,
            },
          });

        if (!notificationError && subscription.contact_email) {
          // Enviar email
          try {
            await supabase.functions.invoke('send-notification-email', {
              body: {
                type: 'partner_notification',
                to: subscription.contact_email,
                data: {
                  title: 'Assinatura Renovada',
                  message: `Seu pagamento de assinatura mensal foi processado com sucesso. Valor: R$ ${(invoice.amount_paid / 100).toFixed(2)}`,
                  type: 'subscription_renewed',
                },
              },
            });

            await supabase
              .from('partner_notifications')
              .update({
                email_sent: true,
                email_sent_at: new Date().toISOString(),
              })
              .eq('partner_id', subscription.id)
              .eq('type', 'subscription_renewed')
              .order('created_at', { ascending: false })
              .limit(1);
          } catch (emailErr) {
            console.warn('Erro ao enviar email (não crítico):', emailErr);
          }
        }

        return; // Não processar como cliente ViaJAR
      }
    }

    // Registrar o pagamento na tabela master_financial_records (para clientes ViaJAR)
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
    const metadata = subscription.metadata || {};
    const isPartnerSubscription = metadata.type === 'partner_subscription';
    const monthlyAmount = subscription.items.data[0]?.price.unit_amount ? subscription.items.data[0].price.unit_amount / 100 : 0;

    // Se for assinatura de parceiro, atualizar institutional_partners
    if (isPartnerSubscription) {
      const { data: partner, error: partnerError } = await supabase
        .from('institutional_partners')
        .select('id, name, contact_email')
        .eq('stripe_subscription_id', subscription.id)
        .single();

      if (partnerError) {
        console.error('Erro ao buscar parceiro:', partnerError);
        return;
      }

      const subscriptionEndDate = new Date(subscription.current_period_end * 1000);
      const daysUntilExpiry = Math.ceil((subscriptionEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

      const { error: updateError } = await supabase
        .from('institutional_partners')
        .update({
          subscription_status: subscription.status,
          monthly_fee: monthlyAmount,
          subscription_end_date: subscriptionEndDate.toISOString(),
          status: subscription.status === 'active' || subscription.status === 'trialing' ? 'approved' : 'pending',
          is_active: subscription.status === 'active' || subscription.status === 'trialing',
        })
        .eq('stripe_subscription_id', subscription.id);

      if (updateError) {
        console.error('Erro ao atualizar parceiro:', updateError);
      } else {
        console.log('Parceiro atualizado com sucesso');

        // Verificar se assinatura está vencendo (7 dias ou menos)
        if (subscription.status === 'active' && daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
          // Criar notificação de vencimento
          const { error: notificationError } = await supabase
            .from('partner_notifications')
            .insert({
              partner_id: partner.id,
              type: 'subscription_expiring',
              title: 'Assinatura Vencendo',
              message: `Sua assinatura vence em ${daysUntilExpiry} ${daysUntilExpiry === 1 ? 'dia' : 'dias'}. Renove para continuar usando a plataforma.`,
              email_sent: false,
              metadata: {
                days_until_expiry: daysUntilExpiry,
                subscription_end_date: subscriptionEndDate.toISOString(),
              },
            });

          if (!notificationError && partner.contact_email) {
            // Enviar email
            try {
              await supabase.functions.invoke('send-notification-email', {
                body: {
                  type: 'partner_notification',
                  to: partner.contact_email,
                  data: {
                    title: 'Assinatura Vencendo',
                    message: `Sua assinatura vence em ${daysUntilExpiry} ${daysUntilExpiry === 1 ? 'dia' : 'dias'}. Renove para continuar usando a plataforma.`,
                    type: 'subscription_expiring',
                  },
                },
              });

              await supabase
                .from('partner_notifications')
                .update({
                  email_sent: true,
                  email_sent_at: new Date().toISOString(),
                })
                .eq('partner_id', partner.id)
                .eq('type', 'subscription_expiring')
                .order('created_at', { ascending: false })
                .limit(1);
            } catch (emailErr) {
              console.warn('Erro ao enviar email (não crítico):', emailErr);
            }
          }
        }
      }
      return; // Não processar como cliente ViaJAR
    }

    // Atualizar dados da assinatura (ViaJAR)
    const { error } = await supabase
      .from('master_clients')
      .update({
        subscription_plan: subscription.items.data[0]?.price.lookup_key || 'unknown',
        monthly_fee: monthlyAmount,
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

async function handleReservationPaymentCompleted(session: Stripe.Checkout.Session, supabase: any) {
  console.log('Pagamento de reserva completado:', session.id);
  
  try {
    const metadata = session.metadata || {};
    const reservationId = metadata.reservation_id;
    const partnerId = metadata.partner_id;
    const commissionAmount = parseFloat(metadata.commission_amount || '0');
    const partnerAmount = parseFloat(metadata.partner_amount || '0');

    if (!reservationId) {
      console.error('Reservation ID não encontrado no metadata');
      return;
    }

    // Buscar dados do parceiro para notificação
    const { data: partner } = await supabase
      .from('institutional_partners')
      .select('id, name, contact_email')
      .eq('id', partnerId)
      .single();

    // Atualizar status da reserva para 'confirmed' (aguardando confirmação do parceiro)
    const { error: reservationError } = await supabase
      .from('partner_reservations')
      .update({
        status: 'confirmed', // Pagamento confirmado, aguardando parceiro confirmar
        updated_at: new Date().toISOString(),
      })
      .eq('id', reservationId);

    if (reservationError) {
      console.error('Erro ao atualizar reserva:', reservationError);
    } else {
      console.log('Reserva atualizada com sucesso');

      // Criar notificação de reserva confirmada (pagamento recebido)
      if (partner) {
        try {
          const { error: notificationError } = await supabase
            .from('partner_notifications')
            .insert({
              partner_id: partnerId,
              type: 'reservation_confirmed',
              title: 'Reserva Confirmada - Pagamento Recebido',
              message: `Pagamento confirmado para a reserva ${metadata.reservation_code || reservationId}. Valor total: R$ ${(session.amount_total ? session.amount_total / 100 : 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`,
              reservation_id: reservationId,
              email_sent: false,
              action_url: `/partner/dashboard?tab=reservations`,
              action_label: 'Ver Reserva',
              metadata: {
                reservation_code: metadata.reservation_code,
                total_amount: session.amount_total ? session.amount_total / 100 : 0,
              },
            });

          if (!notificationError && partner.contact_email) {
            // Enviar email
            try {
              await supabase.functions.invoke('send-notification-email', {
                body: {
                  type: 'partner_notification',
                  to: partner.contact_email,
                  data: {
                    title: 'Reserva Confirmada - Pagamento Recebido',
                    message: `Pagamento confirmado para a reserva ${metadata.reservation_code || reservationId}. Valor total: R$ ${(session.amount_total ? session.amount_total / 100 : 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`,
                    type: 'reservation_confirmed',
                    reservationId: reservationId,
                    actionUrl: `/partner/dashboard?tab=reservations`,
                  },
                },
              });

              await supabase
                .from('partner_notifications')
                .update({
                  email_sent: true,
                  email_sent_at: new Date().toISOString(),
                })
                .eq('reservation_id', reservationId)
                .eq('type', 'reservation_confirmed')
                .eq('email_sent', false);
            } catch (emailError) {
              console.warn('Erro ao enviar email (não crítico):', emailError);
            }
          }
        } catch (notifErr) {
          console.warn('Erro ao criar notificação (não crítico):', notifErr);
        }
      }
    }

    // Buscar dados do parceiro para notificação
    const { data: partner } = await supabase
      .from('institutional_partners')
      .select('id, name, contact_email')
      .eq('id', partnerId)
      .single();

    // Registrar comissão na tabela financeira como receita
    try {
      const { error: financeError } = await supabase
        .from('master_financial_records')
        .insert({
          record_type: 'revenue',
          source: 'commission', // Identifica como comissão
          amount: parseFloat(metadata.commission_amount || '0'),
          description: `Comissão sobre reserva ${metadata.reservation_code || reservationId}`,
          stripe_invoice_id: session.id,
          status: 'paid',
          paid_date: new Date().toISOString().split('T')[0],
          metadata: {
            reservation_id: reservationId,
            partner_id: partnerId,
            total_amount: session.amount_total ? session.amount_total / 100 : 0,
            commission_amount: commissionAmount,
            partner_amount: partnerAmount,
            commission_rate: metadata.commission_rate || '10.00',
          },
        });

      if (financeError) {
        console.warn('Erro ao registrar pagamento financeiro (não crítico):', financeError);
      }
    } catch (financeErr) {
      console.warn('Erro ao registrar pagamento financeiro (não crítico):', financeErr);
    }

    // Registrar transação de comissão na tabela partner_transactions
    try {
      const { error: transactionError } = await supabase
        .from('partner_transactions')
        .insert({
          partner_id: partnerId,
          transaction_type: 'commission',
          amount: commissionAmount,
          description: `Comissão sobre reserva ${metadata.reservation_code || reservationId}`,
          stripe_invoice_id: session.id,
          stripe_payment_intent_id: session.payment_intent as string,
          reservation_id: reservationId,
          status: 'paid',
          paid_date: new Date().toISOString(),
          metadata: {
            reservation_code: metadata.reservation_code,
            total_amount: session.amount_total ? session.amount_total / 100 : 0,
            commission_rate: metadata.commission_rate || '10.00',
            partner_amount: partnerAmount,
          },
        });

      if (transactionError) {
        console.warn('Erro ao registrar transação (não crítico):', transactionError);
      }
    } catch (transactionErr) {
      console.warn('Erro ao registrar transação (não crítico):', transactionErr);
    }

    // Criar notificação para o parceiro
    if (partner) {
      try {
        const { data: transaction } = await supabase
          .from('partner_transactions')
          .select('id')
          .eq('reservation_id', reservationId)
          .eq('transaction_type', 'commission')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        const { error: notificationError } = await supabase
          .from('partner_notifications')
          .insert({
            partner_id: partnerId,
            type: 'commission_paid',
            title: 'Comissão Recebida',
            message: `Você recebeu R$ ${commissionAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} de comissão sobre a reserva ${metadata.reservation_code || reservationId}`,
            reservation_id: reservationId,
            transaction_id: transaction?.id,
            email_sent: false,
            action_url: `/partner/dashboard?tab=transactions`,
            action_label: 'Ver Transações',
            metadata: {
              reservation_code: metadata.reservation_code,
              commission_amount: commissionAmount,
              total_amount: session.amount_total ? session.amount_total / 100 : 0,
            },
          });

        if (!notificationError && partner.contact_email) {
          // Enviar email
          try {
            await supabase.functions.invoke('send-notification-email', {
              body: {
                type: 'partner_notification',
                to: partner.contact_email,
                data: {
                  title: 'Comissão Recebida',
                  message: `Você recebeu R$ ${commissionAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} de comissão sobre a reserva ${metadata.reservation_code || reservationId}`,
                  type: 'commission_paid',
                  reservationId: reservationId,
                  actionUrl: `/partner/dashboard?tab=transactions`,
                },
              },
            });

            // Marcar email como enviado
            await supabase
              .from('partner_notifications')
              .update({
                email_sent: true,
                email_sent_at: new Date().toISOString(),
              })
              .eq('reservation_id', reservationId)
              .eq('type', 'commission_paid')
              .eq('email_sent', false);
          } catch (emailError) {
            console.warn('Erro ao enviar email (não crítico):', emailError);
          }
        }
      } catch (notifErr) {
        console.warn('Erro ao criar notificação (não crítico):', notifErr);
      }
    }

    // Registrar transação na tabela partner_transactions
    try {
      const { error: transactionError } = await supabase
        .from('partner_transactions')
        .insert({
          partner_id: partnerId,
          transaction_type: 'commission',
          amount: commissionAmount,
          description: `Comissão sobre reserva ${metadata.reservation_code || reservationId}`,
          stripe_payment_intent_id: session.payment_intent as string,
          reservation_id: reservationId,
          status: 'paid',
          paid_date: new Date().toISOString(),
          metadata: {
            reservation_code: metadata.reservation_code,
            total_amount: session.amount_total ? session.amount_total / 100 : 0,
            commission_rate: metadata.commission_rate || '10.00',
            partner_amount: partnerAmount,
          },
        });

      if (transactionError) {
        console.warn('Erro ao registrar transação (não crítico):', transactionError);
      } else {
        console.log('Transação de comissão registrada com sucesso');
      }
    } catch (transactionErr) {
      console.warn('Erro ao registrar transação (não crítico):', transactionErr);
    }

    // Criar notificação para o parceiro
    try {
      // Buscar dados do parceiro para email
      const { data: partner } = await supabase
        .from('institutional_partners')
        .select('name, contact_email')
        .eq('id', partnerId)
        .single();

      if (partner) {
        const { error: notificationError } = await supabase
          .from('partner_notifications')
          .insert({
            partner_id: partnerId,
            type: 'payment_confirmed',
            title: 'Pagamento Confirmado',
            message: `O pagamento da reserva ${metadata.reservation_code || reservationId} foi confirmado. Comissão de R$ ${commissionAmount.toFixed(2)} registrada.`,
            reservation_id: reservationId,
            email_sent: false,
            metadata: {
              reservation_code: metadata.reservation_code,
              commission_amount: commissionAmount,
            },
          });

        if (notificationError) {
          console.warn('Erro ao criar notificação (não crítico):', notificationError);
        } else {
          // Enviar email de notificação
          try {
            const { data: emailData } = await supabase.functions.invoke('send-notification-email', {
              body: {
                type: 'partner_notification',
                to: partner.contact_email,
                data: {
                  title: 'Pagamento Confirmado',
                  message: `O pagamento da reserva ${metadata.reservation_code || reservationId} foi confirmado. Comissão de R$ ${commissionAmount.toFixed(2)} registrada.`,
                  type: 'payment_confirmed',
                  reservationId: reservationId,
                },
              },
            });

            if (emailData?.success) {
              await supabase
                .from('partner_notifications')
                .update({
                  email_sent: true,
                  email_sent_at: new Date().toISOString(),
                })
                .eq('partner_id', partnerId)
                .eq('type', 'payment_confirmed')
                .eq('reservation_id', reservationId)
                .order('created_at', { ascending: false })
                .limit(1);
            }
          } catch (emailErr) {
            console.warn('Erro ao enviar email (não crítico):', emailErr);
          }
        }
      }
    } catch (notificationErr) {
      console.warn('Erro ao criar notificação (não crítico):', notificationErr);
    }

    // TODO: Implementar repasse automático se parceiro tiver Stripe Connect
    // Se partner.stripe_connect_account_id existir, fazer transfer automático
    // await stripe.transfers.create({
    //   amount: Math.round(partnerAmount * 100),
    //   currency: 'brl',
    //   destination: partner.stripe_connect_account_id,
    //   metadata: {
    //     reservation_id: reservationId,
    //     reservation_code: metadata.reservation_code,
    //   },
    // });

  } catch (error) {
    console.error('Erro ao processar pagamento de reserva:', error);
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

async function handleDataSalePaymentCompleted(session: Stripe.Checkout.Session, supabase: any) {
  console.log('Pagamento de relatório de dados completado:', session.id);
  
  try {
    const metadata = session.metadata || {};
    const requestId = metadata.request_id;
    const amountPaid = session.amount_total ? session.amount_total / 100 : 0;

    if (!requestId) {
      console.error('Request ID não encontrado no metadata');
      return;
    }

    // Atualizar status da solicitação para 'paid'
    const { error: requestError } = await supabase
      .from('data_sale_requests')
      .update({
        status: 'paid',
        price_paid: amountPaid,
        stripe_payment_id: session.payment_intent as string,
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (requestError) {
      console.error('Erro ao atualizar solicitação:', requestError);
      return;
    }

    console.log('Solicitação atualizada para pago');

    // Registrar pagamento na tabela financeira
    try {
      const { error: financeError } = await supabase
        .from('master_financial_records')
        .insert({
          record_type: 'revenue',
          source: 'data_sale',
          amount: amountPaid,
          description: `Venda de relatório de dados - ${metadata.requester_name || 'Cliente'}`,
          stripe_invoice_id: session.payment_intent as string,
          stripe_checkout_session_id: session.id,
          status: 'paid',
          paid_date: new Date().toISOString().split('T')[0],
          currency: 'BRL',
          metadata: {
            request_id: requestId,
            requester_email: metadata.requester_email,
            requester_name: metadata.requester_name,
            report_type: metadata.report_type,
            period_start: metadata.period_start,
            period_end: metadata.period_end,
          },
        });

      if (financeError) {
        console.warn('Erro ao registrar pagamento financeiro (não crítico):', financeError);
      } else {
        console.log('Pagamento registrado em master_financial_records');
      }
    } catch (financeErr) {
      console.warn('Erro ao registrar pagamento financeiro (não crítico):', financeErr);
    }

    // Log da ação
    try {
      await supabase.rpc('log_data_sale_action', {
        p_request_id: requestId,
        p_action: 'paid',
        p_notes: `Pagamento confirmado via Stripe. Valor: R$ ${amountPaid.toFixed(2)}`
      });
    } catch (logError) {
      console.warn('Erro ao registrar log (não crítico):', logError);
    }

    console.log('Pagamento de relatório processado com sucesso');
  } catch (error) {
    console.error('Erro ao processar pagamento de relatório:', error);
  }
}







