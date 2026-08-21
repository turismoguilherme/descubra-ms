import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { requireAdmin, guardResponse, serviceClient } from '../_shared/authGuard.ts';

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
// Este é o número do WhatsApp Business API da Twilio (ex: whatsapp:+1234567890)
const TWILIO_WHATSAPP_NUMBER = Deno.env.get('TWILIO_WHATSAPP_NUMBER');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Gateway de envio: apenas admins ou chamadas internas (evita relay aberto)
    const auth = await requireAdmin(req);
    if (!auth.ok) return guardResponse(auth, corsHeaders);

    const { to, body, relatedTicketId, aiGenerated } = await req.json();

    if (typeof to !== 'string' || typeof body !== 'string' || !to.trim() || !body.trim()) {
      return new Response(JSON.stringify({ error: 'Campos obrigatórios ausentes: to, body' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const normalizedTo = to.trim().startsWith('whatsapp:') ? to.trim() : `whatsapp:${to.trim()}`;
    if (!/^whatsapp:\+[1-9]\d{7,14}$/.test(normalizedTo)) {
      return new Response(JSON.stringify({ error: 'Número de destino inválido' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_NUMBER) {
      console.error('send-whatsapp-via-gateway: credenciais Twilio ausentes');
      return new Response(JSON.stringify({ error: 'Serviço de mensagens indisponível' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 503,
      });
    }

    const twilioAuth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

    const twilioResponse = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${twilioAuth}`,
      },
      body: new URLSearchParams({
        To: normalizedTo,
        From: TWILIO_WHATSAPP_NUMBER,
        Body: body.slice(0, 1500),
      }).toString(),
    });

    if (!twilioResponse.ok) {
      const errorText = await twilioResponse.text();
      console.error('send-whatsapp-via-gateway: falha Twilio', twilioResponse.status, errorText);
      return new Response(JSON.stringify({ error: 'Falha ao enviar mensagem' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 502,
      });
    }

    const supabaseAdmin = serviceClient();

    const { error: logError } = await supabaseAdmin.from('communication_logs').insert({
      direction: 'out',
      channel: 'whatsapp',
      from_address: TWILIO_WHATSAPP_NUMBER,
      to_address: normalizedTo,
      subject_or_topic: 'Mensagem WhatsApp',
      body: body,
      status: 'sent',
      related_ticket_id: relatedTicketId || null,
      ai_generated_response: aiGenerated || false,
    });

    if (logError) {
      console.error('Erro ao registrar log de WhatsApp:', logError.message);
    }

    return new Response(JSON.stringify({ message: 'Mensagem WhatsApp enviada com sucesso' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Erro na Edge Function send-whatsapp-via-gateway:', error instanceof Error ? error.message : error);
    return new Response(JSON.stringify({ error: 'Erro interno' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
