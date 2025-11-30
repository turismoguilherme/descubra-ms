# 🚨 CORREÇÃO: Chave do Gemini Reportada como Vazada

## ❌ Problema Identificado

A chave do Gemini API foi reportada como **vazada/comprometida** pelo Google:
```
Your API key was reported as leaked. Please use another API key.
```

Isso acontece quando uma chave é exposta publicamente (por exemplo, em código commitado no GitHub).

---

## ✅ Solução: Criar Nova Chave

### **Passo 1: Criar Nova Chave do Gemini**

1. Acesse: **https://makersuite.google.com/app/apikey**
2. Faça login com sua conta Google
3. Clique em **"Create API Key"** ou **"Criar chave de API"**
4. Selecione o projeto correto (ou crie um novo)
5. **Copie a nova chave** (ela começa com `AIza...`)

### **Passo 2: Configurar no Projeto**

**Opção A: Usar arquivo .env (RECOMENDADO)**

1. Crie ou edite o arquivo `.env` na raiz do projeto
2. Adicione a linha:
   ```env
   VITE_GEMINI_API_KEY=sua_nova_chave_aqui
   ```
3. **NÃO commite o arquivo .env no Git!**
4. Adicione `.env` ao `.gitignore` se ainda não estiver

**Opção B: Atualizar código diretamente (NÃO RECOMENDADO)**

1. Edite `src/services/ai/guataGeminiService.ts`
2. Substitua a chave na linha 61
3. ⚠️ **ATENÇÃO:** Isso expõe a chave no código!

### **Passo 3: Reiniciar o Servidor**

```bash
# Pare o servidor (Ctrl+C)
# Inicie novamente
npm run dev
```

### **Passo 4: Testar**

1. Recarregue a página do chat (Ctrl+F5)
2. Faça uma pergunta
3. Verifique o console - não deve mais aparecer o erro de "leaked"

---

## 🔒 Boas Práticas de Segurança

### ✅ **FAÇA:**
- Use variáveis de ambiente (`.env`)
- Adicione `.env` ao `.gitignore`
- Use chaves diferentes para desenvolvimento e produção
- Revogue chaves antigas após criar novas

### ❌ **NÃO FAÇA:**
- Commitar chaves no código
- Compartilhar chaves publicamente
- Usar a mesma chave em múltiplos projetos
- Deixar chaves hardcoded no código

---

## 📝 Verificação

Após configurar, verifique no console:

✅ **Sucesso:**
```
🧠 Guatá Gemini Service: CONFIGURADO
✅ Gemini respondeu com sucesso!
```

❌ **Ainda com erro:**
```
❌ GEMINI API: Chave de API foi reportada como vazada/comprometida!
```

Se ainda aparecer erro, verifique:
1. Se a variável de ambiente está configurada corretamente
2. Se o servidor foi reiniciado
3. Se a nova chave foi criada no projeto correto

---

## 🔗 Links Úteis

- **Criar nova chave:** https://makersuite.google.com/app/apikey
- **Gerenciar chaves:** https://console.cloud.google.com/apis/credentials
- **Documentação Gemini:** https://ai.google.dev/docs

---

## ⚠️ Status Atual

- ✅ **Google Custom Search:** Funcionando perfeitamente
- ❌ **Gemini API:** Chave vazada - precisa ser substituída
- ✅ **Fallback:** Sistema continua funcionando com pesquisa web

O sistema está funcionando com fallback (pesquisa web), mas as respostas serão melhores após corrigir a chave do Gemini.








