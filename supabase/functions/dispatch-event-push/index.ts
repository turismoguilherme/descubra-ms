import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { create, getNumericDate } from 'https://deno.land/x/djwt@v3.0.2/mod.ts';
import { corsHeaders } from '../_shared/cors.ts';

type Kind = 'event_new' | 'event_reminder';

interface EventRow {
  id: string;
  titulo?: string | null;
  name?: string | null;
  cidade?: string | null;
  local?: string | null;
  location?: string | null;
  data_inicio?: string | null;
  start_date?: string | null;
}

interface ServiceAccount {
  project_id?: string;
  client_email: string;
  private_key: string;
}

function normalizeCity(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function cityFromEvent(row: EventRow): string {
  const raw = (row.cidade || row.local || row.location || '').trim();
  if (!raw) return '';
  return raw.split(',')[0]?.trim() || raw;
}

function eventTitle(row: EventRow): string {
  return (row.titulo || row.name || 'Evento').trim();
}

function citiesMatch(a: string, b: string): boolean {
  const na = normalizeCity(a);
  const nb = normalizeCity(b);
  if (!na || !nb) return false;
  return na === nb || na.includes(nb) || nb.includes(na);
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s+/g, '');
  const raw = atob(b64);
  const buf = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) buf[i] = raw.charCodeAt(i);
  return buf.buffer;
}

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(pem),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

/** OAuth2 access token via service account (FCM HTTP v1) */
async function getAccessToken(sa: ServiceAccount): Promise<string> {
  const key = await importPrivateKey(sa.private_key);
  const jwt = await create(
    { alg: 'RS256', typ: 'JWT' },
    {
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/firebase.messaging',
      aud: 'https://oauth2.googleapis.com/token',
      iat: getNumericDate(0),
      exp: getNumericDate(60 * 60),
    },
    key
  );

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  const json = await res.json();
  if (!json.access_token) {
    throw new Error(`Falha OAuth FCM: ${JSON.stringify(json)}`);
  }
  return json.access_token as string;
}

async function sendFcmV1(
  accessToken: string,
  projectId: string,
  deviceToken: string,
  title: string,
  body: string,
  deepLink: string
) {
  const res = await fetch(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          token: deviceToken,
          notification: { title, body },
          data: {
            deep_link: deepLink,
            type: 'guata_event',
          },
          android: { priority: 'HIGH' },
        },
      }),
    }
  );
  const json = await res.json();
  if (!res.ok) {
    throw new Error(JSON.stringify(json));
  }
  return json;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const secret = Deno.env.get('PUSH_DISPATCH_SECRET') || '';
    const auth = req.headers.get('Authorization') || '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;

    let allowed = (secret && auth === `Bearer ${secret}`) || auth === `Bearer ${serviceKey}`;

    if (!allowed && auth.startsWith('Bearer ')) {
      const userClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: auth } },
      });
      const { data: userData } = await userClient.auth.getUser();
      if (userData.user) {
        const adminClient = createClient(supabaseUrl, serviceKey);
        const { data: roles } = await adminClient
          .from('user_roles')
          .select('role')
          .eq('user_id', userData.user.id);
        const roleList = (roles || []).map((r: { role?: string }) =>
          String(r.role || '').toLowerCase()
        );
        const isAdmin = roleList.some(
          (r) =>
            r.includes('admin') ||
            r === 'master' ||
            r === 'super_admin' ||
            r === 'descubra_admin'
        );
        if (isAdmin) allowed = true;
      }
    }

    if (!allowed) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const saRaw = Deno.env.get('FCM_SERVICE_ACCOUNT_JSON');
    if (!saRaw) {
      return new Response(
        JSON.stringify({
          error:
            'Configure o secret FCM_SERVICE_ACCOUNT_JSON (JSON da conta de serviço Firebase, API V1)',
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sa = JSON.parse(saRaw) as ServiceAccount;
    const projectId =
      Deno.env.get('FCM_PROJECT_ID') ||
      sa.project_id ||
      'descubra-mato-grosso-do-b491e';

    const admin = createClient(supabaseUrl, serviceKey);
    const siteOrigin = (Deno.env.get('SITE_ORIGIN') || 'https://descubrams.com').replace(/\/$/, '');
    const body = await req.json().catch(() => ({}));
    const kind: Kind = body?.kind === 'event_reminder' ? 'event_reminder' : 'event_new';
    const maxPerWeek = Number(Deno.env.get('PUSH_MAX_PER_WEEK') || '3');

    let events: EventRow[] = [];

    if (body?.scan === true && kind === 'event_reminder') {
      const now = new Date();
      const inTwoDays = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
      const { data, error } = await admin
        .from('events')
        .select(
          'id, titulo, name, cidade, local, location, data_inicio, start_date, approval_status, is_visible'
        )
        .eq('is_visible', true)
        .in('approval_status', ['approved', 'aprovado'])
        .gte('data_inicio', now.toISOString().slice(0, 10))
        .lte('data_inicio', inTwoDays.toISOString().slice(0, 10));
      if (error) throw error;
      events = (data || []) as EventRow[];
    } else {
      const eventId = body?.event_id;
      if (!eventId || typeof eventId !== 'string') {
        return new Response(JSON.stringify({ error: 'event_id obrigatório' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const { data, error } = await admin
        .from('events')
        .select(
          'id, titulo, name, cidade, local, location, data_inicio, start_date, approval_status, is_visible'
        )
        .eq('id', eventId)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        return new Response(JSON.stringify({ error: 'evento não encontrado' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      events = [data as EventRow];
    }

    const accessToken = await getAccessToken(sa);
    let sent = 0;
    let skipped = 0;

    for (const event of events) {
      const city = cityFromEvent(event);
      if (!city) {
        skipped++;
        continue;
      }
      const title = eventTitle(event);
      const deepLink = `${siteOrigin}/descubrams/eventos?evento=${event.id}`;
      const notifTitle = 'Guatá';
      const notifBody =
        kind === 'event_reminder'
          ? `Evento em ${city} em breve: ${title}. Quer conferir?`
          : `Vi um evento em ${city}: ${title}. Quer ver?`;

      const { data: devices, error: devErr } = await admin
        .from('app_push_devices')
        .select('id, fcm_token, city_name')
        .eq('events_nearby', true)
        .not('city_name', 'is', null);
      if (devErr) throw devErr;

      const matched = (devices || []).filter((d) =>
        citiesMatch(String(d.city_name || ''), city)
      );

      for (const device of matched) {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const { count } = await admin
          .from('app_push_log')
          .select('id', { count: 'exact', head: true })
          .eq('device_id', device.id)
          .gte('created_at', weekAgo);
        if ((count || 0) >= maxPerWeek) {
          skipped++;
          continue;
        }

        const { error: dedupeErr } = await admin.from('app_push_log').insert({
          device_id: device.id,
          event_id: event.id,
          kind,
          title: notifTitle,
          body: notifBody,
          deep_link: deepLink,
        });
        if (dedupeErr) {
          skipped++;
          continue;
        }

        try {
          await sendFcmV1(
            accessToken,
            projectId,
            device.fcm_token,
            notifTitle,
            notifBody,
            deepLink
          );
          sent++;
        } catch (sendErr) {
          console.error('FCM send failed', device.id, sendErr);
          await admin
            .from('app_push_log')
            .delete()
            .eq('device_id', device.id)
            .eq('event_id', event.id)
            .eq('kind', kind);
        }
      }
    }

    return new Response(JSON.stringify({ ok: true, sent, skipped, events: events.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('dispatch-event-push', e);
    return new Response(JSON.stringify({ error: String((e as Error)?.message || e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
