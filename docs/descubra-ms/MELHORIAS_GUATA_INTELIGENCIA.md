# Melhorias de Inteligência do Guatá - Implementação

## Resumo das Melhorias Implementadas

Este documento detalha as melhorias implementadas no sistema Guatá para torná-lo mais inteligente, contextual e preciso, baseado no feedback do usuário sobre respostas genéricas e informações inventadas.

## Problemas Identificados e Soluções

### 1. **Problema: Respostas Genéricas e Descontextualizadas**

**Antes:**
- "Você prefere explorar a natureza exuberante do Pantanal ou mergulhar na cultura local com uma visita ao Mercado Municipal?"
- Perguntas desconectadas do contexto da conversa

**Solução Implementada:**
- **Estrutura Inteligente por Tipo de Pergunta** no prompt
- **Detecção automática** do tipo de pergunta (roteiro, comparação, lugar específico, evento)
- **Perguntas contextuais** baseadas no histórico da conversa

### 2. **Problema: Informações Inventadas (ex: "Rio Taquari")**

**Antes:**
- "A Orla Morena pela sua vista do Rio Taquari" (Rio Taquari não existe em Campo Grande)

**Solução Implementada:**
- **Lista de proibições explícitas** no prompt
- **Validação de existência** via Google Places API
- **Priorização de dados reais** das APIs externas

### 3. **Problema: Falta de Estruturação em Roteiros**

**Antes:**
- Roteiros sem ponto de partida claro
- Estrutura confusa

**Solução Implementada:**
- **Sugestão obrigatória de ponto de partida**: "Você pode começar conhecendo [lugar específico]..."
- **Estruturação por períodos**: manhã, tarde, noite
- **Uso apenas de lugares confirmados** (LISTA BRANCA ou CONTEXTO)

## Melhorias Técnicas Implementadas

### 1. **Sistema de Prompts Inteligente**

**Arquivo:** `supabase/functions/guata-ai/prompts.ts`

```typescript
// Estrutura por tipo de pergunta
1. ROTEIROS: Sempre sugira ponto de partida + estruturação por períodos
2. COMPARAÇÕES: Foque na diferença prática entre opções
3. LUGARES ESPECÍFICOS: Verifique existência real no CONTEXTO
4. EVENTOS: Use apenas eventos com data válida

// Proibições explícitas
- Rio Taquari (não existe em Campo Grande)
- Lugares não confirmados no CONTEXTO
- Informações geográficas sem fonte
```

### 2. **Validação Geográfica Aprimorada**

**Arquivo:** `supabase/functions/guata-web-rag/index.ts`

```typescript
// Nova função de validação
async function validatePlaceExists(placeName: string, state_code: string): Promise<boolean>

// Melhor logging das APIs
console.log(`🔍 Places API: Buscando "${searchQuery}"`)
console.log(`🔍 Places API: Encontrados ${data.results.length} lugares`)
```

### 3. **Priorização de APIs Reais**

**Sistema de Ranking Atualizado:**
- **APIs reais**: +0.4 (máxima prioridade)
- **Embeddings**: +0.2
- **FTS local**: +0.15
- **PSE web**: +0.05 (menor prioridade)

### 4. **Busca PSE Otimizada**

**Melhorias:**
- **Multi-query expansion** com 6 queries paralelas
- **Priorização por fonte**: oficiais → Sympla/Eventbrite → jornais locais
- **Filtro temporal**: últimos 6 meses (`dateRestrict=m6`)
- **Logging detalhado** para debugging

### 5. **Geração de Resposta Contextual**

**Detecção Automática de Tipo:**
```typescript
const isRoteiro = /3 dias|o que fazer|roteiro|itinerário/i.test(question)
const isComparacao = /ou|vs|versus|melhor/i.test(question)
const isLugarEspecifico = /orla|parque|museu|bioparque|mercado/i.test(question)
const isEvento = /evento|show|agenda|programação/i.test(question)
```

## Resultados Esperados

### 1. **Respostas Mais Estruturadas**
- ✅ "Você pode começar conhecendo o Bioparque Pantanal..."
- ✅ Comparações focadas em diferenças práticas
- ✅ Validação de existência de lugares

### 2. **Informações Mais Precisas**
- ✅ Eliminação de "Rio Taquari" e outras informações inventadas
- ✅ Priorização de dados das APIs reais
- ✅ Validação geográfica via Google Places

### 3. **Perguntas Mais Contextuais**
- ✅ Baseadas no histórico da conversa
- ✅ Específicas para o tipo de pergunta
- ✅ Evitam opções genéricas desconectadas

### 4. **Melhor Uso das APIs**
- ✅ Google Places API para validação
- ✅ Google PSE para dados atualizados
- ✅ Priorização de fontes oficiais

## Configuração das APIs

### Variáveis de Ambiente Necessárias:
```bash
# Google Custom Search (PSE)
PSE_API_KEY=AIzaSyAc6aKloByf6sZfYh7CoIBg8kJF0WsNpA0
PSE_CX=[seu_search_engine_id]

# Google Places API
GOOGLE_PLACES_API_KEY=AIzaSyAc6aKloByf6sZfYh7CoIBg8kJF0WsNpA0

# OpenWeather API
OPENWEATHER_API_KEY=[sua_chave]

# Gemini API
GEMINI_API_KEY=[sua_chave]
```

## Monitoramento e Logs

### Logs Implementados:
- **PSE Queries**: Detalhamento de cada query executada
- **Places API**: Validação de existência de lugares
- **Ranking**: Priorização de fontes por tipo
- **Geração**: Detecção de tipo de pergunta

### Métricas de Qualidade:
- **Confiança das fontes**: APIs reais vs. web scraping
- **Validação geográfica**: Lugares confirmados vs. inventados
- **Contextualização**: Perguntas relevantes vs. genéricas

## Próximos Passos

1. **Teste das melhorias** com usuários reais
2. **Monitoramento** das métricas de qualidade
3. **Ajustes finos** baseados no feedback
4. **Expansão** para outras cidades de MS

## Arquivos Modificados

1. `supabase/functions/guata-ai/prompts.ts` - Sistema de prompts inteligente
2. `supabase/functions/guata-web-rag/index.ts` - Validação e priorização de APIs
3. `docs/MELHORIAS_GUATA_INTELIGENCIA.md` - Esta documentação

---

**Data da Implementação:** 20/09/2025  
**Status:** ✅ Implementado e Deployado  
**Próxima Revisão:** Após feedback dos usuários





