# 💳 Como Funciona a Gestão de Pagamentos no Admin - ViaJAR Tur

## 📋 **VISÃO GERAL**

O sistema de gestão financeira permite que você:
- ✅ Veja todos os pagamentos recebidos
- ✅ Dê baixa manualmente nos pagamentos
- ✅ Reconciliar pagamentos com o Stripe
- ✅ Gerenciar assinaturas (cancelar, reativar, etc.)
- ✅ Ver receitas, despesas e relatórios

---

## 🎯 **1. COMO DAR BAIXA EM PAGAMENTOS**

### **O que é "Dar Baixa"?**
Dar baixa significa **confirmar que o pagamento foi recebido e processado**. É uma forma de marcar o pagamento como reconciliado no sistema.

### **Como funciona:**

1. **Acesse o Admin:**
   - Vá em: `/admin/viajar/financial/payments`
   - Ou: Menu Admin → Financial → Payments

2. **Veja a lista de pagamentos:**
   - Todos os pagamentos do Stripe aparecem automaticamente
   - Status: `paid` (pago), `pending` (pendente), `failed` (falhou)
   - Coluna "Reconciliado": mostra se já foi dada baixa

3. **Dar Baixa:**
   - Clique no botão **"Dar Baixa"** ao lado do pagamento
   - Adicione observações (opcional)
   - Clique em **"Confirmar Baixa"**
   - O pagamento será marcado como reconciliado ✅

### **Quando dar baixa?**
- ✅ Pagamento confirmado no Stripe
- ✅ Dinheiro caiu na conta
- ✅ Você quer marcar como processado manualmente

---

## 💰 **2. GESTÃO DE RECEITAS**

### **Onde ver receitas:**
- Menu: `/admin/viajar/financial/revenue`
- Ou: Admin → Financial → Revenue

### **O que aparece:**
- 💳 **Assinaturas ViaJAR**: Pagamentos mensais/anuais dos clientes
- 🤝 **Parceiros**: Pagamentos de parceiros (quando configurado)
- 🎉 **Eventos**: Pagamentos para eventos em destaque (quando configurado)
- 📊 **Filtros**: Por data, por fonte, exportar CSV

### **Receitas são criadas automaticamente quando:**
- Cliente paga assinatura (Stripe webhook)
- Parceiro paga mensalidade (Stripe webhook)
- Evento é pago para destaque (Stripe webhook)

---

## 🔄 **3. RECONCILIAÇÃO AUTOMÁTICA**

### **O que é?**
Sincroniza pagamentos do Stripe com o banco de dados automaticamente.

### **Como usar:**
1. Vá em: `/admin/viajar/financial/reconciliation`
2. Clique em **"Sincronizar Pagamentos"**
3. O sistema busca todos os pagamentos do Stripe
4. Cria registros no banco se não existirem
5. Atualiza status dos existentes

### **Quando usar:**
- Após configurar Stripe pela primeira vez
- Se houver pagamentos que não aparecem no sistema
- Para garantir que tudo está sincronizado

---

## 📊 **4. GESTÃO DE ASSINATURAS**

### **Onde gerenciar:**
- Menu: `/admin/viajar/subscriptions`
- Ou: Admin → ViaJAR → Subscriptions

### **O que você pode fazer:**
- 👁️ **Ver detalhes**: Cliente, plano, valor, status
- ❌ **Cancelar**: Cancela assinatura (no final do período ou imediatamente)
- 🔄 **Reativar**: Reativa assinatura cancelada
- 📅 **Ver histórico**: Próximo pagamento, data de criação, etc.

### **Status das assinaturas:**
- ✅ **active**: Assinatura ativa e sendo cobrada
- ⏸️ **trialing**: Período de teste (14 dias grátis)
- ❌ **cancelled**: Cancelada
- ⚠️ **past_due**: Pagamento atrasado
- 🚫 **unpaid**: Não pago

---

## 🎯 **5. FLUXO COMPLETO DE UM PAGAMENTO**

### **1. Cliente faz pagamento:**
```
Cliente → Escolhe plano → Paga no Stripe → Stripe processa
```

### **2. Webhook do Stripe:**
```
Stripe → Envia evento → Edge Function processa → Salva no banco
```

### **3. Aparece no Admin:**
```
Banco de dados → Lista de pagamentos → Admin vê o pagamento
```

### **4. Dar Baixa (Opcional):**
```
Admin → Clica "Dar Baixa" → Marca como reconciliado ✅
```

### **5. Aparece nas Receitas:**
```
Pagamento reconciliado → Aba Receitas → Relatórios financeiros
```

---

## 📈 **6. RELATÓRIOS FINANCEIROS**

### **Onde ver:**
- Menu: `/admin/viajar/financial/reports`
- Ou: Admin → Financial → Reports

### **Relatórios disponíveis:**
- 📊 **DRE** (Demonstração do Resultado do Exercício)
- 💸 **Fluxo de Caixa** (Entradas e saídas)
- 💰 **Lucro Mensal/Anual** (Evolução do lucro)

### **Como gerar:**
1. Selecione o período (data inicial e final)
2. Clique em "Visualizar [Relatório]"
3. Veja o preview
4. Clique em "Baixar PDF" para exportar

---

## ⚙️ **7. CONFIGURAÇÃO DO STRIPE PARA VIAJAR TUR**

### **Características:**
- ❌ **SEM plano grátis**: Todos os planos são pagos
- ✅ **Valores configuráveis**: Você define os valores depois
- ✅ **Assinaturas recorrentes**: Cobrança automática mensal/anual
- ✅ **Métodos de pagamento**: Cartão, PIX, Boleto

### **O que foi configurado:**
1. ✅ Edge Function `stripe-create-checkout` atualizada
2. ✅ Webhook handler processa pagamentos
3. ✅ Integração no onboarding (sem plano grátis)
4. ✅ Gestão no admin (dar baixa, ver receitas)

---

## 🔧 **8. PRÓXIMOS PASSOS**

### **Para ativar completamente:**

1. **Configurar variáveis no Supabase:**
   ```env
   STRIPE_SECRET_KEY=sk_test_... (ou sk_live_...)
   STRIPE_PUBLISHABLE_KEY=pk_test_... (ou pk_live_...)
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

2. **Configurar webhook no Stripe:**
   - URL: `https://[seu-projeto].supabase.co/functions/v1/stripe-webhook-handler`
   - Eventos: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_*`

3. **Definir valores dos planos:**
   - Edite `supabase/functions/stripe-create-checkout/index.ts`
   - Atualize os valores em `planPrices`

4. **Testar:**
   - Use cartão de teste: `4242 4242 4242 4242`
   - Verifique se aparece no admin
   - Dê baixa em um pagamento de teste

---

## ❓ **PERGUNTAS FREQUENTES**

### **P: Preciso dar baixa em todos os pagamentos?**
R: Não é obrigatório. Os pagamentos já aparecem como "paid" quando confirmados pelo Stripe. Dar baixa é apenas para marcar como reconciliado manualmente.

### **P: O que acontece se não der baixa?**
R: Nada. O pagamento continua aparecendo na lista, mas não será marcado como "reconciliado". Isso não afeta o funcionamento.

### **P: Posso cancelar uma assinatura pelo admin?**
R: Sim! Vá em Subscriptions, clique no botão de cancelar. Você pode cancelar imediatamente ou no final do período.

### **P: Como vejo quanto dinheiro entrou este mês?**
R: Vá em Financial → Revenue, filtre por data (início e fim do mês), e veja o total.

### **P: Os pagamentos aparecem automaticamente?**
R: Sim! Quando o Stripe confirma um pagamento, o webhook cria o registro automaticamente no banco.

---

## 📞 **SUPORTE**

Se tiver dúvidas sobre:
- Configuração do Stripe
- Problemas com pagamentos
- Gestão no admin

Consulte a documentação ou entre em contato com o suporte técnico.

