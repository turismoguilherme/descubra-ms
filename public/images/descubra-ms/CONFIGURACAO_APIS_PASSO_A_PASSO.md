# 🔧 CONFIGURAÇÃO DAS APIS - PASSO A PASSO

## 🎯 **OBJETIVO**
Ativar a pesquisa web real no Guatá para que ele possa buscar informações atualizadas na internet.

## 📋 **PASSO 1: GOOGLE CUSTOM SEARCH API**

### **1.1 Obter API Key**
1. Acesse: https://console.developers.google.com/
2. Crie um novo projeto ou selecione um existente
3. Vá em "APIs & Services" > "Library"
4. Procure por "Custom Search API"
5. Clique em "Enable"
6. Vá em "APIs & Services" > "Credentials"
7. Clique em "Create Credentials" > "API Key"
8. Copie a chave gerada

### **1.2 Criar Search Engine**
1. Acesse: https://cse.google.com/cse/
2. Clique em "Add" para criar um novo mecanismo
3. Em "Sites to search", digite: `*` (para buscar em toda a web)
4. Clique em "Create"
5. Vá em "Setup" > "Basics"
6. Copie o "Search engine ID"

### **1.3 Configurar no Projeto**
Crie um arquivo `.env` na raiz do projeto com:

```bash
# Google Custom Search API
VITE_GOOGLE_SEARCH_API_KEY=sua_chave_aqui
VITE_GOOGLE_SEARCH_ENGINE_ID=seu_engine_id_aqui
```

## 📋 **PASSO 2: SERPAPI (OPCIONAL - ALTERNATIVA PREMIUM)**

### **2.1 Obter API Key**
1. Acesse: https://serpapi.com/
2. Crie uma conta gratuita
3. Vá em "Dashboard" > "API Key"
4. Copie sua chave

### **2.2 Configurar no Projeto**
Adicione ao arquivo `.env`:

```bash
# SerpAPI (alternativa premium)
VITE_SERPAPI_KEY=sua_chave_serpapi_aqui
```

## 📋 **PASSO 3: TESTAR CONFIGURAÇÃO**

### **3.1 Reiniciar o Servidor**
```bash
npm run dev
```

### **3.2 Acessar Página de Testes**
```
http://localhost:8080/ms/guata-test
```

### **3.3 Verificar Status**
- Verde = API configurada e funcionando
- Vermelho = API não configurada

## 🎯 **RESULTADO ESPERADO**

### **ANTES (Atual):**
```
🔍 Guatá Real Web Search: NÃO CONFIGURADO
⚠️ Nenhuma pesquisa web funcionou, usando dados locais...
```

### **DEPOIS (Com APIs configuradas):**
```
🔍 Guatá Real Web Search: CONFIGURADO
✅ Google Search: 5 resultados encontrados
🌐 Pesquisa real: true
```

## 🚀 **TESTE RÁPIDO**

Após configurar, teste fazendo uma pergunta como:
- "Hotéis em Bonito"
- "Eventos em Campo Grande"
- "Restaurantes em MS"

O Guatá deve responder com informações reais da web!

## 💡 **DICAS IMPORTANTES**

1. **Google Custom Search**: Gratuito até 100 consultas/dia
2. **SerpAPI**: 100 consultas gratuitas/mês
3. **Teste primeiro**: Use a página de testes para verificar
4. **Backup**: Mantenha as chaves em local seguro

---

**🎉 Com essas configurações, o Guatá será verdadeiramente inteligente!**

## 🎯 **OBJETIVO**
Ativar a pesquisa web real no Guatá para que ele possa buscar informações atualizadas na internet.

## 📋 **PASSO 1: GOOGLE CUSTOM SEARCH API**

### **1.1 Obter API Key**
1. Acesse: https://console.developers.google.com/
2. Crie um novo projeto ou selecione um existente
3. Vá em "APIs & Services" > "Library"
4. Procure por "Custom Search API"
5. Clique em "Enable"
6. Vá em "APIs & Services" > "Credentials"
7. Clique em "Create Credentials" > "API Key"
8. Copie a chave gerada

### **1.2 Criar Search Engine**
1. Acesse: https://cse.google.com/cse/
2. Clique em "Add" para criar um novo mecanismo
3. Em "Sites to search", digite: `*` (para buscar em toda a web)
4. Clique em "Create"
5. Vá em "Setup" > "Basics"
6. Copie o "Search engine ID"

### **1.3 Configurar no Projeto**
Crie um arquivo `.env` na raiz do projeto com:

```bash
# Google Custom Search API
VITE_GOOGLE_SEARCH_API_KEY=sua_chave_aqui
VITE_GOOGLE_SEARCH_ENGINE_ID=seu_engine_id_aqui
```

## 📋 **PASSO 2: SERPAPI (OPCIONAL - ALTERNATIVA PREMIUM)**

### **2.1 Obter API Key**
1. Acesse: https://serpapi.com/
2. Crie uma conta gratuita
3. Vá em "Dashboard" > "API Key"
4. Copie sua chave

### **2.2 Configurar no Projeto**
Adicione ao arquivo `.env`:

```bash
# SerpAPI (alternativa premium)
VITE_SERPAPI_KEY=sua_chave_serpapi_aqui
```

## 📋 **PASSO 3: TESTAR CONFIGURAÇÃO**

### **3.1 Reiniciar o Servidor**
```bash
npm run dev
```

### **3.2 Acessar Página de Testes**
```
http://localhost:8080/ms/guata-test
```

### **3.3 Verificar Status**
- Verde = API configurada e funcionando
- Vermelho = API não configurada

## 🎯 **RESULTADO ESPERADO**

### **ANTES (Atual):**
```
🔍 Guatá Real Web Search: NÃO CONFIGURADO
⚠️ Nenhuma pesquisa web funcionou, usando dados locais...
```

### **DEPOIS (Com APIs configuradas):**
```
🔍 Guatá Real Web Search: CONFIGURADO
✅ Google Search: 5 resultados encontrados
🌐 Pesquisa real: true
```

## 🚀 **TESTE RÁPIDO**

Após configurar, teste fazendo uma pergunta como:
- "Hotéis em Bonito"
- "Eventos em Campo Grande"
- "Restaurantes em MS"

O Guatá deve responder com informações reais da web!

## 💡 **DICAS IMPORTANTES**

1. **Google Custom Search**: Gratuito até 100 consultas/dia
2. **SerpAPI**: 100 consultas gratuitas/mês
3. **Teste primeiro**: Use a página de testes para verificar
4. **Backup**: Mantenha as chaves em local seguro

---

**🎉 Com essas configurações, o Guatá será verdadeiramente inteligente!**




