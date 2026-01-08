# 🔧 Guia Completo: Configuração de Tradução

## 🚀 SOLUÇÃO MAIS FÁCIL: LibreTranslate (GRATUITA)

Se você está tendo problemas com o Google Cloud, use o **LibreTranslate** - é gratuito e não requer configuração!

### ✅ Como usar LibreTranslate (Recomendado):

1. **Não precisa configurar nada!** Já está funcionando
2. **Teste executando:**
   ```bash
   node test-google-translate.js
   ```
3. **Resultado esperado:**
   ```
   ✅ LibreTranslate funcionando!
   ```
4. **Configure no Vercel (opcional):**
   ```
   VITE_LIBRE_TRANSLATE_URL=https://libretranslate.de
   ```

### 🎯 Vantagens do LibreTranslate:
- ✅ **100% Gratuito** - Sem limites
- ✅ **Sem cadastro** - Funciona imediatamente
- ✅ **Sem chaves API** - Não precisa configurar nada
- ✅ **Qualidade boa** - Suficiente para turismo

---

# 🔧 Configuração Google Translate API (Opcional)

## ❌ Problemas Comuns e Soluções

### Problema 1: "Você não tem permissão para acessar este projeto"
**Sintomas**: Erro de permissão ao tentar acessar APIs

**Soluções**:
1. **Verificar conta correta**:
   - Use a conta Google que criou o projeto
   - Se for conta Workspace/GSuite, peça permissão ao admin

2. **Verificar papel (Role)**:
   - Vá para: IAM & Admin → IAM
   - Procure seu email na lista
   - Deve ter pelo menos: `Editor` ou `Owner`

### Problema 2: "API não está ativada neste projeto"
**Sintomas**: API aparece como "desativada"

**Solução**:
1. Vá para: APIs & Services → Library
2. Procure por "Cloud Translation API"
3. Clique em "Ativar"

### Problema 3: "Cobrança não ativada"
**Sintomas**: "Billing account required"

**Solução**:
1. Vá para: Billing → Conta de faturamento
2. Crie ou vincule uma conta de cobrança
3. **IMPORTANTE**: A API é gratuita até 500.000 caracteres/mês!

### Problema 4: "Conta Pessoal vs Workspace"
**Sintomas**: Confusão entre contas

**Solução**:
- **Conta Pessoal**: cloud.google.com
- **Workspace**: admin.google.com ou console.cloud.google
- Use sempre a mesma conta para tudo

---

## 📋 Checklist Completo de Setup

### ✅ Passo 1: Acessar Console Correto
```
URL: https://console.cloud.google.com/
Conta: Mesma usada para o Gemini
```