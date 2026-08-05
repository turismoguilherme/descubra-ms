import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_my_passport_progress",
  title: "Meu progresso no passaporte",
  description:
    "Retorna os selos (check-ins) do Passaporte Digital do usuário logado, com pontos acumulados. Opcionalmente filtra por roteiro.",
  inputSchema: {
    route_id: z.string().optional().describe("UUID do roteiro para filtrar (opcional)."),
    limit: z.number().int().optional().describe("Máximo de selos (padrão 50, máx 200)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Não autenticado." }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const limit = Math.min(Math.max(input.limit ?? 50, 1), 200);

    let q = supabase
      .from("passport_stamps")
      .select("id, route_id, checkpoint_id, destination_id, stamp_type, activity_type, points_earned, stamped_at")
      .eq("user_id", ctx.getUserId())
      .order("stamped_at", { ascending: false })
      .limit(limit);
    if (input.route_id) q = q.eq("route_id", input.route_id);

    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    const stamps = data ?? [];
    const payload = {
      total_stamps: stamps.length,
      total_points: stamps.reduce((sum, s) => sum + (Number(s.points_earned) || 0), 0),
      stamps,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(payload) }],
      structuredContent: payload,
    };
  },
});
