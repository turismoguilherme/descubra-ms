import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_my_reservations",
  title: "Minhas reservas",
  description:
    "Lista as reservas do usuário logado com parceiros do Descubra MS (status, valor, código e datas).",
  inputSchema: {
    status: z.string().optional().describe("Filtrar por status, ex.: 'pending', 'confirmed', 'cancelled'."),
    limit: z.number().int().optional().describe("Máximo de reservas (padrão 20, máx 100)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Não autenticado." }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const limit = Math.min(Math.max(input.limit ?? 20, 1), 100);

    let q = supabase
      .from("partner_reservations")
      .select("id, reservation_code, partner_id, service_name, reservation_date, reservation_time, check_in_date, check_out_date, guests, total_amount, status, payment_status, created_at")
      .eq("user_id", ctx.getUserId())
      .order("created_at", { ascending: false })
      .limit(limit);
    if (input.status) q = q.eq("status", input.status);

    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { reservations: data ?? [] },
    };
  },
});
