export function isPartnerSubscriptionOk(partner: {
  billing_mode?: string | null;
  subscription_status?: string | null;
}): boolean {
  if (partner.billing_mode === 'exempt') return true;
  const s = partner.subscription_status;
  return s === 'active' || s === 'trialing';
}
