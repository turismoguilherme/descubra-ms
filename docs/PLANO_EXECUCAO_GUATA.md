# Plano de execução — Guatá (IA, RAG, busca e memória)

Este documento descreve **o que foi implementado no código** e **o que ainda depende de configuração manual** (Google Cloud, Supabase, conteúdo).

---

## Fase A — Já implementado no repositório

| Item | O quê | Por quê |
|------|--------|--------|
| **A1** | Migration `20260318000001_fix_guata_user_memory_rls_anon_auth.sql` | Corrige RLS: usuários **autenticados** podiam falhar ao inserir memória com `user_id` null (ML); **anon** volta a ter política de INSERT explícita. |
| **A2** | Edge `guata-web-rag`: mensagens de erro **específicas** (sem API key, HTTP Gemini, resposta vazia, exceção) + campo opcional `guata_ai_meta` na resposta JSON | Evita a mesma frase genérica e ajuda suporte/diagnóstico. |
| **A3** | Modelo Gemini configurável via secret **`GEMINI_MODEL`** (padrão `gemini-2.0-flash`) | Permite trocar modelo sem alterar código se a API mudar. |
| **A4** | Threshold de embedding **`GUATA_EMBEDDING_SIM_MIN`** (padrão **0,25**, antes 0,3) | Um pouco mais permissivo para trazer chunks do RAG quando o banco é esparso. |
| **A5** | Remoção de chamadas `fetch` para `127.0.0.1:7242` (instrumentação de debug) | Elimina ruído `ERR_CONNECTION_REFUSED` no console. |
| **A6** | `BrandContext`: removido código duplicado acidental dentro de `detectTenantFromPath` | Corrige possível confusão e mantém detecção de tenant limpa. |
| **A7** | `safeLog` / logs locais passam a usar `console.debug` quando `VITE_DEBUG_LOGS=true` | Debug local sem servidor ingest. |

---

## Fase B — Ações manuais (você / administrador)

Execute nesta ordem após aplicar migrations e fazer deploy das Edge Functions.

### B1. Aplicar migration no Supabase

```bash
supabase db push
# ou aplicar o SQL da migration no painel SQL Editor
```

### B2. Secrets da Edge Function `guata-web-rag` (Supabase Dashboard → Edge Functions → Secrets)

| Secret | Obrigatório | Notas |
|--------|-------------|--------|
| `GEMINI_API_KEY` | Sim | Chave Google AI (Generative Language API). |
| `GEMINI_MODEL` | Não | Padrão no código: `gemini-2.0-flash`. Se der 404, teste `gemini-1.5-flash` ou o nome exato da [documentação atual](https://ai.google.dev/gemini-api/docs). |
| `GUATA_EMBEDDING_SIM_MIN` | Não | Opcional; ex.: `0.22`–`0.3` para afinar recall do RAG. |

### B3. Google Custom Search (busca web no cliente / proxy)

1. Google Cloud Console → habilitar **Custom Search API**.  
2. Criar/usar **API key** com essa API liberada.  
3. **Programmable Search Engine** (CX) correto.  
4. Supabase → secrets da função **`guata-google-search-proxy`** (ou nome usado no projeto): `GOOGLE_SEARCH_API_KEY`, `GOOGLE_SEARCH_ENGINE_ID` (ajustar aos nomes reais no código da função).

**Por quê:** sem isso o log mostra `API_NOT_ENABLED` e o Guatá perde resultados web.

### B4. Conteúdo e RAG

- Garantir documentos em `document_chunks` / fontes indexadas com **embeddings** e `state_code` coerente.  
- Revisar periodicamente qualidade no painel RAG (se existir).

### B5. JWT / 401 em REST

Se ainda aparecer **401** em `guata_user_memory` após a migration:

- Confirme que o app usa **anon key** com sessão válida ou usuário logado.  
- JWT expirado pode causar 401: force refresh de sessão ou novo login.

---

## Fase C — Verificação rápida

1. Pergunta no Guatá → DevTools → resposta de `guata-web-rag`: deve incluir `answer` e, em falha de IA, `guata_ai_meta.gemini_status`.  
2. Console **sem** erros repetidos para `127.0.0.1:7242`.  
3. Insert em `guata_user_memory` como visitante (com `session_id`) → deve retornar 201, não 401/RLS (após migration).  

---

## Referência: diferença vs ChatGPT “puro”

O Guatá usa **pipeline** (KB → RAG → busca → Gemini na Edge). ChatGPT/Gemini app usam **conversa direta** ao modelo. Para conversa mais “livre”, seria necessário evoluir arquitetura (ex.: fallback que envia histórico + pergunta ao Gemini quando RAG/web falham). Isso pode ser uma **Fase D** futura.

---

**Última atualização:** março/2025 (implementação no repositório descubra-ms).
