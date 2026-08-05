import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "search_partners",
  title: "Buscar parceiros",
  description:
    "Busca parceiros ativos e aprovados do Descubra MS (pousadas, restaurantes, agências, atrativos).",
  inputSchema: {
    query: z.string().optional().describe("Nome ou palavra-chave do parceiro."),
    partner_type: z.string().optional().describe("Tipo de parceiro (opcional)."),
    limit: z.number().int().optional().describe("Máximo de resultados (padrão 10, máx 50)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Não autenticado." }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const limit = Math.min(Math.max(input.limit ?? 10, 1), 50);

    let q = supabase
      .from("institutional_partners")
      .select("id, name, description, partner_type, website_url, contact_email, contact_phone, logo_url")
      .eq("is_active", true)
      .order("name", { ascending: true })
      .limit(limit);

    if (input.query) q = q.ilike("name", `%${input.query}%`);
    if (input.partner_type) q = q.ilike("partner_type", `%${input.partner_type}%`);

    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { partners: data ?? [] },
    };
  },
});
