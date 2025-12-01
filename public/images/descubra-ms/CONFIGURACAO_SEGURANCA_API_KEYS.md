# 🔒 CONFIGURAÇÃO SEGURA DE API KEYS - GUATÁ

## ⚠️ PROBLEMA RESOLVIDO

As chaves de API do Gemini e Google Search estavam sendo expostas no frontend, causando:
- Relatórios de segurança
- Bloqueio das APIs
- Funcionamento apenas com fallback

## ✅ SOLUÇÃO IMPLEMENTADA

Criamos **Edge Functions** no Supabase que mantêm as chaves no servidor (nunca expostas ao cliente).

### Edge Functions Criadas:
1. **`guata-gemini-proxy`** - Proxy seguro para Gemini API
2. **`guata-google-search-proxy`** - Proxy seguro para Google Search API

## 📋 CONFIGURAÇÃO NECESSÁRIA

### 1. Configurar Variáveis de Ambiente no Supabase

As chaves devem ser configuradas no **Supabase Dashboard**, não no `.env` do frontend.

#### Passo a Passo:

1. **Acesse o Supabase Dashboard:**
   - URL: https://supabase.com/dashboard
   - Selecione seu projeto

2. **Vá em Settings → Edge Functions → Secrets:**
   - Ou acesse: `Settings` → `Edge Functions` → `Secrets`

3. **Adicione as seguintes variáveis:**

   ```
   GEMINI_API_KEY=sua_chave_gemini_aqui
   GOOGLE_SEARCH_API_KEY=sua_chave_google_search_aqui
   GOOGLE_SEARCH_ENGINE_ID=seu_engine_id_aqui
   ```

4. **Como obter as chaves:**

   **Gemini API Key:**
   - Acesse: https://aistudio.google.com/app/apikey
   - Crie uma nova chave
   - Copie e cole no Supabase

   **Google Search API Key:**
   - Acesse: https://console.cloud.google.com/apis/credentials
   - Ative "Custom Search API"
   - Crie credenciais (API Key)
   - Copie e cole no Supabase

   **Google Search Engine ID:**
   - Acesse: https://cse.google.com/cse/
   - Crie um mecanismo de busca personalizado
   - Configure para buscar em "toda a web"
   - Copie o "Search Engine ID"
   - Cole no Supabase

### 2. Deploy das Edge Functions

As Edge Functions já foram criadas em:
- `supabase/functions/guata-gemini-proxy/`
- `supabase/functions/guata-google-search-proxy/`

Para fazer deploy:

```bash
# Instalar Supabase CLI (se ainda não tiver)
npm install -g supabase

# Fazer login
supabase login

# Linkar ao projeto
supabase link --project-ref seu-project-ref

# Deploy das funções
supabase functions deploy guata-gemini-proxy
supabase functions deploy guata-google-search-proxy
```

## 🔄 COMO FUNCIONA AGORA

### Antes (INSEGURO ❌):
```
Frontend → Chama Gemini API diretamente → Chave exposta no JavaScript
```

### Agora (SEGURO ✅):
```
Frontend → Edge Function → Gemini API → Chave protegida no servidor
```

## 🛡️ SEGURANÇA

### ✅ O que está protegido:
- Chaves de API nunca aparecem no código JavaScript do cliente
- Chaves armazenadas apenas no servidor (Supabase)
- Edge Functions validam e protegem as requisições

### ⚠️ Fallback mantido:
- Se a Edge Function falhar, o código antigo ainda funciona
- Isso garante que o Guatá continue funcionando mesmo durante a migração
- **IMPORTANTE:** Depois de configurar as Edge Functions, você pode remover as variáveis `VITE_*` do `.env` do frontend

## 📝 CHECKLIST DE MIGRAÇÃO

- [ ] Configurar `GEMINI_API_KEY` no Supabase Secrets
- [ ] Configurar `GOOGLE_SEARCH_API_KEY` no Supabase Secrets
- [ ] Configurar `GOOGLE_SEARCH_ENGINE_ID` no Supabase Secrets
- [ ] Fazer deploy das Edge Functions
- [ ] Testar o Guatá funcionando
- [ ] (Opcional) Remover `VITE_GEMINI_API_KEY` do `.env` do frontend
- [ ] (Opcional) Remover `VITE_GOOGLE_SEARCH_API_KEY` do `.env` do frontend
- [ ] (Opcional) Remover `VITE_GOOGLE_SEARCH_ENGINE_ID` do `.env` do frontend

## 🧪 TESTE

Após configurar, teste se está funcionando:

1. Abra o DevTools do navegador
2. Vá em Network
3. Faça uma pergunta no Guatá
4. Procure por requisições para `guata-gemini-proxy` ou `guata-google-search-proxy`
5. **IMPORTANTE:** Verifique que as chaves de API NÃO aparecem em nenhum lugar do código JavaScript

## 🚨 TROUBLESHOOTING

### Edge Function retorna erro 500:
- Verifique se as variáveis de ambiente estão configuradas no Supabase
- Verifique se os nomes das variáveis estão corretos (case-sensitive)

### Edge Function retorna erro 403:
- A chave pode ter sido reportada como vazada
- Crie uma nova chave e atualize no Supabase

### Guatá ainda usa método antigo:
- Isso é normal! O código tem fallback automático
- Verifique os logs do console para ver qual método está sendo usado
- Se a Edge Function estiver funcionando, você verá: `✅ Edge Function funcionou!`

## 📚 DOCUMENTAÇÃO ADICIONAL

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase Secrets](https://supabase.com/docs/guides/functions/secrets)
- [Google Gemini API](https://ai.google.dev/docs)
- [Google Custom Search API](https://developers.google.com/custom-search/v1/overview)

