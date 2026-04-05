

# Plano: Corrigir Guatá (APIs Google) + Build Error

## Problema Principal

Os logs mostram claramente dois problemas:

1. **Gemini API retorna 429** com `limit: 0` no free tier. Isso significa que a quota do plano gratuito do Google AI Studio esta **zerada**. A mensagem diz: `Quota exceeded for metric: generate_content_free_tier_requests, limit: 0`. Ou seja, o plano gratuito nao tem mais cota disponivel.

2. **Google Custom Search retorna 403**: `This project does not have the access to Custom Search JSON API`. A API Custom Search JSON nao esta habilitada no projeto do Google Cloud.

3. **Secrets errados para o `guata-web-rag`**: A funcao usa `PSE_API_KEY` e `PSE_CX` para busca web, mas os secrets configurados no Supabase sao `GOOGLE_SEARCH_API_KEY` e `GOOGLE_SEARCH_ENGINE_ID` (do proxy). O RAG nao tem esses secrets.

## Solucoes

### 1. Resolver Quota do Gemini (acao manual do usuario)

A quota `limit: 0` no free tier significa que voce precisa:
- **Opcao A**: Ativar o faturamento (billing) no Google Cloud Console para o projeto vinculado a sua GEMINI_API_KEY. Mesmo com billing ativo, o uso baixo continua gratuito.
- **Opcao B**: Criar uma nova API key em outro projeto Google Cloud com billing ativo.

Sem billing ativo, o Google coloca `limit: 0` no free tier periodicamente.

### 2. Resolver Google Custom Search 403 (acao manual do usuario)

No Google Cloud Console do projeto vinculado a `GOOGLE_SEARCH_API_KEY`:
- Ir em **APIs & Services > Library**
- Buscar **Custom Search JSON API**
- Clicar **Enable**

### 3. Corrigir nomes dos secrets no `guata-web-rag` (mudanca de codigo)

O edge function `guata-web-rag` usa `PSE_API_KEY` e `PSE_CX` (linhas 509-510), mas os secrets configurados no Supabase sao `GOOGLE_SEARCH_API_KEY` e `GOOGLE_SEARCH_ENGINE_ID`. Vou atualizar para usar os mesmos nomes.

### 4. Adicionar `lovable.app` nas origins permitidas

Ambos os edge functions bloqueiam chamadas do preview Lovable porque `lovable.app` nao esta na lista de origins. Vou adicionar.

### 5. Melhorar tratamento de erro 429

Em vez de mostrar o texto tecnico bruto do Google ao usuario, retornar uma mensagem amigavel.

### 6. Adicionar modelo `gemini-2.0-flash` na allowlist do proxy

O `guata-gemini-proxy` tem uma lista de modelos permitidos (linha 138) que nao inclui `gemini-2.0-flash`. Vou adicionar.

### 7. Fix build error LocationPicker.tsx

Adicionar type assertion `as string` nas linhas 465 e 468.

## Arquivos Afetados

| Arquivo | Acao |
|---------|------|
| `supabase/functions/guata-gemini-proxy/index.ts` | Adicionar lovable.app nas origins, gemini-2.0-flash na allowlist, melhorar erro 429 |
| `supabase/functions/guata-web-rag/index.ts` | Corrigir nomes dos secrets PSE→GOOGLE_SEARCH, adicionar lovable.app, melhorar erro 429 |
| `src/components/admin/LocationPicker.tsx` | Fix TypeScript: type assertion |

## Acoes Manuais do Usuario (OBRIGATORIAS)

1. **Google Cloud Console**: Ativar billing no projeto da GEMINI_API_KEY
2. **Google Cloud Console**: Habilitar "Custom Search JSON API" no projeto da GOOGLE_SEARCH_API_KEY
3. **Supabase Secrets**: Verificar que `GOOGLE_SEARCH_API_KEY` e `GOOGLE_SEARCH_ENGINE_ID` estao configurados nos secrets do Edge Functions

