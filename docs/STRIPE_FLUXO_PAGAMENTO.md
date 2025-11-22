# 💳 Fluxo Completo de Pagamento com Stripe

## 📋 **FLUXO DO USUÁRIO**

### **1. Seleção de Plano** 
- Usuário escolhe plano (Freemium, Professional, Enterprise, Government)
- Escolhe período (Mensal ou Anual)
- Clica em "Selecionar Plano"

### **2. Checkout/Pagamento**
- Se for **Freemium**: Pula direto para completar perfil
- Se for **pago**: Vai para tela de checkout
- Usuário escolhe método de pagamento:
  - 💳 **Cartão de Crédito** (até 12x)
  - 📱 **PIX** (pagamento instantâneo)
  - 🧾 **Boleto** (vence em 3 dias)

### **3. Processamento do Pagamento**

#### **Cartão de Crédito:**
- Stripe Checkout (redirecionamento seguro)
- Usuário preenche dados do cartão
- Pagamento processado instantaneamente
- Redirecionado de volta para o app

#### **PIX:**
- Gera QR Code e código PIX
- Usuário paga no app do banco
- Stripe detecta pagamento (até 2 minutos)
- Webhook confirma pagamento

#### **Boleto:**
- Gera boleto para impressão/download
- Vence em 3 dias úteis
- Usuário paga no banco/caixa eletrônico
- Stripe detecta pagamento (até 2 dias após vencimento)
- Webhook confirma pagamento

### **4. Após Pagamento Bem-Sucedido**

1. **Webhook do Stripe** recebe evento `checkout.session.completed`
2. **Edge Function** processa:
   - Cria/atualiza cliente no Stripe
   - Cria assinatura no Stripe
   - Salva no banco (`master_clients` e `subscriptions`)
   - Ativa acesso do usuário
3. **Usuário é redirecionado** para:
   - Página de sucesso
   - Depois para completar perfil
   - Finalmente para o dashboard

### **5. Período de Teste (14 dias)**
- Todos os planos pagos têm 14 dias grátis
- Stripe cria assinatura com trial period
- Após 14 dias, primeira cobrança automática
- Usuário pode cancelar antes sem pagar nada

### **6. Renovação Automática**
- Stripe cobra automaticamente no vencimento
- Webhook `invoice.payment_succeeded` renova acesso
- Webhook `invoice.payment_failed` marca como inadimplente

---

## 🔧 **IMPLEMENTAÇÃO TÉCNICA**

### **Edge Functions Necessárias:**

1. **`stripe-create-checkout`** - Cria sessão de checkout
2. **`stripe-webhook-handler`** - Processa eventos do Stripe (já existe, precisa atualizar)

### **Componentes Frontend:**

1. **`StripeCheckout`** - Componente de checkout com seleção de método
2. **`PaymentSuccess`** - Página de sucesso após pagamento
3. **Atualizar `ViaJAROnboarding`** - Integrar checkout no fluxo

### **Variáveis de Ambiente Necessárias:**

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 📊 **ESTRUTURA DE DADOS**

### **Tabela `master_clients`:**
- `stripe_customer_id` - ID do cliente no Stripe
- `stripe_subscription_id` - ID da assinatura no Stripe
- `status` - active, overdue, cancelled
- `subscription_plan` - plano atual
- `monthly_fee` - valor mensal

### **Tabela `master_financial_records`:**
- `stripe_invoice_id` - ID da fatura no Stripe
- `stripe_subscription_id` - ID da assinatura
- `amount` - valor pago
- `status` - paid, failed, pending
- `record_type` - revenue

---

## 🎯 **MÉTODOS DE PAGAMENTO SUPORTADOS**

### **Cartão de Crédito:**
- ✅ Visa, Mastercard, Elo, Amex
- ✅ Parcelamento até 12x
- ✅ 3D Secure (autenticação)
- ✅ Processamento instantâneo

### **PIX:**
- ✅ Pagamento instantâneo
- ✅ QR Code e código copia-e-cola
- ✅ Confirmação automática (até 2 min)
- ✅ Disponível 24/7

### **Boleto:**
- ✅ Vencimento em 3 dias úteis
- ✅ Código de barras para pagamento
- ✅ Confirmação em até 2 dias após vencimento
- ✅ Aceito em qualquer banco

---

## 🔄 **FLUXO DE WEBHOOKS**

### **Eventos Processados:**

1. **`checkout.session.completed`**
   - Pagamento confirmado
   - Cria assinatura
   - Ativa acesso

2. **`customer.subscription.created`**
   - Assinatura criada
   - Atualiza `master_clients`

3. **`invoice.payment_succeeded`**
   - Pagamento bem-sucedido
   - Registra em `master_financial_records`
   - Renova acesso

4. **`invoice.payment_failed`**
   - Falha no pagamento
   - Marca como `overdue`
   - Envia notificação

5. **`customer.subscription.updated`**
   - Plano alterado
   - Atualiza dados

6. **`customer.subscription.deleted`**
   - Assinatura cancelada
   - Marca como `cancelled`

---

## ✅ **PRÓXIMOS PASSOS**

1. ✅ Criar Edge Function `stripe-create-checkout`
2. ✅ Atualizar webhook handler (remover mock)
3. ✅ Criar componente `StripeCheckout`
4. ✅ Integrar no onboarding
5. ✅ Criar página de sucesso
6. ✅ Testar fluxo completo


