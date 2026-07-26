import type { GuataAuthContext } from "../../_shared/guataAuth.ts";
import { logAction } from "../../_shared/guataAuth.ts";
import { getEventSponsorPriceBrl } from "../../_shared/eventSponsorPrice.ts";

/** Retorna o preço atual do cadastro Em Destaque (sempre lido do admin). */
export async function getEventListingPrice(ctx: GuataAuthContext) {
  const price = await getEventSponsorPriceBrl(ctx.supabaseAdmin);
  const output = {
    success: true,
    listing_free: {
      name: "gratuito",
      price_brl: 0,
      description:
        "Cadastro gratuito na plataforma. O evento fica pendente de aprovação do admin antes de aparecer no calendário.",
    },
    listing_destaque: {
      name: "destaque",
      price_brl: price.price_brl,
      price_formatted: `R$ ${price.price_brl.toFixed(2).replace(".", ",")}`,
      duration_days: price.duration_days,
      description:
        `Cadastro Em Destaque na plataforma (pago). Valor atual: R$ ${price.price_brl.toFixed(2).replace(".", ",")} por ${price.duration_days} dias. Badge, prioridade no calendário. Exige logo ou vídeo promocional. Após pagamento Stripe, segue o fluxo do site.`,
    },
    message:
      "Use SEMPRE estes valores ao falar do preço. Nunca invente outro valor. Se o admin mudar event_sponsor_price, esta tool já devolve o atualizado.",
  };
  await logAction(ctx, "get_event_listing_price", {}, output, "success");
  return output;
}
