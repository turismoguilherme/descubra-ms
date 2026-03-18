# Parceiros – Reuso de e-mail / CPF / CNPJ após suspensão ou exclusão

## Comportamento atual

- **Suspender parceiro:** O registro permanece em `institutional_partners` (status `suspended`, `is_active = false`) e o usuário permanece em `auth.users`. Não é possível abrir um novo cadastro com o mesmo e-mail (o sistema informa que já existe solicitação com esse e-mail).
- **Excluir permanentemente:** O admin chama a Edge Function `delete-partner-and-auth`, que remove o registro em `institutional_partners` e, quando seguro, remove também o usuário do Supabase Auth. Assim o e-mail fica livre para novo cadastro. **Exceção:** se o usuário for ViajarTur (está em `viajar_employees`) ou tiver role admin/tech/master_admin, a conta **não** é removida do Auth (apenas o parceiro é excluído).

## Como permitir que a pessoa use o mesmo e-mail novamente

### Opção 1 – Exclusão pelo admin (recomendado)

1. No **Admin > Parceiros**, clique em "Excluir permanentemente" no parceiro.
2. O sistema remove o parceiro e, se o usuário **não** for ViajarTur nem admin, remove também a conta do Auth. O e-mail fica livre.
3. A pessoa pode acessar "Seja um Parceiro" e fazer um novo cadastro com o mesmo e-mail.

**Se a conta não for removida** (porque o usuário é ViajarTur ou admin), use o procedimento manual abaixo.

### Opção 1b – Procedimento manual (quando a conta não é removida automaticamente)

Se o ex-parceiro for também funcionário ViajarTur ou admin, a Edge Function **não** remove a conta do Auth. Para liberar o e-mail:

1. No **Supabase Dashboard**: Authentication > Users, localize o usuário pelo e-mail e **remova o usuário** (Delete user).
2. A partir daí, o e-mail fica livre para novo cadastro.

### Opção 2 – Reativar em vez de novo cadastro (parceiro suspenso)

Se o parceiro foi apenas **suspenso**, não é necessário novo cadastro. No Admin > Parceiros, altere o status do parceiro para "Aprovado" (ou use "Reativar") para que ele volte a ter acesso.

### CPF / CNPJ

A tabela `institutional_partners` não possui constraint UNIQUE em CPF/CNPJ (apenas índices). Após excluir o parceiro, o mesmo CPF/CNPJ poderia ser aceito em um novo registro. O bloqueio na prática é o e-mail: como o cadastro começa pelo signUp (e-mail), até liberar o e-mail (Opção 1) a pessoa não consegue enviar um novo formulário com esse CPF/CNPJ.

## Implementação técnica

- **Edge Function `delete-partner-and-auth`:** Recebe `partnerId`, verifica se o usuário do parceiro (`created_by` ou `contact_email`) está em `viajar_employees` ou em `user_roles` (admin/tech/master_admin). Se não estiver, após excluir o parceiro remove o usuário do Auth. Assim o ViajarTur não é afetado.

## Melhorias futuras (não implementadas)

- **Fluxo "Nova solicitação de parceria":** Para usuários já logados cujo e-mail não tem parceiro ativo (ex.: parceiro foi excluído), poderia haver um CTA "Solicitar nova parceria" que leva ao wizard sem passo de senha, criando um novo registro em `institutional_partners` com o mesmo `auth.users.id`.
