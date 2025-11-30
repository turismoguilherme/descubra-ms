# 🔒 Melhorias de Segurança Implementadas

Este documento descreve todas as melhorias de segurança implementadas no código.

## ✅ Melhorias Implementadas

### 1. **Remoção de Chaves Hardcoded**
- ✅ Removidas chaves Supabase hardcoded de `src/config/apiKeys.ts`
- ✅ Removidas chaves hardcoded de `src/config/environment.ts`
- ✅ Todas as chaves agora dependem exclusivamente de variáveis de ambiente
- ⚠️ **Ação necessária**: Configure as variáveis de ambiente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`

### 2. **CORS Melhorado**
- ✅ Criado sistema de CORS com validação de origem em `supabase/functions/_shared/cors.ts`
- ✅ CORS agora valida origens permitidas em vez de usar wildcard `*`
- ✅ Suporte para múltiplas origens configuráveis via variável de ambiente `ALLOWED_ORIGINS`
- ✅ Headers de segurança adicionados:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: geolocation=(), microphone=(), camera=()`

### 3. **Validação de Origem**
- ✅ Implementada validação de origem em todas as Edge Functions principais:
  - `guata-gemini-proxy`
  - `guata-google-search-proxy`
  - `guata-web-rag`
- ✅ Apenas origens permitidas podem fazer requisições
- ✅ Suporte para desenvolvimento local e produção

### 4. **Sanitização de Inputs**
- ✅ Função `sanitizeInput()` implementada em todas as Edge Functions
- ✅ Remove caracteres perigosos:
  - Tags HTML (`<`, `>`)
  - Protocolos JavaScript (`javascript:`)
  - Event handlers (`onclick=`, `onerror=`, etc.)
- ✅ Limita tamanho máximo de inputs
- ✅ Validação de tipos de dados

### 5. **Validação de Parâmetros**
- ✅ Validação de nomes de modelos (Gemini) - apenas modelos permitidos
- ✅ Validação de `temperature` e `maxOutputTokens` - valores dentro de limites seguros
- ✅ Validação de `state_code` - apenas códigos de estado válidos
- ✅ Limites de tamanho para todos os campos de entrada

### 6. **Rate Limiting Melhorado**
- ✅ Rate limiting mais restritivo em `guata-web-rag`:
  - Reduzido de 8 para 5 requisições por minuto
  - Reduzido de 200 para 100 requisições por dia
- ✅ Rate limiting por usuário e por IP
- ✅ Mensagens de erro claras quando limites são excedidos

### 7. **Sanitização de Respostas**
- ✅ Respostas da API também são sanitizadas antes de serem enviadas ao cliente
- ✅ Previne XSS através de dados retornados pela API

### 8. **Content Security Policy (CSP) Melhorado**
- ✅ CSP atualizado no `index.html` com políticas mais restritivas
- ✅ Adicionado `default-src 'self'` para restringir recursos por padrão
- ✅ Adicionado `frame-ancestors 'none'` para prevenir clickjacking
- ✅ Adicionado `base-uri 'self'` e `form-action 'self'` para prevenir ataques
- ✅ Adicionado `object-src 'none'` para bloquear plugins perigosos
- ✅ Adicionado `upgrade-insecure-requests` para forçar HTTPS

### 9. **Headers de Segurança no Vercel**
- ✅ Headers de segurança adicionados no `vercel.json`:
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: geolocation=(), microphone=(), camera=()`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- ✅ Headers aplicados globalmente a todas as rotas

## 📋 Configuração Necessária

### Variáveis de Ambiente no Supabase

Configure as seguintes variáveis no Supabase Dashboard (Settings → Edge Functions → Secrets):

```bash
# API Keys (já devem estar configuradas)
GEMINI_API_KEY=your_gemini_key
GOOGLE_SEARCH_API_KEY=your_google_search_key
GOOGLE_SEARCH_ENGINE_ID=your_engine_id

# CORS Configuration (opcional - usa defaults se não configurado)
ALLOWED_ORIGINS=https://descubra-ms.vercel.app,http://localhost:5173

# Rate Limiting (opcional - usa defaults se não configurado)
RATE_LIMIT_PER_MIN=5
DAILY_BUDGET_CALLS=100
```

### Variáveis de Ambiente no Frontend (.env)

```bash
# Supabase (obrigatório)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# API Keys (opcional - devem estar nas Edge Functions)
# Não use VITE_* para chaves sensíveis no frontend
```

## 🔍 Verificações de Segurança

### Checklist de Segurança

- [x] Chaves não estão hardcoded no código
- [x] CORS está configurado corretamente
- [x] Validação de origem implementada
- [x] Sanitização de inputs implementada
- [x] Rate limiting configurado
- [x] Headers de segurança adicionados
- [x] Validação de parâmetros implementada
- [x] Sanitização de respostas implementada

### Próximas Melhorias Recomendadas

1. **Logs de Segurança**
   - Implementar logging seguro sem expor informações sensíveis
   - Adicionar rotação de logs

2. **Validação de URL**
   - Validar e sanitizar todos os parâmetros de URL
   - Prevenir open redirects

3. **Autenticação**
   - Revisar políticas de autenticação
   - Implementar 2FA para operações sensíveis

4. **Monitoramento**
   - Implementar alertas de segurança
   - Monitorar tentativas de acesso não autorizado
   - Dashboard de segurança

5. **Testes de Segurança**
   - Implementar testes automatizados de segurança
   - Penetration testing periódico

## 🚨 Avisos Importantes

1. **Chaves de API**: Nunca commite chaves de API no código. Use sempre variáveis de ambiente.

2. **CORS**: Configure `ALLOWED_ORIGINS` no Supabase para restringir acesso apenas às origens permitidas.

3. **Rate Limiting**: Ajuste os limites conforme necessário baseado no uso real da aplicação.

4. **Logs**: Revise logs regularmente para identificar tentativas de acesso não autorizado.

## 📚 Referências

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security)
- [CORS Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

