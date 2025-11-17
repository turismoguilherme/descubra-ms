# 🚀 PLANO DE AÇÃO COMPLETO - ViaJAR Dashboard Setor Privado

## 📋 **CONTEXTO E ENTENDIMENTO**

### **O que é a ViaJAR?**
A ViaJAR é uma **plataforma SaaS B2B** para empresários do setor de turismo que oferece:
- **Ferramentas de gestão estratégica** (Revenue Optimizer, Market Intelligence, Competitive Benchmark)
- **IA conversacional** para suporte e análises
- **Diagnóstico inteligente** do negócio
- **Análise de documentos** com IA
- **Relatórios executivos** automatizados

### **Como Empresários Usam a ViaJAR?**
1. **Cadastro e Onboarding**: Escolhem plano, pagam, configuram perfil (tipo de negócio)
2. **Diagnóstico Inicial**: Respondem questionário para análise do negócio
3. **Dashboard Personalizado**: Visualizam métricas específicas do seu tipo de negócio
4. **Ferramentas Estratégicas**: Usam Revenue Optimizer, Market Intelligence, etc.
5. **IA Conversacional**: Tiram dúvidas sobre estratégias, métricas, recomendações
6. **Análise de Documentos**: Fazem upload de relatórios, planilhas para análise
7. **Relatórios**: Exportam análises e insights

---

## 🎯 **PROBLEMAS IDENTIFICADOS E SOLUÇÕES**

### **1. Tipo de Empresa - Identificação no Cadastro/Onboarding**

**Situação Atual:**
- `ProfileSetupStep` já tem tipos de negócio (hotel, pousada, restaurante, agência, guia, atrativo, transporte, evento, outro)
- Tipo é escolhido no onboarding, mas pode não estar sendo salvo corretamente no perfil

**Solução:**
- ✅ Garantir que `business_type` seja salvo no perfil do usuário durante onboarding
- ✅ Usar `business_type` para personalizar métricas em todos os módulos
- ✅ Adaptar Revenue Optimizer, Market Intelligence e Competitive Benchmark conforme tipo

**Métricas por Tipo de Negócio:**

#### **Hotel/Pousada:**
- Taxa de ocupação (%)
- ADR (Average Daily Rate - R$)
- RevPAR (Revenue per Available Room - R$)
- Tempo médio de permanência (dias)
- Taxa de cancelamento (%)
- Receita por hóspede (R$)

#### **Restaurante:**
- Ticket médio (R$)
- Covers (número de clientes/dia)
- Rotatividade de mesas (vezes/dia)
- Ocupação de mesas (%)
- Receita por mesa (R$)
- Tempo médio de permanência (minutos)

#### **Agência de Turismo:**
- Pacotes vendidos (quantidade)
- Receita por destino (R$)
- Taxa de conversão (%)
- Satisfação do cliente (nota)
- Taxa de retorno (%)
- Ticket médio por pacote (R$)

#### **Guia de Turismo:**
- Número de passeios (quantidade)
- Avaliação média (nota)
- Satisfação do cliente (nota)
- Taxa de retorno (%)
- Receita por passeio (R$)
- Tempo médio de passeio (horas)

#### **Atrativo Turístico:**
- Visitantes (quantidade)
- Receita por visitante (R$)
- Satisfação (nota)
- Taxa de retorno (%)
- Ocupação do espaço (%)

#### **Transporte:**
- Viagens realizadas (quantidade)
- Ocupação de veículos (%)
- Satisfação (nota)
- Receita por viagem (R$)
- Tempo médio de viagem (horas)

#### **Eventos:**
- Público (quantidade)
- Receita por evento (R$)
- Satisfação (nota)
- Taxa de ocupação do espaço (%)
- Taxa de retorno (%)

---

### **2. IA Conversacional - Usar a Mesma dos Atendentes**

**Situação Atual:**
- "IA Conversacional" no PrivateDashboard navega para `/ms/guata` (chatbot do Descubra MS)
- Atendentes têm `CATAIInterface` que funciona bem

**Solução:**
- ✅ Criar componente `PrivateAIConversation` baseado em `CATAIInterface`
- ✅ Adaptar para contexto de empresários (perguntas sobre negócio, estratégias, métricas)
- ✅ Integrar dentro do dashboard (não navegar para outra página)
- ✅ Personalizar mensagens e funcionalidades para empresários

**Funcionalidades da IA para Empresários:**
- Perguntas sobre estratégias de precificação
- Análise de métricas e KPIs
- Recomendações baseadas em dados do negócio
- Explicação de gráficos e relatórios
- Sugestões de melhorias
- Comparação com mercado

---

### **3. Diagnóstico Dentro do Dashboard**

**Situação Atual:**
- Quando `showDiagnostic` é true, navega para `/viajar/diagnostic`
- Deveria aparecer dentro do dashboard, não ocupar tela toda

**Exemplos de Como Deve Funcionar:**

#### **Opção A: Modal/Dialog (Recomendado)**
```
┌─────────────────────────────────────────────────┐
│  Dashboard (fundo escurecido)                   │
│  ┌───────────────────────────────────────────┐  │
│  │  Diagnóstico Inteligente          [X]     │  │
│  │  ───────────────────────────────────────  │  │
│  │                                           │  │
│  │  [Pergunta 1 de 6]                       │  │
│  │  Qual o tipo do seu negócio?             │  │
│  │  ○ Hotel  ○ Pousada  ○ Restaurante      │  │
│  │                                           │  │
│  │  [Anterior]              [Próximo]       │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

#### **Opção B: Seção Expandida no Dashboard**
```
┌─────────────────────────────────────────────────┐
│  Sidebar | Conteúdo Principal                   │
│          │                                       │
│          │  ┌─────────────────────────────────┐ │
│          │  │ Diagnóstico Inteligente    [X]  │ │
│          │  │ ─────────────────────────────── │ │
│          │  │ [Pergunta 1 de 6]              │ │
│          │  │ ...                            │ │
│          │  └─────────────────────────────────┘ │
│          │                                       │
│          │  [Outras seções do dashboard]        │
└─────────────────────────────────────────────────┘
```

**Solução:**
- ✅ Usar Dialog/Modal do shadcn/ui
- ✅ Primeiro acesso: modal aparece automaticamente
- ✅ Acessos seguintes: botão "Refazer Diagnóstico" abre modal
- ✅ Não ocupar tela toda, manter contexto do dashboard

---

### **4. Padrão Visual - Upload de Documentos e Visão Geral**

**Situação Atual:**
- Já usam SectionWrapper/CardBox, mas layout pode estar diferente

**Problemas Identificados:**
- Upload de Documentos: Formulário pode estar muito simples
- Visão Geral: Pode precisar de mais estrutura visual

**Solução:**
- ✅ Revisar layout do Upload de Documentos
- ✅ Padronizar espaçamentos, grid, hierarquia visual
- ✅ Garantir que combine com Revenue Optimizer, Market Intelligence, etc.
- ✅ Usar mesmo padrão de cards, badges, botões

---

## 📝 **PLANO DE IMPLEMENTAÇÃO**

### **FASE 1: Correções Imediatas (Prioridade Alta)**

#### **1.1 Corrigir Navegação "IA Conversacional"**
- [ ] Criar componente `PrivateAIConversation.tsx` baseado em `CATAIInterface.tsx`
- [ ] Adaptar para contexto de empresários
- [ ] Integrar no PrivateDashboard (não navegar)
- [ ] Personalizar mensagens e funcionalidades
- [ ] Testar integração

**Arquivos:**
- `src/components/private/PrivateAIConversation.tsx` (novo)
- `src/pages/PrivateDashboard.tsx` (modificar)

#### **1.2 Ajustar Diagnóstico para Seção Expandida (Opção B)**
- [ ] Criar componente `DiagnosticSection.tsx` (seção expandida)
- [ ] Primeiro acesso: seção aparece automaticamente no topo
- [ ] Botão "Refazer Diagnóstico": expande seção no topo
- [ ] Botão "Fechar/Minimizar": colapsa seção
- [ ] Não ocupar tela toda - outras seções ficam abaixo (scroll)
- [ ] Manter sidebar visível
- [ ] Usar SectionWrapper para envolver

**Arquivos:**
- `src/components/diagnostic/DiagnosticSection.tsx` (novo)
- `src/pages/PrivateDashboard.tsx` (modificar)

#### **1.3 Padronizar Visual Upload de Documentos e Visão Geral**
- [ ] Revisar layout do DocumentUpload
- [ ] Revisar layout da Visão Geral
- [ ] Garantir consistência visual com outros módulos
- [ ] Ajustar espaçamentos, grid, hierarquia
- [ ] Padronizar cards, badges, botões

**Arquivos:**
- `src/components/private/DocumentUpload.tsx` (ajustar)
- `src/pages/PrivateDashboard.tsx` (ajustar seção overview)

---

### **FASE 2: Personalização por Tipo de Empresa (Prioridade Alta)**

#### **2.1 Garantir Salvamento do Tipo de Empresa**
- [ ] Verificar se `business_type` é salvo no onboarding
- [ ] Verificar se está disponível no perfil do usuário
- [ ] Criar hook `useBusinessType()` para acessar tipo
- [ ] Testar fluxo completo

**Arquivos:**
- `src/components/onboarding/ProfileSetupStep.tsx` (verificar)
- `src/hooks/useBusinessType.ts` (novo)
- `src/services/auth/SupabaseAuthService.ts` (verificar)

#### **2.2 Criar Sistema de Métricas Personalizadas**
- [ ] Criar `src/services/metrics/businessMetricsService.ts`
- [ ] Definir métricas por tipo de negócio
- [ ] Criar componentes de métricas personalizadas
- [ ] Adaptar Revenue Optimizer para usar métricas corretas
- [ ] Adaptar Market Intelligence para usar métricas corretas
- [ ] Adaptar Competitive Benchmark para usar métricas corretas

**Arquivos:**
- `src/services/metrics/businessMetricsService.ts` (novo)
- `src/components/metrics/HotelMetrics.tsx` (novo)
- `src/components/metrics/RestaurantMetrics.tsx` (novo)
- `src/components/metrics/AgencyMetrics.tsx` (novo)
- `src/components/metrics/GuideMetrics.tsx` (novo)
- `src/pages/ViaJARIntelligence.tsx` (modificar)

#### **2.3 Adaptar Revenue Optimizer**
- [ ] Detectar tipo de negócio
- [ ] Mostrar métricas específicas
- [ ] Adaptar gráficos conforme tipo
- [ ] Adaptar recomendações conforme tipo
- [ ] Mostrar mensagem quando não houver dados

**Arquivos:**
- `src/pages/ViaJARIntelligence.tsx` (modificar aba revenue)

#### **2.4 Adaptar Market Intelligence**
- [ ] Detectar tipo de negócio
- [ ] Mostrar análises específicas
- [ ] Adaptar gráficos conforme tipo
- [ ] Adaptar recomendações conforme tipo

**Arquivos:**
- `src/pages/ViaJARIntelligence.tsx` (modificar aba market)

#### **2.5 Adaptar Competitive Benchmark**
- [ ] Detectar tipo de negócio
- [ ] Mostrar comparações específicas
- [ ] Adaptar métricas conforme tipo
- [ ] Adaptar insights conforme tipo

**Arquivos:**
- `src/pages/ViaJARIntelligence.tsx` (modificar aba benchmark)

---

### **FASE 3: Melhorias e Refinamentos (Prioridade Média)**

#### **3.1 Melhorar Experiência do Diagnóstico**
- [ ] Adicionar progresso visual
- [ ] Melhorar navegação entre perguntas
- [ ] Adicionar validações
- [ ] Melhorar feedback visual
- [ ] Adicionar opção de salvar e continuar depois
- [ ] Adicionar botão "Minimizar" para colapsar seção

**Arquivos:**
- `src/components/diagnostic/DiagnosticSection.tsx` (melhorar)
- `src/components/diagnostic/DiagnosticQuestionnaire.tsx` (melhorar)

#### **3.2 Melhorar IA Conversacional**
- [ ] Adicionar contexto do negócio nas respostas
- [ ] Integrar com dados do dashboard
- [ ] Adicionar sugestões inteligentes
- [ ] Melhorar histórico de conversas
- [ ] Adicionar exportação de conversas

**Arquivos:**
- `src/components/private/PrivateAIConversation.tsx` (melhorar)

#### **3.3 Adicionar Mensagens Quando Não Houver Dados**
- [ ] Substituir dados mockados por estados vazios
- [ ] Adicionar mensagens claras
- [ ] Adicionar CTAs para conectar dados
- [ ] Adicionar avisos de integração pendente

**Arquivos:**
- `src/pages/ViaJARIntelligence.tsx` (modificar todas as abas)

---

## 🎨 **PADRÕES VISUAIS A SEGUIR**

### **Componentes Base:**
- ✅ `SectionWrapper` para todas as seções
- ✅ `CardBox` para todos os cards
- ✅ Badges: `rounded-full text-xs px-2 py-0.5`
- ✅ Botões: sempre com ícones Lucide
- ✅ Grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`

### **Hierarquia Visual:**
1. **Título da Seção** (SectionWrapper title)
2. **Subtítulo** (SectionWrapper subtitle)
3. **Cards de Métricas** (CardBox com ícone + título + valor)
4. **Gráficos** (dentro de CardBox)
5. **Recomendações** (dentro de CardBox)

### **Cores:**
- Manter cores atuais (azul/roxo)
- Usar cores semânticas (verde=positivo, vermelho=negativo, amarelo=atenção)

---

## ✅ **CHECKLIST DE VALIDAÇÃO**

### **Antes de Finalizar:**
- [ ] Tipo de empresa é salvo corretamente no onboarding
- [ ] Métricas aparecem corretas conforme tipo de negócio
- [ ] IA Conversacional funciona dentro do dashboard
- [ ] Diagnóstico abre em modal, não navega
- [ ] Upload de Documentos está padronizado
- [ ] Visão Geral está padronizada
- [ ] Todos os módulos usam SectionWrapper/CardBox
- [ ] Badges estão padronizados
- [ ] Botões têm ícones consistentes
- [ ] Não há dados inventados (só dados reais ou mensagens claras)
- [ ] Painel dos atendentes não foi alterado

---

## 📅 **CRONOGRAMA SUGERIDO**

### **Semana 1: Fase 1 (Correções Imediatas)**
- Dia 1-2: Corrigir navegação IA Conversacional
- Dia 3-4: Ajustar diagnóstico para modal
- Dia 5: Padronizar visual Upload e Visão Geral

### **Semana 2: Fase 2 (Personalização)**
- Dia 1-2: Garantir salvamento tipo de empresa
- Dia 3-4: Criar sistema de métricas personalizadas
- Dia 5: Adaptar Revenue Optimizer, Market Intelligence, Competitive Benchmark

### **Semana 3: Fase 3 (Melhorias)**
- Dia 1-2: Melhorar experiência do diagnóstico
- Dia 3-4: Melhorar IA Conversacional
- Dia 5: Adicionar mensagens quando não houver dados

---

## 🚨 **REGRAS CRÍTICAS**

1. **NUNCA** inventar dados - mostrar mensagens claras quando não houver
2. **NUNCA** alterar painel dos atendentes (AttendantDashboardRestored e relacionados)
3. **NUNCA** alterar lógica de negócio - apenas visual
4. **SEMPRE** manter funcionalidades existentes intactas
5. **SEMPRE** usar SectionWrapper para seções
6. **SEMPRE** usar CardBox para cards de itens
7. **SEMPRE** adaptar métricas ao tipo de negócio do usuário
8. **SEMPRE** consultar antes de implementar mudanças grandes

---

## 📝 **PRÓXIMOS PASSOS**

1. ✅ Atualizar repositório remoto (FEITO)
2. ⏳ Aguardar aprovação do plano
3. ⏳ Iniciar Fase 1 (Correções Imediatas)
4. ⏳ Validar com usuário após cada fase
5. ⏳ Continuar para próximas fases

---

**Última atualização:** 2025-01-XX
**Status:** Aguardando aprovação para iniciar implementação


