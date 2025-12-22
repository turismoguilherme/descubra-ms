# 🔄 Como Copiar Secrets do Supabase para o Frontend

## ⚠️ **IMPORTANTE: Diferença entre Secrets e Variáveis de Ambiente**

### **Supabase Secrets (Edge Functions):**
- ✅ Já configurados (vejo na imagem)
- 🎯 Usados por: Edge Functions (backend/serverless)
- 📍 Localização: Supabase Dashboard → Edge Functions → Secrets

### **Variáveis VITE_ (Frontend):**
- ❌ Ainda precisam ser configuradas
- 🎯 Usadas por: Código React/Vite (frontend)
- 📍 Localização: Arquivo `.env` na raiz do projeto

---

## 📋 **APIS JÁ CONFIGURADAS NO SUPABASE**

Vejo que você já tem estas APIs no Supabase Secrets:

1. ✅ **GEMINI_API_KEY** - Configurado
2. ✅ **GOOGLE_SEARCH_API_KEY** - Configurado
3. ✅ **GOOGLE_SEARCH_ENGINE_ID** - Configurado
4. ✅ **OPENWEATHER_API_KEY** - Configurado
5. ✅ **GOOGLE_PLACES_API_KEY** - Configurado

---

## 🔄 **PASSO A PASSO: Copiar para o Frontend**

### **1. Acessar os Secrets no Supabase**

1. **Acesse:** https://supabase.com/dashboard/project/hvtrpkbjgbuypkskqcqm/functions/secrets
2. **Clique em cada secret** para ver o valor completo
3. **Copie os valores** (não apenas o hash parcial)

### **2. Criar/Atualizar arquivo `.env`**

Na raiz do projeto (mesmo nível do `package.json`), crie ou edite o arquivo `.env`:

```env
# ===========================================
# 🤖 GEMINI AI (OBRIGATÓRIO)
# ===========================================
# Copie o valor de GEMINI_API_KEY do Supabase
VITE_GEMINI_API_KEY=cole_aqui_o_valor_completo_do_GEMINI_API_KEY

# ===========================================
# 🔍 GOOGLE CUSTOM SEARCH (RECOMENDADO)
# ===========================================
# Copie o valor de GOOGLE_SEARCH_API_KEY do Supabase
VITE_GOOGLE_SEARCH_API_KEY=cole_aqui_o_valor_completo_do_GOOGLE_SEARCH_API_KEY

# Copie o valor de GOOGLE_SEARCH_ENGINE_ID do Supabase
VITE_GOOGLE_SEARCH_ENGINE_ID=cole_aqui_o_valor_completo_do_GOOGLE_SEARCH_ENGINE_ID

# ===========================================
# 🌤️ OPENWEATHER (OPCIONAL)
# ===========================================
# Copie o valor de OPENWEATHER_API_KEY do Supabase
VITE_OPENWEATHER_API_KEY=cole_aqui_o_valor_completo_do_OPENWEATHER_API_KEY

# ===========================================
# 📍 GOOGLE PLACES (OPCIONAL)
# ===========================================
# Copie o valor de GOOGLE_PLACES_API_KEY do Supabase
VITE_GOOGLE_PLACES_API_KEY=cole_aqui_o_valor_completo_do_GOOGLE_PLACES_API_KEY

# ===========================================
# 🗄️ SUPABASE (Já deve ter)
# ===========================================
VITE_SUPABASE_URL=https://hvtrpkbjgbuypkskqcqm.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
```

### **3. Mapeamento: Supabase Secret → Variável Frontend**

| Supabase Secret | Variável Frontend (.env) |
|----------------|--------------------------|
| `GEMINI_API_KEY` | `VITE_GEMINI_API_KEY` |
| `GOOGLE_SEARCH_API_KEY` | `VITE_GOOGLE_SEARCH_API_KEY` |
| `GOOGLE_SEARCH_ENGINE_ID` | `VITE_GOOGLE_SEARCH_ENGINE_ID` |
| `OPENWEATHER_API_KEY` | `VITE_OPENWEATHER_API_KEY` |
| `GOOGLE_PLACES_API_KEY` | `VITE_GOOGLE_PLACES_API_KEY` |

**Nota:** O prefixo `VITE_` é obrigatório para variáveis do frontend no Vite!

---

## 🔍 **COMO VER O VALOR COMPLETO DO SECRET**

No Supabase Dashboard:

1. **Clique no secret** (ex: `GEMINI_API_KEY`)
2. **Clique no ícone de "olho" 👁️** ou "Reveal" para mostrar o valor
3. **Copie o valor completo** (não apenas o hash que aparece na lista)

**⚠️ CUIDADO:** Os valores são sensíveis! Não compartilhe publicamente.

---

## ✅ **VERIFICAR SE FUNCIONOU**

Após adicionar as variáveis no `.env`:

1. **Reinicie o servidor:**
   ```bash
   # Pare o servidor (Ctrl+C)
   npm run dev
   ```

2. **Verifique no console do navegador:**
   - Não deve aparecer erros de "API não configurada"
   - Revenue Optimizer deve funcionar com Gemini
   - DocumentProcessor deve funcionar

3. **Teste manual:**
   - Acesse o Revenue Optimizer
   - Tente calcular um preço sugerido
   - Deve usar Gemini (não fallback simples)

---

## 🎯 **CHECKLIST**

Marque conforme for copiando:

- [ ] **GEMINI_API_KEY** copiado para `VITE_GEMINI_API_KEY` no `.env`
- [ ] **GOOGLE_SEARCH_API_KEY** copiado para `VITE_GOOGLE_SEARCH_API_KEY` no `.env`
- [ ] **GOOGLE_SEARCH_ENGINE_ID** copiado para `VITE_GOOGLE_SEARCH_ENGINE_ID` no `.env`
- [ ] **OPENWEATHER_API_KEY** copiado para `VITE_OPENWEATHER_API_KEY` no `.env`
- [ ] **GOOGLE_PLACES_API_KEY** copiado para `VITE_GOOGLE_PLACES_API_KEY` no `.env`
- [ ] **Arquivo `.env` salvo**
- [ ] **Servidor reiniciado** (`npm run dev`)

---

## 💡 **DICAS IMPORTANTES**

### **Segurança:**
- ✅ **NUNCA** commite o arquivo `.env` no Git
- ✅ O `.env` já está no `.gitignore` (verificado)
- ✅ Use variáveis de ambiente no servidor de produção

### **Formato:**
- ✅ Sem espaços antes/depois do `=`
- ✅ Sem aspas (a menos que o valor tenha espaços)
- ✅ Uma variável por linha

### **Exemplo Correto:**
```env
VITE_GEMINI_API_KEY=AIzaSyAbCdEf1234567890
```

### **Exemplo Errado:**
```env
VITE_GEMINI_API_KEY = AIzaSyAbCdEf1234567890  # ❌ Espaços
VITE_GEMINI_API_KEY="AIzaSyAbCdEf1234567890"  # ⚠️ Aspas desnecessárias
```

---

## 🚨 **PROBLEMAS COMUNS**

### **"API não configurada" mesmo após copiar:**
- ✅ Verifique se o prefixo `VITE_` está correto
- ✅ Verifique se não há espaços extras
- ✅ Reinicie o servidor após adicionar variáveis
- ✅ Verifique se o arquivo está na raiz do projeto

### **"Cannot read property of undefined":**
- ✅ Verifique se copiou o valor completo (não apenas o hash)
- ✅ Verifique se não há quebras de linha no valor

### **Valores não aparecem:**
- ✅ Verifique se o arquivo se chama exatamente `.env` (não `.env.txt`)
- ✅ Verifique se está na raiz do projeto (mesmo nível do `package.json`)

---

## 📝 **RESUMO RÁPIDO**

1. **Você já tem as APIs no Supabase** ✅
2. **Precisa copiar para o `.env` do frontend** com prefixo `VITE_`
3. **Reiniciar o servidor** após copiar
4. **Testar** se está funcionando

---

**Última atualização:** 2025-01-20

