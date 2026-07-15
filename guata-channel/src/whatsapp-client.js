const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const { askGuata } = require('./guata-ai-client');
const {
  resolveWhatsAppUser,
  buildLinkInstructions,
  whatsappFromToPhone,
} = require('./whatsapp-user');

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

let clientInstance = null;
let ready = false;

function createWhatsAppClient() {
  const client = new Client({
    authStrategy: new LocalAuth({ dataPath: '.wwebjs_auth' }),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    },
  });

  client.on('qr', (qr) => {
    console.log('\n📲 Escaneie o QR Code no WhatsApp (Aparelhos conectados):\n');
    qrcode.generate(qr, { small: true });
  });

  client.on('ready', () => {
    ready = true;
    console.log('✅ Guatá Channel — WhatsApp conectado.');
  });

  client.on('authenticated', () => {
    console.log('🔐 WhatsApp autenticado.');
  });

  client.on('disconnected', (reason) => {
    ready = false;
    console.warn('⚠️ WhatsApp desconectado:', reason);
  });

  client.on('message', async (msg) => {
    try {
      if (!msg.from || msg.from.endsWith('@g.us')) return;

      const chat = await msg.getChat();
      if (chat.isGroup) return;

      const body = (msg.body || '').trim();
      if (!body) return;

      // Ignora eco de mensagens enviadas pelo próprio bot
      if (msg.fromMe) return;

      const lower = body.toLowerCase();

      if (/^(menu|ajuda|help)$/i.test(lower)) {
        await chat.sendStateTyping();
        await delay(800);
        const link = await resolveWhatsAppUser(msg.from);
        const linkedLine = link.linked
          ? `\n✅ *Conta vinculada*${link.name ? ` (${link.name})` : ''} — posso ajudar com reservas e cadastro de eventos.`
          : '\n🔗 Envie *vincular* para conectar sua conta e reservar pelo WhatsApp.';
        await client.sendMessage(
          msg.from,
          `🦦 *Olá! Eu sou o Guatá*, seu guia de turismo de Mato Grosso do Sul!\n\n` +
            `Posso ajudar com destinos, eventos, gastronomia, roteiros, *reservas* e *cadastro de eventos*.${linkedLine}\n\n` +
            `É só mandar sua pergunta. 😊`,
        );
        return;
      }

      if (/^vincular$/i.test(lower)) {
        await chat.sendStateTyping();
        await delay(600);
        const link = await resolveWhatsAppUser(msg.from);
        const phone = whatsappFromToPhone(msg.from);
        if (link.linked) {
          await client.sendMessage(
            msg.from,
            `✅ *Conta vinculada!*${link.name ? ` Olá, ${link.name}.` : ''}\n\n` +
              `Agora você pode pedir reservas de passeios ou cadastrar eventos por aqui. 🦦`,
          );
        } else {
          await client.sendMessage(msg.from, buildLinkInstructions(phone));
        }
        return;
      }

      await chat.sendStateTyping();

      let answer;
      try {
        answer = await askGuata(body, msg.from);
      } catch (err) {
        console.error('[guata] Erro ao consultar IA:', err.message);
        answer =
          'Desculpe, estou com dificuldade técnica no momento. Tente novamente em alguns minutos. 🦦';
      }

      await client.sendMessage(msg.from, answer);
    } catch (error) {
      console.error('❌ Erro ao processar mensagem:', error);
    }
  });

  client.initialize();
  clientInstance = client;
  return client;
}

function getClient() {
  return clientInstance;
}

function isWhatsAppReady() {
  return ready && clientInstance?.info;
}

module.exports = { createWhatsAppClient, getClient, isWhatsAppReady };
