
## Onde paramos

A Fase 2 (reserva + checkout Stripe pelo Guatá) **já foi implementada** na sessão anterior. Verifiquei o código e o banco:

- `supabase/functions/guata-ai/tools/createReservation.ts` — cria linha em `partner_reservations` (status `pending`, valida parceiro ativo, min/max guests, calcula comissão de `site_settings`, gera `reservation_code` via RPC).
- `supabase/functions/guata-ai/tools/createCheckoutLink.ts` — gera Stripe Checkout Session (card/pix/boleto), grava `stripe_checkout_session_id`, `success_url = /minhas-reservas`.
- `guata-ai/index.ts` roteia `create_reservation` e `create_checkout_link`, e o guard `REQUIRE_LOGIN:reservar|pagar` já existe.
- `toolSchemas.ts` declara as duas ferramentas para o Gemini.
- Banco tem as colunas necessárias em `partner_reservations`: `service_id`, `stripe_checkout_session_id`, `stripe_payment_intent_id`, `reservation_code`, `user_id`.
- `ChatMessage.tsx` renderiza a URL do Stripe automaticamente como link clicável.

**Ou seja, o fluxo está funcional.** Falta validar end-to-end e cobrir pontas soltas antes de anunciar como pronto.

## Plano da rodada

### 1. Validação end-to-end (prioridade)
Rodar o fluxo real logado no preview:
1. Perguntar ao Guatá: "quero reservar pousada em Bonito para 2 pessoas no dia XX".
2. Confirmar que ele chama `search_partners` → `check_availability` → pede confirmação → `create_reservation` → `create_checkout_link`.
3. Abrir o link, pagar em modo teste Stripe (cartão `4242…`).
4. Confirmar que o webhook existente (`stripe-webhook`) atualiza status para `confirmed` e o registro aparece em `/minhas-reservas`.
5. Conferir `guata_action_logs` com os inserts de `create_reservation` e `create_checkout_link` (`status = success`).

### 2. Ajustes que já sei que precisam
- **System prompt** do `guata-ai/index.ts`: garantir instrução explícita do fluxo sequencial (search → check → confirmar → reservar → confirmar → pagar) e proibir chamar `create_checkout_link` sem `create_reservation` no mesmo turno. Hoje o modelo pode pular etapas.
- **Mensagem pós-reserva**: quando `create_reservation` retorna `success`, forçar o Guatá a resumir (parceiro, data, pessoas, total) e pedir confirmação em PT-BR antes de gerar o link — evita cobrança acidental.
- **Fallback sem Stripe**: se `STRIPE_SECRET_KEY` estiver ausente, retornar mensagem clara "pagamento indisponível, entre em contato com o parceiro" (já retorna, mas sem instrução para o usuário).
- **Logar `partner_id` e `reservation_id`** em `guata_action_logs.output` para auditoria (parte já loga, revisar cobertura).

### 3. Pontos de UX opcionais (só se aprovar)
- Card visual no chat para reservas confirmadas (código, data, valor, botão pagar) em vez de texto puro — exige mudança em `ChatMessage.tsx` para detectar payload estruturado do tool call.
- Botão "Cancelar reserva" no chat quando `status = pending` e ainda não paga, chamando `cancel-reservation` existente.

## Detalhes técnicos

- Nenhuma migration necessária — schema já suporta.
- Nenhum segredo novo — `STRIPE_SECRET_KEY` e `SITE_URL` já usados.
- Rate limit de 5 write-actions/hora do `checkWriteRateLimit` cobre reservas e checkouts.

## O que faço primeiro se aprovar

1. Reforçar system prompt (item 2) — mudança mínima, alto impacto.
2. Testar o fluxo real no preview e reportar o que der certo/errado.
3. Trazer os cards de UX (item 3) só depois que você validar o backend.

Confirma seguir por aí, ou prefere que eu comece pelos cards visuais no chat antes de testar?
