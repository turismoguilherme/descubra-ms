# 🚨 ERRO 429 - GOOGLE SEARCH API

## **PROBLEMA IDENTIFICADO**

O sistema estava gerando **centenas de requisições** para a Google Custom Search API em poucos minutos, resultando em erro **429 (Too Many Requests)**.

### **Causas do Erro:**
1. **Múltiplas queries simultâneas** - 5 queries por busca
2. **Sem cache** - Cada reload da página fazia novas requisições
3. **Sem rate limiting** - Nenhum controle de frequência
4. **Auto-ativação agressiva** - Sistema iniciava automaticamente múltiplas vezes

### **Limites da API Google Custom Search:**
- **100 requisições por dia** (plano gratuito)
- **10 requisições por segundo** (máximo)
- Reset do limite: **Meia-noite (horário do Pacific Time)**

---

## **✅ SOLUÇÃO IMPLEMENTADA**

### **1. Google Search TEMPORARIAMENTE DESABILITADO**
O sistema agora usa **eventos de demonstração realistas** até que o limite da API seja resetado.

### **2. Eventos de Demonstração**
Criados 3 eventos realistas:
- ✅ **Festival de Inverno de Bonito 2025**
- ✅ **Exposição Pantanal em Foco**
- ✅ **Corrida de Rua Campo Grande**

### **3. Melhorias no Layout**
- ✅ Cards modernos com gradiente
- ✅ Banners reais (quando imagem disponível)
- ✅ Descrições realistas e profissionais
- ✅ Links para sites oficiais
- ✅ Badges de categoria e status

---

## **🔧 PRÓXIMOS PASSOS**

### **Opção 1: Aguardar Reset da API (RECOMENDADO)**
- Aguardar até **meia-noite (Pacific Time)** para o limite ser resetado
- Após reset, ativar Google Search novamente com as otimizações abaixo

### **Opção 2: Implementar Otimizações**
1. **Cache de 1 hora** - Salvar resultados por 1 hora
2. **Rate Limiting** - Máximo 10 requisições por hora
3. **Reduzir Queries** - De 5 para 1-2 queries apenas
4. **Delay entre requisições** - Mínimo 3 segundos entre cada busca

### **Opção 3: Upgrade do Plano Google**
- **Plano Pago**: US$ 5 por 1.000 requisições
- **Limite**: Até 10.000 requisições por dia

---

## **📊 MONITORAMENTO**

Para verificar o status da API Google Search:
```javascript
// Verificar se a API está disponível
const apiConfigured = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY && 
                      import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID;
```

---

## **🎯 CÓDIGO MODIFICADO**

### **Arquivo:** `src/components/events/EventCalendarSimple.tsx`
- **Linha ~57-100**: Google Search desabilitado, usando eventos de demonstração
- **Motivo**: Erro 429 (Too Many Requests)
- **Solução Temporária**: Eventos de demonstração realistas

---

## **⚠️ IMPORTANTE**

**NÃO REATIVAR** o Google Search até que:
1. O limite da API seja resetado
2. As otimizações de cache e rate limiting sejam implementadas
3. O número de queries seja reduzido para 1-2 apenas

---

## **📞 SUPORTE**

Se precisar de ajuda para configurar ou otimizar o Google Search:
1. Implementar sistema de cache
2. Configurar rate limiting
3. Reduzir número de queries
4. Considerar upgrade do plano Google

