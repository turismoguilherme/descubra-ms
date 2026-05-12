import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHmac } from 'node:crypto';

/**
 * Validates Twilio HMAC-SHA1 signature.
 * https://www.twilio.com/docs/usage/webhooks/webhooks-security
 */
function validateTwilioSignature(
  signature: string,
  url: string,
  params: Record<string, string>,
): boolean {
  const token = Deno.env.get('TWILIO_AUTH_TOKEN');
  if (!token) return false;
  const data = Object.keys(params)
    .sort()
    .reduce((acc, k) => acc + k + params[k], url);
  const expected = createHmac('sha1', token).update(data).digest('base64');
  return signature === expected;
}

serve(async (req) => {
  try {
    const formData = await req.formData();
    const params: Record<string, string> = {};
    for (const [k, v] of formData.entries()) params[k] = v.toString();

    // Validar assinatura Twilio (proteção contra forja de mensagens)
    const signature = req.headers.get('X-Twilio-Signature');
    const webhookUrl =
      Deno.env.get('TWILIO_WEBHOOK_URL') ?? req.url;
    if (!signature || !validateTwilioSignature(signature, webhookUrl, params)) {
      console.warn('receive-whatsapp-webhook: assinatura Twilio inválida');
      return new Response('Forbidden', { status: 403 });
    }

    const from = params['From'];
    const to = params['To'];
    const body = params['Body'];
    const messageSid = params['SmsMessageSid'];

    if (!from || !to || !body) {
      return new Response(JSON.stringify({ error: 'Dados de webhook incompletos.' }), { status: 400 });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { error: logError } = await supabaseAdmin.from('communication_logs').insert({
      direction: 'in',
      channel: 'whatsapp',
      from_address: from,
      to_address: to,
      subject_or_topic: `Mensagem WhatsApp - ${messageSid}`,
      body,
      status: 'received',
    });

    if (logError) {
      console.error('receive-whatsapp-webhook: log error', { message: logError.message });
      return new Response(JSON.stringify({ error: 'Falha ao registrar mensagem.' }), { status: 500 });
    }

    return new Response('<Response></Response>', {
      headers: { 'Content-Type': 'text/xml' },
      status: 200,
    });
  } catch (error: any) {
    console.error('receive-whatsapp-webhook: handler error', { message: error?.message, stack: error?.stack });
    return new Response(JSON.stringify({ error: 'Erro interno' }), { status: 500 });
  }
});
