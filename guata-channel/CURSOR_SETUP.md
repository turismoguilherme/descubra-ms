# Guatá Channel — Passo a passo para o Cursor executar

> **Objetivo:** colocar o bot WhatsApp do Guatá no ar, conectado ao Descubra MS (aprovação de eventos + chat com IA).
>
> **Pasta do serviço:** `guata-channel/` (Node.js + `whatsapp-web.js` + Express).
>
> **O site/admin já está pronto** no repositório. Este guia cobre só o que falta **fora do Vercel**.

---

## 1. Arquitetura (entender antes de executar)

```
[Admin Descubra MS] aprova/rejeita evento
        ↓
[Supabase Edge] notify-guata-channel-event
        ↓ HTTP POST + Bearer secret
[Guatá Channel] POST /webhooks/descubra-ms  (servidor 24h)
        ↓ whatsapp-web.js
[WhatsApp] DM ao organizador (event.approved / event.rejected)
           ou post em grupo (event.published, opcional)

[Usuário] manda mensagem no WhatsApp privado
        ↓
[Guatá Channel] → Supabase guata-web-rag (IA do site) → resposta no chat
```

**Arquivos principais:**

| Arquivo | Função |
|---------|--------|
| `guata-channel/src/server.js` | HTTP + health + webhook |
| `guata-channel/src/whatsapp-client.js` | Cliente WhatsApp + mensagens recebidas |
| `guata-channel/src/webhooks/descubra-ms.js` | Roteia eventos do Descubra MS |
| `guata-channel/src/handlers/descubra-events.js` | Textos de aprovação/rejeição/publicação |
| `guata-channel/src/guata-ai-client.js` | Chama `guata-web-rag` / fallback `guata-ai` |
| `supabase/functions/notify-guata-channel-event/index.ts` | Ponte Supabase → Guatá Channel |
| `src/services/events/guataChannelWebhookService.ts` | Frontend/admin invoca a edge function |

---

## 2. Pré-requisitos

- [ ] Node.js **18+** no servidor de deploy
- [ ] Conta Supabase do projeto **Descubra MS** (URL + anon key + CLI logada)
- [ ] Número WhatsApp dedicado ao bot (recomendado: chip secundário)
- [ ] Servidor com **IP fixo ou domínio HTTPS** acessível pelo Supabase (VPS, Railway, Render, etc.)
- [ ] **Chrome/Chromium** no servidor (dependência do `whatsapp-web.js` / Puppeteer)

---

## 3. Passo A — Configurar `.env` local

```powershell
cd guata-channel
copy .env.example .env
```

Editar `guata-channel/.env`:

```env
PORT=3333

# Gerar secret forte (ex.: openssl rand -hex 32) — MESMO valor no Supabase (passo C)
DESCUBRA_WEBHOOK_SECRET=<secret-forte>

SUPABASE_URL=https://<PROJECT_REF>.supabase.co
SUPABASE_ANON_KEY=<anon-key-do-dashboard>

# Mesmo valor de DESCUBRA_WEBHOOK_SECRET (auth do bot no guata-web-rag)
GUATA_BOT_INTERNAL_SECRET=<secret-forte>

# Opcional: ID do grupo @g.us para divulgar eventos publicados
WHATSAPP_BROADCAST_GROUP_ID=
```

**Onde achar no Supabase Dashboard:**
- Settings → API → Project URL → `SUPABASE_URL`
- Settings → API → anon public → `SUPABASE_ANON_KEY`

---

## 4. Passo B — Instalar e subir localmente (validação)

```powershell
cd guata-channel
npm install
npm start
```

**Esperado no terminal:**
1. `Guatá Channel HTTP → http://0.0.0.0:3333`
2. QR Code ASCII → escanear no WhatsApp do celular (**Aparelhos conectados → Conectar aparelho**)
3. `✅ Guatá Channel — WhatsApp conectado.`

**Testar health (outro terminal):**

```powershell
curl http://localhost:3333/health
```

Resposta esperada:
```json
{"ok":true,"whatsapp":"connected","service":"guata-channel"}
```

**Testar chat IA:** enviar `oi` ou `menu` no WhatsApp privado para o número conectado → deve responder como Guatá.

**Testar webhook (simular Supabase):**

```powershell
curl -X POST http://localhost:3333/webhooks/descubra-ms `
  -H "Authorization: Bearer <DESCUBRA_WEBHOOK_SECRET>" `
  -H "Content-Type: application/json" `
  -d "{\"event\":\"event.approved\",\"event_id\":\"test\",\"title\":\"Evento Teste\",\"city\":\"Campo Grande\",\"starts_at\":\"2026-06-01T19:00:00Z\",\"site_url\":\"https://descubrams.com/evento/test\",\"organizer\":{\"name\":\"João\",\"phone\":\"5567999999999\"}}"
```

Substituir `5567999999999` por um número real de teste (com DDD, país 55).

---

## 5. Passo C — Secrets no Supabase

No **Supabase Dashboard** → Project Settings → Edge Functions → Secrets  
(ou via CLI: `supabase secrets set NOME=valor`)

| Secret | Valor | Obrigatório |
|--------|-------|-------------|
| `GUATA_CHANNEL_API_URL` | URL **base** do servidor (sem barra final). Ex.: `https://bot.seudominio.com` ou temporário `https://xxxx.ngrok-free.app` | Sim |
| `DESCUBRA_WEBHOOK_SECRET` | **Idêntico** ao `.env` do guata-channel | Sim |
| `GUATA_BOT_INTERNAL_SECRET` | **Idêntico** ao `DESCUBRA_WEBHOOK_SECRET` (ou mesmo valor) | Recomendado |
| `SITE_ORIGIN` | `https://descubrams.com` | Recomendado (links nos eventos) |

**CLI (se preferir):**

```bash
supabase secrets set GUATA_CHANNEL_API_URL=https://bot.seudominio.com
supabase secrets set DESCUBRA_WEBHOOK_SECRET=<secret-forte>
supabase secrets set GUATA_BOT_INTERNAL_SECRET=<secret-forte>
supabase secrets set SITE_ORIGIN=https://descubrams.com
```

---

## 6. Passo D — Deploy das Edge Functions

Na raiz do repositório (onde está `supabase/`):

```bash
supabase functions deploy notify-guata-channel-event
supabase functions deploy guata-web-rag
```

A function `notify-guata-channel-event` chama:
`{GUATA_CHANNEL_API_URL}/webhooks/descubra-ms`

**Verificar deploy:** Supabase Dashboard → Edge Functions → logs ao aprovar um evento no admin.

---

## 7. Passo E — Migration (se ainda não aplicada)

Arquivo: `supabase/migrations/20260517120000_events_public_logo_evento.sql`

```bash
supabase db push
# ou aplicar manualmente no SQL Editor do Dashboard
```

---

## 8. Passo F — Deploy produção (servidor 24h)

O bot **precisa ficar online** o tempo todo. Vercel **não** serve para isso.

### Opção 1 — VPS + PM2 (recomendado)

```bash
# No servidor Linux
git clone https://github.com/turismoguilherme/descubra-ms.git
cd descubra-ms/guata-channel
npm install
cp .env.example .env
# editar .env com valores de produção
npm install -g pm2
pm2 start src/server.js --name guata-channel
pm2 save
pm2 startup
```

**Nginx reverse proxy (HTTPS):**

```nginx
server {
    listen 443 ssl;
    server_name bot.seudominio.com;

    location / {
        proxy_pass http://127.0.0.1:3333;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Atualizar `GUATA_CHANNEL_API_URL=https://bot.seudominio.com` no Supabase.

**Persistência WhatsApp:** a pasta `.wwebjs_auth/` guarda a sessão. **Não apagar** entre restarts (fazer backup no servidor).

### Opção 2 — Desenvolvimento com ngrok (teste rápido)

```powershell
ngrok http 3333
```

Copiar URL HTTPS (ex. `https://abc123.ngrok-free.app`) → `GUATA_CHANNEL_API_URL` no Supabase.

⚠️ URL muda a cada sessão ngrok free → só para teste.

### Opção 3 — Railway / Render

- Root directory: `guata-channel`
- Start command: `npm start`
- Variáveis: copiar todo o `.env`
- Volume persistente: montar em `guata-channel/.wwebjs_auth` (sessão WhatsApp)

---

## 9. Passo G — Configurar grupo de divulgação (opcional)

Para `event.published` postar em um grupo:

1. Adicionar o número do bot ao grupo WhatsApp
2. Obter o ID do grupo (`120363xxxxx@g.us`) — pode logar no handler ou usar ferramentas do whatsapp-web.js
3. Definir no `.env`: `WHATSAPP_BROADCAST_GROUP_ID=120363xxxxx@g.us`
4. Reiniciar o serviço

Se vazio: eventos publicados só vão ao organizador (se tiver telefone) ou são ignorados.

---

## 10. Passo H — Requisitos no cadastro de eventos

Para DM de aprovação/rejeição funcionar, o evento precisa de:

- **`organizador_telefone`** com DDD (ex.: `67 99999-9999` ou `5567999999999`)

Sem telefone → edge function retorna `skipped: no_organizer_phone` (comportamento esperado).

---

## 11. Teste end-to-end (Definition of Done)

O Cursor deve marcar concluído quando **todos** passarem:

- [ ] `GET /health` → `"whatsapp":"connected"`
- [ ] Mensagem `oi` no WhatsApp → resposta do Guatá (IA)
- [ ] `curl` webhook com `event.approved` → DM recebida no telefone de teste
- [ ] No admin Descubra MS: aprovar evento real com telefone do organizador → DM automática
- [ ] Logs Supabase `notify-guata-channel-event` → status 200, sem `skipped: not_configured`
- [ ] Rejeitar evento com motivo → DM com texto da rejeição
- [ ] PM2/systemd mantém processo após reboot do servidor

---

## 12. Troubleshooting

| Sintoma | Causa provável | Ação |
|---------|----------------|------|
| Webhook `401 Unauthorized` | Secret diferente entre Supabase e `.env` | Alinhar `DESCUBRA_WEBHOOK_SECRET` |
| Webhook `503 WhatsApp not connected` | QR não escaneado ou sessão expirada | Reiniciar serviço, escanear QR de novo |
| Edge function `skipped: not_configured` | Falta `GUATA_CHANNEL_API_URL` ou secret | Passo C |
| Edge function `skipped: no_organizer_phone` | Evento sem telefone | Preencher no admin |
| IA não responde / 403 | `guata-web-rag` sem deploy ou secret | Deploy passo D + `GUATA_BOT_INTERNAL_SECRET` |
| Supabase não alcança localhost | URL local não é pública | Usar ngrok ou deploy VPS |
| QR some após deploy | `.wwebjs_auth` não persistido | Volume/backup da pasta de sessão |

**Logs úteis:**

```bash
pm2 logs guata-channel
# Supabase Dashboard → Edge Functions → notify-guata-channel-event → Logs
```

---

## 13. Comandos resumo (copy-paste para o agente)

```powershell
# Local
cd guata-channel
copy .env.example .env
# (editar .env)
npm install
npm start

# Supabase (na raiz do repo)
supabase secrets set GUATA_CHANNEL_API_URL=https://SUA-URL-PUBLICA
supabase secrets set DESCUBRA_WEBHOOK_SECRET=SEU-SECRET
supabase secrets set GUATA_BOT_INTERNAL_SECRET=SEU-SECRET
supabase secrets set SITE_ORIGIN=https://descubrams.com
supabase functions deploy notify-guata-channel-event
supabase functions deploy guata-web-rag
supabase db push

# Produção (Linux)
pm2 start guata-channel/src/server.js --name guata-channel --cwd /caminho/descubra-ms/guata-channel
```

---

## 14. O que NÃO fazer

- Não commitar `guata-channel/.env` (já está no `.gitignore`)
- Não commitar `guata-channel/node_modules/` ou `.wwebjs_auth/`
- Não hospedar o bot no Vercel (serverless não mantém WhatsApp)
- Não usar o dashboard de e-mails do admin (foi removido); Gmail manual continua para assuntos gerais

---

## 15. Referência de payload do webhook

O Supabase envia JSON como:

```json
{
  "event": "event.approved",
  "action": "approved",
  "event_id": "uuid",
  "title": "Nome do evento",
  "description": "...",
  "city": "Campo Grande",
  "starts_at": "2026-06-01T19:00:00.000Z",
  "site_url": "https://descubrams.com/evento/uuid",
  "organizer": {
    "name": "Maria",
    "email": "maria@email.com",
    "phone": "5567999999999"
  },
  "rejection_reason": "..."
}
```

Tipos: `event.published` | `event.approved` | `event.rejected`

Header obrigatório: `Authorization: Bearer <DESCUBRA_WEBHOOK_SECRET>`
