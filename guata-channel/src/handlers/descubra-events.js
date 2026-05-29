const { formatEventDate, truncate } = require('../utils/format');

function greetingName(organizer) {
  const name = (organizer?.name || '').trim();
  return name ? `, ${name.split(' ')[0]}` : '';
}

function buildApprovedMessage(payload) {
  const title = payload.title || 'Evento';
  const city = payload.city || 'Mato Grosso do Sul';
  const when = formatEventDate(payload.starts_at);
  const url = payload.site_url || '';

  return (
    `✅ *Seu evento foi aprovado!*\n\n` +
    `Olá${greetingName(payload.organizer)}! O evento *${title}* foi aprovado e já pode aparecer no Descubra MS.\n\n` +
    `📍 ${city}\n` +
    `📅 ${when}\n` +
    (url ? `🔗 ${url}\n\n` : '\n') +
    `Qualquer dúvida, responda aqui que eu te ajudo! 🦦`
  );
}

function buildRejectedMessage(payload) {
  const title = payload.title || 'Evento';
  const reason = (payload.rejection_reason || '').trim() || 'Não informado. Entre em contato para mais detalhes.';

  return (
    `❌ *Seu evento precisa de ajustes*\n\n` +
    `Olá${greetingName(payload.organizer)}! O evento *${title}* não foi aprovado desta vez.\n\n` +
    `📝 *Motivo:* ${reason}\n\n` +
    `Você pode editar e reenviar pelo site. Se precisar de ajuda, estou por aqui! 🦦`
  );
}

function buildPublishedMessage(payload) {
  const title = payload.title || 'Novo evento';
  const city = payload.city || 'MS';
  const when = formatEventDate(payload.starts_at);
  const desc = truncate(payload.description, 180);
  const url = payload.site_url || '';

  let msg =
    `🎉 *Novo evento no Descubra MS!*\n\n` +
    `*${title}*\n` +
    `📍 ${city}\n` +
    `📅 ${when}\n`;

  if (desc) msg += `\n${desc}\n`;
  if (url) msg += `\n👉 ${url}`;

  return msg;
}

module.exports = { buildApprovedMessage, buildRejectedMessage, buildPublishedMessage };
