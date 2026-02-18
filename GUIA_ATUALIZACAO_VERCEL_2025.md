# 🚀 Guia Completo: Como Atualizar o Vercel (2025)

## 📋 Resumo

Este guia explica como garantir que o Vercel sempre atualize automaticamente quando você fizer novos commits, baseado na [documentação oficial do Vercel](https://vercel.com/docs/deployments).

---

## ✅ Verificações Iniciais (Ordem de Prioridade)

### **1. Verificar Integração Git no Vercel** 🔴 **CRÍTICO**

O Vercel precisa estar conectado ao repositório correto via Git (GitHub, GitLab ou Bitbucket).

**Passos:**
1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** → **Git**
4. **Verifique:**
   - ✅ Repositório conectado: `guilhermearevalo/descubrams`
   - ✅ Provider: GitHub
   - ✅ Última sincronização: Data/hora recente

**Se não estiver conectado ou estiver incorreto:**
1. Clique em **Disconnect** (se houver)
2. Clique em **Connect Git Repository**
3. Selecione `guilhermearevalo/descubrams`
4. Confirme a branch `main` como produção
5. O Vercel criará os webhooks automaticamente

**Referência:** [Vercel Docs - Git Integration](https://vercel.com/docs/deployments/git)

---

### **2. Verificar Permissões do Autor do Commit** 🔴 **CRÍTICO**

O autor do commit precisa ser membro da equipe (Team) que possui o projeto no Vercel.

**Problema comum:**
- Commits feitos por usuários que não são membros da equipe não disparam deploys
- Especialmente em repositórios privados ou quando o plano mudou (Hobby → Pro)

**Verificação:**
1. Verifique o autor do último commit:
   ```bash
   git log -1 --format="%an <%ae>"
   ```

2. Confirme que esse usuário tem acesso ao projeto no Vercel:
   - Vercel Dashboard → Settings → Team
   - Verifique se o email do autor está na lista de membros

**Solução:**
- Adicione o usuário à equipe no Vercel, ou
- Configure o Git para usar o email correto:
  ```bash
  git config user.name "Seu Nome"
  git config user.email seu-email@provedor.com
  ```

**Referência:** [Vercel Guide - Why commits aren't triggering deployments](https://vercel.com/guides/why-aren-t-commits-triggering-deployments-on-vercel)

---

### **3. Verificar Webhooks do GitHub** 🔴 **CRÍTICO**

Os webhooks são responsáveis por notificar o Vercel quando há novos commits.

**Passos:**
1. Acesse: https://github.com/guilhermearevalo/descubrams/settings/hooks
2. **Verifique:**
   - ✅ Há um webhook do Vercel ativo
   - ✅ URL do webhook contém `api.vercel.com` ou similar
   - ✅ Eventos configurados: `push` deve estar marcado
   - ✅ Últimos eventos foram bem-sucedidos (verde)
   - ✅ Delivery recente (último push deve ter disparado um evento)

**Se o webhook não existir ou não estiver funcionando:**
1. Vercel Dashboard → Settings → Git → **Disconnect**
2. **Connect Git Repository** novamente
3. Selecione `guilhermearevalo/descubrams`
4. O Vercel recriará o webhook automaticamente

**Teste manual:**
- Faça um commit vazio: `git commit --allow-empty -m "test: trigger webhook"`
- Faça push: `git push vercel main`
- Verifique no GitHub → Settings → Webhooks → Últimos deliveries
- Deve aparecer um novo evento em poucos segundos

---

### **4. Verificar Branch de Produção** 🟡 **IMPORTANTE**

O Vercel precisa estar configurado para monitorar a branch correta.

**Passos:**
1. Vercel Dashboard → Settings → Git
2. Verifique **Production Branch**
3. Deve estar configurado como `main`
4. Se não estiver, altere para `main` e salve

**Branches monitoradas:**
- Production Branch (`main`) → Cria deployments de produção
- Outras branches → Criam deployments de preview (se habilitado)

**Referência:** [Vercel Docs - Branches](https://vercel.com/docs/deployments/branches)

---

### **5. Verificar Configurações de Build** 🟡 **IMPORTANTE**

**Passos:**
1. Vercel Dashboard → Settings → General
2. Role até **Build & Development Settings**
3. **Verifique:**
   - ✅ Framework Preset: **Vite**
   - ✅ Build Command: `npm run build`
   - ✅ Output Directory: `dist`
   - ✅ Install Command: `npm install` (ou deixe vazio)
   - ✅ Root Directory: `.` (raiz do projeto)
   - ✅ Ignore Build Step: **Não configurado ou vazio**

**⚠️ ATENÇÃO:** Se "Ignore Build Step" estiver configurado para sempre retornar `true`, os deploys serão ignorados!

---

## 🚀 Como Forçar Atualização no Vercel

### **Opção 1: Push para o Remote Vercel (Recomendado)** ⭐

**Usar o script automático:**
```bash
push_vercel.bat
```

**Ou manualmente:**
```bash
# Verificar remotes
git remote -v

# Fazer push para o remote do Vercel
git push vercel main
```

O Vercel detectará automaticamente o push e criará um novo deployment em segundos.

**Referência:** [Vercel Docs - Automatic Deployments](https://vercel.com/docs/deployments#automatic-deployments)

---

### **Opção 2: Commit Vazio para Trigger** 🔄

Se você não tem mudanças mas quer forçar um deploy:

```bash
# Criar commit vazio
git commit --allow-empty -m "trigger: Forçar novo deployment no Vercel"

# Push para o remote do Vercel
git push vercel main
```

---

### **Opção 3: Redeploy Manual via Dashboard** 🖥️

**Passos:**
1. Acesse: https://vercel.com/dashboard
2. Vá em **Deployments**
3. Clique nos **3 pontinhos (⋯)** do último deployment
4. Selecione **Redeploy**
5. **DESMARQUE** a opção **"Use existing Build Cache"** (importante!)
6. Clique em **Redeploy**

**⚠️ IMPORTANTE:** Sempre desmarque "Use existing Build Cache" ao fazer redeploy, caso contrário o build pode usar cache antigo!

**Referência:** [Vercel Docs - Managing Deployments](https://vercel.com/docs/deployments/managing-deployments)

---

### **Opção 4: Deploy Hooks** 🔗

Deploy Hooks permitem disparar deployments via URL (útil para CI/CD, webhooks externos, etc.).

**Configurar:**
1. Vercel Dashboard → Settings → Git → **Deploy Hooks**
2. Clique em **Create Hook**
3. Configure:
   - Name: `Manual Deploy`
   - Branch: `main`
   - Directory: (deixe vazio)
4. Copie a URL do hook

**Usar:**
```bash
# Via curl
curl -X POST https://api.vercel.com/v1/integrations/deploy/...

# Ou acesse a URL no navegador (GET também funciona)
```

**Referência:** [Vercel Docs - Deploy Hooks](https://vercel.com/docs/deploy-hooks)

---

### **Opção 5: Vercel CLI** 💻

**Instalar:**
```bash
npm i -g vercel
```

**Login:**
```bash
vercel login
```

**Deploy forçado:**
```bash
# Deploy para produção
vercel --prod --force

# Ou apenas deploy (preview)
vercel --force
```

**Referência:** [Vercel Docs - Vercel CLI](https://vercel.com/docs/cli)

---

## 🔍 Checklist de Diagnóstico

Execute na ordem para identificar o problema:

- [ ] **1. Verificar remotes Git locais** (`git remote -v`)
  - Deve ter `vercel` apontando para `guilhermearevalo/descubrams`
  
- [ ] **2. Verificar se commits estão no GitHub** 
  - Acesse: https://github.com/guilhermearevalo/descubrams
  - Último commit deve estar na branch `main`
  
- [ ] **3. Verificar repositório conectado no Vercel**
  - Vercel Dashboard → Settings → Git
  - Deve ser: `guilhermearevalo/descubrams`
  
- [ ] **4. Verificar webhooks do GitHub**
  - GitHub → Settings → Webhooks
  - Deve haver webhook do Vercel ativo
  - Último evento deve ser bem-sucedido
  
- [ ] **5. Verificar branch de produção no Vercel**
  - Vercel Dashboard → Settings → Git
  - Production Branch = `main`
  
- [ ] **6. Verificar permissões do autor do commit**
  - `git log -1 --format="%an <%ae>"`
  - Confirme que o usuário tem acesso ao projeto no Vercel
  
- [ ] **7. Verificar logs do último deployment**
  - Vercel Dashboard → Deployments → Último deployment → Logs
  - Procure por erros ou avisos
  
- [ ] **8. Verificar configurações de build**
  - Vercel Dashboard → Settings → General
  - Verifique "Ignore Build Step" (deve estar vazio ou desabilitado)

---

## 📝 Informações do Projeto

- **Repositório do Vercel:** `guilhermearevalo/descubrams`
- **Branch de produção:** `main`
- **Remote Git:** `vercel` → `https://github.com/guilhermearevalo/descubrams.git`
- **Remote Origin:** `origin` → `https://github.com/turismoguilherme/descubra-ms.git`

---

## 🎯 Processo Recomendado (Workflow)

### **Após cada commit:**
```bash
# 1. Fazer commit normalmente
git add .
git commit -m "sua mensagem de commit"

# 2. Fazer push para ambos os remotes
push_vercel.bat

# OU manualmente:
git push origin main
git push vercel main
```

### **Verificar no Vercel (após ~30 segundos):**
1. Acesse: https://vercel.com/dashboard
2. Vá em **Deployments**
3. Verifique que um novo deployment foi criado automaticamente
4. Aguarde o deployment concluir (status "Ready")

---

## ⚠️ Problemas Comuns e Soluções

### **❌ Deployment não foi criado automaticamente**

**Soluções (em ordem):**
1. **Verificar webhooks** (1 minuto)
   - GitHub → Settings → Webhooks → Verificar último evento
   
2. **Reconectar repositório no Vercel** (2 minutos)
   - Vercel → Settings → Git → Disconnect → Connect novamente
   
3. **Forçar push** (30 segundos)
   ```bash
   git push vercel main
   ```
   
4. **Fazer commit vazio** (1 minuto)
   ```bash
   git commit --allow-empty -m "trigger: Forçar deployment"
   git push vercel main
   ```

### **❌ Deployment foi criado mas o site não atualiza**

**Soluções:**
1. **Limpar cache do navegador**
   - Ctrl+Shift+Delete (Chrome/Edge)
   - Ou usar modo anônimo

2. **Redeploy sem cache**
   - Vercel Dashboard → Deployments → ⋯ → Redeploy
   - **DESMARQUE** "Use existing Build Cache"

3. **Verificar headers de cache**
   - Verifique o arquivo `vercel.json`
   - `index.html` deve ter `no-cache`

### **❌ "Ignore Build Step" está ignorando deploys**

**Solução:**
1. Vercel Dashboard → Settings → General
2. Role até **Build & Development Settings**
3. Verifique **Ignore Build Step**
4. Deve estar vazio ou retornar `false`
5. Se estiver configurado, remova ou altere para: `exit 0` (não ignorar)

---

## 📚 Referências Oficiais

- **Vercel Docs - Deployments:** https://vercel.com/docs/deployments
- **Vercel Guide - Why commits aren't triggering:** https://vercel.com/guides/why-aren-t-commits-triggering-deployments-on-vercel
- **Vercel Docs - Deploy Hooks:** https://vercel.com/docs/deploy-hooks
- **Vercel Docs - Managing Deployments:** https://vercel.com/docs/deployments/managing-deployments
- **Vercel Status:** https://www.vercel-status.com/

---

## ✅ Resumo das Ações

1. ✅ Remote `vercel` configurado: `https://github.com/guilhermearevalo/descubrams.git`
2. ✅ Script `push_vercel.bat` criado para facilitar pushes
3. ✅ Documentação completa atualizada com base na documentação oficial
4. ✅ Checklist de diagnóstico criado
5. ✅ Guia de troubleshooting criado

---

**Última atualização:** 27/01/2025  
**Status:** ✅ Guia atualizado com base na documentação oficial do Vercel
























