import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

/**
 * Registra/atualiza token FCM + cidade GPS do app Descubra MS.
 * Body: { token, platform, city_name?, latitude?, longitude?, events_nearby?, guata_tips? }
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const admin = createClient(supabaseUrl, serviceKey);

    let userId: string | null = null;
    const authHeader = req.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const userClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data } = await userClient.auth.getUser();
      userId = data.user?.id ?? null;
    }

    const body = await req.json();
    const token = typeof body?.token === 'string' ? body.token.trim() : '';
    const platform = body?.platform === 'ios' || body?.platform === 'web' ? body.platform : 'android';
    if (!token || token.length < 20) {
      return new Response(JSON.stringify({ error: 'token inválido' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const cityName =
      typeof body?.city_name === 'string' && body.city_name.trim()
        ? body.city_name.trim()
        : null;
    const latitude = typeof body?.latitude === 'number' ? body.latitude : null;
    const longitude = typeof body?.longitude === 'number' ? body.longitude : null;
    const eventsNearby = body?.events_nearby !== false;
    const guataTips = body?.guata_tips !== false;

    const { data, error } = await admin
      .from('app_push_devices')
      .upsert(
        {
          fcm_token: token,
          platform,
          user_id: userId,
          city_name: cityName,
          latitude,
          longitude,
          events_nearby: eventsNearby,
          guata_tips: guataTips,
          last_seen_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'fcm_token' }
      )
      .select('id, city_name, events_nearby')
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, device: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('register-app-push-token', e);
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
