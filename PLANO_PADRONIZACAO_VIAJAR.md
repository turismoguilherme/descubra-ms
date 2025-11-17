# 📋 PLANO DE PADRONIZAÇÃO VISUAL - PLATAFORMA VIAJAR

## 🎯 OBJETIVO
Padronizar toda a plataforma ViaJAR (setor público e privado) usando SectionWrapper e CardBox, mantendo funcionalidades existentes intactas e **NUNCA** alterando o painel dos atendentes dos CATs.

---

## ✅ COMPONENTES BASE JÁ EXISTENTES

### SectionWrapper (`src/components/ui/SectionWrapper.tsx`)
- ✅ Já existe e está funcional
- Variants: `'inventario' | 'cats' | 'default'`
- Estrutura: título à esquerda, botões à direita, fundo suave, borda clara, sombra leve

### CardBox (`src/components/ui/CardBox.tsx`)
- ✅ Já existe e está funcional
- Estrutura: fundo branco, borda cinza clara, sombra sutil, conteúdo vertical

---

## 🚨 ZONA PROIBIDA - NÃO MEXER

### Painel dos Atendentes dos CATs
**Arquivo:** `src/components/cat/AttendantDashboardRestored.tsx`
- ❌ **NÃO ALTERAR NADA**
- ❌ Não alterar layout
- ❌ Não alterar lógica de ponto eletrônico
- ❌ Não alterar sistema de login dos atendentes
- ❌ Não alterar registro de atendimentos
- ❌ Não alterar histórico
- ❌ Não alterar Dashboard dos Atendentes

**Componentes relacionados que NÃO devem ser alterados:**
- `src/components/cat/CATCheckInSection.tsx`
- `src/components/cat/CATAIInterface.tsx`
- `src/components/cat/CATReportsSection.tsx`

---

## 📊 SETOR PRIVADO - MÓDULOS A PADRONIZAR

### 1. Revenue Optimizer
**Localização:** `src/pages/ViaJARIntelligence.tsx` (aba revenue)
**Status Atual:** ❌ Não usa SectionWrapper/CardBox
**Ação:** 
- Envolver conteúdo em SectionWrapper
- Converter cards para CardBox
- Padronizar badges (pequenos e arredondados)
- Padronizar botões com ícones Lucide
- **NÃO inventar dados** - mostrar "aguardando dados" se não houver

### 2. Market Intelligence
**Localização:** `src/pages/ViaJARIntelligence.tsx` (aba market)
**Status Atual:** ❌ Não usa SectionWrapper/CardBox
**Ação:**
- Envolver conteúdo em SectionWrapper
- Converter cards para CardBox
- Padronizar visual
- **NÃO inventar dados** - mostrar "integração pendente" se não houver APIs

### 3. Competitive Benchmark
**Localização:** `src/pages/ViaJARIntelligence.tsx` (aba benchmark)
**Status Atual:** ❌ Não usa SectionWrapper/CardBox
**Ação:**
- Envolver conteúdo em SectionWrapper
- Converter cards para CardBox
- **NÃO inventar concorrentes** - só comparar dados informados pelo usuário

### 4. Diagnóstico Inteligente
**Localização:** `src/components/diagnostic/DiagnosticQuestionnaire.tsx`
**Status Atual:** ✅ Já usa SectionWrapper e CardBox (conforme CORRECOES_DIAGNOSTICO_E_DOCUMENTACAO.md)
**Ação:** 
- Verificar se está 100% padronizado
- Garantir que não inventa dados
- Verificar fluxo: perguntas → upload → IA interpreta → chatbot → recomendações

### 5. Upload de Documentos
**Localização:** `src/components/private/DocumentUpload.tsx`
**Status Atual:** ✅ Já usa SectionWrapper e CardBox
**Ação:**
- Verificar se está 100% padronizado
- Garantir que não inventa dados extraídos

### 6. PrivateDashboard (Visão Geral)
**Localização:** `src/pages/PrivateDashboard.tsx`
**Status Atual:** ✅ Já usa SectionWrapper e CardBox na seção overview
**Ação:**
- Verificar consistência visual
- Garantir que cards de métricas estão padronizados

---

## 🏛️ SETOR PÚBLICO - MÓDULOS A PADRONIZAR

### 1. Inventário Turístico
**Localização:** `src/components/secretary/TourismInventoryManager.tsx`
**Status Atual:** ✅ Já usa SectionWrapper e CardBox
**Ação:**
- Verificar se cards dos atrativos estão padronizados
- Garantir botões: ver, editar, excluir padronizados
- Verificar badges de status
- **NÃO inventar números** - só dados do gestor ou sistema real

### 2. Gestão de Eventos
**Localização:** `src/components/secretary/EventManagementSystem.tsx`
**Status Atual:** ✅ Já usa SectionWrapper e CardBox
**Ação:**
- Verificar padronização visual
- Garantir que não inventa público, datas ou métricas

### 3. Analytics
**Localização:** `src/components/secretary/AdvancedAnalytics.tsx`
**Status Atual:** ✅ Já usa SectionWrapper e CardBox
**Ação:**
- Verificar se mostra apenas dados reais
- Garantir mensagens claras quando não houver dados
- Verificar integração com ALUMIA

### 4. Relatórios
**Localização:** `src/components/secretary/ReportGenerator.tsx`
**Status Atual:** ⚠️ Precisa verificar
**Ação:**
- Verificar se usa SectionWrapper/CardBox
- Garantir que não cria relatórios falsos
- Padronizar visual

### 5. Dados Regionais (API ALUMIA)
**Localização:** `src/components/secretary/RegionalData.tsx`
**Status Atual:** ⚠️ Precisa verificar
**Ação:**
- Verificar se usa SectionWrapper/CardBox
- Garantir mensagem "Integração pendente" para outros estados
- Padronizar visual

### 6. Mapas de Calor
**Localização:** `src/components/secretary/SecretaryDashboard.tsx` (seção heatmaps)
**Status Atual:** ✅ Já usa SectionWrapper
**Ação:**
- Verificar se está padronizado
- Garantir mensagem "Dados insuficientes" quando não houver dados
- **NÃO criar movimentação fictícia**

### 7. Gestão de CATs
**Localização:** `src/components/overflow-one/CATGeolocationManager.tsx`
**Status Atual:** ⚠️ Precisa verificar
**Ação:**
- Verificar se usa SectionWrapper/CardBox
- **NÃO alterar lógica** - só padronizar visual
- Garantir que não altera painel dos atendentes

### 8. SecretaryDashboard (Visão Geral)
**Localização:** `src/components/secretary/SecretaryDashboard.tsx`
**Status Atual:** ✅ Já usa SectionWrapper e CardBox
**Ação:**
- Verificar consistência visual
- Garantir que cards de métricas estão padronizados

---

## 📝 PADRÕES VISUAIS A APLICAR

### SectionWrapper
```tsx
<SectionWrapper 
  variant="default" 
  title="Título da Seção"
  subtitle="Subtítulo opcional"
  actions={
    <Button variant="outline" size="sm">
      <Icon className="h-4 w-4 mr-2" />
      Ação
    </Button>
  }
>
  {/* Conteúdo */}
</SectionWrapper>
```

### CardBox
```tsx
<CardBox className="...">
  {/* Conteúdo vertical organizado */}
</CardBox>
```

### Grid Padronizado
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards */}
</div>
```

### Badges
```tsx
<Badge className="rounded-full text-xs px-2 py-0.5">
  Texto
</Badge>
```

### Botões com Ícones Lucide
```tsx
<Button variant="outline" size="sm">
  <Icon className="h-4 w-4 mr-2" />
  Texto
</Button>
```

---

## 🔍 ARQUIVOS A VERIFICAR/MODIFICAR

### Setor Privado
1. ✅ `src/pages/ViaJARIntelligence.tsx` - **PRINCIPAL** (Revenue, Market, Benchmark)
2. ✅ `src/pages/PrivateDashboard.tsx` - Verificar consistência
3. ✅ `src/components/private/DocumentUpload.tsx` - Verificar padronização
4. ✅ `src/components/diagnostic/DiagnosticQuestionnaire.tsx` - Verificar padronização

### Setor Público
1. ✅ `src/components/secretary/SecretaryDashboard.tsx` - Verificar consistência
2. ✅ `src/components/secretary/TourismInventoryManager.tsx` - Verificar padronização
3. ✅ `src/components/secretary/EventManagementSystem.tsx` - Verificar padronização
4. ⚠️ `src/components/secretary/AdvancedAnalytics.tsx` - Verificar padronização
5. ⚠️ `src/components/secretary/ReportGenerator.tsx` - Verificar e padronizar
6. ⚠️ `src/components/secretary/RegionalData.tsx` - Verificar e padronizar
7. ⚠️ `src/components/overflow-one/CATGeolocationManager.tsx` - Verificar e padronizar (SEM alterar lógica)

---

## ⚠️ REGRAS CRÍTICAS

1. **NUNCA inventar dados** - Sempre mostrar mensagens claras quando não houver dados
2. **NUNCA alterar o painel dos atendentes** - `AttendantDashboardRestored.tsx` e componentes relacionados
3. **NUNCA alterar lógica de negócio** - Apenas padronizar visual
4. **SEMPRE usar SectionWrapper** para seções
5. **SEMPRE usar CardBox** para cards de itens
6. **SEMPRE padronizar badges** (pequenos e arredondados)
7. **SEMPRE padronizar botões** (com ícones Lucide)

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Análise Completa
- [ ] Ler todos os arquivos mencionados
- [ ] Identificar o que já está padronizado
- [ ] Identificar o que precisa ser padronizado
- [ ] Mapear dependências

### Fase 2: Setor Privado
- [ ] Padronizar ViaJARIntelligence (Revenue, Market, Benchmark)
- [ ] Verificar PrivateDashboard
- [ ] Verificar DocumentUpload
- [ ] Verificar DiagnosticQuestionnaire

### Fase 3: Setor Público
- [ ] Verificar SecretaryDashboard
- [ ] Verificar TourismInventoryManager
- [ ] Verificar EventManagementSystem
- [ ] Verificar AdvancedAnalytics
- [ ] Padronizar ReportGenerator
- [ ] Padronizar RegionalData
- [ ] Verificar CATGeolocationManager (SEM alterar lógica)

### Fase 4: Validação
- [ ] Testar todos os módulos
- [ ] Verificar que não quebrou funcionalidades
- [ ] Verificar que não alterou painel dos atendentes
- [ ] Verificar consistência visual

---

## 🎨 PADRÃO VISUAL FINAL ESPERADO

- ✅ Fundo suave nas seções (SectionWrapper)
- ✅ Cards brancos com borda cinza clara (CardBox)
- ✅ Grid responsivo (1/2/3 colunas)
- ✅ Badges pequenos e arredondados
- ✅ Botões com ícones Lucide alinhados
- ✅ Tipografia uniforme
- ✅ Espaçamentos consistentes
- ✅ Hierarquia visual clara
- ✅ Nada desalinhado
- ✅ Visual profissional e limpo

---

## 📌 PRÓXIMOS PASSOS

1. **Aguardar aprovação do usuário** para este plano
2. **Iniciar implementação** seguindo o checklist
3. **Testar cada módulo** após padronização
4. **Validar** que não quebrou nada


