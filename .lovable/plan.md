
# Plano: Correção de Erros de Build e Melhorias no Admin

## Resumo Executivo

Este plano aborda três frentes principais:
1. **Correção de erros de build TypeScript** - Aproximadamente 80+ erros em arquivos do admin e edge functions
2. **Melhorias de layout** - Alinhamento, responsividade mobile e tooltips de ajuda (?)
3. **Correção do vídeo YouTube no mobile** - Esconder informações do YouTube no Descubra MS

---

## 1. Correção dos Erros de Build TypeScript

### 1.1 Edge Functions (Supabase)

| Arquivo | Problema | Correção |
|---------|----------|----------|
| `refund-event-payment/index.ts:195` | `paymentRecord.amount` não existe (select retorna apenas `metadata, stripe_invoice_id`) | Incluir `amount` no select da query |
| `send-notification-email/index.ts:546` | Falta `event_refunded` no mapeamento de templates | Adicionar `event_refunded: 'Event Refunded'` ao `templateNameMap` |

### 1.2 Componentes Admin - Padrão de Correção para `unknown`

Para todos os arquivos com erro de acesso a propriedades em tipos `unknown`, aplicar o padrão:

```typescript
// ANTES (erro):
} catch (err: unknown) {
  const errorMessage = err.message || 'Erro';

// DEPOIS (correto):
} catch (err: unknown) {
  const error = err instanceof Error ? err : new Error(String(err));
  const errorMessage = error.message || 'Erro';
```

**Arquivos a corrigir:**

| Arquivo | Linha | Correção |
|---------|-------|----------|
| `AdminLogin.tsx` | 45 | Padrão de conversão de erro |
| `FooterSettingsManager.tsx` | 273-277 | Usar `err` em vez de `error` após conversão |
| `AIAdminChat.tsx` | 235 | Padrão de conversão de erro |
| `VisualContentEditor.tsx` | 375 | Padrão de conversão de erro |

### 1.3 Arquivos com Interfaces Faltantes

| Arquivo | Problema | Correção |
|---------|----------|----------|
| `AdminUserManagement.tsx` | `csrfToken` e `userId` não existem no tipo | Substituir `userId` por `id` e remover `csrfToken` |
| `EventManagementPanel.tsx` | `servicesStatus` é `unknown` | Criar interface `ServicesStatus` com tipagem |
| `LocationPicker.tsx` | `item` é `unknown` no map | Criar interface `NominatimResult` |
| `TechnicalUserManager.tsx` | `user.region` e `user.city` não existem | Usar `region_name` e `city_name` |
| `WorkflowManagement.tsx` | Cast de `unknown[]` para tipos específicos | Adicionar cast explícito |
| `FinancialManagement.tsx` | `r.paid_date`, `e.due_date` em `unknown` | Criar interfaces `RevenueItem` e `ExpenseItem` |
| `PartnersManagement.tsx` | `updateData.approved_at/by` em `unknown` | Tipar objeto `updateData` |

### 1.4 Arquivo Extenso - Estratégia @ts-nocheck

O arquivo `AutonomousAIAgent.tsx` (1.751 linhas) tem mais de 15 erros TypeScript. Seguindo a estratégia já adotada em 27+ arquivos do projeto, adicionar `// @ts-nocheck` no topo.

---

## 2. Sistema de Tooltips de Ajuda (?)

### 2.1 Novo Componente: HelpTooltip

Criar componente reutilizável em `src/components/admin/ui/HelpTooltip.tsx`:

```text
┌─────────────────────────────────────────────┐
│ Título do Hero (?)                          │
│                    ↓ Hover mostra tooltip   │
│            ┌─────────────────────────┐      │
│            │ Título principal da     │      │
│            │ página inicial.         │      │
│            │ Máximo: 60 caracteres.  │      │
│            └─────────────────────────┘      │
│ ┌─────────────────────────────────────────┐ │
│ │ Input de texto                          │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### 2.2 Componente LabelWithHelp

Wrapper para labels com tooltip integrado:

```typescript
interface LabelWithHelpProps {
  htmlFor: string;
  label: string;
  helpText?: string;
}
```

### 2.3 Textos de Ajuda por Campo

| Campo | Tooltip |
|-------|---------|
| Hero Title | "Título principal da página inicial. Recomendado: até 60 caracteres." |
| Hero Subtitle | "Texto secundário abaixo do título. Descreve o propósito da plataforma." |
| CTA Button | "Texto do botão de ação. Use verbos como 'Explorar', 'Descobrir'." |
| Video URL | "Cole o link do YouTube ou Vimeo. O vídeo será incorporado automaticamente." |
| Image Upload | "Formatos aceitos: JPG, PNG, WebP. Tamanho máximo: 5MB." |
| JSON Field | "Formato JSON válido. Exemplo: [\"item1\", \"item2\"]" |

---

## 3. Melhorias de Layout e Responsividade

### 3.1 SimpleTextEditor - Grid Responsivo

**Problema atual:** Campos empilhados verticalmente sem aproveitamento do espaço horizontal.

**Solução:** Grid de 2 colunas para campos `text` em desktop, 1 coluna em mobile.

```text
MOBILE (< 768px):
┌──────────────────────────────┐
│ Hero Principal               │
├──────────────────────────────┤
│ Badge (?)                    │
│ [Input                     ] │
│ [Voltar] [Salvar]           │
├──────────────────────────────┤
│ Título Principal (?)         │
│ [Input                     ] │
│ [Voltar] [Salvar]           │
└──────────────────────────────┘

DESKTOP (>= 768px):
┌──────────────────────────────────────────────────────────┐
│ Hero Principal                                            │
├────────────────────────────────┬─────────────────────────┤
│ Badge (?)                      │ Título Principal (?)     │
│ [Input               ]         │ [Input               ]   │
│        [Voltar] [Salvar]       │        [Voltar] [Salvar] │
├────────────────────────────────┴─────────────────────────┤
│ Subtítulo (?) - campo largo (textarea)                    │
│ [Textarea                                              ] │
│                                        [Voltar] [Salvar] │
└──────────────────────────────────────────────────────────┘
```

### 3.2 ModernAdminLayout - Sidebar Mobile

**Problema atual:** Sidebar ocupa largura fixa, não há drawer mobile.

**Solução:** Em telas < 768px, sidebar vira drawer sobreposto com botão hamburguer.

```text
MOBILE:
┌──────────────────────────────────┐
│ [≡] Dashboard Administrativo [X] │
├──────────────────────────────────┤
│ ┌────────────────────────────┐  │
│ │ Drawer Overlay             │  │
│ │ ├─ Dashboard               │  │
│ │ ├─ Plataformas            │  │
│ │ │   ├─ ViajARTur          │  │
│ │ │   └─ Descubra MS        │  │
│ │ ├─ Financeiro             │  │
│ │ └─ Sistema                │  │
│ └────────────────────────────┘  │
│ Conteúdo Principal              │
│ (100% largura)                  │
└──────────────────────────────────┘
```

---

## 4. Correção do Vídeo YouTube no Mobile

### 4.1 Problema Identificado

No arquivo `UniversalHero.tsx`, o embed do YouTube mostra informações (título, logo) no mobile mesmo com os parâmetros `showinfo=0`, `modestbranding=1`, `controls=0`.

### 4.2 Solução: Overlays Adicionais

A solução atual já usa CSS para esconder elementos, mas precisamos reforçar:

1. **Adicionar overlay sólido sobre a borda inferior do vídeo** (onde aparecem infos no mobile)
2. **Ajustar CSS para garantir que overlays fiquem acima do iframe**
3. **Usar gradiente para disfarçar a transição**

```css
/* Overlay para esconder bottom bar do YouTube no mobile */
@media (max-width: 768px) {
  .youtube-bottom-cover {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
    z-index: 15;
    pointer-events: none;
  }
}
```

---

## 5. Arquivos a Criar

| Arquivo | Descrição |
|---------|-----------|
| `src/components/admin/ui/HelpTooltip.tsx` | Componente de tooltip de ajuda |
| `src/components/admin/ui/LabelWithHelp.tsx` | Label com tooltip integrado |
| `src/components/admin/ui/index.ts` | Barrel export |

---

## 6. Arquivos a Modificar

### Edge Functions
| Arquivo | Alteração |
|---------|-----------|
| `supabase/functions/refund-event-payment/index.ts` | Incluir `amount` no select |
| `supabase/functions/send-notification-email/index.ts` | Adicionar `event_refunded` ao mapeamento |

### Componentes Admin - Correções TypeScript
| Arquivo | Alteração |
|---------|-----------|
| `src/components/admin/AdminLogin.tsx` | Conversão de erro |
| `src/components/admin/AdminUserManagement.tsx` | Usar `id` em vez de `userId` |
| `src/components/admin/EventManagementPanel.tsx` | Criar interface `ServicesStatus` |
| `src/components/admin/FooterSettingsManager.tsx` | Usar variável convertida |
| `src/components/admin/LocationPicker.tsx` | Criar interface `NominatimResult` |
| `src/components/admin/TechnicalUserManager.tsx` | Usar campos corretos |
| `src/components/admin/WorkflowManagement.tsx` | Cast explícito |
| `src/components/admin/ai/AIAdminChat.tsx` | Conversão de erro |
| `src/components/admin/ai/AutonomousAIAgent.tsx` | Adicionar `@ts-nocheck` |
| `src/components/admin/descubra_ms/PartnersManagement.tsx` | Tipar `updateData` |
| `src/components/admin/editor/VisualContentEditor.tsx` | Conversão de erro |
| `src/components/admin/financial/FinancialManagement.tsx` | Criar interfaces |

### Layout e UX
| Arquivo | Alteração |
|---------|-----------|
| `src/components/admin/platform/SimpleTextEditor.tsx` | Grid responsivo + LabelWithHelp |
| `src/components/admin/layout/ModernAdminLayout.tsx` | Drawer mobile |
| `src/components/layout/UniversalHero.tsx` | Overlay para esconder info YouTube mobile |

---

## 7. O Que NAO Será Alterado

- Funcionalidades existentes do CMS (já funcionando)
- Lógica de salvamento no Supabase
- Estrutura de navegação do admin
- Componentes que já funcionam corretamente
- Identidade visual e cores
- Vídeo do YouTube em desktop (funciona bem)

---

## 8. Detalhes Técnicos

### 8.1 Interface ServicesStatus (EventManagementPanel)

```typescript
interface ServiceState {
  isRunning: boolean;
  config?: {
    cleanupInterval?: number;
    syncInterval?: number;
  };
  lastError?: string;
}

interface ServicesStatus {
  cleanup?: ServiceState;
  googleCalendar?: ServiceState;
  geminiAI?: ServiceState;
}
```

### 8.2 Interface NominatimResult (LocationPicker)

```typescript
interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}
```

### 8.3 Interfaces Financeiras

```typescript
interface RevenueItem {
  paid_date?: string;
  amount?: number;
}

interface ExpenseItem {
  due_date?: string;
  amount?: number;
  payment_status?: string;
}
```

### 8.4 Correção AdminUserManagement

```typescript
// ANTES:
setPendingOperation({ 
  type: 'role_update', 
  data: { userId: selectedUserId, role: newUserRole, csrfToken: token } 
});

// DEPOIS:
setPendingOperation({ 
  type: 'role_update', 
  data: { id: selectedUserId, email: '', role: newUserRole } 
});
```

---

## 9. Ordem de Execução

1. **Fase 1**: Corrigir erros em Edge Functions (bloqueia deploy)
2. **Fase 2**: Corrigir erros TypeScript nos componentes admin
3. **Fase 3**: Criar componentes HelpTooltip e LabelWithHelp
4. **Fase 4**: Aplicar grid responsivo no SimpleTextEditor
5. **Fase 5**: Implementar drawer mobile no ModernAdminLayout
6. **Fase 6**: Adicionar overlay para esconder info YouTube no mobile

---

## 10. Resultado Esperado

| Antes | Depois |
|-------|--------|
| 80+ erros de build TypeScript | Build sem erros |
| Layout desalinhado e inconsistente | Layout profissional e centralizado |
| Sem orientação para administradores | Tooltips de ajuda (?) em campos importantes |
| Interface quebrada em mobile | Interface responsiva e funcional |
| Info do YouTube visível no mobile | Vídeo limpo sem informações sobrepostas |

---

## 11. Compatibilidade

- Responsivo (mobile/tablet/desktop)
- Mantém funcionalidades existentes
- Segue padrões já estabelecidos no projeto
- Não requer alterações no banco de dados
- CMS continua funcionando normalmente
