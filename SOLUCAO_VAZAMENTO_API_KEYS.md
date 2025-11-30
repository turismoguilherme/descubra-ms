# Solução Completa para Vazamento de API Keys

## Problema Identificado

As chaves de API estão sendo expostas no console do navegador através de logs de debug, o que é um risco crítico de segurança. Além disso, chaves no frontend (variáveis VITE_*) são incorporadas no bundle JavaScript e podem ser acessadas por qualquer pessoa.

## Soluções Implementadas

### 1. Remoção de Logs que Expõem Chaves

**Arquivos Corrigidos**:
- `src/services/ai/guataRealWebSearchService.ts`
- `src/services/ai/guataGeminiService.ts`

**Mudanças**:
- Removidos logs que mostram previews de chaves
- Removidos logs que mostram tamanho de chaves
- Logs de debug apenas em desenvolvimento
- Nunca logar chaves completas ou parciais

### 2. Migração para Edge Functions (Recomendado)

**Problema**: Chaves no frontend (VITE_*) são sempre expostas no bundle JavaScript.

**Solução**: Mover todas as chamadas de API para Supabase Edge Functions.

**Vantagens**:
- Chaves nunca expostas ao cliente
- Controle de rate limiting no servidor
- Melhor segurança
- Centralização de lógica

**Implementação**:
- Usar Edge Functions existentes: `guata-ai`, `guata-web-rag`
- Remover chamadas diretas do frontend
- Todas as chaves ficam apenas no servidor

### 3. Restrições de API Keys no Google Cloud

**Passos para Configurar**:

1. **Acesse Google Cloud Console**:
   - https://console.cloud.google.com/apis/credentials

2. **Para cada API Key**:
   - Clique na chave
   - Configure "Application restrictions":
     - **HTTP referrers**: Adicione apenas seus domínios
       - `https://seu-dominio.com/*`
       - `https://*.vercel.app/*` (se usar Vercel)
   - Configure "API restrictions":
     - Selecione apenas as APIs necessárias
     - Para Gemini: "Generative Language API"
     - Para Search: "Custom Search API"

3. **Criar Chaves Separadas**:
   - Uma chave para desenvolvimento (localhost)
   - Uma chave para produção (domínio específico)
   - Nunca usar a mesma chave em ambos

### 4. Como Corrigir Chave Vazada

**Se sua chave foi reportada como "leaked"**:

1. **Revogar Chave Imediatamente**:
   - Acesse: https://console.cloud.google.com/apis/credentials
   - Encontre a chave vazada
   - Clique em "Revoke" ou "Delete"

2. **Criar Nova Chave**:
   - Clique em "Create Credentials" → "API Key"
   - Configure restrições imediatamente
   - NÃO use a chave até configurar restrições

3. **Atualizar Variáveis de Ambiente**:
   - **Vercel**: Settings → Environment Variables
   - **Local**: Arquivo `.env.local` (nunca commitar)
   - Atualize `VITE_GEMINI_API_KEY` e `VITE_GOOGLE_SEARCH_API_KEY`

4. **Redeploy**:
   - Faça redeploy da aplicação
   - Verifique se a nova chave funciona

5. **Monitorar Uso**:
   - Verifique logs no Google Cloud Console
   - Monitore uso anormal da API
   - Configure alertas de uso excessivo

## Boas Práticas Implementadas

### 1. Nunca Expor Chaves no Código

```typescript
// ❌ ERRADO - Nunca fazer isso
const API_KEY = "AIzaSyAve4...g04bk0MQns";

// ✅ CORRETO - Usar variável de ambiente
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
```

### 2. Nunca Logar Chaves

```typescript
// ❌ ERRADO
console.log('API Key:', apiKey);
console.log('API Key preview:', apiKey.substring(0, 10) + '...');

// ✅ CORRETO
const isDev = import.meta.env.DEV;
if (isDev) {
  console.log('API Key configurada:', !!apiKey);
}
```

### 3. Validar sem Expor

```typescript
// ✅ CORRETO
if (!apiKey || apiKey.length < 20) {
  console.error('API Key inválida ou ausente');
  return;
}
// Nunca logar a chave real
```

### 4. Usar Edge Functions

```typescript
// ❌ ERRADO - Chamada direta do frontend
const response = await fetch(`https://api.example.com?key=${API_KEY}`);

// ✅ CORRETO - Via Edge Function
const { data } = await supabase.functions.invoke('guata-ai', {
  body: { question: userQuestion }
});
```

## Checklist de Segurança

- [ ] Remover todos os logs que expõem chaves
- [ ] Configurar restrições de HTTP referrers nas chaves
- [ ] Configurar restrições de API nas chaves
- [ ] Criar chaves separadas para dev/prod
- [ ] Mover chamadas para Edge Functions (recomendado)
- [ ] Adicionar `.env.local` ao `.gitignore`
- [ ] Nunca commitar arquivos `.env`
- [ ] Monitorar uso das APIs no Google Cloud
- [ ] Configurar alertas de uso anormal
- [ ] Revisar logs regularmente

## Próximos Passos

1. **Imediato**: Remover logs que expõem chaves
2. **Curto Prazo**: Configurar restrições nas chaves existentes
3. **Médio Prazo**: Migrar para Edge Functions
4. **Longo Prazo**: Implementar rotação automática de chaves

## Referências

- [Google Cloud API Key Security](https://cloud.google.com/docs/authentication/api-keys)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [OWASP API Security](https://owasp.org/www-project-api-security/)

---

**Data**: Janeiro 2025
**Prioridade**: CRÍTICA



