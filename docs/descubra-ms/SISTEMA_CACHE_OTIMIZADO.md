# 📦 SISTEMA DE CACHE OTIMIZADO

## **🎯 OBJETIVO**

**Minimizar requisições à API do Google Search** através de um sistema inteligente de cache.

---

## **✅ COMO FUNCIONA AGORA**

### **1. Cache de 24 Horas (Persistente)**

#### **Antes:**
- ❌ Cache de apenas 1 hora em memória
- ❌ Perdia cache ao recarregar página
- ❌ Fazia nova requisição a cada reload

#### **Agora:**
- ✅ **Cache de 24 horas** (1 dia inteiro)
- ✅ **Persistente no localStorage** (sobrevive a reloads)
- ✅ **Carregamento instantâneo** de dados em cache

---

## **🔄 QUANDO FAZ REQUISIÇÕES**

### **Cenário 1: Primeira Visita** 🆕
```
Usuário acessa /ms/eventos pela primeira vez
→ Cache vazio
→ FAZ 1 requisição ao Google
→ Salva resultado no cache (24h)
→ Exibe eventos
```

### **Cenário 2: Visitas Subsequentes (< 24h)** 📦
```
Usuário acessa /ms/eventos novamente
→ Cache válido (< 24h)
→ NÃO faz requisição
→ Carrega do localStorage instantaneamente
→ Exibe eventos (com indicador "📦 Cache (24h)")
```

### **Cenário 3: Cache Expirado (> 24h)** ⏰
```
Usuário acessa após 24 horas
→ Cache expirado
→ FAZ 1 requisição ao Google
→ Atualiza cache (novo período de 24h)
→ Exibe eventos atualizados
```

### **Cenário 4: Atualização Manual** 🔄
```
Usuário clica em "Atualizar"
→ Limpa cache manualmente
→ FAZ 1 requisição ao Google
→ Salva novo cache (24h)
→ Exibe eventos atualizados
```

---

## **📊 ECONOMIA DE REQUISIÇÕES**

### **Exemplo Prático:**

**Sem cache (antes):**
```
Dia 1: 10 visitas = 10 requisições
Dia 2: 10 visitas = 10 requisições
Dia 3: 10 visitas = 10 requisições
TOTAL: 30 requisições em 3 dias
```

**Com cache de 24h (agora):**
```
Dia 1: 10 visitas = 1 requisição (outras 9 usam cache)
Dia 2: 10 visitas = 1 requisição (outras 9 usam cache)
Dia 3: 10 visitas = 1 requisição (outras 9 usam cache)
TOTAL: 3 requisições em 3 dias
```

**Economia: 90%!** 🎉

---

## **🎮 CONTROLE MANUAL**

### **Botão "Atualizar"**

Localizado no header, ao lado das estatísticas:

```
📦 Cache (24h) | Requisições: 2/80  [🔄 Atualizar]
```

**Funcionalidade:**
- Limpa cache atual
- Força nova busca no Google
- Usa 1 requisição
- Reseta timer de 24h

**Quando usar:**
- Quer ver eventos mais recentes
- Suspeita que cache está desatualizado
- Após saber de um novo evento que não aparece

---

## **💾 ARMAZENAMENTO**

### **localStorage Keys:**

1. **`eventos_ms_cache`**
   - Dados dos eventos em cache
   - Estrutura: `{ chave: { data: [...], timestamp: 123456 } }`
   - Duração: 24 horas

2. **`google_search_request_log`**
   - Log de requisições (timestamps)
   - Usado para rate limiting
   - Duração: Permanente (limpa entradas > 24h automaticamente)

### **Tamanho Aproximado:**
- Cache de eventos: ~50-100 KB (10 eventos)
- Log de requisições: ~1-2 KB

---

## **🔍 VERIFICAÇÃO DO CACHE**

### **No Console do Navegador:**

```javascript
// Ver cache atual
console.log(localStorage.getItem('eventos_ms_cache'));

// Ver log de requisições
console.log(localStorage.getItem('google_search_request_log'));

// Limpar cache manualmente
localStorage.removeItem('eventos_ms_cache');

// Limpar log de requisições
localStorage.removeItem('google_search_request_log');
```

---

## **📈 ESTATÍSTICAS EM TEMPO REAL**

### **Indicadores Visuais:**

#### **Dados em Cache:**
```
📦 Cache (24h) | Requisições: 2/80
```
- **📦**: Dados vindo do cache local
- **Cache (24h)**: Válido por 24 horas
- **2/80**: Apenas 2 requisições usadas hoje

#### **Dados da API:**
```
🔍 Dados da API | Requisições: 3/80
```
- **🔍**: Dados recém-buscados no Google
- **3/80**: 3 requisições usadas, 77 restantes

---

## **⚙️ CONFIGURAÇÕES TÉCNICAS**

### **Parâmetros do Cache:**

```typescript
CACHE_DURATION: 86400000 ms  // 24 horas
CACHE_STORAGE_KEY: 'eventos_ms_cache'
```

### **Rate Limiting:**

```typescript
MAX_REQUESTS_PER_DAY: 80     // Margem de segurança
MAX_REQUESTS_PER_HOUR: 10
MAX_REQUESTS_PER_MINUTE: 3
MIN_REQUEST_INTERVAL: 3000ms // 3 segundos
```

---

## **🎯 CENÁRIOS DE USO**

### **Uso Normal (Recomendado):**
1. Acessar página de eventos
2. Ver eventos em cache (se < 24h)
3. Apenas clicar em "Atualizar" se quiser dados frescos

**Requisições usadas: ~1 por dia**

### **Uso Intensivo:**
1. Acessar várias vezes ao dia
2. Sempre usar cache
3. Atualizar manualmente 1x ao dia

**Requisições usadas: ~1-2 por dia**

### **Manutenção:**
1. Verificar cache expirando (> 23h)
2. Deixar sistema atualizar automaticamente
3. OU clicar em "Atualizar" preventivamente

**Requisições usadas: ~1 por dia**

---

## **✅ GARANTIAS**

1. ✅ **Nunca ultrapassa 80 requisições/dia**
2. ✅ **Cache válido por 24 horas**
3. ✅ **Persistente entre reloads**
4. ✅ **Controle manual disponível**
5. ✅ **Transparente** (mostra se é cache ou API)
6. ✅ **Automático** (não precisa fazer nada)

---

## **🎉 RESULTADO**

**Sistema otimizado para:**
- ✅ **Economia máxima** de requisições (90%)
- ✅ **Carregamento instantâneo** (cache local)
- ✅ **Controle manual** quando necessário
- ✅ **Transparência total** do status
- ✅ **Zero preocupações** com limites

**Você pode acessar a página de eventos quantas vezes quiser sem se preocupar!** 🚀

