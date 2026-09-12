# Corrigir o cadastro após o pagamento + gerar novas chaves do Stripe

## Parte 1 — Passo a passo para gerar as chaves do Stripe (você faz)

### A. Chave secreta (STRIPE_SECRET_KEY)
1. Entre em https://dashboard.stripe.com
2. Escolha o ambiente no topo: "Modo de teste" (para testar) ou produção (para valer).
3. Menu **Desenvolvedores → Chaves de API**.
4. Na linha "Secret key", clique em **Roll key** (girar/regerar) e confirme. Isso invalida a chave antiga vazada.
5. Copie a nova chave (começa com `sk_live_` em produção ou `sk_test_` em teste). Ela só aparece uma vez.

### B. Segredo do webhook (STRIPE_WEBHOOK_SECRET)
1. **Desenvolvedores → Webhooks**.
2. Se ainda não existir, clique em **Add endpoint** e use a URL:
   `https://hvtrpkbjgbuypkskqcqm.supabase.co/functions/v1/stripe-webhook-handler`
3. Eventos a marcar: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`.
4. Abra o endpoint → **Signing secret** → **Roll secret** → copie o novo valor (começa com `whsec_`).

### C. Onde colocar (só em um lugar)
- Guarde as duas apenas nos segredos do backend do projeto. Me avise quando tiver os valores em mãos e eu abro o formulário seguro para você colar — nada de valor passa pelo chat.
- **Apague** `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET` das variáveis do Vercel (o site não usa nenhuma das duas; é de lá que vêm os avisos "value is visible").
- A chave publicável (`pk_...`) não é secreta e pode ficar onde está.

## Parte 2 — Por que trava depois do pagamento (causa encontrada)

Na URL de retorno aparece `partner_id={PARTNER_ID}` literal. Ou seja: o Stripe não substituiu esse texto. Dois motivos somados:

1. O site tenta mandar a URL de retorno como parâmetro na abertura do link de pagamento — um Payment Link **ignora** esse parâmetro. Vale a página de retorno configurada no painel do Stripe, que hoje contém `{PARTNER_ID}` — e o Stripe só substitui os placeholders dele (`{CHECKOUT_SESSION_ID}`).
2. Sem `partner_id`, a página de sucesso tenta descobrir o parceiro pelo e-mail do usuário logado — mas, ao voltar do Stripe, o console mostra "Sem sessão Supabase". Sem login e sem id, ela não tem como continuar.

E ainda que a pessoa faça login, hoje o login barra parceiro com conta ainda não ativa ("Sua conta de parceiro está inativa") — justamente o estado de quem acabou de pagar e ainda não fez o Stripe Connect.

## Parte 3 — Correções que vou aplicar

1. **Identificar o parceiro pelo próprio pagamento**: passar o id do cadastro no link do Stripe usando o parâmetro que o Stripe aceita (`client_reference_id`), junto com o e-mail já preenchido. Remover o parâmetro de redirecionamento que não funciona.
2. **Página de sucesso resiliente**: quando `partner_id` vier vazio ou como `{PARTNER_ID}`, consultar a sessão do pagamento pelo `session_id` (função `get-stripe-session`, que já devolve `client_reference_id` e o e-mail do pagador) e, com isso, achar o cadastro e seguir direto para a etapa do Stripe Connect — mesmo sem login.
3. **Liberar o login de quem está em cadastro**: parceiro com situação "pendente/aguardando" passa a entrar e cair na continuação do cadastro (etapa Stripe Connect), em vez de receber "conta inativa". Continua bloqueado quem foi recusado ou cancelado.
4. **Ajuste no painel do Stripe** (você faz, eu documento): na página de retorno do Payment Link, usar
   `https://descubrams.com/descubrams/seja-um-parceiro/success?session_id={CHECKOUT_SESSION_ID}`
   (sem `{PARTNER_ID}`).
5. Atualizar `docs/STRIPE_PAYMENT_LINK_PARCEIROS.md` com o fluxo correto e publicar as funções afetadas.

## Detalhes técnicos

- `src/components/partners/PartnerPaymentStep.tsx`: montar `?client_reference_id=<partnerId>&prefilled_email=<email>`; remover `after_completion[redirect][url]`.
- `src/pages/PartnerSuccessPage.tsx`: nova ordem de resolução → `partner_id` da URL → `get-stripe-session(session_id)` (`client_reference_id`, depois `customer_email` → `institutional_partners.contact_email`) → fallback e-mail do usuário logado. Só mostrar a tela "não identificamos" se as três falharem.
- `src/components/auth/PartnerLoginForm.tsx`: manter bloqueio para `rejected`/`cancelled`; para `is_active = false` com `status` de onboarding, redirecionar a `/descubrams/seja-um-parceiro?step=4&partner_id=<id>`.
- `get-stripe-session` é pública (sem JWT) e recebe apenas `session_id`; sem alteração de permissão necessária.
