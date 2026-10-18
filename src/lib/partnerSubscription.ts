export type PartnerBillingMode = 'trial_monthly' | 'exempt';

/** Parceiro pode usar reservas / fluxos que exigem assinatura em dia. */
export function isPartnerSubscriptionOk(
  subscriptionStatus?: string | null,
  billingMode?: string | null,
): boolean {
  if (billingMode === 'exempt') return true;
  return subscriptionStatus === 'active' || subscriptionStatus === 'trialing';
}

export function partnerBillingModeLabel(mode?: string | null): string {
  if (mode === 'exempt') return 'Isento de mensalidade';
  return '30 dias grátis + mensalidade';
}
