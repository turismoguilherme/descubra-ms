/**
 * Cliente Guatá IA — usa guata-web-rag (mesma inteligência do site).
 */
async function askGuata(question, sessionId) {
  const supabaseUrl = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const botSecret =
    process.env.GUATA_BOT_INTERNAL_SECRET || process.env.DESCUBRA_WEBHOOK_SECRET;

  if (!supabaseUrl || !anonKey) {
    throw new Error('SUPABASE_URL e SUPABASE_ANON_KEY são obrigatórios');
  }

  const headers = {
    'Content-Type': 'application/json',
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
  };

  if (botSecret) {
    headers.Authorization = `Bearer ${botSecret}`;
  }

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
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.warn('[guata-ai] guata-web-rag falhou, tentando guata-ai:', res.status, errText.slice(0, 200));
    return askGuataFallback(question, headers, supabaseUrl);
  }

  const data = await res.json();
  const answer = data.answer || data.response || data.message;
  if (answer && typeof answer === 'string') return answer.trim();

  return askGuataFallback(question, headers, supabaseUrl);
}

async function askGuataFallback(question, headers, supabaseUrl) {
  const res = await fetch(`${supabaseUrl}/functions/v1/guata-ai`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ prompt: question }),
  });

  if (!res.ok) {
    throw new Error(`guata-ai HTTP ${res.status}`);
  }

  const data = await res.json();
  return (data.response || data.answer || 'Desculpe, não consegui processar agora. Tente de novo em instantes.').trim();
}

/** Histórico curto por chat (memória leve) */
const sessionHistory = new Map();
const MAX_HISTORY = 6;

function getSessionId(from) {
  return `wa-${from.replace(/@c\.us$/, '')}`;
}

function appendHistory(sessionId, role, text) {
  const list = sessionHistory.get(sessionId) || [];
  list.push({ role, text: text.slice(0, 500) });
  while (list.length > MAX_HISTORY) list.shift();
  sessionHistory.set(sessionId, list);
}

module.exports = { askGuata, getSessionId, appendHistory };
