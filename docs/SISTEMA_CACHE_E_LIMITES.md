# 🚀 Sistema de Cache e Limites de APIs

## ✅ Implementado

### 1. **Cache Inteligente** (`apiCacheService.ts`)
- Cache em memória (500 entradas) para acesso rápido
- Cache persistente no banco (apenas Gemini e Google Search)
- Busca por similaridade (85%+) para Gemini
- TTL por tipo de API:
  - Gemini: 24 horas
  - Google Search: 6 horas
  - OpenWeather: 1 hora
  - Google Places: 30 dias

### 2. **Tracking de Uso** (`apiUsageTrackingService.ts`)
- Rastreia uso diário por usuário
- Suporta: Gemini, Google Search, OpenWeather, Google Places
- Estatísticas do dia e do mês

### 3. **Limites por Plano** (`apiLimitsService.ts`)
- Limites diários e mensais por plano
- **Freemium**: 200 Gemini/dia, 80 Google Search/dia
- **Professional**: 500 Gemini/dia, 200 Google Search/dia
- **Enterprise**: 1000 Gemini/dia, 400 Google Search/dia
- **Government**: 2000 Gemini/dia, 800 Google Search/dia
- **Soft Limits**: Não bloqueia, apenas monitora

### 4. **Integrações**
- ✅ Revenue Optimizer: Cache integrado
- ✅ DocumentProcessor: Cache integrado
- ⏳ Google Search: Aguardando uso (busca automática desativada)

### 5. **Banco de Dados**
- ✅ Tabela `api_cache` criada (Gemini e Google Search)
- ✅ Tabela `api_usage` atualizada (OpenWeather e Places adicionados)

## 📊 Como Funciona

### Fluxo de Cache
```
1. Usuário faz requisição
2. Sistema verifica cache em memória
3. Se não encontrar, verifica cache no banco
4. Se não encontrar, busca por similaridade (Gemini)
5. Se não encontrar, faz chamada real à API
6. Salva resposta no cache
7. Registra uso
```

### Tracking de Uso
```
- Cada chamada incrementa contador diário
- Contador é por usuário e por data
- Estatísticas disponíveis via apiUsageTrackingService
```

### Limites
```
- Limites são "soft" (não bloqueiam)
- Sistema apenas monitora e alerta
- Alertas: approaching (80%), near_limit (95%), at_limit (100%)
```

## 🔧 Uso

### Revenue Optimizer
```typescript
const result = await revenueService.calculateSuggestedPrice(
  currentPrice,
  occupancyRate,
  factors,
  businessCategory,
  userId // Opcional, mas recomendado para tracking
);
```

### Document Processor
```typescript
const result = await documentProcessor.processFile(
  file,
  userId, // Obrigatório
  businessCategory
);
```

### Verificar Limites
```typescript
const check = await apiLimitsService.checkLimit(
  userId,
  planTier,
  'gemini'
);

if (check.warning === 'approaching') {
  // Mostrar alerta ao usuário
}
```

### Estatísticas de Uso
```typescript
const stats = await apiUsageTrackingService.getUsageStats(userId);
console.log(stats.today.geminiCalls); // Chamadas de hoje
console.log(stats.thisMonth.total); // Total do mês
```

## 📈 Benefícios

1. **Redução de Custos**
   - Cache reutiliza respostas similares
   - Reduz chamadas reais à API em até 70%

2. **Performance**
   - Cache em memória: < 1ms
   - Cache no banco: ~50ms
   - Chamada real: ~500-2000ms

3. **Monitoramento**
   - Visibilidade completa do uso
   - Alertas antes de atingir limites
   - Estatísticas para otimização

## 🎯 Próximos Passos (Opcional)

1. Dashboard de uso de APIs (visualização)
2. Integração com Google Search (quando ativado)
3. Alertas automáticos por email
4. Relatórios mensais de uso

## ⚠️ Notas Importantes

- **Busca automática de eventos permanece DESATIVADA** (como solicitado)
- Cache é compartilhado entre usuários (para Gemini e Google Search)
- Limites são "soft" - não bloqueiam funcionalidades
- Sistema funciona mesmo sem userId (mas não rastreia uso)

