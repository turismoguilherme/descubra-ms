# Payment Link Stripe – Assinatura de Parceiros (Descubra MS)

## Visão geral

O fluxo "Seja um Parceiro" usa um **Payment Link** do Stripe para a assinatura mensal.

Importante: um Payment Link **ignora** parâmetros de redirecionamento na querystring
(`after_completion[redirect][url]` não funciona). Os únicos parâmetros úteis aceitos são
`client_reference_id`, `prefilled_email` e `locale`.

Por isso o fluxo correto é:

1. O frontend abre o link com `?client_reference_id=<UUID do parceiro>&prefilled_email=<email>`.
2. A página de retorno é configurada **no painel do Stripe**, sem placeholders próprios do app:
   `https://descubrams.com/descubrams/seja-um-parceiro/success?session_id={CHECKOUT_SESSION_ID}`
3. A página de sucesso resolve o parceiro nesta ordem:
   - `partner_id` da URL (se presente e válido);
   - Edge Function `get-stripe-session` → `client_reference_id` da sessão;
   - `customer_email` da sessão → `institutional_partners.contact_email`;
   - e-mail do usuário autenticado (se houver sessão).
4. Com o parceiro identificado, o usuário segue direto para a etapa 4 do wizard (Stripe Connect).

## Erro comum

Nunca use `{PARTNER_ID}` na página de retorno do Payment Link. O Stripe só substitui
placeholders dele (ex.: `{CHECKOUT_SESSION_ID}`); `{PARTNER_ID}` chega literal na URL e o
usuário fica preso na tela "Pagamento recebido".

## Onde o link é configurado

- **Admin:** Descubra MS > Parceiros > botão "Configurações" > campo "Link de pagamento".
- **Banco:** `site_settings` com `platform = 'ms'` e `setting_key = 'partner_payment_link'`.

## Login durante o cadastro

Parceiro ainda não ativado (`is_active = false`, status de onboarding) **consegue entrar** na
área do parceiro e é levado para `/descubrams/seja-um-parceiro?step=4&partner_id=<id>` para
concluir o Stripe Connect. Continuam bloqueados apenas os status `rejected` e `cancelled`.

## Chaves e segredos

`STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET` ficam **somente** nos secrets do Supabase
(Edge Functions). Não devem existir como variáveis de ambiente no Vercel — o frontend não
usa nenhuma das duas.
