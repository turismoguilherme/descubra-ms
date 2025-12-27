# 🔧 Solução: Dados aparecem no localhost mas não no Vercel

## 🔍 Por que isso acontece?

O problema mais comum é que **localhost e Vercel estão usando configurações diferentes**:

1. **Variáveis de ambiente diferentes** - Vercel pode não ter as mesmas variáveis configuradas
2. **Banco de dados diferente** - Pode estar usando Supabase de desenvolvimento vs produção
3. **Cache do Vercel** - Build antigo em cache
4. **RLS (Row Level Security)** - Políticas de segurança podem estar bloqueando no Vercel

---

## ✅ SOLUÇÃO PASSO A PASSO

### **1. Verificar Variáveis de Ambiente no Vercel**

1. Acesse o [Dashboard do Vercel](https://vercel.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings** → **Environment Variables**
4. Verifique se estas variáveis estão configuradas:

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

**⚠️ IMPORTANTE:** 
- As variáveis devem ter o prefixo `VITE_` para funcionar no frontend
- Verifique se os valores são **exatamente iguais** aos do seu `.env` local

### **2. Verificar se está usando o mesmo banco de dados**

No seu `.env` local, você tem:
```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
```

No Vercel, deve ser **exatamente o mesmo URL**. Se for diferente, você está usando bancos diferentes!

### **3. Forçar novo build no Vercel**

1. No Dashboard do Vercel, vá em **Deployments**
2. Clique nos **3 pontinhos** do último deployment
3. Selecione **Redeploy**
4. Ou faça um novo commit vazio:
   ```bash
   git commit --allow-empty -m "trigger: Forçar novo build no Vercel"
   git push
   ```

### **4. Limpar cache do Vercel**

1. No Dashboard do Vercel → **Settings** → **General**
2. Role até **Build & Development Settings**
3. Em **Build Command**, adicione `--force` se necessário
4. Ou delete o cache manualmente (se disponível)

### **5. Verificar RLS (Row Level Security) no Supabase**

Os dados podem estar sendo bloqueados pelas políticas de segurança:

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Vá em **Authentication** → **Policies**
3. Verifique as políticas das tabelas:
   - `pantanal_avatars`
   - `destinations`
   - `destination_details`
   - `user_profiles`

**Para testar:**
- Desative temporariamente o RLS nas tabelas problemáticas
- Se funcionar, o problema é nas políticas
- Reative o RLS e ajuste as políticas

### **6. Verificar logs do Vercel**

1. No Dashboard do Vercel → **Deployments**
2. Clique no deployment mais recente
3. Vá em **Functions** ou **Build Logs**
4. Procure por erros relacionados a:
   - `VITE_SUPABASE_URL is not defined`
   - `Failed to fetch`
   - `Row Level Security policy violation`

---

## 🛠️ CORREÇÃO RÁPIDA

### **Opção 1: Sincronizar variáveis de ambiente**

```bash
# 1. Veja suas variáveis locais
cat .env | grep VITE_SUPABASE

# 2. Copie os valores
# 3. Cole no Vercel Dashboard → Settings → Environment Variables
```

### **Opção 2: Verificar se o banco está sincronizado**

No Supabase Dashboard:
1. Vá em **SQL Editor**
2. Execute para verificar se os dados existem:

```sql
-- Verificar avatares
SELECT COUNT(*) FROM pantanal_avatars;

-- Verificar destinos
SELECT COUNT(*) FROM destinations;

-- Verificar se você tem permissão
SELECT * FROM pantanal_avatars LIMIT 5;
```

Se retornar dados, o problema é nas variáveis de ambiente do Vercel.

### **Opção 3: Testar conexão direta**

Crie um arquivo temporário para testar:

```typescript
// test-supabase.ts
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Definida' : 'NÃO DEFINIDA');
```

Se no Vercel aparecer "NÃO DEFINIDA", as variáveis não estão configuradas.

---

## 📋 CHECKLIST DE VERIFICAÇÃO

- [ ] Variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão no Vercel
- [ ] Os valores são **exatamente iguais** aos do `.env` local
- [ ] Foi feito um novo deploy após adicionar/alterar variáveis
- [ ] O banco de dados Supabase é o mesmo (mesmo URL)
- [ ] As políticas RLS permitem leitura pública ou para usuários autenticados
- [ ] Não há erros nos logs do Vercel
- [ ] Cache foi limpo (novo deploy)

---

## 🚨 PROBLEMAS COMUNS

### **Problema 1: Variáveis não aparecem no build**

**Solução:** Variáveis do Vercel só são injetadas durante o build. Você precisa fazer um **novo deploy** após adicionar/alterar variáveis.

### **Problema 2: Dados diferentes entre localhost e Vercel**

**Causa:** Está usando bancos Supabase diferentes.

**Solução:** Verifique se `VITE_SUPABASE_URL` é igual em ambos os ambientes.

### **Problema 3: RLS bloqueando acesso**

**Causa:** Políticas de segurança muito restritivas.

**Solução:** Ajuste as políticas RLS para permitir leitura pública ou para usuários autenticados.

### **Problema 4: Cache do navegador**

**Solução:** 
- Limpe o cache do navegador (Ctrl+Shift+Delete)
- Ou teste em modo anônimo
- Ou adicione `?v=timestamp` nas URLs

---

## 📞 PRÓXIMOS PASSOS

1. **Verifique as variáveis no Vercel** (mais provável)
2. **Faça um novo deploy**
3. **Teste em modo anônimo** para descartar cache
4. **Verifique os logs do Vercel** para erros específicos

Se o problema persistir, compartilhe:
- Screenshot das variáveis de ambiente do Vercel (sem mostrar os valores)
- Logs do build do Vercel
- Resultado da query SQL no Supabase

