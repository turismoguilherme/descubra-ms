# 🧠 COMO CONFIGURAR A API DO GEMINI

## 📍 ONDE COLOCAR A CHAVE

### **Opção 1: Arquivo .env (RECOMENDADO) ✅**

1. **Crie o arquivo `.env` na raiz do projeto** (mesmo nível do `package.json`)

2. **Adicione a linha:**
   ```env
   VITE_GEMINI_API_KEY=sua_chave_aqui
   ```

3. **Exemplo completo do arquivo `.env`:**
   ```env
   # Gemini API
   VITE_GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   
   # Google Search (opcional)
   VITE_GOOGLE_SEARCH_API_KEY=sua_chave_google_aqui
   VITE_GOOGLE_SEARCH_ENGINE_ID=seu_engine_id_aqui
   ```

4. **Reinicie o servidor:**
   ```bash
   # Pare o servidor (Ctrl+C)
   npm run dev
   ```

---

### **Opção 2: Diretamente no código (NÃO RECOMENDADO) ❌**

⚠️ **ATENÇÃO:** Isso expõe a chave no código e pode ser commitado no Git!

1. Edite: `src/services/ai/guataGeminiService.ts`
2. Linha 63, substitua:
   ```typescript
   private readonly GUATA_API_KEY = 
     (import.meta.env.VITE_GEMINI_API_KEY || 'SUA_CHAVE_AQUI').trim();
   ```

---

## 🔑 COMO OBTER A CHAVE DO GEMINI

### **Passo 1: Acesse o Google AI Studio**
- URL: **https://makersuite.google.com/app/apikey**
- OU: **https://aistudio.google.com/app/apikey**

### **Passo 2: Faça login**
- Use sua conta Google

### **Passo 3: Crie a chave**
- Clique em **"Get API Key"** ou **"Criar chave de API"**
- Selecione um projeto existente ou crie um novo
- A chave será gerada automaticamente (começa com `AIza...`)

### **Passo 4: Copie a chave**
- Copie a chave completa
- Cole no arquivo `.env`

---

## ✅ VERIFICAÇÃO

Após configurar, verifique no console do navegador:

✅ **Sucesso:**
```
🧠 Guatá Gemini Service: CONFIGURADO com API key específica do Guatá
✅ Gemini respondeu com sucesso!
```

❌ **Erro:**
```
❌ GEMINI API: Chave de API foi reportada como vazada/comprometida!
```

---

## 🔒 SEGURANÇA

### ✅ **FAÇA:**
- Use arquivo `.env` (já está no `.gitignore`)
- Mantenha a chave privada
- Use chaves diferentes para dev e produção

### ❌ **NÃO FAÇA:**
- Commitar `.env` no Git
- Compartilhar chaves publicamente
- Deixar chaves hardcoded no código

---

## 📝 ESTRUTURA DO PROJETO

```
descubra-ms/
├── .env                    ← CRIE AQUI (não existe ainda)
├── .env.example           ← Exemplo (já existe)
├── .gitignore             ← Já tem .env configurado
├── package.json
└── src/
    └── services/
        └── ai/
            └── guataGeminiService.ts  ← Lê VITE_GEMINI_API_KEY
```

---

## 🚀 PRÓXIMOS PASSOS

1. ✅ Criar arquivo `.env` na raiz
2. ✅ Adicionar `VITE_GEMINI_API_KEY=sua_chave`
3. ✅ Reiniciar servidor (`npm run dev`)
4. ✅ Testar no chat

---

## 🆘 PROBLEMAS COMUNS

### **"Chave não encontrada"**
- Verifique se o arquivo `.env` está na raiz do projeto
- Verifique se a variável começa com `VITE_`
- Reinicie o servidor após criar/editar `.env`

### **"Chave vazada"**
- A chave antiga foi comprometida
- Crie uma nova chave no Google AI Studio
- Substitua no `.env`

### **"Variável não carrega"**
- Certifique-se de que o servidor foi reiniciado
- Verifique se não há espaços extras na chave
- Use `console.log(import.meta.env.VITE_GEMINI_API_KEY)` para debugar

