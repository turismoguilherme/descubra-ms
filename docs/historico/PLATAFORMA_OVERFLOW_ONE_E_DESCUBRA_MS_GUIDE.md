# 📚 OverFlow One: Plataforma de Gestão Turística Inteligente e o Case Descubra MS

## 🎯 Visão Geral do Projeto

A **OverFlow One** é uma empresa SaaS (Software as a Service) especializada em fornecer soluções tecnológicas avançadas para gestão turística governamental. Nossa plataforma integra tecnologias de IA, análise de dados e gamificação para transformar estados e municípios em destinos turísticos inteligentes.

O **Descubra MS** é uma implementação personalizada da plataforma OverFlow One para o estado do Mato Grosso do Sul, demonstrando o potencial completo de nossas soluções e servindo como um caso de sucesso exemplar.

## 🏗️ Arquitetura da Plataforma

A plataforma opera em dois modos principais com suporte a **multi-tenancy** para múltiplos estados brasileiros:

### OverFlow One SaaS (Página Principal - `/`)
- **Propósito**: Landing page comercial para venda da solução SaaS.
- **Público**: Gestores estaduais de turismo, tomadores de decisão.
- **Funcionalidades**: Apresentação da solução, cases de sucesso (MS como referência), recursos, funcionalidades, preços, planos e contato para demonstração.

### Descubra MS (Implementação Ativa - `/{estado-slug}`)
- **Propósito**: Plataforma operacional para turistas e gestores do Mato Grosso do Sul.
- **Público**: Turistas, gestores municipais, atendentes CAT.
- **Funcionalidades**: Todas as funcionalidades originais mantidas para o estado.

### Stack Tecnológico

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Functions + Storage + Edge Functions)
- **IA**: Sistema customizado de atendimento presencial (Guatá/Delinha) e IA Estratégica
- **APIs**: Integração com APIs governamentais (Ministério do Turismo, IBGE, INMET, ANTT, Fundtur-MS)
- **Estado**: React Query + Context API (BrandContext para configurações dinâmicas)
- **Roteamento**: React Router DOM (com estrutura de rotas reorganizada para FlowTrip e MS)
- **Mapas**: Mapbox GL
- **Gráficos**: Recharts
- **Animações**: Framer Motion

### Estrutura de Pastas (Principais)

```
descubra-ms/
├── src/
│   ├── components/          # Componentes React (admin, ai, auth, flowtrip, layout, management, ui)
│   ├── context/             # Contextos React (BrandContext.tsx, FlowTripContext.tsx)
│   ├── hooks/               # Hooks React customizados (auth, useMultiTenant.ts, useStateConfig.ts)
│   ├── pages/               # Páginas da aplicação (FlowTripSaaS.tsx, MSIndex.tsx)
│   ├── services/            # Serviços e APIs (ai, governmentAPIs, alumia, supabase)
│   ├── types/               # Tipos TypeScript
│   └── utils/               # Utilitários
├── supabase/                # Configuração Supabase (functions, migrations)
├── docs/                    # Documentação
└── public/                  # Arquivos estáticos
```

## 🎯 Funcionalidades Principais

### 1. Portal Turístico Personalizado
- **Interface White Label**: Personalização completa para cada estado (logo, cores, navegação).
- **Gestão de Conteúdo**: Sistema intuitivo para administração de destinos, eventos e roteiros.
- **Multi-idiomas**: Suporte a diversos idiomas.
- **Design Responsivo**: Adaptação para todos os dispositivos.
- **Mapa Interativo**: Visualização geográfica com Mapbox.
- **Passaporte Digital**: Sistema de gamificação e check-ins com geolocalização e recompensas.

### 2. Inteligência Artificial (Guatá/Delinha AI)
- **Assistente Virtual Customizável**: Avatar e personalidade adaptáveis.
- **Base de Conhecimento Local**: Informações específicas de cada região.
- **Integração Gemini**: Respostas naturais e contextualizadas.
- **Tradução Automática**: Suporte a 8 idiomas com detecção automática.
- **Sugestões de Roteiros**: Personalizadas com base em interesses e acessibilidade.
- **Análise Preditiva**: Insights sobre comportamento turístico.
- **Analytics de Interação**: Métricas de uso e satisfação.

### 3. Gestão Governamental
- **Dashboard Executivo**: Métricas e KPIs em tempo real.
- **Gestão de Conteúdo**: CRUD completo para destinos, eventos, roteiros.
- **Controle de Usuários**: Sistema de roles e permissões hierárquicas.
- **Relatórios**: Exportação de dados e análises.
- **Sistema de Ponto Eletrônico**: Para atendentes CAT.

### 4. Sistema de Autenticação e Autorização
- **Autenticação**: Supabase Auth (email/senha + OAuth), registro e login.
- **Roles Hierárquicos**: `admin`, `tech`, `diretor_estadual`, `gestor_igr`, `municipal_manager`, `atendente`, `collaborator`, `user`.
- **Autorização**: Row Level Security (RLS) no banco de dados e políticas baseadas em roles.

### 5. APIS Governamentais Integradas
- **Ministério do Turismo**: Destinos, eventos, estatísticas.
- **IBGE**: Municípios, regiões, população.
- **INMET (Clima)**: Temperatura, umidade, previsão.
- **ANTT (Transporte)**: Rotas, horários, preços.
- **Fundtur-MS**: Destinos locais, eventos, dados em tempo real.
- **Sistema de Cache Inteligente**: Duração variável por API com fallback para dados mockados.

### 6. Integração ALUMIA (Preparada)
- Preparada para sincronização automática de dados, cache inteligente, fallback e monitoramento.

## 📊 Estrutura do Banco de Dados (Tabelas Principais)

- **Gestão de Usuários**: `auth.users`, `user_profiles`, `user_roles`, `user_interactions`.
- **Conteúdo Turístico**: `regions`, `cities`, `destinations`, `destination_details`, `events`, `event_details`, `routes`, `route_checkpoints`, `cat_locations`.
- **Gamificação**: `passport_stamps`, `achievements`, `points_system`.
- **FlowTrip SaaS**: `flowtrip_clients`, `flowtrip_subscriptions`, `flowtrip_invoices`, `flowtrip_usage_metrics`, `flowtrip_support_tickets`, `flowtrip_white_label_configs`.
- **Auditoria e Segurança**: `security_audit_log`, `content_audit_log`, `access_logs`.

## 🔐 Segurança Implementada

- **Autenticação**: Supabase Auth, Social login (Google), password reset, email verification.
- **Autorização**: Row Level Security (RLS), Role-based access control, Session Management.
- **Proteção**: CSRF Protection, Rate Limiting.
- **Monitoramento**: Security monitoring, Access logs, Audit trails.
- **Conformidade**: LGPD compliant, Criptografia End-to-end, Backups automáticos diários, Monitoramento 24/7.

## 🚀 Fases Concluídas e Pendentes

### ✅ Fases e Funcionalidades Concluídas (ou com avanço significativo):
- **Fase 1: Fundação** (100% Completa): Sistema base, autenticação, layout responsivo.
- **Fase 2: Sistema Administrativo** (100% Completa): Dashboards por role, controle de acesso, sistema de ponto eletrônico.
- **Fase 3: APIs Governamentais** (80% Implementada): Integração com 5 APIs oficiais, sistema de cache.
- **Fase 4: IA de Atendimento** (90% Implementada): Tradução automática, sugestões de roteiros, assistência de acessibilidade, processamento de mensagens.
- **Fase 5: Integração ALUMIA** (Preparada para implementação).
- **Aprimoramento do Módulo de Cadastro Manual de Eventos - Lógica de Expiração**: Função SQL `public.auto_expire_events()` criada e agendada no Supabase.
- **Mudanças Implementadas pelo Lovable**: Estrutura de rotas reorganizada, sistema de branding dinâmico (`BrandContext`), componentes universais e estrutura SaaS completa.

### ⏳ Fases e Funcionalidades Pendentes no Plano de Ação:
- **Aprimoramento do Módulo de Cadastro Manual de Eventos - Filtragem de Eventos Expirados (Frontend)**: Ajustar queries para respeitar `is_active` e `is_visible`.
- **Módulo de Passaporte Digital**: Criar e gerenciar rotas com múltiplas cidades, recompensas baseadas em geolocalização, selos temáticos, interface do usuário final.
- **Integração com APIs de Eventos (Ex: Sympla)**: Automatizar busca e importação de eventos de fontes externas, processamento e integração com a IA.
- **Escalabilidade e Planejamento Participativo**: Aprimoramento da arquitetura multi-tenant (`flowtrip_states`), desenvolvimento de funcionalidades para planejamento turístico participativo.
- **IA para Planejamento Turístico Estratégico**: Pesquisa e implementação de IA para analisar dados de turismo para planos estratégicos.

### ⚠️ Problemas/Bugs Atuais (Prioridade de Resolução Sugerida):
- **Problema de Autenticação / Redirecionamento Inesperado para Login**: `userProfile` no `AuthContext` está `null` em momentos críticos, causando inconsistência na verificação de permissões e erro `406 Not Acceptable` com RLS. É necessário resolver a condição de corrida no `AuthProvider` para garantir que o `userProfile` esteja sempre populado. 