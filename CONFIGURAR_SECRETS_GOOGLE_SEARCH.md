# 🔧 Configurar Secrets do Google Search no Supabase

## ⚠️ Problema
A Edge Function `guata-google-search-proxy` está falhando porque os secrets não estão configurados.

## ✅ Solução Rápida (2 minutos)

### Passo 1: Acessar Secrets do Supabase

1. Acesse: https://app.supabase.com
2. Selecione seu projeto
3. Vá em **Settings** → **Edge Functions** → **Secrets**
   - Ou acesse diretamente: https://supabase.com/dashboard/project/hvtrpkbjgbuypkskqcqm/settings/functions

### Passo 2: Adicionar Secrets

Clique em **"Add Secret"** e adicione:

#### 1. GOOGLE_SEARCH_API_KEY
- **Nome:** `GOOGLE_SEARCH_API_KEY`
- **Valor:** Sua chave da Google Custom Search API
- **Como obter:**
  1. Acesse: https://console.cloud.google.com/apis/credentials
  2. Selecione o projeto: `gen-lang-client-0847008941` (GuataIA)
  3. Clique em "Create Credentials" → "API Key"
  4. Copie a chave gerada
  5. Cole no Supabase

#### 2. GOOGLE_SEARCH_ENGINE_ID
- **Nome:** `GOOGLE_SEARCH_ENGINE_ID`
- **Valor:** `a3641e1665f7b4909` (já configurado como fallback no código)
- **Ou crie um novo:**
  1. Acesse: https://cse.google.com/cse/
  2. Crie um novo Search Engine
  3. Configure para buscar em "toda a web"
  4. Copie o "Search Engine ID"
  5. Cole no Supabase

### Passo 3: Verificar

Após adicionar os secrets, teste novamente. Os logs devem mostrar:

```
🔵 guata-google-search-proxy: Verificando configuração...
   GOOGLE_SEARCH_API_KEY: ✅ present
   GOOGLE_SEARCH_ENGINE_ID: ✅ present
```

## 🔍 Verificar se Funcionou

1. Teste fazendo uma pergunta no chat do Guatá
2. Abra o console do navegador (F12)
3. Procure por: `[Web Search] ✅ Edge Function funcionou!`

Se ainda não funcionar, verifique os logs da Edge Function:
- Dashboard → Edge Functions → guata-google-search-proxy → Logs

## ⚠️ Importante

- Os secrets são **case-sensitive** (maiúsculas/minúsculas importam)
- Não use `VITE_` no nome (isso é só para frontend)
- Após adicionar secrets, pode levar alguns segundos para ficarem disponíveis

