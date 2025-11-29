# 🔍 POR QUE NÃO FUNCIONA NO VERCEL?

## ❌ O PROBLEMA

**Variáveis de ambiente locais (.env) NÃO são enviadas automaticamente para o Vercel!**

### Como funciona:

1. **Localmente:**
   - Você tem um arquivo `.env` na raiz do projeto
   - O Vite lê essas variáveis durante o `npm run dev`
   - ✅ Funciona perfeitamente

2. **No Vercel:**
   - O Vercel **NÃO tem acesso** ao seu arquivo `.env` local
   - O Vercel precisa que você configure as variáveis **manualmente no painel**
   - Se não configurar, o build não terá acesso às variáveis
   - ❌ Não funciona

---

## 🎯 POR QUE ISSO ACONTECE?

### Variáveis `VITE_*` são injetadas no BUILD TIME

Quando você usa `VITE_GEMINI_API_KEY`, o Vite:
1. Lê a variável durante o **build** (não em runtime)
2. Substitui `import.meta.env.VITE_GEMINI_API_KEY` pelo valor real
3. Injeta o valor diretamente no código JavaScript gerado

**Se a variável não existir no momento do build no Vercel:**
- O valor será `undefined`
- O código gerado terá `undefined` no lugar da chave
- A API não funcionará

---

## ✅ SOLUÇÃO DEFINITIVA

### **NÃO commite o .env no Git!** (É inseguro)

### **Configure as variáveis no Vercel:**

1. **Acesse:** https://vercel.com/dashboard
2. **Selecione seu projeto**
3. **Vá em:** Settings → Environment Variables
4. **Adicione cada variável:**
   ```
   VITE_GEMINI_API_KEY = (cole sua chave aqui)
   VITE_GOOGLE_SEARCH_API_KEY = (se usar)
   VITE_GOOGLE_SEARCH_ENGINE_ID = (se usar)
   VITE_SUPABASE_URL = (sua URL)
   VITE_SUPABASE_ANON_KEY = (sua chave)
   ```
5. **IMPORTANTE:** Marque os ambientes:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development
6. **Salve**
7. **Faça um redeploy** (essencial!)

---

## 🔒 SEGURANÇA

### ❌ NÃO FAÇA:
- Commitar `.env` no Git
- Compartilhar chaves em mensagens
- Deixar chaves no código

### ✅ FAÇA:
- Use `.env` local (já está no `.gitignore`)
- Configure no Vercel manualmente
- Use `.env.example` como template (sem valores reais)

---

## 📋 CHECKLIST

- [ ] `.env` está no `.gitignore` ✅ (já está)
- [ ] Variáveis configuradas no Vercel ❌ (você precisa fazer)
- [ ] Variáveis marcadas para Production/Preview/Development ❌
- [ ] Redeploy feito após configurar ❌

---

## 🚀 APÓS CONFIGURAR

1. Faça um redeploy no Vercel
2. Aguarde o build completar
3. Teste no site do Vercel
4. Verifique o console do navegador:
   - ✅ `🧠 Guatá Gemini Service: CONFIGURADO` = Sucesso!
   - ❌ `NÃO CONFIGURADO` = Variável ainda não configurada

---

## 💡 RESUMO

**O problema NÃO é o Git, é o Vercel não ter as variáveis configuradas!**

- Local: Tem `.env` → Funciona ✅
- Vercel: Não tem variáveis configuradas → Não funciona ❌
- Solução: Configurar manualmente no painel do Vercel → Funciona ✅

