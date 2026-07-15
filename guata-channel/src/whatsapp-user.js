const { normalizePhoneDigits } = require('./utils/phone');

function getSupabaseConfig() {
  const supabaseUrl = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const botSecret =
    process.env.GUATA_BOT_INTERNAL_SECRET || process.env.DESCUBRA_WEBHOOK_SECRET;
  return { supabaseUrl, anonKey, botSecret };
}

function whatsappFromToPhone(from) {
  if (!from) return '';
  return normalizePhoneDigits(from.replace(/@c\.us$/, ''));
}

/**
 * D1: verifica se o número WhatsApp está vinculado a user_profiles.phone
 */
async function resolveWhatsAppUser(from) {
  const { supabaseUrl, anonKey, botSecret } = getSupabaseConfig();
  const whatsappPhone = whatsappFromToPhone(from);
  if (!supabaseUrl || !anonKey || !botSecret || !whatsappPhone) {
    return { linked: false, whatsappPhone, reason: 'config' };
  }

  const res = await fetch(`${supabaseUrl}/functions/v1/guata-whatsapp-user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: anonKey,
      Authorization: `Bearer ${botSecret}`,
    },
    body: JSON.stringify({ whatsapp_phone: whatsappPhone }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.warn('[whatsapp-user] resolve failed:', res.status, text.slice(0, 200));
    return { linked: false, whatsappPhone, reason: 'http_error' };
  }

  const data = await res.json();
  return { ...data, whatsappPhone };
}

function buildLinkInstructions(whatsappPhone) {
  return (
    `🔗 *Vincular conta*\n\n` +
    `Para reservar ou cadastrar eventos pelo WhatsApp:\n\n` +
    `1️⃣ Acesse: https://descubrams.com/descubrams/login\n` +
    `2️⃣ No perfil, salve o telefone *${whatsappPhone}* (mesmo deste WhatsApp)\n` +
    `3️⃣ Envie *vincular* aqui no chat`
  );
}

module.exports = {
  resolveWhatsAppUser,
  whatsappFromToPhone,
  buildLinkInstructions,
};
