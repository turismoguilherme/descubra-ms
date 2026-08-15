# Limpeza da plataforma + correção de senha e cadastro de parceiros

## 1. "Esqueceu a senha" (parceiros e admin Guatá Labs)

**Causa confirmada:** o e-mail de recuperação leva de volta para uma tela que pede o e-mail outra vez. Hoje o link do e-mail aponta para `/reset-password`, mas essa rota renderiza o *formulário de pedido* de recuperação (`PasswordResetForm`) — não existe nenhuma tela onde a pessoa digite a nova senha. Resultado: o usuário fica em loop e nunca troca a senha. Existem ainda três pontos de entrada diferentes com destinos inconsistentes (`AuthProvider`, `ViaJARAuthProvider` e o próprio formulário).

**O que será feito:**
- Criar uma tela nova "Definir nova senha": ela detecta o link de recuperação vindo do e-mail, valida a sessão temporária e grava a nova senha (com confirmação, força mínima e mensagens claras de link expirado/inválido).
- Unificar todos os pedidos de recuperação em um único caminho, sempre apontando o e-mail para essa nova tela, preservando a marca de origem (Parceiro Descubra MS ou Guatá Labs) para voltar ao login correto.
- Página de pedido de recuperação com identidade correta: visual Descubra MS para parceiros e visual Guatá Labs para o admin (hoje o admin cai numa tela com a marca do Descubra MS).
- Remover o sistema paralelo e não usado de tokens de senha próprios (tabela e funções), ficando só o fluxo nativo do Supabase.

**Ação necessária do seu lado (fora do código):** no painel Supabase → Authentication → URL Configuration, as URLs de redirecionamento (`https://descubra-ms.lovable.app/...` e o domínio de preview) precisam estar na lista de permitidos, senão o link do e-mail é recusado. Eu indico exatamente quais colar.

## 2. Cadastro de parceiro travando com e-mail que já teve conta

**Causa confirmada:** no envio do formulário, se o e-mail já existe no Auth, o código simplesmente interrompe com "Este email já está cadastrado... faça login primeiro", sem oferecer nenhuma continuação. Isso acontece mesmo quando o cadastro anterior foi excluído e não há mais nenhum parceiro ligado àquele e-mail (a conta de login continua existindo).

**Como vai funcionar (retomada do cadastro):**
1. E-mail já existe no Auth e **não** existe parceiro ativo/pendente com esse e-mail → o sistema tenta entrar com a senha digitada no formulário:
   - senha correta → o cadastro segue normalmente e o novo registro de parceiro é criado vinculado à conta existente;
   - senha diferente → mensagem clara "Você já tem uma conta com este e-mail" + botões "Entrar" e "Recuperar senha", e o formulário fica salvo para continuar depois do login.
2. Usuário já logado abrindo o formulário → nenhum passo de senha, o cadastro é criado direto na conta dele.
3. Já existe parceiro ativo/pendente com o e-mail → segue bloqueado, com a orientação de contato (comportamento atual, correto).
4. Corrigir também a checagem de parceiro existente, que hoje quebra se houver mais de um registro com o mesmo e-mail, e passar a considerar apenas cadastros ativos/pendentes (cadastros rejeitados/excluídos não bloqueiam mais).

## 3. Limpeza de dados mortos no Supabase

- **Tabelas realmente sem uso** (nenhuma referência no código e sem dados): `flowtrip_state_features`, `master_system_metrics`, `master_platform_config`, `commercial_subscription_plans`, `password_reset_tokens`, `event_cleanup_logs`. Serão removidas junto com funções órfãs ligadas a elas.
- **Não serão removidas** as tabelas que aparentam estar "vazias" mas ainda são usadas por telas do admin ou Edge Functions (`master_clients`, `flowtrip_states`, `city_tour_*`, `institutional_surveys`, `workflow_definitions`, entre outras) — remover quebraria funcionalidades existentes.
- **Storage é o real peso hoje:** o bucket `tourism-images` tem 125 arquivos somando ~140 MB (os outros buckets somam ~13 MB). Vou gerar primeiro um relatório de arquivos órfãos (imagens que não estão referenciadas em nenhum registro do banco) e só apago depois da sua confirmação, com a lista na mão.
- Ajuste de retenção: limpeza periódica de logs de auditoria/IA já existentes, para não voltarem a crescer.

## 4. Limpeza de código morto

- Levantamento já feito: **169 arquivos** em `src/` sem nenhuma importação (utilitários, hooks duplicados de segurança/tradução, serviços antigos, tipos não usados e ~20 componentes `ui/` do shadcn nunca utilizados).
- Cada arquivo será reconferido individualmente antes de apagar (busca por referência direta e dinâmica) e a remoção será feita em blocos, com build/typecheck entre eles, para garantir que nada de funcional quebre.
- Também serão removidos `console.log` de depuração nos fluxos de parceiro e passaporte, que hoje poluem o console e vazam dados de formulário.

## Ordem de execução

1. Correção do "esqueceu a senha" (parceiro + admin Guatá Labs).
2. Retomada de cadastro de parceiro com e-mail já existente.
3. Migração de banco: remoção das tabelas/funções mortas.
4. Relatório de imagens órfãs no Storage (aguarda sua confirmação para apagar).
5. Remoção de código morto em blocos verificados.

## Detalhes técnicos

- Nova página `src/pages/ResetPasswordUpdate.tsx` tratando `PASSWORD_RECOVERY` / `exchangeCodeForSession` + `supabase.auth.updateUser({ password })`; rota `/reset-password` passa a apontar para ela nas duas árvores de rotas do `App.tsx`, e o pedido de e-mail vai para `/descubrams/forgot-password` e `/guata-labs/forgot-password`.
- `resetPasswordForEmail` centralizado com `redirectTo` = `${origin}/reset-password?brand=...`, eliminando as três variações atuais (`AuthProvider`, `ViaJARAuthProvider`, `PasswordResetForm`).
- Em `PartnerApplicationForm.onSubmit`: tratar tanto `authError` "already registered" quanto a resposta ofuscada do `signUp` (usuário sem `identities`), com fallback para `signInWithPassword`; troca de `.maybeSingle()` por consulta com filtro de status e `limit(1)`.
- Migração: `DROP TABLE` das 6 tabelas listadas + `DROP FUNCTION create_password_reset_token/validate_password_reset_token`.
- Remoção de código validada com `tsgo` e build a cada bloco.
