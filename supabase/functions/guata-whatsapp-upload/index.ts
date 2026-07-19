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

const BUCKET = "tourism-images";
const FOLDER = "event-logos";
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

const EXT_BY_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }
  if (!isInternalBotRequest(req)) {
    return json({ error: "Unauthorized" }, 401);
  }

  try {
    const body = (await req.json().catch(() => ({}))) as {
      whatsapp_phone?: string;
      image_base64?: string;
      mimetype?: string;
    };

    const phone = body.whatsapp_phone?.trim() || "";
    const base64 = body.image_base64 || "";
    const mimetype = (body.mimetype || "").toLowerCase();

    if (!phone) return json({ error: "whatsapp_phone required" }, 400);
    if (!base64) return json({ error: "image_base64 required" }, 400);
    if (!EXT_BY_TYPE[mimetype]) {
      return json({ error: "unsupported_mimetype", hint: "Envie PNG, JPG, WEBP ou GIF." }, 400);
    }

    const ctx = buildAuthContext(req);
    const userId = await resolveUserIdByPhone(ctx, phone);
    if (!userId) {
      return json({
        linked: false,
        hint: "Vincule seu número no Descubra MS antes de enviar a logo.",
      }, 403);
    }

    let bytes: Uint8Array;
    try {
      const clean = base64.includes(",") ? base64.split(",").pop()! : base64;
      bytes = Uint8Array.from(atob(clean), (c) => c.charCodeAt(0));
    } catch (_e) {
      return json({ error: "invalid_base64" }, 400);
    }

    if (bytes.byteLength > MAX_BYTES) {
      return json({ error: "too_large", hint: "A imagem deve ter até 5MB." }, 400);
    }

    const ext = EXT_BY_TYPE[mimetype];
    const path = `${FOLDER}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await ctx.supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, bytes, { contentType: mimetype, upsert: false });

    if (uploadError) {
      return json({ error: "upload_failed", message: uploadError.message }, 500);
    }

    const { data } = ctx.supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
    if (!data?.publicUrl) {
      return json({ error: "no_public_url" }, 500);
    }

    return json({ url: data.publicUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    return json({ error: message }, 500);
  }
});
