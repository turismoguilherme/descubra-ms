import type { GuataAuthContext } from "../../_shared/guataAuth.ts";
import { logAction } from "../../_shared/guataAuth.ts";

export interface CheckAvailabilityInput {
  partner_id: string;
  date: string;
  people?: number;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function checkAvailability(
  ctx: GuataAuthContext,
  input: CheckAvailabilityInput,
) {
  if (!UUID_RE.test(input.partner_id || "")) {
    const output = { error: "partner_id inválido", hint: "Use um id obtido em search_partners." };
    await logAction(ctx, "check_availability", input, output, "error", "invalid partner_id");
    return output;
  }
  if (!DATE_RE.test(input.date || "")) {
    const output = { error: "data inválida", hint: "Use YYYY-MM-DD." };
    await logAction(ctx, "check_availability", input, output, "error", "invalid date");
    return output;
  }
  const people = Math.max(1, Number(input.people ?? 1));

  const { data: partner, error: pErr } = await ctx.supabaseAdmin
    .from("commercial_partners")
    .select("id, company_name, trade_name, city, business_type, status")
    .eq("id", input.partner_id)
    .maybeSingle();

  if (pErr || !partner || partner.status !== "active") {
    const output = { error: "parceiro não encontrado ou inativo" };
    await logAction(ctx, "check_availability", input, output, "error", pErr?.message);
    return output;
  }

  const [{ data: avail }, { data: pricing }] = await Promise.all([
    ctx.supabaseAdmin
      .from("partner_availability")
      .select("id, service_id, available, max_guests, booked_guests, notes")
      .eq("partner_id", input.partner_id)
      .eq("date", input.date),
    ctx.supabaseAdmin
      .from("partner_pricing")
      .select("id, service_type, service_name, pricing_type, base_price, price_per_person, price_per_night, min_guests, max_guests")
      .eq("partner_id", input.partner_id)
      .eq("is_active", true),
  ]);

  const slots = (avail ?? [])
    .filter((s) => s.available !== false)
    .map((s) => ({
      service_id: s.service_id,
      remaining: Math.max(0, (s.max_guests ?? 0) - (s.booked_guests ?? 0)),
      notes: s.notes ?? undefined,
    }))
    .filter((s) => s.remaining === 0 || s.remaining >= people);

  const services = (pricing ?? []).map((p) => {
    let estimated: number | null = null;
    if (p.pricing_type === "per_person" && p.price_per_person != null) {
      estimated = Number(p.price_per_person) * people;
    } else if (p.pricing_type === "per_night" && p.price_per_night != null) {
      estimated = Number(p.price_per_night);
    } else if (p.base_price != null) {
      estimated = Number(p.base_price);
    }
    return {
      pricing_id: p.id,
      service_name: p.service_name,
      service_type: p.service_type,
      pricing_type: p.pricing_type,
      estimated_price_brl: estimated,
    };
  });

  const output = {
    partner: { id: partner.id, name: partner.trade_name || partner.company_name, city: partner.city },
    date: input.date,
    people,
    has_availability: slots.length > 0 || (avail?.length ?? 0) === 0, // se sem calendário explícito, deixa Gemini pedir contato
    slots,
    services,
  };
  await logAction(ctx, "check_availability", input, output, "success");
  return output;
}
