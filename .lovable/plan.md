

# Plano de Correção — Vulnerabilidades Restantes

## O que ainda está vulnerável

1. **23+ arquivos ainda expõem a chave da Gemini AI no código público** — qualquer pessoa pode copiar e usar
2. **Sistema de "test users" ainda existe** em `TestUsers.ts`, `TestLogin.tsx`, `TestUserSelector.tsx`, `AttendantDashboardRestored.tsx`, `DebugPanel.tsx` — embora o AuthProvider não aceite mais, o código e a rota `/test-login` continuam acessíveis
3. **Google Search API keys expostas** em 6+ arquivos client-side
4. **Dados de registro (CNPJ)** salvos em localStorage sem limpeza automática
5. **`dangerouslySetInnerHTML`** em 6 páginas de políticas usa `policyService.markdownToHtml()` — já sanitizado no policyService, mas preciso confirmar que todas passam pelo DOMPurify

## Ações (por ordem de impacto)

### 1. Migrar 17 serviços AI para usar `callGeminiProxy` (CRÍTICO)
Remover `import { GoogleGenerativeAI }` e `VITE_GEMINI_API_KEY` de cada arquivo. Substituir as chamadas diretas por `callGeminiProxy()`.

**Arquivos:**
- `src/services/ai/GeminiAIService.ts` — reescrever `makeRequest` para usar proxy
- `src/services/ai/guataGeminiService.ts` — substituir `this.genAI` por `callGeminiProxy`
- `src/services/ai/profileAIService.ts` — idem
- `src/services/ai/goalsAIService.ts` — idem
- `src/services/ai/ragService.ts` — idem (+ remover Supabase URL/key hardcoded)
- `src/services/ai/autoInsightsService.ts` — idem
- `src/services/ai/documentAnalysisService.ts` — idem
- `src/services/ai/inventoryAIService.ts` — idem
- `src/services/ai/dataInterpretationAIService.ts` — idem
- `src/services/public/strategicAIService.ts` — idem
- `src/services/public/inventoryAnalyticsService.ts` — idem
- `src/services/public/eventPredictiveAnalytics.ts` — idem
- `src/services/public/userDataAggregationService.ts` — idem
- `src/services/public/eventAnalyticsService.ts` — idem
- `src/services/events/IntelligentEventService.ts` — idem (3 instâncias)
- `src/services/events/GeminiEventProcessor.ts` — idem
- `src/services/viajar/DocumentProcessor.ts` — idem
- `src/services/diagnostic/adaptiveDiagnosticService.ts` — idem
- `src/config/apiKeys.ts` — remover referência à GEMINI key

### 2. Remover código de test users (CRÍTICO)
- Deletar `src/services/auth/TestUsers.ts`
- Deletar `src/pages/TestLogin.tsx`
- Deletar `src/components/auth/TestUserSelector.tsx`
- Limpar referências em `AttendantDashboardRestored.tsx` e `DebugPanel.tsx`
- Remover rota `/test-login` do `App.tsx`

### 3. Mover Google Search keys para edge function existente (ALTA)
- `src/services/ai/guataRealWebSearchService.ts` — usar edge function `guata-google-search-proxy`
- `src/services/ai/search/googleSearchAPI.ts` — idem
- `src/services/data/FreeDataService.ts` — idem
- `src/services/private/regionalDataService.ts` — idem
- `src/config/apiKeys.ts` — remover Google keys

### 4. Migrar `registration_data` para `sessionStorage` (MÉDIA)
- `src/pages/OverflowOneRegister.tsx` — trocar `localStorage` por `sessionStorage`
- `src/components/onboarding/ProfileCompletion.tsx` — idem
- `src/pages/ViaJAROnboarding.tsx` — idem + limpar ao finalizar

### 5. Garantir sanitização em todas as páginas de políticas (MÉDIA)
Verificar que `policyService.markdownToHtml()` já aplica DOMPurify (confirmado). Nenhuma mudança necessária nessas páginas — o policyService já sanitiza.

## Execução

Serão editados ~30 arquivos. A abordagem: cada serviço AI terá seu `this.genAI` / `GoogleGenerativeAI` removido e substituído por `callGeminiProxy()`, mantendo a mesma interface pública. Arquivos de test users serão deletados. Google Search será migrado para a edge function proxy existente.

