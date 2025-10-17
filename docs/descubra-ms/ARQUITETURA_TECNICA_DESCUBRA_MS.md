# 🏗️ **ARQUITETURA TÉCNICA - PLATAFORMA DESCUBRA MS**

## 📊 **VISÃO GERAL DA ARQUITETURA**

A Plataforma Descubra MS foi desenvolvida com uma arquitetura moderna, escalável e segura, utilizando as melhores práticas de desenvolvimento web e tecnologias de ponta.

---

## 🔒 **CORREÇÕES DE SEGURANÇA IMPLEMENTADAS**

### **✅ Content Security Policy (CSP) Atualizado**
- **Problema:** CSP bloqueando carregamento de imagens
- **Solução:** Domínios adicionais permitidos para `img-src`
- **Domínios adicionados:**
  - `https://*.vercel.app`
  - `https://*.netlify.app`
  - `https://*.github.io`
  - `https://*.githubusercontent.com`

### **✅ Redirecionamentos Seguros**
- **Problema:** Redirecionamentos para domínios incorretos
- **Solução:** Todos os redirecionamentos direcionam para `/ms`
- **Arquivos corrigidos:**
  - `AuthProvider.tsx` - Redirecionamentos de login/cadastro
  - `useSecureAuth.ts` - Redirecionamento de logout
  - `RegisterForm.tsx` - Links de navegação

### **✅ Navegação Segura**
- **Problema:** Links apontando para sistemas incorretos
- **Solução:** Todos os links direcionam para o Descubra MS
- **Resultado:** Experiência consistente e segura

---

## 🔧 **STACK TECNOLÓGICO**

### **Frontend:**
- **React 18** - Framework principal com hooks e context
- **TypeScript** - Tipagem estática para maior segurança
- **Vite** - Build tool rápido e moderno
- **Tailwind CSS** - Framework de estilos utilitários
- **Lucide React** - Biblioteca de ícones moderna

### **Backend:**
- **Supabase** - Backend-as-a-Service completo
- **PostgreSQL** - Banco de dados relacional
- **Edge Functions** - Serverless functions em Deno
- **Real-time** - WebSockets para comunicação em tempo real

### **APIs Externas:**
- **Google Search API** - Pesquisa de informações atualizadas
- **Gemini AI** - Inteligência artificial para geração de conteúdo
- **Google Maps API** - Geolocalização e mapas interativos

---

## 📁 **ESTRUTURA DE DIRETÓRIOS**

```
src/
├── components/           # Componentes reutilizáveis
│   ├── ui/              # Componentes base (shadcn/ui)
│   ├── profile/         # Componentes de perfil
│   ├── admin/           # Componentes administrativos
│   └── dashboards/      # Dashboards específicos
├── pages/               # Páginas da aplicação
├── services/            # Serviços e APIs
│   ├── quiz/            # Sistema de quiz educativo
│   ├── guata/           # Assistente IA Guatá
│   └── tourism/         # Serviços de turismo
├── integrations/        # Integrações externas
│   └── supabase/        # Cliente Supabase
├── hooks/               # Custom hooks
├── utils/               # Utilitários
└── types/               # Definições TypeScript
```

---

## 🎨 **SISTEMA DE DESIGN**

### **Identidade Visual:**
- **Cores Principais:**
  - Verde Pantanal: `#2D5016` (Natureza, sustentabilidade)
  - Azul Cerrado: `#1E40AF` (Céu, água, serenidade)
  - Dourado MS: `#F59E0B` (Riqueza cultural, calor humano)
  - Branco Puro: `#FFFFFF` (Limpeza, transparência)

### **Tipografia:**
- **Inter** - Fonte principal (moderna, legível)
- **Poppins** - Fonte secundária (elegante, acolhedora)

### **Componentes UI:**
- **shadcn/ui** - Biblioteca de componentes
- **Tailwind CSS** - Sistema de design
- **Responsive Design** - Mobile-first

---

## 🤖 **ARQUITETURA DE INTELIGÊNCIA ARTIFICIAL**

### **Assistente Guatá:**
```
Frontend (React) 
    ↓
Edge Function (Supabase)
    ↓
Gemini AI API
    ↓
Google Search API
    ↓
Resposta Processada
    ↓
Frontend (Chat Interface)
```

### **Sistema de Quiz Educativo:**
```
Frontend (Quiz Component)
    ↓
DynamicQuizService
    ↓
Google Search API (Informações)
    ↓
Gemini AI (Geração de Perguntas)
    ↓
Cache (LocalStorage)
    ↓
Frontend (Quiz Interface)
```

---

## 🗄️ **ARQUITETURA DE DADOS**

### **Banco de Dados (PostgreSQL):**
```sql
-- Tabelas Principais
users (id, email, name, avatar, preferences)
destinations (id, name, description, location, category)
conversations (id, user_id, message, response, timestamp)
quiz_results (id, user_id, score, badges, completed_at)
api_usage (id, service, requests, date, user_id)
```

### **Relacionamentos:**
- **Users** → **Conversations** (1:N)
- **Users** → **Quiz Results** (1:N)
- **Users** → **API Usage** (1:N)
- **Destinations** → **Categories** (N:1)

---

## 🔐 **ARQUITETURA DE SEGURANÇA**

### **Autenticação:**
```
Frontend (Login Form)
    ↓
Supabase Auth
    ↓
JWT Token Generation
    ↓
Token Storage (Secure)
    ↓
API Requests (Authenticated)
```

### **Autorização:**
- **RBAC** - Role-Based Access Control
- **JWT Tokens** - Sessões seguras
- **Row Level Security** - Segurança a nível de linha
- **API Rate Limiting** - Proteção contra spam

---

## 🌐 **ARQUITETURA DE REDE**

### **CDN e Distribuição:**
```
User Request
    ↓
Vercel CDN (Global)
    ↓
Edge Location (Nearest)
    ↓
Application Server
    ↓
Supabase Database
    ↓
External APIs
```

### **Caching Strategy:**
- **Browser Cache** - Assets estáticos
- **CDN Cache** - Conteúdo global
- **Application Cache** - Dados frequentes
- **Database Cache** - Consultas otimizadas

---

## 📱 **ARQUITETURA RESPONSIVA**

### **Breakpoints:**
- **Mobile**: < 768px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+

### **Layout Strategy:**
- **Mobile-First** - Design otimizado para mobile
- **Progressive Enhancement** - Melhorias progressivas
- **Adaptive Images** - Imagens responsivas
- **Touch-Friendly** - Interface tátil

---

## 🚀 **ARQUITETURA DE DEPLOY**

### **CI/CD Pipeline:**
```
Git Push
    ↓
GitHub Actions
    ↓
Build Process (Vite)
    ↓
Type Checking (TypeScript)
    ↓
Tests (Vitest)
    ↓
Deploy (Vercel)
    ↓
Production
```

### **Environment Strategy:**
- **Development** - Local development
- **Staging** - Testing environment
- **Production** - Live environment

---

## 📊 **ARQUITETURA DE MONITORAMENTO**

### **Analytics:**
- **Google Analytics** - Comportamento do usuário
- **Supabase Analytics** - Dados da plataforma
- **Custom Events** - Eventos específicos
- **Error Tracking** - Monitoramento de erros

### **Performance:**
- **Core Web Vitals** - Métricas de performance
- **Lighthouse** - Auditoria de qualidade
- **Bundle Analysis** - Análise de tamanho
- **Load Testing** - Testes de carga

---

## 🔄 **ARQUITETURA DE INTEGRAÇÃO**

### **APIs Externas:**
```
Frontend Request
    ↓
Edge Function
    ↓
External API (Google, Gemini)
    ↓
Data Processing
    ↓
Response Formatting
    ↓
Frontend Update
```

### **Real-time Updates:**
```
Database Change
    ↓
Supabase Real-time
    ↓
WebSocket Connection
    ↓
Frontend Update
    ↓
UI Refresh
```

---

## 🎯 **PRINCÍPIOS ARQUITETURAIS**

### **Escalabilidade:**
- **Horizontal Scaling** - Múltiplas instâncias
- **Database Sharding** - Particionamento de dados
- **CDN Distribution** - Distribuição global
- **Caching Layers** - Múltiplas camadas de cache

### **Manutenibilidade:**
- **Modular Architecture** - Componentes independentes
- **Type Safety** - TypeScript em todo o código
- **Code Splitting** - Carregamento sob demanda
- **Documentation** - Documentação completa

### **Segurança:**
- **Defense in Depth** - Múltiplas camadas de segurança
- **Input Validation** - Validação de entrada
- **Output Encoding** - Codificação de saída
- **Security Headers** - Cabeçalhos de segurança

---

*Arquitetura documentada em: Janeiro 2025*  
*Versão: 1.0*  
*Status: Atualizada*




