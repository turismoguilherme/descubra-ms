import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_passport_routes",
  title: "Listar roteiros do passaporte",
  description:
    "Lista roteiros publicados do Passaporte Digital do Descubra MS, com dificuldade, duração e número de dias. Passe route_id para receber também os checkpoints do roteiro.",
  inputSchema: {
    route_id: z.string().optional().describe("UUID do roteiro para detalhar checkpoints."),
    region: z.string().optional().describe("Região turística (opcional)."),
    limit: z.number().int().optional().describe("Máximo de roteiros (padrão 20, máx 50)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Não autenticado." }], isError: true };
    }
    const supabase = supabaseForUser(ctx);

    if (input.route_id) {
      const { data: route, error } = await supabase
        .from("routes")
        .select("id, name, description, region, difficulty, estimated_duration, total_days, checkpoint_order_mode, google_maps_embed_url, image_url")
        .eq("id", input.route_id)
        .eq("is_published", true)
        .maybeSingle();
      if (error) return { content: [{ type: "text", text: error.message }], isError: true };
      if (!route) return { content: [{ type: "text", text: "Roteiro não encontrado." }], isError: true };

      const { data: checkpoints, error: cpErr } = await supabase
        .from("route_checkpoints")
        .select("*")
        .eq("route_id", input.route_id);
      if (cpErr) return { content: [{ type: "text", text: cpErr.message }], isError: true };

      const payload = { route, checkpoints: checkpoints ?? [] };
      return {
        content: [{ type: "text", text: JSON.stringify(payload) }],
        structuredContent: payload,
      };
    }

    const limit = Math.min(Math.max(input.limit ?? 20, 1), 50);
    let q = supabase
      .from("routes")
      .select("id, name, description, region, difficulty, estimated_duration, total_days, checkpoint_order_mode")
      .eq("is_published", true)
      .order("name", { ascending: true })
      .limit(limit);
    if (input.region) q = q.ilike("region", `%${input.region}%`);

    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { routes: data ?? [] },
    };
  },
});
