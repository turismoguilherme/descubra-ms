# 🔑 CONFIGURAÇÃO DE APIs PARA SISTEMA DE EVENTOS INTELIGENTE

## 📋 **APIs NECESSÁRIAS:**

### **1. Google Custom Search API (OBRIGATÓRIO)**
- **Função:** Buscar eventos na web automaticamente
- **Configuração:**
  1. Acesse: https://console.developers.google.com/
  2. Crie um projeto e ative a "Custom Search API"
  3. Gere uma chave de API
  4. Crie um mecanismo de busca em: https://cse.google.com/
  5. Configure para buscar em sites do Mato Grosso do Sul

### **2. Google Gemini AI (OBRIGATÓRIO)**
- **Função:** Processar e melhorar descrições de eventos
- **Configuração:**
  1. Acesse: https://ai.google.dev/
  2. Obtenha uma chave de API do Gemini
  3. Configure para processar descrições de eventos

### **3. OpenWeather API (OPCIONAL)**
- **Função:** Informações climáticas para eventos
- **Configuração:**
  1. Acesse: https://openweathermap.org/api
  2. Crie uma conta gratuita
  3. Obtenha sua chave de API

## 🚀 **COMO CONFIGURAR:**

### **Passo 1: Criar arquivo .env**
```bash
# Crie um arquivo .env na raiz do projeto
touch .env
```

### **Passo 2: Adicionar suas chaves**
```env
# Google Custom Search API
VITE_GOOGLE_SEARCH_API_KEY=sua_chave_aqui
VITE_GOOGLE_SEARCH_ENGINE_ID=seu_engine_id_aqui

# Google Gemini AI
VITE_GEMINI_API_KEY=sua_chave_gemini_aqui

# OpenWeather (opcional)
VITE_OPENWEATHER_API_KEY=sua_chave_openweather_aqui
```

### **Passo 3: Reiniciar o servidor**
```bash
npm run dev
```

## ✅ **STATUS ATUAL:**

- ✅ **Sistema preparado** para APIs reais
- ✅ **Interface funcionando** com dados de demonstração
- ⚠️ **APIs não configuradas** - usando dados mock
- 🔄 **Aguardando configuração** das chaves

## 🎯 **O QUE ACONTECE APÓS CONFIGURAR:**

1. **Sistema busca eventos** automaticamente na web
2. **Gemini AI processa** e melhora descrições
3. **Eventos aparecem** com dados reais
4. **Sistema limpa** eventos finalizados automaticamente
5. **Interface rica** com imagens, vídeos e links

## 🔍 **VERIFICAR SE ESTÁ FUNCIONANDO:**

1. **Console do navegador (F12):**
   - Deve mostrar: "🔑 API Status: {google: true, gemini: true}"
   - Deve mostrar: "📅 EVENT CALENDAR: X eventos reais carregados"

2. **Página de eventos:**
   - Eventos com dados reais (não mais "demo")
   - Descrições processadas por IA
   - Links para sites oficiais

3. **Admin panel:**
   - Status das APIs: "ATIVO"
   - Testes passando: "✅ SISTEMA FUNCIONANDO"

## 🚨 **PROBLEMAS COMUNS:**

### **"APIs não configuradas"**
- Verifique se o arquivo .env existe
- Verifique se as chaves estão corretas
- Reinicie o servidor após configurar

### **"Erro ao carregar eventos"**
- Verifique se as APIs estão ativas
- Verifique se as chaves são válidas
- Sistema usará dados de fallback

### **"Sistema não inicializa"**
- Verifique o console para erros
- Reinicie o servidor
- Sistema tem fallback automático

## 📞 **SUPORTE:**

Se precisar de ajuda com a configuração das APIs, consulte:
- [Google Custom Search API](https://developers.google.com/custom-search/v1/introduction)
- [Google Gemini AI](https://ai.google.dev/docs)
- [OpenWeather API](https://openweathermap.org/api)

