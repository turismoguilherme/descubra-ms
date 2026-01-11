# 🛡️ Prevenção: Garantir Atualizações Automáticas no Vercel

## 📋 Objetivo

Configurar o projeto para garantir que o Vercel sempre atualize automaticamente quando houver novos commits, prevenindo problemas de deployments não atualizados.

---

## ✅ Configurações Preventivas

### **1. Configuração do Remote Git** 🔴 **CRÍTICO**

O remote `vercel` deve estar sempre configurado e sincronizado:

```bash
# Verificar remotes configurados
git remote -v

# Deve mostrar:
# origin    https://github.com/turismoguilherme/descubra-ms.git (fetch)
# origin    https://github.com/turismoguilherme/descubra-ms.git (push)
# vercel    https://github.com/guilhermearevalo/descubrams.git (fetch)
# vercel    https://github.com/guilhermearevalo/descubrams.git (push)

# Se não existir, adicionar:
git remote add vercel https://github.com/guilhermearevalo/descubrams.git
```

**⚠️ IMPORTANTE:** Sempre faça push para ambos os remotes após cada commit.

---

### **2. Configuração no Vercel Dashboard** 🔴 **CRÍTICO**

#### **Verificar Repositório Conectado:**

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** → **Git**
4. **Verifique:**
   - ✅ Repositório conectado: `guilhermearevalo/descubrams`
   - ✅ Branch de produção: `main`
   - ✅ Automatic deployments: **Enabled**
   - ✅ Ignore Build Step: **Não configurado ou false**

#### **Verificar Webhooks:**

1. Acesse: https://github.com/guilhermearevalo/descubrams/settings/hooks
2. **Verifique:**
   - ✅ Há um webhook do Vercel ativo
   - ✅ Últimos eventos foram bem-sucedidos (verde)
   - ✅ Webhook está recebendo eventos de push

**Se o webhook não estiver ativo:**
1. Vercel Dashboard → Settings → Git → **Disconnect**
2. **Connect Git Repository** novamente
3. Selecione `guilhermearevalo/descubrams`
4. Confirme branch `main`
5. O Vercel criará o webhook automaticamente

---

### **3. Configuração do vercel.json** ✅ **VERIFICADO**

O arquivo `vercel.json` está configurado corretamente:

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

**Não modifique** essas configurações a menos que necessário, pois mudanças podem exigir reautorização.

---

### **4. Script de Push Automático** 🚀 **RECOMENDADO**

Crie um script para sempre fazer push para ambos os remotes:

#### **Windows (push_vercel.bat):**

```batch
@echo off
echo 🚀 Fazendo push para remotes origin e vercel...

git push origin main
if %errorlevel% neq 0 (
    echo ❌ Erro ao fazer push para origin
    exit /b 1
)

git push vercel main
if %errorlevel% neq 0 (
    echo ❌ Erro ao fazer push para vercel
    exit /b 1
)

echo ✅ Push concluído com sucesso para ambos os remotes!
echo 📦 Vercel deve detectar automaticamente e criar um novo deployment
```

**Uso:**
```bash
push_vercel.bat
```

#### **Bash/Shell (push_vercel.sh):**

```bash
#!/bin/bash
set -e

echo "🚀 Fazendo push para remotes origin e vercel..."

git push origin main
git push vercel main

echo "✅ Push concluído com sucesso para ambos os remotes!"
echo "📦 Vercel deve detectar automaticamente e criar um novo deployment"
```

**Uso:**
```bash
chmod +x push_vercel.sh
./push_vercel.sh
```

---

### **5. Git Hook para Push Automático (Opcional)** 🔧 **AVANÇADO**

Crie um hook `post-commit` para sempre fazer push para o remote vercel:

#### **Windows (.git/hooks/post-commit):**

```batch
@echo off
REM Não fazer push no hook (pode causar loops)
REM Apenas notificar
echo ⚠️ Lembre-se de fazer push para vercel: git push vercel main
```

#### **Bash/Shell (.git/hooks/post-commit):**

```bash
#!/bin/bash
# Não fazer push no hook (pode causar loops)
# Apenas notificar
echo "⚠️ Lembre-se de fazer push para vercel: git push vercel main"
```

**⚠️ ATENÇÃO:** Não faça push automático no hook, pois pode causar loops infinitos. Use apenas para notificação.

---

### **6. Configuração de Build no Vercel** ✅ **VERIFICADO**

#### **Verificar Build & Development Settings:**

1. Vercel Dashboard → Settings → General
2. Role até **Build & Development Settings**
3. **Verifique:**
   - ✅ Framework Preset: **Vite**
   - ✅ Build Command: `npm run build`
   - ✅ Output Directory: `dist`
   - ✅ Install Command: `npm install` (ou deixe vazio)
   - ✅ Root Directory: `.` (raiz do projeto)

#### **Verificar Environment Variables:**

1. Vercel Dashboard → Settings → Environment Variables
2. **Verifique se estão configuradas:**
   - `VITE_SUPABASE_URL` (Production, Preview, Development)
   - `VITE_SUPABASE_ANON_KEY` (Production, Preview, Development)
   - Outras variáveis necessárias

**⚠️ IMPORTANTE:** Variáveis de ambiente devem ter o prefixo `VITE_` para serem expostas no frontend.

---

### **7. Monitoramento de Deployments** 📊 **RECOMENDADO**

#### **Verificar Status do Deployment:**

1. Após fazer push, acesse: https://vercel.com/dashboard
2. Vá em **Deployments**
3. **Verifique:**
   - ✅ Novo deployment foi criado automaticamente (deve aparecer em segundos)
   - ✅ Status está "Building" ou "Ready"
   - ✅ Commit hash corresponde ao último commit enviado
   - ✅ Branch está como `main`

#### **Verificar Logs:**

1. Clique no deployment mais recente
2. Vá na aba **Logs**
3. **Procure por:**
   - ✅ Build iniciou corretamente
   - ✅ Sem erros críticos
   - ✅ Build concluído com sucesso

**Se o deployment não for criado automaticamente:**
- Verifique webhooks do GitHub
- Verifique se o commit está no repositório remoto
- Verifique configurações do Git no Vercel

---

### **8. Checklist de Prevenção** ✅ **OBRIGATÓRIO**

Execute este checklist sempre que fizer commit:

#### **Antes de Fazer Commit:**

- [ ] Código está funcionando localmente
- [ ] Testes passaram (se houver)
- [ ] Build local funciona: `npm run build`

#### **Após Fazer Commit:**

- [ ] Commit foi criado: `git log -1`
- [ ] Push para origin: `git push origin main`
- [ ] Push para vercel: `git push vercel main`
- [ ] Verificar que ambos os pushes foram bem-sucedidos

#### **Após Push:**

- [ ] Acessar Vercel Dashboard → Deployments
- [ ] Verificar que novo deployment foi criado (em até 1 minuto)
- [ ] Verificar que commit hash corresponde ao último commit
- [ ] Verificar logs do deployment (sem erros)
- [ ] Aguardar deployment concluir (status "Ready")

#### **Se Deployment Não For Criado:**

- [ ] Verificar webhooks do GitHub (último evento bem-sucedido?)
- [ ] Verificar repositório conectado no Vercel (é `guilhermearevalo/descubrams`?)
- [ ] Verificar branch de produção (é `main`?)
- [ ] Tentar reconectar repositório no Vercel
- [ ] Verificar status do Vercel: https://www.vercel-status.com/

---

### **9. Processo Automatizado Recomendado** 🔄 **WORKFLOW**

Crie um workflow padrão para sempre garantir atualizações:

```bash
# 1. Fazer commit
git add .
git commit -m "sua mensagem de commit"

# 2. Fazer push para ambos os remotes (use o script push_vercel.bat)
push_vercel.bat

# OU manualmente:
git push origin main
git push vercel main

# 3. Verificar no Vercel Dashboard (após ~30 segundos)
# Acesse: https://vercel.com/dashboard → Deployments
# Verifique que novo deployment foi criado

# 4. Se não aparecer, seguir troubleshooting em SOLUCAO_ATUALIZACAO_VERCEL.md
```

---

### **10. Troubleshooting Rápido** 🔧

Se o deployment não for criado automaticamente:

1. **Verificar webhooks (1 minuto):**
   - GitHub → Settings → Webhooks → Verificar último evento

2. **Reconectar repositório (2 minutos):**
   - Vercel → Settings → Git → Disconnect → Connect novamente

3. **Forçar push (30 segundos):**
   ```bash
   git push vercel main --force-with-lease
   ```
   ⚠️ Use `--force-with-lease` apenas se necessário

4. **Forçar deployment manual (1 minuto):**
   - Vercel Dashboard → Deployments → "..." → Redeploy
   - Desmarque "Use existing Build Cache"

---

## 📚 Documentos Relacionados

- **SOLUCAO_ATUALIZACAO_VERCEL.md** - Soluções detalhadas para problemas
- **TROUBLESHOOTING_VERCEL_NAO_ATUALIZA.md** - Troubleshooting completo
- **VERIFICACAO_CACHE_VERCEL.md** - Verificação de cache

---

## 🎯 Resumo das Configurações Críticas

### **Deve Estar Configurado:**

1. ✅ Remote `vercel` configurado: `git remote -v` deve mostrar `vercel`
2. ✅ Repositório conectado no Vercel: `guilhermearevalo/descubrams`
3. ✅ Branch de produção: `main`
4. ✅ Webhooks do GitHub ativos e funcionando
5. ✅ Push sempre feito para ambos os remotes (`origin` e `vercel`)

### **Deve Estar Verificado Periodicamente:**

1. ⚠️ Webhooks do GitHub (último evento bem-sucedido?)
2. ⚠️ Deployments sendo criados automaticamente?
3. ⚠️ Variáveis de ambiente configuradas no Vercel?
4. ⚠️ Logs dos deployments (sem erros?)

---

**Última atualização:** 02/02/2025  
**Status:** ✅ Configurações preventivas documentadas

**IMPORTANTE:** Sempre faça push para ambos os remotes (`origin` e `vercel`) após cada commit para garantir que o Vercel seja atualizado automaticamente!

