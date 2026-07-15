import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import {
  buildAuthContext,
  isInternalBotRequest,
  resolveUserIdByPhone,
} from "../_shared/guataAuth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const LINK_URL = "https://descubrams.com/descubrams/login";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!isInternalBotRequest(req)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json().catch(() => ({})) as { whatsapp_phone?: string };
    const phone = body.whatsapp_phone?.trim() || "";
    if (!phone) {
      return new Response(JSON.stringify({ error: "whatsapp_phone required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ctx = buildAuthContext(req);
    const userId = await resolveUserIdByPhone(ctx, phone);

    if (!userId) {
      return new Response(
        JSON.stringify({
          linked: false,
          link_url: LINK_URL,
          hint:
            "Cadastre o mesmo número do WhatsApp no perfil do Descubra MS e envie 'vincular' aqui.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: profile } = await ctx.supabaseAdmin
      .from("user_profiles")
      .select("full_name, display_name")
      .eq("user_id", userId)
      .maybeSingle();

    return new Response(
      JSON.stringify({
        linked: true,
        user_id: userId,
        name: profile?.display_name || profile?.full_name || null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
