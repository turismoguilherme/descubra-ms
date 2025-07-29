# Documentação da Funcionalidade: Gerenciamento de Leads de Parceiros

Este documento detalha a funcionalidade de gerenciamento de leads de parceiros, que permite a captação de novas solicitações de parceria e sua revisão pela equipe administrativa no FlowTrip Master Dashboard.

---

## 1. Visão Geral da Funcionalidade

A funcionalidade de "Gerenciamento de Leads de Parceiros" é a primeira fase da implementação da estratégia de monetização B2C do lado "Descubra MS". Ela estabelece um canal formal para que empresas e stakeholders do turismo possam manifestar interesse em se tornar parceiros da plataforma, e para que os administradores possam gerenciar essas solicitações.

**Objetivo:**
*   Capacitar a plataforma a receber solicitações de parceria de forma estruturada.
*   Fornecer uma interface administrativa para revisão, aprovação ou rejeição de novas parcerias.

---

## 2. Componentes e Estrutura Implementados

Esta funcionalidade abrange alterações no frontend, backend (hooks) e no esquema do banco de dados (migração).

### 2.1. Frontend

*   **`src/pages/BecomePartner.tsx`:** Esta página (acessada via o botão "Quero ser um parceiro" na página de parceiros) é o ponto de entrada para o formulário de solicitação.
*   **`src/components/partners/PartnerForm.tsx`:** O componente principal do formulário.
    *   **Campos Adicionados/Modificados:**
        *   `cnpj` (opcional)
        *   `contact_person` (Pessoa de Contato - opcional)
        *   `segment` (agora um `Select` com opções pré-definidas como Hotelaria, Restaurante, Agência de Turismo, etc.)
        *   `partnership_interest` (Interesse em Parceria - `Select` com opções como Destaque na Plataforma, Patrocínio de Evento, Conteúdo Colaborativo, Outro).
    *   **Validação:** Utiliza `zod` para validação de esquema.
    *   **Envio de Dados:** Envia os dados para o Supabase através do hook `usePartners`.
*   **`src/pages/FlowTripMasterDashboard.tsx`:**
    *   **Nova Aba "Parceiros":** Foi adicionada uma nova `TabsTrigger` e `TabsContent` para "Parceiros" no Master Dashboard.
    *   **Integração do Componente de Gerenciamento:** Renderiza o `PartnerLeadsManagement` dentro da aba "Parceiros".
*   **`src/components/admin/PartnerLeadsManagement.tsx`:** Novo componente criado para exibir e gerenciar os leads de parceiros.
    *   **Exibição:** Lista todas as solicitações de parceria com `status: 'pending'` em uma tabela.
    *   **Detalhes:** Exibe nome, CNPJ, pessoa de contato, e-mail, WhatsApp, segmento, interesse, cidade e status.
    *   **Ações:** Botões para "Aprovar" (muda `status` para 'approved') e "Rejeitar" (muda `status` para 'rejected').
    *   **Notificações:** Utiliza `useToast` para feedback visual.

### 2.2. Backend (Hooks e Supabase)

*   **`src/hooks/usePartners.tsx`:**
    *   **Interface `NewPartner`:** Atualizada para incluir os campos `cnpj`, `contact_person` e `partnership_interest`.
    *   **`submitPartnershipRequest`:** Função de mutação que insere os dados do novo parceiro na tabela `public.institutional_partners` no Supabase com `status: 'pending'` por padrão.
    *   **`fetchApprovedPartners` (revisado):** Embora o foco seja em leads pendentes, o `usePartners` já era responsável por buscar parceiros. Foi ajustado para melhor mapeamento.
    *   **`refetch`:** Utilizado no `PartnerLeadsManagement` para atualizar a lista de leads após uma ação (aprovação/rejeição).
*   **Supabase Database (Migração):**
    *   **`supabase/migrations/TIMESTAMP_add_partner_form_fields.sql`:** Um novo arquivo de migração SQL foi criado e aplicado com sucesso ao seu banco de dados Supabase.
    *   **Colunas Adicionadas:** `cnpj` (TEXT), `contact_person` (TEXT), `partnership_interest` (TEXT com `CHECK` constraint para os valores permitidos). A coluna `status` já existia e é fundamental para o fluxo.

---

## 3. Fluxo de Trabalho da Funcionalidade

1.  **Solicitação de Parceria (Frontend):**
    *   Uma empresa interessada acessa a página "Seja Nosso Parceiro" (`/MS/parceiros` -> botão "Quero ser um parceiro").
    *   Preenche o formulário detalhado (`PartnerForm.tsx`) com suas informações, segmento e interesse em parceria.
    *   Envia o formulário.
2.  **Registro da Solicitação (Backend):**
    *   Os dados do formulário são enviados via `submitPartnershipRequest` no `usePartners.tsx`.
    *   Uma nova entrada é criada na tabela `public.institutional_partners` no Supabase, com o `status` definido como `'pending'` (pendente).
3.  **Revisão Administrativa (FlowTrip Master Dashboard):**
    *   Um administrador ou usuário com perfil `tech` acessa o FlowTrip Master Dashboard (`/admin/master-dashboard`).
    *   Navega para a nova aba "Parceiros".
    *   Visualiza uma lista de todas as solicitações com status "Pendente" (`PartnerLeadsManagement.tsx`).
    *   Para cada solicitação, o administrador pode:
        *   Visualizar os detalhes (nome, CNPJ, contato, interesse, etc.).
        *   Clicar em "Aprovar" para mudar o `status` do parceiro para `'approved'` no banco de dados.
        *   Clicar em "Rejeitar" para mudar o `status` do parceiro para `'rejected'` no banco de dados.
    *   Após a aprovação, o parceiro estará pronto para ser exibido na plataforma (próxima fase).

---

## 4. Status de Implementação

A Fase 1 (Captação e Gerenciamento de Leads de Parceiros) do plano de ação para a implementação de parceiros está **CONCLUÍDA**.

*   Formulário de inscrição de parceiros está pronto.
*   Backend (hook e migração de DB) para receber e armazenar os dados está configurado e aplicado.
*   View de gerenciamento de leads no Master Dashboard está implementada.

**Próximo Passo:** Testar a funcionalidade de ponta a ponta e, em seguida, prosseguir para a Fase 2: Exibição e Destaque de Parceiros Aprovados. 