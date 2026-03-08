

# Auditoria de Segurança Completa — Plano de Remediação

## Resumo Executivo

Foram identificadas **13 vulnerabilidades** em diferentes níveis de severidade. As mais críticas envolvem escalação de privilégios via RLS, exposição de API keys no client-side e dados pessoais acessíveis publicamente.

---

## Vulnerabilidades Encontradas (ordenadas por criticidade)

### CRÍTICA (Ação Imediata)

**1. RLS permite auto-escalação de privilégios em `user_roles`**
- **Risco**: Qualquer usuário autenticado pode executar `UPDATE user_roles SET role = 'admin' WHERE user_id = auth.uid()` e se tornar admin instantaneamente.
- **Causa**: Policies `"Admins and self-update can update roles"` e `"Admins and self-register can insert roles"` têm `OR (auth.uid() = user_id)`.
- **Correção**: Migração SQL para dropar essas policies e criar novas que permitem apenas admins modificar roles. Usar `secure_update_user_role()` (que já existe) como único caminho de alteração.

**2. Gemini API Key exposta no client-side (24+ arquivos)**
- **Risco**: `VITE_GEMINI_API_KEY` é incluída no bundle JS público. Qualquer pessoa pode extraí-la e usar a API sem limites.
- **Arquivos afetados**: `guataGeminiService.ts`, `StrategicAIService.ts`, `ragService.ts`, `GeminiAIService.ts`, `documentAnalysisService.ts`, `autoInsightsService.ts`, `inventoryAIService.ts`, `dataInterpretationAIService.ts`, `DocumentProcessor.ts`, `inventoryAnalyticsService.ts` e mais.
- **Correção**: Redirecionar todas as chamadas Gemini para edge functions existentes (`guata-gemini-proxy`, `guata-ai`). Remover `VITE_GEMINI_API_KEY` do client. Criar edge functions adicionais se necessário.

**3. Tabela `events` com policy `USING (true)` expõe dados de contato + eventos rejeitados**
- **Risco**: Emails e telefones de organizadores acessíveis publicamente, incluindo eventos com `approval_status = 'rejected'`.
- **Correção**: Dropar policy permissiva, criar policy que filtra por `is_visible = true AND approval_status = 'approved'` para público, e permitir criadores/admins verem tudo.

### ALTA

**4. Tabela `user_profiles` expõe todos os perfis para qualquer autenticado**
- **Risco**: Policy `"Authenticated users can read user profiles"` permite ler nome, email, telefone de todos os usuários. Viola LGPD.
- **Correção**: Substituir por policy owner-scoped + policy para admins.

**5. Múltiplas tabelas com RLS desabilitado (`SUPA_rls_disabled_in_public`)**
- **Risco**: Tabelas públicas sem proteção de acesso.
- **Correção**: Habilitar RLS e criar policies apropriadas para cada tabela afetada.

**6. `dangerouslySetInnerHTML` sem sanitização em `EmailTemplatesManager.tsx`**
- **Risco**: XSS se um admin inserir HTML malicioso em templates de email. O `body_template` é renderizado diretamente sem DOMPurify.
- **Correção**: Passar `formData.body_template` por `sanitizeHtml()` antes de renderizar.

**7. `markdownToHtml` em `policyService.ts` não sanitiza saída**
- **Risco**: Conversão de markdown para HTML via regex sem sanitização posterior. Se o conteúdo das policies vier do banco (editável por admins), pode injetar scripts.
- **Correção**: Aplicar `DOMPurify.sanitize()` no resultado final de `markdownToHtml()`.

### MÉDIA

**8. Dados financeiros (contas bancárias, fornecedores) em `localStorage`**
- **Risco**: `BankAccountsManager.tsx` persiste dados bancários sensíveis (número de conta, agência, saldo) em localStorage, acessível por qualquer script na página.
- **Correção**: Migrar para Supabase com RLS. Remover localStorage para dados financeiros.

**9. `@ts-nocheck` em 175+ arquivos**
- **Risco**: Desabilita verificação de tipos, permitindo bugs e potenciais falhas de segurança passarem despercebidos.
- **Correção**: Remover gradualmente `@ts-nocheck`, corrigir erros de tipo.

**10. Dependência `jspdf@2.5.2` com vulnerabilidade crítica (Path Traversal)**
- **Risco**: Local File Inclusion / Path Traversal (GHSA-f8cm-6447-x5h2).
- **Correção**: Atualizar jspdf para versão corrigida.

### BAIXA

**11. Rate limiting client-side em `securityService.ts` usando localStorage**
- **Risco**: Facilmente burlável limpando localStorage.
- **Correção**: Já existem edge functions de rate limiting; garantir que os fluxos críticos usem apenas server-side.

**12. Logs de segurança desabilitados em `securityService.ts`**
- **Risco**: `logSecurityEvent` retorna imediatamente com `return;` — nenhum evento é de fato registrado.
- **Correção**: Reabilitar logging ou remover código morto e usar `enhancedSecurityService` consistentemente.

**13. `registration_data` com dados de CNPJ em localStorage (`OverflowOneRegister.tsx`)**
- **Risco**: Dados de negócio persistidos em localStorage sem TTL.
- **Correção**: Usar sessionStorage ou limpar após consumo.

---

## Plano de Implementação (Faseado)

### Fase 1 — Críticas (imediata)
| # | Ação | Arquivo/Local |
|---|------|---------------|
| 1 | Migração SQL: corrigir RLS de `user_roles` | Nova migração SQL |
| 2 | Migração SQL: corrigir policy de `events` | Nova migração SQL |
| 3 | Migração SQL: corrigir policy de `user_profiles` | Nova migração SQL |
| 4 | Redirecionar chamadas Gemini para edge functions | 10+ serviços em `src/services/ai/` |

### Fase 2 — Altas (1-2 dias)
| # | Ação | Arquivo/Local |
|---|------|---------------|
| 5 | Habilitar RLS em tabelas faltantes | Nova migração SQL |
| 6 | Sanitizar `dangerouslySetInnerHTML` no EmailTemplates | `EmailTemplatesManager.tsx` |
| 7 | Sanitizar saída de `markdownToHtml` | `policyService.ts` |
| 8 | Migrar dados financeiros de localStorage para Supabase | `BankAccountsManager.tsx` |

### Fase 3 — Médias/Baixas (gradual)
| # | Ação | Arquivo/Local |
|---|------|---------------|
| 9 | Atualizar jspdf | `package.json` |
| 10 | Reabilitar security logging | `securityService.ts` |
| 11 | Limpar `@ts-nocheck` dos arquivos críticos | 175 arquivos |
| 12 | Migrar rate limiting para server-side | `securityService.ts` |
| 13 | Usar sessionStorage para dados temporários de registro | `OverflowOneRegister.tsx` |

---

## Recomendação

Sugiro começar pela **Fase 1** (vulnerabilidades críticas), especialmente os itens 1-3 que são migrações SQL que podem ser aplicadas imediatamente. O item 4 (Gemini API key) é o mais trabalhoso, pois afeta 24+ arquivos, mas é fundamental.

Deseja que eu implemente a **Fase 1** agora?

