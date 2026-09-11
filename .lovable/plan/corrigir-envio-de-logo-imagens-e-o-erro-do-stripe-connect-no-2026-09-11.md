# Corrigir envio de logo/imagens e o erro do Stripe Connect nos parceiros

## 1. Aviso "Bucket de imagens não encontrado"

O que verifiquei no banco:

- Os depósitos de imagem existem: `tourism-images`, `partner-images`, `event-images`, `documents`, `guata-cartilhas`.
- O depósito `site-assets`, usado pela tela de rodapé, **não existe**.
- A tabela interna que lista os depósitos está com proteção ligada e **sem nenhuma regra de leitura**. Sem essa permissão, o serviço de arquivos responde "depósito não encontrado" mesmo quando ele existe — é exatamente o aviso da imagem.

Correções:

1. Criar a regra de leitura da lista de depósitos para pessoas conectadas (e leitura pública 

1. apenas dos depósitos já públicos). Isso destrava os envios de imagem em todas as telas.
2. Criar o depósito `site-assets` (público, só imagens, até 10 MB) para a tela de rodapé.
3. Ajustar as telas de envio para mostrar o motivo real da falha em vez de um aviso genérico, e só sugerir "usar uma URL" quando o problema for realmente ausência de depósito.
4. Confirmar que o logo enviado no cadastro/edição do parceiro fica na pasta com o identificador do parceiro, que é o formato aceito pelas regras de permissão atuais.

## 2. Erro ao conectar o Stripe Connect

O que já está confirmado:

- A função `stripe-connect-onboarding` está publicada, responde às chamadas do navegador (liberação de domínio ok) e a chave do Stripe **está** configurada no Supabase (a função não reclama de chave ausente).
- O domínio da Lovable, `descubrams.com`, `guatalabs.com`, `viajartur.com`, Vercel e localhost já são aceitos como endereço de retorno.
- Não há registro de execução recente da função, então a mensagem exata do erro ainda não foi capturada. **A causa ainda não está confirmada** — não vou afirmar um culpado sem prova.

Plano:

1. Fazer a tela mostrar e registrar a mensagem real devolvida pelo Stripe (hoje várias falhas viram o mesmo texto genérico), incluindo o código do erro.
2. Reproduzir a conexão com um parceiro de teste e ler o registro da função para identificar a causa exata. As hipóteses mais prováveis, todas visíveis nesse registro:
  - o recurso de repasse a terceiros (Connect) não estar ativado na conta Stripe em modo produção;
  - o cadastro do parceiro sem e-mail de contato ou com e-mail diferente do da conta de acesso;
  - sessão expirada no momento do clique.
3. Corrigir o ponto identificado. Se for configuração da conta Stripe, te digo exatamente onde clicar no painel do Stripe.

## 3. Avisos do Vercel sobre as chaves do Stripe

Confirmei no código: nem `STRIPE_SECRET_KEY` nem `STRIPE_WEBHOOK_SECRET` são usadas no site ou na publicação — só nas funções do Supabase. Ou seja, elas não deveriam existir no Vercel; é por isso que ele avisa que o valor está visível.

Passos (feitos por você no painel, não dá para automatizar):

1. No Stripe, gerar novos valores: **Developers → API keys** (rotacionar a chave secreta) e **Developers → Webhooks → Roll secret**.
2. Salvar os novos valores **somente** nos segredos das funções do Supabase (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`).
3. No Vercel, **remover** `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET` dos projetos `viajartur` e `descubra-ms`.

Importante: rotacionar a chave secreta antes de terminar o item 2 pode interromper pagamentos por alguns minutos, então o ideal é salvar no Supabase imediatamente depois de gerar.

## Detalhes técnicos

- Migração: `CREATE POLICY` de `SELECT` em `storage.buckets` (papéis `authenticated` e `anon` restrito a `public = true`); criação de `site-assets` via ferramenta de storage.
- Arquivos: `src/components/admin/platform/LogoEditor.tsx`, `src/components/admin/FooterSettingsManager.tsx` (mensagens reais de erro), `src/components/partners/PartnerBusinessEditor.tsx` e `src/components/partners/PartnerApplicationForm.tsx` (propagar erro do upload).
- Stripe: `src/utils/invokeStripeConnectOnboarding.ts` e `src/components/partners/StripeConnectStep.tsx` para exibir `error` + `code`; leitura de `supabase functions logs stripe-connect-onboarding` após a reprodução.

## Validação

- Enviar um logo no admin e no editor do parceiro e confirmar que a imagem salva e aparece.
- Clicar em "Conectar Stripe" e confirmar o redirecionamento ao Stripe ou, na falha, uma mensagem que diz o motivo.
- Conferir `institutional_partners` gravando `stripe_account_id`.