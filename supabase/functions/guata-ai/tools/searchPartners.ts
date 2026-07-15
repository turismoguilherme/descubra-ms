import type { GuataAuthContext } from "../../_shared/guataAuth.ts";
import { logAction } from "../../_shared/guataAuth.ts";

export interface SearchPartnersInput {
  query: string;
  city?: string;
  business_type?: string;
}

export async function searchPartners(
  ctx: GuataAuthContext,
  input: SearchPartnersInput,
) {
  const q = (input.query || "").trim();
  if (!q) {
    const output = { error: "query vazia", hint: "Peça ao usuário mais detalhes (tipo de serviço ou cidade)." };
    await logAction(ctx, "search_partners", input, output, "error", "empty query");
    return output;
  }

  let builder = ctx.supabaseAdmin
    .from("institutional_partners")
    .select("id, name, address, partner_type, description, contact_phone, website_url")
    .eq("status", "approved")
    .eq("is_active", true)
    .eq("subscription_status", "active")
    .limit(5);

  const like = `%${q}%`;
  builder = builder.or(`name.ilike.${like},description.ilike.${like},address.ilike.${like}`);
  if (input.city) builder = builder.ilike("address", `%${input.city}%`);
  if (input.business_type) builder = builder.ilike("partner_type", `%${input.business_type}%`);

  const { data, error } = await builder;
  if (error) {
    const output = { error: "erro na busca", hint: error.message };
    await logAction(ctx, "search_partners", input, output, "error", error.message);
    return output;
  }

  const results = (data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    city: extractCityFromAddress(p.address),
    partner_type: p.partner_type,
    description: p.description ? String(p.description).slice(0, 220) : undefined,
    website: p.website_url ?? undefined,
    phone: p.contact_phone ?? undefined,
    reservation_url: `/descubrams/parceiros/${p.id}/reservar`,
  }));

  const output = { count: results.length, results };
  await logAction(ctx, "search_partners", input, output, "success");
  return output;
}

function extractCityFromAddress(address: string | null | undefined): string | undefined {
  if (!address) return undefined;
  const parts = address.split(",").map((s) => s.trim()).filter(Boolean);
  return parts.length > 1 ? parts[parts.length - 1] : undefined;
}
