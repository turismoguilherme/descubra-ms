# 🔍 DIAGNÓSTICO: Guatá não funciona no Vercel

## 🎯 PROBLEMA
O Guatá funciona localmente mas não no Vercel após deploy.

## 🔎 CAUSAS POSSÍVEIS

### 1. **Variáveis de Ambiente não Configuradas no Vercel** ⚠️ (MAIS COMUM)

As variáveis de ambiente do `.env` local **NÃO são automaticamente enviadas** para o Vercel. Você precisa configurá-las manualmente no painel do Vercel.

#### ✅ SOLUÇÃO:

1. **Acesse o painel do Vercel:**
   - Vá para: https://vercel.com/dashboard
   - Selecione seu projeto

2. **Configure as variáveis de ambiente:**
   - Vá em **Settings** → **Environment Variables**
   - Adicione as seguintes variáveis (uma por uma):

   ```
   VITE_GEMINI_API_KEY=sua_chave_gemini_aqui
   VITE_GOOGLE_SEARCH_API_KEY=sua_chave_google_aqui
   VITE_GOOGLE_SEARCH_ENGINE_ID=seu_engine_id_aqui
   VITE_SUPABASE_URL=sua_url_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_supabase
   ```

3. **IMPORTANTE: Selecione os ambientes:**
   - ✅ Production
   - ✅ Preview
   - ✅ Development
   
   (Marque todos os três para garantir que funcione em todos os ambientes)

4. **Redeploy após adicionar variáveis:**
   - Após adicionar as variáveis, você **DEVE fazer um novo deploy**
   - Vá em **Deployments** → Clique nos três pontos (⋯) → **Redeploy**
   - Ou faça um novo commit e push

---

### 2. **Variável com Nome Errado** ⚠️

No Vercel, variáveis que começam com `VITE_` são expostas ao frontend durante o build. Se você adicionou sem o prefixo `VITE_`, não funcionará.

#### ✅ SOLUÇÃO:
- Certifique-se de que a variável no Vercel é exatamente: `VITE_GEMINI_API_KEY` (não `GEMINI_API_KEY`)

---

### 3. **Build Cache do Vercel** ⚠️

O Vercel pode estar usando um build antigo em cache que não tem as variáveis.

#### ✅ SOLUÇÃO:
1. Vá em **Deployments**
2. Clique nos três pontos (⋯) do último deploy
3. Selecione **Redeploy**
4. Ou faça um commit vazio para forçar novo build:
   ```bash
   git commit --allow-empty -m "Force redeploy"
   git push
   ```

---

### 4. **Timeout ou Limites de API** ⚠️

O Vercel tem timeouts diferentes do ambiente local. Se a API do Gemini demorar muito, pode dar timeout.

#### ✅ VERIFICAÇÃO:
- Verifique os logs do Vercel em **Deployments** → Clique no deploy → **Logs**
- Procure por erros de timeout ou rate limit

---

## 🛠️ PASSO A PASSO COMPLETO PARA CORRIGIR

### Passo 1: Verificar Variáveis Locais
```bash
# No terminal, verifique se você tem um .env local
cat .env | grep VITE_GEMINI_API_KEY
```

### Passo 2: Configurar no Vercel
1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** → **Environment Variables**
4. Adicione cada variável:
   - Key: `VITE_GEMINI_API_KEY`
   - Value: (cole a chave do seu .env local)
   - Environments: ✅ Production ✅ Preview ✅ Development
5. Clique em **Save**

### Passo 3: Redeploy
1. Vá em **Deployments**
2. Clique nos três pontos (⋯) do último deploy
3. Selecione **Redeploy**
4. Aguarde o build completar

### Passo 4: Verificar
1. Acesse seu site no Vercel
2. Abra o console do navegador (F12)
3. Procure por:
   - ✅ `🧠 Guatá Gemini Service: CONFIGURADO` (sucesso)
   - ❌ `🧠 Guatá Gemini Service: NÃO CONFIGURADO` (erro)

---

## 🔍 COMO VERIFICAR SE ESTÁ FUNCIONANDO

### No Console do Navegador (F12):

**✅ SUCESSO:**
```
🧠 Guatá Gemini Service: CONFIGURADO com API key específica do Guatá
🧠 [DEBUG] Tentando modelo: models/gemini-2.0-flash-001
✅ [SUCESSO] Modelo models/gemini-2.0-flash-001 funcionou!
```

**❌ ERRO (variável não configurada):**
```
🧠 Guatá Gemini Service: NÃO CONFIGURADO - API Key ausente
⚠️ Gemini não configurado, usando fallback
```

**❌ ERRO (chave inválida):**
```
❌ Erro na chamada do Gemini: API key not valid
```

---

## 📋 CHECKLIST DE VERIFICAÇÃO

- [ ] Variável `VITE_GEMINI_API_KEY` adicionada no Vercel
- [ ] Variável marcada para Production, Preview e Development
- [ ] Redeploy feito após adicionar variáveis
- [ ] Console do navegador mostra "CONFIGURADO"
- [ ] Guatá responde corretamente no site do Vercel

---

## 🆘 AINDA NÃO FUNCIONA?

### Verificar Logs do Vercel:
1. Vá em **Deployments** → Clique no deploy → **Logs**
2. Procure por erros relacionados a:
   - `VITE_GEMINI_API_KEY`
   - `Gemini`
   - `API key`

### Verificar Build:
1. Vá em **Deployments** → Clique no deploy → **Build Logs**
2. Verifique se o build completou com sucesso
3. Procure por avisos sobre variáveis de ambiente

### Testar Localmente com Build de Produção:
```bash
# Simular build de produção localmente
npm run build
npm run preview
```
Se funcionar localmente mas não no Vercel, é definitivamente problema de variáveis de ambiente no Vercel.

---

## 💡 DICA IMPORTANTE

**Variáveis de ambiente no Vercel são diferentes do `.env` local!**

- `.env` local → Só funciona no seu computador
- Vercel Environment Variables → Só funciona no Vercel
- Você precisa configurar **ambos separadamente**

---

## 📞 PRÓXIMOS PASSOS

1. ✅ Configure as variáveis no Vercel
2. ✅ Faça um redeploy
3. ✅ Teste no site do Vercel
4. ✅ Verifique o console do navegador

Se ainda não funcionar após seguir todos os passos, verifique os logs do Vercel para identificar o erro específico.

