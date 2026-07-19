/**
 * Cliente Guatá IA — WhatsApp usa guata-ai (tools) com vínculo por telefone (D1).
 */
const { whatsappFromToPhone } = require('./whatsapp-user');

/** Histórico curto por chat (memória leve) */
const sessionHistory = new Map();
const MAX_HISTORY = 8;

function getSessionId(from) {
  return `wa-${from.replace(/@c\.us$/, '')}`;
}

function appendHistory(sessionId, role, text) {
  const list = sessionHistory.get(sessionId) || [];
  list.push({ role, text: text.slice(0, 800) });
  while (list.length > MAX_HISTORY) list.shift();
  sessionHistory.set(sessionId, list);
}

function buildChatHistory(sessionId) {
  const history = sessionHistory.get(sessionId) || [];
  return history
    .map((m) => (m.role === 'user' ? `Usuário: ${m.text}` : `Guatá: ${m.text}`))
    .join('\n');
}

function getBotHeaders() {
  const supabaseUrl = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const botSecret =
    process.env.GUATA_BOT_INTERNAL_SECRET || process.env.DESCUBRA_WEBHOOK_SECRET;

  if (!supabaseUrl || !anonKey || !botSecret) {
    throw new Error('SUPABASE_URL, SUPABASE_ANON_KEY e secret do bot são obrigatórios');
  }

  return {
    supabaseUrl,
    headers: {
      'Content-Type': 'application/json',
      apikey: anonKey,
      Authorization: `Bearer ${botSecret}`,
    },
  };
}

function sanitizeWhatsAppAnswer(text) {
  if (!text) return text;
  return String(text)
    .replace(/\[\[REQUIRE_LOGIN:[a-z_]+\]\]/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function askGuataAi(question, sessionId, whatsappPhone, chatHistory) {
  const { supabaseUrl, headers } = getBotHeaders();

  const res = await fetch(`${supabaseUrl}/functions/v1/guata-ai`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      prompt: question,
      chatHistory,
      mode: 'tourist',
      enable_tools: true,
      whatsapp_phone: whatsappPhone,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`guata-ai HTTP ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const answer = data.response || data.answer;
  if (!answer || typeof answer !== 'string') {
    throw new Error('guata-ai sem resposta textual');
  }
  return sanitizeWhatsAppAnswer(answer);
}

async function askGuataWebRag(question, sessionId, chatHistory) {
  const { supabaseUrl, headers } = getBotHeaders();

  const conversation_history = (sessionHistory.get(sessionId) || []).map((m) =>
    m.role === 'user' ? `Usuário: ${m.text}` : `Guatá: ${m.text}`,
  );

  const res = await fetch(`${supabaseUrl}/functions/v1/guata-web-rag`, {
    method: 'POST',
    headers: {
      ...headers,
      Origin: 'https://descubrams.com',
    },
    body: JSON.stringify({
      question,
      state_code: 'MS',
      session_id: sessionId,
      location: 'Mato Grosso do Sul',
      conversation_history,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`guata-web-rag HTTP ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const answer = data.answer || data.response || data.message;
  if (!answer || typeof answer !== 'string') {
    throw new Error('guata-web-rag sem resposta textual');
  }
  return answer.trim();
}

/**
 * Faz upload de uma imagem (logo de evento) recebida no WhatsApp.
 * Chama a edge function guata-whatsapp-upload (service role no servidor).
 * Retorna { url } ou { linked:false } / lança erro.
 */
async function uploadWhatsAppImage(base64, mimetype, whatsappPhone) {
  const { supabaseUrl, headers } = getBotHeaders();

  const res = await fetch(`${supabaseUrl}/functions/v1/guata-whatsapp-upload`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      whatsapp_phone: whatsappPhone,
      image_base64: base64,
      mimetype,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (res.status === 403 && data.linked === false) {
    return { linked: false };
  }
  if (!res.ok || !data.url) {
    throw new Error(`guata-whatsapp-upload HTTP ${res.status}: ${JSON.stringify(data).slice(0, 200)}`);
  }
  return { url: data.url };
}

async function askGuata(question, fromJid) {
  const sessionId = getSessionId(fromJid);
  const whatsappPhone = whatsappFromToPhone(fromJid);
  const chatHistory = buildChatHistory(sessionId);

  appendHistory(sessionId, 'user', question);

  let answer;
  try {
    answer = await askGuataAi(question, sessionId, whatsappPhone, chatHistory);
  } catch (err) {
    console.warn('[guata-ai] falhou, tentando guata-web-rag:', err.message);
    try {
      answer = await askGuataWebRag(question, sessionId, chatHistory);
    } catch (ragErr) {
      console.error('[guata-ai] fallback rag falhou:', ragErr.message);
      throw ragErr;
    }
  }

  appendHistory(sessionId, 'model', answer);
  return answer;
}

module.exports = { askGuata, uploadWhatsAppImage, getSessionId, appendHistory };
