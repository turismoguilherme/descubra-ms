

# Auditoria de Segurança Completa — Descubra MS + ViajARTur

## VULNERABILIDADE CRÍTICA #1: Bypass de Autenticação via localStorage (FRAUDE TOTAL)

**Risco**: Qualquer pessoa pode se tornar admin da plataforma inteira abrindo o console do navegador e digitando:
```js
localStorage.setItem('test_user_id', 'admin-1');
localStorage.setItem('test_user_data', JSON.stringify({id:'admin-1', role:'admin', name:'Hacker', email:'x@x.com', autoLogin:true}));
```

O `AuthProvider.tsx` (linhas 70-140) aceita esses dados **sem validação nenhuma** e cria um "usuário simulado" com qualquer role. O `useRoleBasedAccess.ts` (linhas 30-70) também lê `test_user_data` do localStorage e concede permissões baseadas nesse JSON.

**Impacto**: Acesso total a painéis admin, gestão municipal, CAT, dados de todos os usuários, parceiros comerciais, financeiro.

**Arquivos afetados**:
- `src/hooks/auth/AuthProvider.tsx` — aceita test users via localStorage
- `src/hooks/useRoleBasedAccess.ts` — deriva permissões de localStorage
- `src/services/auth/TestUsers.ts` — lista hardcoded de test users com roles admin
- `src/pages/TestLogin.tsx` — UI pública para login como qualquer role
- `src/components/auth/TestUserSelector.tsx`
- `src/components/auth/QuickTestLogin.tsx`
- `src/pages/PrivateDashboard.tsx` — usa getCurrentTestUser()
- `src/components/secretary/SecretaryDashboard.tsx` — usa getCurrentTestUser()
- `src/components/cat/AttendantDashboardRestored.tsx` — lê test_user do localStorage

**Correção**: Remover TODA a lógica de test users do código de produção. Envolver em `import.meta.env.DEV` ou remover completamente.

---

## VULNERABILIDADE CRÍTICA #2: Gemini API Key ainda exposta em 23+ arquivos

A correção anterior tocou apenas `src/config/gemini.ts` e `src/services/ai/index.ts`, mas **23 outros arquivos** ainda usam `import.meta.env.VITE_GEMINI_API_KEY` diretamente:

| Arquivo | Uso direto |
|---|---|
| `src/services/ai/GeminiAIService.ts` | `this.apiKey = import.meta.env.VITE_GEMINI_API_KEY` |
| `src/services/ai/StrategicAIService.ts` | idem |
| `src/services/ai/guataGeminiService.ts` | idem |
| `src/services/ai/autoInsightsService.ts` | `new GoogleGenerativeAI(GEMINI_API_KEY)` |
| `src/services/ai/documentAnalysisService.ts` | idem |
| `src/services/ai/goalsAIService.ts` | idem |
| `src/services/ai/ragService.ts` | idem |
| `src/services/public/inventoryAnalyticsService.ts` | idem |
| `src/services/public/eventPredictiveAnalytics.ts` | idem |
| `src/services/public/userDataAggregationService.ts` | idem |
| `src/services/events/IntelligentEventService.ts` | idem (3 instâncias) |
| `src/services/events/GeminiEventProcessor.ts` | idem |
| `src/services/viajar/DocumentProcessor.ts` | idem |
| `src/services/diagnostic/adaptiveDiagnosticService.ts` | idem |
| + mais 8-10 arquivos |

Google Search API key e engine ID também estão expostas no client-side.

**Correção**: Criar uma função centralizada `callGeminiProxy()` que chama a edge function existente e substituir todos os usos diretos.

---

## VULNERABILIDADE CRÍTICA #3: Supabase URL + anon key hardcoded no passportService

`src/services/passport/passportService.ts` (linhas 83-85) tem URL e anon key hardcoded como propriedades de classe, fazendo fetch direto sem o SDK. Isso **bypassa RLS** se usado com Bearer do anon key em vez do token do usuário autenticado.

**Correção**: Usar o cliente Supabase SDK (`supabase` importado) em vez de fetch manual.

---

## VULNERABILIDADE ALTA #4: Geolocation validation é 100% client-side (FRAUDE NO PASSAPORTE)

O `geolocationService.ts` calcula a distância Haversine **no browser**. Um fraudador pode:
1. Usar GPS spoofing no celular
2. Interceptar a resposta do `navigator.geolocation` via console
3. Chamar diretamente a API do Supabase para inserir stamps sem validação

Existe uma função `validateProximitySQL` (RPC `check_geofence`), mas o fluxo principal em `CheckpointCheckin.tsx` usa a validação client-side.

**Correção**: Mover validação de geofence para server-side (edge function ou RPC que valide coordenadas antes de inserir stamp).

---

## VULNERABILIDADE ALTA #5: PoliciesEditor — XSS sem sanitização

`src/components/admin/settings/PoliciesEditor.tsx` (linhas 516-526 e 722-726) renderiza `currentPolicy.content` com `dangerouslySetInnerHTML` usando regex de markdown sem DOMPurify. Se um admin malicioso inserir `<script>` no conteúdo da policy, será executado para todos os visitantes.

**Correção**: Aplicar `DOMPurify.sanitize()` no resultado da conversão markdown.

---

## VULNERABILIDADE MÉDIA #6: Google Search Engine ID hardcoded

`src/services/ai/guataRealWebSearchService.ts` (linha 99) tem um engine ID hardcoded como fallback: `'a3641e1665f7b4909'`. Isso não é secreto, mas é uma configuração que deveria estar no servidor.

---

## Plano de Implementação (Priorizado)

### Fase 1 — URGENTE (impacto máximo)
| # | Ação | Escopo |
|---|------|--------|
| 1 | **Remover sistema de test users de produção** | `AuthProvider.tsx`, `useRoleBasedAccess.ts`, `TestUsers.ts`, `TestLogin.tsx`, `TestUserSelector.tsx`, `QuickTestLogin.tsx` + dashboards que usam `getCurrentTestUser()` |
| 2 | **Centralizar chamadas Gemini no proxy** | Criar `callGeminiProxy()` e substituir em 23+ arquivos |
| 3 | **Remover fetch manual no passportService** | Usar SDK do Supabase |

### Fase 2 — ALTA
| # | Ação | Escopo |
|---|------|--------|
| 4 | **Server-side geofence validation** | Migrar validação de check-in para RPC/edge function |
| 5 | **Sanitizar PoliciesEditor** | Adicionar DOMPurify no `dangerouslySetInnerHTML` |
| 6 | **Mover Google Search keys para edge functions** | `guataRealWebSearchService.ts`, `intelligentWebSearchService.ts`, etc. |

### Fase 3 — Consolidação
| # | Ação | Escopo |
|---|------|--------|
| 7 | Remover `@ts-nocheck` dos arquivos de segurança | Priorizar auth, passport, admin |
| 8 | Atualizar jspdf (Path Traversal) | `package.json` |

---

## Seção Técnica: Detalhes

**Test Users Bypass**: O `AuthProvider` tem um `useEffect` que na montagem verifica `getCurrentTestUser()`. Se encontrar, cria um `User` simulado e seta no contexto React — sem nenhuma verificação com Supabase. Todos os componentes downstream (dashboards, rotas protegidas) confiam cegamente nesse contexto.

A correção envolve envolver todo o bloco em `if (import.meta.env.DEV)` ou, preferencialmente, remover completamente e usar apenas autenticação real via Supabase Auth.

**Passport Fraud**: O fluxo de check-in faz `geolocationService.validateProximity()` (client-side Haversine) → se válido → `supabase.from('passport_stamps').insert()`. Não há validação server-side das coordenadas. Um usuário pode inserir stamps diretamente via API REST do Supabase com coordenadas falsas.

