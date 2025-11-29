# Como Corrigir API Key Vazada e Fazer Chatbot Funcionar Novamente

## Problema Atual

O chatbot está retornando erro 403: "Your API key was reported as leaked". Isso significa que a chave de API do Gemini foi exposta e precisa ser substituída.

## Solução Passo a Passo

### PASSO 1: Revogar Chave Vazada (URGENTE - 5 minutos)

1. **Acesse Google AI Studio**:
   - URL: https://aistudio.google.com/app/apikey
   - Faça login com sua conta Google

2. **Encontre a Chave Vazada**:
   - Procure pela chave que está sendo usada no projeto
   - Ela pode estar marcada como "leaked" ou "revoked"

3. **Revogue a Chave**:
   - Clique na chave
   - Clique em "DELETE" ou "REVOKE"
   - Confirme a exclusão

### PASSO 2: Criar Nova Chave com Restrições (10 minutos)

1. **Criar Nova Chave**:
   - No Google AI Studio, clique em "Create API Key"
   - Selecione o projeto: `gen-lang-client-0847008941 (GuataIA)`
   - Clique em "Create API Key in existing project"

2. **IMEDIATAMENTE Configurar Restrições** (ANTES de usar):
   
   **a) Application Restrictions**:
   - Selecione "HTTP referrers (web sites)"
   - Adicione seus domínios:
     ```
     https://seu-dominio.com/*
     https://*.vercel.app/*
     http://localhost:*
     ```
   - **IMPORTANTE**: Não deixe vazio!

   **b) API Restrictions**:
   - Selecione "Restrict key"
   - Marque APENAS: "Generative Language API"
   - Não marque outras APIs

3. **Copiar Nova Chave**:
   - Copie a chave completa (começa com `AIza...`)
   - Guarde em local seguro temporariamente

### PASSO 3: Atualizar Variáveis de Ambiente (5 minutos)

#### No Vercel (Produção):

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** → **Environment Variables**
4. Encontre `VITE_GEMINI_API_KEY`
5. Clique em **Edit** (ou **Add** se não existir)
6. Cole a nova chave
7. Marque todas as opções:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development
8. Clique em **Save**

#### Localmente (Desenvolvimento):

1. Abra o arquivo `.env.local` na raiz do projeto
2. Se não existir, crie o arquivo
3. Adicione ou atualize:
   ```
   VITE_GEMINI_API_KEY=sua_nova_chave_aqui
   ```
4. Salve o arquivo

**IMPORTANTE**: 
- Use `.env.local` (não `.env`)
- Verifique se `.env.local` está no `.gitignore`
- Nunca commite arquivos `.env`

### PASSO 4: Redeploy (2 minutos)

#### No Vercel:

1. Vá em **Deployments**
2. Clique nos três pontos do último deploy
3. Selecione **Redeploy**
4. Aguarde o deploy completar (1-2 minutos)

#### Localmente:

1. Pare o servidor (Ctrl+C)
2. Reinicie:
   ```bash
   npm run dev
   ```

### PASSO 5: Verificar Funcionamento (2 minutos)

1. **Abra o Console do Navegador** (F12)
2. **Acesse a página do chatbot**: `/chatguata`
3. **Faça uma pergunta de teste**: "O que é o Pantanal?"
4. **Verifique**:
   - ✅ Não deve aparecer erro 403
   - ✅ Chatbot deve responder normalmente
   - ✅ Console não deve mostrar "leaked" ou "403"

### PASSO 6: Configurar Restrições na Chave do Google Search (Opcional mas Recomendado)

Se você também usa Google Search API:

1. Acesse: https://console.cloud.google.com/apis/credentials
2. Encontre a chave do Google Search
3. Configure restrições:
   - **HTTP referrers**: Seus domínios
   - **API restrictions**: Apenas "Custom Search API"

## Solução Alternativa: Usar Edge Functions (Recomendado para Segurança)

Se você quiser evitar expor chaves no frontend completamente:

### Opção A: Usar Edge Function Existente

O sistema já tem Edge Functions configuradas:
- `supabase/functions/guata-ai/` - Para Gemini
- `supabase/functions/guata-web-rag/` - Para pesquisa web

**Vantagens**:
- Chaves nunca expostas ao cliente
- Mais seguro
- Controle de rate limiting no servidor

**Como Usar**:

1. **Configurar Secrets no Supabase**:
   ```bash
   supabase secrets set GEMINI_API_KEY=nova_chave_aqui
   supabase secrets set GOOGLE_SEARCH_API_KEY=chave_search_aqui
   ```

2. **Atualizar Frontend** (se necessário):
   - O código já tem fallback para Edge Functions
   - Verifique se está usando `guataSimpleEdgeService`

### Opção B: Manter Frontend (Atual)

Se preferir manter no frontend:
- ✅ Siga os passos 1-5 acima
- ✅ Configure restrições nas chaves
- ✅ Monitore uso regularmente

## Verificação de Funcionamento

### Testes a Fazer:

1. **Teste Básico**:
   - Pergunta: "O que é o Pantanal?"
   - Esperado: Resposta sobre o Pantanal

2. **Teste com Pesquisa Web**:
   - Pergunta: "Qual o horário do Bioparque?"
   - Esperado: Resposta com informações atualizadas

3. **Teste de Fallback**:
   - Se Gemini falhar, deve usar pesquisa web
   - Se pesquisa web falhar, deve usar conhecimento local

### O que Verificar no Console:

✅ **Deve aparecer**:
- `[Guatá Gemini] Configurado` (apenas em dev)
- Respostas sendo geradas

❌ **NÃO deve aparecer**:
- Erro 403
- "leaked"
- "API key was reported as leaked"
- Preview de chaves

## Troubleshooting

### Erro 403 Continua Aparecendo

**Possíveis causas**:
1. Chave antiga ainda em cache
2. Variável de ambiente não atualizada
3. Redeploy não foi feito

**Solução**:
1. Limpe cache do navegador (Ctrl+Shift+Delete)
2. Verifique se variável foi salva no Vercel
3. Faça redeploy novamente
4. Aguarde 2-3 minutos após redeploy

### Chatbot Não Responde

**Possíveis causas**:
1. Nova chave sem restrições configuradas
2. Chave bloqueada por restrições muito restritivas
3. API não habilitada no projeto

**Solução**:
1. Verifique restrições da chave
2. Teste com restrições temporariamente removidas
3. Adicione restrições gradualmente
4. Verifique se API está habilitada no projeto

### Erro 400 (Bad Request)

**Possíveis causas**:
1. Chave inválida
2. Formato incorreto da chave
3. Chave de projeto diferente

**Solução**:
1. Verifique se copiou chave completa
2. Verifique se não há espaços extras
3. Verifique se chave pertence ao projeto correto

## Prevenção Futura

### 1. Nunca Expor Chaves

- ❌ Não logar chaves no console
- ❌ Não commitar arquivos `.env`
- ❌ Não compartilhar chaves em mensagens
- ❌ Não usar chaves em repositórios públicos

### 2. Configurar Restrições Sempre

- ✅ HTTP referrers: Apenas seus domínios
- ✅ API restrictions: Apenas APIs necessárias
- ✅ Nunca deixar chave sem restrições

### 3. Monitorar Uso

- Verifique uso no Google Cloud Console regularmente
- Configure alertas de uso anormal
- Revogue chaves suspeitas imediatamente

### 4. Rotação Periódica

- Troque chaves a cada 3-6 meses
- Revogue chaves antigas após criar novas
- Mantenha backup de chaves ativas

## Checklist Rápido

- [ ] Revogar chave vazada no Google AI Studio
- [ ] Criar nova chave com restrições
- [ ] Atualizar `VITE_GEMINI_API_KEY` no Vercel
- [ ] Atualizar `.env.local` localmente
- [ ] Fazer redeploy no Vercel
- [ ] Testar chatbot
- [ ] Verificar console (sem erros 403)
- [ ] Configurar restrições na chave do Google Search (se usar)

## Links Úteis

- **Google AI Studio**: https://aistudio.google.com/app/apikey
- **Google Cloud Console**: https://console.cloud.google.com/apis/credentials
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard

## Suporte

Se após seguir todos os passos o problema persistir:

1. Verifique logs no console do navegador
2. Verifique logs no Vercel (Functions → Logs)
3. Verifique uso da API no Google Cloud Console
4. Teste a chave diretamente na API do Gemini

---

**Tempo Total Estimado**: 25-30 minutos
**Prioridade**: URGENTE
**Última Atualização**: Janeiro 2025

