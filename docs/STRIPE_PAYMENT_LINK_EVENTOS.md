# 💳 Configuração de Payment Links do Stripe para Eventos

## 📋 **VISÃO GERAL**

Este documento explica como configurar e usar Payment Links do Stripe para pagamento de eventos em destaque no Descubra MS.

---

## 🔧 **CONFIGURAÇÃO NO STRIPE DASHBOARD**

### **1. Criar Payment Link**

1. Acesse: https://dashboard.stripe.com/test/payment-links (teste) ou https://dashboard.stripe.com/payment-links (produção)
2. Clique em **"Criar Payment Link"** ou **"Create Payment Link"**
3. Configure:
   - **Produto/Valor**: Defina o valor (ex: R$ 499,90)
   - **Descrição**: "Evento em Destaque - Descubra MS"
   - **Moeda**: BRL (Real Brasileiro)

### **2. Configurar Client Reference ID**

**IMPORTANTE:** O Payment Link precisa identificar qual evento está sendo pago.

#### **Opção A: Via Metadata (Recomendado)**

1. No Payment Link, vá em **"Configurações avançadas"** ou **"Advanced settings"**
2. Adicione em **"Metadata"**:
   ```json
   {
     "type": "event_payment",
     "event_id": "{EVENT_ID}"
   }
   ```

#### **Opção B: Via URL Parameters**

Ao usar o link, adicione o parâmetro `client_reference_id`:
```
https://buy.stripe.com/test_...?client_reference_id={EVENT_ID}
```

O sistema automaticamente adiciona este parâmetro quando o organizador clica no link.

### **3. URLs de Redirecionamento**

**IMPORTANTE:** Configure no Payment Link do Stripe Dashboard:

**URL de Sucesso (Success URL):**
```
https://descubrams.com/eventos/payment-return?session_id={CHECKOUT_SESSION_ID}
```

**URL de Cancelamento (Cancel URL):**
```
https://descubrams.com/descubrams/cadastrar-evento?payment=cancelled
```

**Nota:** 
- O Stripe substitui `{CHECKOUT_SESSION_ID}` automaticamente
- A página intermediária (`/eventos/payment-return`) detecta automaticamente o domínio de origem e redireciona para o domínio correto
- Funciona para ambos os domínios: `descubrams.com` e `viajartur.com`
- Você precisa configurar apenas **UM ÚNICO Payment Link** no Stripe

---

## 🔄 **FLUXO COMPLETO**

### **1. Admin Configura o Link**

1. Admin acessa `/admin/events` ou `/events-management`
2. Seleciona um evento
3. Na seção "Configuração de Pagamento", insere o Payment Link URL
4. Salva o link

### **2. Organizador Cadastra Evento**

1. Organizador acessa `/descubrams/cadastrar-evento`
2. Preenche o formulário
3. Seleciona "Evento em Destaque" (R$ 499,90)
4. Submete o formulário

### **3. Sistema Processa Pagamento**

**Se houver link configurado:**
- Sistema salva o domínio de origem (`return_domain`) no evento
- Sistema usa o link configurado
- Adiciona `client_reference_id={EVENT_ID}` automaticamente
- Redireciona para Stripe

**Se não houver link:**
- Sistema salva o domínio de origem (`return_domain`) no evento
- Sistema cria checkout dinâmico via `event-checkout` Edge Function
- Redireciona para Stripe Checkout

### **3.1. Redirecionamento Após Pagamento**

Após o pagamento no Stripe:

1. **Stripe redireciona** para: `descubrams.com/eventos/payment-return?session_id=xxx`
2. **Página intermediária** (`EventPaymentReturn.tsx`):
   - Busca informações da sessão do Stripe via Edge Function
   - Extrai `client_reference_id` (event_id) da sessão
   - Busca `return_domain` do evento no banco de dados
   - Redireciona para: `${return_domain}/descubrams/eventos/payment-success?session_id=xxx`
3. **Página de sucesso** (`EventPaymentSuccess.tsx`):
   - Verifica status do pagamento
   - Mostra confirmação ao usuário
   - Exibe informações do evento

### **4. Webhook Processa Pagamento**

Quando o pagamento é confirmado:

1. **Stripe envia webhook** `checkout.session.completed`
2. **Edge Function** `stripe-webhook-handler` recebe o evento
3. **Handler** `handlePaymentLinkEventCompleted` processa:
   - Identifica evento via `client_reference_id`
   - Atualiza evento:
     - `is_sponsored = true`
     - `is_visible = true`
     - `sponsor_payment_status = 'paid'`
     - `approval_status = 'approved'`
   - Registra pagamento em `master_financial_records`
   - Envia email de confirmação

### **5. Evento Aparece como Pago**

- No admin: Badge "Pago" (verde)
- No painel financeiro: Registro em `master_financial_records`
- Evento fica visível e em destaque por 30 dias

---

## 🛠️ **HANDLER DO WEBHOOK**

O handler `handlePaymentLinkEventCompleted` em `supabase/functions/stripe-webhook-handler/index.ts`:

```typescript
// Identifica evento via client_reference_id
const eventId = session.client_reference_id;

// Atualiza evento
await supabase
  .from('events')
  .update({
    is_sponsored: true,
    is_visible: true,
    sponsor_tier: 'destaque',
    sponsor_payment_status: 'paid',
    sponsor_start_date: new Date().toISOString().split('T')[0],
    sponsor_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  })
  .eq('id', eventId);
```

**Arquivo:** `supabase/functions/stripe-webhook-handler/index.ts` (linha 281)

---

## 📝 **CONFIGURAÇÃO POR EVENTO**

### **No Admin:**

1. Acesse `/admin/events` ou `/events-management`
2. Clique em um evento
3. Na seção "Configuração de Pagamento":
   - Insira o Payment Link URL
   - Formato: `https://buy.stripe.com/test_...` ou `https://buy.stripe.com/...`
   - Clique em "Salvar Link de Pagamento"

### **Validação:**

- Link deve começar com `https://buy.stripe.com/` ou `https://checkout.stripe.com/`
- Sistema valida automaticamente o formato
- Link pode ser de teste (`test_`) ou produção

---

## ⚠️ **IMPORTANTE: Client Reference ID**

**CRÍTICO:** O Payment Link precisa receber o `client_reference_id` com o ID do evento.

### **Como Funciona:**

1. **No formulário:** Sistema adiciona `client_reference_id={EVENT_ID}` na URL
2. **No Stripe:** Payment Link recebe o ID do evento
3. **No webhook:** Sistema identifica o evento via `session.client_reference_id`

### **Se não configurar:**

- Webhook não consegue identificar qual evento foi pago
- Pagamento não é vinculado ao evento
- Evento não é marcado como pago

---

## 🔍 **TROUBLESHOOTING**

### **Problema: Pagamento não atualiza evento**

**Solução:**
1. Verificar se `client_reference_id` está sendo enviado
2. Verificar logs do webhook em `stripe-webhook-handler`
3. Verificar se Payment Link está configurado corretamente

### **Problema: Link não funciona**

**Solução:**
1. Verificar formato do link (deve começar com `https://buy.stripe.com/`)
2. Verificar se link não expirou
3. Verificar se está usando link de teste em ambiente de teste

### **Problema: Evento não aparece como pago no admin**

**Solução:**
1. Verificar se webhook foi processado (logs)
2. Verificar se `sponsor_payment_status = 'paid'` no banco
3. Recarregar página do admin

### **Problema: Redirecionamento não funciona (usuário não volta para domínio correto)**

**Solução:**
1. Verificar se `return_domain` foi salvo no evento (campo `return_domain` na tabela `events`)
2. Verificar se a URL de sucesso no Stripe está configurada como: `https://descubrams.com/eventos/payment-return?session_id={CHECKOUT_SESSION_ID}`
3. Verificar logs da página intermediária no console do navegador
4. **VERIFICAR SE `STRIPE_SECRET_KEY` ESTÁ CONFIGURADA** (veja seção abaixo)

### **Problema: Erro 500 na Edge Function `get-stripe-session`**

**Sintoma:** 
- Página de retorno mostra "Erro ao processar pagamento"
- Console mostra: "Edge Function returned a non-2xx status code"
- Logs mostram: "STRIPE_SECRET_KEY não configurada"

**Solução:**
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em: **Project Settings → Edge Functions → Secrets**
4. Adicione a variável:
   - **Nome:** `STRIPE_SECRET_KEY`
   - **Valor:** Sua chave secreta do Stripe (começa com `sk_test_` ou `sk_live_`)
5. **Onde obter a chave:**
   - Acesse: https://dashboard.stripe.com/test/apikeys (teste) ou https://dashboard.stripe.com/apikeys (produção)
   - Copie a **"Secret key"** (não a Publishable key)
6. Após adicionar, a Edge Function funcionará automaticamente

**Nota:** O pagamento JÁ funciona via webhook mesmo sem essa configuração. Esta chave é necessária apenas para a página de retorno funcionar corretamente.

---

## 📊 **VISUALIZAÇÃO NO ADMIN**

### **Lista de Eventos:**

- **Coluna "Pagamento":**
  - Badge "Pago" (verde) - `sponsor_payment_status = 'paid'`
  - Badge "Pendente" (amarelo) - `sponsor_payment_status = 'pending'`
  - Badge "Gratuito" (cinza) - sem pagamento
  - Botão "Copiar Link" - se houver link configurado

### **Detalhes do Evento:**

- **Seção "Configuração de Pagamento":**
  - Campo para inserir/editar Payment Link
  - Status do pagamento
  - Botões: Copiar, Testar, Salvar

### **Painel Financeiro:**

- **Tabela `master_financial_records`:**
  - Filtro por `source = 'event_sponsor'`
  - Mostra: Nome do evento, Organizador, Valor, Data

---

## 🔐 **SEGURANÇA**

1. **Validação de Link:** Sistema valida formato antes de salvar
2. **Webhook Signature:** Stripe valida assinatura do webhook
3. **Client Reference ID:** Garante que pagamento é vinculado ao evento correto

---

## 🌐 **SUPORTE A MÚLTIPLOS DOMÍNIOS**

O sistema suporta automaticamente múltiplos domínios (descubrams.com e viajartur.com):

- **Um único Payment Link** funciona para ambos os domínios
- O sistema detecta automaticamente o domínio de origem quando o evento é criado
- Após o pagamento, o usuário é redirecionado automaticamente para o domínio correto
- Não é necessário configurar links diferentes para cada domínio

### **Como Funciona:**

1. Quando o evento é criado, o sistema salva `return_domain = window.location.origin` no banco
2. Após o pagamento, a página intermediária busca o `return_domain` do evento
3. Redireciona o usuário para: `${return_domain}/descubrams/eventos/payment-success`

### **Arquivos Relacionados:**

- Página intermediária: `src/pages/ms/EventPaymentReturn.tsx`
- Página de sucesso: `src/pages/ms/EventPaymentSuccess.tsx`
- Edge Function: `supabase/functions/get-stripe-session/index.ts`
- Migration: `supabase/migrations/20250203000009_add_return_domain_to_events.sql`

---

## ⚙️ **CONFIGURAÇÃO NECESSÁRIA**

### **Variáveis de Ambiente no Supabase**

Para que a página de retorno funcione corretamente, você precisa configurar:

1. **STRIPE_SECRET_KEY** (OBRIGATÓRIO para página de retorno)
   - Acesse: Supabase Dashboard → Project Settings → Edge Functions → Secrets
   - Adicione: `STRIPE_SECRET_KEY` = sua chave secreta do Stripe
   - Onde obter: https://dashboard.stripe.com/test/apikeys

**Importante:**
- O **pagamento funciona** mesmo sem essa configuração (via webhook)
- A chave é necessária apenas para a **página de retorno** funcionar
- Sem a chave, o usuário verá erro na página de retorno, mas o pagamento será processado normalmente

### **Outras Variáveis (Opcionais)**

- `STRIPE_PUBLISHABLE_KEY` - Usado em alguns componentes (não crítico)
- `STRIPE_WEBHOOK_SECRET` - Já deve estar configurado para o webhook funcionar

Veja mais detalhes em: `docs/STRIPE_CONFIGURACAO.md`

---

## 📚 **REFERÊNCIAS**

- [Stripe Payment Links Documentation](https://stripe.com/docs/payment-links)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Configuração Completa do Stripe](docs/STRIPE_CONFIGURACAO.md)
- Handler: `supabase/functions/stripe-webhook-handler/index.ts`
- Componente Admin: `src/components/admin/EventPaymentConfig.tsx`
- Edge Function: `supabase/functions/get-stripe-session/index.ts`

