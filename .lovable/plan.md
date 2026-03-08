

# Status das Correções — O que falta executar

## Resumo Rápido

Das 5 ações planejadas, **nenhuma foi 100% concluída**. Aqui está o status real:

---

## 1. Migrar serviços AI para `callGeminiProxy` — ⚠️ INCOMPLETO

**O que foi feito**: 15 arquivos foram editados (GeminiAIService, profileAIService, goalsAIService, ragService, etc.)

**O que ainda falta** (3 arquivos ainda usam `GoogleGenerativeAI` ou `VITE_GEMINI_API_KEY` diretamente):

| Arquivo | Problema |
|---|---|
| `src/services/ai/guataGeminiService.ts` | Ainda importa `GoogleGenerativeAI`, lê `VITE_GEMINI_API_KEY`, cria instância `genAI` diretamente |
| `src/services/ai/StrategicAIService.ts` | Ainda lê `VITE_GEMINI_API_KEY` e faz fetch direto à API do Google |
| `src/services/events/IntelligentEventService.ts` | 2 instâncias de `new GoogleGenerativeAI(GEMINI_API_KEY)` ainda presentes |

Além disso, 4 arquivos de suporte ainda referenciam a key:
- `src/pages/GuataTest.tsx` — página de teste que verifica status das APIs
- `src/services/admin/systemHealthService.ts` — health check lê a key
- `src/services/events/EventManagementService.ts` — verifica existência da key
- `src/config/apiKeys.ts` — instruções de configuração (não é código executável)

---

## 2. Remover sistema de test users — ❌ NÃO FEITO

Os seguintes arquivos/rotas ainda existem e precisam ser removidos:

| Ação | Arquivo |
|---|---|
| Deletar | `src/services/auth/TestUsers.ts` |
| Deletar | `src/pages/TestLogin.tsx` |
| Deletar | `src/components/auth/TestUserSelector.tsx` |
| Deletar | `src/components/auth/QuickTestLogin.tsx` |
| Limpar referências | `src/components/cat/AttendantDashboardRestored.tsx` (lê `test_user_id`/`test_user_data` do localStorage) |
| Limpar referências | `src/components/debug/DebugPanel.tsx` |
| Remover rota `/test-login` | `src/App.tsx` |

O `AuthProvider.tsx` já foi corrigido (apenas limpa resíduos do localStorage), mas o código morto dos test users continua no projeto.

---

## 3. Mover Google Search keys para edge function — ❌ NÃO FEITO

6 arquivos client-side ainda leem `VITE_GOOGLE_SEARCH_API_KEY` e `VITE_GOOGLE_SEARCH_ENGINE_ID`:

| Arquivo | Ação |
|---|---|
| `src/services/ai/guataRealWebSearchService.ts` | Migrar para usar edge function `guata-google-search-proxy` |
| `src/services/ai/search/googleSearchAPI.ts` | Idem |
| `src/services/ai/intelligentWebSearchService.ts` | Idem |
| `src/services/data/FreeDataService.ts` | Idem |
| `src/services/private/regionalDataService.ts` | Idem |
| `src/services/events/GoogleSearchEventService.ts` | Idem |

---

## 4. Migrar `registration_data` para `sessionStorage` — ❌ NÃO FEITO

3 arquivos ainda usam `localStorage` para dados de registro (CNPJ, dados de empresa):
- `src/pages/OverflowOneRegister.tsx`
- `src/components/onboarding/ProfileCompletion.tsx`
- `src/pages/ViaJAROnboarding.tsx`

---

## 5. Sanitização de políticas — ✅ FEITO

`policyService.markdownToHtml()` já aplica DOMPurify. Nada a fazer.

---

## Plano de Execução

### Bloco A — Finalizar migração AI (3 arquivos críticos)
1. Reescrever `guataGeminiService.ts` para usar `callGeminiProxy` em vez de `GoogleGenerativeAI`
2. Reescrever `StrategicAIService.ts` para usar `callGeminiProxy`
3. Remover `new GoogleGenerativeAI()` do `IntelligentEventService.ts`
4. Limpar referências residuais em `GuataTest.tsx`, `systemHealthService.ts`, `EventManagementService.ts`

### Bloco B — Deletar test users
1. Deletar 4 arquivos: `TestUsers.ts`, `TestLogin.tsx`, `TestUserSelector.tsx`, `QuickTestLogin.tsx`
2. Limpar referências em `AttendantDashboardRestored.tsx` e `DebugPanel.tsx`
3. Remover rota `/test-login` do `App.tsx`

### Bloco C — Migrar Google Search para edge function
1. Criar helper `callGoogleSearchProxy()` que invoca `guata-google-search-proxy`
2. Substituir em 6 arquivos client-side

### Bloco D — sessionStorage para registro
1. Trocar `localStorage` por `sessionStorage` em 3 arquivos

Total: ~16 arquivos editados, 4 deletados.

