# Guia Completo de Segurança - Prevenção de Vazamento de API Keys

## Problema Crítico Identificado

As chaves de API estão sendo expostas no console do navegador através de logs de debug. Isso é um **risco crítico de segurança** porque:

1. Qualquer pessoa pode ver as chaves no console do navegador
2. Chaves podem ser roubadas e usadas por terceiros
3. Google pode revogar chaves vazadas automaticamente
4. Custo elevado se chaves forem usadas abusivamente

## Correções Implementadas

### 1. Remoção de Logs que Expõem Chaves

**Arquivos Corrigidos**:
- ✅ `src/services/ai/guataRealWebSearchService.ts`
- ✅ `src/services/ai/guataGeminiService.ts`
- ✅ `src/services/ai/guataKnowledgeBaseService.ts`

**O que foi removido**:
- ❌ Logs mostrando preview de chaves (`substring(0, 10)`)
- ❌ Logs mostrando tamanho de chaves
- ❌ Logs mostrando primeiros/últimos caracteres
- ❌ Logs de diagnóstico que expõem informações sensíveis

**O que foi mantido**:
- ✅ Logs apenas em desenvolvimento (`import.meta.env.DEV`)
- ✅ Logs de erro críticos (sem expor chaves)
- ✅ Validação silenciosa de configuração

### 2. Como Corrigir Chave Vazada (URGENTE)

**Se você recebeu erro "API key was reported as leaked"**:

#### Passo 1: Revogar Chave Imediatamente

1. Acesse: https://console.cloud.google.com/apis/credentials
2. Encontre a chave vazada (procure por "leaked" ou verifique uso recente)
3. Clique na chave
4. Clique em **"DELETE"** ou **"REVOKE"**
5. Confirme a exclusão

#### Passo 2: Criar Nova Chave com Restrições

1. Clique em **"CREATE CREDENTIALS"** → **"API Key"**
2. **IMEDIATAMENTE** configure restrições (antes de usar):
   
   **Application Restrictions**:
   - Selecione **"HTTP referrers (web sites)"**
   - Adicione apenas seus domínios:
     ```
     https://seu-dominio.com/*
     https://*.vercel.app/*
     http://localhost:*
     ```
   
   **API Restrictions**:
   - Selecione **"Restrict key"**
   - Para Gemini: Marque apenas **"Generative Language API"**
   - Para Search: Marque apenas **"Custom Search API"**

3. Clique em **"SAVE"**

#### Passo 3: Atualizar Variáveis de Ambiente

**No Vercel**:
1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto
3. Settings → Environment Variables
4. Encontre `VITE_GEMINI_API_KEY` ou `VITE_GOOGLE_SEARCH_API_KEY`
5. Clique em **"Edit"**
6. Cole a nova chave
7. Marque: Production, Preview, Development
8. Clique em **"Save"**

**Localmente**:
1. Abra arquivo `.env.local` (nunca `.env` que pode ser commitado)
2. Atualize a variável:
   ```
   VITE_GEMINI_API_KEY=nova_chave_aqui
   VITE_GOOGLE_SEARCH_API_KEY=nova_chave_aqui
   ```
3. Salve o arquivo

#### Passo 4: Redeploy

1. No Vercel: Clique em **"Redeploy"**
2. Aguarde o deploy completar
3. Teste a aplicação

#### Passo 5: Verificar

1. Abra o console do navegador
2. Verifique se não há mais erros de API key
3. Teste uma pergunta no chatbot
4. Verifique se funciona corretamente

### 3. Configuração de Restrições (Prevenção)

**Para TODAS as chaves de API**:

#### Restrições de Aplicação (HTTP Referrers)

```
✅ Permitir apenas:
- https://seu-dominio.com/*
- https://*.vercel.app/*
- http://localhost:*

❌ NUNCA deixar vazio (permite qualquer site)
```

#### Restrições de API

```
✅ Gemini API Key:
- Apenas "Generative Language API"

✅ Google Search API Key:
- Apenas "Custom Search API"

❌ NUNCA selecionar "Don't restrict key"
```

### 4. Boas Práticas Implementadas

#### ✅ Nunca Expor Chaves no Código

```typescript
// ❌ ERRADO
const API_KEY = "AIzaSyAve4...g04bk0MQns";

// ✅ CORRETO
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
```

#### ✅ Nunca Logar Chaves

```typescript
// ❌ ERRADO
console.log('API Key:', apiKey);
console.log('Preview:', apiKey.substring(0, 10) + '...');

// ✅ CORRETO
const isDev = import.meta.env.DEV;
if (isDev) {
  console.log('API Key configurada:', !!apiKey);
}
```

#### ✅ Validar sem Expor

```typescript
// ✅ CORRETO
if (!apiKey || apiKey.length < 20) {
  console.error('API Key inválida ou ausente');
  return;
}
// Nunca logar a chave real
```

### 5. Migração para Edge Functions (Recomendado)

**Problema Atual**: Chaves no frontend (VITE_*) são sempre expostas no bundle JavaScript.

**Solução**: Mover todas as chamadas para Supabase Edge Functions.

**Vantagens**:
- ✅ Chaves nunca expostas ao cliente
- ✅ Controle de rate limiting no servidor
- ✅ Melhor segurança
- ✅ Centralização de lógica

**Implementação**:

1. **Edge Functions já existentes**:
   - `supabase/functions/guata-ai/` - Para chamadas Gemini
   - `supabase/functions/guata-web-rag/` - Para pesquisa web

2. **Atualizar frontend para usar Edge Functions**:
   ```typescript
   // ❌ ANTES (chamada direta)
   const response = await geminiService.processQuestion(query);
   
   // ✅ DEPOIS (via Edge Function)
   const { data } = await supabase.functions.invoke('guata-ai', {
     body: { question: query.question }
   });
   ```

3. **Configurar secrets no Supabase**:
   ```bash
   supabase secrets set GEMINI_API_KEY=nova_chave
   supabase secrets set GOOGLE_SEARCH_API_KEY=nova_chave
   ```

### 6. Checklist de Segurança

- [x] Remover logs que expõem chaves
- [ ] Configurar restrições HTTP referrers nas chaves
- [ ] Configurar restrições de API nas chaves
- [ ] Criar chaves separadas para dev/prod
- [ ] Migrar para Edge Functions (recomendado)
- [ ] Adicionar `.env.local` ao `.gitignore`
- [ ] Nunca commitar arquivos `.env`
- [ ] Monitorar uso das APIs no Google Cloud
- [ ] Configurar alertas de uso anormal
- [ ] Revisar logs regularmente

### 7. Monitoramento e Alertas

#### Configurar Alertas no Google Cloud

1. Acesse: https://console.cloud.google.com/monitoring/alerting
2. Crie alerta para:
   - Uso excessivo de API (acima do normal)
   - Requisições de domínios não autorizados
   - Erros 403/401 frequentes

#### Verificar Uso Regularmente

1. Acesse: https://console.cloud.google.com/apis/dashboard
2. Verifique uso de cada API
3. Identifique padrões anormais
4. Revogue chaves suspeitas imediatamente

### 8. Arquivos .gitignore

Certifique-se de que `.gitignore` contém:

```
.env
.env.local
.env.*.local
*.env
```

**NUNCA commitar**:
- ❌ Arquivos `.env`
- ❌ Arquivos com chaves hardcoded
- ❌ Screenshots com chaves visíveis

### 9. Resumo das Ações Imediatas

1. **URGENTE**: Revogar chave vazada
2. **URGENTE**: Criar nova chave com restrições
3. **URGENTE**: Atualizar variáveis de ambiente
4. **URGENTE**: Redeploy
5. **IMPORTANTE**: Configurar restrições em todas as chaves
6. **RECOMENDADO**: Migrar para Edge Functions

### 10. Referências

- [Google Cloud API Key Security](https://cloud.google.com/docs/authentication/api-keys)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [OWASP API Security](https://owasp.org/www-project-api-security/)
- [React Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

---

**Data**: Janeiro 2025
**Prioridade**: CRÍTICA
**Status**: Correções implementadas, ações imediatas necessárias

