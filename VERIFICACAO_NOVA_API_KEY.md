# Verificação da Nova API Key - Checklist

## ✅ Passos para Verificar se Nova API Key Está Funcionando

### 1. Verificar Configuração Local

**Arquivo**: `.env.local` (na raiz do projeto)

```bash
# Deve conter:
VITE_GEMINI_API_KEY=sua_nova_chave_aqui
```

**Como verificar**:
1. Abra o arquivo `.env.local`
2. Confirme que `VITE_GEMINI_API_KEY` tem a nova chave
3. Verifique se não há espaços extras antes/depois da chave
4. Salve o arquivo se fez alterações

### 2. Verificar Configuração no Vercel

**URL**: https://vercel.com/dashboard

**Passos**:
1. Selecione seu projeto
2. Vá em **Settings** → **Environment Variables**
3. Encontre `VITE_GEMINI_API_KEY`
4. Verifique se o valor está correto
5. Confirme que está marcado para:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

**Se não estiver configurado**:
1. Clique em **Add New**
2. Key: `VITE_GEMINI_API_KEY`
3. Value: Cole a nova chave
4. Marque todos os ambientes
5. Clique em **Save**

### 3. Fazer Redeploy (IMPORTANTE)

**No Vercel**:
1. Vá em **Deployments**
2. Clique nos três pontos (⋯) do último deploy
3. Selecione **Redeploy**
4. Aguarde 1-2 minutos

**Localmente**:
1. Pare o servidor (Ctrl+C)
2. Reinicie:
   ```bash
   npm run dev
   ```

### 4. Testar o Chatbot

**Teste 1: Verificar Console**
1. Abra `/chatguata` no navegador
2. Abra Console (F12)
3. Procure por:
   - ✅ `[Guatá Gemini] Configurado` (sucesso)
   - ❌ `[Guatá Gemini] Não configurado` (erro)

**Teste 2: Fazer Pergunta**
1. Faça pergunta: "O que é o Pantanal?"
2. Verifique se:
   - ✅ Chatbot responde normalmente
   - ✅ Não aparece erro 403
   - ✅ Não aparece "leaked"
   - ✅ Resposta é inteligente e contextual

**Teste 3: Verificar Logs**
1. No console, verifique se não há:
   - ❌ Erro 403
   - ❌ "API key was reported as leaked"
   - ❌ "API key not valid"

### 5. Verificar Restrições da Nova Chave

**No Google AI Studio**:
1. Acesse: https://aistudio.google.com/app/apikey
2. Clique na nova chave
3. Verifique se tem restrições configuradas:
   - ✅ HTTP referrers: Seus domínios
   - ✅ API restrictions: Apenas "Generative Language API"

**Se não tiver restrições**:
1. Clique em **Edit**
2. Configure restrições imediatamente
3. Salve

## 🔍 Como Saber se Está Funcionando

### Sinais de Sucesso ✅

**No Console**:
```
[Guatá Gemini] Configurado
[Guatá] Preparando resposta com Gemini + pesquisa web
[SUCESSO] Modelo gemini-2.0-flash-001 funcionou
```

**No Chatbot**:
- Respostas inteligentes e contextuais
- Respostas baseadas em pesquisa web
- Sem erros visíveis ao usuário

### Sinais de Problema ❌

**No Console**:
```
[ERRO] Gemini não configurado - Verifique VITE_GEMINI_API_KEY
[ERRO] API key was reported as leaked
[ERRO] API key not valid
```

**No Chatbot**:
- Respostas genéricas (só fallback)
- Erros visíveis ao usuário
- Timeout ou lentidão

## 🛠️ Troubleshooting

### Problema: "Não configurado"

**Causa**: Variável de ambiente não está configurada

**Solução**:
1. Verifique `.env.local` localmente
2. Verifique Vercel Environment Variables
3. Faça redeploy após atualizar

### Problema: "API key not valid"

**Causa**: Chave inválida ou formato incorreto

**Solução**:
1. Verifique se copiou chave completa
2. Verifique se não há espaços extras
3. Crie nova chave se necessário

### Problema: "403 Forbidden"

**Causa**: Restrições muito restritivas ou API não habilitada

**Solução**:
1. Verifique restrições de HTTP referrers
2. Verifique se API está habilitada no projeto
3. Teste temporariamente sem restrições (depois adicione)

### Problema: Chatbot funciona mas só usa fallback

**Causa**: API key configurada mas Gemini não está sendo chamado

**Solução**:
1. Verifique logs no console
2. Verifique se não há rate limiting
3. Teste diretamente a API do Gemini

## 📋 Checklist Final

- [ ] Nova chave criada no Google AI Studio
- [ ] Restrições configuradas na nova chave
- [ ] Chave antiga revogada
- [ ] `VITE_GEMINI_API_KEY` atualizada no `.env.local`
- [ ] `VITE_GEMINI_API_KEY` atualizada no Vercel
- [ ] Redeploy feito no Vercel
- [ ] Servidor local reiniciado (se testando localmente)
- [ ] Console verificado (sem erros)
- [ ] Chatbot testado (responde normalmente)
- [ ] Logs verificados (Gemini funcionando)

## 🎯 Próximos Passos Após Verificação

1. **Monitorar Uso**: Verifique uso no Google Cloud Console
2. **Configurar Alertas**: Configure alertas de uso anormal
3. **Documentar**: Anote qual chave está em uso
4. **Backup**: Mantenha backup seguro da chave (nunca no código)

---

**Última Atualização**: Janeiro 2025
**Status**: Aguardando verificação do usuário

