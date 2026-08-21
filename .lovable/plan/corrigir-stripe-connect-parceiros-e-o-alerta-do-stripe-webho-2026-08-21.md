# Corrigir Stripe Connect (parceiros) e o alerta do STRIPE_WEBHOOK_SECRET na Vercel

## O que está acontecendo

Verifiquei o fluxo ponta a ponta (botão "Conectar Stripe" → `invokeStripeConnectOnboarding` → Edge Function `stripe-connect-onboarding` → Stripe) e encontrei duas travas de domínio que explicam o erro genérico na tela:

1. **CORS bloqueia os domínios da Lovable.** A lista de origens permitidas em `supabase/functions/_shared/cors.ts` só tem `viajartur.com`, `descubrams.com`, `descubra-ms.vercel.app` e `localhost`. Não há nenhuma entrada `lovable.app`. Como você está usando o preview (`id-preview--...lovable.app`) e o publicado (`descubra-ms.lovable.app`), a resposta volta com `Access-Control-Allow-Origin` de outro domínio, o navegador descarta a chamada e o app mostra apenas "Não foi possível iniciar a conexão com o Stripe".

2. **A validação de `returnUrl`/`refreshUrl` rejeita os mesmos domínios.** Dentro da função, `isValidUrl` usa a mesma lista curta. O componente envia `window.location.origin` (ou seja, `...lovable.app`), então mesmo com o CORS liberado a função responderia "URL de retorno inválida".

Também confirmei no banco que o único parceiro cadastrado ainda está com `stripe_account_id` vazio e `stripe_connect_status = pending`, e que não há nenhum log de execução da função — coerente com a chamada nunca chegar ao Stripe.

Observação: os secrets do Stripe ficam no painel do Supabase (projeto externo), por isso não consigo confirmar daqui se `STRIPE_SECRET_KEY` está preenchida. Depois do ajuste de domínios, se aparecer a mensagem "STRIPE_SECRET_KEY não configurada", basta cadastrá-la nos secrets das Edge Functions.

## Sobre o aviso da Vercel (STRIPE_WEBHOOK_SECRET)

O `STRIPE_WEBHOOK_SECRET` é usado **apenas** pela Edge Function `stripe-webhook-handler`, que roda no Supabase. Ele não é lido em nenhum ponto do build/front-end, então não deveria existir como variável de ambiente na Vercel — é ali que a Vercel avisa que o valor está visível para qualquer pessoa com acesso ao projeto.

Encaminhamento (feito por você no painel, não dá para automatizar):
1. No Stripe (Developers → Webhooks → endpoint do Supabase) clicar em **Roll secret** para gerar um novo valor.
2. Salvar o novo valor **somente** nos secrets das Edge Functions do Supabase.
3. **Remover** `STRIPE_WEBHOOK_SECRET` das Environment Variables da Vercel.
4. Conferir na mesma tela se `STRIPE_SECRET_KEY` também está lá — se estiver, mesmo tratamento (rotacionar no Stripe e manter só no Supabase).

## Mudanças no código

1. `supabase/functions/_shared/cors.ts`
   - Acrescentar `https://*.lovable.app` e `https://*.lovable.dev` à lista padrão de origens permitidas (o suporte a curinga de subdomínio já existe na função).
   - Manter `ALLOWED_ORIGINS` como override, e quando a origem não for reconhecida devolver a origem do próprio projeto em vez de um domínio fixo de terceiro.

2. `supabase/functions/stripe-connect-onboarding/index.ts`
   - Centralizar a lista de domínios de retorno em um helper compartilhado (`_shared/allowedRedirects.ts`) e incluir `lovable.app` / `lovable.dev`, evitando duas listas divergentes.
   - Corrigir o `accountLinks.create`: hoje, quando `returnUrl` vem vazio, `refresh_url` monta `undefined?stripe_connect=refresh`. Passar a exigir `returnUrl`/`refreshUrl` válidos e retornar 400 com mensagem clara.
   - Melhorar a mensagem quando `STRIPE_SECRET_KEY` estiver ausente, para o parceiro entender que é configuração e não erro dele.

3. `supabase/functions/stripe-connect-callback/index.ts`
   - Aplicar o mesmo helper de domínios permitidos, para o retorno do Stripe não quebrar nos domínios Lovable.

4. `src/utils/invokeStripeConnectOnboarding.ts`
   - Diferenciar falha de CORS/rede de erro da função na mensagem exibida, para que um bloqueio futuro apareça como "chamada bloqueada pelo navegador (CORS)" em vez de erro genérico.

5. Deploy das funções afetadas (`stripe-connect-onboarding`, `stripe-connect-callback`, e as demais que importam o CORS compartilhado).

## Validação

- Acionar "Conectar Stripe" no cadastro do parceiro e confirmar redirecionamento para o onboarding do Stripe.
- Verificar em `institutional_partners` que `stripe_account_id` foi gravado e `stripe_connect_status` passou para `pending`/`connected`.
- Conferir os logs da função para garantir ausência de 401/403/400.
