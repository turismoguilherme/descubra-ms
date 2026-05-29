const { phoneToWhatsAppId } = require('../utils/phone');
const {
  buildApprovedMessage,
  buildRejectedMessage,
  buildPublishedMessage,
} = require('../handlers/descubra-events');

/**
 * @param {import('whatsapp-web.js').Client} client
 * @param {object} payload — corpo do webhook Descubra MS
 */
async function handleDescubraEventWebhook(client, payload) {
  const eventType = payload.event || 'event.published';

  switch (eventType) {
    case 'event.approved':
      return sendOrganizerDm(client, payload, buildApprovedMessage(payload));
    case 'event.rejected':
      return sendOrganizerDm(client, payload, buildRejectedMessage(payload));
    case 'event.published':
    default:
      return handlePublished(client, payload);
  }
}

async function sendOrganizerDm(client, payload, text) {
  const phone = payload.organizer?.phone;
  const chatId = phoneToWhatsAppId(phone);

  if (!chatId) {
    console.warn('[descubra-ms] DM ignorada — sem telefone do organizador', payload.event_id);
    return { ok: true, skipped: true, reason: 'no_organizer_phone' };
  }

  if (!client.info) {
    console.warn('[descubra-ms] WhatsApp ainda não conectado');
    return { ok: false, error: 'whatsapp_not_ready' };
  }

  await client.sendMessage(chatId, text);
  console.log(`[descubra-ms] DM enviada (${payload.event}) → ${chatId}`);
  return { ok: true, chat_id: chatId, event: payload.event };
}

async function handlePublished(client, payload) {
  const groupId = (process.env.WHATSAPP_BROADCAST_GROUP_ID || '').trim();
  const text = buildPublishedMessage(payload);

  if (groupId) {
    if (!client.info) {
      return { ok: false, error: 'whatsapp_not_ready' };
    }
    await client.sendMessage(groupId, text);
    console.log(`[descubra-ms] Evento publicado no grupo ${groupId}`);
    return { ok: true, broadcast: 'group', group_id: groupId };
  }

  // Sem grupo configurado: opcionalmente avisa o organizador também
  const phone = payload.organizer?.phone;
  if (phone) {
    return sendOrganizerDm(client, payload, text);
  }

  console.info('[descubra-ms] event.published — sem grupo nem telefone; ignorado.');
  return { ok: true, skipped: true, reason: 'no_broadcast_target' };
}

module.exports = { handleDescubraEventWebhook };
