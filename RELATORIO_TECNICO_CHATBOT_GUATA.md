# RELATÓRIO TÉCNICO - CHATBOT GUATÁ

## ÍNDICE

1. Visão Geral do Sistema
2. Arquitetura e Configuração
3. Componentes e Estrutura de Arquivos
4. Fluxo de Processamento
5. Configurações e Variáveis de Ambiente
6. Integrações e APIs
7. Base de Dados
8. Edge Functions
9. Sistema de Cache e Rate Limiting
10. Machine Learning e Aprendizado

---

## 1. VISÃO GERAL DO SISTEMA

O Guatá é um chatbot de turismo desenvolvido para Mato Grosso do Sul, com foco em Campo Grande. O sistema funciona como um guia virtual que fornece informações sobre destinos, hospedagem, gastronomia, eventos e roteiros turísticos.

### Objetivos Funcionais

- Fornecer informações atualizadas sobre turismo em MS
- Responder perguntas sobre destinos, serviços e atrações
- Personalizar respostas baseado em histórico de conversa
- Aprender com interações e feedback dos usuários
- Integrar múltiplas fontes de dados para respostas precisas

### Características Técnicas

- Pesquisa web em tempo real via Google Custom Search API
- Base de conhecimento persistente no Supabase
- Processamento de linguagem natural via Google Gemini AI
- Sistema de cache para otimização de performance
- Rate limiting para controle de uso de APIs
- Machine Learning para personalização de respostas

---

## 2. ARQUITETURA E CONFIGURAÇÃO

### 2.1 Arquitetura em Camadas

O sistema é dividido em quatro camadas principais:

**Camada de Apresentação (Frontend)**
- React 18 com TypeScript
- Componentes em src/components/guata/
- Páginas em src/pages/
- Hooks customizados em src/hooks/

**Camada de Serviços (Client-side)**
- Serviços em src/services/ai/
- Orquestração de lógica de negócio
- Integração com APIs externas

**Camada de Backend (Supabase)**
- Edge Functions serverless
- Banco de dados PostgreSQL
- Row Level Security para segurança

**Camada de Integração (APIs Externas)**
- Google Gemini AI
- Google Custom Search API
- Google Places API (opcional)

### 2.2 Estrutura de Diretórios

```
src/
├── pages/
│   ├── ChatGuata.tsx          # Página principal do chatbot
│   └── Guata.tsx               # Versão alternativa
├── components/guata/
│   ├── GuataChat.tsx           # Container principal
│   ├── GuataProfile.tsx        # Perfil e status
│   ├── ChatMessages.tsx        # Renderização de mensagens
│   ├── ChatInput.tsx            # Input de mensagens
│   └── SuggestionQuestions.tsx # Perguntas sugeridas
├── hooks/
│   ├── useGuataConversation.ts # Lógica de conversa
│   ├── useGuataConnection.ts   # Verificação de conexão
│   └── useGuataInput.ts        # Gerenciamento de input
└── services/ai/
    ├── guataIntelligentTourismService.ts  # Orquestrador principal
    ├── guataGeminiService.ts              # Integração Gemini
    ├── guataRealWebSearchService.ts        # Pesquisa web
    ├── guataKnowledgeBaseService.ts        # Base de conhecimento
    ├── guataMLService.ts                   # Machine Learning
    ├── guataPartnersService.ts             # Parceiros
    └── guataTrueApiService.ts             # API unificada

supabase/
├── functions/
│   ├── guata-ai/              # Edge Function para IA
│   ├── guata-web-rag/         # Edge Function para RAG
│   └── guata-feedback/        # Edge Function para feedback
└── migrations/
    └── 20250204000000_create_guata_knowledge_base.sql
```

---

## 3. COMPONENTES E ESTRUTURA DE ARQUIVOS

### 3.1 Página Principal

**Arquivo**: src/pages/ChatGuata.tsx

**Responsabilidades**:
- Gerenciamento de estado global da conversa
- Integração de componentes de UI
- Processamento de mensagens do usuário
- Gerenciamento de feedback e aprendizado
- Coordenação com serviços de IA

**Estados Principais**:
- mensagens: Array de mensagens da conversa
- isLoading: Estado de carregamento
- conversationHistory: Histórico de conversação
- userPreferences: Preferências do usuário
- learningInsights: Insights de aprendizado

**Fluxo de Execução**:
1. Inicialização com mensagem de boas-vindas
2. Captura de input do usuário
3. Chamada ao serviço de processamento
4. Atualização da interface com resposta
5. Processamento de feedback em background

### 3.2 Serviço Principal de Orquestração

**Arquivo**: src/services/ai/guataIntelligentTourismService.ts

**Classe**: GuataIntelligentTourismService

**Método Principal**: processQuestion()

**Fluxo de Processamento**:
1. Validação e normalização da pergunta
2. Detecção de tipo de pergunta (cumprimento, continuação, genérica)
3. Consulta à base de conhecimento (primeira prioridade)
4. Pesquisa web em tempo real (sempre executada)
5. Verificação de parceiros (quando aplicável)
6. Geração de resposta via Gemini AI ou formatação inteligente
7. Personalização com Machine Learning
8. Adição de personalidade e contexto
9. Retorno com metadados completos

**Métodos de Detecção**:
- isSimpleGreeting(): Detecta cumprimentos simples
- isContinuationQuestion(): Detecta perguntas de continuação
- detectPronounReference(): Detecta pronomes vagos e reescreve
- detectImplicitReference(): Detecta referências implícitas
- needsClarification(): Verifica necessidade de esclarecimento
- detectCityOnlyResponse(): Combina cidade com contexto anterior

**Categorização de Perguntas**:
- hotels: Hotéis e hospedagem
- events: Eventos e festivais
- restaurants: Restaurantes e gastronomia
- attractions: Atrações e pontos turísticos
- general: Perguntas gerais

### 3.3 Serviço de Integração Gemini

**Arquivo**: src/services/ai/guataGeminiService.ts

**Classe**: GuataGeminiService

**Configuração**:
- API Key: VITE_GEMINI_API_KEY (variável de ambiente)
- Modelo: Google Generative AI
- Rate Limiting: 8 req/min global, 2 req/min por usuário
- Cache: 24h para comum, 48h para muito comum
- Similaridade mínima: 0.75 (75%)

**Sistema de Cache**:
- Cache compartilhado: Perguntas comuns entre usuários
- Cache individual: Personalizado por usuário/sessão
- Processamento em background para otimização

**Método Principal**: processQuestion()

**Parâmetros de Entrada**:
- question: Pergunta do usuário
- context: Contexto adicional
- userLocation: Localização do usuário
- conversationHistory: Histórico de conversa
- searchResults: Resultados de pesquisa web
- isTotemVersion: Flag para versão totem
- isFirstUserMessage: Flag para primeira mensagem

**Parâmetros de Saída**:
- answer: Resposta gerada
- confidence: Nível de confiança (0-1)
- processingTime: Tempo de processamento em ms
- usedGemini: Se utilizou Gemini ou fallback
- personality: Personalidade aplicada
- emotionalState: Estado emocional detectado

### 3.4 Serviço de Pesquisa Web

**Arquivo**: src/services/ai/guataRealWebSearchService.ts

**Classe**: GuataRealWebSearchService

**Configuração**:
- API Key: VITE_GOOGLE_SEARCH_API_KEY
- Engine ID: VITE_GOOGLE_SEARCH_ENGINE_ID (padrão: a3641e1665f7b4909)
- Máximo de resultados: 5 por padrão

**Método Principal**: searchRealTime()

**Funcionalidades**:
- Busca via Google Custom Search API
- Extração de dados de turismo (hotéis, eventos, restaurantes)
- Cache de resultados para otimização
- Fallback para busca alternativa quando necessário

**Estrutura de Resposta**:
- results: Array de resultados da busca
- tourismData: Dados estruturados de turismo
- confidence: Nível de confiança
- sources: Fontes utilizadas
- processingTime: Tempo de processamento
- usedRealSearch: Se utilizou busca real ou fallback
- searchMethod: Método utilizado (google, serpapi, tourism_apis, hybrid)

### 3.5 Serviço de Base de Conhecimento

**Arquivo**: src/services/ai/guataKnowledgeBaseService.ts

**Classe**: GuataKnowledgeBaseService

**Tabela**: guata_knowledge_base (Supabase)

**Método Principal**: searchKnowledgeBase()

**Processo de Busca**:
1. Normalização da pergunta (remove acentos, pontuação, lowercase)
2. Busca por match exato na coluna pergunta_normalizada
3. Se não encontrado, busca por similaridade (threshold 0.75)
4. Incrementa contador de uso via RPC function
5. Retorna resposta com confiança e fonte

**Estrutura de Dados**:
- id: UUID único
- pergunta: Pergunta original
- pergunta_normalizada: Versão normalizada para busca
- resposta: Resposta curada
- tipo: conceito, local, pessoa, evento, geral
- tags: Array de tags para categorização
- fonte: manual, gemini, web
- ativo: Boolean para ativação/desativação
- ultima_atualizacao: Timestamp de atualização
- criado_em: Timestamp de criação
- usado_por: Contador de uso

**Métodos Auxiliares**:
- normalizeQuestion(): Normaliza pergunta para busca
- calculateSimilarity(): Calcula similaridade entre strings
- incrementUsage(): Incrementa contador de uso
- addToKnowledgeBase(): Adiciona nova entrada
- getAllEntries(): Lista todas as entradas ativas

### 3.6 Serviço de Machine Learning

**Arquivo**: src/services/ai/ml/guataMLService.ts

**Classe**: GuataMLService

**Funcionalidades**:
- Personalização de respostas baseada em histórico
- Aprendizado de interações
- Processamento de feedback (positivo/negativo)
- Análise de padrões de comportamento
- Identificação de preferências do usuário

**Métodos Principais**:
- personalizeResponse(): Personaliza resposta para usuário
- learnFromInteraction(): Aprende de interação
- learnFromFeedback(): Aprende de feedback

---

## 4. FLUXO DE PROCESSAMENTO

### 4.1 Fluxo Completo de Requisição

```
1. Usuário envia pergunta
   ↓
2. ChatGuata.tsx captura input
   ↓
3. guataIntelligentTourismService.processQuestion()
   ↓
4. Detecção inteligente de tipo de pergunta
   ├─ Cumprimento simples → Resposta de boas-vindas
   ├─ Continuação → Usa contexto anterior
   ├─ Pronome vago → Reescreve com contexto
   ├─ Genérica → Pede esclarecimento
   └─ Normal → Continua fluxo
   ↓
5. Consulta Knowledge Base (prioridade 1)
   ├─ Match exato encontrado → Retorna resposta (confiança 0.95)
   └─ Não encontrado → Continua fluxo
   ↓
6. Pesquisa Web (sempre executada)
   ├─ guataRealWebSearchService.searchRealTime()
   ├─ Google Custom Search API
   ├─ Extração de dados de turismo
   └─ Cache de resultados
   ↓
7. Verificação de Parceiros (quando aplicável)
   ├─ Detecta perguntas sobre serviços
   ├─ Busca parceiros na base de dados
   └─ Prioriza parceiros oficiais
   ↓
8. Geração de Resposta
   ├─ Prioridade 1: Parceiros (se houver)
   ├─ Prioridade 2: Gemini + Web Search + Parceiros
   ├─ Prioridade 3: Formatação inteligente de web search
   └─ Prioridade 4: Conhecimento local hardcoded
   ↓
9. Personalização com ML
   ├─ guataMLService.personalizeResponse()
   ├─ Adaptação baseada em histórico
   └─ Aplicação de preferências do usuário
   ↓
10. Adição de Personalidade
    ├─ Tom caloroso e natural
    ├─ Convite à visitação
    └─ Pergunta de seguimento
    ↓
11. Retorno para Frontend
    ├─ Resposta formatada
    ├─ Metadados (fontes, confiança, tempo)
    └─ Insights de aprendizado
    ↓
12. Aprendizado em Background
    ├─ guataMLService.learnFromInteraction()
    └─ Atualização de memória e preferências
```

### 4.2 Sistema de Priorização de Respostas

**Nível 1 - Knowledge Base**
- Respostas curadas e verificadas
- Confiança: 0.95
- Tempo de resposta: Instantâneo
- Fonte: Base de dados persistente

**Nível 2 - Parceiros Oficiais**
- Parceiros da plataforma Descubra MS
- Prioridade em recomendações
- Informações verificadas
- Integração com base de dados

**Nível 3 - Gemini AI + Web Search**
- IA com dados atualizados da web
- Respostas dinâmicas e contextuais
- Alta qualidade e relevância
- Combinação de múltiplas fontes

**Nível 4 - Web Search Formatado**
- Dados da pesquisa web formatados
- Respostas conversacionais
- Informações atualizadas
- Fallback quando Gemini não disponível

**Nível 5 - Conhecimento Local**
- Base de conhecimento hardcoded
- Fallback seguro
- Sempre disponível
- Informações gerais sobre MS

### 4.3 Detecção Inteligente de Contexto

**Cumprimentos Simples**
- Padrões: "oi", "olá", "bom dia", "boa tarde", "boa noite"
- Limite de caracteres: 20
- Ação: Resposta de boas-vindas personalizada
- Não processa se contém palavras de pergunta

**Perguntas de Continuação**
- Padrões: "sim", "ok", "pode", "claro", "quero"
- Limite de caracteres: 20
- Ação: Usa contexto da última pergunta do histórico
- Detecta palavras-chave: roteiro, montar, fazer, visitar

**Pronomes Vagos**
- Padrões: "ela", "ele", "isso", "lá", "esse lugar", "essa cidade"
- Limite de caracteres: 120
- Ação: Reescreve pergunta substituindo pronome por sujeito da pergunta anterior
- Extrai sujeito via regex: "quem é X", "quem foi X"

**Perguntas Ambíguas**
- Padrões: "qual o nome do presidente?" (sem contexto)
- Limite de caracteres: 80
- Ação: Usa foco da conversa anterior para reescrever
- Detecta entidades na resposta anterior

**Perguntas Genéricas**
- Padrões: "onde comer em MS?", "melhor hotel em MS?"
- Ação: Pede esclarecimento sobre cidade específica
- Lista de cidades conhecidas: Campo Grande, Bonito, Corumbá, etc.

**Respostas Apenas com Cidade**
- Detecta: Resposta curta (1-3 palavras) que é apenas nome de cidade
- Ação: Combina com pergunta anterior genérica
- Extrai tipo de serviço: restaurantes, hotéis, passeios, roteiros

---

## 5. CONFIGURAÇÕES E VARIÁVEIS DE AMBIENTE

### 5.1 Variáveis de Ambiente Frontend

**Arquivo**: .env ou .env.local

**Variáveis Obrigatórias**:
```
VITE_SUPABASE_URL=https://hvtrpkbjgbuypkskqcqm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_GEMINI_API_KEY=sua-chave-gemini-aqui
```

**Variáveis Opcionais**:
```
VITE_GOOGLE_SEARCH_API_KEY=sua-chave-google-search
VITE_GOOGLE_SEARCH_ENGINE_ID=a3641e1665f7b4909
```

### 5.2 Configurações do Supabase

**URL do Projeto**: https://hvtrpkbjgbuypkskqcqm.supabase.co

**Edge Functions Secrets** (configurados via CLI):
```
GEMINI_API_KEY=...
GOOGLE_CSE_ID=...
GOOGLE_API_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_URL=...
RATE_LIMIT_PER_MIN=10
DAILY_BUDGET_CALLS=500
CACHE_TTL=600000
EVENT_CACHE_TTL=300000
```

**Comando de Configuração**:
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

### 5.3 Configurações de Rate Limiting

**Gemini Service**:
- Limite global: 8 requisições por minuto
- Limite por usuário: 2 requisições por minuto
- Janela de tempo: 60 segundos
- Reset automático após janela

**Web Search Service**:
- Configurável via variáveis de ambiente
- Cache reduz chamadas reais à API
- TTL configurável por tipo de conteúdo

### 5.4 Configurações de Cache

**Gemini Service**:
- Cache compartilhado: 24 horas (perguntas comuns)
- Cache muito comum: 48 horas
- Cache individual: Por usuário/sessão
- Threshold de similaridade: 0.75 (75%)

**Web Search Service**:
- Cache geral: 10 minutos (600000 ms)
- Cache de eventos: 5 minutos (300000 ms)
- Cache por tipo de conteúdo

**Knowledge Base**:
- Sem cache (consulta direta ao banco)
- Índices otimizados para performance
- Busca por match exato (mais rápido)
- Busca por similaridade (quando necessário)

### 5.5 Configurações de Timeout

**Request Timeout**: 30 segundos (30000 ms)
**API Timeout**: Configurável por serviço
**Fallback Timeout**: 5 segundos

---

## 6. INTEGRAÇÕES E APIs

### 6.1 Google Gemini AI

**Serviço**: Google Generative AI
**Versão**: Mais recente disponível
**Uso**: Geração de respostas com IA
**Configuração**: Via VITE_GEMINI_API_KEY

**Funcionalidades**:
- Processamento de linguagem natural
- Geração de respostas contextuais
- Compreensão de histórico de conversa
- Personalização de respostas

**Limitações**:
- Rate limiting: 8 req/min global, 2 req/min por usuário
- Cache para otimização
- Fallback quando indisponível

### 6.2 Google Custom Search API

**Serviço**: Google Custom Search Engine
**Engine ID**: a3641e1665f7b4909 (padrão)
**Configuração**: Via VITE_GOOGLE_SEARCH_API_KEY e VITE_GOOGLE_SEARCH_ENGINE_ID

**Funcionalidades**:
- Busca web em tempo real
- Extração de dados de turismo
- Ranking de resultados
- Cache de resultados

**Limitações**:
- 100 requisições gratuitas por dia
- Cache para reduzir chamadas
- Fallback para busca alternativa

### 6.3 Google Places API

**Serviço**: Google Places (opcional)
**Uso**: Endereços e horários de estabelecimentos
**Configuração**: Via variáveis de ambiente

**Funcionalidades**:
- Busca de lugares específicos
- Informações de endereço
- Horários de funcionamento
- Avaliações e classificações

### 6.4 Supabase

**Serviço**: Backend-as-a-Service
**Banco de Dados**: PostgreSQL
**Edge Functions**: Serverless functions

**Funcionalidades**:
- Armazenamento de base de conhecimento
- Processamento serverless
- Autenticação e segurança
- Real-time updates

---

## 7. BASE DE DADOS

### 7.1 Tabela: guata_knowledge_base

**Migration**: supabase/migrations/20250204000000_create_guata_knowledge_base.sql

**Estrutura**:
```sql
CREATE TABLE guata_knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pergunta TEXT NOT NULL,
    pergunta_normalizada TEXT NOT NULL,
    resposta TEXT NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'geral' 
        CHECK (tipo IN ('conceito', 'local', 'pessoa', 'evento', 'geral')),
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    fonte TEXT NOT NULL DEFAULT 'manual' 
        CHECK (fonte IN ('manual', 'gemini', 'web')),
    ativo BOOLEAN NOT NULL DEFAULT true,
    ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    usado_por INTEGER DEFAULT 0
);
```

**Índices**:
- idx_guata_kb_pergunta_normalizada: Busca rápida por pergunta normalizada
- idx_guata_kb_tipo: Filtro por tipo
- idx_guata_kb_ativo: Filtro de entradas ativas (partial index)
- idx_guata_kb_tags: Busca por tags (GIN index)

**Funções**:
- update_guata_kb_timestamp(): Atualiza timestamp automaticamente
- increment_guata_kb_usage(kb_id UUID): Incrementa contador de uso

**Políticas RLS**:
- SELECT: Público pode ler entradas ativas
- INSERT: Apenas usuários autenticados
- UPDATE: Apenas usuários autenticados
- DELETE: Apenas usuários autenticados

**Triggers**:
- trigger_update_guata_kb_timestamp: Atualiza ultima_atualizacao antes de UPDATE

### 7.2 População da Base

**Métodos**:
- Manual: Via admin panel (futuro)
- Script SQL: scripts/populate-knowledge-base.sql
- Automática: Via Gemini ou web search (futuro)

**Tipos de Conhecimento**:
- conceito: Conceitos gerais sobre MS
- local: Lugares específicos (Bioparque, Pantanal, etc.)
- pessoa: Pessoas importantes (Tia Eva, etc.)
- evento: Eventos e festivais
- geral: Outros tipos

---

## 8. EDGE FUNCTIONS

### 8.1 guata-ai

**Arquivo**: supabase/functions/guata-ai/index.ts

**Função**: Processamento de IA via Gemini

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

**Responsabilidades**:
- Chamada ao Gemini AI
- Aplicação de prompts e persona
- Políticas de veracidade
- Validação de respostas

### 8.2 guata-web-rag

**Arquivo**: supabase/functions/guata-web-rag/index.ts

**Função**: Retrieval Augmented Generation (RAG)

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

**Responsabilidades**:
- Busca web com Google Custom Search
- RAG com FTS/embeddings
- Ranking de resultados
- Cache e rate limiting
- Extração de contexto

### 8.3 guata-feedback

**Arquivo**: supabase/functions/guata-feedback/index.ts

**Função**: Persistência de feedback

**Input**:
```json
{
  "session_id": "...",
  "question": "...",
  "answer": "...",
  "positive": true
}
```

**Responsabilidades**:
- Registro de feedback positivo/negativo
- Correções do usuário
- Metadados de conversa
- Telemetria

---

## 9. SISTEMA DE CACHE E RATE LIMITING

### 9.1 Cache do Gemini Service

**Estratégia**: Cache híbrido (compartilhado + individual)

**Cache Compartilhado**:
- Duração: 24 horas
- Para: Perguntas comuns entre usuários
- Chave: Pergunta normalizada
- Similaridade mínima: 0.75

**Cache Individual**:
- Duração: 24 horas
- Para: Respostas personalizadas por usuário/sessão
- Chave: userId + sessionId + pergunta normalizada
- Inclui: Preferências do usuário

**Cache Muito Comum**:
- Duração: 48 horas
- Para: Perguntas extremamente frequentes
- Threshold: Baseado em contador de uso

### 9.2 Cache do Web Search Service

**Cache Geral**:
- Duração: 10 minutos (600000 ms)
- Para: Resultados de busca geral
- Chave: Query normalizada

**Cache de Eventos**:
- Duração: 5 minutos (300000 ms)
- Para: Informações sobre eventos
- Razão: Eventos mudam frequentemente

### 9.3 Rate Limiting

**Gemini Service**:
- Global: 8 requisições por minuto
- Por usuário: 2 requisições por minuto
- Janela: 60 segundos
- Reset: Automático após janela

**Web Search Service**:
- Configurável via variáveis de ambiente
- Cache reduz chamadas reais
- Fallback quando limite atingido

**Implementação**:
- Contador por janela de tempo
- Reset automático após expiração
- Queue para processamento em background
- Fallback inteligente quando limite atingido

---

## 10. MACHINE LEARNING E APRENDIZADO

### 10.1 Sistema de Aprendizado

**Aprendizado de Interação**:
- Analisa perguntas e respostas
- Identifica padrões de comportamento
- Melhora personalização de respostas
- Atualiza preferências do usuário

**Aprendizado de Feedback**:
- Processa feedback positivo/negativo
- Aprende com correções do usuário
- Melhora respostas futuras
- Identifica gaps na base de conhecimento

### 10.2 Personalização

**Fatores de Personalização**:
- Histórico de conversa: Contexto anterior
- Preferências do usuário: Interesses detectados
- Padrões de comportamento: Tipo de perguntas frequentes
- Localização: Cidade/região de interesse

**Métodos**:
- personalizeResponse(): Adapta resposta para usuário
- learnFromInteraction(): Aprende de interação
- learnFromFeedback(): Aprende de feedback

### 10.3 Insights de Aprendizado

**Dados Coletados**:
- Tipo de pergunta
- Intenção do usuário
- Padrão de comportamento
- Fluxo de conversa
- Precisão preditiva
- Taxa de sucesso

**Uso dos Insights**:
- Melhoria de respostas futuras
- Identificação de gaps na KB
- Otimização de prompts
- Melhoria de ranking de resultados

---

## CONCLUSÃO

O chatbot Guatá é um sistema completo e robusto para fornecimento de informações turísticas sobre Mato Grosso do Sul. O sistema combina múltiplas tecnologias e estratégias para garantir respostas precisas, atualizadas e personalizadas.

**Principais Características**:
- Arquitetura em camadas bem definida
- Múltiplas fontes de dados (KB, Web, APIs)
- Sistema de cache e rate limiting otimizado
- Machine Learning para personalização
- Base de conhecimento persistente
- Integração com APIs externas (Gemini, Google)

**Configuração Atual**:
- Frontend: React + TypeScript
- Backend: Supabase (PostgreSQL + Edge Functions)
- IA: Google Gemini AI
- Busca: Google Custom Search API
- Cache: Sistema híbrido otimizado
- Rate Limiting: 8 req/min global, 2 req/min por usuário

O sistema está em constante evolução, aprendendo com cada interação para melhorar a qualidade das respostas e a experiência do usuário.

---

**Última atualização**: Janeiro 2025
**Versão**: 1.0
**Sistema**: Descubra MS - Chatbot Guatá



