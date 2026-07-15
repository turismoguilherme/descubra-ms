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
    .from("commercial_partners")
    .select("id, company_name, trade_name, city, business_type, description, contact_phone, contact_whatsapp, website_url")
    .eq("status", "active")
    .eq("subscription_status", "active")
    .limit(5);

  const like = `%${q}%`;
  builder = builder.or(
    `company_name.ilike.${like},trade_name.ilike.${like},description.ilike.${like},services_offered.cs.{${q}}`,
  );
  if (input.city) builder = builder.ilike("city", `%${input.city}%`);
  if (input.business_type) builder = builder.ilike("business_type", `%${input.business_type}%`);

  const { data, error } = await builder;
  if (error) {
    const output = { error: "erro na busca", hint: error.message };
    await logAction(ctx, "search_partners", input, output, "error", error.message);
    return output;
  }

  const results = (data ?? []).map((p) => ({
    id: p.id,
    name: p.trade_name || p.company_name,
    city: p.city,
    business_type: p.business_type,
    description: p.description ? String(p.description).slice(0, 220) : undefined,
    website: p.website_url ?? undefined,
    whatsapp: p.contact_whatsapp ?? undefined,
  }));

  const output = { count: results.length, results };
  await logAction(ctx, "search_partners", input, output, "success");
  return output;
}
