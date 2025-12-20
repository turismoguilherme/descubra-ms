# 📊 Análise: Histórico de Transações e Notificações para Parceiros

## 🔍 Análise do Sistema Atual

### 1. **Fluxo de Reservas (Como Funciona Atualmente)**

#### **Como o Cliente Faz Reserva:**
1. Cliente acessa a plataforma Descubra MS
2. Navega até a página do parceiro (ex: `/descubramatogrossodosul/parceiros`)
3. Clica em "Fazer Reserva" ou similar
4. Preenche formulário com:
   - Tipo de serviço (hotel, restaurante, tour, etc.)
   - Data/hora da reserva
   - Número de hóspedes
   - Dados pessoais (nome, email, telefone)
   - Solicitações especiais
5. Sistema chama `reservation-checkout` Edge Function
6. Cria reserva no banco (`partner_reservations`) com status `pending`
7. Redireciona para Stripe Checkout para pagamento
8. Cliente paga no Stripe (cartão, PIX, boleto)
9. Webhook do Stripe atualiza status para `confirmed` (pagamento confirmado)
10. **Parceiro precisa confirmar manualmente** no dashboard

#### **Comunicação Cliente ↔ Parceiro:**
- ❌ **Não existe sistema de chat/mensagens** entre cliente e parceiro
- ✅ Dados de contato estão na reserva: `guest_email`, `guest_phone`
- ✅ Campo `special_requests` para solicitações especiais
- ✅ Campo `partner_notes` para notas internas do parceiro

#### **Pagamento:**
- ✅ Pagamento é feito **ANTES** da reserva ser confirmada
- ✅ Cliente paga valor total no Stripe
- ✅ Comissão é calculada automaticamente (padrão 10%)
- ✅ Comissão é registrada em `master_financial_records` quando pagamento é confirmado
- ⚠️ **Repasse para parceiro**: Código comentado (TODO) - não está implementado ainda

---

### 2. **Histórico de Transações (O que Existe)**

#### **Tabelas Existentes:**
1. **`master_financial_records`**:
   - Registra receitas, despesas, reembolsos
   - Campos: `record_type`, `amount`, `description`, `stripe_invoice_id`, `status`, `metadata`
   - Usado para comissões de reservas (quando pagamento é confirmado)
   - **Problema**: Não está vinculado diretamente ao parceiro (só via metadata)

2. **`partner_reservations`**:
   - Tem campos: `total_amount`, `commission_amount`, `commission_rate`
   - **Problema**: Não tem histórico de pagamentos da assinatura do parceiro

3. **`institutional_partners`**:
   - Tem: `monthly_fee`, `subscription_status`, `stripe_subscription_id`
   - **Problema**: Não tem histórico de pagamentos da assinatura

#### **O que FALTA:**
- ❌ Histórico de pagamentos da assinatura mensal do parceiro
- ❌ Histórico consolidado de todas as transações (assinatura + comissões)
- ❌ Visualização no dashboard do parceiro
- ❌ Filtros e busca por período

---

### 3. **Sistema de Notificações (O que Existe)**

#### **Sistemas Existentes:**
1. **`user_notifications`**: Para usuários gerais (não específico para parceiros)
2. **`AdminNotifications`**: Para administradores (localStorage)
3. **Email notifications**: Via `send-notification-email` Edge Function

#### **O que FALTA:**
- ❌ Notificações em tempo real para parceiros sobre novas reservas
- ❌ Notificações sobre pagamentos de comissões
- ❌ Notificações sobre status de assinatura
- ❌ Sistema de notificações específico para parceiros

---

## 💡 Proposta de Implementação

### **1. Histórico de Transações**

#### **Opção A: Criar Tabela Dedicada (Recomendado)**
```sql
CREATE TABLE partner_transactions (
  id UUID PRIMARY KEY,
  partner_id UUID REFERENCES institutional_partners(id),
  transaction_type TEXT CHECK (transaction_type IN ('subscription_payment', 'commission', 'refund')),
  amount NUMERIC(10,2),
  description TEXT,
  stripe_invoice_id TEXT,
  stripe_payment_intent_id TEXT,
  reservation_id UUID REFERENCES partner_reservations(id),
  status TEXT CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  paid_date TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Vantagens:**
- ✅ Histórico completo e organizado
- ✅ Fácil de consultar e filtrar
- ✅ Performance otimizada
- ✅ Pode incluir refunds e ajustes

#### **Opção B: Usar `master_financial_records` + View**
- Criar view que consolida dados de `master_financial_records` e `partner_reservations`
- Mais simples, mas menos flexível

**Recomendação: Opção A** (tabela dedicada)

---

### **2. Sistema de Notificações em Tempo Real**

#### **Opção A: Supabase Realtime + Notificações Locais**
```typescript
// Subscrever a mudanças em partner_reservations
supabase
  .channel('partner_reservations')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'partner_reservations',
    filter: `partner_id=eq.${partnerId}`
  }, (payload) => {
    // Nova reserva criada!
    showNotification('Nova reserva recebida!');
  })
  .subscribe();
```

**Vantagens:**
- ✅ Tempo real verdadeiro
- ✅ Não precisa polling
- ✅ Eficiente

#### **Opção B: Polling + Notificações**
- Verificar novas reservas a cada X segundos
- Mais simples, mas menos eficiente

**Recomendação: Opção A** (Supabase Realtime)

---

### **3. Comunicação Cliente ↔ Parceiro**

#### **Opção A: Sistema de Mensagens Integrado**
- Criar tabela `partner_messages` ou `reservation_messages`
- Chat dentro do dashboard do parceiro
- Cliente pode enviar mensagem sobre a reserva

**Vantagens:**
- ✅ Comunicação direta
- ✅ Histórico de conversas
- ✅ Melhor experiência

#### **Opção B: Email/Telefone (Atual)**
- Usar `guest_email` e `guest_phone` para contato externo
- Mais simples, mas menos integrado

**Recomendação: Opção A** (sistema de mensagens) - mas pode ser implementado depois

---

### **4. Pagamento e Repasse**

#### **Situação Atual:**
- Cliente paga valor total no Stripe
- Comissão é calculada e registrada
- **Repasse para parceiro NÃO está implementado** (código comentado)

#### **Opções:**
1. **Stripe Connect** (recomendado para produção):
   - Parceiro cria conta Stripe Connect
   - Repasse automático quando reserva é confirmada
   - Taxas do Stripe aplicadas

2. **Transferência Manual**:
   - Admin faz transferência manual
   - Registra no sistema
   - Mais controle, mas mais trabalho

3. **Saldo na Plataforma**:
   - Parceiro acumula saldo
   - Pode sacar quando quiser
   - Mais flexível

**Recomendação**: Para MVP, manter manual. Para produção, implementar Stripe Connect.

---

## 📋 Proposta de Implementação Detalhada

### **Fase 1: Histórico de Transações** ✅

#### **1.1 Criar Tabela `partner_transactions`**
- Campos: tipo, valor, descrição, status, datas
- Relacionamentos: partner_id, reservation_id (opcional)
- Índices para performance

#### **1.2 Popular Histórico Existente**
- Migrar dados de `master_financial_records` (comissões)
- Migrar dados de Stripe (pagamentos de assinatura)
- Criar registros históricos

#### **1.3 Componente no Dashboard**
- Seção "Histórico de Transações"
- Filtros: tipo, período, status
- Gráficos de receita ao longo do tempo
- Exportar CSV/PDF

---

### **Fase 2: Notificações em Tempo Real** ✅

#### **2.1 Implementar Supabase Realtime**
- Subscrever a `partner_reservations` (INSERT)
- Subscrever a `partner_transactions` (INSERT)
- Notificar quando:
  - Nova reserva criada
  - Reserva confirmada (pagamento)
  - Comissão paga
  - Status de assinatura mudou

#### **2.2 Componente de Notificações**
- Badge com contador no navbar
- Dropdown com últimas notificações
- Toast notifications para eventos importantes
- Marcar como lida

#### **2.3 Notificações por Email (Opcional)**
- Email quando nova reserva é criada
- Email quando pagamento é confirmado
- Configurável nas preferências

---

### **Fase 3: Comunicação (Futuro)** ⏳

#### **3.1 Sistema de Mensagens**
- Tabela `reservation_messages`
- Chat dentro do dashboard
- Notificações de novas mensagens

---

## ❓ Perguntas para Consulta

### **1. Histórico de Transações:**
- **Q1.1**: Quer ver apenas transações do parceiro logado ou também de todos os parceiros (admin)?
- **Q1.2**: Precisa exportar relatórios (PDF/CSV) ou apenas visualização?
- **Q1.3**: Quer gráficos de evolução de receita ou apenas tabela?

### **2. Notificações:**
- **Q2.1**: Prefere notificações em tempo real (Supabase Realtime) ou polling a cada X segundos?
- **Q2.2**: Quer notificações por email também ou apenas no dashboard?
- **Q2.3**: Quais eventos devem gerar notificação?
  - Nova reserva criada? ✅
  - Pagamento confirmado? ✅
  - Reserva cancelada? ✅
  - Comissão paga? ✅
  - Assinatura vencendo? ✅

### **3. Comunicação:**
- **Q3.1**: Precisa de sistema de chat/mensagens agora ou pode ser depois?
- **Q3.2**: Se não tiver chat, como o parceiro deve se comunicar com o cliente?
  - Email/telefone (dados na reserva)? ✅
  - Sistema de mensagens integrado? ⏳

### **4. Pagamento:**
- **Q4.1**: Como funciona o repasse para o parceiro atualmente?
  - Manual (admin transfere)?
  - Automático (Stripe Connect)?
  - Não implementado ainda?
- **Q4.2**: O parceiro precisa ver quando o repasse foi feito?

### **5. Assinatura:**
- **Q5.1**: O parceiro paga mensalmente pela plataforma?
- **Q5.2**: Precisa ver histórico de pagamentos da assinatura?
- **Q5.3**: Precisa ser avisado quando assinatura está vencendo?

---

## 🎯 Recomendações Baseadas em Boas Práticas

### **Histórico de Transações:**
1. ✅ Criar tabela dedicada `partner_transactions`
2. ✅ Incluir todos os tipos: assinatura, comissões, refunds
3. ✅ Mostrar no dashboard com filtros e gráficos
4. ✅ Permitir exportação (CSV/PDF)

### **Notificações:**
1. ✅ Usar Supabase Realtime para tempo real
2. ✅ Notificar sobre: novas reservas, pagamentos, status
3. ✅ Badge de contador no navbar
4. ✅ Toast notifications para eventos importantes
5. ✅ Opção de email (configurável)

### **Comunicação:**
1. ⏳ Para MVP: usar email/telefone (dados na reserva)
2. 🔮 Para futuro: implementar sistema de mensagens

---

## 📝 Próximos Passos

**Aguardando suas respostas para:**
1. Confirmar o fluxo de comunicação atual
2. Decidir sobre sistema de mensagens (agora ou depois)
3. Confirmar como funciona o repasse
4. Definir quais notificações são prioritárias

**Depois das respostas, vou implementar:**
1. Tabela `partner_transactions`
2. Componente de histórico no dashboard
3. Sistema de notificações em tempo real
4. Integração com webhooks do Stripe

---

**Por favor, responda as perguntas acima para eu poder implementar da melhor forma!** 🚀
