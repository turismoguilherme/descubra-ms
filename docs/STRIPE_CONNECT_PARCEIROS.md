# Stripe Connect e parceiros (Descubra MS)

Documento de referência interna e base para o **termo de parceiros** (contrato ou aditivo jurídico a ser elaborado por profissional habilitado). Não substitui assessoria jurídica.

## O que é o Stripe Connect aqui

- A plataforma usa **Stripe Connect** em modo **Express**, **Brasil**.
- Cada parceiro que quer receber por essa integração passa por um fluxo em que o backend **cria uma conta ligada (connected account)** ao Stripe da plataforma.
- O parceiro **completa dados e verificações no site do Stripe** (KYC, dados bancários, etc.), não substituído pela plataforma.

## O que o parceiro faz no site (Descubra MS)

1. Cadastro e etapas do programa de parceiros (conforme o fluxo atual).
2. No passo **Stripe Connect**, clicar para conectar e ser **redirecionado ao Stripe** para concluir o onboarding.
3. Pode existir opção de **adiar** o passo; enquanto não estiver `connected`, não está pronto para o modelo de recebimento via Connect previsto no código.

## O que o parceiro **não** faz na plataforma

- **Não** saca ou transfere o saldo para o banco **dentro** apenas do painel Descubra MS.
- O **payout** (repasse do saldo Stripe para a conta bancária indicada) é gerido pelo **Stripe** (prazos, regras, suporte de saldo).

## O que a plataforma mostra ao parceiro

- **Histórico** de transações, comissões e repasses (dados operacionais, em geral ligados à tabela `partner_transactions` e reservas).
- Serve para **acompanhar** o negócio. **Não** é extrato oficial do Stripe nem garante igualdade com o saldo em tempo real.

## Frase simples para explicar a qualquer parceiro

**“No Descubra você vê o resumo das vendas; no Stripe você trata da conta e do dinheiro no banco.”**

## O que o operador da plataforma (você) configura uma vez

- Conta Stripe da plataforma com **Connect** habilitado.
- Chaves e webhooks nas Edge Functions / Supabase.
- Monitorização de contas em **Stripe Dashboard → Connect** e, se necessário, campos `stripe_connect_status` / `stripe_account_id` em `institutional_partners`.

## Texto simples para termo de parceiros (rascunho — revisar com advogado)

> O parceiro que quiser receber por reservas ligadas à plataforma deve concluir o **Stripe Connect**. Quem pede dados e aprova a conta de pagamento nessa parte é a **Stripe**.
>
> No painel do Descubra MS podem aparecer **lista e resumo** de transações, comissões e repasses, só para **acompanhar** o negócio. Isso **não vale como extrato oficial** e pode não ser igual ao saldo em tempo real no Stripe.
>
> **Conta no Stripe, saldo, sacar para o banco, bloqueios, estornos e suporte desse fluxo** são da **Stripe**. A plataforma **não substitui** a Stripe nisso e **não responde** por esses pontos.

Ajuste tom e detalhes legais com advogado.

## Políticas publicadas no CMS (admin)

As páginas públicas **Termos de Uso** e **Política de Privacidade** (MS) podem carregar conteúdo **publicado na base** (`policyService`). O repositório também mantém **texto fallback** em `src/pages/ms/TermosUsoMS.tsx` e `PrivacidadeMS.tsx` quando não há política publicada.

Se em produção estiver ativo o conteúdo do banco, **replique** os mesmos trechos na política editada no admin para os utilizadores verem a versão atualizada.

## Admin: mostrar status Stripe?

- **Não é obrigatório** tecnicamente.
- **É útil** para suporte interno (ver rapidamente se o parceiro concluiu Connect sem abrir Stripe ou Supabase).
- **Alternativa:** consultar sempre `institutional_partners` ou o Stripe Connect Dashboard.
