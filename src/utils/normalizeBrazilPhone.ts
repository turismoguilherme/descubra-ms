/** Dígitos BR: 55 + DDD + número (ex.: 5567999212361). */
export function normalizeBrazilPhoneDigits(phone: string | null | undefined): string {
  if (!phone) return "";
  const digits = String(phone).replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("55")) return digits;
  return `55${digits}`;
}

/** Exibe (67) 99212-3617 a partir de dígitos normalizados. */
export function formatBrazilPhoneDisplay(phone: string | null | undefined): string {
  const digits = normalizeBrazilPhoneDigits(phone);
  if (digits.length < 12) return phone?.trim() || "";
  const local = digits.slice(2);
  const ddd = local.slice(0, 2);
  const rest = local.slice(2);
  if (rest.length === 9) {
    return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
  }
  if (rest.length === 8) {
    return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
  }
  return `+${digits}`;
}
