# 🔧 GUIA COMPLETO DE CONFIGURAÇÃO DAS APIS

## 🎯 **STATUS ATUAL**
- ✅ **Gemini AI**: Funcionando
- ✅ **Supabase**: Funcionando  
- ⚠️ **Google Places**: Não configurada (opcional)
- ⚠️ **Google Search**: Não configurada (opcional)

---

## 📋 **PASSO A PASSO DETALHADO**

### **1. 🤖 GOOGLE PLACES API**

#### **1.1 Acessar Google Cloud Console**
```
URL: https://console.cloud.google.com/
```

#### **1.2 Criar/Selecionar Projeto**
- **Se não tem projeto**: "Novo Projeto" → Nome: "Descubra MS"
- **Se já tem**: Selecionar projeto existente

#### **1.3 Ativar Places API**
1. Menu lateral → "APIs e Serviços" → "Biblioteca"
2. Buscar: "Places API"
3. Clicar em "Places API" → "ATIVAR"

#### **1.4 Criar Chave de API**
1. "APIs e Serviços" → "Credenciais"
2. "+ CRIAR CREDENCIAIS" → "Chave de API"
3. **COPIAR A CHAVE GERADA** ← IMPORTANTE!

#### **1.5 Configurar Restrições de Segurança**
1. Clicar na chave criada
2. "Restrições de aplicativo" → "Referenciadores HTTP"
3. Adicionar:
   ```
   localhost:8080/*
   seu-dominio.com/*
   ```

---

### **2. 🔍 GOOGLE CUSTOM SEARCH API**

#### **2.1 Ativar Custom Search API**
1. Mesmo projeto do Google Cloud
2. "Biblioteca" → Buscar: "Custom Search API"
3. "Custom Search API" → "ATIVAR"
4. **Usar a mesma chave de API** criada acima

#### **2.2 Criar Mecanismo de Busca**
```
URL: https://cse.google.com/cse/
```

1. "Adicionar" → "Criar um mecanismo de busca personalizado"
2. **Sites a pesquisar**: Selecionar "Pesquisar toda a web"
3. **Nome**: "Descubra MS Search"
4. **COPIAR O ID DO MECANISMO** ← IMPORTANTE!

---

## 🛠️ **3. CONFIGURAR NO PROJETO**

### **3.1 Criar arquivo .env na raiz do projeto**

```bash
# Na pasta raiz: C:\Users\guilh\Descubra MS\descubra-ms\
# Criar arquivo: .env
```

### **3.2 Conteúdo do arquivo .env**

```env
# 🧠 CONFIGURAÇÕES DO GUATÁ - DESCUBRA MS

# ===== APIS OBRIGATÓRIAS (JÁ FUNCIONANDO) =====
VITE_GEMINI_API_KEY=sua_chave_gemini_atual
VITE_SUPABASE_URL=https://hvtrpkbjgbuypkskqcqm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2dHJwa2JqZ2J1eXBrc2txY3FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMzIzODgsImV4cCI6MjA2NzYwODM4OH0.gHxmJIedckwQxz89DUHx4odzTbPefFeadW3T7cYcW2Q

# ===== APIS OPCIONAIS (Para melhorar performance) =====

# Google Places API (Para hotéis reais próximos ao aeroporto)
VITE_GOOGLE_PLACES_API_KEY=COLE_SUA_CHAVE_PLACES_AQUI

# Google Custom Search (Para busca web real)
VITE_GOOGLE_SEARCH_API_KEY=COLE_SUA_CHAVE_SEARCH_AQUI
VITE_GOOGLE_SEARCH_ENGINE_ID=COLE_SEU_ENGINE_ID_AQUI

# OpenWeather API (Opcional - para clima)
VITE_OPENWEATHER_API_KEY=sua_chave_openweather_aqui
```

### **3.3 Substituir os valores**
Trocar:
- `COLE_SUA_CHAVE_PLACES_AQUI` → Chave do Google Places
- `COLE_SUA_CHAVE_SEARCH_AQUI` → Mesma chave do Places  
- `COLE_SEU_ENGINE_ID_AQUI` → ID do mecanismo de busca

---

## ⚡ **4. TESTAR CONFIGURAÇÃO**

### **4.1 Reiniciar servidor**
```bash
# Parar o servidor (Ctrl+C)
npm run dev
# Aguardar: "Local: http://localhost:8080/"
```

### **4.2 Testar o Guatá**
1. Acessar: `http://localhost:8080/chatguata`
2. Perguntar: "hotéis perto do aeroporto de Campo Grande"
3. **Verificar logs no console (F12)**

### **4.3 Logs esperados COM APIs configuradas**
```javascript
🏨 Detectada pergunta sobre hotel próximo ao aeroporto - buscando dados REAIS...
✅ Google Places API configurada - buscando hotéis reais
✅ Encontrados 3 hotéis reais via Google Places API
✅ Resposta gerada com dados REAIS em 2500ms
```

### **4.4 Logs SEM APIs (normal)**
```javascript
🏨 Detectada pergunta sobre hotel próximo ao aeroporto - buscando dados REAIS...
⚠️ Google Places API key não configurada
✅ Usando base de dados verificada de MS
✅ Resposta gerada com dados locais em 1200ms
```

---

## 🎯 **5. BENEFÍCIOS DAS APIS**

### **5.1 COM Google Places API:**
- ✅ Nomes reais de hotéis próximos ao aeroporto
- ✅ Avaliações e ratings atualizados
- ✅ Distâncias precisas calculadas
- ✅ Informações de contato reais

### **5.2 COM Google Custom Search:**
- ✅ Busca informações atualizadas na web
- ✅ Notícias sobre turismo em MS
- ✅ Eventos e atividades recentes
- ✅ Informações de sites oficiais

### **5.3 SEM APIs (funciona normal):**
- ✅ Base de conhecimento expandida
- ✅ Informações verificadas sobre MS
- ✅ Respostas úteis e honestas
- ✅ Direcionamento para fontes oficiais

---

## 🚨 **IMPORTANTE**

### **Custos das APIs:**
- **Google Places**: Grátis até 1.000 consultas/mês
- **Google Search**: Grátis até 100 consultas/dia
- **Supabase**: Já incluso no plano atual

### **Sistema funciona perfeitamente SEM essas APIs!**
As APIs opcionais apenas **melhoram** a precisão, mas o Guatá já está **100% funcional** e **nunca inventa informações**.

---

## 📞 **SUPORTE**

Se tiver dúvidas:
1. **Teste primeiro SEM as APIs** (já funciona)
2. **Configure uma por vez** para testar
3. **Verifique os logs** no console (F12)
4. **API Places é mais importante** que Custom Search

---

**🎉 O Guatá já está pronto para produção mesmo sem essas APIs!**












