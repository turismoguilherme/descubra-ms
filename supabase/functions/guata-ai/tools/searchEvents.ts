import type { GuataAuthContext } from "../../_shared/guataAuth.ts";
import { logAction } from "../../_shared/guataAuth.ts";

export interface SearchEventsInput {
  query?: string;
  city?: string;
  from_date?: string;
  to_date?: string;
  limit?: number;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function resolveSiteOrigin(): string {
  return (Deno.env.get("SITE_ORIGIN") || "https://descubrams.com").replace(/\/$/, "");
}

function defaultFromDate(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function defaultToDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export async function searchEvents(ctx: GuataAuthContext, input: SearchEventsInput) {
  const limit = Math.min(10, Math.max(1, Number(input.limit ?? 8)));
  const fromDate = input.from_date && DATE_RE.test(input.from_date) ? input.from_date : defaultFromDate();
  const toDate = input.to_date && DATE_RE.test(input.to_date) ? input.to_date : defaultToDate(60);
  const q = (input.query || "").trim();
  const city = (input.city || "").trim();

  let builder = ctx.supabaseAdmin
    .from("events_public")
    .select("id, titulo, descricao, data_inicio, data_fim, local, cidade, categoria, link_inscricao")
    .gte("data_inicio", `${fromDate}T00:00:00`)
    .lte("data_inicio", `${toDate}T23:59:59`)
    .order("data_inicio", { ascending: true })
    .limit(limit);

  if (city) {
    builder = builder.ilike("cidade", `%${city}%`);
  }
  if (q) {
    const safe = q.replace(/[%_,.*()]/g, " ").trim();
    if (safe) {
      const like = `%${safe}%`;
      builder = builder.or(`titulo.ilike.${like},descricao.ilike.${like},categoria.ilike.${like}`);
    }
  }

  const { data, error } = await builder;
  if (error) {
    const output = { error: "erro na busca de eventos", hint: error.message };
    await logAction(ctx, "search_events", input, output, "error", error.message);
    return output;
  }

  const origin = resolveSiteOrigin();
  const results = (data ?? []).map((e) => {
    const id = String(e.id);
    const start = e.data_inicio ? String(e.data_inicio) : "";
    const desc = e.descricao ? String(e.descricao).slice(0, 180) : undefined;
    return {
      id,
      title: e.titulo ?? "Evento",
      start_date: start,
      end_date: e.data_fim ? String(e.data_fim) : undefined,
      city: e.cidade ?? undefined,
      location: e.local ?? undefined,
      category: e.categoria ?? undefined,
      registration_url: e.link_inscricao ?? undefined,
      event_url: `${origin}/descubrams/eventos?highlight=${encodeURIComponent(id)}`,
    };
  });

  const output = { count: results.length, results, window: { from_date: fromDate, to_date: toDate } };
  await logAction(ctx, "search_events", input, output, "success");
  return output;
}
