import type { GuataAuthContext } from "../../_shared/guataAuth.ts";
import { checkWriteRateLimit, logAction } from "../../_shared/guataAuth.ts";
import { getEventSponsorPriceBrl } from "../../_shared/eventSponsorPrice.ts";

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
  /** Forma de cadastro na plataforma: gratuito | destaque */
  listing_type?: string;
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
  const listingRaw = String(input.listing_type || "gratuito").trim().toLowerCase();
  const listingType = listingRaw === "destaque" || listingRaw === "pago" || listingRaw === "sponsored"
    ? "destaque"
    : "gratuito";

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

  if (listingType === "destaque" && !input.logo_url && !input.promo_video_url) {
    const output = {
      error: "mídia obrigatória para destaque",
      hint: "Para Em Destaque, peça logo (anexo no chat) OU link de vídeo promocional antes de cadastrar.",
    };
    await logAction(ctx, "create_event_draft", input, output, "error", "destaque media required");
    return output;
  }

  const rl = await checkWriteRateLimit(ctx, "create_event_draft");
  if (!rl.ok) {
    const output = { error: "rate_limited", hint: `Limite de 5 ações/hora atingido (${rl.used} usadas).` };
    await logAction(ctx, "create_event_draft", input, output, "rate_limited");
    return output;
  }

  const price = listingType === "destaque"
    ? await getEventSponsorPriceBrl(ctx.supabaseAdmin)
    : null;

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
    is_sponsored: listingType === "destaque",
    sponsor_payment_status: listingType === "destaque" ? "pending" : null,
    sponsor_tier: listingType === "destaque" ? "destaque" : null,
    sponsor_amount: price?.price_brl ?? null,
  };

  const { data, error } = await ctx.supabaseAdmin
    .from("events")
    .insert(insertRow)
    .select("id, titulo, cidade, data_inicio, approval_status, is_sponsored, sponsor_payment_status")
    .single();

  if (error || !data) {
    const output = { error: "falha ao cadastrar", hint: error?.message ?? "erro desconhecido" };
    await logAction(ctx, "create_event_draft", input, output, "error", error?.message);
    return output;
  }

  if (listingType === "destaque") {
    const output = {
      success: true,
      event_id: data.id,
      listing_type: "destaque",
      status: data.approval_status,
      sponsor_payment_status: data.sponsor_payment_status,
      price_brl: price!.price_brl,
      price_formatted: `R$ ${price!.price_brl.toFixed(2).replace(".", ",")}`,
      duration_days: price!.duration_days,
      next_step: "create_event_checkout_link",
      message:
        `Evento Em Destaque criado (id=${data.id}). Próximo passo OBRIGATÓRIO: chame create_event_checkout_link com este event_id e mostre o checkout_url (link + QR no chat). Valor: R$ ${price!.price_brl.toFixed(2).replace(".", ",")} / ${price!.duration_days} dias. NÃO diga que já está no calendário até o pagamento.`,
    };
    await logAction(ctx, "create_event_draft", input, output, "success");
    return output;
  }

  const output = {
    success: true,
    event_id: data.id,
    listing_type: "gratuito",
    status: data.approval_status,
    message:
      "Evento gratuito enviado para moderação do admin. Informe o event_id e que só aparece no calendário após aprovação. NÃO diga que já está publicado no site.",
  };
  await logAction(ctx, "create_event_draft", input, output, "success");
  return output;
}
