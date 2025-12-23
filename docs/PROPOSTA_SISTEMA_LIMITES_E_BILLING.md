# 💰 Proposta: Sistema de Limites e Billing por Uso de APIs

## 📋 **SITUAÇÃO ATUAL**

### ✅ **O que já existe:**
1. Tabela `api_usage` para rastrear uso diário
2. Sistema de planos (freemium, professional, enterprise, government)
3. Integração com Stripe
4. Rate limiting básico em alguns serviços

### ❌ **O que falta:**
1. Limites definidos por plano
2. Sistema de overage (cobrança por excedente)
3. Alertas quando próximo do limite
4. Integração de billing com Stripe para overage
5. Dashboard de uso para o usuário

---

## 🎯 **PROPOSTA COMPLETA**

### **1. LIMITES POR PLANO**

#### **Limites das APIs Gratuitas (Google):**
- **Gemini:** 1.500 requisições/dia (gratuito)
- **Google Search:** 100 requisições/dia (gratuito)
- **OpenWeather:** 1M requisições/mês (gratuito)
- **Google Places:** ~11.000 requisições/mês (gratuito)

#### **Limites por Plano (Propostos):**

| Plano | Gemini/dia | Google Search/dia | OpenWeather/mês | Google Places/mês | Preço Overage |
|-------|-----------|-------------------|-----------------|-------------------|---------------|
| **Freemium** | 50 | 20 | 10.000 | 500 | R$ 0,10/req |
| **Professional** | 200 | 80 | 50.000 | 2.000 | R$ 0,05/req |
| **Enterprise** | 500 | 200 | 200.000 | 5.000 | R$ 0,02/req |
| **Government** | 1.000 | 400 | 500.000 | 10.000 | R$ 0,01/req |

**Nota:** Limites abaixo do gratuito para garantir margem de segurança.

---

### **2. SISTEMA DE OVERAGE (Cobrança por Excedente)**

#### **Como Funciona:**
1. **Dentro do limite:** Uso normal, sem cobrança adicional
2. **Próximo do limite (80%):** Alerta ao usuário
3. **Ultrapassou limite:** 
   - Permite uso (não bloqueia)
   - Registra excedente
   - Cobra no final do mês via Stripe

#### **Modelo de Cobrança:**
- **Freemium:** R$ 0,10 por requisição excedente
- **Professional:** R$ 0,05 por requisição excedente
- **Enterprise:** R$ 0,02 por requisição excedente
- **Government:** R$ 0,01 por requisição excedente

**Exemplo:**
- Usuário Professional usa 250 chamadas Gemini (limite: 200)
- Excedente: 50 chamadas
- Cobrança: 50 × R$ 0,05 = **R$ 2,50**

---

### **3. ESTRUTURA DE DADOS**

#### **Nova Tabela: `api_usage_limits`**
```sql
CREATE TABLE api_usage_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_tier TEXT NOT NULL,
  api_name TEXT NOT NULL, -- 'gemini', 'google_search', 'openweather', 'google_places'
  daily_limit INTEGER,
  monthly_limit INTEGER,
  overage_price DECIMAL(10,2), -- Preço por requisição excedente
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(plan_tier, api_name)
);
```

#### **Nova Tabela: `api_usage_overage`**
```sql
CREATE TABLE api_usage_overage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  month DATE NOT NULL, -- YYYY-MM-01
  api_name TEXT NOT NULL,
  base_limit INTEGER, -- Limite do plano
  actual_usage INTEGER, -- Uso real
  overage_count INTEGER, -- Excedente
  overage_amount DECIMAL(10,2), -- Valor a cobrar
  stripe_invoice_id TEXT, -- ID da fatura Stripe
  status TEXT DEFAULT 'pending', -- 'pending', 'billed', 'paid', 'failed'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month, api_name)
);
```

#### **Atualizar: `api_usage`**
Adicionar colunas:
- `openweather_calls` INTEGER DEFAULT 0
- `google_places_calls` INTEGER DEFAULT 0
- `monthly_reset_date` DATE -- Para reset mensal

---

### **4. FLUXO DE FUNCIONAMENTO**

#### **4.1. Ao Fazer Requisição de API:**

```typescript
// 1. Verificar limite do plano
const limit = await getAPILimit(userId, 'gemini');
const usage = await getTodayUsage(userId, 'gemini');

// 2. Se dentro do limite: permitir
if (usage < limit.daily) {
  await incrementUsage(userId, 'gemini');
  return { allowed: true };
}

// 3. Se ultrapassou: permitir mas registrar overage
await incrementUsage(userId, 'gemini');
await recordOverage(userId, 'gemini', 1);
return { 
  allowed: true, 
  warning: 'Limite excedido. Será cobrado R$ X no final do mês.' 
};
```

#### **4.2. Alertas (80% do limite):**

```typescript
// Verificar se está próximo do limite
if (usage >= limit.daily * 0.8) {
  await sendAlert(userId, {
    type: 'usage_warning',
    message: `Você usou ${usage}/${limit.daily} chamadas hoje.`,
    percentage: (usage / limit.daily) * 100
  });
}
```

#### **4.3. Cobrança Mensal (Cron Job):**

```typescript
// No dia 1º de cada mês
async function billMonthlyOverage() {
  const lastMonth = getLastMonth();
  
  // Buscar todos os overages do mês anterior
  const overages = await getOveragesForMonth(lastMonth);
  
  for (const overage of overages) {
    if (overage.overage_amount > 0) {
      // Criar invoice no Stripe
      const invoice = await stripe.invoices.create({
        customer: overage.user.stripe_customer_id,
        amount: overage.overage_amount * 100, // em centavos
        description: `Uso excedente de ${overage.api_name} - ${lastMonth}`
      });
      
      // Atualizar registro
      await updateOverage(overage.id, {
        stripe_invoice_id: invoice.id,
        status: 'billed'
      });
    }
  }
}
```

---

### **5. DASHBOARD DE USO**

#### **Componente: `APIUsageDashboard`**

Mostrar para o usuário:
- ✅ Uso atual vs limite
- ✅ Gráfico de uso diário/mensal
- ✅ Alertas quando próximo do limite
- ✅ Histórico de overages
- ✅ Previsão de custo se continuar no ritmo atual

---

### **6. CONFIGURAÇÃO DE LIMITES**

#### **Arquivo: `src/config/apiLimits.ts`**

```typescript
export const API_LIMITS = {
  freemium: {
    gemini: { daily: 50, monthly: 1500, overagePrice: 0.10 },
    google_search: { daily: 20, monthly: 600, overagePrice: 0.10 },
    openweather: { daily: 333, monthly: 10000, overagePrice: 0.10 },
    google_places: { daily: 16, monthly: 500, overagePrice: 0.10 },
  },
  professional: {
    gemini: { daily: 200, monthly: 6000, overagePrice: 0.05 },
    google_search: { daily: 80, monthly: 2400, overagePrice: 0.05 },
    openweather: { daily: 1666, monthly: 50000, overagePrice: 0.05 },
    google_places: { daily: 66, monthly: 2000, overagePrice: 0.05 },
  },
  enterprise: {
    gemini: { daily: 500, monthly: 15000, overagePrice: 0.02 },
    google_search: { daily: 200, monthly: 6000, overagePrice: 0.02 },
    openweather: { daily: 6666, monthly: 200000, overagePrice: 0.02 },
    google_places: { daily: 166, monthly: 5000, overagePrice: 0.02 },
  },
  government: {
    gemini: { daily: 1000, monthly: 30000, overagePrice: 0.01 },
    google_search: { daily: 400, monthly: 12000, overagePrice: 0.01 },
    openweather: { daily: 16666, monthly: 500000, overagePrice: 0.01 },
    google_places: { daily: 333, monthly: 10000, overagePrice: 0.01 },
  },
};
```

---

### **7. INTEGRAÇÃO COM STRIPE**

#### **7.1. Stripe Metered Billing (Recomendado)**

Usar **Stripe Billing Metered** para cobrança automática:

```typescript
// Criar subscription item com billing meter
const subscriptionItem = await stripe.subscriptionItems.create({
  subscription: subscriptionId,
  price_data: {
    currency: 'brl',
    product: 'api_overage',
    recurring: {
      aggregate_usage: 'sum',
      interval: 'month',
    },
    unit_amount: 5, // R$ 0,05 em centavos
  },
});

// Reportar uso mensal
await stripe.subscriptionItems.createUsageRecord(
  subscriptionItem.id,
  {
    quantity: overageCount,
    timestamp: Math.floor(Date.now() / 1000),
  }
);
```

#### **7.2. Invoice Manual (Alternativa)**

Criar invoice manual no final do mês (mais simples de implementar).

---

### **8. ALERTAS E NOTIFICAÇÕES**

#### **Níveis de Alerta:**
1. **80% do limite:** Aviso amarelo
2. **95% do limite:** Aviso laranja
3. **100% do limite:** Aviso vermelho + opção de upgrade
4. **Ultrapassou:** Notificação de cobrança

#### **Canais:**
- Email
- Notificação in-app
- WhatsApp (para planos Enterprise/Government)

---

### **9. IMPLEMENTAÇÃO POR FASES**

#### **Fase 1: Base (Semana 1)**
- ✅ Criar tabelas de limites e overage
- ✅ Implementar tracking de uso
- ✅ Criar serviço de verificação de limites
- ✅ Atualizar `api_usage` para incluir todas as APIs

#### **Fase 2: Alertas (Semana 2)**
- ✅ Sistema de alertas (80%, 95%, 100%)
- ✅ Dashboard de uso básico
- ✅ Notificações in-app

#### **Fase 3: Billing (Semana 3)**
- ✅ Integração com Stripe
- ✅ Cron job de cobrança mensal
- ✅ Histórico de overages
- ✅ Dashboard completo

#### **Fase 4: Otimizações (Semana 4)**
- ✅ Cache inteligente (reduzir chamadas)
- ✅ Previsão de custo
- ✅ Sugestões de otimização

---

### **10. CUSTOS E MARGEM**

#### **Custos Reais das APIs:**
- **Gemini:** ~$0.000125 por 1K tokens (após limite)
- **Google Search:** $5 por 1.000 requisições (após 100/dia)
- **OpenWeather:** Grátis até 1M/mês
- **Google Places:** ~$0.017 por requisição (após crédito)

#### **Margem Proposta:**
- **Freemium:** 10x o custo (R$ 0,10 vs ~R$ 0,01)
- **Professional:** 5x o custo (R$ 0,05 vs ~R$ 0,01)
- **Enterprise:** 2x o custo (R$ 0,02 vs ~R$ 0,01)
- **Government:** 1x o custo (R$ 0,01 vs ~R$ 0,01)

**Justificativa:** Margem cobre infraestrutura, suporte e desenvolvimento.

---

## ❓ **PERGUNTAS PARA VOCÊ**

Antes de implementar, preciso confirmar:

1. **Limites propostos estão adequados?** (muito altos/baixos?)
2. **Preços de overage estão razoáveis?** (R$ 0,01 a R$ 0,10 por requisição)
3. **Prefere bloquear após limite ou permitir e cobrar?** (proposta: permitir e cobrar)
4. **Quer alertas por email, in-app ou ambos?**
5. **Prefere Stripe Metered Billing ou Invoice Manual?**
6. **Quer dashboard de uso desde o início ou pode ser Fase 2?**

---

## 📊 **RESUMO EXECUTIVO**

### **O que será implementado:**
1. ✅ Sistema de limites por plano
2. ✅ Tracking de uso de todas as APIs
3. ✅ Sistema de overage (cobrança por excedente)
4. ✅ Alertas quando próximo do limite
5. ✅ Integração com Stripe para billing
6. ✅ Dashboard de uso para usuários

### **Benefícios:**
- ✅ Controle de custos (não ultrapassa limites gratuitos)
- ✅ Nova fonte de receita (overage)
- ✅ Transparência para usuários
- ✅ Incentivo para upgrade de plano

### **Tempo estimado:**
- **Fase 1-2:** 2 semanas
- **Fase 3:** 1 semana
- **Fase 4:** 1 semana
- **Total:** ~4 semanas

---

**Aguardando sua aprovação para começar a implementação!** 🚀



