# 🔧 GUIA DE RECUPERAÇÃO COMPLETA - VIAJAR & DESCUBRA MS

## 📋 **ÍNDICE**
1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Configuração do Ambiente](#configuração-do-ambiente)
4. [Recuperação do Banco de Dados](#recuperação-do-banco-de-dados)
5. [Configuração de APIs](#configuração-de-apis)
6. [Deploy e Configuração](#deploy-e-configuração)
7. [Verificação e Testes](#verificação-e-testes)
8. [Troubleshooting](#troubleshooting)
9. [Backup e Restore](#backup-e-restore)
10. [Monitoramento Pós-Recuperação](#monitoramento-pós-recuperação)

---

## 🎯 **VISÃO GERAL**

Este guia fornece instruções completas para **recuperar e configurar** as plataformas ViaJAR e Descubra MS em caso de falha ou necessidade de setup em novo ambiente.

### **Cenários de Recuperação**
- **Falha total** do sistema
- **Migração** para novo servidor
- **Setup** em ambiente de desenvolvimento
- **Restore** de backup
- **Configuração** de ambiente de produção

---

## ⚙️ **PRÉ-REQUISITOS**

### **Software Necessário**
```bash
# Node.js (versão 18+)
node --version  # v18.0.0+

# npm (versão 9+)
npm --version   # 9.0.0+

# Git
git --version   # 2.30.0+

# Supabase CLI
npx supabase --version  # 1.0.0+
```

### **Contas e Serviços**
- **GitHub**: Repositório do código
- **Supabase**: Banco de dados e autenticação
- **Vercel**: Deploy do frontend
- **Google Cloud**: APIs (Search, Maps, Gemini)
- **Stripe**: Pagamentos (opcional)

### **Credenciais Necessárias**
```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google APIs
GOOGLE_API_KEY=your_google_key
GOOGLE_SEARCH_ENGINE_ID=your_engine_id
GEMINI_API_KEY=your_gemini_key

# ALUMIA (MS)
ALUMIA_API_KEY=your_alumia_key
```

---

## 🏗️ **CONFIGURAÇÃO DO AMBIENTE**

### **1. Clone do Repositório**
```bash
# Clone do repositório
git clone https://github.com/your-org/descubra-ms.git
cd descubra-ms

# Verificar branch
git branch -a
git checkout main

# Verificar status
git status
```

### **2. Instalação de Dependências**
```bash
# Instalar dependências
npm install

# Verificar instalação
npm list --depth=0

# Verificar scripts disponíveis
npm run
```

### **3. Configuração de Variáveis de Ambiente**
```bash
# Copiar arquivo de exemplo
cp .env.example .env.local

# Editar variáveis
nano .env.local
```

**Arquivo .env.local:**
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Google APIs
VITE_GOOGLE_API_KEY=your_google_api_key
VITE_GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id
VITE_GEMINI_API_KEY=your_gemini_api_key

# ALUMIA (Mato Grosso do Sul)
VITE_ALUMIA_API_KEY=your_alumia_api_key

# Environment
NODE_ENV=development
VITE_APP_ENV=development
```

---

## 🗄️ **RECUPERAÇÃO DO BANCO DE DADOS**

### **1. Configuração do Supabase**
```bash
# Inicializar Supabase
npx supabase init

# Link com projeto remoto
npx supabase link --project-ref your-project-ref

# Verificar conexão
npx supabase status
```

### **2. Aplicar Migrações**
```bash
# Verificar migrações pendentes
npx supabase db diff --schema public

# Aplicar migrações
npx supabase db push

# Verificar schema
npx supabase db diff --schema public
```

### **3. Configurar RLS (Row Level Security)**
```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);
```

### **4. Restaurar Dados (se necessário)**
```bash
# Backup do banco
npx supabase db dump --data-only > backup.sql

# Restore do backup
npx supabase db reset --linked
psql -h db.your-project.supabase.co -U postgres -d postgres < backup.sql
```

---

## 🔌 **CONFIGURAÇÃO DE APIs**

### **1. Google APIs**
```bash
# Configurar Google Search API
# 1. Acessar Google Cloud Console
# 2. Criar projeto ou selecionar existente
# 3. Habilitar Custom Search API
# 4. Criar chave de API
# 5. Configurar Search Engine ID

# Configurar Google Maps API
# 1. Habilitar Maps JavaScript API
# 2. Configurar restrições de domínio
# 3. Adicionar chave ao .env.local
```

### **2. Gemini AI**
```bash
# Configurar Gemini API
# 1. Acessar Google AI Studio
# 2. Criar chave de API
# 3. Configurar restrições
# 4. Adicionar ao .env.local
```

### **3. ALUMIA (Mato Grosso do Sul)**
```bash
# Configurar ALUMIA API
# 1. Contatar SETUR-MS
# 2. Solicitar acesso à API
# 3. Configurar chave de API
# 4. Testar integração
```

---

## 🚀 **DEPLOY E CONFIGURAÇÃO**

### **1. Deploy Frontend (Vercel)**
```bash
# Instalar Vercel CLI
npm install -g vercel

# Login no Vercel
vercel login

# Deploy
vercel --prod

# Configurar variáveis de ambiente
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_GOOGLE_API_KEY
vercel env add VITE_GEMINI_API_KEY
```

### **2. Configuração de Domínio**
```bash
# Configurar domínio personalizado
vercel domains add your-domain.com

# Configurar DNS
# A record: your-domain.com → 76.76.19.61
# CNAME: www.your-domain.com → cname.vercel-dns.com
```

### **3. Configuração de SSL**
```bash
# SSL é automático no Vercel
# Verificar certificado
curl -I https://your-domain.com
```

---

## ✅ **VERIFICAÇÃO E TESTES**

### **1. Testes de Funcionalidade**
```bash
# Executar testes
npm run test

# Testes de integração
npm run test:integration

# Testes de performance
npm run test:performance
```

### **2. Verificação de APIs**
```bash
# Testar Supabase
curl -X GET "https://your-project.supabase.co/rest/v1/users" \
  -H "apikey: your_anon_key" \
  -H "Authorization: Bearer your_anon_key"

# Testar Google APIs
curl "https://www.googleapis.com/customsearch/v1?key=your_key&cx=your_cx&q=test"

# Testar Gemini
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent" \
  -H "Content-Type: application/json" \
  -H "x-goog-api-key: your_gemini_key" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

### **3. Verificação de Performance**
```bash
# Lighthouse audit
npx lighthouse https://your-domain.com --output html

# Core Web Vitals
npx web-vitals

# Bundle analysis
npm run build
npx bundle-analyzer dist/assets/*.js
```

---

## 🔧 **TROUBLESHOOTING**

### **Problemas Comuns**

#### **1. Erro de Conexão com Supabase**
```bash
# Verificar URL e chave
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Testar conexão
npx supabase status
```

#### **2. Erro de APIs do Google**
```bash
# Verificar chaves
echo $VITE_GOOGLE_API_KEY
echo $VITE_GOOGLE_SEARCH_ENGINE_ID

# Testar API
curl "https://www.googleapis.com/customsearch/v1?key=$VITE_GOOGLE_API_KEY&cx=$VITE_GOOGLE_SEARCH_ENGINE_ID&q=test"
```

#### **3. Erro de Build**
```bash
# Limpar cache
npm run clean
rm -rf node_modules
rm package-lock.json
npm install

# Verificar TypeScript
npx tsc --noEmit
```

#### **4. Erro de Deploy**
```bash
# Verificar logs
vercel logs

# Verificar build local
npm run build
npm run preview
```

### **Logs e Debugging**
```bash
# Logs do Supabase
npx supabase logs

# Logs do Vercel
vercel logs

# Debug local
DEBUG=* npm run dev
```

---

## 💾 **BACKUP E RESTORE**

### **1. Backup do Banco de Dados**
```bash
# Backup completo
npx supabase db dump > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup apenas dados
npx supabase db dump --data-only > data_backup_$(date +%Y%m%d_%H%M%S).sql

# Backup apenas schema
npx supabase db dump --schema-only > schema_backup_$(date +%Y%m%d_%H%M%S).sql
```

### **2. Backup de Arquivos**
```bash
# Backup do código
git bundle create code_backup_$(date +%Y%m%d_%H%M%S).bundle main

# Backup de configurações
tar -czf config_backup_$(date +%Y%m%d_%H%M%S).tar.gz .env* vercel.json
```

### **3. Restore de Backup**
```bash
# Restore do banco
npx supabase db reset --linked
psql -h db.your-project.supabase.co -U postgres -d postgres < backup_20240101_120000.sql

# Restore do código
git clone code_backup_20240101_120000.bundle restored_code
```

---

## 📊 **MONITORAMENTO PÓS-RECUPERAÇÃO**

### **1. Métricas Essenciais**
```bash
# Uptime
curl -I https://your-domain.com

# Performance
npx lighthouse https://your-domain.com --output json

# APIs
curl -X GET "https://your-project.supabase.co/rest/v1/users" \
  -H "apikey: your_anon_key"
```

### **2. Alertas Configurados**
```bash
# Uptime monitoring
# Configurar alertas para:
# - Uptime < 99%
# - Response time > 2s
# - Error rate > 1%
# - API failures
```

### **3. Logs de Monitoramento**
```bash
# Logs do Supabase
npx supabase logs --follow

# Logs do Vercel
vercel logs --follow

# Logs da aplicação
tail -f /var/log/app.log
```

---

## 🚨 **PLANO DE CONTINGÊNCIA**

### **1. Falha Total do Sistema**
```bash
# 1. Verificar status dos serviços
# 2. Restaurar backup mais recente
# 3. Reconfigurar APIs
# 4. Verificar funcionalidades
# 5. Notificar usuários
```

### **2. Falha de Banco de Dados**
```bash
# 1. Verificar status do Supabase
# 2. Restaurar backup
# 3. Verificar integridade
# 4. Testar funcionalidades
```

### **3. Falha de APIs Externas**
```bash
# 1. Verificar status das APIs
# 2. Ativar fallbacks
# 3. Notificar sobre limitações
# 4. Monitorar recuperação
```

---

## 📞 **CONTATOS DE SUPORTE**

### **Serviços Externos**
- **Supabase**: support@supabase.io
- **Vercel**: support@vercel.com
- **Google Cloud**: support@google.com
- **Stripe**: support@stripe.com

### **Equipe Técnica**
- **Desenvolvedor Principal**: [seu-email]
- **DevOps**: [devops-email]
- **Suporte**: [suporte-email]

---

## 📋 **CHECKLIST DE RECUPERAÇÃO**

### **Pré-Recuperação**
- [ ] Verificar backups disponíveis
- [ ] Confirmar credenciais de acesso
- [ ] Preparar ambiente de desenvolvimento
- [ ] Documentar problemas conhecidos

### **Durante a Recuperação**
- [ ] Configurar ambiente
- [ ] Restaurar banco de dados
- [ ] Configurar APIs
- [ ] Deploy da aplicação
- [ ] Verificar funcionalidades

### **Pós-Recuperação**
- [ ] Testes completos
- [ ] Monitoramento ativo
- [ ] Documentar lições aprendidas
- [ ] Atualizar procedimentos
- [ ] Notificar stakeholders

---

*Documento gerado em: Janeiro 2024*  
*Versão: 1.0*  
*Status: Atualizado*

