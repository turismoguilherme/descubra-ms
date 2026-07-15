import type { GuataAuthContext } from "../../_shared/guataAuth.ts";
import { checkWriteRateLimit, logAction } from "../../_shared/guataAuth.ts";

export interface CreateReservationInput {
  partner_id: string;
  date: string;
  people?: number;
  service_id: string;
  reservation_time?: string;
  notes?: string;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function estimateTotal(
  pricing: {
    pricing_type: string;
    base_price: number | null;
    price_per_person: number | null;
    price_per_night: number | null;
  },
  people: number,
): number {
  if (pricing.pricing_type === "per_person" && pricing.price_per_person != null) {
    return Number(pricing.price_per_person) * people;
  }
  if (pricing.pricing_type === "per_night" && pricing.price_per_night != null) {
    return Number(pricing.price_per_night);
  }
  if (pricing.base_price != null) return Number(pricing.base_price);
  return 0;
}

export async function createReservation(
  ctx: GuataAuthContext,
  input: CreateReservationInput,
) {
  if (!ctx.userId) {
    return { error: "auth_required", hint: "O usuário precisa estar logado." };
  }

  if (!UUID_RE.test(input.partner_id || "") || !UUID_RE.test(input.service_id || "")) {
    const output = { error: "ids inválidos", hint: "Use partner_id e service_id de search/check_availability." };
    await logAction(ctx, "create_reservation", input, output, "error", "invalid ids");
    return output;
  }
  if (!DATE_RE.test(input.date || "")) {
    const output = { error: "data inválida", hint: "Use YYYY-MM-DD." };
    await logAction(ctx, "create_reservation", input, output, "error", "invalid date");
    return output;
  }

  const people = Math.max(1, Number(input.people ?? 1));

  const rl = await checkWriteRateLimit(ctx, "create_reservation");
  if (!rl.ok) {
    const output = { error: "rate_limited", hint: `Limite de 5 ações/hora atingido (${rl.used} usadas).` };
    await logAction(ctx, "create_reservation", input, output, "rate_limited");
    return output;
  }

  const [{ data: partner }, { data: pricing }, { data: userData }] = await Promise.all([
    ctx.supabaseAdmin
      .from("institutional_partners")
      .select("id, name, status, is_active, subscription_status")
      .eq("id", input.partner_id)
      .maybeSingle(),
    ctx.supabaseAdmin
      .from("partner_pricing")
      .select("id, service_name, service_type, pricing_type, base_price, price_per_person, price_per_night, min_guests, max_guests, is_active")
      .eq("id", input.service_id)
      .eq("partner_id", input.partner_id)
      .maybeSingle(),
    ctx.supabaseAdmin.auth.admin.getUserById(ctx.userId),
  ]);

  const partnerOk = partner &&
    partner.status === "approved" &&
    partner.is_active === true &&
    partner.subscription_status === "active";

  if (!partnerOk) {
    const output = { error: "parceiro indisponível", hint: "Busque outro parceiro ativo." };
    await logAction(ctx, "create_reservation", input, output, "error", "partner inactive");
    return output;
  }

  if (!pricing || pricing.is_active === false) {
    const output = { error: "serviço não encontrado", hint: "Use pricing_id retornado em check_availability." };
    await logAction(ctx, "create_reservation", input, output, "error", "pricing not found");
    return output;
  }

  if (pricing.min_guests && people < pricing.min_guests) {
    const output = { error: "pessoas abaixo do mínimo", hint: `Mínimo: ${pricing.min_guests} pessoas.` };
    await logAction(ctx, "create_reservation", input, output, "error", "min guests");
    return output;
  }
  if (pricing.max_guests && people > pricing.max_guests) {
    const output = { error: "pessoas acima do máximo", hint: `Máximo: ${pricing.max_guests} pessoas.` };
    await logAction(ctx, "create_reservation", input, output, "error", "max guests");
    return output;
  }

  const totalAmount = estimateTotal(pricing, people);
  if (totalAmount <= 0) {
    const output = { error: "preço indisponível", hint: "Este serviço não tem preço configurado." };
    await logAction(ctx, "create_reservation", input, output, "error", "no price");
    return output;
  }

  const guestEmail = userData?.user?.email;
  if (!guestEmail) {
    const output = { error: "email obrigatório", hint: "Complete o e-mail da sua conta." };
    await logAction(ctx, "create_reservation", input, output, "error", "no email");
    return output;
  }

  const guestName = String(
    userData.user.user_metadata?.full_name ||
      userData.user.user_metadata?.name ||
      guestEmail.split("@")[0],
  );

  const { data: commissionSetting } = await ctx.supabaseAdmin
    .from("site_settings")
    .select("setting_value")
    .eq("platform", "ms")
    .eq("setting_key", "partner_commission_rate")
    .maybeSingle();

  const commissionRate = commissionSetting?.setting_value
    ? parseFloat(String(commissionSetting.setting_value))
    : 10;
  const commissionAmount = (totalAmount * commissionRate) / 100;

  const { data: reservationCodeData } = await ctx.supabaseAdmin.rpc("generate_reservation_code");
  const reservationCode = reservationCodeData ||
    `RES-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

  const reservationType = mapReservationType(pricing.service_type);

  const { data: reservation, error } = await ctx.supabaseAdmin
    .from("partner_reservations")
    .insert({
      partner_id: input.partner_id,
      user_id: ctx.userId,
      service_id: input.service_id,
      reservation_type: reservationType,
      service_name: pricing.service_name,
      reservation_date: input.date,
      reservation_time: input.reservation_time ?? null,
      guests: people,
      total_amount: totalAmount,
      commission_rate: commissionRate,
      commission_amount: commissionAmount,
      status: "pending",
      reservation_code: reservationCode,
      guest_name: guestName,
      guest_email: guestEmail,
      guest_phone: userData.user.user_metadata?.phone ?? null,
      special_requests: input.notes ?? null,
    })
    .select("id, reservation_code, total_amount, status, reservation_date, guests, service_name")
    .single();

  if (error || !reservation) {
    const output = { error: "falha ao criar reserva", hint: error?.message ?? "erro desconhecido" };
    await logAction(ctx, "create_reservation", input, output, "error", error?.message);
    return output;
  }

  const output = {
    success: true,
    reservation_id: reservation.id,
    reservation_code: reservation.reservation_code,
    partner_name: partner.name,
    service_name: reservation.service_name,
    date: reservation.reservation_date,
    guests: reservation.guests,
    total_amount_brl: Number(reservation.total_amount),
    status: reservation.status,
    message: "Reserva criada. Próximo passo: gerar link de pagamento com create_checkout_link.",
  };
  await logAction(ctx, "create_reservation", input, output, "success");
  return output;
}

function mapReservationType(serviceType: string | null | undefined): string {
  const t = (serviceType || "").toLowerCase();
  if (t.includes("hotel") || t.includes("hosped")) return "hotel";
  if (t.includes("restaur") || t.includes("gastron")) return "restaurant";
  if (t.includes("tour") || t.includes("passeio")) return "tour";
  if (t.includes("transport")) return "transport";
  if (t.includes("attrac") || t.includes("atrativ")) return "attraction";
  return "other";
}
