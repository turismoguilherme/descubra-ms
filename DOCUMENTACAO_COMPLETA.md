# 📚 **DOCUMENTAÇÃO COMPLETA - PLATAFORMA DESCUBRA MS / OVERFLOW ONE**

## 🎯 **VISÃO GERAL**

Esta documentação abrange o sistema completo de turismo e gestão de parceiros comerciais desenvolvido para o Mato Grosso do Sul, incluindo a plataforma OverFlow One SaaS.

---

## 🏗️ **ARQUITETURA DO SISTEMA**

### **1. Estrutura de Pastas**
```
src/
├── components/           # Componentes reutilizáveis
│   ├── auth/            # Autenticação e autorização
│   ├── commercial/      # Sistema de parceiros comerciais
│   ├── layout/          # Layouts e navegação
│   ├── ui/              # Componentes de interface
│   └── partners/        # Gerenciamento de parceiros
├── context/             # Contextos React
├── hooks/               # Hooks customizados
├── pages/               # Páginas da aplicação
├── utils/               # Utilitários
└── types/               # Definições de tipos
```

### **2. Tecnologias Utilizadas**
- **Frontend**: React 18 + TypeScript + Vite
- **Roteamento**: React Router DOM
- **Estado**: TanStack Query + Context API
- **UI**: Radix UI + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Deploy**: Vercel

---

## 🔐 **SISTEMA DE AUTENTICAÇÃO**

### **1. Estrutura de Usuários**
```typescript
interface User {
  id: string;
  email: string;
  role: 'master_admin' | 'state_admin' | 'city_admin' | 'gestor_municipal' | 'collaborator' | 'atendente' | 'cat_attendant';
  city?: string;
  profile_complete: boolean;
}
```

### **2. Níveis de Acesso**
- **Master Admin**: Acesso total ao sistema
- **State Admin**: Gestão estadual
- **City Admin**: Gestão municipal
- **Gestor Municipal**: Gestão local
- **Collaborator**: Colaborador
- **Atendente**: Atendimento
- **CAT Attendant**: Atendimento CAT

### **3. Rotas Protegidas**
```typescript
<ProtectedRoute allowedRoles={['master_admin', 'state_admin']}>
  <Management />
</ProtectedRoute>
```

---

## 🏢 **SISTEMA DE PARCEIROS COMERCIAIS**

### **1. Estrutura de Dados**
```typescript
interface CommercialPartner {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  website_link: string;
  contact_email: string;
  phone_number: string;
  address: string;
  city: string;
  state: string;
  country: string;
  business_type: string;
  services_offered: string[];
  target_audience: string[];
  subscription_plan_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';
  approved_at: Date;
  created_at: Date;
  updated_at: Date;
}
```

### **2. Planos de Assinatura**
```typescript
interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
}
```

### **3. Métricas de Parceiros**
```typescript
interface PartnerMetrics {
  id: string;
  partner_id: string;
  metric_date: Date;
  views: number;
  clicks: number;
  leads: number;
  conversion_rate: number;
}
```

---

## 🎨 **SISTEMA DE BRANDING MULTI-TENANT**

### **1. Configuração de Marcas**
```typescript
interface BrandConfig {
  logo: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  navigation: NavigationItem[];
  cta: CTAConfig;
}
```

### **2. Tenants Suportados**
- **OverFlow One**: Plataforma SaaS principal
- **Descubra MS**: Turismo do Mato Grosso do Sul

### **3. Contexto de Marca**
```typescript
const BrandContext = createContext<{
  brand: BrandConfig;
  setBrand: (brand: BrandConfig) => void;
}>();
```

---

## 🗺️ **SISTEMA DE ROTEAMENTO**

### **1. Rotas OverFlow One**
```
/                           # Página principal
/login                      # Login
/register                   # Registro
/parceiros                  # Portal de parceiros
/admin-login                # Login administrativo
/master-dashboard           # Dashboard master
```

### **2. Rotas Descubra MS**
```
/ms                         # Página principal MS
/ms/guata                   # Guatá IA
/ms/passaporte              # Passaporte Digital
/ms/eventos                 # Eventos
/ms/destinos                # Destinos
/ms/roteiros                # Roteiros
/ms/parceiros               # Parceiros MS
/ms/parceiros-comerciais    # Portal comercial
```

### **3. Rotas Protegidas**
```
/ms/management              # Gestão (admin+)
/ms/technical-admin         # Admin técnico
/ms/municipal-admin         # Admin municipal
/ms/collaborator            # Colaborador
```

---

## 🗄️ **BANCO DE DADOS (SUPABASE)**

### **1. Tabelas Principais**
```sql
-- Parceiros comerciais
CREATE TABLE commercial_partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  website_link TEXT,
  contact_email TEXT NOT NULL UNIQUE,
  phone_number TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  business_type TEXT,
  services_offered TEXT[],
  target_audience TEXT[],
  subscription_plan_id UUID REFERENCES commercial_subscription_plans(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'inactive')),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Planos de assinatura
CREATE TABLE commercial_subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  features TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Métricas de parceiros
CREATE TABLE commercial_partner_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID REFERENCES commercial_partners(id) ON DELETE CASCADE,
  metric_date DATE DEFAULT CURRENT_DATE,
  views INT DEFAULT 0,
  clicks INT DEFAULT 0,
  leads INT DEFAULT 0,
  conversion_rate DECIMAL(5, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (partner_id, metric_date)
);
```

### **2. Políticas RLS**
```sql
-- Acesso público para leitura
CREATE POLICY "Enable read access for all users" 
ON commercial_partners FOR SELECT USING (TRUE);

-- Inserção para usuários autenticados
CREATE POLICY "Enable insert for authenticated users" 
ON commercial_partners FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Atualização para o próprio parceiro
CREATE POLICY "Enable update for partners based on id" 
ON commercial_partners FOR UPDATE USING (auth.uid() = id);

-- Exclusão para master_admin
CREATE POLICY "Enable delete for master_admin" 
ON commercial_partners FOR DELETE USING (auth.role() = 'master_admin');
```

---

## 🎯 **FUNCIONALIDADES PRINCIPAIS**

### **1. Portal de Parceiros Comerciais**
- ✅ Cadastro de parceiros
- ✅ Gerenciamento de planos
- ✅ Dashboard de métricas
- ✅ Sistema de aprovação
- ✅ Filtros e busca
- ✅ Formulários de contato
- ✅ Gestão de leads

### **2. Sistema de Turismo (Descubra MS)**
- ✅ Guatá IA (assistente virtual)
- ✅ Passaporte Digital
- ✅ Gestão de eventos
- ✅ Catálogo de destinos
- ✅ Sistema de roteiros
- ✅ Mapa interativo
- ✅ Sistema de parceiros institucionais

### **3. OverFlow One SaaS**
- ✅ Landing page
- ✅ Sistema de parceiros
- ✅ Login administrativo
- ✅ Dashboard master
- ✅ Gestão de usuários
- ✅ Sistema multi-tenant

---

## 🔧 **CONFIGURAÇÃO E DEPLOY**

### **1. Variáveis de Ambiente**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_ENV=development
```

### **2. Scripts Disponíveis**
```json
{
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
}
```

### **3. Deploy no Vercel**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

---

## 🚀 **GUIA DE DESENVOLVIMENTO**

### **1. Configuração Local**
```bash
# Clone o repositório
git clone [repository-url]

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env

# Execute o servidor de desenvolvimento
npm run dev
```

### **2. Estrutura de Componentes**
```typescript
// Exemplo de componente
interface ComponentProps {
  title: string;
  children: React.ReactNode;
}

export const Component: React.FC<ComponentProps> = ({ title, children }) => {
  return (
    <div className="component">
      <h1>{title}</h1>
      {children}
    </div>
  );
};
```

### **3. Hooks Customizados**
```typescript
// Exemplo de hook
export const useCommercialPartners = () => {
  const queryClient = useQueryClient();
  
  const { data: partners, isLoading } = useQuery({
    queryKey: ['commercial-partners'],
    queryFn: fetchPartners,
  });
  
  const createPartner = useMutation({
    mutationFn: createPartnerAPI,
    onSuccess: () => {
      queryClient.invalidateQueries(['commercial-partners']);
    },
  });
  
  return { partners, isLoading, createPartner };
};
```

---

## 📊 **MONITORAMENTO E MÉTRICAS**

### **1. Métricas de Performance**
- **Tempo de Carregamento**: < 3 segundos
- **First Contentful Paint**: < 1.5 segundos
- **Largest Contentful Paint**: < 2.5 segundos
- **Cumulative Layout Shift**: < 0.1

### **2. Métricas de Negócio**
- **Parceiros Ativos**: Contagem em tempo real
- **Taxa de Conversão**: Leads/Visualizações
- **Engajamento**: Tempo na página, cliques
- **Satisfação**: Feedback dos usuários

### **3. Logs e Debugging**
```typescript
// Exemplo de logging
console.log("🚀 APP: Componente App sendo renderizado");
console.error("❌ APP: Erro ao renderizar App:", error);
```

---

## 🛠️ **RESOLUÇÃO DE PROBLEMAS**

### **1. Problemas Comuns**

#### **Erro de Sintaxe no App.tsx**
```typescript
// ❌ PROBLEMA
function App() {
  try {
    return (
      // ... código
    );
  } catch (error) {
    // ... tratamento
  }
}

// ✅ SOLUÇÃO
function App() {
  return (
    // ... código
  );
}
```

#### **Comandos Terminal no Código**
```typescript
// ❌ PROBLEMA
run dev
ac~e =
import React from 'react';

// ✅ SOLUÇÃO
import React from 'react';
```

#### **Dependências Ausentes**
```bash
# Instalar dependências
npm install

# Limpar cache
rm -rf node_modules package-lock.json
npm install
```

### **2. Debugging**
```typescript
// Adicionar logs para debugging
console.log("🔍 DEBUG: Verificando estado:", state);
console.log("🔍 DEBUG: Props recebidas:", props);
console.log("🔍 DEBUG: Dados carregados:", data);
```

---

## 📈 **ROADMAP E FUTURAS IMPLEMENTAÇÕES**

### **1. Próximas Funcionalidades**
- 🔄 Sistema de notificações em tempo real
- 🔄 Integração com APIs de pagamento
- 🔄 Sistema de relatórios avançados
- 🔄 Mobile app (React Native)
- 🔄 Integração com redes sociais

### **2. Melhorias Técnicas**
- 🔄 Implementação de testes automatizados
- 🔄 CI/CD pipeline completo
- 🔄 Monitoramento de performance
- 🔄 Cache inteligente
- 🔄 PWA (Progressive Web App)

### **3. Expansão de Negócio**
- 🔄 Integração com outros estados
- 🔄 Sistema de franquias
- 🔄 Marketplace de parceiros
- 🔄 API pública
- 🔄 White-label solution

---

## 📋 **CHECKLIST DE LANÇAMENTO**

### **✅ Funcionalidades Core**
- [x] Sistema de autenticação
- [x] Portal de parceiros comerciais
- [x] Sistema de turismo (Descubra MS)
- [x] OverFlow One SaaS
- [x] Sistema multi-tenant
- [x] Banco de dados configurado

### **✅ Qualidade e Performance**
- [x] Código limpo e organizado
- [x] Dependências atualizadas
- [x] Erros de sintaxe corrigidos
- [x] Roteamento funcionando
- [x] Responsividade implementada

### **🔄 Pendências**
- [ ] Testes automatizados
- [ ] Documentação de API
- [ ] Monitoramento de erros
- [ ] Backup automático
- [ ] Política de privacidade

---

## 🎉 **CONCLUSÃO**

A plataforma Descubra MS / OverFlow One representa uma solução completa e robusta para gestão de turismo e parceiros comerciais. Com arquitetura moderna, tecnologias atualizadas e funcionalidades abrangentes, o sistema está preparado para escalar e atender às necessidades do mercado.

**Status Atual**: ✅ **FUNCIONANDO E ESTÁVEL**

**Próximos Passos**: Implementar melhorias de performance, testes automatizados e funcionalidades adicionais conforme roadmap.

---

## 📞 **SUPORTE E CONTATO**

Para dúvidas, sugestões ou problemas técnicos, entre em contato através dos canais oficiais da plataforma.

**Versão da Documentação**: 1.0.0  
**Última Atualização**: 28/09/2025  
**Mantenedor**: Equipe de Desenvolvimento OverFlow One












