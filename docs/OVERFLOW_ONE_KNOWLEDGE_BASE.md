# 🏢 **OVERFLOW ONE - BASE DE CONHECIMENTO COMPLETA**

## 🆕 Atualizações Recentes (Jan/2025)
- Studio integrado (oculto por flags) ao Master Dashboard
- Feature flags criadas: STUDIO_ENABLED, STUDIO_INVENTORY_V1, STUDIO_SITE_V1, STUDIO_TEMPLATES_ALL, STUDIO_AI_COPILOT_V1
- Próximos passos definidos (6 semanas) em `docs/PLANO_ACAO_MASTER_DASHBOARD.md`

### Roadmap (resumo)
- Semana 1: copy/comercial, PRD e pricing
- Semana 2: design funcional (fluxos/schemas/prompts IA)
- Semana 3: MVP (Inventory + Site + IA) atrás de flags
- Semana 4: Passport/Calendar (alicerces)
- Semana 5: Forms + CRM (HubSpot)
- Semana 6: Piloto e go/no-go

---

## 📋 **RESUMO EXECUTIVO**

A **OverFlow One** é uma empresa SaaS que desenvolve soluções de turismo digital para governos estaduais. A plataforma utiliza uma arquitetura multi-tenant onde cada estado cliente recebe uma instância personalizada e isolada.

**Descubra MS** é o produto estrela e case de sucesso, servindo como vitrine para vender a solução para outros estados brasileiros.

---

## 🧭 Módulos Comerciais
- Parceiros Comerciais (`/parceiros-comerciais`): Programa de parceiros com categorias e benefícios
- Serviços para Stakeholders (`/servicos`): Ofertas para Prefeituras e Trade (inventários, relatórios, multi-idiomas, mapa de calor)
- Páginas existentes: Soluções, Preços, Cases, Sobre, Contato

---

## 🧩 Master Dashboard (Administração)
- Abas: Visão, Clientes, Suporte, IA, Parceiros, Workflows, Stripe, HubSpot
- Gestão Financeira: registros em `master_financial_records` via webhooks Stripe
- CRM/Pré-vendas: sincronia com HubSpot (contatos/deals)
- IA Central: análise estratégica e aconselhamento

---

## 🏗️ **ARQUITETURA TÉCNICA**
- Frontend: React + TypeScript + Tailwind + Shadcn/ui
- Backend: Supabase (PostgreSQL + Edge Functions)
- IA: Gemini + RAG
- Integrações: Stripe (billing), HubSpot (CRM)

---

## 🔐 Segurança
- RLS habilitado em tabelas `master_*`
- CSRF, Rate Limiting, Monitoramento ativo

---

## 🗺️ Roadmap Comercial
- CMS Comercial (tabela `commercial_content`) para editar textos e CTAs
- Integração real com Stripe/HubSpot (substituir mocks)
- Automação de qualificação de leads e propostas via HubSpot

---

O conteúdo acima reflete o estado atual e o direcionamento estratégico, complementando a documentação técnica e o plano de ação do Master Dashboard.
