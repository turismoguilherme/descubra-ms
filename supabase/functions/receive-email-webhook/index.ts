import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { serviceClient } from '../_shared/authGuard.ts';

/**
 * Webhook de recebimento de e-mails (ex.: SendGrid Inbound Parse).
 *
 * Segurança: o provedor deve chamar esta função com um segredo compartilhado
 * (header `x-webhook-secret` ou query `?token=`) igual ao secret
 * EMAIL_WEBHOOK_SECRET. Sem o segredo configurado, a função recusa tudo
 * (fail-closed) para evitar injeção de mensagens falsas.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function isAuthorized(req: Request): boolean {
  const expected = Deno.env.get('EMAIL_WEBHOOK_SECRET')?.trim();
  if (!expected) return false;
  const header = req.headers.get('x-webhook-secret')?.trim() ?? '';
  if (header && timingSafeEqual(header, expected)) return true;
  try {
    const token = new URL(req.url).searchParams.get('token')?.trim() ?? '';
    return !!token && timingSafeEqual(token, expected);
  } catch {
    return false;
  }
}

serve(async (req) => {
  try {
    if (!isAuthorized(req)) {
      console.warn('receive-email-webhook: chamada não autorizada');
      return new Response('Forbidden', { status: 403 });
    }

    const body = await req.json();

    const fromAddress = body.from;
    const toAddress = body.to;
    const subject = body.subject;
    const emailBody = body.text || body.html;

    if (!fromAddress || !toAddress || !subject || !emailBody) {
      return new Response(JSON.stringify({ error: 'Dados de webhook de e-mail incompletos.' }), {
        status: 400,
      });
    }

    const supabaseAdmin = serviceClient();

    const { data: loggedEmail, error: logError } = await supabaseAdmin
      .from('communication_logs')
      .insert({
        direction: 'in',
        channel: 'email',
        from_address: String(fromAddress).slice(0, 320),
        to_address: String(toAddress).slice(0, 320),
        subject_or_topic: String(subject).slice(0, 300),
        body: String(emailBody),
        status: 'received',
        ai_generated_response: false,
      })
      .select('id')
      .single();

    if (logError) {
      console.error('receive-email-webhook: erro ao registrar e-mail', logError.message);
      return new Response(JSON.stringify({ error: 'Falha ao registrar e-mail.' }), { status: 500 });
    }

    return new Response(JSON.stringify({
      message: 'E-mail recebido e log registrado',
      email_id: loggedEmail?.id,
    }), { status: 200 });
  } catch (error) {
    console.error('receive-email-webhook: erro', error instanceof Error ? error.message : error);
    return new Response(JSON.stringify({ error: 'Erro interno' }), { status: 500 });
  }
});
