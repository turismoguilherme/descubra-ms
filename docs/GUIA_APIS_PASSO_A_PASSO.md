# 🔑 Guia Completo: Como Obter APIs Necessárias

## 📋 APIs Necessárias (em ordem de prioridade)

### ✅ **1. Gemini API (Google AI Studio)** - OBRIGATÓRIO
**Status:** Provavelmente já tem  
**Uso:** Revenue Optimizer, DocumentProcessor, análises de IA

### ⚠️ **2. Google Custom Search API** - RECOMENDADO
**Status:** Precisa configurar  
**Uso:** Busca de eventos, validação de atrações

### ⚠️ **3. OpenWeather API** - OPCIONAL
**Status:** Precisa configurar  
**Uso:** Fator clima no Revenue Optimizer

### ⚠️ **4. Google Places API** - OPCIONAL
**Status:** Precisa configurar  
**Uso:** Validação de endereços e atrações

---

## 🚀 PASSO A PASSO DETALHADO

### **1. GEMINI API (Google AI Studio)**

#### **Por que precisa:**
- Revenue Optimizer usa Gemini para calcular preços
- DocumentProcessor extrai dados de documentos
- Análises inteligentes de negócios

#### **Como obter:**

1. **Acesse:** https://aistudio.google.com/app/apikey
2. **Faça login** com sua conta Google
3. **Clique em:** "Create API Key" ou "Get API Key"
4. **Selecione o projeto** (ou crie um novo)
5. **Copie a chave** gerada
6. **Adicione no `.env`:**
   ```env
   VITE_GEMINI_API_KEY=sua_chave_aqui
   ```

#### **Custo:**
- ✅ **GRÁTIS** até 15 requisições/minuto
- ✅ **GRÁTIS** até 1.500 requisições/dia
- 💰 Pago: $0.000125 por 1K tokens (após limite)

#### **Limites gratuitos:**
- 15 RPM (requests per minute)
- 1.500 RPD (requests per day)
- Suficiente para uso moderado

---

### **2. GOOGLE CUSTOM SEARCH API**

#### **Por que precisa:**
- Buscar eventos automaticamente na web
- Validar informações de atrações
- Enriquecer dados de negócios

#### **Como obter:**

**PASSO 1: Criar Engine de Busca**

1. **Acesse:** https://cse.google.com/cse/
2. **Clique em:** "Add" para criar novo engine
3. **Configure:**
   - **Nome:** "ViaJAR Tourism Search"
   - **Sites para pesquisar:** Deixe em branco (busca toda web)
   - **Idioma:** Português (Brasil)
4. **Clique em:** "Create"
5. **Anote o Search Engine ID** (aparece na URL ou em "Setup")

**PASSO 2: Obter API Key**

1. **Acesse:** https://console.cloud.google.com/
2. **Selecione ou crie um projeto**
3. **Vá em:** "APIs & Services" > "Library"
4. **Busque por:** "Custom Search API"
5. **Clique em:** "Enable" (ativar)
6. **Vá em:** "APIs & Services" > "Credentials"
7. **Clique em:** "Create Credentials" > "API Key"
8. **Copie a chave** gerada
9. **(Opcional) Restrinja a chave:**
   - Clique na chave criada
   - Em "API restrictions", selecione "Restrict key"
   - Marque apenas "Custom Search API"
   - Salve

**PASSO 3: Configurar no projeto**

Adicione no `.env`:
```env
VITE_GOOGLE_SEARCH_API_KEY=sua_api_key_aqui
VITE_GOOGLE_SEARCH_ENGINE_ID=seu_engine_id_aqui
```

#### **Custo:**
- ✅ **GRÁTIS** até 100 requisições/dia
- 💰 Pago: $5 por 1.000 requisições (após 100/dia)

#### **Limites gratuitos:**
- 100 requisições/dia
- Suficiente para ~3 buscas por dia

---

### **3. OPENWEATHER API**

#### **Por que precisa:**
- Fator clima no Revenue Optimizer
- Ajustar preços baseado em previsão do tempo
- Melhorar previsão de demanda

#### **Como obter:**

1. **Acesse:** https://openweathermap.org/api
2. **Clique em:** "Sign Up" (criar conta)
3. **Preencha o formulário:**
   - Nome
   - Email
   - Senha
   - Aceite os termos
4. **Verifique seu email** (clique no link enviado)
5. **Faça login** na plataforma
6. **Vá em:** "API Keys" (menu superior)
7. **Copie a chave** gerada (chave padrão)
8. **Adicione no `.env`:**
   ```env
   VITE_OPENWEATHER_API_KEY=sua_chave_aqui
   ```

#### **Custo:**
- ✅ **GRÁTIS** até 60 requisições/minuto
- ✅ **GRÁTIS** até 1.000.000 requisições/mês
- 💰 Pago: A partir de $40/mês (após limite)

#### **Limites gratuitos:**
- 60 RPM
- 1M requisições/mês
- ✅ **Mais que suficiente!**

---

### **4. GOOGLE PLACES API (Opcional)**

#### **Por que precisa:**
- Validar endereços de atrações
- Buscar coordenadas GPS
- Enriquecer dados de negócios

#### **Como obter:**

1. **Acesse:** https://console.cloud.google.com/
2. **Selecione o mesmo projeto** usado para Custom Search
3. **Vá em:** "APIs & Services" > "Library"
4. **Busque por:** "Places API"
5. **Clique em:** "Enable" (ativar)
6. **Vá em:** "APIs & Services" > "Credentials"
7. **Use a mesma API Key** do Custom Search OU crie uma nova
8. **Se criar nova, restrinja para Places API**
9. **Adicione no `.env`:**
   ```env
   VITE_GOOGLE_PLACES_API_KEY=sua_chave_aqui
   ```

#### **Custo:**
- ✅ **GRÁTIS** até $200 créditos/mês
- 💰 Pago: $0.017 por requisição (após crédito)

#### **Limites gratuitos:**
- ~11.000 requisições/mês (dentro do crédito)
- ✅ **Suficiente para uso moderado**

---

## 📝 RESUMO: Variáveis de Ambiente

Adicione todas no arquivo `.env` na raiz do projeto:

```env
# ===========================================
# 🤖 GEMINI AI (OBRIGATÓRIO)
# ===========================================
VITE_GEMINI_API_KEY=sua_chave_gemini_aqui

# ===========================================
# 🔍 GOOGLE CUSTOM SEARCH (RECOMENDADO)
# ===========================================
VITE_GOOGLE_SEARCH_API_KEY=sua_chave_google_search_aqui
VITE_GOOGLE_SEARCH_ENGINE_ID=seu_engine_id_aqui

# ===========================================
# 🌤️ OPENWEATHER (OPCIONAL)
# ===========================================
VITE_OPENWEATHER_API_KEY=sua_chave_openweather_aqui

# ===========================================
# 📍 GOOGLE PLACES (OPCIONAL)
# ===========================================
VITE_GOOGLE_PLACES_API_KEY=sua_chave_places_aqui
```

---

## ✅ CHECKLIST DE CONFIGURAÇÃO

Marque conforme for configurando:

- [ ] **Gemini API Key** obtida e adicionada no `.env`
- [ ] **Google Custom Search:**
  - [ ] Engine criado
  - [ ] API Key obtida
  - [ ] Custom Search API ativada
  - [ ] Variáveis adicionadas no `.env`
- [ ] **OpenWeather API Key** obtida e adicionada no `.env`
- [ ] **Google Places API** (opcional):
  - [ ] Places API ativada
  - [ ] API Key configurada
  - [ ] Variável adicionada no `.env`
- [ ] **Reiniciado o servidor** (`npm run dev`)

---

## 🧪 TESTAR CONFIGURAÇÃO

Após configurar, teste se está funcionando:

1. **Reinicie o servidor:**
   ```bash
   npm run dev
   ```

2. **Verifique no console do navegador:**
   - Não deve aparecer erros de API não configurada
   - Revenue Optimizer deve funcionar
   - Busca de eventos deve funcionar (se configurado)

3. **Teste manual:**
   - Acesse o Revenue Optimizer
   - Tente calcular um preço sugerido
   - Verifique se usa Gemini (não fallback)

---

## 💡 DICAS IMPORTANTES

### **Segurança:**
- ✅ **NUNCA** commite o arquivo `.env` no Git
- ✅ Adicione `.env` no `.gitignore`
- ✅ Use variáveis de ambiente no servidor de produção

### **Economia:**
- ✅ Configure limites de uso nas APIs do Google
- ✅ Monitore uso no Google Cloud Console
- ✅ Use cache quando possível (já implementado)

### **Problemas Comuns:**

**"API não configurada":**
- Verifique se as variáveis começam com `VITE_`
- Reinicie o servidor após adicionar variáveis
- Verifique se não há espaços extras nas chaves

**"Limite excedido":**
- Google Custom Search: 100/dia (gratuito)
- Gemini: 1.500/dia (gratuito)
- Aguarde 24h ou use plano pago

**"Erro 403/401":**
- Verifique se a API está ativada no console
- Verifique se a chave está correta
- Verifique restrições de IP/domínio (se configuradas)

---

## 📞 SUPORTE

Se tiver problemas:
1. Verifique os logs do console do navegador
2. Verifique os logs do servidor (terminal)
3. Teste as APIs diretamente (usando curl ou Postman)
4. Verifique documentação oficial de cada API

---

**Última atualização:** 2025-01-20

