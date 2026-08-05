import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "search_events",
  title: "Buscar eventos",
  description:
    "Busca eventos turísticos aprovados e visíveis do Descubra MS. Filtra por cidade, categoria e período.",
  inputSchema: {
    query: z.string().optional().describe("Palavra-chave no título do evento."),
    city: z.string().optional().describe("Cidade em MS, ex.: 'Bonito'."),
    category: z.string().optional().describe("Categoria do evento."),
    from_date: z.string().optional().describe("Data inicial YYYY-MM-DD (padrão: hoje)."),
    limit: z.number().int().optional().describe("Máximo de resultados (padrão 10, máx 50)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Não autenticado." }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const limit = Math.min(Math.max(input.limit ?? 10, 1), 50);
    const from = input.from_date ?? new Date().toISOString().slice(0, 10);

    let q = supabase
      .from("events")
      .select("id, titulo, descricao, data_inicio, data_fim, local, cidade, categoria, tipo_entrada, organizador, site_oficial, imagem_principal, is_sponsored")
      .eq("approval_status", "approved")
      .eq("is_visible", true)
      .gte("data_inicio", from)
      .order("data_inicio", { ascending: true })
      .limit(limit);

    if (input.query) q = q.ilike("titulo", `%${input.query}%`);
    if (input.city) q = q.ilike("cidade", `%${input.city}%`);
    if (input.category) q = q.ilike("categoria", `%${input.category}%`);

    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { events: data ?? [] },
    };
  },
});
