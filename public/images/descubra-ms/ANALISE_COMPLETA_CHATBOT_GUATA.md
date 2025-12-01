# 🦦 ANÁLISE COMPLETA DO CHATBOT GUATÁ

## 📋 ÍNDICE
1. [Visão Geral](#visão-geral)
2. [Arquitetura e Fluxo](#arquitetura-e-fluxo)
3. [Configuração e Serviços](#configuração-e-serviços)
4. [Funcionalidades Principais](#funcionalidades-principais)
5. [Exemplos de Respostas](#exemplos-de-respostas)
6. [Sistema de Validação](#sistema-de-validação)
7. [Integrações e APIs](#integrações-e-apis)

---

## 🎯 VISÃO GERAL

O **Guatá** é um chatbot de turismo inteligente para Mato Grosso do Sul, representado como uma capivara virtual. O nome "Guatá" vem do guarani e significa "caminhar", representando o esforço humano na busca pelo conhecimento.

### Personalidade
- **Nome**: Guatá
- **Espécie**: Capivara virtual
- **Papel**: Guia inteligente de turismo especializado em MS
- **Traços**: Conhecedor, prestativo, confiável, apaixonado por MS, curioso, amigável
- **Estilo**: Conversacional, natural e envolvente

---

## 🏗️ ARQUITETURA E FLUXO

### Fluxo de Processamento Completo

```
┌─────────────────────────────────────┐
│  Usuário pergunta no chat            │
│  (ChatGuata.tsx ou Guata.tsx)       │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  guataTrueApiService                │
│  (Ponto de entrada principal)       │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  guataIntelligentTourismService      │
│  (Coordena todo o processamento)    │
└──────────────┬──────────────────────┘
               ├─→ 1. Validação de escopo (tourismScopeValidator)
               ├─→ 2. Detecção de tipo de pergunta
               ├─→ 3. Consulta Knowledge Base (se disponível)
               ├─→ 4. Pesquisa Web Real (guataRealWebSearchService)
               ├─→ 5. Verificação de Parceiros (guataPartnersService)
               ├─→ 6. Geração de Resposta (guataGeminiService)
               └─→ 7. Personalização com ML (guataMLService)
               ↓
┌─────────────────────────────────────┐
│  Resposta formatada para usuário   │
└─────────────────────────────────────┘
```

### Versões do Chatbot

1. **`/chatguata`** - Versão Totem (tela cheia, standalone)
   - Não menciona "Descubra Mato Grosso do Sul"
   - Pode usar "Olá" após primeira mensagem
   - `isTotemVersion: true`

2. **`/descubramatogrossodosul/guata`** - Versão Website
   - Menciona a plataforma quando relevante
   - Não usa "Olá" após primeira mensagem (já teve boas-vindas)
   - `isTotemVersion: false`

---

## ⚙️ CONFIGURAÇÃO E SERVIÇOS

### 1. Serviço Principal: `guataTrueApiService`
**Arquivo**: `src/services/ai/guataTrueApiService.ts`

**Função**: Ponto de entrada principal que:
- Valida escopo de turismo
- Delega processamento para `guataIntelligentTourismService`
- Converte respostas para formato compatível
- Fornece fallback local em caso de erro

### 2. Serviço Inteligente: `guataIntelligentTourismService`
**Arquivo**: `src/services/ai/guataIntelligentTourismService.ts`

**Função**: Coordena todo o processamento inteligente

**Processamento**:
1. Validação de escopo de turismo
2. Detecção de cumprimentos simples
3. Detecção de perguntas de continuação
4. Detecção de respostas apenas com cidade
5. Detecção de pronomes vagos (reescreve com contexto)
6. Detecção de perguntas ambíguas
7. Verificação de necessidade de esclarecimento
8. Consulta Knowledge Base persistente
9. Detecção de categoria da pergunta
10. Pesquisa web real
11. Verificação de parceiros
12. Geração de resposta inteligente
13. Personalização com ML
14. Adição de personalidade e contexto

### 3. Serviço Gemini: `guataGeminiService`
**Arquivo**: `src/services/ai/guataGeminiService.ts`

**Função**: Gera respostas inteligentes usando Google Gemini AI

**Recursos**:
- Rate limiting: 8 req/min global, 2 req/min por usuário
- Cache compartilhado: 24h (perguntas comuns), 48h (muito comuns)
- Cache individual: 24h (personalizado por usuário)
- Cache semântico: 75% de similaridade para reutilizar
- Cache especial para sugestões: 3h (compartilhado), 5min (individual)
- Fallback inteligente quando API não disponível
- Suporte a múltiplos idiomas (detecção automática)
- Edge Function protegida (`guata-gemini-proxy`)

**Modelos tentados** (em ordem):
1. `gemini-2.0-flash-exp`
2. `models/gemini-2.0-flash-exp`
3. `gemini-2.0-flash-001`
4. `models/gemini-2.0-flash-001`
5. `gemini-1.5-flash-latest`
6. `models/gemini-1.5-flash-latest`
7. `gemini-1.5-pro-latest`
8. `models/gemini-1.5-pro-latest`

**Configuração**:
- Variável de ambiente: `VITE_GEMINI_API_KEY`
- Edge Function: `guata-gemini-proxy` (chaves protegidas no servidor)

### 4. Serviço de Pesquisa Web: `guataRealWebSearchService`
**Arquivo**: `src/services/ai/guataRealWebSearchService.ts`

**Função**: Busca informações reais na web

**APIs Usadas**:
1. **Google Custom Search API** (prioridade)
   - Rate limit: 100 requisições/dia (plano gratuito)
   - Cache: 30 minutos
   - Edge Function: `guata-google-search-proxy` (chaves protegidas)
   - Engine ID: `a3641e1665f7b4909` (hardcoded como fallback)

2. **SerpAPI** (fallback premium)
   - Usado quando Google Search falha
   - Variável: `VITE_SERPAPI_KEY`

**Configuração**:
- Variáveis de ambiente:
  - `VITE_GOOGLE_SEARCH_API_KEY`
  - `VITE_GOOGLE_SEARCH_ENGINE_ID` (opcional, usa hardcoded se não fornecido)
  - `VITE_SERPAPI_KEY` (opcional)

**Fallback**: Gera resultados locais baseados em conhecimento sobre MS quando APIs falham

### 5. Serviço de Parceiros: `guataPartnersService`
**Arquivo**: `src/services/ai/guataPartnersService.ts`

**Função**: Verifica parceiros oficiais da plataforma

**Fonte de Dados**: Tabela `institutional_partners` no Supabase
- Filtro: `status = 'approved'`
- Detecção por: segmento, cidade, nome
- Priorização: Estadual (9) > Regional (7) > Outros (5)

**Quando é usado**:
- Perguntas sobre hotéis, hospedagem
- Perguntas sobre restaurantes, comida, gastronomia
- Perguntas sobre passeios, tours, operadoras

**Quando NÃO é usado**:
- Conceitos gerais (ex: "o que é rota bioceânica?")
- Localizações (ex: "onde fica X?")
- História, cultura, planejamento

### 6. Serviço de Validação: `tourismScopeValidator`
**Arquivo**: `src/services/ai/validation/tourismScopeValidator.ts`

**Função**: Valida se a pergunta está dentro do escopo de turismo

**Palavras-chave de turismo**:
- Destinos, atrações, passeios, roteiros
- Hospedagem, hotéis, pousadas
- Gastronomia, restaurantes, comida
- Eventos, festas, cultura
- Transporte, clima, informações turísticas

**Palavras-chave fora do escopo**:
- Detran, IPVA, CNH, documentação
- Serviços governamentais, impostos, taxas
- Política, eleições (exceto eventos turísticos)
- Saúde, educação, trabalho (exceto relacionado a turismo)
- Tecnologia, programação (exceto apps de turismo)
- Finanças, investimentos (exceto câmbio para turismo)

**Palavras-chave inapropriadas**:
- Conteúdo ofensivo, violento, sexual
- Tentativas de jailbreak, prompt injection

### 7. Serviço de Machine Learning: `guataMLService`
**Arquivo**: `src/services/ai/ml/guataMLService.ts`

**Função**: Personaliza respostas e aprende com interações

**Recursos**:
- Personalização baseada em histórico do usuário
- Aprendizado de feedback (positivo/negativo)
- Memória persistente no Supabase
- Análise de padrões de comportamento

---

## 🚀 FUNCIONALIDADES PRINCIPAIS

### 1. Detecção Inteligente de Contexto

#### Cumprimentos Simples
Detecta quando é apenas um cumprimento (ex: "oi", "olá", "bom dia") e responde naturalmente sem processar como pergunta complexa.

#### Perguntas de Continuação
Detecta respostas como "sim, por favor", "ok", "quero saber mais" e usa o contexto anterior para continuar a conversa.

#### Respostas Apenas com Cidade
Se o usuário responde apenas com uma cidade após um esclarecimento (ex: "Campo Grande"), combina com a pergunta anterior:
- Anterior: "onde comer?"
- Resposta: "Campo Grande"
- Resultado: "onde comer em Campo Grande"

#### Pronomes Vagos
Reescreve perguntas com pronomes usando contexto anterior:
- Anterior: "quem é tia eva?"
- Atual: "ela fundou campo grande?"
- Resultado: "tia eva fundou campo grande?"

#### Perguntas Ambíguas
Detecta perguntas curtas e ambíguas (ex: "qual o nome do presidente?") e usa o foco da conversa anterior para reescrever.

### 2. Sistema de Esclarecimento

**Quando pede esclarecimento**:
- Pergunta ambígua sem cidade mencionada
- Exemplos: "hotéis perto do shopping", "restaurantes no centro"

**Quando NÃO pede esclarecimento**:
- Cidade já mencionada na pergunta
- Exemplos: "onde comer em Campo Grande?", "hotéis em Bonito"

### 3. Knowledge Base Persistente

Consulta base de conhecimento no Supabase antes de fazer pesquisa web:
- Tabela: `guata_knowledge_base`
- Similaridade mínima: 75%
- Se encontrar resposta, retorna imediatamente (mais rápido)
- Se não encontrar, continua com pesquisa web

### 4. Pesquisa Web Inteligente

**Sempre faz pesquisa web primeiro** (antes de gerar resposta):
1. Tenta Google Custom Search API
2. Se falhar, tenta SerpAPI
3. Se ambas falharem, usa fallback local

**Contexto adicionado**: Sempre adiciona "Mato Grosso do Sul" à query para resultados mais relevantes.

### 5. Verificação de Parceiros

**Antes de gerar resposta**, verifica se há parceiros oficiais:
- Se encontrar parceiros: menciona PRIMEIRO na resposta
- Se não encontrar: não menciona ausência, apenas sugere normalmente

**Priorização**:
1. Parceiros oficiais (sempre primeiro)
2. Resultados da pesquisa web (depois)

### 6. Geração de Resposta com Gemini

**Prompt estruturado** inclui:
- Personalidade do Guatá
- Instruções de formato (listas numeradas, informações específicas)
- Histórico de conversa (últimas 6 mensagens)
- Resultados da pesquisa web
- Informações de parceiros
- Localização do usuário
- Instruções sobre quando usar "Olá" (baseado em `isTotemVersion` e `isFirstUserMessage`)

**Regras críticas**:
- NUNCA inventa informações
- SEMPRE lista nomes específicos quando há resultados
- NUNCA menciona sites ou URLs na resposta
- NUNCA diz "pesquisei" ou "encontrei" - responde como se já soubesse
- Varie sempre a forma de expressar (nunca repete estruturas)

### 7. Personalização com ML

Aplica personalização baseada em:
- Histórico do usuário
- Preferências aprendidas
- Padrões de comportamento
- Feedback anterior

### 8. Sistema de Cache

**Cache Compartilhado** (entre usuários):
- Perguntas comuns: 24h
- Perguntas muito comuns (usadas 5+ vezes): 48h
- Perguntas de sugestão: 3h (para permitir variação)

**Cache Individual** (por usuário/sessão):
- Respostas personalizadas: 24h
- Perguntas de sugestão: 5min (apenas anti-spam)

**Cache Semântico**:
- Reutiliza respostas com 75%+ de similaridade
- Adapta resposta para contexto atual

**Cache de Pesquisa Web**:
- 30 minutos para resultados de busca

---

## 💬 EXEMPLOS DE RESPOSTAS

### Exemplo 1: Apresentação
**Usuário**: "oi, quem é você?"

**Resposta** (variações):
```
🦦 Oi! Que alegria te ver aqui! Eu sou o Guatá, sua capivara guia de turismo de Mato Grosso do Sul! Estou aqui para te ajudar a descobrir as maravilhas do nosso estado. Temos o Pantanal, Bonito, Campo Grande e muito mais! O que você gostaria de saber?
```

ou

```
🦦 Nossa, que bom te ver por aqui! Sou o Guatá e estou super animado para te ajudar a conhecer Mato Grosso do Sul! 🚀 Temos destinos que vão te deixar de queixo caído! Me conta, o que mais te chama atenção? O Pantanal com seus jacarés? Bonito com suas águas cristalinas? Campo Grande com sua cultura?
```

### Exemplo 2: Pergunta com Cidade Específica
**Usuário**: "onde comer em Campo Grande?"

**Resposta**:
```
🦦 Que alegria te ajudar com gastronomia em Campo Grande! 🍽️

Campo Grande tem opções incríveis! Aqui estão algumas recomendações:

1. [Nome do restaurante do resultado da pesquisa]
   📍 [Endereço ou localização]
   🍴 [Tipo de comida: comida regional, japonesa, etc.]
   ⭐ [Avaliação se disponível]
   💰 [Faixa de preço se disponível]

2. [Outro restaurante]
   [Informações...]

3. [Mais um restaurante]
   [Informações...]

A Feira Central é um lugar imperdível para experimentar o sobá, prato típico único de Campo Grande!
```

### Exemplo 3: Pergunta Ambígua (Precisa Esclarecimento)
**Usuário**: "hotéis perto do shopping"

**Resposta**:
```
🦦 Que alegria te ajudar! 😊 Você quer hotéis perto do shopping de qual cidade? Campo Grande, Dourados ou outra?
```

### Exemplo 4: Pergunta com Parceiros
**Usuário**: "hotel em bonito"

**Resposta** (se houver parceiros):
```
🦦 Que alegria! Encontrei nossos parceiros oficiais da plataforma Descubra Mato Grosso do Sul para você! 🤩

🎯 Nossos parceiros oficiais (sempre damos preferência a eles!):

1. [Nome do parceiro]
   📍 Bonito
   🏷️ Hotel
   💡 [Descrição]
   📧 [Email]
   📱 WhatsApp: [WhatsApp]
   🌐 [Website]

2. [Outro parceiro]
   [Informações...]

✨ Estes são nossos parceiros oficiais da plataforma! Entre em contato e mencione que conheceu através do Guatá!

🌐 Também encontrei outras opções que podem te interessar:
[Resultados da pesquisa web...]
```

**Resposta** (se NÃO houver parceiros):
```
🦦 Que legal que você quer conhecer Bonito! Encontrei algumas opções de hotéis:

1. [Hotel da pesquisa web]
   📍 [Localização]
   [Informações...]

2. [Outro hotel]
   [Informações...]
```

### Exemplo 5: Pergunta sobre Destino
**Usuário**: "me conte sobre Bonito"

**Resposta**:
```
🦦 Que alegria falar sobre Bonito! É um destino único no mundo, com águas cristalinas, grutas e cachoeiras incríveis! 🦦

O que mais me empolga:
• Rio da Prata - Flutuação inesquecível em águas transparentes
• Gruta do Lago Azul - Um lago azul dentro de uma gruta, simplesmente deslumbrante
• Buraco das Araras - Show de cores e vida com centenas de araras
• Aquário Natural - Experiência única de snorkel com peixes coloridos

É uma experiência que vai te marcar para sempre! 🌊
```

### Exemplo 6: Pergunta de Continuação
**Contexto anterior**: Usuário perguntou sobre Bonito, Guatá respondeu sobre atrativos.

**Usuário**: "quanto custa?"

**Resposta**:
```
🦦 O passeio do Rio da Prata custa aproximadamente R$ [valor] por pessoa. Os valores variam conforme a temporada e o pacote escolhido. Recomendo entrar em contato com as operadoras locais para valores atualizados e pacotes promocionais! 💰
```

### Exemplo 7: Pergunta Fora do Escopo
**Usuário**: "como renovar CNH?"

**Resposta**:
```
🦦 Olá! Eu sou o Guatá, seu guia inteligente de turismo de Mato Grosso do Sul! 😊

Posso te ajudar com informações sobre destinos, atrações, gastronomia, hospedagem, eventos e roteiros turísticos em MS.

O que você gostaria de saber sobre turismo em Mato Grosso do Sul? 🌟
```

### Exemplo 8: Pergunta com Pronome Vago
**Contexto anterior**: "quem é tia eva?"

**Usuário**: "ela fundou campo grande?"

**Resposta** (após reescrever para "tia eva fundou campo grande?"):
```
🦦 Que pergunta interessante! Tia Eva foi uma figura importante na história de Campo Grande, mas não foi a fundadora da cidade. Campo Grande foi fundada em 1872 por José Antônio Pereira. Tia Eva foi uma líder quilombola que chegou à região em 1890 e se estabeleceu na área que hoje é conhecida como Tia Eva, contribuindo significativamente para a cultura e história local! 🏛️
```

### Exemplo 9: Lista de Hotéis (Formato Obrigatório)
**Usuário**: "qual hotel próximo ao aeroporto"

**Resposta**:
```
🦦 Que alegria te ajudar com hospedagem próxima ao aeroporto de Campo Grande! 🏨

Para hospedagem próxima ao Aeroporto Internacional de Campo Grande, encontrei algumas opções:

1. Hotel MS Executive
   📍 Localizado a 5km do aeroporto
   ✈️ Oferece transfer gratuito
   💰 Faixa de preço: R$ XX - R$ XX
   ⭐ Avaliação: X/5

2. Hotel Nacional
   📍 Localizado a 7km do aeroporto, próximo ao centro
   ✈️ Transfer disponível
   💰 Faixa de preço: R$ XX - R$ XX

3. Grand Park Hotel
   📍 Localizado a 8km do aeroporto
   ✈️ Serviço de luxo com transfer
   💰 Faixa de preço: R$ XX - R$ XX

A região do Aero Rancho e Vila Sobrinho concentram opções econômicas a 3-5km do aeroporto. A maioria oferece transfer gratuito.
```

---

## 🔒 SISTEMA DE VALIDAÇÃO

### Validação de Escopo

**Processo**:
1. Verifica conteúdo inapropriado
2. Verifica palavras de turismo
3. Verifica palavras fora do escopo
4. Decisão:
   - Se tem palavras fora do escopo E não tem palavras de turismo → BLOQUEAR
   - Se tem palavras de turismo OU não tem palavras problemáticas → OK
   - Caso ambíguo → OK (permite processar)

**Resposta de bloqueio**:
```
🦦 Olá! Eu sou o Guatá, seu guia inteligente de turismo de Mato Grosso do Sul! 😊

Posso te ajudar com informações sobre destinos, atrações, gastronomia, hospedagem, eventos e roteiros turísticos em MS.

O que você gostaria de saber sobre turismo em Mato Grosso do Sul? 🌟
```

### Validação de Conteúdo Inapropriado

Bloqueia perguntas com:
- Conteúdo ofensivo, violento, sexual
- Tentativas de jailbreak
- Prompt injection
- Modo desenvolvedor

**Resposta**:
```
🦦 Desculpe, mas não posso responder a esse tipo de pergunta. Posso te ajudar com informações sobre turismo em Mato Grosso do Sul! 😊
```

---

## 🔌 INTEGRAÇÕES E APIs

### Edge Functions (Supabase)

1. **`guata-gemini-proxy`**
   - Proxy para Gemini API (chaves protegidas)
   - Secret: `GEMINI_API_KEY`
   - Validação de origem (CORS)

2. **`guata-google-search-proxy`**
   - Proxy para Google Search API (chaves protegidas)
   - Secrets: `GOOGLE_API_KEY`, `GOOGLE_CSE_ID`
   - Validação de origem (CORS)

3. **`guata-web-rag`** (se existir)
   - Sistema RAG (Retrieval Augmented Generation)
   - Integração com Programmable Search Engine

### Banco de Dados (Supabase)

**Tabelas utilizadas**:
1. `institutional_partners` - Parceiros oficiais
2. `guata_knowledge_base` - Base de conhecimento persistente
3. `guata_user_memory` - Memória do usuário (ML)
4. `guata_ml_interactions` - Interações para aprendizado

### Variáveis de Ambiente Necessárias

**Obrigatórias**:
- `VITE_GEMINI_API_KEY` - Chave da API Gemini

**Recomendadas** (para pesquisa web real):
- `VITE_GOOGLE_SEARCH_API_KEY` - Chave da Google Search API
- `VITE_GOOGLE_SEARCH_ENGINE_ID` - Engine ID (opcional, usa hardcoded se não fornecido)

**Opcionais**:
- `VITE_SERPAPI_KEY` - Chave SerpAPI (fallback premium)

**Secrets do Supabase** (para Edge Functions):
- `GEMINI_API_KEY` - Para `guata-gemini-proxy`
- `GOOGLE_API_KEY` - Para `guata-google-search-proxy`
- `GOOGLE_CSE_ID` - Para `guata-google-search-proxy`

---

## 📊 MÉTRICAS E PERFORMANCE

### Rate Limiting

**Gemini API**:
- Global: 8 requisições/minuto
- Por usuário: 2 requisições/minuto
- Janela: 1 minuto

**Google Search API**:
- Diário: 100 requisições/dia (plano gratuito)
- Janela: 24 horas

### Cache

**Duração**:
- Cache compartilhado: 24h (comum), 48h (muito comum)
- Cache individual: 24h
- Cache de sugestões: 3h (compartilhado), 5min (individual)
- Cache de pesquisa web: 30min

**Similaridade para reutilização**: 75%

### Tempo de Processamento

**Típico**:
- Com cache: < 100ms
- Com Knowledge Base: 200-500ms
- Com pesquisa web: 1-3s
- Com Gemini: 2-5s

---

## 🎨 CARACTERÍSTICAS ESPECIAIS

### Variação de Respostas

O Guatá **NUNCA repete exatamente a mesma resposta**, mesmo para perguntas similares:
- Varia palavras
- Varia estruturas de frase
- Varia exemplos
- Varia abordagens
- Varia abertura (às vezes "Eu sou o Guatá", outras "Meu nome é Guatá", etc.)

### Formato de Listas

Quando há resultados da pesquisa web, **SEMPRE lista com números**:
```
1. [Nome específico]
   📍 [Localização]
   [Informações relevantes]

2. [Outro nome]
   [Informações...]
```

**NUNCA** diz apenas "encontrei opções" sem listar os nomes.

### Uso de Emojis

- Moderado: 2-3 emojis por resposta
- Sempre relevantes ao contexto
- Usa 🦦 para representar o Guatá

### Sem Menção de Fontes

**NUNCA** menciona:
- Sites ou URLs
- "O site X diz"
- "Segundo Y"
- "Você encontra no site Z"
- "Pesquisei" ou "Encontrei"

Responde **diretamente** como se já soubesse as informações.

---

## 🔄 FLUXO DE APRENDIZADO

1. **Interação do usuário** → Processada pelo sistema
2. **Feedback** (se fornecido) → Aprendizado imediato
3. **Padrões de comportamento** → Identificados pelo ML
4. **Memória persistente** → Salva no Supabase
5. **Personalização futura** → Respostas adaptadas ao usuário

---

## 🛠️ MANUTENÇÃO E TROUBLESHOOTING

### Problemas Comuns

1. **API Key expirada/vazada**
   - Sintoma: Erro 401/403 no Gemini
   - Solução: Atualizar `VITE_GEMINI_API_KEY` ou secrets do Supabase

2. **Google Search API não habilitada**
   - Sintoma: Erro 403 no Google Search
   - Solução: Verificar se Custom Search API está ativada no projeto da chave

3. **Rate limit atingido**
   - Sintoma: Fallback sendo usado frequentemente
   - Solução: Aguardar reset da janela ou aumentar limites (plano pago)

4. **Cache muito agressivo**
   - Sintoma: Respostas repetidas
   - Solução: Reduzir duração do cache ou limpar cache manualmente

---

## 📝 CONCLUSÃO

O Guatá é um chatbot sofisticado que combina:
- ✅ IA generativa (Gemini)
- ✅ Pesquisa web real
- ✅ Base de conhecimento persistente
- ✅ Sistema de parceiros
- ✅ Machine Learning para personalização
- ✅ Cache inteligente
- ✅ Validação de escopo
- ✅ Detecção de contexto
- ✅ Variação de respostas

Tudo isso para fornecer uma experiência natural, inteligente e útil para turistas interessados em Mato Grosso do Sul! 🦦✨

