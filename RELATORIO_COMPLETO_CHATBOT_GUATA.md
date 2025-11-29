# 🐹 RELATÓRIO COMPLETO - CHATBOT GUATÁ

## 📋 ÍNDICE

1. [Visão Geral e Objetivo](#visão-geral)
2. [Identidade e Personalidade](#identidade)
3. [Arquitetura do Sistema](#arquitetura)
4. [Componentes Principais](#componentes)
5. [Fluxo de Funcionamento](#fluxo)
6. [Tecnologias Utilizadas](#tecnologias)
7. [Serviços e Integrações](#serviços)
8. [Base de Conhecimento](#base-conhecimento)
9. [Banco de Dados](#banco-dados)
10. [Edge Functions (Supabase)](#edge-functions)
11. [Machine Learning e Aprendizado](#machine-learning)
12. [Configurações e Variáveis de Ambiente](#configurações)
13. [Sistema de Feedback](#feedback)
14. [Políticas de Veracidade](#veracidade)
15. [Rate Limiting e Cache](#rate-limiting)
16. [Interface do Usuário](#interface)

---

## 🎯 1. VISÃO GERAL E OBJETIVO {#visão-geral}

### **O que é o Guatá**

O **Guatá** é um chatbot inteligente de turismo desenvolvido especificamente para **Mato Grosso do Sul**, com foco especial em **Campo Grande**. Ele funciona como um guia virtual que ajuda visitantes e moradores a descobrirem as maravilhas do estado.

### **Objetivos Principais**

1. **Informar**: Fornecer informações verdadeiras e atualizadas sobre turismo em MS
2. **Encantar**: Criar uma experiência agradável e acolhedora para os usuários
3. **Incentivar**: Despertar interesse e incentivar visitas reais aos destinos
4. **Aprender**: Evoluir continuamente através de feedback dos usuários
5. **Personalizar**: Adaptar respostas baseado no histórico e preferências do usuário

### **Características Únicas**

- ✅ **Pesquisa Web em Tempo Real**: Busca informações atualizadas na internet
- ✅ **Base de Conhecimento Persistente**: Armazena respostas curadas para perguntas frequentes
- ✅ **Machine Learning**: Aprende com interações e feedback
- ✅ **Múltiplas Fontes**: Combina dados de APIs, web search e conhecimento local
- ✅ **Verificação de Veracidade**: Política de "sem fonte confiável, sem resposta direta"
- ✅ **Personalidade Autêntica**: Tom caloroso e natural, sem ser genérico

---

## 🦦 2. IDENTIDADE E PERSONALIDADE {#identidade}

### **Identidade do Guatá**

- **Nome**: Guatá
- **Espécie**: Capivara (símbolo do Pantanal)
- **Papel**: Guia de turismo especializado em Mato Grosso do Sul
- **Personalidade**: Simpática, acolhedora, curiosa e autêntica

### **Características da Personalidade**

- ✅ **Acolhedor e simpático** - não genérico
- ✅ **Incentiva visitação** - desperta curiosidade sobre MS
- ✅ **Tom caloroso e natural** - acessível e humano
- ✅ **NÃO se apresenta repetidamente** - não diz "sou o Guatá" a toda hora
- ✅ **Sem autopromoção** - foco no usuário e suas necessidades
- ✅ **Linguagem concisa** - 2-3 frases para perguntas simples, até 4-5 em casos complexos

### **Estilo de Comunicação**

- **Tom**: Caloroso, direto e conciso
- **Cultura Local**: Toques da cultura sul-mato-grossense (sem exageros)
- **Regra de Ouro**: "Sem fonte confiável, sem resposta direta"
- **Fechamento**: Sempre com 1 pergunta útil (ex.: "Quer saber o horário?")

### **Exemplos de Respostas**

```
🦦 Que alegria te ver aqui! Eu sou o Guatá, sua capivara guia de Mato Grosso do Sul! 😊 
Estou aqui para te ajudar a descobrir as maravilhas do nosso estado! Temos o Pantanal 
(maior santuário ecológico do mundo!), Bonito (águas cristalinas de outro planeta!), 
Campo Grande (nossa capital cheia de história!) e muito mais! O que você está com vontade 
de descobrir hoje?
```

---

## 🏗️ 3. ARQUITETURA DO SISTEMA {#arquitetura}

### **Visão Geral da Arquitetura**

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + TypeScript)            │
├─────────────────────────────────────────────────────────────┤
│  • src/pages/ChatGuata.tsx (Página principal)              │
│  • src/components/guata/ (Componentes UI)                  │
│  • src/hooks/useGuataConversation.ts (Lógica de conversa)  │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              SERVIÇOS CLIENT (TypeScript)                    │
├─────────────────────────────────────────────────────────────┤
│  • guataIntelligentTourismService.ts (Orquestrador principal)│
│  • guataGeminiService.ts (IA Gemini)                        │
│  • guataRealWebSearchService.ts (Pesquisa Web)               │
│  • guataKnowledgeBaseService.ts (Base de Conhecimento)       │
│  • guataMLService.ts (Machine Learning)                     │
│  • guataPartnersService.ts (Parceiros)                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│         SUPABASE (Edge Functions + Database)                │
├─────────────────────────────────────────────────────────────┤
│  • functions/guata-ai (LLM + Prompt Engineering)            │
│  • functions/guata-web-rag (RAG + Web Search)               │
│  • functions/guata-feedback (Feedback e Telemetria)         │
│  • Database: guata_knowledge_base (Base de conhecimento)    │
│  • Database: guata_feedback (Feedback dos usuários)         │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              APIs EXTERNAS                                   │
├─────────────────────────────────────────────────────────────┤
│  • Google Gemini AI (Geração de respostas)                   │
│  • Google Custom Search API (Pesquisa web)                    │
│  • Google Places API (Endereços e horários)                  │
│  • OpenWeather API (Clima - quando necessário)               │
└─────────────────────────────────────────────────────────────┘
```

### **Camadas do Sistema**

1. **Camada de Apresentação (Frontend)**
   - Interface React com TypeScript
   - Componentes reutilizáveis
   - Hooks para gerenciamento de estado

2. **Camada de Serviços (Client-side)**
   - Orquestração de lógica de negócio
   - Integração com APIs externas
   - Processamento de dados

3. **Camada de Backend (Supabase)**
   - Edge Functions para processamento serverless
   - Banco de dados PostgreSQL
   - Autenticação e segurança

4. **Camada de Integração (APIs Externas)**
   - Serviços de IA (Gemini)
   - Serviços de busca (Google)
   - Serviços de dados (Places, Weather)

---

## 🧩 4. COMPONENTES PRINCIPAIS {#componentes}

### **4.1 Frontend**

#### **Páginas**
- **`src/pages/ChatGuata.tsx`**
  - Página principal do chatbot
  - Gerencia estado global da conversa
  - Integra todos os componentes
  - Gerencia feedback e aprendizado

#### **Componentes**
- **`src/components/guata/GuataChat.tsx`**
  - Container principal do chat
  - Integra perfil, mensagens e input

- **`src/components/guata/GuataProfile.tsx`**
  - Exibe perfil do Guatá
  - Mostra status de conexão

- **`src/components/guata/ChatMessages.tsx`**
  - Renderiza mensagens do chat
  - Bolhas de mensagem (usuário e bot)
  - Botões de feedback (👍/👎)

- **`src/components/guata/ChatInput.tsx`**
  - Campo de entrada de mensagem
  - Botão de envio
  - Botão de limpar conversa
  - Suporte a gravação de áudio (futuro)

- **`src/components/guata/SuggestionQuestions.tsx`**
  - Perguntas sugeridas
  - Facilita interação inicial

#### **Hooks**
- **`src/hooks/useGuataConversation.ts`**
  - Gerencia estado da conversa
  - Processa envio de mensagens
  - Gerencia histórico de conversação

- **`src/hooks/useGuataConnection.ts`**
  - Verifica conexão com serviços
  - Status de disponibilidade

- **`src/hooks/useGuataInput.ts`**
  - Gerencia input do usuário
  - Suporte a gravação de áudio

### **4.2 Serviços (Client-side)**

#### **Serviço Principal**
- **`src/services/ai/guataIntelligentTourismService.ts`**
  - **Função**: Orquestrador principal do sistema
  - **Responsabilidades**:
    - Detecção de tipo de pergunta
    - Coordenação entre serviços
    - Geração de respostas inteligentes
    - Detecção de contexto e pronomes
    - Tratamento de perguntas genéricas
    - Integração com parceiros
    - Personalização de respostas

#### **Serviços Especializados**

- **`src/services/ai/guataGeminiService.ts`**
  - Integração com Google Gemini AI
  - Geração de respostas com IA
  - Rate limiting e cache
  - Personalização de prompts

- **`src/services/ai/guataRealWebSearchService.ts`**
  - Pesquisa web em tempo real
  - Integração com Google Custom Search
  - Extração de dados de turismo
  - Cache de resultados

- **`src/services/ai/guataKnowledgeBaseService.ts`**
  - Consulta à base de conhecimento persistente
  - Busca por similaridade
  - Normalização de perguntas
  - Gerenciamento de entradas

- **`src/services/ai/ml/guataMLService.ts`**
  - Machine Learning e aprendizado
  - Personalização baseada em histórico
  - Processamento de feedback
  - Análise de padrões

- **`src/services/ai/guataPartnersService.ts`**
  - Gerenciamento de parceiros
  - Priorização de parceiros oficiais
  - Integração com base de dados

### **4.3 Backend (Supabase)**

#### **Edge Functions**

- **`supabase/functions/guata-ai/index.ts`**
  - Processamento de IA via Gemini
  - Aplicação de prompts e persona
  - Políticas de veracidade
  - Validação de respostas

- **`supabase/functions/guata-web-rag/index.ts`**
  - Retrieval Augmented Generation (RAG)
  - Busca web com ranking
  - Cache e rate limiting
  - Extração de contexto

- **`supabase/functions/guata-feedback/index.ts`**
  - Persistência de feedback
  - Telemetria de conversas
  - Análise de satisfação

---

## 🔄 5. FLUXO DE FUNCIONAMENTO {#fluxo}

### **5.1 Fluxo Principal de Processamento**

```
1. USUÁRIO ENVIA PERGUNTA
   ↓
2. ChatGuata.tsx → useGuataConversation
   ↓
3. guataIntelligentTourismService.processQuestion()
   ↓
4. DETECÇÃO INTELIGENTE
   ├─ Cumprimento simples? → Resposta de boas-vindas
   ├─ Pergunta de continuação? → Usa contexto anterior
   ├─ Pronome vago? → Reescreve com contexto
   ├─ Pergunta genérica? → Pede esclarecimento
   └─ Pergunta normal → Continua fluxo
   ↓
5. CONSULTA KNOWLEDGE BASE (Primeiro)
   ├─ Match exato encontrado? → Retorna resposta
   └─ Não encontrado? → Continua fluxo
   ↓
6. PESQUISA WEB (Sempre executada)
   ├─ guataRealWebSearchService.searchRealTime()
   ├─ Google Custom Search API
   ├─ Extração de dados de turismo
   └─ Cache de resultados
   ↓
7. VERIFICAÇÃO DE PARCEIROS
   ├─ Pergunta sobre serviços? → Busca parceiros
   └─ Parceiros encontrados? → Prioriza na resposta
   ↓
8. GERAÇÃO DE RESPOSTA INTELIGENTE
   ├─ PRIORIDADE 1: Parceiros (se houver)
   ├─ PRIORIDADE 2: Gemini + Web Search + Parceiros
   ├─ PRIORIDADE 3: Formatação inteligente de web search
   └─ PRIORIDADE 4: Conhecimento local
   ↓
9. PERSONALIZAÇÃO COM ML
   ├─ guataMLService.personalizeResponse()
   ├─ Adaptação baseada em histórico
   └─ Preferências do usuário
   ↓
10. ADIÇÃO DE PERSONALIDADE
    ├─ Tom caloroso e natural
    ├─ Convite à visitação
    └─ Pergunta de seguimento
    ↓
11. RETORNO PARA FRONTEND
    ├─ Resposta formatada
    ├─ Metadados (fontes, confiança, etc.)
    └─ Insights de aprendizado
    ↓
12. APRENDIZADO EM BACKGROUND
    ├─ guataMLService.learnFromInteraction()
    └─ Atualização de memória
```

### **5.2 Detecção Inteligente de Contexto**

O sistema possui várias camadas de detecção inteligente:

1. **Cumprimentos Simples**
   - Detecta: "oi", "olá", "bom dia"
   - Ação: Resposta de boas-vindas personalizada

2. **Perguntas de Continuação**
   - Detecta: "sim", "ok", "pode"
   - Ação: Usa contexto da última pergunta

3. **Pronomes Vagos**
   - Detecta: "ela", "ele", "isso", "lá"
   - Ação: Reescreve pergunta com contexto anterior

4. **Perguntas Ambíguas**
   - Detecta: "qual o nome do presidente?" (sem contexto)
   - Ação: Usa foco da conversa anterior

5. **Perguntas Genéricas**
   - Detecta: "onde comer em MS?" (sem cidade)
   - Ação: Pede esclarecimento sobre cidade

6. **Respostas Apenas com Cidade**
   - Detecta: "Campo Grande" (após pergunta genérica)
   - Ação: Combina com pergunta anterior

### **5.3 Sistema de Priorização de Respostas**

1. **Knowledge Base** (Primeiro)
   - Respostas curadas e verificadas
   - Alta confiança (0.95)
   - Resposta instantânea

2. **Parceiros Oficiais** (Segundo)
   - Parceiros da plataforma
   - Prioridade em recomendações
   - Informações verificadas

3. **Gemini + Web Search** (Terceiro)
   - IA + dados atualizados
   - Respostas dinâmicas
   - Alta qualidade

4. **Web Search Formatado** (Quarto)
   - Dados da pesquisa web
   - Formatação inteligente
   - Respostas conversacionais

5. **Conhecimento Local** (Quinto)
   - Base de conhecimento hardcoded
   - Fallback seguro
   - Sempre disponível

---

## 🛠️ 6. TECNOLOGIAS UTILIZADAS {#tecnologias}

### **Frontend**
- **React 18+**: Framework principal
- **TypeScript**: Tipagem estática
- **Vite**: Build tool e dev server
- **Tailwind CSS**: Estilização
- **React Hooks**: Gerenciamento de estado

### **Backend**
- **Supabase**: Backend-as-a-Service
  - PostgreSQL: Banco de dados
  - Edge Functions: Serverless functions
  - Row Level Security: Segurança de dados
  - Real-time: Atualizações em tempo real

### **IA e Machine Learning**
- **Google Gemini AI**: Modelo de linguagem
  - Geração de respostas
  - Compreensão de contexto
  - Personalização

### **APIs Externas**
- **Google Custom Search API**: Pesquisa web
- **Google Places API**: Dados de lugares
- **OpenWeather API**: Dados climáticos (opcional)

### **Ferramentas de Desenvolvimento**
- **Git**: Controle de versão
- **ESLint**: Linting
- **Prettier**: Formatação de código

---

## 🔌 7. SERVIÇOS E INTEGRAÇÕES {#serviços}

### **7.1 guataIntelligentTourismService**

**Arquivo**: `src/services/ai/guataIntelligentTourismService.ts`

**Responsabilidades**:
- Orquestração principal do sistema
- Detecção de tipo de pergunta
- Coordenação entre serviços
- Geração de respostas inteligentes
- Tratamento de contexto e pronomes

**Métodos Principais**:
- `processQuestion()`: Processa pergunta do usuário
- `detectQuestionCategory()`: Categoriza pergunta
- `detectPronounReference()`: Detecta pronomes vagos
- `detectImplicitReference()`: Detecta referências implícitas
- `needsClarification()`: Verifica se precisa esclarecimento
- `generateIntelligentAnswer()`: Gera resposta final

### **7.2 guataGeminiService**

**Arquivo**: `src/services/ai/guataGeminiService.ts`

**Responsabilidades**:
- Integração com Google Gemini AI
- Geração de respostas com IA
- Rate limiting (8 req/min global, 2 req/min por usuário)
- Cache semântico (24h para comum, 48h para muito comum)
- Personalização de prompts

**Características**:
- API key específica do Guatá
- Sistema de cache híbrido (compartilhado + individual)
- Processamento em background
- Fallback inteligente

### **7.3 guataRealWebSearchService**

**Arquivo**: `src/services/ai/guataRealWebSearchService.ts`

**Responsabilidades**:
- Pesquisa web em tempo real
- Integração com Google Custom Search
- Extração de dados de turismo
- Cache de resultados

**Métodos Principais**:
- `searchRealTime()`: Busca na web
- `extractTourismData()`: Extrai dados de turismo
- `formatResults()`: Formata resultados

### **7.4 guataKnowledgeBaseService**

**Arquivo**: `src/services/ai/guataKnowledgeBaseService.ts`

**Responsabilidades**:
- Consulta à base de conhecimento
- Busca por similaridade
- Normalização de perguntas
- Gerenciamento de entradas

**Métodos Principais**:
- `searchKnowledgeBase()`: Busca na KB
- `normalizeQuestion()`: Normaliza pergunta
- `calculateSimilarity()`: Calcula similaridade
- `addToKnowledgeBase()`: Adiciona entrada

### **7.5 guataMLService**

**Arquivo**: `src/services/ai/ml/guataMLService.ts`

**Responsabilidades**:
- Machine Learning e aprendizado
- Personalização de respostas
- Processamento de feedback
- Análise de padrões

**Métodos Principais**:
- `personalizeResponse()`: Personaliza resposta
- `learnFromInteraction()`: Aprende de interação
- `learnFromFeedback()`: Aprende de feedback

### **7.6 guataPartnersService**

**Arquivo**: `src/services/ai/guataPartnersService.ts`

**Responsabilidades**:
- Gerenciamento de parceiros
- Priorização de parceiros oficiais
- Integração com base de dados

---

## 📚 8. BASE DE CONHECIMENTO {#base-conhecimento}

### **8.1 Estrutura da Base de Conhecimento**

A base de conhecimento é armazenada na tabela `guata_knowledge_base` no Supabase.

**Campos**:
- `id`: UUID único
- `pergunta`: Pergunta original
- `pergunta_normalizada`: Pergunta normalizada (sem acentos, lowercase)
- `resposta`: Resposta curada
- `tipo`: Tipo (conceito, local, pessoa, evento, geral)
- `tags`: Array de tags
- `fonte`: Fonte (manual, gemini, web)
- `ativo`: Se está ativo
- `ultima_atualizacao`: Timestamp de atualização
- `criado_em`: Timestamp de criação
- `usado_por`: Contador de uso

### **8.2 Processo de Busca**

1. **Match Exato** (Primeiro)
   - Busca por `pergunta_normalizada` exata
   - Mais rápido e preciso

2. **Busca por Similaridade** (Segundo)
   - Calcula similaridade com todas as entradas
   - Threshold mínimo: 0.75 (75%)
   - Retorna melhor match

3. **Incremento de Uso**
   - Incrementa contador `usado_por`
   - RPC function `increment_guata_kb_usage()`

### **8.3 Normalização de Perguntas**

A normalização remove:
- Acentos
- Pontuação
- Espaços extras
- Converte para lowercase

**Exemplo**:
```
"O que é o Pantanal?" 
→ "o que e o pantanal"
```

### **8.4 Tipos de Conhecimento**

- **conceito**: Conceitos gerais (ex: "O que é o Pantanal?")
- **local**: Lugares específicos (ex: "Bioparque Pantanal")
- **pessoa**: Pessoas importantes (ex: "Tia Eva")
- **evento**: Eventos e festivais
- **geral**: Outros tipos

### **8.5 População da Base**

A base pode ser populada:
- **Manual**: Via admin panel (futuro)
- **Automática**: Via Gemini ou web search (futuro)
- **Script SQL**: `scripts/populate-knowledge-base.sql`

---

## 💾 9. BANCO DE DADOS {#banco-dados}

### **9.1 Tabelas Principais**

#### **guata_knowledge_base**
Armazena base de conhecimento persistente.

**Migration**: `supabase/migrations/20250204000000_create_guata_knowledge_base.sql`

**Índices**:
- `idx_guata_kb_pergunta_normalizada`: Busca rápida por pergunta
- `idx_guata_kb_tipo`: Filtro por tipo
- `idx_guata_kb_ativo`: Filtro de ativos
- `idx_guata_kb_tags`: Busca por tags (GIN index)

**Funções**:
- `update_guata_kb_timestamp()`: Atualiza timestamp
- `increment_guata_kb_usage()`: Incrementa contador

**Políticas RLS**:
- Leitura pública para entradas ativas
- Inserção/atualização para usuários autenticados

#### **guata_feedback** (Futuro)
Armazenará feedback dos usuários.

**Campos planejados**:
- `id`: UUID
- `session_id`: ID da sessão
- `question`: Pergunta do usuário
- `answer`: Resposta do Guatá
- `rating`: Positivo/negativo
- `correction`: Correção do usuário (opcional)
- `timestamp`: Data/hora

### **9.2 Relacionamentos**

- **guata_knowledge_base** ↔ **guata_feedback** (futuro)
  - Feedback pode melhorar entradas da KB

---

## ⚡ 10. EDGE FUNCTIONS (SUPABASE) {#edge-functions}

### **10.1 guata-ai**

**Arquivo**: `supabase/functions/guata-ai/index.ts`

**Função**: Processamento de IA via Gemini

**Responsabilidades**:
- Chamada ao Gemini AI
- Aplicação de prompts e persona
- Políticas de veracidade
- Validação de respostas

**Input**:
```json
{
  "prompt": "Pergunta do usuário",
  "knowledgeBase": [...],
  "userContext": "...",
  "chatHistory": "...",
  "mode": "tourist"
}
```

**Output**:
```json
{
  "response": "Resposta do Guatá",
  "confidence": 0.95,
  "sources": [...]
}
```

### **10.2 guata-web-rag**

**Arquivo**: `supabase/functions/guata-web-rag/index.ts`

**Função**: Retrieval Augmented Generation (RAG)

**Responsabilidades**:
- Busca web com Google Custom Search
- RAG com FTS/embeddings
- Ranking de resultados
- Cache e rate limiting
- Extração de contexto

**Input**:
```json
{
  "question": "Pergunta do usuário",
  "state_code": "MS",
  "max_results": 5,
  "include_sources": true
}
```

**Output**:
```json
{
  "answer": "Resposta baseada em RAG",
  "sources": [...],
  "confidence": 0.9,
  "context": "..."
}
```

### **10.3 guata-feedback**

**Arquivo**: `supabase/functions/guata-feedback/index.ts`

**Função**: Persistência de feedback

**Responsabilidades**:
- Registro de 👍/👎
- Correções do usuário
- Metadados de conversa
- Telemetria

**Input**:
```json
{
  "session_id": "...",
  "question": "...",
  "answer": "...",
  "positive": true
}
```

---

## 🧠 11. MACHINE LEARNING E APRENDIZADO {#machine-learning}

### **11.1 Sistema de Aprendizado**

O Guatá aprende de duas formas:

1. **Aprendizado de Interação**
   - Analisa perguntas e respostas
   - Identifica padrões
   - Melhora personalização

2. **Aprendizado de Feedback**
   - Processa 👍/👎
   - Aprende com correções
   - Melhora respostas futuras

### **11.2 Personalização**

O sistema personaliza respostas baseado em:
- **Histórico de conversa**: Contexto anterior
- **Preferências do usuário**: Interesses detectados
- **Padrões de comportamento**: Tipo de perguntas

### **11.3 Insights de Aprendizado**

Cada interação gera insights:
- Tipo de pergunta
- Intenção do usuário
- Padrão de comportamento
- Fluxo de conversa
- Precisão preditiva

### **11.4 Melhorias Adaptativas**

O sistema identifica melhorias:
- Gaps na base de conhecimento
- Necessidade de mais dados
- Melhorias em prompts
- Otimizações de busca

---

## ⚙️ 12. CONFIGURAÇÕES E VARIÁVEIS DE AMBIENTE {#configurações}

### **12.1 Variáveis de Ambiente (Frontend)**

**Arquivo**: `.env` ou `.env.local`

```bash
# Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon

# Gemini AI
VITE_GEMINI_API_KEY=sua-chave-gemini

# Google Search
VITE_GOOGLE_SEARCH_API_KEY=sua-chave-google-search
VITE_GOOGLE_SEARCH_ENGINE_ID=seu-engine-id
```

### **12.2 Secrets (Supabase Edge Functions)**

Configurados via CLI:

```bash
supabase secrets set \
  GEMINI_API_KEY=... \
  GOOGLE_CSE_ID=... \
  GOOGLE_API_KEY=... \
  SUPABASE_SERVICE_ROLE_KEY=... \
  SUPABASE_URL=... \
  RATE_LIMIT_PER_MIN=10 \
  DAILY_BUDGET_CALLS=500 \
  CACHE_TTL=600000 \
  EVENT_CACHE_TTL=300000
```

### **12.3 Configurações de Rate Limiting**

**Gemini Service**:
- Global: 8 requisições/minuto
- Por usuário: 2 requisições/minuto
- Janela: 60 segundos

**Web Search Service**:
- Configurável via variáveis de ambiente
- Cache para reduzir chamadas

### **12.4 Configurações de Cache**

**Gemini Service**:
- Cache compartilhado: 24 horas
- Cache comum: 48 horas
- Similaridade mínima: 0.75 (75%)

**Web Search Service**:
- Cache geral: 10 minutos
- Cache de eventos: 5 minutos

---

## 👍 13. SISTEMA DE FEEDBACK {#feedback}

### **13.1 Tipos de Feedback**

1. **Feedback Positivo (👍)**
   - Usuário gostou da resposta
   - Registrado para aprendizado
   - Melhora confiança da resposta

2. **Feedback Negativo (👎)**
   - Usuário não gostou da resposta
   - Pode incluir correção
   - Usado para melhorar sistema

### **13.2 Processamento de Feedback**

1. **Registro**
   - Salva feedback no banco
   - Associa com pergunta/resposta
   - Inclui metadados

2. **Aprendizado**
   - `guataMLService.learnFromFeedback()`
   - Analisa padrões
   - Melhora respostas futuras

3. **Atualização**
   - Atualiza base de conhecimento
   - Ajusta confiança
   - Melhora ranking

### **13.3 Telemetria**

O sistema coleta:
- Perguntas frequentes
- Respostas mais/menos úteis
- Padrões de uso
- Gaps na base de conhecimento

---

## ✅ 14. POLÍTICAS DE VERACIDADE {#veracidade}

### **14.1 Regra de Ouro**

**"Sem fonte confiável, sem resposta direta"**

### **14.2 Políticas Implementadas**

1. **Sem Fonte Confiável**
   - Não inventa informações
   - Pede mais detalhes
   - Sugere reformular pergunta

2. **Datas Conflitantes**
   - Identifica conflitos
   - Pede confirmação temporal
   - Usa fonte mais recente

3. **Informações Antigas**
   - Detecta dados desatualizados
   - Busca informações atualizadas
   - Avisa sobre possível desatualização

4. **Não Exibir Fontes no Chat**
   - Fontes apenas em telemetria
   - Interface limpa
   - Foco na resposta

### **14.3 Verificação de Fontes**

O sistema verifica:
- Domínios oficiais (Prefeitura, SECTUR)
- Plataformas oficiais
- Jornais locais
- Consenso entre fontes

---

## 🚦 15. RATE LIMITING E CACHE {#rate-limiting}

### **15.1 Rate Limiting**

**Gemini Service**:
- **Global**: 8 req/min (margem de segurança)
- **Por usuário**: 2 req/min
- **Janela**: 60 segundos

**Web Search Service**:
- Configurável via variáveis
- Cache reduz chamadas reais

### **15.2 Sistema de Cache**

**Cache Híbrido**:
- **Compartilhado**: Perguntas comuns entre usuários
- **Individual**: Personalizado por usuário/sessão

**Duração**:
- **Comum**: 24 horas
- **Muito comum**: 48 horas
- **Eventos**: 5 minutos
- **Geral**: 10 minutos

**Similaridade**:
- Threshold: 0.75 (75%)
- Reutiliza respostas similares

### **15.3 Otimizações**

- Cache reduz chamadas à API
- Rate limiting protege quotas
- Processamento em background
- Fallback inteligente

---

## 🎨 16. INTERFACE DO USUÁRIO {#interface}

### **16.1 Design**

- **Estilo**: Minimalista e limpo
- **Cores**: Gradiente azul-verde (MS)
- **Tipografia**: Legível e acessível
- **Layout**: Responsivo (mobile-first)

### **16.2 Componentes Visuais**

1. **Header**
   - Perfil do Guatá
   - Status de conexão
   - Botão limpar conversa

2. **Mensagens**
   - Bolhas de chat
   - Avatar do Guatá
   - Timestamp
   - Botões de feedback (👍/👎)

3. **Input**
   - Campo de texto
   - Botão de envio
   - Indicador de digitação
   - Suporte a Enter

4. **Sugestões**
   - Perguntas sugeridas
   - Clique para enviar

### **16.3 Experiência do Usuário**

- **Feedback Visual**: Indicadores de carregamento
- **Responsividade**: Funciona em todos os dispositivos
- **Acessibilidade**: Suporte a leitores de tela
- **Performance**: Carregamento rápido

---

## 📊 17. MÉTRICAS E MONITORAMENTO

### **17.1 Métricas Coletadas**

- Tempo de processamento
- Taxa de sucesso
- Uso de fontes
- Feedback dos usuários
- Perguntas frequentes
- Gaps na base de conhecimento

### **17.2 Logs**

O sistema gera logs detalhados:
- Processamento de perguntas
- Chamadas de API
- Erros e exceções
- Performance

---

## 🔮 18. PRÓXIMOS PASSOS E MELHORIAS

### **18.1 Melhorias Planejadas**

1. **Admin Panel**
   - Gerenciamento de Knowledge Base
   - Visualização de feedback
   - Análise de métricas

2. **Melhorias de IA**
   - Fine-tuning do modelo
   - Melhor compreensão de contexto
   - Respostas mais naturais

3. **Integrações**
   - Mais APIs de turismo
   - Integração com booking
   - Suporte a múltiplos idiomas

4. **Recursos Avançados**
   - Gravação de áudio
   - Reconhecimento de voz
   - Respostas em áudio

### **18.2 Otimizações**

- Melhor cache
- Redução de latência
- Otimização de custos
- Escalabilidade

---

## 📝 19. CONCLUSÃO

O **Guatá** é um chatbot inteligente e completo, desenvolvido especificamente para turismo em Mato Grosso do Sul. Ele combina:

- ✅ **IA Avançada**: Gemini AI para respostas inteligentes
- ✅ **Pesquisa Web**: Dados atualizados em tempo real
- ✅ **Base de Conhecimento**: Respostas curadas e verificadas
- ✅ **Machine Learning**: Aprendizado contínuo
- ✅ **Personalidade**: Tom caloroso e autêntico
- ✅ **Veracidade**: Políticas rigorosas de verificação

O sistema é robusto, escalável e está em constante evolução, aprendendo com cada interação para oferecer a melhor experiência possível aos usuários.

---

## 📚 20. REFERÊNCIAS E DOCUMENTAÇÃO

### **Documentos Relacionados**

- `docs/descubra-ms/GUATA_ARQUITETURA_E_ESTRUTURA.md`: Documento mestre
- `ANALISE_COMPLETA_GUATA.md`: Análise funcional
- `docs/historico/GUATA_SISTEMA_COMPLETO.md`: Histórico técnico

### **Arquivos Principais**

- `src/services/ai/guataIntelligentTourismService.ts`: Serviço principal
- `src/pages/ChatGuata.tsx`: Página principal
- `supabase/migrations/20250204000000_create_guata_knowledge_base.sql`: Migration KB

---

**Última atualização**: Janeiro 2025
**Versão**: 1.0
**Autor**: Sistema Descubra MS

