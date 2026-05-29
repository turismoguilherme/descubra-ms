/**
 * Normaliza telefone BR para dígitos (55 + DDD + número).
 */
function normalizePhoneDigits(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('55')) return digits;
  return `55${digits}`;
}

/**
 * Converte para JID do WhatsApp (chat privado).
 */
function phoneToWhatsAppId(phone) {
  const digits = normalizePhoneDigits(phone);
  if (!digits || digits.length < 12) return null;
  return `${digits}@c.us`;
}

module.exports = { normalizePhoneDigits, phoneToWhatsAppId };
