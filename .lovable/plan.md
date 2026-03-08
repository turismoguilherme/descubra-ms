

# Auditoria de Segurança Completa — Status Atual

## O que JÁ está seguro ✅

1. **Autenticação** — `AuthProvider.tsx` usa apenas Supabase Auth real. Test users removidos do fluxo de login.
2. **Gemini AI** — 15+ serviços migrados para `callGeminiProxy()` via Edge Function. `guataGeminiService.ts` também usa Edge Function (confirmado no código).
3. **Passaporte Digital** — Validação de geofence server-side via `validate_and_stamp_checkpoint` (RPC com Haversine no PostgreSQL).
4. **XSS em Políticas** — Todos os `dangerouslySetInnerHTML` de políticas passam por `policyService.markdownToHtml()` com DOMPurify. O `PoliciesEditor.tsx` também usa `DOMPurify.sanitize()` diretamente.
5. **Email Templates** — `EmailTemplatesManager.tsx` usa `DOMPurify.sanitize()`.
6. **Passport Service** — Usando SDK Supabase em vez de fetch manual.
7. **Dados de Registro** — `registration_data` já migrado para `sessionStorage` nos 3 arquivos.
8. **Roles** — Tabela `user_roles` separada com RLS. Funções `SECURITY DEFINER` para validação.

---

## Vulnerabilidades que AINDA existem 🔴

### 1. Google Search API Key exposta no client-side (ALTA)

`guataRealWebSearchService.ts` (linhas 94-115) ainda lê `VITE_GOOGLE_SEARCH_API_KEY` diretamente e faz fetch à API do Google no fallback (linha 291). A Edge Function é tentada primeiro, mas se falhar, a chave do `.env` é usada no browser.

`GoogleSearchEventService.ts` (linha 370) lê `API_CONFIG.GOOGLE.SEARCH_API_KEY` — mas esse campo **não existe mais** no `apiKeys.ts` (foi removido). Isso significa que esse serviço já está **quebrado/inofensivo** — nunca consegue fazer a requisição.

**Ação necessária**: Remover o fallback client-side do `guataRealWebSearchService.ts` (linhas 258-380). Se a Edge Function falhar, retornar array vazio em vez de tentar com a chave no browser.

### 2. Gemini API Key no `.env` ainda é exposta no build (ALTA)

O arquivo `.env` contém `VITE_GEMINI_API_KEY=AIzaSy...`. Qualquer variável com prefixo `VITE_` é **incluída no bundle JavaScript** pelo Vite e visível para qualquer usuário. Mesmo que o código não leia mais essa variável, ela está presente no bundle final.

**Ação necessária**: Remover `VITE_GEMINI_API_KEY` e `VITE_GOOGLE_SEARCH_API_KEY` do `.env`. Essas chaves devem existir apenas como Supabase Secrets (para as Edge Functions).

### 3. Dados financeiros em localStorage (MÉDIA)

`BankAccountsManager.tsx` salva contas bancárias (`bank_accounts`) e fornecedores (`suppliers`) no `localStorage` como fallback quando o Supabase falha. Isso inclui nomes de banco, agência, conta. Qualquer script na página pode ler esses dados.

**Ação necessária**: Remover o fallback para localStorage. Se o Supabase falhar, mostrar erro em vez de salvar dados sensíveis no browser.

### 4. Lógica de test user residual no `planoDiretorService.ts` (MÉDIA)

Linhas 619-635 e 798-806 ainda contêm lógica para converter "IDs de teste" em UUIDs determinísticos. Isso não é um bypass de autenticação (depende do Supabase), mas é código morto que confunde a manutenção.

**Ação necessária**: Remover a lógica de `TEST_USER_NAMESPACE` e `isTestUserId`.

### 5. SVG sem sanitização no `MSInteractiveMap.tsx` (BAIXA)

Linha 255 renderiza `svgContent` com `dangerouslySetInnerHTML` sem DOMPurify. Se o SVG vier de uma fonte controlada (arquivo local), o risco é baixo. Mas se vier de um endpoint externo ou do banco, é XSS.

**Ação necessária**: Verificar a origem do SVG. Se for dinâmico, aplicar DOMPurify.

### 6. Log de mensagem enganosa no `guataGeminiService.ts` (BAIXA)

Linha 108 ainda diz `"Verifique VITE_GEMINI_API_KEY"` — mas essa variável não deveria mais existir. Isso confunde desenvolvedores.

**Ação necessária**: Corrigir mensagem para mencionar Edge Function.

---

## Resumo em linguagem simples

Imagine sua aplicação como uma loja:
- **A porta principal está trancada** ✅ (autenticação funciona)
- **O cofre está protegido** ✅ (passaporte, roles, geofence)
- **Mas tem 2 chaves penduradas na vitrine** 🔴 — as API keys do Google e Gemini no `.env` com prefixo `VITE_` são visíveis para qualquer visitante no código-fonte do site
- **E tem um caderno com dados de contas bancárias atrás do balcão** 🟡 — o localStorage com dados financeiros

---

## Plano de Correção (6 ações, ~8 arquivos)

| # | Ação | Risco | Arquivos |
|---|------|-------|----------|
| 1 | Remover `VITE_GEMINI_API_KEY` e `VITE_GOOGLE_SEARCH_API_KEY` do `.env` | ALTO | `.env` |
| 2 | Remover fallback client-side do `guataRealWebSearchService.ts` | ALTO | 1 arquivo |
| 3 | Remover localStorage de dados financeiros no `BankAccountsManager.tsx` | MÉDIO | 1 arquivo |
| 4 | Limpar lógica test user do `planoDiretorService.ts` | MÉDIO | 1 arquivo |
| 5 | Sanitizar SVG no `MSInteractiveMap.tsx` (se dinâmico) | BAIXO | 1 arquivo |
| 6 | Corrigir mensagem de log no `guataGeminiService.ts` | BAIXO | 1 arquivo |

