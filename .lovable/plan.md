## O que verifiquei antes de propor

- O menu real do admin vem de `src/config/adminModulesConfig.ts` (os arquivos `AdminSidebar.tsx` e `HorizontalNav.tsx` existem mas **não são usados** por nenhuma tela — são código morto).
- As tabelas do módulo financeiro estão praticamente vazias: `flowtrip_clients` (1 linha), `flowtrip_subscriptions` (1), `payment_reconciliation` (0), `flowtrip_invoices` (0), `flowtrip_usage_metrics` (0), `expenses` (0), `employee_salaries` (0), `pending_refunds` (0).
- Os webhooks do Stripe (`stripe-webhook-handler`, `stripe-create-checkout`, `hubspot-sync`) usam `master_clients`, **não** as tabelas `flowtrip_*` nem `payment_reconciliation` — então remover essas não quebra pagamentos de eventos/parceiros.
- Exclusão de usuário: a função `admin-delete-user` existe e está correta, mas **21 tabelas apontam para `auth.users` com `ON DELETE NO ACTION`** (`passport_stamps`, `security_audit_log`, `attendant_checkins`, `routes.created_by`, `leads`, `tourism_inventory`, etc.). Isso faz o `auth.admin.deleteUser` falhar com "Database error deleting user" para qualquer usuário que já tenha usado o app. Essa é a causa confirmada.
- Cartilhas: em `GuataCartilhasManager.tsx` só existe edição **do link**. Título, subtítulo, público, tema e capa só podem ser definidos na criação — por isso não é possível editar o nome depois.

---

## 1. Remover o módulo Financeiro por completo

**Menu e rotas** (`adminModulesConfig.ts` + `ViaJARAdminPanel.tsx`): remover o grupo `financial` inteiro (Visão Geral, Clientes, Assinaturas, Pagamentos, Receitas, Contas a Pagar, Contas Bancárias, Fornecedores, Relatórios, Leads de Contato) e as rotas `financial/*`, `viajar/clients`, `viajar/subscriptions`.

**Reembolsos → Parceiros**: `RefundManagement` passa a ser uma **4ª aba dentro de Descubra MS → Parceiros** (`?tab=refunds`), junto de Lista / Taxas / Cancelamento. Nada de reembolso se perde.

**Dashboard inicial do admin**: hoje o `DashboardOverview` é 100% financeiro (receita, despesa, lucro, contas a vencer). Vou substituí-lo por uma visão operacional: eventos pendentes de aprovação, parceiros aguardando aprovação, termos pendentes de revisão, usuários novos e reembolsos pendentes — tudo com link direto para a tela correspondente.

**Arquivos removidos**: `src/components/admin/financial/` (exceto `RefundManagement.tsx`), `src/components/admin/viajar/ClientsManagement.tsx`, `SubscriptionsManagement.tsx`, `src/services/admin/financialService.ts`, `financialDashboardService.ts`, `src/utils/financialReportGenerator.ts`, além dos códigos mortos `AdminSidebar.tsx` e `HorizontalNav.tsx`.

**Banco (migração)**: `DROP TABLE flowtrip_clients, flowtrip_subscriptions, flowtrip_invoices, flowtrip_usage_metrics, payment_reconciliation, expenses, employee_salaries`. Mantidas: `pending_refunds`, `master_clients`, `viajar_employees`, `partner_transactions` (usadas por outras partes).

> Nota: `AIAdminChat` e `autonomousAgentService` consultam despesas/receitas. Vou ajustá-los para não referenciar as tabelas removidas em vez de deletá-los.

## 2. Remover "Conteúdo e opções do site"

Item `platform-settings` sai do menu — ele aponta para `/descubra-ms/platform-settings`, rota que **nem existe** no painel (link quebrado hoje). Também vou limpar os outros itens de menu órfãos que descobri: `homepage`, `destinations`, `employees`, `pages`, `settings`.

## 3. Remover toda referência a "ViajARTur"

Substituição por **Guatá Labs** em: `AdminLogin.tsx`, `UsersManagement.tsx` (descrição), `PoliciesEditor.tsx`, `FooterSettingsManager.tsx`, `ViajarProductsManager.tsx`, `ViaJARSectionManager.tsx`, `EmployeesManagement.tsx`, `UnifiedLoginSystem.tsx`, `TestUserSelector.tsx`, `DiagnosticQuestionnaire.tsx`, `SystemMonitoring.tsx`, `SimpleTextEditor.tsx`, `WhatViajARTurDoesSection.tsx` (renomeado para `WhatGuataLabsDoesSection.tsx`), `pdfTemplateService.ts` e `viajarTestLogin.ts`.

As **rotas `/viajar/...` continuam iguais** — mexer nelas quebraria links salvos e o redirect de login. Só muda o texto visível.

## 4. Novo layout da tela de login administrativa

Só a tela `AdminLogin.tsx` (o cabeçalho interno do painel fica como está):

- Layout em duas colunas no desktop: painel esquerdo com a marca **Guatá Labs** (logo + mascote capivara, fundo verde-floresta com textura sutil) e formulário à direita em card claro; empilhado no mobile.
- Paleta Guatá Labs (verde-floresta / dourado / creme) via tokens do design system, substituindo os cinzas atuais.
- Melhorias de usabilidade: botão mostrar/ocultar senha, link "Esqueci minha senha", estado de erro mais legível, foco automático no e-mail e `autoComplete` correto.
- Subtítulo passa de "ViajARTur & Descubra MS" para "Guatá Labs & Descubra MS".

## 5. Corrigir exclusão de usuários

Migração alterando as 21 chaves estrangeiras que apontam para `auth.users` com `NO ACTION`:
- dados pessoais do usuário → `ON DELETE CASCADE` (`passport_stamps`, `user_achievements`, `attendant_checkins`, `attendant_timesheet`, `inventory_reviews`, `checkpoint_code_attempts`, `app_push_devices`);
- campos de autoria/auditoria → `ON DELETE SET NULL` (`routes.created_by`, `security_audit_log.user_id`, `leads.created_by/assigned_to`, `tourism_inventory`, `destinations`, `passport_configurations`, `pending_refunds.processed_by`, `system_alerts.resolved_by`, `content_audit_log`, `site_settings`, etc.), preservando o histórico.

Além disso, `admin-delete-user` passará a devolver a mensagem real do Postgres e a UI vai exibi-la, para nunca mais ficar um erro genérico.

## 6. Corrigir edição das cartilhas do Guatá Capacita

Em `GuataCartilhasManager.tsx`, trocar a edição só-do-link por um **diálogo "Editar cartilha"** completo: título (com regeneração opcional do slug), subtítulo, público-alvo, tema, link de abertura, troca de capa, status (Disponível / Em breve), destaque na home e visibilidade — salvando via `update` na `guata_cartilhas`.

---

### Detalhes técnicos

- Migração 1: `DROP TABLE ... CASCADE` das 7 tabelas financeiras (todas vazias ou com 1 linha de teste).
- Migração 2: `ALTER TABLE ... DROP CONSTRAINT / ADD CONSTRAINT ... ON DELETE CASCADE|SET NULL` nas FKs para `auth.users`.
- `RefundManagement` é montado dentro de `PartnersAdminModule` como aba, sem duplicar lógica.
- Nenhuma rota pública do Descubra MS é afetada.
