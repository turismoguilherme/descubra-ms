# Payment Link Stripe – Assinatura de Parceiros (Descubra MS)

## Visão geral

O fluxo "Seja um Parceiro" usa um Payment Link do Stripe para a assinatura mensal. A URL de redirecionamento após o pagamento é montada **no código** (frontend) e enviada ao Stripe via parâmetro na abertura do link. O Stripe deve usar essa URL; não use uma URL fixa no Dashboard que contenha o placeholder `{PARTNER_ID}`.

## Checklist – Stripe Dashboard

Ao configurar o **Payment Link** usado para assinatura de parceiros (configurado em Admin > Parceiros > Configurações > Link de pagamento):

1. **Não** defina uma "Success page" / "Redirect after payment" com URL fixa que contenha o texto `{PARTNER_ID}`. O Stripe só substitui placeholders próprios (ex.: `{CHECKOUT_SESSION_ID}`); `{PARTNER_ID}` não é substituído e o usuário volta com `partner_id={PARTNER_ID}` na URL, ficando preso na tela de sucesso.

2. **Recomendado:** Deixe a página de sucesso do Payment Link como padrão ou vazia, para que o Stripe use a URL passada pelo frontend no parâmetro `after_completion[redirect][url]`. O frontend monta:
   - Base: `https://descubrams.com` (ou o domínio atual se não for viajartur.com)
   - Path: `/descubrams/seja-um-parceiro/success?partner_id=<UUID_REAL>&session_id={CHECKOUT_SESSION_ID}`

3. Se precisar de uma URL customizada no Dashboard, use apenas algo como:
   - `https://descubrams.com/descubrams/seja-um-parceiro/success?session_id={CHECKOUT_SESSION_ID}`
   e implemente no backend/success page a leitura do `partner_id` a partir dos metadados da sessão do Stripe (exige implementação adicional).

## Onde o link é configurado

- **Admin:** Descubra MS > Parceiros > botão "Configurações" > campo "Link de pagamento".
- **Banco:** `site_settings` com `platform = 'ms'` e `setting_key = 'partner_payment_link'`.

## Domínios (descubrams.com e viajartur.com)

O código força a base da URL de sucesso para `https://descubrams.com` quando o usuário está em viajartur.com (ou similar), para que o redirect após o pagamento sempre leve à página de sucesso no Descubra MS.
