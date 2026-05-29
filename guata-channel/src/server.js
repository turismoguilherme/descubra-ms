require('dotenv').config();

const express = require('express');
const { createWhatsAppClient, isWhatsAppReady } = require('./whatsapp-client');
const { handleDescubraEventWebhook } = require('./webhooks/descubra-ms');

const PORT = parseInt(process.env.PORT || '3333', 10);
const WEBHOOK_SECRET = process.env.DESCUBRA_WEBHOOK_SECRET || '';

const app = express();
app.use(express.json({ limit: '1mb' }));

function authWebhook(req, res, next) {
  if (!WEBHOOK_SECRET) {
    console.warn('[server] DESCUBRA_WEBHOOK_SECRET não definido — webhooks desabilitados.');
    return res.status(503).json({ error: 'Webhook secret not configured' });
  }

  const auth = req.headers.authorization || '';
  if (auth !== `Bearer ${WEBHOOK_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    whatsapp: isWhatsAppReady() ? 'connected' : 'pending',
    service: 'guata-channel',
  });
});

/**
 * Webhook chamado pelo Supabase (notify-guata-channel-event).
 * POST /webhooks/descubra-ms
 */
app.post('/webhooks/descubra-ms', authWebhook, async (req, res) => {
  try {
    const payload = req.body;
    if (!payload || !payload.event_id) {
      return res.status(400).json({ error: 'Payload inválido: event_id obrigatório' });
    }

    const client = require('./whatsapp-client').getClient();
    if (!client) {
      return res.status(503).json({ error: 'WhatsApp client not initialized' });
    }

    if (!isWhatsAppReady()) {
      return res.status(503).json({ error: 'WhatsApp not connected yet' });
    }

    const result = await handleDescubraEventWebhook(client, payload);
    res.json({ ok: true, ...result });
  } catch (error) {
    console.error('[webhook descubra-ms]', error);
    res.status(500).json({ error: error.message || 'Internal error' });
  }
});

app.listen(PORT, () => {
  console.log(`🌐 Guatá Channel HTTP → http://0.0.0.0:${PORT}`);
  console.log(`   Health: GET /health`);
  console.log(`   Webhook: POST /webhooks/descubra-ms`);
});

createWhatsAppClient();
