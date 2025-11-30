# 🚀 Como Fazer Deploy das Edge Functions

## ⚠️ Problema com .env

O Supabase CLI está tendo problemas para ler o arquivo `.env`. Vamos fazer o deploy pelo **Dashboard do Supabase** (mais simples e direto).

## 📋 Método 1: Dashboard do Supabase (RECOMENDADO)

### Passo 1: Acessar o Dashboard
1. Acesse: https://supabase.com/dashboard
2. Faça login
3. Selecione o projeto: **hvtrpkbjgbuypkskqcqm**

### Passo 2: Acessar Edge Functions
1. No menu lateral, clique em **"Edge Functions"**
2. Ou acesse diretamente: https://supabase.com/dashboard/project/hvtrpkbjgbuypkskqcqm/functions

### Passo 3: Criar/Deploy da função `guata-gemini-proxy`
1. Clique em **"Create a new function"** ou **"New Function"**
2. Nome da função: `guata-gemini-proxy`
3. Copie e cole o conteúdo do arquivo: `supabase/functions/guata-gemini-proxy/index.ts`
4. Clique em **"Deploy"**

### Passo 4: Criar/Deploy da função `guata-google-search-proxy`
1. Clique em **"Create a new function"** novamente
2. Nome da função: `guata-google-search-proxy`
3. Copie e cole o conteúdo do arquivo: `supabase/functions/guata-google-search-proxy/index.ts`
4. Clique em **"Deploy"**

### Passo 5: Configurar Secrets (VARIÁVEIS DE AMBIENTE)
1. No menu lateral, vá em **"Settings"** → **"Edge Functions"** → **"Secrets"**
2. Ou acesse: https://supabase.com/dashboard/project/hvtrpkbjgbuypkskqcqm/settings/functions
3. Adicione as seguintes variáveis:

   ```
   GEMINI_API_KEY=sua_chave_gemini_aqui
   GOOGLE_SEARCH_API_KEY=sua_chave_google_search_aqui
   GOOGLE_SEARCH_ENGINE_ID=seu_engine_id_aqui
   ```

4. Clique em **"Save"** para cada variável

## 📋 Método 2: Via CLI (se resolver o problema do .env)

### Opção A: Corrigir o .env
1. Verifique o arquivo `.env` na raiz do projeto
2. Certifique-se de que não há linhas vazias ou caracteres especiais
3. Cada variável deve estar em uma linha: `VARIAVEL=valor`

### Opção B: Usar .env.local
1. Renomeie `.env` para `.env.backup`
2. Crie um novo `.env` apenas com as variáveis necessárias
3. Tente o deploy novamente

### Comandos para deploy:
```bash
# Deploy da função Gemini
supabase functions deploy guata-gemini-proxy --project-ref hvtrpkbjgbuypkskqcqm

# Deploy da função Google Search
supabase functions deploy guata-google-search-proxy --project-ref hvtrpkbjgbuypkskqcqm
```

## ✅ Verificar se Deploy Funcionou

### Teste 1: No Dashboard
1. Vá em **Edge Functions**
2. Você deve ver as duas funções listadas:
   - `guata-gemini-proxy`
   - `guata-google-search-proxy`

### Teste 2: No Console do Navegador
1. Abra o DevTools (F12)
2. Faça uma pergunta no Guatá
3. Procure por requisições para:
   - `guata-gemini-proxy`
   - `guata-google-search-proxy`
4. **Se funcionar:** Você verá `✅ Edge Function funcionou! (chaves protegidas)`
5. **Se não funcionar:** Você verá o erro de CORS (que significa que precisa fazer o deploy)

## 🔧 Troubleshooting

### Erro: "Function not found"
- A função não foi deployada ainda
- Faça o deploy pelo Dashboard

### Erro: "CORS policy"
- A função foi deployada mas os headers CORS não estão corretos
- Verifique se o código das Edge Functions está atualizado

### Erro: "API key not configured"
- As variáveis de ambiente não foram configuradas no Supabase
- Vá em Settings → Edge Functions → Secrets e adicione as chaves

## 📝 Checklist Final

- [ ] Edge Function `guata-gemini-proxy` deployada
- [ ] Edge Function `guata-google-search-proxy` deployada
- [ ] `GEMINI_API_KEY` configurada nos Secrets
- [ ] `GOOGLE_SEARCH_API_KEY` configurada nos Secrets
- [ ] `GOOGLE_SEARCH_ENGINE_ID` configurado nos Secrets
- [ ] Testado no navegador - Edge Functions funcionando
- [ ] Logs mostram: `✅ Edge Function funcionou!`

## 🎯 Próximos Passos

Depois de fazer o deploy:
1. Teste o Guatá fazendo uma pergunta
2. Verifique no console se aparece: `✅ Edge Function funcionou!`
3. Se aparecer, está tudo funcionando! 🎉
4. As chaves estão protegidas no servidor



