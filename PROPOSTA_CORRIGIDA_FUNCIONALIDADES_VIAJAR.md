# 📋 PROPOSTA CORRIGIDA - Funcionalidades ViaJAR (AGUARDANDO APROVAÇÃO)

## ⚠️ CORREÇÕES IMPORTANTES

1. **ALUMIA:** Não inventar informações - só usar quando tiver API real disponível
2. **Google Search API:** Usar para estados sem ALUMIA (ex: SP, RJ, etc.)
3. **Metas e Acompanhamento:** Desenvolver melhor a ideia completa
4. **Dados Regionais:** Estratégia clara de fallback

**Data:** Janeiro 2025  
**Status:** 🔍 **CONSULTA** (Aguardando aprovação)

---

## 📋 SUMÁRIO

1. [ALUMIA - Integração Real](#1-alumia---integração-real)
2. [Google Search API - Para Estados Sem ALUMIA](#2-google-search-api---para-estados-sem-alumia)
3. [Metas e Acompanhamento - Sistema Completo](#3-metas-e-acompanhamento---sistema-completo)
4. [Upload de Documentos](#4-upload-de-documentos)
5. [Relatórios](#5-relatórios)
6. [Configurações de Conta](#6-configurações-de-conta)

---

## 1. ALUMIA - INTEGRAÇÃO REAL

### **🎯 Objetivo:**
Integrar com ALUMIA **APENAS** quando tiver API real disponível. Não inventar dados.

### **📊 Como Deve Funcionar:**

#### **1.1 Verificação de API:**
```typescript
// Verificar se ALUMIA está configurada
const ALUMIA_API_KEY = import.meta.env.VITE_ALUMIA_API_KEY;
const ALUMIA_BASE_URL = import.meta.env.VITE_ALUMIA_BASE_URL;

if (!ALUMIA_API_KEY || !ALUMIA_BASE_URL) {
  // ALUMIA não configurada - usar fallback
  return useGoogleSearchAPI(state);
}
```

#### **1.2 Teste de Conexão:**
```typescript
// Testar se API está funcionando
async function testAlumiaConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${ALUMIA_BASE_URL}/health`, {
      headers: { 'Authorization': `Bearer ${ALUMIA_API_KEY}` }
    });
    return response.ok;
  } catch (error) {
    return false; // API não disponível
  }
}
```

#### **1.3 O Que Fazer Quando ALUMIA NÃO Está Disponível:**
```
┌─────────────────────────────────────────┐
│ 🌍 Dados Regionais - Mato Grosso do Sul │
│                                         │
│ ⚠️ ALUMIA não configurada               │
│                                         │
│ Para usar dados oficiais da ALUMIA:     │
│ 1. Configure VITE_ALUMIA_API_KEY        │
│ 2. Configure VITE_ALUMIA_BASE_URL       │
│ 3. Entre em contato com Governo MS      │
│                                         │
│ Usando Google Search API como fallback  │
│ [Ver Dados via Google Search]           │
└─────────────────────────────────────────┘
```

#### **1.4 Quando ALUMIA Estiver Disponível:**
- ✅ Buscar dados reais da API
- ✅ Mostrar fonte: "ALUMIA (Governo de MS)"
- ✅ Atualizar automaticamente
- ✅ Cache de dados (15-30 minutos)

---

## 2. GOOGLE SEARCH API - PARA ESTADOS SEM ALUMIA

### **🎯 Objetivo:**
Usar Google Custom Search API para buscar dados de turismo quando não houver ALUMIA ou API oficial do estado.

### **📊 Como Deve Funcionar:**

#### **2.1 Configuração:**
```typescript
// Variáveis de ambiente necessárias
VITE_GOOGLE_SEARCH_API_KEY=your_api_key
VITE_GOOGLE_SEARCH_ENGINE_ID=your_engine_id
```

#### **2.2 Estratégia de Busca:**
```typescript
async function getRegionalData(state: string) {
  // 1. Se for MS, tentar ALUMIA primeiro
  if (state === 'MS') {
    if (await testAlumiaConnection()) {
      return await fetchFromAlumia();
    }
  }
  
  // 2. Tentar API oficial do estado (se existir)
  const stateAPI = await tryStateOfficialAPI(state);
  if (stateAPI) return stateAPI;
  
  // 3. Usar Google Search API
  return await fetchFromGoogleSearch(state);
}
```

#### **2.3 Busca com Google Search API:**
```typescript
async function fetchFromGoogleSearch(state: string) {
  const queries = [
    `turismo ${state} estatísticas dados`,
    `turismo ${state} origem turistas`,
    `turismo ${state} sazonalidade`,
    `turismo ${state} eventos`,
    `turismo ${state} atrações principais`
  ];
  
  const results = [];
  for (const query of queries) {
    const data = await googleSearchAPI.search(query);
    results.push(...data.items);
  }
  
  // Extrair dados estruturados dos resultados
  return extractTourismData(results, state);
}
```

#### **2.4 O Que Mostrar:**
```
┌─────────────────────────────────────────┐
│ 🌍 Dados Regionais - São Paulo          │
│                                         │
│ Fonte: Google Search API                │
│ Qualidade: Boa (70-75%)                 │
│ Última atualização: Hoje, 14:30         │
│                                         │
│ Dados encontrados:                      │
│ • Estatísticas gerais de turismo        │
│ • Principais destinos                   │
│ • Sazonalidade básica                   │
│                                         │
│ ⚠️ Dados limitados comparado a MS       │
│    (que tem ALUMIA oficial)             │
│                                         │
│ [Atualizar Dados]                       │
└─────────────────────────────────────────┘
```

#### **2.5 Limitações:**
- ⚠️ Dados não são oficiais
- ⚠️ Qualidade variável (70-75%)
- ⚠️ Pode não ter dados em tempo real
- ⚠️ Depende de sites públicos disponíveis

---

## 3. METAS E ACOMPANHAMENTO - SISTEMA COMPLETO

### **🎯 Objetivo:**
Sistema completo de metas e acompanhamento com tracking automático, alertas, recomendações e integração com outras funcionalidades.

### **📊 Como Deve Funcionar:**

#### **3.1 Tipos de Metas:**

**Metas de Receita:**
- Meta de receita mensal/trimestral/anual
- Meta de ticket médio
- Meta de crescimento de receita

**Metas de Ocupação:**
- Meta de ocupação (%)
- Meta de número de reservas
- Meta de taxa de cancelamento

**Metas de Avaliação:**
- Meta de nota média (ex: 4.5 estrelas)
- Meta de número de avaliações
- Meta de taxa de resposta

**Metas de Marketing:**
- Meta de ROI de marketing
- Meta de conversão de campanhas
- Meta de alcance/engajamento

**Metas de Crescimento:**
- Meta de novos clientes
- Meta de taxa de retorno
- Meta de expansão

**Metas de Operações:**
- Meta de tempo de resposta
- Meta de satisfação do cliente
- Meta de eficiência operacional

#### **3.2 Criação de Metas:**

**Interface:**
```
┌─────────────────────────────────────────┐
│ 🎯 Nova Meta                            │
│                                         │
│ Título: [Aumentar ocupação para 80%]   │
│                                         │
│ Categoria: [Ocupação ▼]                │
│                                         │
│ Valor Atual: [65] %                    │
│ Meta: [80] %                           │
│                                         │
│ Prazo: [15/03/2025]                    │
│                                         │
│ Prioridade: [Alta ▼]                   │
│                                         │
│ Descrição:                              │
│ [Melhorar ocupação através de          │
│  campanhas de marketing e otimização   │
│  de preços]                            │
│                                         │
│ [Cancelar] [Criar Meta]                │
└─────────────────────────────────────────┘
```

**Validação:**
- ✅ Título obrigatório
- ✅ Meta deve ser maior que valor atual
- ✅ Prazo deve ser no futuro
- ✅ Valores numéricos válidos

#### **3.3 Tracking Automático:**

**Integração com Dados:**
```typescript
// Atualizar progresso automaticamente
async function updateGoalProgress(goalId: string) {
  const goal = await getGoal(goalId);
  
  // Buscar valor atual baseado na categoria
  let currentValue = 0;
  
  switch (goal.category) {
    case 'occupancy':
      // Buscar ocupação atual do sistema de reservas
      currentValue = await getCurrentOccupancy();
      break;
    case 'revenue':
      // Buscar receita atual
      currentValue = await getCurrentRevenue();
      break;
    case 'rating':
      // Buscar nota média atual
      currentValue = await getCurrentRating();
      break;
    // ... outras categorias
  }
  
  // Atualizar meta
  await updateGoal(goalId, { currentValue });
  
  // Verificar se precisa alertar
  checkGoalAlerts(goal);
}
```

**Frequência de Atualização:**
- Metas de receita: Diária
- Metas de ocupação: Diária
- Metas de avaliação: Semanal
- Metas de marketing: Semanal
- Metas de crescimento: Mensal

#### **3.4 Alertas e Notificações:**

**Tipos de Alertas:**

1. **Meta em Risco:**
   - Progresso abaixo do esperado
   - Tempo restante vs. progresso atual
   - Exemplo: "Meta de ocupação 80% está em risco. Progresso atual: 45%, faltam 15 dias"

2. **Meta Atrasada:**
   - Prazo passou e meta não foi atingida
   - Exemplo: "Meta de receita R$ 50k não foi atingida. Valor atual: R$ 42k"

3. **Meta Próxima de Ser Atingida:**
   - Progresso acima de 90%
   - Exemplo: "Meta de ocupação 80% está 92% completa! Continue assim!"

4. **Meta Atingida:**
   - Progresso = 100%
   - Exemplo: "🎉 Parabéns! Meta de ocupação 80% foi atingida!"

**Configuração de Alertas:**
```
┌─────────────────────────────────────────┐
│ 🔔 Configurar Alertas                   │
│                                         │
│ ☑ Alertar quando meta estiver em risco │
│ ☑ Alertar quando meta for atingida     │
│ ☑ Alertar quando meta estiver atrasada │
│                                         │
│ Frequência:                             │
│ ○ Diário                                │
│ ● Semanal                               │
│ ○ Apenas quando necessário              │
│                                         │
│ Canais:                                 │
│ ☑ Email                                 │
│ ☑ Notificação na plataforma            │
│ ☐ SMS                                   │
│                                         │
│ [Salvar]                                │
└─────────────────────────────────────────┘
```

#### **3.5 Dashboard de Metas:**

**Visão Geral:**
```
┌─────────────────────────────────────────┐
│ 🎯 Metas e Acompanhamento               │
│                                         │
│ Resumo:                                 │
│ • 5 metas ativas                        │
│ • 2 em risco                            │
│ • 1 próxima de ser atingida             │
│ • 2 no caminho certo                    │
│                                         │
│ Progresso Geral: 68%                    │
│ ████████████████░░░░░░░░                │
│                                         │
│ [Nova Meta] [Ver Todas]                │
└─────────────────────────────────────────┘
```

**Lista de Metas:**
```
┌─────────────────────────────────────────┐
│ 🎯 Aumentar ocupação para 80%           │
│                                         │
│ Categoria: Ocupação                     │
│ Progresso: 65% / 80%                    │
│ ████████████████░░░░░░░░                │
│                                         │
│ Prazo: 15/03/2025 (45 dias restantes)  │
│ Status: ⚠️ Em risco                     │
│                                         │
│ [Ver Detalhes] [Editar] [Excluir]      │
├─────────────────────────────────────────┤
│ 🎯 Aumentar receita para R$ 50k         │
│                                         │
│ Categoria: Receita                      │
│ Progresso: R$ 42k / R$ 50k (84%)       │
│ ████████████████████░░                  │
│                                         │
│ Prazo: 28/02/2025 (12 dias restantes)  │
│ Status: ✅ No caminho certo             │
│                                         │
│ [Ver Detalhes] [Editar] [Excluir]      │
└─────────────────────────────────────────┘
```

#### **3.6 Detalhes da Meta:**

**Página de Detalhes:**
```
┌─────────────────────────────────────────┐
│ 🎯 Aumentar ocupação para 80%           │
│                                         │
│ Categoria: Ocupação                     │
│ Prioridade: Alta                        │
│ Criada em: 01/01/2025                  │
│ Prazo: 15/03/2025                      │
│                                         │
│ Progresso:                              │
│ Valor Atual: 65%                        │
│ Meta: 80%                               │
│ Progresso: 81.25%                       │
│ ████████████████████░░                  │
│                                         │
│ Tempo:                                  │
│ • Dias desde criação: 17                │
│ • Dias restantes: 45                    │
│ • Progresso esperado: 27%               │
│ • Progresso atual: 81.25%               │
│                                         │
│ Status: ✅ Acima do esperado            │
│                                         │
│ Histórico:                              │
│ [Gráfico de evolução]                   │
│                                         │
│ Recomendações:                          │
│ • Continue com as campanhas atuais      │
│ • Considere aumentar a meta para 85%    │
│                                         │
│ [Editar Meta] [Excluir]                │
└─────────────────────────────────────────┘
```

#### **3.7 Recomendações Automáticas:**

**Baseadas em Progresso:**
- Se progresso < esperado: Sugerir ações corretivas
- Se progresso > esperado: Sugerir aumentar meta
- Se meta atingida: Sugerir nova meta

**Baseadas em Categoria:**
- Ocupação baixa: Sugerir otimização de preços (Revenue Optimizer)
- Receita baixa: Sugerir campanhas de marketing
- Avaliação baixa: Sugerir melhorias no atendimento

#### **3.8 Relatórios de Metas:**

**Relatório Mensal:**
- Metas criadas no mês
- Metas atingidas
- Metas em risco
- Progresso geral
- Recomendações

**Exportação:**
- PDF
- Excel
- JSON

---

## 4. UPLOAD DE DOCUMENTOS

### **🎯 Objetivo:**
Permitir upload de documentos para extrair dados e melhorar análises.

### **📊 Como Deve Funcionar:**

#### **4.1 Interface:**
- Drag-and-drop
- Upload múltiplo (até 10 arquivos)
- Barra de progresso
- Preview antes de processar

#### **4.2 Processamento:**
- Extração de texto (OCR para imagens)
- Análise com IA (Gemini)
- Extração de dados estruturados
- Atualização automática do dashboard

#### **4.3 Integração com Metas:**
- Documentos podem atualizar valores de metas automaticamente
- Exemplo: Planilha Excel com reservas → atualiza meta de ocupação

---

## 5. RELATÓRIOS

### **🎯 Objetivo:**
Gerar relatórios profissionais (PDF, Excel) com dados reais.

### **📊 Como Deve Funcionar:**

#### **5.1 Tipos:**
- Relatório de Diagnóstico
- Relatório de Revenue Optimizer
- Relatório de Market Intelligence
- Relatório de Competitive Benchmark
- Relatório de Metas
- Relatório Consolidado

#### **5.2 Formatos:**
- PDF (formatado)
- Excel (dados estruturados)
- JSON (para integração)

---

## 6. CONFIGURAÇÕES DE CONTA

### **🎯 Objetivo:**
Centralizar todas as configurações.

### **📊 Como Deve Funcionar:**

#### **6.1 Abas:**
1. Perfil
2. Segurança (alterar senha, email)
3. Plano e Cobrança (ver, alterar, cancelar)
4. Notificações
5. Integrações (ALUMIA, Google Ads, etc.)
6. Privacidade

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### **Prioridade ALTA:**

- [ ] **ALUMIA:**
  - [ ] Verificar se API está disponível
  - [ ] Implementar teste de conexão
  - [ ] Implementar fallback para Google Search
  - [ ] Mostrar status claro (configurada/não configurada)

- [ ] **Google Search API:**
  - [ ] Configurar variáveis de ambiente
  - [ ] Implementar busca de dados de turismo
  - [ ] Extrair dados estruturados
  - [ ] Mostrar fonte e qualidade

- [ ] **Metas e Acompanhamento:**
  - [ ] Sistema completo de criação de metas
  - [ ] Tracking automático
  - [ ] Alertas e notificações
  - [ ] Dashboard de metas
  - [ ] Recomendações automáticas
  - [ ] Relatórios de metas

### **Prioridade MÉDIA:**

- [ ] Upload de Documentos
- [ ] Relatórios
- [ ] Configurações de Conta

---

## ❓ PERGUNTAS PARA APROVAÇÃO

1. **ALUMIA:**
   - ✅ A API está disponível? Qual a URL base?
   - ✅ Qual o formato de autenticação?
   - ✅ Quais endpoints estão disponíveis?

2. **Google Search API:**
   - ✅ Temos API key e Engine ID?
   - ✅ Qual o limite de requisições/dia?
   - ✅ Aprovado usar como fallback?

3. **Metas e Acompanhamento:**
   - ✅ Aprovado sistema completo?
   - ✅ Quais categorias de metas priorizar?
   - ✅ Frequência de atualização automática?

4. **Upload de Documentos:**
   - ✅ Aprovado para implementar?
   - ✅ Quais tipos de arquivo priorizar?

5. **Relatórios:**
   - ✅ Aprovado para implementar?
   - ✅ Quais formatos priorizar?

---

## 🚨 REGRAS CRÍTICAS

### **1. NUNCA Inventar Dados:**
- ✅ Sempre mostrar fonte
- ✅ Indicar quando são dados de demonstração
- ✅ Explicar limitações

### **2. ALUMIA:**
- ✅ Só usar quando API estiver configurada
- ✅ Testar conexão antes de usar
- ✅ Fallback para Google Search se não disponível

### **3. Google Search API:**
- ✅ Sempre indicar fonte
- ✅ Mostrar qualidade dos dados
- ✅ Explicar limitações

---

**Aguardando sua aprovação para prosseguir!** 🚀

