# 🔍 Diagnóstico: Avatares e Destinos não aparecem no Vercel

## 📋 Resumo do Problema

Funciona no **localhost** mas **NÃO funciona no Vercel**:
- ✅ Avatares do admin
- ✅ Destinos do admin
- ✅ Outros elementos do admin

---

## 🎯 Principais Causas Identificadas

### **1. Variáveis de Ambiente Não Configuradas no Vercel** ⚠️ **MAIS PROVÁVEL**

O código depende de variáveis de ambiente que precisam estar configuradas no Vercel:

```typescript
// src/lib/supabase.ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';
```

**Problema**: Se essas variáveis não estiverem no Vercel, o Supabase não consegue se conectar e as imagens não carregam.

**Solução**: 
1. Verificar no Dashboard do Vercel → Settings → Environment Variables
2. Garantir que existem:
   - `VITE_SUPABASE_URL` 
   - `VITE_SUPABASE_ANON_KEY`
3. **Valores devem ser EXATAMENTE iguais** aos do `.env` local
4. Após adicionar/alterar, fazer **novo deploy**

---

### **2. URLs Públicas do Supabase Storage Não Funcionando**

O código gera URLs públicas assim:

```typescript
// src/components/admin/descubra_ms/PantanalAvatarsManager.tsx
const { data: publicUrlData } = supabase.storage
  .from('tourism-images')
  .getPublicUrl(fileName);
```

**Problemas possíveis**:
- Se `VITE_SUPABASE_URL` estiver incorreto, as URLs geradas estarão erradas
- O bucket `tourism-images` pode não estar público no ambiente de produção
- CSP (Content Security Policy) pode estar bloqueando as URLs

**Como verificar**:
1. Abrir console do navegador no Vercel
2. Verificar erros de rede ao carregar imagens
3. Verificar se as URLs geradas estão corretas

---

### **3. RLS (Row Level Security) Bloqueando Acesso**

As políticas de segurança do Supabase podem estar bloqueando o acesso no ambiente de produção.

**Tabelas afetadas**:
- `pantanal_avatars`
- `destinations`
- `destination_details`

**Como verificar**:
1. Acessar Supabase Dashboard → SQL Editor
2. Executar:
   ```sql
   -- Verificar se os dados existem
   SELECT COUNT(*) FROM pantanal_avatars;
   SELECT COUNT(*) FROM destinations;
   
   -- Verificar políticas RLS
   SELECT * FROM pg_policies WHERE tablename IN ('pantanal_avatars', 'destinations');
   ```

**Solução temporária (para teste)**:
- Desativar RLS temporariamente nas tabelas
- Se funcionar, o problema são as políticas
- Reativar RLS e ajustar as políticas

---

### **4. Cache do Vercel**

O Vercel pode estar servindo uma versão antiga do build.

**Solução**:
1. Dashboard Vercel → Deployments
2. Clicar nos 3 pontinhos do último deployment
3. Selecionar **Redeploy**
4. Ou fazer commit vazio:
   ```bash
   git commit --allow-empty -m "trigger: Forçar novo build"
   git push
   ```

---

### **5. Content Security Policy (CSP) Bloqueando Recursos**

O `vercel.json` tem uma CSP configurada que pode estar bloqueando imagens do Supabase:

```json
"Content-Security-Policy": "default-src 'self' https: blob: data:; ... img-src 'self' data: blob: https:; ..."
```

**Verificar**: As URLs do Supabase Storage devem estar no formato `https://[projeto].supabase.co/storage/v1/object/public/...`

Se a CSP estiver muito restritiva, pode bloquear.

---

## ✅ CHECKLIST DE VERIFICAÇÃO (Ordem de Prioridade)

### **PRIORIDADE 1 - Variáveis de Ambiente** 🔴

- [ ] Acessar Dashboard Vercel → Settings → Environment Variables
- [ ] Verificar se `VITE_SUPABASE_URL` está configurada
- [ ] Verificar se `VITE_SUPABASE_ANON_KEY` está configurada
- [ ] Comparar valores com o `.env` local (devem ser idênticos)
- [ ] Fazer novo deploy após verificar/adicionar variáveis

**Como verificar localmente**:
```bash
# Windows
type .env | findstr VITE_SUPABASE

# Linux/Mac
cat .env | grep VITE_SUPABASE
```

**Como adicionar no Vercel**:
1. Dashboard Vercel → Seu Projeto → Settings
2. Environment Variables → Add New
3. Adicionar cada variável:
   - Key: `VITE_SUPABASE_URL`
   - Value: (copiar do .env local)
   - Environments: Production, Preview, Development (marcar todos)
4. Repetir para `VITE_SUPABASE_ANON_KEY`
5. Fazer novo deploy

---

### **PRIORIDADE 2 - Verificar Banco de Dados** 🟡

- [ ] Confirmar que localhost e Vercel usam o MESMO Supabase
- [ ] Executar SQL no Supabase para verificar dados:
   ```sql
   SELECT COUNT(*) as total_avatars FROM pantanal_avatars;
   SELECT COUNT(*) as total_destinations FROM destinations;
   ```
- [ ] Se retornar 0, os dados não existem no banco
- [ ] Se retornar números, os dados existem (problema é nas variáveis/env)

---

### **PRIORIDADE 3 - Verificar Bucket Storage** 🟡

- [ ] Acessar Supabase Dashboard → Storage
- [ ] Verificar se o bucket `tourism-images` existe
- [ ] Verificar se o bucket está marcado como **Público**
- [ ] Se não existir, executar o SQL:
   - `supabase/create_tourism_images_bucket.sql`

---

### **PRIORIDADE 4 - Verificar Logs do Vercel** 🟢

- [ ] Dashboard Vercel → Deployments → Último deployment
- [ ] Abrir Build Logs
- [ ] Procurar por erros:
   - `VITE_SUPABASE_URL is not defined`
   - `Failed to fetch`
   - `Row Level Security policy violation`
   - `Bucket not found`

---

### **PRIORIDADE 5 - Verificar no Navegador (Vercel)** 🟢

1. Abrir a aplicação no Vercel
2. Abrir DevTools (F12)
3. Ir em **Console** → procurar erros
4. Ir em **Network** → procurar requisições falhando
5. Filtrar por "supabase" ou "storage"
6. Verificar se as URLs das imagens estão corretas

---

## 🛠️ Solução Rápida (Teste Imediato)

### **Passo 1: Verificar Variáveis no Vercel**

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto
3. Settings → Environment Variables
4. **PRINT ou DESCREVA**: Quais variáveis começam com `VITE_`?

### **Passo 2: Adicionar Variáveis (se faltando)**

Copie do `.env` local:
```bash
VITE_SUPABASE_URL=https://[seu-projeto].supabase.co
VITE_SUPABASE_ANON_KEY=[sua-chave]
```

Cole no Vercel e faça novo deploy.

### **Passo 3: Testar**

Após novo deploy, verificar se funciona.

---

## 📊 Como Diagnosticar Mais Precisamente

Criar um componente de teste temporário para verificar o ambiente:

```typescript
// Adicionar temporariamente em uma página do admin
console.log('🔍 DEBUG AMBIENTE:');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? '✅ Definida' : '❌ NÃO DEFINIDA');
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Definida' : '❌ NÃO DEFINIDA');
```

---

## 🚨 Próximos Passos

**Por favor, me informe**:

1. ✅ Você já verificou as variáveis de ambiente no Vercel?
2. ✅ Quais variáveis `VITE_*` estão configuradas no Vercel?
3. ✅ Os valores são iguais aos do `.env` local?
4. ✅ Você já fez um novo deploy após configurar as variáveis?
5. ✅ Consegue acessar os logs do Vercel? Há algum erro específico?

Com essas informações, posso ajudar a resolver o problema de forma mais direcionada.

---

## 📚 Referências

- Documentação existente: `SOLUCAO_VERCEL_LOCALHOST.md`
- Bucket SQL: `supabase/create_tourism_images_bucket.sql`






















