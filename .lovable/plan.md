
# Plano: Sistema de Controle de Conteúdo e Ajustes B2B para ViajARTur

## Problemas Identificados

### 1. **Falta de Sistema Toggle (Ativar/Desativar)**
- Usuário quer controlar se seções aparecem ou não (ex: vídeo, métricas, cases)
- Não existe sistema administrativo para isso atualmente
- Precisa de interface admin para gerenciar visibilidade

### 2. **Tom de Comunicação B2C em vez de B2B**
- Textos direcionados para turistas finais
- ViajARTur é para empresários e gestores públicos
- Precisa ajustar linguagem e foco

### 3. **Cases de Sucesso Não Atualizados**
- Layout não reflete nova identidade visual premium
- Precisa aplicar glassmorphism e cores travel-tech

### 4. **Métricas Falsas Problemáticas**
- "Resultados que falam por si" com números fictícios
- Plataforma não foi lançada ainda
- Precisa sistema para desativar/ativar métricas

### 5. **Consulta Prévia Necessária**
- Usuário quer aprovar dados/números antes da implementação

## Soluções Propostas

### 1. **Sistema de Controle de Seções (Admin)**

**Nova Tabela**: `viajar_section_controls`
```sql
- id (uuid, primary key)
- section_key (text, unique) -- ex: 'video_section', 'benefits_metrics', 'success_cases'
- is_active (boolean, default false)
- section_title (text)
- admin_notes (text, optional)
- updated_at (timestamp)
```

**Seções Controláveis**:
- Video Section (vídeo embed)
- Benefits Section (métricas como "300% efficiency")
- Success Cases (casos de sucesso)
- Platform in Action (dashboard demo)
- Specific metrics/numbers dentro das seções

### 2. **Interface Admin para Controles**

**Novo Componente**: `ViaJARSectionManager.tsx`
- Toggle switches para cada seção
- Preview em tempo real
- Notas administrativas
- Histórico de alterações

**Localização**: Admin Panel → ViaJAR → Controle de Seções

### 3. **Ajustes de Tom B2B**

**Textos que precisam mudar**:
- Hero: Foco em "gestão inteligente" não "experiências de viagem"
- Benefits: ROI, eficiência operacional, insights de negócio
- Platform in Action: Dashboards gerenciais, relatórios estratégicos
- Cases: Resultados para secretarias e empresas

**Exemplos**:
- ❌ "Experiências inesquecíveis para turistas"  
- ✅ "Decisões estratégicas baseadas em dados para gestores"

### 4. **Sistema de Métricas Controláveis**

**Nova Tabela**: `viajar_metrics_config`
```sql
- id (uuid, primary key)  
- metric_key (text) -- ex: 'users_count', 'satisfaction_rate'
- display_value (text) -- ex: "50K+", "95%"
- is_active (boolean)
- description (text) -- para que serve essa métrica
- is_projected (boolean) -- se é projeção/meta vs real
- admin_notes (text)
```

**Interface Admin**: Controle individual de cada número
- Toggle ativo/inativo
- Editar valores
- Marcar como "Meta" ou "Projeção" vs "Resultado Real"
- Sistema de aprovação prévia

### 5. **Atualização Success Cases**

**Problemas atuais**:
- Não usa glassmorphism cards
- Cores antigas (não travel-tech palette)
- Layout não premium

**Solução**: Aplicar GlassmorphismCard e nova identidade

### 6. **Workflow de Aprovação**

**Sistema de Staging**:
- Admin pode fazer alterações em "rascunho"
- Preview interno antes de publicar
- Aprovação obrigatória para métricas/números
- Log de alterações com timestamp

## Implementação

### Fase 1: Sistema de Controle
1. Criar tabelas de controle no Supabase
2. Implementar componentes admin
3. Atualizar páginas públicas para ler controles

### Fase 2: Ajustes de Tom B2B
1. Revisar todos os textos hardcoded
2. Criar versões B2B focadas em gestores
3. Implementar sistema de content switching

### Fase 3: Métricas Controláveis
1. Sistema de gerenciamento de números
2. Interface para ativar/desativar métricas
3. Sistema de aprovação prévia

### Fase 4: Cases Premium
1. Aplicar nova identidade visual
2. Glassmorphism e cores travel-tech
3. Layout responsivo premium

## Arquivos Afetados

**Novo Sistema Admin**:
- `src/components/admin/viajar/ViaJARSectionManager.tsx`
- `src/components/admin/viajar/ViaJARMetricsManager.tsx`
- `src/hooks/useViaJARSectionControls.ts`
- `src/services/admin/viajarContentService.ts`

**Páginas Públicas**:
- `src/pages/ViaJARSaaS.tsx` (lógica condicional)
- `src/components/home/BenefitsSection.tsx` (métricas controláveis)
- `src/components/home/SuccessCasesSection.tsx` (nova identidade)
- `src/components/home/PlatformInActionSection.tsx` (controles)

**Database**:
- Migration: criar tabelas de controle
- RLS policies para admin access
- Triggers para auditoria

## Resultado Esperado

1. **Admin pode controlar** todas as seções da landing page
2. **Tom 100% B2B** focado em gestores e empresários  
3. **Métricas controláveis** com sistema de aprovação
4. **Cases com identidade premium** atualizada
5. **Sistema de staging** para mudanças seguras

## Consulta Prévia

Antes de implementar, preciso confirmar:
1. Quais seções específicas quer controlar?
2. Que métricas/números quer manter mas tornar desativáveis?
3. Alguma linguagem B2B específica que prefere?
4. Quer sistema de aprovação em duas etapas ou direct toggle?
