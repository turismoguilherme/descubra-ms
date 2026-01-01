# 💳 Configuração do Payment Link - Roteiros IA

## 📋 **INSTRUÇÕES PARA CONFIGURAR O REDIRECT**

### **1. No Dashboard do Stripe:**

1. Acesse: https://dashboard.stripe.com/test/payment-links
2. Encontre o Payment Link: `https://buy.stripe.com/test_28EaEZctqgkd7gw02n43S01`
3. Clique em **"Editar"** (ou "Edit")

### **2. Configurar URL de Sucesso:**

Na seção **"After payment"** ou **"Após o pagamento"**, configure:

**URL de Sucesso (Success URL):**
```
https://seu-dominio.com/descubramatogrossodosul/roteiros-ia/success?session_id={CHECKOUT_SESSION_ID}
```

**URL de Cancelamento (Cancel URL):**
```
https://seu-dominio.com/descubramatogrossodosul/profile?tab=roteiros-ia&payment=cancelled
```

### **3. Adicionar Metadata (Opcional mas Recomendado):**

Na seção **"Metadata"** ou **"Metadados"**, adicione:

```json
{
  "type": "ia_route_access",
  "product_name": "Roteiros por IA - Descubra MS"
}
```

Isso ajuda o webhook a identificar corretamente o tipo de pagamento.

---

## 🔄 **FLUXO COMPLETO**

```
1. Usuário clica em "Ativar Acesso Premium" no perfil
   ↓
2. Redireciona para: https://buy.stripe.com/test_28EaEZctqgkd7gw02n43S01
   ↓
3. Usuário faz pagamento no Stripe
   ↓
4. Stripe redireciona para: /descubramatogrossodosul/roteiros-ia/success?session_id=xxx
   ↓
5. Webhook recebe evento checkout.session.completed
   ↓
6. Handler detecta tipo "ia_route_access" ou valor ~R$ 49
   ↓
7. Marca user_metadata.ia_route_paid = true
   ↓
8. Usuário pode gerar roteiros IA
```

---

## 🛠️ **HANDLER DO WEBHOOK**

O handler `handleIARoutePaymentCompleted` faz:

1. ✅ Identifica usuário por email ou metadata
2. ✅ Atualiza `user_metadata.ia_route_paid = true`
3. ✅ Registra pagamento em `user_feature_payments` (se existir)
4. ✅ Loga para debug

**Arquivo:** `supabase/functions/stripe-webhook-handler/index.ts`

---

## 📝 **PÁGINA DE SUCESSO**

**Rota:** `/descubramatogrossodosul/roteiros-ia/success`

**Arquivo:** `src/pages/IARoutePaymentSuccess.tsx`

**Funcionalidades:**
- ✅ Verifica se pagamento foi processado
- ✅ Mostra mensagem de sucesso
- ✅ Botão para ir direto gerar roteiro
- ✅ Atualiza acesso do usuário

---

## ⚠️ **IMPORTANTE**

### **Para Ambiente de Produção:**

1. Substitua `test_` por link de produção
2. Atualize URL de sucesso com domínio real
3. Configure webhook no Stripe Dashboard:
   - URL: `https://seu-projeto.supabase.co/functions/v1/stripe-webhook-handler`
   - Eventos: `checkout.session.completed`

### **Testando:**

1. Use cartão de teste: `4242 4242 4242 4242`
2. Qualquer data futura para expiração
3. Qualquer CVC
4. Verifique logs do webhook no Supabase

---

## 🔍 **DEBUG**

Se o acesso não for ativado:

1. Verifique logs do webhook: `supabase functions logs stripe-webhook-handler`
2. Verifique se metadata está sendo passada
3. Verifique se email do usuário corresponde ao do pagamento
4. Verifique `user_metadata` do usuário após pagamento

---

**✅ Configuração completa!**



















