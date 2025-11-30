# 🔧 Como Configurar Variáveis de Ambiente no Supabase

## ⚠️ Problema Identificado

As Edge Functions estão retornando:
- `GOOGLE_SEARCH_API_KEY e GOOGLE_SEARCH_ENGINE_ID não estão configuradas`
- `GEMINI_API_KEY não está configurada`

## ✅ Solução: Configurar Secrets nas Edge Functions

### Passo 1: Acessar o Dashboard do Supabase

1. Acesse: https://supabase.com/dashboard/project/hvtrpkbjgbuypkskqcqm
2. No menu lateral, clique em **Edge Functions**
3. Clique na função que você quer configurar (ex: `guata-google-search-proxy`)

### Passo 2: Configurar Secrets (Variáveis de Ambiente)

**IMPORTANTE:** As variáveis de ambiente das Edge Functions são chamadas de **"Secrets"** no Supabase.

#### Para `guata-google-search-proxy`:

1. Na página da função, procure por **"Secrets"** ou **"Environment Variables"**
2. Clique em **"Add Secret"** ou **"Manage Secrets"**
3. Adicione as seguintes variáveis:

   - **Nome:** `GOOGLE_SEARCH_API_KEY`
   - **Valor:** Sua chave da API do Google Custom Search
   
   - **Nome:** `GOOGLE_SEARCH_ENGINE_ID`
   - **Valor:** Seu Engine ID do Google Custom Search (ex: `d29ed853fc8e94830`)

#### Para `guata-gemini-proxy`:

1. Na página da função `guata-gemini-proxy`, procure por **"Secrets"**
2. Clique em **"Add Secret"**
3. Adicione:

   - **Nome:** `GEMINI_API_KEY`
   - **Valor:** Sua chave da API do Google Gemini

### Passo 3: Verificar se as Variáveis Foram Configuradas

Após adicionar as variáveis:

1. **IMPORTANTE:** Faça um novo deploy da função para que as variáveis sejam carregadas:
   ```bash
   supabase functions deploy guata-google-search-proxy --project-ref hvtrpkbjgbuypkskqcqm
   supabase functions deploy guata-gemini-proxy --project-ref hvtrpkbjgbuypkskqcqm
   ```

2. Ou use o botão **"Redeploy"** no dashboard do Supabase

### Passo 4: Verificar os Logs

Após o deploy, teste novamente e verifique os logs:

1. No dashboard do Supabase, vá em **Edge Functions** > **guata-google-search-proxy** > **Logs**
2. Procure por mensagens como:
   - `🔵 guata-google-search-proxy: API Key present: true Engine ID present: true` ✅
   - `❌ Google Search API keys não configuradas` ❌

## 🔍 Onde Encontrar as Chaves

### Google Custom Search API

1. Acesse: https://console.cloud.google.com/apis/credentials
2. Crie uma chave de API (ou use uma existente)
3. Para o Engine ID, acesse: https://programmablesearchengine.google.com/controlpanel/all
4. Selecione seu search engine e copie o **Search engine ID**

### Google Gemini API

1. Acesse: https://aistudio.google.com/app/apikey
2. Crie uma nova chave de API ou use uma existente

## ⚠️ Problemas Comuns

### "Já configurei mas ainda não funciona"

1. **Verifique os nomes das variáveis:**
   - Devem ser EXATAMENTE: `GOOGLE_SEARCH_API_KEY`, `GOOGLE_SEARCH_ENGINE_ID`, `GEMINI_API_KEY`
   - Case-sensitive (maiúsculas/minúsculas importam)

2. **Verifique se configurou como "Secret" e não como variável de ambiente do projeto:**
   - Edge Functions usam "Secrets" específicos de cada função
   - Não são as variáveis de ambiente gerais do projeto

3. **Faça um novo deploy após configurar:**
   - As variáveis só são carregadas quando a função é deployada
   - Use o botão "Redeploy" no dashboard ou faça deploy via CLI

4. **Verifique se não há espaços extras:**
   - Copie e cole os valores sem espaços no início ou fim

## ✅ Verificação Final

Após configurar e fazer deploy, os logs devem mostrar:

```
🔵 guata-google-search-proxy: API Key present: true Engine ID present: true
🔵 guata-gemini-proxy: calling Gemini API with model: gemini-2.0-flash-exp
```

Se ainda aparecer `false`, as variáveis não foram configuradas corretamente.



