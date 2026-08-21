import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { requireAdmin } from "../_shared/authGuard.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}


function dataUrlToBytes(dataUrl: string): { bytes: Uint8Array; contentType: string; ext: string } | null {
  const match = /^data:([^;]+);base64,(.+)$/i.exec(dataUrl);
  if (!match) return null;
  const contentType = match[1] || "image/png";
  const bin = atob(match[2]);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const ext = contentType.includes("jpeg")
    ? "jpg"
    : contentType.includes("webp")
      ? "webp"
      : "png";
  return { bytes, contentType, ext };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = Deno.env.get("SUPABASE_URL") ?? "";
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!url || !key) {
      return json({ ok: false, error: "Credenciais do servidor ausentes" }, 500);
    }

    const body = await req.json();
    if (!body || typeof body !== "object") {
      return json({ ok: false, error: "Body inválido" }, 400);
    }

    const action = String(body.action || "save");
    const slug = String(body.slug || "guata-capacita").trim();
    const supabase = createClient(url, key);

    if (action === "load") {
      const { data, error } = await supabase
        .from("guata_cartilhas")
        .select("id, slug, content_data, updated_at")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return json({
        ok: true,
        id: data?.id ?? null,
        content_data: data?.content_data ?? {},
        updated_at: data?.updated_at ?? null,
      });
    }

    // Escrita/upload exige administrador autenticado (sem credenciais no código)
    const auth = await requireAdmin(req);
    if (!auth.ok) {
      return json({ ok: false, error: auth.error }, auth.status);
    }


    if (action === "upload") {
      const dataUrl = typeof body.dataUrl === "string" ? body.dataUrl : "";
      const parsed = dataUrlToBytes(dataUrl);
      if (!parsed) return json({ ok: false, error: "Imagem inválida" }, 400);
      const path = `assets/${crypto.randomUUID()}-mascot.${parsed.ext}`;
      const { error: upErr } = await supabase.storage
        .from("guata-cartilhas")
        .upload(path, parsed.bytes, {
          contentType: parsed.contentType,
          upsert: true,
        });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("guata-cartilhas").getPublicUrl(path);
      return json({ ok: true, url: pub.publicUrl });
    }

    if (action === "save") {
      const contentData =
        body.content_data && typeof body.content_data === "object"
          ? body.content_data
          : {};
      const { data, error } = await supabase
        .from("guata_cartilhas")
        .update({
          content_data: contentData,
          updated_at: new Date().toISOString(),
        })
        .eq("slug", slug)
        .select("id, updated_at")
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        return json({ ok: false, error: `Cartilha não encontrada: ${slug}` }, 404);
      }
      return json({ ok: true, id: data.id, updated_at: data.updated_at });
    }

    return json({ ok: false, error: `Ação desconhecida: ${action}` }, 400);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return json({ ok: false, error: message }, 500);
  }
});
