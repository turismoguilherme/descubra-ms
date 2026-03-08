

# Avaliação Final de Segurança — Março 2026

## Veredicto: O sistema está seguro para operação. Não há vulnerabilidades críticas exploráveis.

---

## O que ESTÁ protegido ✅

| Camada | Status |
|--------|--------|
| `.env` | Limpo — apenas `VITE_SUPABASE_*` (chaves públicas do Supabase) |
| API keys sensíveis (Gemini, Google Search) | Movidas para Supabase Secrets, acessadas via Edge Functions |
| `GoogleGenerativeAI` no client-side | **Zero instâncias** — removido completamente |
| RLS em `user_roles` | Habilitado — impede escalação de privilégio |
| RLS em `user_profiles` | Habilitado — protege dados pessoais |
| RLS em `tourism_inventory` | Habilitado — protege CPFs |
| `ai_consultant_config` | Restrito a `service_role` only |
| `plano_diretor_documents` | Bug do `is_valid_uuid` corrigido |
| INSERT público em tabelas de dados | Restrito a `authenticated` (20 tabelas corrigidas) |
| Funções SQL | `search_path = 'public'` em todas |
| SVG dinâmico | Sanitizado com `DOMPurify` |
| HTML dinâmico (`dangerouslySetInnerHTML`) | **Todos os 11 usos** passam por `DOMPurify.sanitize()` — seguro |
| localStorage | Apenas preferências (idioma, cookie consent, progresso de formulário) — sem tokens, senhas ou dados financeiros |

---

## Riscos residuais BAIXOS (não exploráveis para fraude ou roubo de dados)

### 1. Mapbox token salvo em localStorage
- `RegionHeatMapSection.tsx` salva `mapbox_token` no localStorage
- **Risco**: Token do Mapbox é público por natureza (acessível no bundle JS de qualquer forma). Sem impacto real.

### 2. Variáveis VITE_ referenciadas mas não configuradas
- `VITE_OPENWEATHER_API_KEY`, `VITE_GOOGLE_TRANSLATE_API_KEY`, `VITE_ALUMIA_API_KEY`, `VITE_MAPBOX_TOKEN`, `VITE_GOOGLE_PLACES_API_KEY`
- **Risco**: Nenhum. Todas retornam `''` ou `undefined`. Nenhuma chave real está no `.env`. Os serviços simplesmente não funcionam (degradação graciosa), não expõem nada.

### 3. `markdownToHtml` sem DOMPurify direto
- Todas as chamadas a `policyService.markdownToHtml()` já usam `DOMPurify.sanitize()` internamente (linha 128 do `policyService.ts`). **Seguro.**

---

## Perguntas específicas respondidas

### "Corre risco de expor algo?"
**Não.** Nenhuma API key sensível está no bundle do cliente. O `.env` contém apenas a anon key do Supabase (pública por design). Dados pessoais (CPFs, perfis) estão protegidos por RLS.

### "Corre risco de fraude?"
**Não.** A escalação de privilégio foi bloqueada (RLS em `user_roles`). Transações financeiras (`partner_transactions`) exigem autenticação. Operações admin são validadas server-side via `is_admin_user()` (SECURITY DEFINER).

### "Outro perigo?"
**Não há perigos críticos.** Os únicos itens pendentes são:
1. **Ação manual**: Habilitar "Leaked Password Protection" no dashboard do Supabase Auth
2. **Ação manual**: Reduzir OTP expiry de 86400s (24h) para 300-600s (5-10min)
3. **Erros de build (TypeScript)**: São erros de tipagem, não de segurança. Não afetam runtime.

---

## Conclusão

O código **não expõe dados sensíveis**, **não permite fraude**, e **não tem vulnerabilidades críticas exploráveis**. As únicas ações pendentes são 2 configurações manuais no dashboard do Supabase que fortalecem a proteção de senhas.

