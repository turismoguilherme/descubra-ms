import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body = await req.json()

    if (!body || typeof body !== 'object') {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid body' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const url = Deno.env.get('SUPABASE_URL') ?? ''
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    if (!url || !key) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing Supabase service credentials' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const supabase = createClient(url, key)

    const { data, error } = await supabase
      .from('guata_feedback')
      .insert({
        user_id: body.user_id ?? null,
        session_id: body.session_id ?? null,
        question: body.question,
        answer: body.answer ?? null,
        positive: !!body.positive,
        correction: body.correction ?? null,
        source_title: body.source?.title ?? null,
        url: body.source?.url ?? null,
        domain: body.source?.domain ?? (body.source?.url ? new URL(body.source.url).hostname : null),
        meta: body.meta ?? null
      })
      .select()
      .single()

    if (error) throw error

    return new Response(JSON.stringify({ ok: true, id: data.id }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e?.message || e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
