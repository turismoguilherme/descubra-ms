# 🔧 Como Corrigir os Secrets no Supabase

## 📋 Passo a Passo

### 1. Criar `GOOGLE_SEARCH_API_KEY` (sem VITE_)

1. Na tela de Secrets, clique no botão **"Add Secret"** ou **"New Secret"**
2. **Nome:** `GOOGLE_SEARCH_API_KEY` (exatamente assim, sem VITE_)
3. **Valor:** Copie o valor de `VITE_GOOGLE_SEARCH_API_KEY` que já existe
4. Clique em **"Save"**

### 2. Criar `GEMINI_API_KEY` (sem VITE_)

1. Clique em **"Add Secret"** novamente
2. **Nome:** `GEMINI_API_KEY` (exatamente assim, sem VITE_)
3. **Valor:** Copie o valor de `VITE_GEMINI_API_KEY` que já existe
4. Clique em **"Save"**

### 3. Verificar `GOOGLE_SEARCH_ENGINE_ID`

- Já existe na lista ✅
- Não precisa fazer nada com essa

### 4. Sobre as variáveis VITE_*

**IMPORTANTE:** As variáveis com prefixo `VITE_` são para o **frontend** (Vite). 

- Se você **NÃO usa** essas variáveis no código frontend, pode apagar:
  - `VITE_GOOGLE_SEARCH_API_KEY`
  - `VITE_GEMINI_API_KEY`

- Se você **USA** essas variáveis no frontend, **mantenha-as** e crie também as versões sem `VITE_` para as Edge Functions

### 5. Fazer Deploy das Edge Functions

Após criar os secrets, faça um novo deploy:

```bash
supabase functions deploy guata-google-search-proxy --project-ref hvtrpkbjgbuypkskqcqm
supabase functions deploy guata-gemini-proxy --project-ref hvtrpkbjgbuypkskqcqm
```

## ✅ Checklist Final

Após configurar, você deve ter:

- ✅ `GOOGLE_SEARCH_API_KEY` (sem VITE_)
- ✅ `GOOGLE_SEARCH_ENGINE_ID` (já existe)
- ✅ `GEMINI_API_KEY` (sem VITE_)

## 🔍 Verificação

Após o deploy, teste novamente. Os logs devem mostrar:

```
🔵 guata-google-search-proxy: API Key present: true Engine ID present: true
🔵 guata-gemini-proxy: calling Gemini API with model: gemini-2.0-flash-exp
```

Se ainda aparecer `false`, verifique:
- Os nomes estão exatamente como acima (case-sensitive)
- Não há espaços extras
- O deploy foi feito após criar os secrets



