

# Status de Segurança — Março 2026

## Resultado do Scan: 0 erros criticos, 29 warnings

As vulnerabilidades **criticas anteriores foram corrigidas** (RLS em user_roles, user_profiles, tourism_inventory; políticas bugadas em plano_diretor_documents; ai_consultant_config restrito a service_role).

---

## O que ESTÁ seguro ✅

| Camada | Status |
|--------|--------|
| `.env` — sem API keys expostas | ✅ |
| Google Search — sem fallback client-side | ✅ |
| localStorage — sem dados financeiros | ✅ |
| SVG dinâmico — sanitizado com DOMPurify | ✅ |
| user_roles — RLS habilitado | ✅ |
| user_profiles — RLS habilitado | ✅ |
| tourism_inventory — RLS habilitado | ✅ |
| ai_consultant_config — service_role only | ✅ |
| plano_diretor_documents — bug do `is_valid_uuid` corrigido | ✅ |
| Funções SQL — search_path fixado | ✅ |

---

## O que ainda precisa de atenção ⚠️ (warnings, não criticos)

### 1. Políticas RLS permissivas (WITH CHECK true para role `public`) — 20 tabelas

Tabelas onde **qualquer usuário anônimo** pode fazer INSERT/UPDATE/DELETE:

**Risco MÉDIO (dados manipuláveis):**
- `events` — INSERT público (qualquer um pode criar eventos)
- `partner_notifications` — INSERT público
- `partner_transactions` — INSERT público (transações financeiras!)
- `reservation_messages` — INSERT público
- `user_passports` — INSERT público
- `user_rewards` — INSERT público
- `partner_terms_acceptances` — INSERT público

**Risco BAIXO (cache/logs — poluição de dados):**
- `guata_response_cache` — CRUD público
- `koda_response_cache` — CRUD público
- `ai_insights`, `ai_master_insights`, `ai_proactive_insights` — INSERT público
- `rag_query_logs`, `rag_source_logs` — INSERT público
- `communication_logs`, `inventory_analytics`, `commercial_partner_metrics` — INSERT público
- `checkpoint_code_attempts` — INSERT público

### 2. Configurações de Auth
- **Leaked password protection** desabilitado (ação manual no dashboard)
- **OTP expiry** muito longo (ação manual no dashboard)
- **Postgres** com patches de segurança disponíveis (ação manual)

### 3. Extensões no schema `public`
- pgvector instalado em `public` em vez de `extensions` (risco cosmético)

### 4. Erro de build (cosmético)
- `gl-matrix` types — já tem `skipLibCheck: true`, mas o typecheck do Lovable pode estar ignorando. Não afeta o runtime.

---

## Veredicto

O sistema **está significativamente mais seguro** do que antes. As vulnerabilidades críticas (escalação de privilégio, exposição de CPFs, API keys no bundle) foram eliminadas.

Os 29 warnings restantes são **políticas permissivas em tabelas de suporte** — importante corrigir, mas não são exploráveis para escalação de privilégio ou roubo de dados sensíveis como antes.

---

## Plano de Correção (se quiser prosseguir)

### Fase 1 — Restringir INSERT público nas tabelas de risco médio (1 migração)
Alterar as políticas de `events`, `partner_transactions`, `partner_notifications`, `reservation_messages`, `user_passports`, `user_rewards`, `partner_terms_acceptances` para exigir `auth.uid() IS NOT NULL` (authenticated) em vez de `public`.

### Fase 2 — Restringir cache/logs para authenticated (1 migração)
Alterar as políticas das tabelas de cache e logs para exigir autenticação.

### Fase 3 — Ações manuais no dashboard
- Habilitar Leaked Password Protection
- Reduzir OTP expiry
- Aplicar patches do Postgres

**Total: 2 migrações SQL + 3 ações manuais no dashboard.**

