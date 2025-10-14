# 🧠 CONFIGURAÇÃO COMPLETA DAS APIS DO GUATÁ

## 🎯 **OBJETIVO**
Configurar todas as APIs necessárias para o Guatá ter **pesquisa web REAL** e ser verdadeiramente inteligente.

## 📋 **APIS OBRIGATÓRIAS**

### 1. **🤖 GEMINI AI (Google)**
**Função**: Geração de respostas inteligentes  
**Status**: ⚠️ VERIFICAR SE ESTÁ CONFIGURADA  

```bash
# Arquivo .env (criar se não existir)
VITE_GEMINI_API_KEY=sua_chave_gemini_aqui
```

**Como obter:**
1. Acesse: https://makersuite.google.com/app/apikey
2. Crie uma nova API key
3. Copie e cole no .env

### 2. **🔍 GOOGLE CUSTOM SEARCH**
**Função**: Busca REAL na web  
**Status**: ⚠️ PRECISA SER CONFIGURADA  

```bash
# Arquivo .env
VITE_GOOGLE_SEARCH_API_KEY=sua_chave_google_search_aqui
VITE_GOOGLE_SEARCH_ENGINE_ID=seu_engine_id_aqui
```

**Como configurar:**
1. **API Key:**
   - Acesse: https://console.developers.google.com/
   - Ative "Custom Search API"
   - Crie credenciais (API Key)

2. **Search Engine ID:**
   - Acesse: https://cse.google.com/cse/
   - Crie um mecanismo de busca personalizado
   - Configure para buscar em "toda a web"
   - Copie o "Search Engine ID"

## 🛠️ **VERIFICAÇÃO DE STATUS**

### **Comando para Verificar:**
```bash
# No terminal do projeto
npm run dev
# Depois acesse: http://localhost:8080/ms/guata-test
```

### **Status das APIs:**
- ✅ **Base de Conhecimento**: Sempre funcionando
- ⚠️ **Google Custom Search**: Verificar configuração
- ⚠️ **Gemini AI**: Verificar chave

## 🔧 **CONFIGURAÇÃO PASSO A PASSO**

### **1. Criar arquivo .env**
```bash
# Na raiz do projeto, criar arquivo .env:
VITE_GEMINI_API_KEY=sua_chave_aqui
VITE_GOOGLE_SEARCH_API_KEY=sua_chave_google_aqui
VITE_GOOGLE_SEARCH_ENGINE_ID=seu_engine_id_aqui
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_supabase
```

### **2. Testar Configuração**
1. Reinicie o servidor: `npm run dev`
2. Acesse: `http://localhost:8080/chatguata`
3. Faça uma pergunta sobre MS
4. Verifique o console para logs de pesquisa

## 📊 **COMPORTAMENTO DO SISTEMA**

### **Com APIs Configuradas:**
```
🧠 Guatá Inteligente: Processando "hotéis em Bonito"
🌐 Buscando informações com sistema inteligente...
✅ Encontrados 3 resultados da base local
🔍 Executando busca REAL no Google Custom Search...
✅ Encontrados 5 resultados REAIS do Google
🎯 Resposta inteligente gerada em 1250ms com 95% de confiança
```

### **Sem APIs (Modo Fallback):**
```
🧠 Guatá Inteligente: Processando "hotéis em Bonito"
🌐 Buscando informações com sistema inteligente...
✅ Encontrados 2 resultados da base local
⚠️ Google Search API não configurada, usando dados simulados
🎯 Resposta gerada com base local em 450ms com 85% de confiança
```

## 🎪 **FUNCIONALIDADES IMPLEMENTADAS**

### **✅ JÁ FUNCIONA (sem APIs externas):**
- Base de conhecimento completa sobre MS
- Informações sobre Pantanal, Bonito, Campo Grande
- Cultura, tradições, hospedagem, transporte
- Sistema honesto (admite quando não sabe)

### **🚀 FUNCIONARÁ COM APIs:**
- Pesquisa REAL na web em tempo real
- Informações atualizadas sobre eventos
- Dados dinâmicos de hotéis e preços
- Notícias e atualizações do turismo MS

## 🎯 **PRÓXIMOS PASSOS**

1. **IMEDIATO**: Configurar Google Custom Search para pesquisa web real
2. **IMPORTANTE**: Verificar chave Gemini AI
3. **TESTE**: Usar página /ms/guata-test para monitorar
4. **OPCIONAL**: Configurar APIs de clima e eventos

## 🔥 **RESULTADO FINAL**

Com todas as APIs configuradas, o Guatá será capaz de:
- ✅ Responder QUALQUER pergunta sobre MS
- ✅ Buscar informações REAIS na web
- ✅ Ser honesto quando não souber algo específico
- ✅ Combinar conhecimento local + pesquisa web
- ✅ Fornecer informações sempre atualizadas

---

**🎉 O Guatá está pronto para ser verdadeiramente inteligente!**














