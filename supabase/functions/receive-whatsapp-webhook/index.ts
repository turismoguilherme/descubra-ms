import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Esta Edge Function seria configurada como um webhook no seu provedor de WhatsApp (ex: Twilio)
serve(async (req) => {
  try {
    // Twilio envia dados de webhook de WhatsApp como application/x-www-form-urlencoded
    const formData = await req.formData();
    const from = formData.get('From'); // Ex: whatsapp:+1234567890
    const to = formData.get('To');
    const body = formData.get('Body');
    const messageSid = formData.get('SmsMessageSid'); // ID único da mensagem

    if (!from || !to || !body) {
      console.error('Dados de webhook de WhatsApp incompletos:', Object.fromEntries(formData.entries()));
      return new Response(JSON.stringify({ error: 'Dados de webhook de WhatsApp incompletos.' }), {
        status: 400,
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Registrar a mensagem recebida no log de comunicação
    const { error: logError } = await supabaseAdmin.from('communication_logs').insert({
      direction: 'in',
      channel: 'whatsapp',
      from_address: from.toString(),
      to_address: to.toString(),
      subject_or_topic: `Mensagem WhatsApp - ${messageSid}`,
      body: body.toString(),
      status: 'received',
      // related_ticket_id e ai_generated_response seriam definidos por uma lógica de IA posterior
    });

    if (logError) {
      console.error('Erro ao registrar mensagem WhatsApp recebida no Supabase:', logError);
      return new Response(JSON.stringify({ error: 'Falha ao registrar mensagem.' }), {
        status: 500,
      });
    }

    // Resposta vazia para Twilio, indica sucesso
    return new Response('<Response></Response>', { 
      headers: { 'Content-Type': 'text/xml' },
      status: 200,
    });

  } catch (error) {
    console.error('Erro na Edge Function receive-whatsapp-webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
    });
  }
}); 