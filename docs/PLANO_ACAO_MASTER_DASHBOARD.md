# 🚀 PLANO DE AÇÃO – MASTER DASHBOARD + OVERFLOW STUDIO

## ✅ Status atual
- Studio integrado ao `OverFlowOneMasterDashboard` (oculto por flags)
- Feature flags adicionadas em `src/config/environment.ts`:
  - STUDIO_ENABLED, STUDIO_INVENTORY_V1, STUDIO_SITE_V1, STUDIO_TEMPLATES_ALL, STUDIO_AI_COPILOT_V1 (todas false)
  - CRM_HUBSPOT_ENABLED, BILLING_STRIPE_ENABLED (false)
- Sem mudanças visíveis ao público; tudo atrás de flags

---

## 🎯 Decisões do produto
- Cliente pode editar e publicar sem aprovação
- Monetização: assinatura por workspace + taxa por publicação + serviços profissionais (retainer)
- MVP Studio: Inventory Builder + Site Builder + IA Copilot
- Templates v1: Cidade, Região, Evento, Parque/Complexo

---

## 🗺️ Próximos passos (6 semanas)

### Semana 1 – Conteúdo, PRD e preços
- Definir copy final das páginas “Parceiros” e “Serviços” (ocultas até liberar)
- PRD curto do Studio (MVP): campos, regras e fluxos
- Tabela de preços inicial (workspace + publicação + serviços)
- Saídas: PRD aprovado, pricing base, backlog priorizado

### Semana 2 – Design funcional do Studio (MVP)
- Fluxos: Inventory Builder, Site Builder, IA Copilot
- Schemas mínimos (inventário SeTur, seções de site, tradução)
- Prompts/checklists da IA (SeTur, SEO, acessibilidade)
- Saídas: wireframes/UX e contrato de dados

### Semana 3 – Implementação MVP (atrás de flags)
- Inventory Builder: import CSV/Sheets, validação SeTur, edição e multi-idiomas
- Site Builder: templates (Cidade/Região/Evento/Parque), preview e staging
- IA Copilot: geração de copy multi-idiomas + checklists (aplicar com 1 clique)
- Saídas: build interno com flags (sem expor)

### Semana 4 – Alicerces de Passport/Calendar
- Passport Builder (estrutura): roteiros, checkpoints, badges/recompensas
- Calendar Builder: cadastro, moderação e integração simples na vitrine
- Saídas: rotas internas + publicação condicional

### Semana 5 – Comercial e CRM
- Formulários de lead (Parceiros/Serviços) com qualificação (segmento/volume/orçamento)
- Integração HubSpot em produção (Stripe ainda desativado)
- Saídas: pipeline funcional de leads

### Semana 6 – Piloto e go/no-go
- Onboarding de 1 cliente (workspace) para piloto fechado
- Métricas: time-to-first-publish, itens padronizados, publicações
- Go/no-go, ajustes finais e plano de lançamento

---

## 🧪 Critérios de aceite (MVP)
- Importar e validar ≥ 100 itens de inventário com SeTur + tradução
- Publicar 1 site a partir de template (staging → produção) via Studio
- IA gerar copy multi-idiomas e passar checklists (SeTur/SEO/A11y)

---

## 📌 Tarefas imediatas (D+2)
- Redigir copy final de “Parceiros” e “Serviços” (ocultas)
- PRD curto do Studio (MVP) e prompts da IA
- Preparar formulários de lead (campos de qualificação)

---

## 🚦 Flags e ativação
- Dev: ativar `STUDIO_ENABLED=true` para testes internos
- Habilitar módulos do MVP gradualmente:
  - `STUDIO_INVENTORY_V1=true`
  - `STUDIO_SITE_V1=true`
  - `STUDIO_AI_COPILOT_V1=true`
- Produção: manter false até piloto aprovado

---

## ⚠️ Riscos & mitigação
- Escopo crescer: travar MVP por flags e backlog
- Qualidade do dado: validações SeTur + revisão opcional
- Carga operacional: ofertar retainer modular (SLA) e automações






