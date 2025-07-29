import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Assumindo que você terá as variáveis de ambiente para Twilio
const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
// Este é o número do WhatsApp Business API da Twilio (ex: whatsapp:+1234567890)
const TWILIO_WHATSAPP_NUMBER = Deno.env.get('TWILIO_WHATSAPP_NUMBER');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, body, relatedTicketId, aiGenerated } = await req.json();

    if (!to || !body) {
      return new Response(JSON.stringify({ error: 'Campos obrigatórios ausentes: to, body' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_NUMBER) {
      throw new Error('Credenciais Twilio para WhatsApp não configuradas.');
    }

    const twilioAuth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

    // Enviar mensagem via Twilio WhatsApp API
    const twilioResponse = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${twilioAuth}`,
      },
      body: new URLSearchParams({
        To: to, // Deve ser no formato whatsapp:+<número_do_destino>
        From: TWILIO_WHATSAPP_NUMBER,
        Body: body,
      }).toString(),
    });

    if (!twilioResponse.ok) {
      const errorText = await twilioResponse.text();
      throw new Error(`Falha ao enviar mensagem via Twilio WhatsApp: ${twilioResponse.status} - ${errorText}`);
    }

    // Registrar o log de comunicação no Supabase
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: logError } = await supabaseAdmin.from('communication_logs').insert({
      direction: 'out',
      channel: 'whatsapp',
      from_address: TWILIO_WHATSAPP_NUMBER,
      to_address: to,
      subject_or_topic: 'Mensagem WhatsApp',
      body: body,
      status: 'sent',
      related_ticket_id: relatedTicketId || null,
      ai_generated_response: aiGenerated || false,
    });

    if (logError) {
      console.error('Erro ao registrar log de WhatsApp no Supabase:', logError);
    }

    return new Response(JSON.stringify({ message: 'Mensagem WhatsApp enviada com sucesso e log registrado' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Erro na Edge Function send-whatsapp-via-gateway:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
}); 