# 🔧 Configuração do Stripe

## 📋 **VARIÁVEIS DE AMBIENTE NECESSÁRIAS**

Configure as seguintes variáveis de ambiente no Supabase:

### **No Supabase Dashboard:**

1. Acesse: **Project Settings > Edge Functions > Secrets**
2. Adicione as seguintes variáveis:

```env
STRIPE_SECRET_KEY=sk_test_... (ou sk_live_... para produção)
STRIPE_PUBLISHABLE_KEY=pk_test_... (ou pk_live_... para produção)
STRIPE_WEBHOOK_SECRET=whsec_...
```

### **Como Obter as Chaves:**

1. **Acesse o Stripe Dashboard**: https://dashboard.stripe.com
2. **Chaves de API**:
   - Vá em **Developers > API keys**
   - Copie a **Secret key** (começa com `sk_test_` ou `sk_live_`)
   - Copie a **Publishable key** (começa com `pk_test_` ou `pk_live_`)

3. **Webhook Secret**:
   - Vá em **Developers > Webhooks**
   - Clique em **Add endpoint**
   - URL: `https://[seu-projeto].supabase.co/functions/v1/stripe-webhook-handler`
   - Selecione os eventos:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Copie o **Signing secret** (começa com `whsec_`)

---

## 🇧🇷 **CONFIGURAÇÃO PARA BRASIL (PIX e Boleto)**

### **1. Habilitar PIX e Boleto na Conta Stripe:**

1. Acesse: **Settings > Payment methods**
2. Ative **PIX** e **Boleto** (se disponível na sua região)
3. Complete a verificação da conta (KYC) se necessário

### **2. Configurar Métodos de Pagamento:**

O Stripe Checkout automaticamente oferece PIX e Boleto como opções quando:
- A conta está configurada para Brasil
- Os métodos estão habilitados
- O cliente está no Brasil

### **3. Testar Pagamentos:**

**Cartão de Teste:**
- Número: `4242 4242 4242 4242`
- CVV: Qualquer 3 dígitos
- Data: Qualquer data futura

**PIX de Teste:**
- Use o modo de teste do Stripe
- O QR Code será gerado automaticamente

**Boleto de Teste:**
- Use o modo de teste do Stripe
- O boleto será gerado automaticamente

---

## 🚀 **DEPLOY DAS EDGE FUNCTIONS**

### **1. Deploy da função de checkout:**

```bash
supabase functions deploy stripe-create-checkout
```

### **2. Deploy do webhook handler:**

```bash
supabase functions deploy stripe-webhook-handler
```

### **3. Verificar logs:**

```bash
supabase functions logs stripe-create-checkout
supabase functions logs stripe-webhook-handler
```

---

## ✅ **CHECKLIST DE CONFIGURAÇÃO**

- [ ] Conta Stripe criada e verificada
- [ ] Chaves de API obtidas (teste e produção)
- [ ] Webhook endpoint configurado no Stripe
- [ ] Variáveis de ambiente configuradas no Supabase
- [ ] Edge Functions deployadas
- [ ] PIX e Boleto habilitados (se aplicável)
- [ ] Testes realizados com cartões de teste
- [ ] Webhook recebendo eventos corretamente

---

## 🔍 **TROUBLESHOOTING**

### **Erro: "STRIPE_SECRET_KEY não configurado"**
- Verifique se a variável está configurada no Supabase
- Certifique-se de usar o nome exato: `STRIPE_SECRET_KEY`

### **Erro: "Webhook signature verification failed"**
- Verifique se o `STRIPE_WEBHOOK_SECRET` está correto
- Certifique-se de usar o secret do endpoint correto

### **PIX/Boleto não aparecem no checkout**
- Verifique se estão habilitados na conta Stripe
- Certifique-se de que a conta está configurada para Brasil
- Verifique se o modo de teste suporta esses métodos

### **Webhook não está recebendo eventos**
- Verifique a URL do webhook no Stripe Dashboard
- Certifique-se de que o endpoint está deployado
- Verifique os logs da Edge Function

---

## 📚 **RECURSOS ÚTEIS**

- [Documentação Stripe Brasil](https://stripe.com/docs/payments/payment-methods/overview)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Webhooks do Stripe](https://stripe.com/docs/webhooks)
- [Testando Webhooks](https://stripe.com/docs/webhooks/test)


