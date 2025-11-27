# 📊 CONSULTA: IMPLEMENTAÇÃO DASHBOARD INTEGRADO - ViaJAR SaaS

## 📅 Data: Fevereiro 2025
## 🎯 Objetivo: Definir arquitetura completa antes de implementar

---

## 📋 RESUMO EXECUTIVO

Este documento apresenta uma **proposta detalhada** de como funcionará o dashboard do setor privado integrado com:
- ✅ Alumia API (quando disponível)
- ✅ Dados do Descubra Mato Grosso do Sul
- ✅ Dados do cadastro/diagnóstico inicial
- ✅ Google Search API
- ✅ Gemini API (Guilherme IA)
- ✅ Upload de documentos
- ✅ Dados dos CATs
- ✅ Termo de Consentimento LGPD

**IMPORTANTE:** Este documento é uma **CONSULTA**. Por favor, revise e confirme antes de implementarmos.

---

## 🔍 ANÁLISE DO QUE JÁ EXISTE

### 1. **Cadastro/Diagnóstico Inicial**

**Perguntas coletadas (10 perguntas base):**
1. Tipo de negócio (hospedagem, gastronomia, atrativos, serviços, eventos)
2. Receita mensal média (faixas)
3. Taxa de ocupação média (faixas)
4. Canais de marketing utilizados (múltipla escolha)
5. Presença digital (1-5)
6. Atendimento ao cliente (1-5)
7. Principais desafios (múltipla escolha)
8. Tecnologias em uso (múltipla escolha)
9. Práticas de sustentabilidade (níveis)
10. Anos de experiência no mercado (faixas)
11. Objetivos principais (aumentar receita, qualidade, etc.)

**Dados adicionais coletados:**
- Nome do negócio
- Cidade
- Estado
- Informações básicas do perfil

### 2. **Termo de Consentimento LGPD**

**Status:** ✅ Já implementado
- Tabela `data_sharing_consents` criada
- Termo obrigatório no onboarding
- Usuário pode escolher tipos de dados a compartilhar
- Pode revogar a qualquer momento
- Dados agregados e anonimizados

**Tipos de dados que podem ser compartilhados:**
- Receita (agregada)
- Ocupação (taxa média)
- Preços (faixas médias)
- Avaliações (médias)
- Serviços (tipos)
- Capacidade (média)

### 3. **Integração Alumia**

**Status:** ⚠️ Preparado, mas não ativo
- Serviço existe em `src/services/alumia/index.ts.disabled` (818 linhas!)
- Configuração pronta para quando API estiver disponível
- Fallback para Google Search + IA quando não for MS

### 4. **Dashboard Privado Atual**

**Componentes existentes:**
- ✅ `PrivateDashboard.tsx` - Dashboard principal
- ✅ `ViaJARIntelligence.tsx` - Revenue Optimizer, Market Intelligence, Competitive Benchmark
- ✅ `DiagnosticDashboard.tsx` - Resultados do diagnóstico
- ✅ `DocumentUpload.tsx` - Upload de documentos
- ✅ `ReportsSection.tsx` - Módulo de relatórios

**Funcionalidades já implementadas:**
- Revenue Optimizer (com dados mockados)
- Market Intelligence (com dados mockados)
- Competitive Benchmark (com dados mockados)
- Upload de documentos
- Relatórios básicos

---

## 🎯 PROPOSTA DE ARQUITETURA INTEGRADA

### **FLUXO COMPLETO: Do Cadastro ao Dashboard**

```
1. USUÁRIO SE CADASTRA
   ├─ Preenche dados básicos (nome, email, etc.)
   ├─ Responde diagnóstico inicial (10 perguntas)
   ├─ Aceita termo de consentimento LGPD
   └─ Escolhe tipos de dados a compartilhar

2. DADOS SALVOS NO BANCO
   ├─ user_profiles (dados básicos)
   ├─ diagnostic_answers (respostas do questionário)
   ├─ data_sharing_consents (consentimento LGPD)
   └─ business_profile (perfil do negócio)

3. DASHBOARD CARREGA
   ├─ Busca dados do cadastro
   ├─ Busca dados do diagnóstico
   ├─ Verifica consentimento LGPD
   ├─ Identifica estado do negócio (MS ou outro)
   └─ Decide fontes de dados

4. FONTES DE DADOS (por estado)
   ├─ MS: Alumia + Descubra MS + Dados internos
   ├─ Outros estados: Google Search + Upload + Dados internos
   └─ Internacional: Google Search + Upload + IA

5. DASHBOARD EXIBE
   ├─ Visão Geral (métricas do negócio)
   ├─ Revenue Optimizer (precificação dinâmica)
   ├─ Market Intelligence (análise de mercado)
   ├─ Competitive Benchmark (comparação)
   └─ Relatórios (gerados pelo Guilherme IA)
```

---

## 📊 DASHBOARD DO SETOR PRIVADO - FUNCIONAMENTO DETALHADO

### **1. VISÃO GERAL (Overview)**

**O que mostra:**
- Score geral do negócio (0-100%)
- Receita mensal atual
- Taxa de ocupação (se hotel)
- Número de recomendações ativas
- Potencial de crescimento
- Nível de maturidade (Básico, Iniciante, Intermediário, Avançado)

**Fontes de dados:**
- ✅ Dados do cadastro (receita, ocupação)
- ✅ Dados do diagnóstico (score, recomendações)
- ✅ Dados internos (reservas, vendas)
- ⚠️ Alumia (MS) - quando disponível
- ⚠️ Google Analytics (se conectado)

**Atualização:**
- Dados do cadastro: estáticos (atualizados quando usuário edita)
- Dados internos: tempo real (quando disponível)
- Dados externos: diária (cache de 24h)

---

### **2. REVENUE OPTIMIZER (Precificação Dinâmica)**

**O que faz:**
- Analisa dados históricos de receita
- Considera sazonalidade, eventos, clima
- Sugere preços otimizados para próximos dias
- Calcula impacto na receita

**Fontes de dados:**
- ✅ Dados históricos do negócio (receita, ocupação, preços)
- ✅ Dados do cadastro (tipo de negócio, localização)
- ⚠️ Alumia (MS): fluxo turístico, eventos, sazonalidade
- ⚠️ Google Search: eventos na região, tendências
- ⚠️ Upload de documentos: balanços, planilhas (se anexados)
- ⚠️ Dados dos CATs (MS): origem turistas, perfil
- ⚠️ Dados agregados (com consentimento): ocupação média do mercado

**Como funciona a atualização:**
- **Tempo real:** Gráfico atualiza automaticamente quando há novos dados
- **Edição manual:** Usuário pode ajustar preços sugeridos
- **Configurável:** Usuário pode escolher frequência (diária, semanal, manual)

**Gráfico:**
- Mostra ocupação prevista vs. preço sugerido
- Linha dupla: ocupação (eixo esquerdo) + preço (eixo direito)
- Atualiza automaticamente quando:
  - Novos dados chegam (reservas, vendas)
  - Eventos são adicionados
  - Clima muda significativamente
- Botão "Atualizar agora" para forçar atualização

**Recomendações da IA:**
- 🟢 Alta demanda: "Aumente preços em 15%"
- 🔵 Baixa temporada: "Ofereça promoção de 20%"
- 🟡 Atenção: "Seu preço está 10% abaixo da média"

---

### **3. MARKET INTELLIGENCE (Análise de Mercado)**

**O que faz:**
- Analisa origem dos turistas
- Perfil demográfico
- ROI por canal de marketing
- Tendências do setor
- Oportunidades identificadas

**Fontes de dados:**
- ✅ Dados do cadastro (canais de marketing, localização)
- ⚠️ Alumia (MS): origem turistas, perfil demográfico, fluxo
- ⚠️ Dados dos CATs (MS): pesquisas com turistas, origem
- ⚠️ Google Search: tendências de busca, interesse
- ⚠️ Redes sociais: menções, sentimentos (se API disponível)
- ⚠️ Upload de documentos: relatórios de marketing, análises
- ⚠️ Dados agregados (com consentimento): médias do mercado

**Análise:**
- **Mercado local:** Cidade/região do negócio
- **Mercado regional:** Estado
- **Mercado nacional:** Brasil (quando relevante)

**Insights gerados:**
- "45% dos turistas vêm de São Paulo - invista em marketing lá"
- "ROI do email é 7.5x - crie newsletter semanal"
- "Crescimento de 20% em turismo de aventura - considere pacotes"

**Atualização:**
- Dados do cadastro: estáticos
- Dados externos: semanal (cache de 7 dias)
- Upload de documentos: sob demanda (quando usuário faz upload)

---

### **4. COMPETITIVE BENCHMARK (Comparação com Concorrentes)**

**Como identificar concorrentes:**

**Estratégia proposta:**
1. **Mesma categoria:** Mesmo tipo de negócio (hotel, restaurante, etc.)
2. **Mesma região:** Mesma cidade ou região próxima (raio configurável)
3. **Mesmo porte:** Baseado em receita do cadastro (pequeno, médio, grande)
4. **Dados agregados:** Usar dados de empresas que deram consentimento LGPD

**Métricas comparadas:**
- Taxa de ocupação (se aplicável)
- Preço médio (ADR)
- Receita por quarto disponível (RevPAR)
- Avaliações médias
- Tempo médio de estadia
- Presença digital (se disponível)

**Fontes de dados:**
- ✅ Dados próprios (do cadastro e internos)
- ⚠️ Dados agregados (com consentimento LGPD): médias anonimizadas
- ⚠️ Alumia (MS): dados oficiais agregados
- ⚠️ Google Search: avaliações públicas, preços (se disponível)
- ⚠️ Redes sociais: avaliações públicas (se API disponível)

**Visualização:**
- Gráfico comparativo: "Você vs. Mercado"
- Posicionamento: "Você está no top 20% em ocupação"
- Gaps identificados: "Sua avaliação está 0.3 abaixo da média"
- Recomendações: "Invista em limpeza para aumentar avaliações"

**Atualização:**
- Dados próprios: tempo real
- Dados agregados: mensal (cache de 30 dias)
- Dados públicos: semanal (cache de 7 dias)

---

### **5. GUILHERME IA - GERAÇÃO DE RELATÓRIOS**

**Como funciona:**
- Usuário solicita relatório específico (ex: "Análise completa do mês")
- Guilherme IA coleta dados de todas as fontes
- Analisa usando Gemini API
- Gera relatório em PDF/Word
- Salva no módulo de Relatórios para download

**Fontes de dados para relatórios:**
- ✅ Dados do cadastro
- ✅ Dados do diagnóstico
- ✅ Dados internos (reservas, vendas)
- ⚠️ Alumia (MS)
- ⚠️ Google Search
- ⚠️ Upload de documentos (se anexados)
- ⚠️ Dados dos CATs (MS)

**Conteúdo dos relatórios:**
- Gráficos e visualizações
- Análises detalhadas
- Recomendações acionáveis
- Comparações com mercado
- Tendências identificadas
- Próximos passos sugeridos

**Formato:**
- PDF (padrão)
- Word (opcional)
- Excel (para dados brutos)

**Armazenamento:**
- Salvo no módulo de Relatórios
- Disponível para download posterior
- Histórico mantido

---

### **6. UPLOAD DE DOCUMENTOS**

**Tipos aceitos:**
- Balanços financeiros (PDF, Excel)
- Relatórios de marketing (PDF, Word)
- Planilhas de vendas (Excel, CSV)
- Relatórios de ocupação (PDF, Excel)
- Outros documentos relevantes

**Processamento:**
1. Usuário faz upload
2. Sistema pergunta: "Deseja usar estes dados para análises?"
3. Se sim, IA extrai dados automaticamente (Gemini API)
4. Dados integrados ao dashboard
5. Usuário pode revisar e corrigir dados extraídos

**Integração:**
- Dados extraídos alimentam Revenue Optimizer
- Dados extraídos alimentam Market Intelligence
- Dados extraídos alimentam Competitive Benchmark
- Dados extraídos usados em relatórios do Guilherme IA

---

### **7. DADOS DOS CATs**

**Quais dados usar:**
- Número de atendimentos por período
- Origem dos turistas (cidade/estado)
- Perfil demográfico (idade, renda estimada)
- Interesses turísticos
- Satisfação média
- Dados dos atendentes (número de atendimentos, avaliações)

**Uso:**
- **Setor privado:** Alimenta Market Intelligence (origem turistas, perfil)
- **Setor público:** Dashboard municipal, análises de demanda

**Fonte:**
- Tabela `tourist_surveys` (pesquisas com turistas)
- Tabela `cat_attendants` (dados dos atendentes)

---

## 🔄 LÓGICA DE FONTES DE DADOS POR ESTADO

### **Usuário do MS:**
```
1. Tentar Alumia API (se disponível)
2. Usar Descubra MS (dados internos)
3. Usar dados dos CATs
4. Usar dados agregados (com consentimento)
5. Fallback: Google Search + IA
```

### **Usuário de outro estado:**
```
1. Tentar API oficial do estado (se disponível)
2. Usar Google Search API
3. Usar upload de documentos
4. Usar dados agregados (com consentimento)
5. Fallback: IA generativa
```

### **Usuário internacional:**
```
1. Usar Google Search API
2. Usar upload de documentos
3. Usar dados agregados (se disponível)
4. Fallback: IA generativa
```

---

## ⚙️ CONFIGURAÇÕES E PREFERÊNCIAS

**Opções que o usuário pode configurar:**
- Frequência de atualização (tempo real, diária, semanal, manual)
- Fontes de dados preferidas
- Tipos de dados a compartilhar (LGPD)
- Notificações (quando houver oportunidades/alertas)
- Formato de relatórios preferido

---

## ❓ PERGUNTAS PARA CONFIRMAÇÃO

Antes de implementar, preciso confirmar:

### **1. Sobre Previsão de Demanda:**
- ✅ Confirmado: Atualização em tempo real + opção de editar manualmente
- ❓ Pergunta: Qual intervalo mínimo de atualização? (ex: a cada 1h, 6h, 24h?)
- ❓ Pergunta: O gráfico deve atualizar automaticamente na tela ou apenas quando usuário solicitar?

### **2. Sobre Market Intelligence:**
- ✅ Confirmado: Analisar mercado local, regional e nacional
- ✅ Confirmado: Usar todas as fontes (Alumia, Google Search, upload, etc.)
- ❓ Pergunta: Deve gerar alertas automáticos sobre oportunidades/ameaças? (você disse que não precisa, mas confirmando)

### **3. Sobre Competitive Benchmark:**
- ✅ Confirmado: Identificar por categoria + região + porte
- ✅ Confirmado: Usar dados públicos + agregados
- ❓ Pergunta: Quantos concorrentes mostrar? (top 5, top 10, todos?)
- ❓ Pergunta: Deve incluir concorrentes de outras cidades próximas? (raio de quantos km?)

### **4. Sobre Upload de Documentos:**
- ✅ Confirmado: Todos os tipos de documentos
- ✅ Confirmado: IA extrai e integra (com permissão)
- ❓ Pergunta: Limite de tamanho por arquivo? (ex: 10MB, 50MB?)
- ❓ Pergunta: Quantos arquivos simultâneos? (ex: 5, 10, ilimitado?)

### **5. Sobre Relatórios do Guilherme IA:**
- ✅ Confirmado: Gerar sob demanda
- ✅ Confirmado: Incluir gráficos, análises e recomendações
- ✅ Confirmado: Salvar no módulo de Relatórios
- ❓ Pergunta: Limite de relatórios salvos? (ex: últimos 10, todos?)
- ❓ Pergunta: Tempo máximo de processamento? (ex: 5min, 10min?)

### **6. Sobre Dados dos CATs:**
- ✅ Confirmado: Usar em setor privado e público
- ❓ Pergunta: Quais dados específicos dos atendentes? (número de atendimentos, satisfação, ambos?)

### **7. Sobre Alumia:**
- ✅ Confirmado: Preparar para quando API estiver disponível
- ❓ Pergunta: Quando API estiver disponível, deve substituir ou complementar dados do Descubra MS?
- ❓ Pergunta: Se Alumia falhar, qual fallback? (Descubra MS, Google Search, ambos?)

---

## 📝 PRÓXIMOS PASSOS

Após sua confirmação, vou:

1. ✅ Criar arquitetura detalhada de integração
2. ✅ Implementar serviços de coleta de dados
3. ✅ Integrar todas as fontes de dados
4. ✅ Atualizar dashboards com dados reais
5. ✅ Implementar geração de relatórios pelo Guilherme IA
6. ✅ Testar fluxo completo
7. ✅ Documentar tudo

---

## 🎯 RESUMO DA PROPOSTA

**Dashboard do Setor Privado funcionará assim:**

1. **Carrega dados do cadastro/diagnóstico** → Alimenta métricas iniciais
2. **Verifica estado do negócio** → Decide fontes de dados (MS = Alumia, outros = Google)
3. **Coleta dados de todas as fontes** → Alumia, Google, Upload, CATs, agregados
4. **Atualiza dashboards** → Revenue Optimizer, Market Intelligence, Benchmark
5. **Gera relatórios sob demanda** → Guilherme IA cria PDF/Word com análises
6. **Permite edição manual** → Usuário pode ajustar preços, métricas, etc.

**Tudo integrado, tudo funcionando junto!**

---

**Por favor, revise este documento e confirme:**
- ✅ O que está correto
- ❓ Responda as perguntas
- 🔄 O que precisa ser ajustado

**Depois de sua confirmação, implemento tudo!** 🚀

