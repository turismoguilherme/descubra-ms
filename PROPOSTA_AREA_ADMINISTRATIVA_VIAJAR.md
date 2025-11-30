# 🎯 PROPOSTA: ÁREA ADMINISTRATIVA VIAJAR + DESCUBRA MS

## 📋 ANÁLISE DAS PLATAFORMAS

### **1. ViaJAR (Empresa SaaS B2B)**
**Natureza:** Empresa que desenvolve e gerencia plataformas de turismo
**Público:** Clientes (empresas, secretarias de turismo)
**Funcionalidades:**
- Revenue Optimizer
- Market Intelligence  
- IA Conversacional
- Gestão de CATs
- Analytics e Relatórios

**Tabelas no Banco:**
- `viajar_*` (diagnostic_results, documents, revenue_optimizations, etc.)
- `flowtrip_*` (clients, subscriptions, invoices, states)
- `master_*` (clients, deals, financial_records, platform_config)
- `overflow_one_users` (usuários da plataforma ViaJAR)

### **2. Descubra MS (Produto B2C)**
**Natureza:** Plataforma de turismo para Mato Grosso do Sul
**Público:** Turistas e moradores de MS
**Funcionalidades:**
- Guatá IA (assistente virtual)
- Passaporte Digital (gamificação)
- Catálogo de Destinos
- Eventos e Roteiros
- Sistema CAT

**Tabelas no Banco:**
- `user_profiles`, `user_roles` (usuários finais)
- `destinations`, `events`, `routes` (conteúdo)
- `cat_*` (centros de atendimento)
- `flowtrip_states` (configuração MS)

---

## 🏗️ ARQUITETURA PROPOSTA

### **Estrutura de Acesso**

```
ÁREA ADMINISTRATIVA MASTER
├── 👥 Gestão ViaJAR (Empresa)
│   ├── Funcionários/Colaboradores
│   ├── Configurações da Empresa
│   ├── Clientes ViaJAR
│   ├── Assinaturas e Pagamentos
│   └── Analytics Internos
│
└── 🌎 Gestão Descubra MS (Produto)
    ├── Conteúdo e Dados
    ├── Usuários Finais
    ├── Eventos e Destinos
    └── Configurações da Plataforma
```

---

## 📊 ESTRUTURA DETALHADA DAS ABAS

### **SEÇÃO 1: GESTÃO VIAJAR (Empresa)**

#### **1.1 Funcionários e Colaboradores** 👥
**Objetivo:** Gerenciar equipe interna da ViaJAR

**Funcionalidades:**
- ✅ Listar funcionários (busca, filtros)
- ✅ Adicionar novo funcionário
- ✅ Editar informações (nome, email, cargo, departamento)
- ✅ Gerenciar níveis de acesso (roles)
- ✅ Ativar/desativar acesso
- ✅ Histórico de atividades
- ✅ Permissões granulares por seção

**Níveis de Acesso:**
- **Master Admin** (`admin`, `tech`): Acesso total
- **Gerente** (`manager`): Pode gerenciar funcionários, sem acesso a configurações críticas
- **Colaborador** (`employee`): Acesso limitado conforme permissões

**Tabelas:**
- Criar: `viajar_employees` (funcionários da ViaJAR)
- Usar: `auth.users` + `user_roles` (com flag `is_viajar_employee`)

---

#### **1.2 Configurações da Empresa ViaJAR** ⚙️
**Objetivo:** Configurar a empresa ViaJAR (não o produto)

**Funcionalidades:**
- **Informações Corporativas:**
  - Nome da empresa, CNPJ, endereço
  - Logo, cores corporativas
  - Contatos (email, telefone, site)
  - Redes sociais corporativas

- **Configurações Operacionais:**
  - Horários de funcionamento
  - Fuso horário
  - Idioma padrão
  - Moeda padrão

- **Integrações:**
  - APIs externas (Stripe, HubSpot, etc.)
  - Chaves de API (criptografadas)
  - Webhooks configurados

**Tabelas:**
- Usar: `master_platform_config` (com prefixo `viajar_company_`)

---

#### **1.3 Clientes ViaJAR** 💼
**Objetivo:** Gerenciar clientes que usam a plataforma ViaJAR

**Funcionalidades:**
- ✅ Listar clientes (empresas, secretarias)
- ✅ Ver detalhes do cliente
- ✅ Editar informações
- ✅ Gerenciar assinaturas
- ✅ Histórico de pagamentos
- ✅ Suporte e tickets
- ✅ Analytics por cliente

**Tabelas:**
- `flowtrip_clients` (clientes da ViaJAR)
- `flowtrip_subscriptions` (assinaturas)
- `flowtrip_invoices` (faturas)

---

#### **1.4 Assinaturas e Pagamentos ViaJAR** 💳
**Objetivo:** Gerenciar assinaturas e pagamentos dos clientes ViaJAR

**Funcionalidades:**
- ✅ Listar assinaturas ativas/inativas
- ✅ Ver detalhes de pagamento
- ✅ Cancelar/reativar assinaturas
- ✅ Gerenciar planos (Freemium, Professional, Enterprise, Government)
- ✅ Configurar preços
- ✅ Histórico de transações
- ✅ Relatórios financeiros
- ✅ Configurar gateways (Stripe, Mercado Pago)

**Tabelas:**
- `flowtrip_subscriptions`
- `flowtrip_invoices`
- `master_financial_records`

---

### **SEÇÃO 2: GESTÃO DESCUBRA MS (Produto)**

#### **2.1 Conteúdo e Dados** 📝
**Objetivo:** Gerenciar conteúdo do Descubra MS

**Funcionalidades:**
- **Destinos:**
  - Listar/editar/criar destinos
  - Aprovar/rejeitar destinos pendentes
  - Upload de imagens
  - Georreferenciamento

- **Eventos:**
  - Fila de aprovação de eventos
  - Editar eventos
  - Publicar/despublicar
  - Calendário de eventos

- **Roteiros:**
  - Gerenciar roteiros sugeridos
  - Editar roteiros

- **Parceiros:**
  - Gerenciar estabelecimentos parceiros
  - Aprovar cadastros

**Tabelas:**
- `destinations`
- `events`
- `routes`
- `partners`

---

#### **2.2 Usuários Finais Descubra MS** 👤
**Objetivo:** Gerenciar usuários que usam o Descubra MS

**Funcionalidades:**
- ✅ Listar usuários (turistas, moradores)
- ✅ Ver perfil completo
- ✅ Editar informações (moderação)
- ✅ Banir/desbanir usuários
- ✅ Ver atividade (check-ins, passaporte)
- ✅ Estatísticas de engajamento

**Tabelas:**
- `user_profiles`
- `user_roles`
- `digital_passport_checkins`

---

#### **2.3 Sistema CAT (Descubra MS)** 🏛️
**Objetivo:** Gerenciar Centros de Atendimento ao Turista

**Funcionalidades:**
- ✅ Listar CATs
- ✅ Adicionar/editar CATs
- ✅ Gerenciar atendentes
- ✅ Ver check-ins de turistas
- ✅ Relatórios de atendimento
- ✅ Geolocalização dos CATs

**Tabelas:**
- `cat_locations`
- `cat_attendants`
- `cat_checkins`
- `cat_tourists`

---

#### **2.4 Configurações Descubra MS** ⚙️
**Objetivo:** Configurar a plataforma Descubra MS

**Funcionalidades:**
- **Branding:**
  - Logo, cores, identidade visual
  - Nome da plataforma
  - Slogan

- **Funcionalidades:**
  - Habilitar/desabilitar módulos
  - Configurar Guatá IA
  - Configurar Passaporte Digital

- **SEO:**
  - Meta tags
  - Keywords
  - Sitemap

- **Integrações:**
  - APIs governamentais (ALUMIA)
  - Google Maps
  - Outras APIs

**Tabelas:**
- `flowtrip_states` (configuração MS)
- `flowtrip_state_features`

---

## 🔐 SISTEMA DE NÍVEIS DE ACESSO

### **Roles Propostos:**

#### **1. Master Admin** (`admin`, `tech`)
**Acesso:** Total em ambas as plataformas
- ✅ Todas as funcionalidades
- ✅ Configurações críticas
- ✅ Gerenciar outros admins

#### **2. Gerente ViaJAR** (`viajar_manager`)
**Acesso:** Gestão da empresa ViaJAR
- ✅ Funcionários
- ✅ Clientes
- ✅ Assinaturas
- ✅ Configurações ViaJAR
- ❌ Configurações críticas do sistema
- ❌ Gestão de outros gerentes

#### **3. Colaborador ViaJAR** (`viajar_employee`)
**Acesso:** Limitado conforme permissões
- ✅ Ver dashboards
- ✅ Gerenciar clientes (se permitido)
- ✅ Suporte básico
- ❌ Configurações
- ❌ Gestão de funcionários

#### **4. Editor Descubra MS** (`descubra_editor`)
**Acesso:** Gestão de conteúdo do Descubra MS
- ✅ Conteúdo (destinos, eventos)
- ✅ Moderação de usuários
- ✅ Sistema CAT
- ❌ Configurações da plataforma
- ❌ Gestão de assinaturas

#### **5. Moderador Descubra MS** (`descubra_moderator`)
**Acesso:** Apenas moderação
- ✅ Aprovar/rejeitar conteúdo
- ✅ Moderar usuários
- ❌ Editar configurações
- ❌ Criar conteúdo

---

## 🎨 DESIGN E UX PROPOSTO

### **Layout:**
```
┌─────────────────────────────────────────┐
│  HEADER: Logo ViaJAR | Usuário | Logout │
├──────────┬──────────────────────────────┤
│          │                              │
│ SIDEBAR  │  CONTEÚDO PRINCIPAL         │
│          │                              │
│ • ViaJAR │  [Tabs ou Cards]            │
│   - Func.│                              │
│   - Conf.│                              │
│   - Cli. │                              │
│          │                              │
│ • Desc.  │                              │
│   MS     │                              │
│   - Cont.│                              │
│   - Usu. │                              │
│   - CAT  │                              │
│          │                              │
└──────────┴──────────────────────────────┘
```

### **Componentes:**
- **Sidebar fixa** com navegação hierárquica
- **Tabs** para organizar seções
- **Cards** para métricas e resumos
- **Tabelas** com busca, filtros e paginação
- **Modais** para edições rápidas
- **Toasts** para feedback
- **Confirmações** para ações críticas

---

## 📁 ESTRUTURA DE ARQUIVOS PROPOSTA

```
src/
├── pages/
│   └── admin/
│       └── ViaJARAdminPanel.tsx (página principal)
│
├── components/
│   └── admin/
│       ├── ViaJAR/
│       │   ├── EmployeesManagement.tsx
│       │   ├── CompanySettings.tsx
│       │   ├── ClientsManagement.tsx
│       │   └── SubscriptionsManagement.tsx
│       │
│       └── DescubraMS/
│           ├── ContentManagement.tsx
│           ├── UsersManagement.tsx
│           ├── CATManagement.tsx
│           └── PlatformSettings.tsx
│
├── services/
│   └── admin/
│       ├── viajarAdminService.ts
│       └── descubraMSAdminService.ts
│
└── types/
    └── admin.ts
```

---

## ❓ PERGUNTAS PARA VALIDAÇÃO

### **1. Estrutura de Funcionários:**
- ✅ Criar tabela `viajar_employees` separada?
- ✅ Ou usar `user_roles` com flag `is_viajar_employee`?
- ✅ Quais campos são essenciais? (cargo, departamento, data admissão, etc.)

### **2. Permissões:**
- ✅ Sistema de permissões granular (por funcionalidade)?
- ✅ Ou apenas roles fixos?
- ✅ Precisa de sistema de "permissões customizadas"?

### **3. Separação de Dados:**
- ✅ Como garantir que funcionários ViaJAR não vejam dados de clientes de outros clientes?
- ✅ Precisa de isolamento completo ou compartilhamento controlado?

### **4. Prioridades:**
- ✅ Qual seção implementar primeiro?
  - Sugestão: Funcionários → Configurações ViaJAR → Clientes → Descubra MS

### **5. Integrações:**
- ✅ Precisa de integração com sistemas externos? (CRM, contabilidade, etc.)
- ✅ Exportação de relatórios? (PDF, Excel)

### **6. Auditoria:**
- ✅ Precisa de logs detalhados de todas as ações?
- ✅ Histórico de alterações em configurações?

---

## 🚀 PRÓXIMOS PASSOS

1. **Validação:** Revisar e aprovar esta proposta
2. **Especificação:** Detalhar funcionalidades prioritárias
3. **Design:** Criar mockups/protótipos das telas principais
4. **Implementação:** Desenvolver em fases
5. **Testes:** Validar com usuários reais
6. **Documentação:** Criar guias de uso

---

**Aguardando sua aprovação e respostas às perguntas para iniciar a implementação!** 🎯

