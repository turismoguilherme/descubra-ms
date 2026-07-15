
# Guatá como Agente Transacional (MS)

Objetivo: transformar o Guatá de assistente informativo em **agente com ações**, reaproveitando 100% da infra que já existe (`events`, `partner_availability`, `partner_pricing`, `partner_reservations`, `reservation-checkout`, Stripe Connect). O Gemini decide quando chamar cada ação via **function calling**; o Guatá apenas orquestra e confirma.

## Princípios estratégicos

1. **Reuso total** — nenhuma nova tabela de reserva/evento. Só adicionamos uma tabela leve de auditoria das ações do Guatá.
2. **Segurança em camadas** — RLS + validação no edge + confirmação explícita antes de qualquer ação irreversível (criar evento, reservar, pagar).
3. **Login obrigatório para agir** — se não logado, Guatá responde normalmente e insere CTA "Entrar para continuar" preservando o contexto da conversa.
4. **Admin no controle** — evento criado pelo chat entra como `pendente` no fluxo de moderação já existente.
5. **Sem quebrar o Guatá informativo** — as tools são opcionais; se o Gemini não chamar tool, resposta segue como hoje.

## Arquitetura

```text
Usuário (chat)
   │
   ▼
ChatGuata.tsx / Guata.tsx  ── mantém histórico + estado auth
   │
   ▼
edge: guata-ai  (upgrade)
   │  Gemini com tools declaradas
   ├── search_partners        (read)
   ├── check_availability     (read)
   ├── create_event_draft     (write, requer auth)
   ├── create_reservation     (write, requer auth)
   └── create_checkout_link   (write, requer auth + reserva existente)
   │
   ▼
Cada tool = função interna do edge que:
  1. valida JWT do usuário
  2. valida payload (zod)
  3. chama Supabase/edge existente
  4. retorna resultado estruturado ao Gemini
  5. registra em guata_action_logs
```

## Tools do Gemini (contrato)

| Tool | Auth | Reusa | Retorno |
|------|------|-------|---------|
| `search_partners(query, city?, category?)` | pública | `SELECT` em `commercial_partners`/`guata_verified_partners` | lista curta com id, nome, cidade |
| `check_availability(partner_id, date, people)` | pública | `partner_availability` + `partner_pricing` | slots + preço estimado |
| `create_event_draft(title, date, location, description, category)` | logado | `INSERT` em `events` com `status='pendente'` e `created_by=user.id` | id do evento + mensagem "aguardando aprovação" |
| `create_reservation(partner_id, date, time, people, notes)` | logado | `INSERT` em `partner_reservations` (status `pending_payment`) | reservation_id + resumo |
| `create_checkout_link(reservation_id)` | logado + dono da reserva | invoca `reservation-checkout` (já existe) | URL do Stripe Checkout |

Regras:
- Cada tool retorna JSON pequeno (o Gemini reescreve em linguagem natural).
- Ações destrutivas nunca são executadas sem o Gemini antes ter emitido um resumo e recebido "sim/confirmo" do usuário no turno seguinte (prompt system instrui isso).
- Erro em tool volta como `{ error, hint }` — Gemini traduz educadamente.

## Prompt system (essencial)

Trecho a adicionar em `guata-ai/prompts.ts`:
- "Você pode usar ferramentas. Só chame `create_*` depois de confirmar todos os dados com o usuário em linguagem natural e receber confirmação explícita."
- "Se o usuário pedir para reservar/pagar/cadastrar evento e `user_authenticated=false`, NÃO chame tool: responda pedindo login e devolva marcador `[[REQUIRE_LOGIN:acao]]`."
- Frontend detecta esse marcador e mostra botão "Entrar".

## Fluxos ponta a ponta

### 1. Cadastrar evento
Usuário: "quero cadastrar um festival em Bonito dia 20/03" → Guatá pergunta faltantes → confirma → `create_event_draft` → responde "criado, aguardando aprovação do admin" + link para admin acompanhar.

### 2. Reservar + pagar
"quero reservar pousada X para 2 pessoas no fim de semana" → `search_partners` → `check_availability` → resumo com preço → confirmação → `create_reservation` → `create_checkout_link` → Guatá envia link Stripe no chat. Webhook `stripe-webhook-handler` já atualiza status.

### 3. Só informação
Sem tool call, comportamento atual preservado.

## Mudanças no código (arquivos)

**Backend**
- `supabase/functions/guata-ai/index.ts` — adicionar loop de tool-calling do Gemini, roteador para handlers.
- `supabase/functions/guata-ai/tools/` (novo) — um arquivo por tool: `searchPartners.ts`, `checkAvailability.ts`, `createEventDraft.ts`, `createReservation.ts`, `createCheckoutLink.ts`.
- `supabase/functions/guata-ai/toolSchemas.ts` (novo) — declarações no formato Gemini `functionDeclarations`.
- `supabase/functions/_shared/guataAuth.ts` (novo) — extrai user do JWT, helper `requireAuth()`.
- `supabase/functions/guata-ai/prompts.ts` — instruções de uso das tools + regra de confirmação + marcador `[[REQUIRE_LOGIN]]`.

**Banco (uma migration nova)**
- Tabela `guata_action_logs` (id, user_id, tool_name, input jsonb, output jsonb, status, created_at) com RLS: usuário lê o próprio, admin lê tudo. + GRANTs.
- Nenhuma alteração em `events`, `partner_reservations`, etc.

**Frontend**
- `src/hooks/useGuataConversation.ts` (ou onde envia a mensagem) — enviar token JWT no header e flag `user_authenticated`.
- `src/components/guata/ChatMessages.tsx` — detectar `[[REQUIRE_LOGIN:acao]]` e renderizar botão "Entrar para continuar" que salva a conversa em `sessionStorage` e volta pós-login.
- `src/components/guata/ChatMessage.tsx` — renderizar cards especiais quando resposta inclui `action_result` (link de pagamento, id de evento, etc.) — opcional na fase 1, pode ser texto+link.

## Segurança (não negociável)

- Todas as tools de escrita fazem `SELECT auth.uid()` a partir do JWT antes de qualquer INSERT.
- `create_reservation` valida que `partner_id` existe e está ativo.
- `create_checkout_link` valida que a reserva pertence ao `auth.uid()`.
- `create_event_draft` sempre grava `status='pendente'` e `created_by=auth.uid()` — nunca aceita esses campos do modelo.
- Rate limit por usuário (ex.: 5 ações de escrita/hora) via `guata_action_logs`.
- Nenhum campo sensível (preço final, saldo, tokens) vai para o prompt do Gemini.

## Rollout em fases

- **Fase 1 (MVP):** `search_partners`, `check_availability`, `create_event_draft`. Sem pagamento. Baixo risco.
- **Fase 2:** `create_reservation` + `create_checkout_link` (usa `reservation-checkout` já em produção).
- **Fase 3 (opcional):** cancelamento pelo chat reusando `cancel-reservation`; sugestão de datas alternativas quando slot indisponível.

## Riscos e mitigações

- **Alucinação de dados de parceiro** → toda info de parceiro/preço vem de tool (banco), nunca do modelo.
- **Confirmação frágil** → prompt exige eco literal dos dados antes de chamar `create_*`; se usuário só diz "ok" após pergunta explícita "confirma?".
- **Custo Gemini com tool-loop** → limitar a 3 iterações de tool por turno.
- **Abuso** → rate limit + `guata_action_logs` visível no admin.

## Reflexão de escalabilidade/manutenibilidade

A separação **tool declaration ↔ handler ↔ serviço existente** deixa cada camada substituível: trocar Gemini por outro LLM só afeta `toolSchemas.ts`; adicionar uma nova ação (ex.: `cancel_reservation`) é criar um arquivo em `tools/`. Reusar `reservation-checkout` e `events` evita duplicação de regras de negócio (preço, RLS, webhook Stripe) e garante que qualquer melhoria futura nesses fluxos beneficia automaticamente o Guatá. Próximos passos naturais: extrair um "action registry" tipado compartilhado entre frontend (para cards ricos) e edge, e mover o log de ações para um dashboard admin dedicado.

## Pergunta final antes de implementar

Confirma começar pela **Fase 1 (sem pagamento)** para validar o padrão de tool-calling, ou prefere ir direto às três fases de uma vez?
