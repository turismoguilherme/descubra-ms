import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const DEFAULT_PRICE_BRL = 499.9;

function parsePriceValue(raw: unknown): number | null {
  if (raw == null) return null;
  if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) return raw;
  let s = typeof raw === "string" ? raw.trim() : JSON.stringify(raw);
  // JSONB às vezes vem como "\"499.90\""
  if (s.startsWith('"') && s.endsWith('"')) {
    try {
      s = JSON.parse(s);
    } catch {
      /* keep */
    }
  }
  s = String(s).replace(/[^\d.,]/g, "").replace(",", ".");
  const n = parseFloat(s);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Preço atual do cadastro Em Destaque (site_settings.event_sponsor_price). */
export async function getEventSponsorPriceBrl(
  supabase: SupabaseClient,
): Promise<{ price_brl: number; price_cents: number; duration_days: number }> {
  const { data } = await supabase
    .from("site_settings")
    .select("setting_value")
    .eq("platform", "ms")
    .eq("setting_key", "event_sponsor_price")
    .maybeSingle();

  const parsed = parsePriceValue(data?.setting_value);
  const price_brl = parsed ?? DEFAULT_PRICE_BRL;
  return {
    price_brl: Math.round(price_brl * 100) / 100,
    price_cents: Math.round(price_brl * 100),
    duration_days: 30,
  };
}
