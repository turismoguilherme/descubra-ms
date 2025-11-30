# Teste Rápido - Nova API Key

## ✅ Verificação Rápida (2 minutos)

### 1. Verificar se Está Configurada

**Localmente**:
- Arquivo `.env.local` deve ter: `VITE_GEMINI_API_KEY=sua_nova_chave`

**No Vercel**:
- Settings → Environment Variables → `VITE_GEMINI_API_KEY` deve estar configurada

### 2. Fazer Redeploy

**No Vercel**:
- Deployments → Três pontos → Redeploy

**Localmente**:
- Pare servidor (Ctrl+C) e reinicie: `npm run dev`

### 3. Testar

1. Abra `/chatguata`
2. Abra Console (F12)
3. Faça pergunta: "O que é o Pantanal?"
4. Verifique:
   - ✅ Console mostra: `[Guatá Gemini] Configurado`
   - ✅ Chatbot responde normalmente
   - ✅ Não aparece erro 403 ou "leaked"

## 🎯 Se Está Funcionando

✅ **Sucesso!** A nova API key está funcionando corretamente.

**Próximos passos**:
- Configure restrições na chave (HTTP referrers + API restrictions)
- Monitore uso no Google Cloud Console

## ❌ Se Não Está Funcionando

**Verifique**:
1. Chave foi salva corretamente no Vercel?
2. Redeploy foi feito?
3. Chave tem formato correto? (deve começar com `AIza...`)
4. Restrições não estão bloqueando?

**Solução**:
- Veja `COMO_CORRIGIR_API_KEY_E_FUNCIONAR_NOVAMENTE.md` para detalhes

---

**Status**: Aguardando teste do usuário



