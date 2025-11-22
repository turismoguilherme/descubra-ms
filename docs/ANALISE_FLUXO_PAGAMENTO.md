# 🔍 Análise Completa do Fluxo de Pagamento

## 📋 **FLUXO ATUAL IMPLEMENTADO**

### **1. Onboarding Steps (ViaJAROnboarding.tsx)**
```
Step 1: Diagnóstico Inteligente / CADASTUR
Step 2: Seleção de Plano
Step 3: (NÃO USADO - mas referenciado no cancelUrl)
Step 4: Pagamento (StripeCheckout)
Step 5: Termo de Consentimento (OBRIGATÓRIO)
Step 6: Completar Perfil
Step 7: Sucesso / Finalização
```

### **2. Fluxo de Pagamento Detalhado**

#### **A. Seleção de Plano (Step 2)**
- ✅ Componente: `PlanSelector`
- ✅ Planos: Freemium, Professional, Enterprise, Government
- ✅ Períodos: Mensal ou Anual
- ✅ Ação: `handlePlanSelected` → vai para Step 4

#### **B. Checkout/Pagamento (Step 4)**
- ✅ Componente: `StripeCheckout`
- ✅ Métodos disponíveis:
  - 💳 Cartão de Crédito
  - 📱 PIX
  - 🧾 Boleto
- ✅ Ação: Chama Edge Function `stripe-create-checkout`
- ✅ Redireciona para Stripe Checkout
- ✅ URL de sucesso: `/viajar/onboarding/success?session_id={CHECKOUT_SESSION_ID}`
- ⚠️ URL de cancelamento: `/viajar/onboarding?step=3` (Step 3 não existe!)

#### **C. Página de Sucesso (PaymentSuccess.tsx)**
- ✅ Verifica `session_id` na URL
- ✅ Verifica assinatura no banco
- ✅ Redireciona para: `/viajar/onboarding?step=5` (Termo de Consentimento)
- ⚠️ **PROBLEMA**: ViaJAROnboarding não lê parâmetro `step` da URL!

#### **D. Termo de Consentimento (Step 5)**
- ✅ Componente: `ConsentTerm`
- ✅ Obrigatório para todos
- ✅ Aviso sobre plataforma nova
- ✅ Ação: `handleConsentComplete` → vai para Step 6

#### **E. Completar Perfil (Step 6)**
- ✅ Componente: `ProfileCompletion`
- ✅ Ação: `handleProfileComplete` → vai para Step 7

#### **F. Finalização (Step 7)**
- ✅ Tela de sucesso
- ✅ Redireciona para `/viajar/dashboard`

---

## ⚠️ **PROBLEMAS IDENTIFICADOS**

### **1. Step 3 Não Existe**
**Localização:** `StripeCheckout.tsx:95`
```typescript
cancelUrl: `${window.location.origin}/viajar/onboarding?step=3`,
```
**Problema:** Step 3 não está definido no array `steps` do ViaJAROnboarding
**Solução:** Mudar para `step=2` (voltar para seleção de plano)

### **2. ViaJAROnboarding Não Lê Parâmetro `step` da URL**
**Localização:** `ViaJAROnboarding.tsx`
**Problema:** Quando `PaymentSuccess` redireciona para `/viajar/onboarding?step=5`, o componente não lê esse parâmetro
**Solução:** Adicionar lógica para ler `step` da URL e definir `currentStep`

### **3. PIX e Boleto Não Estão Corretamente Configurados**
**Localização:** `stripe-create-checkout/index.ts:154-172`
**Problema:** 
- PIX e Boleto estão configurados como `paymentMethodTypes: ['card']`
- Não há configuração específica para PIX/Boleto no Stripe Brasil
**Solução:** 
- Para PIX: Usar `payment_method_types: ['link']` ou configurar via `payment_method_options`
- Para Boleto: Configurar via `payment_method_options` com `boleto`

### **4. Falta Validação de Assinatura no PaymentSuccess**
**Localização:** `PaymentSuccess.tsx:44-59`
**Problema:** A verificação de assinatura é muito permissiva - considera sucesso mesmo sem assinatura no banco
**Solução:** Adicionar retry ou polling para aguardar webhook processar

### **5. Step 1 e Step 2 Estão Invertidos**
**Localização:** `ViaJAROnboarding.tsx:46-61`
**Problema:** 
- Step 1 é "Diagnóstico Inteligente" mas renderiza `CadastURVerification`
- Step 2 é "Verificação CADASTUR" mas renderiza `PlanSelector`
**Solução:** Corrigir ordem ou títulos

---

## 🔧 **CORREÇÕES NECESSÁRIAS**

### **1. Corrigir cancelUrl no StripeCheckout**
```typescript
cancelUrl: `${window.location.origin}/viajar/onboarding?step=2`,
```

### **2. Adicionar leitura de parâmetro `step` no ViaJAROnboarding**
```typescript
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const stepParam = params.get('step');
  if (stepParam) {
    const step = parseInt(stepParam, 10);
    if (step >= 1 && step <= steps.length) {
      setCurrentStep(step);
    }
  }
}, []);
```

### **3. Corrigir configuração de PIX e Boleto no Stripe**
```typescript
case 'pix':
  paymentMethodTypes = ['link']; // PIX no Stripe Brasil
  break;
case 'boleto':
  paymentMethodTypes = ['card'];
  paymentMethodOptions = {
    boleto: {
      expires_after_days: 3,
    },
  };
  break;
```

### **4. Melhorar verificação de pagamento**
- Adicionar polling para aguardar webhook
- Mostrar mensagem mais clara se pagamento ainda está processando

### **5. Corrigir ordem dos steps**
- Ajustar títulos ou ordem dos componentes

---

## ✅ **O QUE ESTÁ FUNCIONANDO**

1. ✅ Estrutura básica do fluxo
2. ✅ Integração com Stripe (Edge Functions)
3. ✅ Webhook handler processando eventos
4. ✅ Termo de consentimento obrigatório após pagamento
5. ✅ Redirecionamento para termo após pagamento
6. ✅ Termo acessível nas configurações

---

## 📝 **PRÓXIMOS PASSOS**

1. Corrigir cancelUrl
2. Adicionar leitura de parâmetro `step` na URL
3. Corrigir configuração de PIX/Boleto
4. Melhorar verificação de pagamento
5. Testar fluxo completo end-to-end

