import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

type ChannelAction = 'published' | 'approved' | 'rejected';

interface EventRow {
  id: string;
  titulo?: string | null;
  name?: string | null;
  descricao?: string | null;
  description?: string | null;
  local?: string | null;
  location?: string | null;
  data_inicio?: string | null;
  start_date?: string | null;
  logo_evento?: string | null;
  imagem_principal?: string | null;
  approval_status?: string | null;
  is_visible?: boolean | null;
  organizador_nome?: string | null;
  organizador_email?: string | null;
  organizador_telefone?: string | null;
}

function resolveSiteOrigin(): string {
  return (Deno.env.get('SITE_ORIGIN') || 'https://descubrams.com').replace(/\/$/, '');
}

function resolveCity(location: string): string {
  const trimmed = location.trim();
  if (!trimmed) return '';
  const firstPart = trimmed.split(',')[0]?.trim();
  return firstPart || trimmed;
}

function resolveImageUrl(row: EventRow): string {
  const candidate = (row.logo_evento || row.imagem_principal || '').trim();
  if (candidate.startsWith('http://') || candidate.startsWith('https://')) {
    return candidate;
  }
  return `${resolveSiteOrigin()}/branding/descubra-ms-mark.png`;
}

function normalizePhone(phone: string | null | undefined): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('55')) return digits;
  return `55${digits}`;
}

function resolveEventType(action: ChannelAction): string {
  switch (action) {
    case 'approved':
      return 'event.approved';
    case 'rejected':
      return 'event.rejected';
    default:
      return 'event.published';
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const eventId = body?.event_id;
    const action: ChannelAction = body?.action === 'approved' || body?.action === 'rejected'
      ? body.action
      : 'published';
    const rejectionReason = typeof body?.rejection_reason === 'string' ? body.rejection_reason : '';

    if (!eventId || typeof eventId !== 'string') {
      return new Response(JSON.stringify({ error: 'event_id é obrigatório.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const apiUrl = (Deno.env.get('GUATA_CHANNEL_API_URL') || '').replace(/\/$/, '');
    const webhookSecret = Deno.env.get('DESCUBRA_WEBHOOK_SECRET') || '';

    if (!apiUrl || !webhookSecret) {
      console.warn('notify-guata-channel-event: GUATA_CHANNEL_API_URL ou DESCUBRA_WEBHOOK_SECRET não configurados — ignorando.');
      return new Response(JSON.stringify({ ok: true, skipped: true, reason: 'not_configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data: row, error: fetchError } = await supabaseAdmin
      .from('events')
      .select(
        'id,titulo,name,descricao,description,local,location,data_inicio,start_date,logo_evento,imagem_principal,approval_status,is_visible,organizador_nome,organizador_email,organizador_telefone',
      )
      .eq('id', eventId)
      .maybeSingle();

    if (fetchError) {
      console.error('notify-guata-channel-event: erro ao buscar evento', fetchError);
      return new Response(JSON.stringify({ error: 'Falha ao buscar evento.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    if (!row) {
      return new Response(JSON.stringify({ error: 'Evento não encontrado.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    const eventRow = row as EventRow;
    const location = (eventRow.local || eventRow.location || '').trim();
    const siteOrigin = resolveSiteOrigin();
    const title = (eventRow.titulo || eventRow.name || 'Evento').trim();
    const siteUrl = `${siteOrigin}/evento/${eventRow.id}`;
    const organizerPhone = normalizePhone(eventRow.organizador_telefone);

    const payload: Record<string, unknown> = {
      event: resolveEventType(action),
      action,
      event_id: eventRow.id,
      title,
      description: (eventRow.descricao || eventRow.description || '').trim(),
      image_url: resolveImageUrl(eventRow),
      city: resolveCity(location),
      starts_at: eventRow.data_inicio || eventRow.start_date || null,
      site_url: siteUrl,
      organizer: {
        name: (eventRow.organizador_nome || '').trim(),
        email: (eventRow.organizador_email || '').trim(),
        phone: organizerPhone,
      },
    };

    if (action === 'rejected' && rejectionReason) {
      payload.rejection_reason = rejectionReason;
    }

    // Aprovação/rejeição sem telefone: o bot não consegue avisar no WhatsApp privado
    if ((action === 'approved' || action === 'rejected') && !organizerPhone) {
      console.info(`notify-guata-channel-event: ${action} sem telefone do organizador — ignorando DM.`);
      return new Response(JSON.stringify({ ok: true, skipped: true, reason: 'no_organizer_phone' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const webhookResponse = await fetch(`${apiUrl}/webhooks/descubra-ms`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${webhookSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!webhookResponse.ok) {
      const errorBody = await webhookResponse.text();
      console.error('notify-guata-channel-event: webhook falhou', {
        status: webhookResponse.status,
        body: errorBody,
      });
      return new Response(
        JSON.stringify({
          error: 'Falha ao notificar Guatá Channel.',
          status: webhookResponse.status,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 502,
        },
      );
    }

    return new Response(JSON.stringify({ ok: true, event_id: eventId, action }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('notify-guata-channel-event:', error);
    const message = error instanceof Error ? error.message : 'Erro interno';
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
