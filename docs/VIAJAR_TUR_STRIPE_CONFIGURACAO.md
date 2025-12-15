# ⚙️ Configuração Stripe ViaJAR Tur - SEM Plano Grátis

## ✅ **O QUE JÁ FOI CONFIGURADO**

### **1. Edge Function `stripe-create-checkout`**
- ✅ Removido período de teste (14 dias grátis)
- ✅ Todos os planos são pagos imediatamente
- ✅ Adicionado metadata `platform: 'viajar_tur'` para identificar pagamentos

### **2. Documentação Admin**
- ✅ Criado guia completo: `docs/VIAJAR_TUR_STRIPE_ADMIN.md`
- ✅ Explica como dar baixa em pagamentos
- ✅ Explica gestão de receitas e assinaturas

---

## 🔧 **O QUE AINDA PRECISA SER FEITO**

### **1. Remover Plano Freemium do PlanSelector (Opcional)**

**Arquivo:** `src/components/onboarding/PlanSelector.tsx`

**Mudança necessária:**
```typescript
// Linha 25 - Filtrar freemium se for ViaJAR Tur
const planOrder: PlanTier[] = ['professional', 'enterprise', 'government'];
// Remover 'freemium' da lista
```

**OU** criar uma prop para controlar:
```typescript
interface PlanSelectorProps {
  hideFreemium?: boolean; // Nova prop
  // ... outras props
}

// No componente:
const planOrder: PlanTier[] = hideFreemium 
  ? ['professional', 'enterprise', 'government']
  : ['freemium', 'professional', 'enterprise', 'government'];
```

### **2. Atualizar Textos no PlanSelector**

**Arquivo:** `src/components/onboarding/PlanSelector.tsx`

**Mudanças:**
- Linha 33: Remover "Todos os planos incluem 14 dias de teste grátis"
- Linha 199: Remover "14 dias grátis, cancele quando quiser"
- Linha 292-296: Atualizar FAQ sobre teste grátis

### **3. Configurar Valores dos Planos**

**Arquivo:** `supabase/functions/stripe-create-checkout/index.ts`

**Linhas 73-78:** Atualizar valores conforme necessário:
```typescript
const planPrices: Record<string, { monthly: number; annual: number }> = {
  freemium: { monthly: 0, annual: 0 }, // Pode manter ou remover
  professional: { monthly: 19900, annual: 191200 }, // R$ 199/mês ou R$ 1912/ano
  enterprise: { monthly: 49900, annual: 479200 }, // R$ 499/mês ou R$ 4792/ano
  government: { monthly: 200000, annual: 1920000 }, // R$ 2000/mês ou R$ 19200/ano
};
```

**Valores estão em centavos!** (19900 = R$ 199,00)

---

## 📋 **PRÓXIMOS PASSOS PARA ATIVAR**

### **1. Configurar Variáveis no Supabase**

No Supabase Dashboard:
- Project Settings → Edge Functions → Secrets
- Adicione:
  ```
  STRIPE_SECRET_KEY=sk_test_... (ou sk_live_...)
  STRIPE_PUBLISHABLE_KEY=pk_test_... (ou pk_live_...)
  STRIPE_WEBHOOK_SECRET=whsec_...
  ```

### **2. Configurar Webhook no Stripe**

No Stripe Dashboard:
- Developers → Webhooks → Add endpoint
- URL: `https://[seu-projeto].supabase.co/functions/v1/stripe-webhook-handler`
- Eventos:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
- Copie o **Signing secret** (whsec_...)

### **3. Deploy da Edge Function**

```bash
supabase functions deploy stripe-create-checkout
supabase functions deploy stripe-webhook-handler
```

### **4. Testar**

1. Use cartão de teste: `4242 4242 4242 4242`
2. Complete o onboarding
3. Verifique se o pagamento aparece em `/admin/viajar/financial/payments`
4. Dê baixa no pagamento
5. Verifique se aparece em `/admin/viajar/financial/revenue`

---

## 🎯 **COMO FUNCIONA NO ADMIN**

### **Fluxo Completo:**

1. **Cliente paga** → Stripe processa
2. **Webhook recebe** → Edge Function salva no banco
3. **Admin vê** → `/admin/viajar/financial/payments`
4. **Admin dá baixa** → Clica "Dar Baixa" → Marca como reconciliado
5. **Aparece nas receitas** → `/admin/viajar/financial/revenue`

### **Onde gerenciar:**

- **Pagamentos:** `/admin/viajar/financial/payments`
- **Receitas:** `/admin/viajar/financial/revenue`
- **Assinaturas:** `/admin/viajar/subscriptions`
- **Reconciliação:** `/admin/viajar/financial/reconciliation`

---

## 📝 **NOTAS IMPORTANTES**

1. **Sem período de teste:** Todos os planos são cobrados imediatamente
2. **Valores configuráveis:** Você pode alterar os valores depois editando a Edge Function
3. **Plano Freemium:** Ainda existe no código, mas pode ser removido ou ocultado
4. **Identificação:** Pagamentos têm `platform: 'viajar_tur'` no metadata para diferenciar

---

## ❓ **DÚVIDAS?**

Consulte `docs/VIAJAR_TUR_STRIPE_ADMIN.md` para entender como usar o sistema de gestão no admin.

