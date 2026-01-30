
# Plano: Melhorias no Painel Admin - CMS, Layout e YouTube Mobile

## Resumo Executivo

Este plano aborda as melhorias solicitadas para o painel administrativo:
1. **Sistema de Tooltips de Ajuda (?)** - Criar componentes reutilizáveis para orientar administradores
2. **Melhorias de Layout** - Corrigir alinhamento, centralização e espaçamento nos editores
3. **Responsividade Mobile** - Melhorar sidebar com drawer mobile
4. **YouTube no Mobile** - Adicionar overlay físico para esconder informações do YouTube no Descubra MS

---

## 1. Sistema de Tooltips de Ajuda (?)

### Problema Identificado
Não existe um sistema de tooltips para orientar administradores ao editar campos.

### Solução

Criar dois componentes reutilizáveis:

**HelpTooltip.tsx** - Ícone (?) com tooltip ao hover:
```
Título do Hero (?)  ← Hover mostra dica
                 ↓
      ┌─────────────────────────┐
      │ Título principal da     │
      │ página inicial.         │
      │ Máx: 60 caracteres.     │
      └─────────────────────────┘
```

**LabelWithHelp.tsx** - Label com tooltip integrado:
```
<LabelWithHelp 
  label="Título do Hero" 
  helpText="Título principal exibido na página inicial"
/>
```

### Textos de Ajuda por Tipo de Campo

| Tipo de Campo | Tooltip |
|---------------|---------|
| Hero Title | "Título principal. Recomendado: até 60 caracteres." |
| Hero Subtitle | "Texto secundário abaixo do título." |
| CTA Button | "Texto do botão de ação. Use verbos: 'Explorar', 'Descobrir'." |
| Video URL | "Cole link do YouTube ou Vimeo. Será incorporado automaticamente." |
| Image | "Formatos: JPG, PNG, WebP. Tamanho máx: 5MB." |
| JSON | "Formato JSON válido. Ex: [\"item1\", \"item2\"]" |

---

## 2. Melhorias de Layout no SimpleTextEditor

### Problema Atual
- Campos empilhados sem organização visual
- Botões desalinhados
- Espaçamento inconsistente

### Solução: Grid Responsivo

**Layout Proposto:**

```
MOBILE (< 768px):
┌──────────────────────────────┐
│ ┌─ Hero Principal ─────────┐ │
│ │ Badge (?)                 │ │
│ │ [Input                  ] │ │
│ │          [Voltar] [Salvar]│ │
│ ├───────────────────────────┤ │
│ │ Título Principal (?)      │ │
│ │ [Input                  ] │ │
│ │          [Voltar] [Salvar]│ │
│ └───────────────────────────┘ │
└──────────────────────────────┘

DESKTOP (>= 768px):
┌──────────────────────────────────────────────────────────┐
│ ┌─ Hero Principal ─────────────────────────────────────┐ │
│ │ ┌────────────────────┐ ┌────────────────────┐        │ │
│ │ │ Badge (?)          │ │ Título (?)         │        │ │
│ │ │ [Input       ]     │ │ [Input       ]     │        │ │
│ │ │ [Voltar] [Salvar]  │ │ [Voltar] [Salvar]  │        │ │
│ │ └────────────────────┘ └────────────────────┘        │ │
│ │ ┌────────────────────────────────────────────┐       │ │
│ │ │ Descrição (?) - campo largo                │       │ │
│ │ │ [Textarea                                ] │       │ │
│ │ │                        [Voltar] [Salvar]  │       │ │
│ │ └────────────────────────────────────────────┘       │ │
│ └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### Mudanças Específicas no SimpleTextEditor

- Usar grid `grid-cols-1 md:grid-cols-2` para campos `text`
- Campos `textarea`, `json` e `image` ocupam 100% da largura (`col-span-full`)
- Padding consistente: `p-4 md:p-6`
- Gap entre campos: `gap-4 md:gap-6`
- Botões alinhados à direita com `justify-end`

---

## 3. Responsividade Mobile no ModernAdminLayout

### Problema Atual
- Sidebar ocupa largura fixa mesmo em mobile
- Menu não é colapsável

### Solução: Drawer Mobile

**Comportamento:**
- Desktop (>= 768px): Sidebar fixa à esquerda
- Mobile (< 768px): Drawer sobreposto ativado por botão hamburguer

```
MOBILE:
┌──────────────────────────────────┐
│ [≡] Dashboard Administrativo     │  ← Botão hamburguer
├──────────────────────────────────┤
│                                  │
│ ┌────────────────────┐           │
│ │ Drawer Overlay     │◄──────────┤ Overlay escuro
│ │ ├─ Dashboard       │           │
│ │ ├─ Plataformas    │           │
│ │ │   ├─ ViajARTur  │           │
│ │ │   └─ Descubra MS│           │
│ │ ├─ Financeiro     │           │
│ │ └─ Sistema        │           │
│ │              [X]  │           │
│ └────────────────────┘           │
│                                  │
│ Conteúdo Principal               │
│ (100% largura)                   │
└──────────────────────────────────┘
```

### Implementação

- Adicionar state `isSidebarOpen`
- Botão hamburguer no header mobile
- Sidebar como `fixed` com `left-0` ou `-left-full` baseado no state
- Overlay escuro quando aberto
- Fechar ao clicar fora ou em item do menu

---

## 4. Correção do Vídeo YouTube no Mobile

### Problema Identificado
No UniversalHero.tsx, mesmo com parâmetros `modestbranding=1`, `controls=0`, `showinfo=0`, o YouTube ainda mostra informações no mobile (título, logo, etc).

### Solução: Overlay Físico

Adicionar divs físicas como overlays que cobrem as áreas onde o YouTube mostra informações:

```
┌─────────────────────────────────────┐
│ ████████████████████████████████████│ ← Top cover (60px)
│                                     │
│           VÍDEO YOUTUBE             │
│                                     │
│ ████████████████████████████████████│ ← Bottom cover (80px)
└─────────────────────────────────────┘
```

### Implementação

Adicionar overlays dentro do container do vídeo:
```css
/* Top overlay - esconde título/logo */
.youtube-top-cover {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent);
  z-index: 15;
  pointer-events: none;
}

/* Bottom overlay - esconde controles/info */
.youtube-bottom-cover {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  z-index: 15;
  pointer-events: none;
}
```

### Por que isso funciona?
- CSS não consegue esconder elementos dentro de um iframe
- Mas podemos **cobrir** essas áreas com divs posicionadas absolutamente
- Os gradientes criam transição suave para não parecer artificial

---

## 5. Arquivos a Criar

| Arquivo | Descrição |
|---------|-----------|
| `src/components/admin/ui/HelpTooltip.tsx` | Componente de tooltip de ajuda |
| `src/components/admin/ui/LabelWithHelp.tsx` | Label com tooltip integrado |
| `src/components/admin/ui/index.ts` | Barrel export dos componentes |

---

## 6. Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/admin/platform/SimpleTextEditor.tsx` | Grid responsivo + usar LabelWithHelp |
| `src/components/admin/settings/PoliciesEditor.tsx` | Adicionar tooltips de ajuda |
| `src/components/admin/layout/ModernAdminLayout.tsx` | Implementar drawer mobile |
| `src/components/layout/UniversalHero.tsx` | Adicionar overlays físicos para YouTube mobile |

---

## 7. O Que NÃO Será Alterado

- Funcionalidades existentes do CMS (já funcionando)
- Lógica de salvamento no Supabase
- Estrutura de navegação do admin
- Componentes que já funcionam corretamente
- Identidade visual e cores
- Vídeo do YouTube em desktop (funciona bem)

---

## 8. Detalhes Técnicos

### 8.1 HelpTooltip Component

```typescript
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface HelpTooltipProps {
  content: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export function HelpTooltip({ content, side = 'top' }: HelpTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button 
            type="button"
            className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-[300px]">
          <p className="text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
```

### 8.2 LabelWithHelp Component

```typescript
import { Label } from '@/components/ui/label';
import { HelpTooltip } from './HelpTooltip';

interface LabelWithHelpProps {
  htmlFor: string;
  label: string;
  helpText?: string;
}

export function LabelWithHelp({ htmlFor, label, helpText }: LabelWithHelpProps) {
  return (
    <div className="flex items-center gap-1">
      <Label htmlFor={htmlFor}>{label}</Label>
      {helpText && <HelpTooltip content={helpText} />}
    </div>
  );
}
```

### 8.3 YouTube Mobile Overlay

```typescript
{/* Overlays para esconder info do YouTube no mobile */}
{isMobile && embedUrl?.includes('youtube') && (
  <>
    {/* Top overlay - esconde título/logo */}
    <div 
      className="absolute top-0 left-0 right-0 h-[60px] z-[15] pointer-events-none"
      style={{
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)'
      }}
    />
    {/* Bottom overlay - esconde controles/info */}
    <div 
      className="absolute bottom-0 left-0 right-0 h-[80px] z-[15] pointer-events-none"
      style={{
        background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)'
      }}
    />
  </>
)}
```

---

## 9. Mapeamento de Tooltips por Campo

### SimpleTextEditor - ViajarTur

| Campo | helpText |
|-------|----------|
| viajar_hero_badge | "Texto pequeno que aparece acima do título principal" |
| viajar_hero_title | "Nome da plataforma. Será exibido em destaque na página inicial" |
| viajar_hero_subtitle | "Frase de efeito que resume a proposta da plataforma" |
| viajar_hero_description | "Texto explicativo mais detalhado sobre a plataforma" |
| viajar_hero_cta_primary | "Texto do botão principal. Use verbos de ação" |
| viajar_hero_cta_secondary | "Texto do botão secundário" |
| viajar_hero_video_url | "Link do YouTube. O vídeo será incorporado como background" |

### SimpleTextEditor - Descubra MS

| Campo | helpText |
|-------|----------|
| ms_hero_title | "Título principal da página inicial do Descubra MS" |
| ms_hero_subtitle | "Descrição que convida o visitante a explorar o estado" |
| ms_hero_video_url | "Link do YouTube para o vídeo de fundo do hero" |
| ms_hero_video_placeholder_image_url | "Imagem exibida enquanto o vídeo carrega" |
| ms_tourism_title | "Título da seção de descrição turística" |

---

## 10. Ordem de Execução

1. **Fase 1**: Criar componentes HelpTooltip e LabelWithHelp
2. **Fase 2**: Aplicar grid responsivo e tooltips no SimpleTextEditor
3. **Fase 3**: Implementar drawer mobile no ModernAdminLayout
4. **Fase 4**: Adicionar overlays físicos para YouTube no UniversalHero
5. **Fase 5**: Adicionar tooltips no PoliciesEditor

---

## 11. Resultado Esperado

| Antes | Depois |
|-------|--------|
| Campos sem orientação | Tooltips de ajuda (?) explicando cada campo |
| Layout desalinhado | Grid responsivo com espaçamento consistente |
| Sidebar fixa em mobile | Drawer colapsável com overlay |
| Info YouTube visível no mobile | Overlays escondendo informações |

---

## 12. Compatibilidade

- Responsivo (mobile/tablet/desktop)
- Mantém funcionalidades existentes
- Segue padrões já estabelecidos no projeto
- Não requer alterações no banco de dados
- CMS continua funcionando normalmente
