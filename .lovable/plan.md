# Correções: PDF assinado, e-mail reutilizado, redefinir senha e webhook do Stripe

## 1. PDF assinado do parceiro não é enviado

Encontrei a causa. A regra de permissão do armazenamento (bucket `documents`) que deveria liberar o envio do termo compara o **nome do parceiro** com o nome do arquivo, em vez de comparar com o arquivo que está sendo enviado. Como o nome de um parceiro nunca é igual a `partner-terms-uploaded/<id>-...`, a condição nunca é verdadeira e o envio é sempre recusado. Por isso a tela mostra "Falha ao enviar o PDF" e nada chega no admin.

Correção:
- Recriar a regra de envio para comparar o caminho do arquivo (`storage.objects.name`) com o id do parceiro logado, aceitando `partner-terms/<id>...` e `partner-terms-uploaded/<id>...`.
- Fazer o mesmo ajuste na regra de leitura/atualização, para o parceiro conseguir reenviar quando o admin pedir revisão.
- Nas telas de envio e reenvio, mostrar a mensagem real do erro em vez de "Falha ao enviar o PDF", para futuros problemas ficarem visíveis.

## 2. E-mail de quem já foi parceiro e voltou

Hoje, se a parceria foi excluída mas a conta de acesso continua existindo, o sistema pede a senha antiga — e se a pessoa não tiver, ela trava.

Conforme sua escolha, o novo comportamento será: **apagar a conta antiga e criar uma nova** com a senha informada agora.

- Nova função de servidor `partner-account-reset`: recebe o e-mail, confirma que **não existe** parceria ativa/pendente com ele e que o usuário **não** é da equipe Guatá Labs nem admin; então remove a conta antiga do sistema de acesso.
- Se houver parceria ativa, admin ou funcionário: nada é apagado e a mensagem explica que a pessoa deve entrar na Área do Parceiro.
- No formulário de cadastro, quando o e-mail já existir, o sistema chama essa função e repete a criação da conta automaticamente, seguindo o cadastro normalmente.

## 3. Redefinir senha da área administrativa da Guatá Labs

O link do e-mail leva para a tela inicial porque o endereço de retorno (`/reset-password`) não está na lista de endereços autorizados do Supabase — quando isso acontece, o Supabase ignora o retorno e manda para o endereço padrão do projeto.

Correção:
- Autorizar os endereços de retorno (viajartur.com, guatalabs.com, descubrams.com, domínio da Vercel e preview) e definir viajartur.com como endereço base — parte no arquivo de configuração e a confirmação final no painel do Supabase (Authentication → URL Configuration), que eu indico exatamente o que colar.
- Reforço no aplicativo: se alguém cair em qualquer página com um link de recuperação de senha, o app detecta e leva sozinho para a tela de nova senha. Assim o fluxo funciona mesmo se a configuração mudar.
- Conferir que o botão "Esqueceu a senha?" do admin Guatá Labs usa o mesmo caminho central de envio.

## 4. Webhook do Stripe (produção)

- Ajustar a função `stripe-webhook-handler` para não depender de CORS (webhook não vem do navegador), aceitar somente POST e responder rápido; registrar em log cada evento recebido para facilitar conferência.
- Endereço a cadastrar no Stripe (modo produção):
  `https://hvtrpkbjgbuypkskqcqm.supabase.co/functions/v1/stripe-webhook-handler`
- Eventos a marcar: `checkout.session.completed`, `payment_intent.payment_failed`, `charge.refunded`, `account.updated` (Stripe Connect dos parceiros).
- Depois de criar o endpoint, o Stripe mostra o "signing secret" — esse valor entra **apenas** nos segredos das funções do Supabase, com o nome `STRIPE_WEBHOOK_SECRET`. Também é preciso remover `STRIPE_WEBHOOK_SECRET` e `STRIPE_SECRET_KEY` das variáveis da Vercel (é o aviso que você viu).
- Ao final eu testo enviando um evento de teste pelo painel do Stripe e confiro os registros da função.

## 5. Publicação

Depois das correções, faço o deploy das funções do Supabase e publico a versão nova, que é o que a Vercel usa.

## Detalhes técnicos

- Migração: recriar as políticas de `storage.objects` do bucket `documents` usando `storage.objects.name` (o bug atual usa `institutional_partners.name`), com `is_partner_owner()`.
- Nova Edge Function `partner-account-reset` (service role, sem JWT): valida ausência de parceiro ativo em `institutional_partners`, ausência em `viajar_employees` e em `user_roles` (admin/tech/master_admin), e chama `auth.admin.deleteUser`. Limita tentativas por e-mail.
- `PartnerApplicationForm.tsx`: no ramo `already registered`, invocar a função e repetir `signUp` uma vez.
- `supabase/config.toml`: `site_url` e `additional_redirect_urls` com os domínios reais; instrução equivalente no painel.
- Novo handler global (em `App.tsx` ou provider de auth) que detecta `type=recovery`/`code` de recuperação em qualquer rota e navega para `/reset-password?brand=...`.
- `stripe-webhook-handler`: remover `corsHeaders` do fluxo principal, exigir `POST`, manter validação de assinatura e responder 200 mesmo em evento não tratado.
