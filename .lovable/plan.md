

# Relatório de Segurança — Estado Atual

## O que ESTÁ protegido no client-side ✅

| Item | Status |
|------|--------|
| API keys no `.env` | Limpo — apenas `VITE_SUPABASE_*` (chaves públicas) |
| `GoogleGenerativeAI` no client | Removido — apenas comentário residual numa Edge Function |
| Google Search fallback client-side | Removido |
| localStorage com dados financeiros | Removido |
| Test users | Removidos |
| Dados de registro (`registration_data`) | Migrado para `sessionStorage` |
| SVG dinâmico | Sanitizado com DOMPurify |

---

## O que NÃO está protegido no banco de dados 🔴

O scan de segurança encontrou **105 achados**, sendo **5 CRÍTICOS (error)** e vários warnings. Resumo:

### Críticos (exploráveis AGORA)

| # | Problema | Impacto |
|---|----------|---------|
| 1 | **`user_roles` com RLS desabilitado** | Qualquer usuário logado pode inserir `role='admin'` para si mesmo, tornando-se admin instantaneamente. Esta é a tabela que controla TODAS as permissões do sistema. |
| 2 | **`user_profiles` com RLS desabilitado** | Nomes, telefones, datas de nascimento, gênero, ocupação de TODOS os usuários são legíveis e editáveis por qualquer pessoa. |
| 3 | **`tourism_inventory` com RLS desabilitado** | CPFs (equivalente a SSN) e dados de responsáveis legais expostos publicamente. |
| 4 | **`plano_diretor_documents` — políticas com bug** | Condição `OR is_valid_uuid(criador_id)` é sempre `true` (pois `criador_id` é `uuid NOT NULL`), anulando a proteção. Qualquer usuário pode ler/editar/deletar documentos de planejamento. |
| 5 | **`ai_consultant_config` — política pública** | Política `USING: true` para role `public` permite que usuários anônimos leiam `gemini_api_key_encrypted` e modifiquem configs. |

### Warnings (também exploráveis)

| Problema | Tabelas afetadas |
|----------|-----------------|
| RLS desabilitado | `viajar_employees`, `guata_user_memory`, `system_fallback_config` |
| Políticas sem ownership check | `ai_prompt_configs`, `guata_knowledge_base`, `knowledge_base_uploads`, `region_cities` |
| Funções sem `search_path` fixo | ~30 funções (risco de SQL injection via search_path) |
| Leaked password protection | Desabilitado no Supabase Auth |
| Postgres version | Patches de segurança disponíveis |

---

## Resumo em linguagem simples

O código-fonte (frontend) está limpo — sem chaves expostas, sem dados sensíveis no browser.

Porém, o **banco de dados está aberto**. A situação mais grave: qualquer pessoa que crie uma conta no seu site pode se tornar admin em 5 segundos com um simples comando no console do browser:

```text
supabase.from('user_roles').insert({ user_id: 'meu-id', role: 'admin' })
```

Isso dá acesso total ao sistema porque `user_roles` não tem RLS habilitado.

---

## Plano de Correção (Banco de Dados)

### Fase 1 — Críticos (5 migrações SQL)

1. **Habilitar RLS em `user_roles`** — manter policies existentes (admin-manage, self-read)
2. **Habilitar RLS em `user_profiles`** — policies existentes já são corretas
3. **Habilitar RLS em `tourism_inventory`** — policies existentes já são corretas
4. **Corrigir políticas de `plano_diretor_documents`** — remover `OR is_valid_uuid(criador_id)`
5. **Corrigir política de `ai_consultant_config`** — substituir policy pública por `service_role` only

### Fase 2 — Warnings (6 migrações SQL)

6. Habilitar RLS em `viajar_employees`, `guata_user_memory`, `system_fallback_config`
7. Restringir write em `ai_prompt_configs`, `guata_knowledge_base`, `knowledge_base_uploads`, `region_cities` a admins
8. Habilitar leaked password protection no Supabase Auth

### Fase 3 — Hardening

9. Adicionar `SET search_path = 'public'` nas ~30 funções sem search_path fixo

**Total estimado**: ~10 migrações SQL, 0 arquivos de código alterados.

