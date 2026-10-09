# Correções do painel do parceiro e do Passaporte

## 1. Cartões repetidos nos vouchers
Tirar os 4 cartões (Emitidos, Usados, Válidos, Taxa de Uso) de dentro da aba "Vouchers Emitidos", deixando só os do topo.

## 2. Erro ao anexar imagens dos produtos/logo
Ajustar a regra de permissão das imagens dos parceiros para reconhecer o dono pelo usuário que criou o cadastro **ou** pelo e-mail de contato do parceiro igual ao e-mail logado; administradores também podem enviar. Depois, testar o envio.

## 3. Aviso sobre recebimento e saques (Stripe)
Card na área financeira do parceiro: "O dinheiro das reservas vai direto para sua conta bancária pela Stripe. Saldo, extratos e dados bancários ficam no seu painel Stripe", com botão para abrir o painel Stripe.

## 4. Roteiro livre ou em ordem
- No cadastro de cada roteiro no ADM: seletor "Ordem livre (recomendado)" ou "Em sequência".
- Ordem livre: turista carimba os pontos em qualquer ordem; a ordem do ADM aparece como "sugestão de percurso".
- Em sequência: só libera o próximo ponto depois do anterior.
- Padrão para roteiros existentes: ordem livre.

## Detalhes técnicos
- `VoucherList.tsx`: remover bloco de estatísticas.
- Migração: recriar policies de `storage.objects` do bucket `partner-images` usando função security-definer que checa `created_by = auth.uid()` ou `lower(contact_email) = lower(auth.jwt()->>'email')`, ou `is_admin_user`.
- Novo componente `StripePayoutInfoCard.tsx` no painel financeiro do parceiro.
- Migração: coluna `routes.checkpoint_order_mode text default 'free'` ('free' | 'sequential'); seletor no editor de roteiro do admin; validação de check-in respeita o modo (no servidor quando sequencial).
