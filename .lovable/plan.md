
# Plano de Correção Final — Referências Residuais

## Status Atual

As correções principais **já foram aplicadas** nas rodadas anteriores:
- `.env` — ja limpo (sem VITE_GEMINI_API_KEY ou VITE_GOOGLE_SEARCH_API_KEY)
- `guataRealWebSearchService.ts` — ja retorna `[]` quando Edge Function falha (sem fallback client-side)
- `BankAccountsManager.tsx` — ja usa apenas Supabase (sem localStorage)
- `planoDiretorService.ts` — lógica de test user **ja removida** (não encontrada no código atual)
- `guataGeminiService.ts` — mensagem de log **ja corrigida** (menciona Edge Function)

## O que ainda resta (3 pontos residuais)

### 1. `src/config/apiKeys.ts` — Instruções desatualizadas
- Linha 83: ainda diz "Adicione as variáveis: VITE_GOOGLE_SEARCH_API_KEY..."
- Linha 106: ainda diz "Adicione a variável: VITE_GEMINI_API_KEY"
- **Correção**: Atualizar para mencionar Supabase Secrets

### 2. `src/services/events/GoogleSearchEventService.ts` — Usa API_CONFIG.GOOGLE.SEARCH_API_KEY (que não existe mais)
- Linha 9: importa `API_CONFIG` de apiKeys
- Linha 338: chama `API_CONFIG.GOOGLE.isConfigured()` (funciona, retorna true)
- Linha 370-371: acessa `API_CONFIG.GOOGLE.SEARCH_API_KEY` — **campo inexistente**, sempre undefined
- Linha 381: monta URL com a key undefined — **requisição sempre falha**
- **Correção**: Migrar para usar Edge Function `guata-google-search-proxy` via supabase SDK (mesmo padrão dos outros serviços)

### 3. `supabase/functions/guata-google-search-proxy/index.ts` — Fallbacks confusos
- Linha 149: fallback para `VITE_GOOGLE_SEARCH_API_KEY` (nome confuso no server)
- Linha 153: engine ID hardcoded como fallback
- **Correção**: Remover fallbacks VITE_ e engine ID hardcoded

## Arquivos a editar: 3

| Arquivo | Mudança |
|---------|---------|
| `src/config/apiKeys.ts` | Atualizar instruções de setup (linhas 83 e 106) |
| `src/services/events/GoogleSearchEventService.ts` | Substituir import de API_CONFIG por supabase client; reescrever `searchEvents()` para usar Edge Function |
| `supabase/functions/guata-google-search-proxy/index.ts` | Remover fallbacks VITE_ e engine ID hardcoded |
