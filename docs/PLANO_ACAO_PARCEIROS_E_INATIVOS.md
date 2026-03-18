# Plano de ação – Parceiros (reuso de e-mail) e contas inativas Descubra MS

## Resumo do que foi implementado

### 1. Excluir parceiro e liberar e-mail para novo cadastro

| Item | Descrição |
|------|-----------|
| **Edge Function** | `delete-partner-and-auth`: recebe `partnerId`, exclui o parceiro em `institutional_partners` e, se o usuário **não** for ViajarTur nem admin/tech, remove também o usuário do Auth. |
| **Front** | Em **Admin > Parceiros**, ao clicar em "Excluir permanentemente", chama essa Edge Function em vez de apenas DELETE. O toast informa se a conta foi removida (e-mail liberado). |
| **Proteção ViajarTur** | Usuários em `viajar_employees` ou com role admin/tech/master_admin em `user_roles` **não** têm a conta removida; apenas o registro de parceiro é excluído. |
| **Doc** | `docs/PARCEIROS_REUSO_EMAIL_APOS_EXCLUSAO.md` atualizado. |

### 2. Política de contas inativas (Descubra MS)

| Item | Descrição |
|------|-----------|
| **Regra** | Usuários que não acessam há **9 meses** recebem um e-mail de aviso. Se não fizerem login em **30 dias**, a conta é excluída. |
| **Quem não é afetado** | ViajarTur (`viajar_employees`) e admins (`user_roles`: admin, tech, master_admin). |
| **Tabela** | `inactive_account_warnings` (user_id, warned_at) para registrar o aviso. |
| **E-mail** | Template `inactive_account_warning` em `send-notification-email`. |
| **Edge Function** | `inactive-users-process`: lista inativos, envia aviso ou exclui conforme prazo. Variáveis: `INACTIVE_ACCOUNT_MONTHS`, `INACTIVE_ACCOUNT_GRACE_DAYS`, `DESCUBRA_MS_LOGIN_URL`. |
| **Cron** | Job pg_cron `inactive-users-process` toda **segunda às 03:00**, usando os mesmos secrets do vault que o autonomous-agent. |
| **Doc** | `docs/POLITICA_CONTAS_INATIVAS_DESCUBRA_MS.md`. |

## Arquivos criados/alterados

- `supabase/functions/delete-partner-and-auth/index.ts` (novo)
- `supabase/functions/inactive-users-process/index.ts` (novo)
- `supabase/functions/send-notification-email/index.ts` (tipo + template `inactive_account_warning`)
- `supabase/migrations/20260316000001_create_inactive_account_warnings.sql` (novo)
- `supabase/migrations/20260316000002_schedule_inactive_users_process.sql` (novo)
- `src/components/admin/descubra_ms/PartnersManagement.tsx` (deletePartner chama a Edge Function)
- `docs/PARCEIROS_REUSO_EMAIL_APOS_EXCLUSAO.md` (atualizado)
- `docs/POLITICA_CONTAS_INATIVAS_DESCUBRA_MS.md` (novo)
- `docs/PLANO_ACAO_PARCEIROS_E_INATIVOS.md` (este arquivo)

## Deploy

1. Aplicar as migrations no Supabase (criar tabela e agendar o cron).
2. Fazer deploy das Edge Functions: `delete-partner-and-auth`, `inactive-users-process`, e a versão atualizada de `send-notification-email`.
3. Garantir que o vault tenha os secrets `autonomous_agent_project_url` e `autonomous_agent_anon_key` para o cron chamar `inactive-users-process` (ou ajustar a migration para usar outros nomes de secrets).
