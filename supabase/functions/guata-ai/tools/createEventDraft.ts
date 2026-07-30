import type { GuataAuthContext } from "../../_shared/guataAuth.ts";
import { checkWriteRateLimit, logAction } from "../../_shared/guataAuth.ts";

export interface CreateEventDraftInput {
  title: string;
  start_date: string;
  end_date?: string;
  location?: string;
  city: string;
  description?: string;
  category?: string;
  organizer?: string;
  /** Entrada do público no evento (não é a taxa da plataforma). */
  entry_type?: string;
  logo_url?: string;
  promo_video_url?: string;
}

function isIsoDate(s: string | undefined): boolean {
  if (!s) return false;
  const d = new Date(s);
  return !isNaN(d.getTime()) && d.getTime() > Date.now() - 24 * 60 * 60 * 1000;
}

function isHttpUrl(s: string | undefined): boolean {
  if (!s) return false;
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export async function createEventDraft(
  ctx: GuataAuthContext,
  input: CreateEventDraftInput,
) {
  if (!ctx.userId) {
    const output = { error: "auth_required", hint: "O usuário precisa estar logado." };
    return output;
  }

  const title = String(input.title || "").trim();
  const city = String(input.city || "").trim();

  if (title.length < 3 || title.length > 200) {
    const output = { error: "título inválido", hint: "Peça um título entre 3 e 200 caracteres." };
    await logAction(ctx, "create_event_draft", input, output, "error", "invalid title");
    return output;
  }
  if (!city) {
    const output = { error: "cidade obrigatória", hint: "Pergunte a cidade em MS." };
    await logAction(ctx, "create_event_draft", input, output, "error", "missing city");
    return output;
  }
  if (!isIsoDate(input.start_date)) {
    const output = { error: "start_date inválido", hint: "Use ISO 8601 e data futura." };
    await logAction(ctx, "create_event_draft", input, output, "error", "invalid start_date");
    return output;
  }
  if (input.end_date && !isIsoDate(input.end_date)) {
    const output = { error: "end_date inválido" };
    await logAction(ctx, "create_event_draft", input, output, "error", "invalid end_date");
    return output;
  }
  if (input.logo_url && !isHttpUrl(input.logo_url)) {
    const output = { error: "logo_url inválido", hint: "A logo precisa ser uma URL http(s) válida." };
    await logAction(ctx, "create_event_draft", input, output, "error", "invalid logo_url");
    return output;
  }
  if (input.promo_video_url && !isHttpUrl(input.promo_video_url)) {
    const output = { error: "promo_video_url inválido", hint: "O vídeo precisa ser uma URL http(s) válida (YouTube, etc.)." };
    await logAction(ctx, "create_event_draft", input, output, "error", "invalid promo_video_url");
    return output;
  }

  const rl = await checkWriteRateLimit(ctx, "create_event_draft");
  if (!rl.ok) {
    const output = { error: "rate_limited", hint: `Limite de 5 ações/hora atingido (${rl.used} usadas).` };
    await logAction(ctx, "create_event_draft", input, output, "rate_limited");
    return output;
  }

  const externalId = `guata-${crypto.randomUUID()}`;

  const insertRow: Record<string, unknown> = {
    external_id: externalId,
    titulo: title,
    descricao: input.description ?? null,
    data_inicio: input.start_date,
    data_fim: input.end_date ?? null,
    local: input.location ?? null,
    cidade: city,
    estado: "Mato Grosso do Sul",
    categoria: input.category ?? null,
    tipo_entrada: input.entry_type ?? null,
    organizador: input.organizer ?? null,
    logo_evento: input.logo_url ?? null,
    imagem_principal: input.logo_url ?? null,
    video_promocional: input.promo_video_url ?? null,
    fonte: "guata_chat",
    source: "guata_chat",
    approval_status: "pending",
    is_visible: false,
    created_by: ctx.userId,
    is_sponsored: false,
  };

  const { data, error } = await ctx.supabaseAdmin
    .from("events")
    .insert(insertRow)
    .select("id, titulo, cidade, data_inicio, approval_status")
    .single();

  if (error || !data) {
    const output = { error: "falha ao cadastrar", hint: error?.message ?? "erro desconhecido" };
    await logAction(ctx, "create_event_draft", input, output, "error", error?.message);
    return output;
  }

  const output = {
    success: true,
    event_id: data.id,
    status: data.approval_status,
    message:
      "Evento gratuito enviado para moderação do admin. Informe o event_id e que só aparece no calendário após aprovação. NÃO diga que já está publicado no site.",
  };
  await logAction(ctx, "create_event_draft", input, output, "success");
  return output;
}
