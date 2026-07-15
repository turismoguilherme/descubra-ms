import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import type { GuataAuthContext } from "../../_shared/guataAuth.ts";
import { checkWriteRateLimit, logAction } from "../../_shared/guataAuth.ts";

export interface CreateCheckoutLinkInput {
  reservation_id: string;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function createCheckoutLink(
  ctx: GuataAuthContext,
  input: CreateCheckoutLinkInput,
) {
  if (!ctx.userId) {
    return { error: "auth_required", hint: "O usuário precisa estar logado." };
  }

  if (!UUID_RE.test(input.reservation_id || "")) {
    const output = { error: "reservation_id inválido" };
    await logAction(ctx, "create_checkout_link", input, output, "error", "invalid id");
    return output;
  }

  const rl = await checkWriteRateLimit(ctx, "create_checkout_link");
  if (!rl.ok) {
    const output = { error: "rate_limited", hint: `Limite de 5 ações/hora atingido (${rl.used} usadas).` };
    await logAction(ctx, "create_checkout_link", input, output, "rate_limited");
    return output;
  }

  const { data: reservation, error: resErr } = await ctx.supabaseAdmin
    .from("partner_reservations")
    .select(`
      id, user_id, partner_id, service_name, total_amount, status,
      reservation_code, guest_email, guest_name, stripe_checkout_session_id,
      institutional_partners ( id, name, status, is_active, subscription_status )
    `)
    .eq("id", input.reservation_id)
    .maybeSingle();

  if (resErr || !reservation) {
    const output = { error: "reserva não encontrada" };
    await logAction(ctx, "create_checkout_link", input, output, "error", resErr?.message);
    return output;
  }

  if (reservation.user_id !== ctx.userId) {
    const output = { error: "acesso negado", hint: "Esta reserva não pertence ao usuário logado." };
    await logAction(ctx, "create_checkout_link", input, output, "error", "not owner");
    return output;
  }

  if (reservation.status !== "pending") {
    const output = {
      error: "reserva não pendente",
      hint: `Status atual: ${reservation.status}. Só é possível pagar reservas pendentes.`,
    };
    await logAction(ctx, "create_checkout_link", input, output, "error", "bad status");
    return output;
  }

  const partner = reservation.institutional_partners as {
    id: string;
    name: string;
    status: string;
    is_active: boolean | null;
    subscription_status: string | null;
  } | null;

  if (
    !partner ||
    partner.status !== "approved" ||
    partner.is_active !== true ||
    partner.subscription_status !== "active"
  ) {
    const output = { error: "parceiro indisponível para pagamento" };
    await logAction(ctx, "create_checkout_link", input, output, "error", "partner inactive");
    return output;
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) {
    const output = { error: "pagamento indisponível", hint: "Stripe não configurado." };
    await logAction(ctx, "create_checkout_link", input, output, "error", "no stripe key");
    return output;
  }

  const stripe = new Stripe(stripeKey, {
    apiVersion: "2024-11-20.acacia",
    httpClient: Stripe.createFetchHttpClient(),
  });

  const totalAmount = Number(reservation.total_amount);
  const amountInCents = Math.round(totalAmount * 100);
  const siteUrl = Deno.env.get("SITE_URL") || Deno.env.get("PUBLIC_SITE_URL") || "https://descubrams.com";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card", "pix", "boleto"],
    line_items: [{
      price_data: {
        currency: "brl",
        product_data: {
          name: `Reserva - ${reservation.service_name}`,
          description: `Reserva com ${partner.name} - ${reservation.reservation_code}`,
        },
        unit_amount: amountInCents,
      },
      quantity: 1,
    }],
    metadata: {
      type: "partner_reservation",
      reservation_id: reservation.id,
      reservation_code: reservation.reservation_code,
      partner_id: reservation.partner_id,
      partner_name: partner.name,
      source: "guata_chat",
    },
    success_url: `${siteUrl}/minhas-reservas?reservation_id=${reservation.id}`,
    cancel_url: `${siteUrl}/descubrams/guata`,
    customer_email: reservation.guest_email ?? undefined,
    locale: "pt-BR",
    allow_promotion_codes: true,
  });

  if (session.id) {
    await ctx.supabaseAdmin
      .from("partner_reservations")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", reservation.id);
  }

  if (!session.url) {
    const output = { error: "falha ao gerar checkout", hint: "Stripe não retornou URL." };
    await logAction(ctx, "create_checkout_link", input, output, "error", "no checkout url");
    return output;
  }

  const output = {
    success: true,
    checkout_url: session.url,
    reservation_id: reservation.id,
    reservation_code: reservation.reservation_code,
    total_amount_brl: totalAmount,
    message: "Link de pagamento gerado. O usuário deve concluir o pagamento no Stripe.",
  };
  await logAction(ctx, "create_checkout_link", input, output, "success");
  return output;
}
