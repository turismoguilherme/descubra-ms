import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import type { GuataAuthContext } from "../../_shared/guataAuth.ts";
import { checkWriteRateLimit, logAction } from "../../_shared/guataAuth.ts";
import { getEventSponsorPriceBrl } from "../../_shared/eventSponsorPrice.ts";

export interface CreateEventCheckoutLinkInput {
  event_id: string;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function createEventCheckoutLink(
  ctx: GuataAuthContext,
  input: CreateEventCheckoutLinkInput,
) {
  if (!ctx.userId) {
    return { error: "auth_required", hint: "O usuário precisa estar logado." };
  }

  if (!UUID_RE.test(input.event_id || "")) {
    const output = { error: "event_id inválido" };
    await logAction(ctx, "create_event_checkout_link", input, output, "error", "invalid id");
    return output;
  }

  const rl = await checkWriteRateLimit(ctx, "create_event_checkout_link");
  if (!rl.ok) {
    const output = { error: "rate_limited", hint: `Limite de 5 ações/hora atingido (${rl.used} usadas).` };
    await logAction(ctx, "create_event_checkout_link", input, output, "rate_limited");
    return output;
  }

  const { data: event, error: evErr } = await ctx.supabaseAdmin
    .from("events")
    .select("id, titulo, created_by, is_sponsored, sponsor_payment_status, contato_email, organizador")
    .eq("id", input.event_id)
    .maybeSingle();

  if (evErr || !event) {
    const output = { error: "evento não encontrado" };
    await logAction(ctx, "create_event_checkout_link", input, output, "error", evErr?.message);
    return output;
  }

  if (event.created_by !== ctx.userId) {
    const output = { error: "acesso negado", hint: "Este evento não pertence ao usuário logado." };
    await logAction(ctx, "create_event_checkout_link", input, output, "error", "not owner");
    return output;
  }

  if (!event.is_sponsored) {
    const output = {
      error: "evento não é destaque",
      hint: "Só eventos com listing_type=destaque precisam de pagamento. Cadastro gratuito não gera checkout.",
    };
    await logAction(ctx, "create_event_checkout_link", input, output, "error", "not sponsored");
    return output;
  }

  if (event.sponsor_payment_status === "paid") {
    const output = { error: "já pago", hint: "Este destaque já está pago." };
    await logAction(ctx, "create_event_checkout_link", input, output, "error", "already paid");
    return output;
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) {
    const output = { error: "pagamento indisponível", hint: "Stripe não configurado." };
    await logAction(ctx, "create_event_checkout_link", input, output, "error", "no stripe key");
    return output;
  }

  const price = await getEventSponsorPriceBrl(ctx.supabaseAdmin);
  const siteUrl =
    Deno.env.get("SITE_URL") || Deno.env.get("PUBLIC_SITE_URL") || "https://descubrams.com";

  const stripe = new Stripe(stripeKey, {
    apiVersion: "2024-11-20.acacia",
    httpClient: Stripe.createFetchHttpClient(),
  });

  const email =
    (typeof event.contato_email === "string" && event.contato_email.includes("@")
      ? event.contato_email
      : null) || undefined;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card", "pix", "boleto"],
    line_items: [
      {
        price_data: {
          currency: "brl",
          product_data: {
            name: "Evento Em Destaque - Descubra MS",
            description: `Destaque por ${price.duration_days} dias: ${event.titulo}`,
          },
          unit_amount: price.price_cents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      type: "event_sponsorship",
      event_id: event.id,
      event_name: event.titulo || "",
      source: "guata_chat",
    },
    success_url: `${siteUrl}/descubrams/eventos?payment=success&event_id=${event.id}`,
    cancel_url: `${siteUrl}/descubrams/guata`,
    customer_email: email,
    locale: "pt-BR",
    allow_promotion_codes: true,
  });

  if (!session.url) {
    const output = { error: "falha ao gerar checkout", hint: "Stripe não retornou URL." };
    await logAction(ctx, "create_event_checkout_link", input, output, "error", "no checkout url");
    return output;
  }

  if (session.id) {
    await ctx.supabaseAdmin
      .from("events")
      .update({
        sponsor_payment_status: "pending",
        sponsor_amount: price.price_brl,
      })
      .eq("id", event.id);
  }

  const output = {
    success: true,
    checkout_url: session.url,
    event_id: event.id,
    price_brl: price.price_brl,
    price_formatted: `R$ ${price.price_brl.toFixed(2).replace(".", ",")}`,
    duration_days: price.duration_days,
    message:
      "Mostre o link completo em linha própria. O chat também exibe QR automaticamente quando detectar o link Stripe.",
  };
  await logAction(ctx, "create_event_checkout_link", input, output, "success");
  return output;
}
