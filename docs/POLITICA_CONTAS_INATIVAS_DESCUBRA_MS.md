# Política de contas inativas – Descubra MS

## Objetivo

Encerrar contas de usuários do **Descubra MS** que não acessam a plataforma há muito tempo, após aviso por e-mail. Isso não se aplica a **parceiros** nem a **usuários ViajarTur** (funcionários ou admins).

## Regras

1. **Inatividade:** Considera-se inativo quem não fez login há **9 meses** (configurável via `INACTIVE_ACCOUNT_MONTHS`).
2. **Aviso:** Ao detectar inatividade, o sistema envia um e-mail pedindo que a pessoa faça login em até **30 dias** (configurável via `INACTIVE_ACCOUNT_GRACE_DAYS`) para manter a conta.
3. **Exclusão:** Se não houver login após o prazo, a conta é removida do Auth (e os dados relacionados são tratados conforme políticas de exclusão do Supabase/banco).

## Quem NÃO é afetado

- **ViajarTur:** Usuários presentes em `viajar_employees` nunca entram na lista de inativos.
- **Admins:** Usuários com role `admin`, `tech` ou `master_admin` em `user_roles` não são avisados nem excluídos.
- **Parceiros:** A lógica considera apenas usuários “genéricos” do Descubra MS; parceiros são gerenciados pelo fluxo de exclusão de parceiro.

## Implementação

- **Tabela:** `public.inactive_account_warnings` (registra `user_id` e `warned_at` para cada aviso).
- **Edge Function:** `inactive-users-process`  
  - Lista usuários do Auth com `last_sign_in_at` anterior ao limite de meses.  
  - Filtra quem está em `viajar_employees` ou em `user_roles` (admin/tech/master_admin) e os exclui da lista.  
  - Para cada inativo: se ainda não foi avisado, insere em `inactive_account_warnings` e envia e-mail `inactive_account_warning` (template em `send-notification-email`).  
  - Se já foi avisado e o aviso foi há mais de `GRACE_DAYS`, remove o usuário do Auth e o registro em `inactive_account_warnings`.
- **Cron:** Job `inactive-users-process` agendado para **toda segunda-feira às 03:00** (pg_cron), chamando a Edge Function. Usa os mesmos secrets do vault que o `autonomous-agent-scheduler` (URL do projeto e anon key).

## Variáveis de ambiente (Edge Function)

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `INACTIVE_ACCOUNT_MONTHS` | Meses sem login para considerar inativo | 9 |
| `INACTIVE_ACCOUNT_GRACE_DAYS` | Dias após o aviso para excluir se não houver login | 30 |
| `DESCUBRA_MS_LOGIN_URL` | URL do link “Fazer login” no e-mail | https://descubramatogrossodosul.com.br/descubrams/login |

## Execução manual

É possível chamar a Edge Function manualmente (por exemplo, para testes):

```bash
curl -X POST "https://<PROJECT_REF>.supabase.co/functions/v1/inactive-users-process" \
  -H "Authorization: Bearer <ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{}'
```

A resposta indica quantos usuários foram avisados e quantos foram excluídos.
