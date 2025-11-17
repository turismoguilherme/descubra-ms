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
**Status Atual:** ✅ **JÁ PADRONIZADO** - Usa SectionWrapper e CardBox
**Ação:** 
- ✅ Verificado: Usa SectionWrapper com variant="default"
- ✅ Verificado: Cards de métricas usam CardBox
- ✅ Verificado: Badges padronizados
- ✅ Verificado: Botões com ícones Lucide
- ⚠️ **ATENÇÃO:** Usa dados mockados (MOCK_REVENUE_PREDICTION) - precisa mostrar "aguardando dados" quando não houver dados reais

### 2. Market Intelligence
**Localização:** `src/pages/ViaJARIntelligence.tsx` (aba market)
**Status Atual:** ✅ **JÁ PADRONIZADO** - Usa SectionWrapper e CardBox
**Ação:**
- ✅ Verificado: Usa SectionWrapper com variant="default"
- ✅ Verificado: Cards usam CardBox
- ✅ Verificado: Visual padronizado
- ⚠️ **ATENÇÃO:** Usa dados mockados (MOCK_MARKET_INTELLIGENCE) - precisa mostrar "integração pendente" quando não houver APIs

### 3. Competitive Benchmark
**Localização:** `src/pages/ViaJARIntelligence.tsx` (aba benchmark)
**Status Atual:** ✅ **JÁ PADRONIZADO** - Usa SectionWrapper e CardBox
**Ação:**
- ✅ Verificado: Usa SectionWrapper com variant="default"
- ✅ Verificado: Cards usam CardBox
- ⚠️ **ATENÇÃO:** Usa dados mockados (MOCK_COMPETITIVE_BENCHMARK) - só comparar dados informados pelo usuário

### 4. Diagnóstico Inteligente
**Localização:** `src/components/diagnostic/DiagnosticQuestionnaire.tsx`
**Status Atual:** ✅ **JÁ PADRONIZADO** - Usa SectionWrapper e CardBox
**Ação:** 
- ✅ Verificado: Usa SectionWrapper e CardBox
- ✅ Verificado: Não inventa dados
- ℹ️ **NOTA:** Questionário em desenvolvimento - mostra mensagem apropriada

### 5. Upload de Documentos
**Localização:** `src/components/private/DocumentUpload.tsx`
**Status Atual:** ✅ **JÁ PADRONIZADO** - Usa SectionWrapper e CardBox
**Ação:**
- ✅ Verificado: Usa SectionWrapper e CardBox
- ✅ Verificado: Não inventa dados extraídos

### 6. PrivateDashboard (Visão Geral)
**Localização:** `src/pages/PrivateDashboard.tsx`
**Status Atual:** ✅ **JÁ PADRONIZADO** - Usa SectionWrapper e CardBox na seção overview
**Ação:**
- ✅ Verificado: Consistência visual
- ✅ Verificado: Cards de métricas padronizados

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
**Status Atual:** ✅ **JÁ PADRONIZADO** - Usa SectionWrapper e CardBox
**Ação:**
- ✅ Verificado: Usa SectionWrapper e CardBox
- ✅ Verificado: Mostra mensagens claras quando não houver dados
- ✅ Verificado: Integração com dados reais do Supabase

### 4. Relatórios
**Localização:** `src/components/secretary/ReportGenerator.tsx`
**Status Atual:** ✅ **JÁ PADRONIZADO** - Usa SectionWrapper e CardBox
**Ação:**
- ✅ Verificado: Usa SectionWrapper e CardBox
- ✅ Verificado: Não cria relatórios falsos - usa dados reais do Supabase
- ✅ Verificado: Visual padronizado

### 5. Dados Regionais (API ALUMIA)
**Localização:** `src/components/secretary/RegionalData.tsx`
**Status Atual:** ✅ **JÁ PADRONIZADO** - Usa SectionWrapper e CardBox
**Ação:**
- ✅ Verificado: Usa SectionWrapper e CardBox
- ✅ Verificado: Mostra mensagem "Integração pendente" para outros estados
- ✅ Verificado: Visual padronizado

### 6. Mapas de Calor
**Localização:** `src/components/secretary/SecretaryDashboard.tsx` (seção heatmaps)
**Status Atual:** ✅ Já usa SectionWrapper
**Ação:**
- Verificar se está padronizado
- Garantir mensagem "Dados insuficientes" quando não houver dados
- **NÃO criar movimentação fictícia**

### 7. Gestão de CATs
**Localização:** `src/components/overflow-one/CATGeolocationManager.tsx`
**Status Atual:** ✅ **JÁ PADRONIZADO** - Usa SectionWrapper e CardBox
**Ação:**
- ✅ Verificado: Usa SectionWrapper com variant="cats"
- ✅ Verificado: Cards usam CardBox
- ✅ Verificado: Lógica preservada - apenas visual padronizado
- ✅ Verificado: Não altera painel dos atendentes

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
1. ✅ `src/pages/ViaJARIntelligence.tsx` - **PADRONIZADO** (Revenue, Market, Benchmark)
2. ✅ `src/pages/PrivateDashboard.tsx` - **PADRONIZADO**
3. ✅ `src/components/private/DocumentUpload.tsx` - **PADRONIZADO**
4. ✅ `src/components/diagnostic/DiagnosticQuestionnaire.tsx` - **PADRONIZADO**

### Setor Público
1. ✅ `src/components/secretary/SecretaryDashboard.tsx` - **PADRONIZADO**
2. ✅ `src/components/secretary/TourismInventoryManager.tsx` - **PADRONIZADO**
3. ✅ `src/components/secretary/EventManagementSystem.tsx` - **PADRONIZADO**
4. ✅ `src/components/secretary/AdvancedAnalytics.tsx` - **PADRONIZADO**
5. ✅ `src/components/secretary/ReportGenerator.tsx` - **PADRONIZADO**
6. ✅ `src/components/secretary/RegionalData.tsx` - **PADRONIZADO**
7. ✅ `src/components/overflow-one/CATGeolocationManager.tsx` - **PADRONIZADO**

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
- [x] ✅ Padronizar ViaJARIntelligence (Revenue, Market, Benchmark) - **CONCLUÍDO**
- [x] ✅ Verificar PrivateDashboard - **CONCLUÍDO**
- [x] ✅ Verificar DocumentUpload - **CONCLUÍDO**
- [x] ✅ Verificar DiagnosticQuestionnaire - **CONCLUÍDO**

### Fase 3: Setor Público
- [x] ✅ Verificar SecretaryDashboard - **CONCLUÍDO**
- [x] ✅ Verificar TourismInventoryManager - **CONCLUÍDO**
- [x] ✅ Verificar EventManagementSystem - **CONCLUÍDO**
- [x] ✅ Verificar AdvancedAnalytics - **CONCLUÍDO**
- [x] ✅ Padronizar ReportGenerator - **CONCLUÍDO**
- [x] ✅ Padronizar RegionalData - **CONCLUÍDO**
- [x] ✅ Verificar CATGeolocationManager - **CONCLUÍDO**

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

## 📌 STATUS ATUAL

### ✅ **PADRONIZAÇÃO VISUAL CONCLUÍDA!**

Todos os módulos do setor público e privado já estão padronizados usando `SectionWrapper` e `CardBox` conforme o padrão ViaJAR.

### ⚠️ **PENDÊNCIAS (Não relacionadas ao layout):**

1. **Dados Mockados no ViaJARIntelligence:**
   - Revenue Optimizer, Market Intelligence e Competitive Benchmark ainda usam dados mockados
   - **Ação necessária:** Substituir por integração com ALUMIA ou mostrar mensagem "aguardando dados" quando não houver dados reais

2. **Validação Final:**
   - Testar todos os módulos em produção
   - Verificar que não quebrou funcionalidades
   - Validar consistência visual em diferentes resoluções

---

## 📌 PRÓXIMOS PASSOS

1. ✅ **Padronização visual** - **CONCLUÍDA**
2. ⚠️ **Substituir dados mockados** por dados reais ou mensagens apropriadas
3. ⚠️ **Testes finais** de validação
4. ⚠️ **Documentação** de uso dos componentes padronizados


