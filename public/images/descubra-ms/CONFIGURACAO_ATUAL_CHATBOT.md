# 🦦 CONFIGURAÇÃO ATUAL DO CHATBOT GUATÁ

## 📊 **ARQUITETURA ATUAL**

### **Fluxo de Processamento**

```
Usuário pergunta no ChatGuata.tsx
    ↓
guataTrueApiService.processQuestion()
    ↓
guataIntelligentTourismService.processQuestion()
    ↓
    ├─→ Validação de escopo (tourismScopeValidator)
    ├─→ Detecção de tipo de pergunta
    ├─→ Consulta Knowledge Base (se disponível)
    ├─→ Pesquisa Web Real (guataRealWebSearchService)
    ├─→ Verificação de Parceiros (guataPartnersService)
    ├─→ Geração de Resposta (guataGeminiService)
    └─→ Personalização com ML (guataMLService)
```

## 🔧 **SERVIÇOS UTILIZADOS**

### **1. Serviço Principal: `guataTrueApiService`**
- **Arquivo**: `src/services/ai/guataTrueApiService.ts`
- **Função**: Ponto de entrada principal
- **Usa**: `guataIntelligentTourismService` internamente

### **2. Serviço Inteligente: `guataIntelligentTourismService`**
- **Arquivo**: `src/services/ai/guataIntelligentTourismService.ts`
- **Função**: Coordena todo o processamento inteligente
- **Recursos**:
  - Validação de escopo de turismo
  - Detecção de perguntas genéricas
  - Pesquisa web real
  - Verificação de parceiros
  - Geração de respostas inteligentes

### **3. Serviço de Pesquisa Web: `guataRealWebSearchService`**
- **Arquivo**: `src/services/ai/guataRealWebSearchService.ts`
- **Função**: Busca informações reais na web
- **APIs Usadas**:
  - Google Custom Search API (prioridade)
  - SerpAPI (fallback)
  - Edge Function `guata-google-search-proxy` (protegido)

### **4. Serviço Gemini: `guataGeminiService`**
- **Arquivo**: `src/services/ai/guataGeminiService.ts`
- **Função**: Gera respostas inteligentes usando IA
- **Recursos**:
  - Rate limiting (8 req/min global, 2 req/min por usuário)
  - Cache inteligente (24h compartilhado, 5min individual)
  - Fallback quando API não disponível
  - Edge Function `guata-gemini-proxy` (protegido)

## 🔑 **VARIÁVEIS DE AMBIENTE NECESSÁRIAS**

### **Obrigatórias**

```bash
# Gemini AI - Para gerar respostas inteligentes
VITE_GEMINI_API_KEY=sua_chave_gemini_aqui

# Supabase - Para banco de dados e Edge Functions
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon_supabase
```

### **Recomendadas (para pesquisa web real)**

```bash
# Google Custom Search - Para buscar informações atualizadas
VITE_GOOGLE_SEARCH_API_KEY=sua_chave_google_search
VITE_GOOGLE_SEARCH_ENGINE_ID=seu_engine_id
```

### **Opcionais**

```bash
# SerpAPI - Alternativa premium para busca web
VITE_SERPAPI_KEY=sua_chave_serpapi
```

## 🛠️ **COMO OBTER AS CHAVES**

### **1. Gemini API Key** (Obrigatório)
1. Acesse: https://aistudio.google.com/app/apikey
2. Faça login com sua conta Google
3. Clique em "Create API Key"
4. Copie a chave gerada
5. Cole no `.env` como `VITE_GEMINI_API_KEY`

### **2. Google Custom Search** (Recomendado)
**API Key:**
1. Acesse: https://console.cloud.google.com/
2. Crie um projeto ou selecione existente
3. Ative "Custom Search API"
4. Vá em "Credenciais" → "Criar credenciais" → "Chave de API"
5. Copie a chave gerada

**Search Engine ID:**
1. Acesse: https://cse.google.com/cse/
2. Clique em "Add" para criar novo mecanismo
3. Configure para buscar em "toda a web"
4. Copie o "Search Engine ID"

### **3. Supabase** (Obrigatório)
1. Acesse: https://supabase.com/
2. Crie um projeto
3. Vá em "Settings" → "API"
4. Copie "Project URL" e "anon public key"

## 🔐 **EDGE FUNCTIONS (Supabase)**

As Edge Functions protegem as chaves no servidor:

### **1. `guata-gemini-proxy`**
- **Função**: Proxy para Gemini API (chaves protegidas)
- **Secrets necessários**:
  ```
  GEMINI_API_KEY=...
  ```

### **2. `guata-google-search-proxy`**
- **Função**: Proxy para Google Search API (chaves protegidas)
- **Secrets necessários**:
  ```
  GOOGLE_API_KEY=...
  GOOGLE_CSE_ID=...
  ```

**Como configurar secrets:**
```bash
supabase secrets set GEMINI_API_KEY=sua_chave_aqui
supabase secrets set GOOGLE_API_KEY=sua_chave_aqui
supabase secrets set GOOGLE_CSE_ID=seu_engine_id_aqui
```

## 📝 **CONFIGURAÇÃO ATUAL DO CÓDIGO**

### **Página Principal: `ChatGuata.tsx`**
```typescript
// Usa guataTrueApiService como serviço principal
const response = await guataTrueApiService.processQuestion({
  question: mensagemParaEnviar,
  userId: 'publico',
  sessionId: `session-${Date.now()}`,
  userLocation: 'Mato Grosso do Sul',
  conversationHistory: conversationHistory,
  userPreferences: userPreferences,
  isTotemVersion: isChatGuataRoute,
  isFirstUserMessage: mensagens.length === 1
});
```

### **Fluxo de Processamento**

1. **Validação**: Verifica se a pergunta é sobre turismo
2. **Detecção**: Identifica tipo de pergunta (hotel, restaurante, evento, etc.)
3. **Knowledge Base**: Consulta base de conhecimento local (se disponível)
4. **Pesquisa Web**: Busca informações atualizadas na web
5. **Parceiros**: Verifica se há parceiros oficiais
6. **Geração**: Usa Gemini para gerar resposta inteligente
7. **Personalização**: Aplica ML para personalizar resposta
8. **Formatação**: Adiciona personalidade e contexto

## ⚠️ **PROBLEMAS IDENTIFICADOS**

### **1. Falta de Detecção Específica para Restaurantes**
- O código não detecta especificamente perguntas sobre restaurantes
- Não há função `formatRestaurantResponse` como há para hotéis

### **2. Respostas Genéricas**
- Quando pergunta sobre restaurantes, não fornece recomendações específicas
- Pede esclarecimento mesmo quando cidade já está mencionada

### **3. Prompt do Gemini**
- Pode estar sendo muito restritivo
- Não está usando resultados da pesquisa web de forma otimizada

## ✅ **PRÓXIMOS PASSOS**

1. Adicionar detecção específica para restaurantes
2. Criar função `formatRestaurantResponse`
3. Ajustar prompt do Gemini para não pedir esclarecimento desnecessário
4. Melhorar uso dos resultados da pesquisa web

## 📚 **ARQUIVOS IMPORTANTES**

- `src/pages/ChatGuata.tsx` - Interface principal
- `src/services/ai/guataTrueApiService.ts` - Serviço principal
- `src/services/ai/guataIntelligentTourismService.ts` - Lógica inteligente
- `src/services/ai/guataRealWebSearchService.ts` - Pesquisa web
- `src/services/ai/guataGeminiService.ts` - Geração de respostas IA
- `.env` - Variáveis de ambiente (não commitado)

## 🔍 **VERIFICAÇÃO DE CONFIGURAÇÃO**

Para verificar se está tudo configurado:

1. **Verificar variáveis de ambiente:**
   ```bash
   # No console do navegador (F12)
   console.log(import.meta.env.VITE_GEMINI_API_KEY ? '✅ Gemini configurado' : '❌ Gemini não configurado')
   console.log(import.meta.env.VITE_GOOGLE_SEARCH_API_KEY ? '✅ Google Search configurado' : '❌ Google Search não configurado')
   ```

2. **Verificar logs no console:**
   - Deve aparecer logs sobre pesquisa web
   - Deve aparecer logs sobre uso do Gemini
   - Não deve aparecer erros de API keys

3. **Testar perguntas:**
   - "onde é o melhor restaurante em campo grande?"
   - "hotéis em bonito"
   - "o que fazer em campo grande?"

