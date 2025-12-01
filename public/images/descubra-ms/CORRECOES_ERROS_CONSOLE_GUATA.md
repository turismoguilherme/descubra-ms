# Correções de Erros no Console - Chatbot Guatá

## Problemas Identificados e Corrigidos

### 1. Erro 404 na Knowledge Base

**Problema**: 
- Erro 404 ao buscar na tabela `guata_knowledge_base`
- Erro aparecia no console mesmo quando era esperado (tabela vazia ou RLS bloqueando)

**Solução**:
- Tratamento silencioso de erros 404/401 (esperados quando tabela não existe ou RLS bloqueia)
- Logs de erro apenas em desenvolvimento
- Continuidade do fluxo normal quando erro é esperado

**Arquivo**: `src/services/ai/guataKnowledgeBaseService.ts`

### 2. Erro 403 - API Key do Gemini Vazada

**Problema**:
- Erro 403: "Your API key was reported as leaked"
- Sistema não tratava especificamente esse erro
- Usuário não recebia orientação clara sobre como resolver

**Solução**:
- Tratamento específico para erro de API key vazada/inválida
- Mensagem de erro clara com instruções passo a passo
- Orientação para criar nova chave e atualizar variáveis de ambiente

**Arquivo**: `src/services/ai/guataGeminiService.ts`

### 3. Logs de Debug Excessivos

**Problema**:
- Console poluído com muitos logs de debug
- Logs aparecendo em produção
- Dificulta identificação de erros reais

**Solução**:
- Redução de logs de debug
- Logs apenas em modo desenvolvimento (`import.meta.env.DEV`)
- Logs críticos (erros de API key) sempre visíveis
- Remoção de logs desnecessários de cache e processamento

**Arquivos**:
- `src/services/ai/guataKnowledgeBaseService.ts`
- `src/services/ai/guataGeminiService.ts`

### 4. Erro 401 nos Eventos

**Problema**:
- Erro 401 ao salvar eventos (RLS policy)
- Logs de erro mesmo quando é esperado em desenvolvimento

**Solução**:
- Tratamento já existente no código (marcado como esperado em dev)
- Não requer correção adicional

## Mudanças Implementadas

### guataKnowledgeBaseService.ts

1. **Tratamento de Erros 404/401**:
   - Verifica código de erro antes de logar
   - Retorna silenciosamente quando erro é esperado
   - Loga apenas em desenvolvimento

2. **Redução de Logs**:
   - Removidos logs de debug desnecessários
   - Mantidos apenas logs críticos
   - Logs informativos apenas em desenvolvimento

### guataGeminiService.ts

1. **Tratamento de API Key Vazada**:
   - Detecção específica de erro 403 com mensagem "leaked"
   - Mensagem de erro clara com instruções
   - Orientação para criar nova chave

2. **Redução de Logs**:
   - Logs de debug apenas em desenvolvimento
   - Removidos logs de cache e processamento em produção
   - Mantidos apenas logs críticos e de erro

3. **Melhor Tratamento de Erros**:
   - Logs de erro apenas em desenvolvimento ou erros críticos
   - Mensagens mais claras e objetivas

## Como Resolver o Erro de API Key Vazada

Se você ainda estiver vendo o erro "API key was reported as leaked":

1. **Acesse**: https://aistudio.google.com/app/apikey
2. **Revogue** a chave atual que foi reportada como vazada
3. **Crie uma NOVA chave de API**
4. **Atualize** a variável de ambiente:
   - No Vercel: Settings → Environment Variables → VITE_GEMINI_API_KEY
   - Localmente: Arquivo `.env` ou `.env.local`
5. **Faça um redeploy** (se estiver usando Vercel)

## Resultado Esperado

Após as correções:

- ✅ Console mais limpo (menos logs de debug)
- ✅ Erros 404/401 da Knowledge Base tratados silenciosamente
- ✅ Erro de API key vazada com mensagem clara e orientação
- ✅ Logs apenas em desenvolvimento ou erros críticos
- ✅ Melhor experiência de desenvolvimento

## Próximos Passos

1. **Criar nova API key do Gemini** (se necessário)
2. **Testar o sistema** para verificar se os erros foram resolvidos
3. **Verificar logs** apenas em modo desenvolvimento
4. **Monitorar** se há outros erros que precisam de tratamento

---

**Data**: Janeiro 2025
**Versão**: 1.0



