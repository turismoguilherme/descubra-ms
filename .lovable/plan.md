

# Plano: Corrigir Admin + Limpar Código Morto + Fix Build Errors

## Problemas Identificados

### 1. "Editar Textos" não salva de verdade
**Causa raiz**: A política RLS (Row Level Security) da tabela `institutional_content` e `site_settings` só permite `admin` e `tech`, mas o papel `master_admin` não está incluído. Se o usuário logado tem role `master_admin`, a operação de UPDATE é bloqueada silenciosamente pelo Supabase.

**Solução**: Migration SQL para atualizar as políticas RLS adicionando `master_admin` à lista de roles autorizados em ambas as tabelas.

### 2. Banner Personalizado sem upload de imagem
**Causa raiz**: O `SimpleTextEditor.tsx` só mostra botão de upload para campos com `type: 'image'`. Os campos do banner personalizado (`ms_roteiro_banner_enabled`, etc.) são `toggle`, `select` e `text` — nenhum tem tipo `image`. Falta um campo de imagem para o banner.

**Solução**: Adicionar campo `ms_roteiro_banner_image` com `type: 'image'` na definição de campos do `SimpleTextEditor.tsx`, na seção "Banner Roteiro Personalizado".

### 3. Módulos desnecessários a remover

Com base no pedido do usuário:

| Módulo | Motivo da remoção |
|--------|-------------------|
| **Banco de Dados** (`DatabaseManager.tsx`) | Expõe tabelas raw — perigoso e redundante com Supabase dashboard |
| **Fallback** (`FallbackConfig.tsx`) | Modo manutenção sem implementação real conectada |
| **Análises** (dentro de IA: `AISuggestions.tsx`, `AIActionsQueue.tsx`) | Não funcional, não conectado a dados reais |
| **Agente Autônomo / Tarefas Automáticas** (`AutonomousAIAgent.tsx`) | 1679 linhas de código com `@ts-nocheck`, não funcional — simulação local sem backend real |

**Arquivos a deletar**: 4 componentes + suas referências em rotas e config de navegação.

### 4. Build Errors — Tabela `events` com colunas em português

A tabela `events` usa colunas em português (`titulo`, `descricao`, `data_inicio`, `local`, `imagem_principal`) mas ~10 arquivos referenciam colunas em inglês (`name`, `description`, `start_date`, `location`, `image_url`, `stripe_payment_link_url`, `return_domain`, `is_visible`, `approval_status`, `is_sponsored`, `sponsor_payment_status`).

**Colunas inexistentes no DB**:
- `name` → deve ser `titulo`
- `description` → `descricao`
- `start_date` → `data_inicio`
- `end_date` → `data_fim`
- `location` → `local`
- `image_url` → `imagem_principal`
- `stripe_payment_link_url` → não existe
- `return_domain` → não existe
- `is_visible` → não existe
- `approval_status` → não existe
- `is_sponsored` → não existe
- `sponsor_payment_status` → não existe

**Solução**: Corrigir cada arquivo para usar os nomes reais das colunas. Para colunas que não existem no banco (`stripe_payment_link_url`, `return_domain`, `is_visible`, `approval_status`, `is_sponsored`, `sponsor_payment_status`), criar migration SQL para adicioná-las, pois são funcionalidades ativas (pagamento de eventos, visibilidade, patrocínio).

### 5. Outros build errors
- `viajarTestLogin.ts`: referencia role `gestor_igr` que não existe no tipo — remover essa comparação
- `ViaJARAdminPanel.tsx` (linha 113): `role` como string vs union type — usar type assertion

---

## Plano de Execução

### Fase 1: Migration SQL
1. Atualizar RLS de `institutional_content` e `site_settings` para incluir `master_admin`
2. Adicionar colunas faltantes na tabela `events`: `is_visible`, `approval_status`, `is_sponsored`, `sponsor_payment_status`, `stripe_payment_link_url`, `return_domain`, `name` (alias/generated), `start_date` (alias), `image_url` (alias)

### Fase 2: Fix Build Errors (10+ arquivos)
Corrigir referências de colunas em:
- `EventosDestaqueSection.tsx`
- `EventPaymentConfig.tsx`
- `EventSubmissionForm.tsx`
- `EventPaymentReturn.tsx`
- `EventPaymentSuccess.tsx`
- `EventCleanupService.ts`
- `GeminiEventProcessorService.ts`
- `searchService.ts`
- `eventCheckoutService.ts`
- `viajarTestLogin.ts`
- `ViaJARAdminPanel.tsx`

### Fase 3: Adicionar campo de imagem ao Banner
- Adicionar `ms_roteiro_banner_image` com type `image` no `SimpleTextEditor.tsx`

### Fase 4: Remover código morto
- Deletar `DatabaseManager.tsx`, `FallbackConfig.tsx`, `AISuggestions.tsx`, `AIActionsQueue.tsx`, `AutonomousAIAgent.tsx`
- Remover imports lazy e rotas correspondentes em `ViaJARAdminPanel.tsx`
- Remover entradas de navegação em `adminModulesConfig.ts`
- Limpar console.logs excessivos de debug em `ViaJARAdminPanel.tsx`

### Arquivos Afetados

| Arquivo | Ação |
|---------|------|
| Migration SQL | RLS + colunas events |
| `src/components/home/EventosDestaqueSection.tsx` | Fix colunas |
| `src/components/admin/EventPaymentConfig.tsx` | Fix colunas |
| `src/components/events/EventSubmissionForm.tsx` | Fix colunas |
| `src/pages/ms/EventPaymentReturn.tsx` | Fix colunas |
| `src/pages/ms/EventPaymentSuccess.tsx` | Fix colunas |
| `src/services/events/EventCleanupService.ts` | Fix colunas |
| `src/services/events/GeminiEventProcessorService.ts` | Fix colunas |
| `src/services/searchService.ts` | Fix colunas |
| `src/services/stripe/eventCheckoutService.ts` | Fix colunas |
| `src/utils/viajarTestLogin.ts` | Fix tipo role |
| `src/pages/admin/ViaJARAdminPanel.tsx` | Fix tipo + remover rotas mortas + limpar logs |
| `src/config/adminModulesConfig.ts` | Remover módulos mortos |
| `src/components/admin/platform/SimpleTextEditor.tsx` | Adicionar campo imagem banner |
| `src/components/admin/database/DatabaseManager.tsx` | Deletar |
| `src/components/admin/system/FallbackConfig.tsx` | Deletar |
| `src/components/admin/ai/AISuggestions.tsx` | Deletar |
| `src/components/admin/ai/AIActionsQueue.tsx` | Deletar |
| `src/components/admin/ai/AutonomousAIAgent.tsx` | Deletar |

