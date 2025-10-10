# 🧠 COMO OBTER API KEY DO GEMINI

## 📋 PASSO A PASSO:

### 1. **Acesse o Google AI Studio**
- Vá para: https://aistudio.google.com/
- Faça login com sua conta Google

### 2. **Crie um novo projeto**
- Clique em "Get API Key"
- Selecione "Create API Key"
- Escolha um projeto existente ou crie um novo

### 3. **Copie a API Key**
- A API Key será gerada automaticamente
- Copie a chave (começa com "AIza...")

### 4. **Configure no projeto**
- Substitua a API Key no arquivo `.env`:
```
VITE_GEMINI_API_KEY=SUA_CHAVE_AQUI
```

### 5. **Reinicie o servidor**
- Pare o servidor (Ctrl+C)
- Execute: `npm run dev`

## ⚠️ IMPORTANTE:
- A API Key atual é para Google Search, não Gemini
- Você precisa de uma API Key específica para Gemini
- A API Key do Gemini é gratuita com limites generosos

## 🔧 APÓS CONFIGURAR:
O Guatá usará o Gemini para respostas dinâmicas e inteligentes!

