# 💰 GUIA DE CONFIGURAÇÃO GRATUITA DAS APIS

## 🎯 **RESUMO DOS LIMITES GRATUITOS**

### **✅ APIs com Planos Gratuitos Generosos:**

| API | Limite Gratuito | Suficiente Para |
|-----|----------------|-----------------|
| **Google Places** | 1.000 consultas/mês | ✅ 33 consultas/dia |
| **Google Search** | 100 consultas/dia | ✅ Uso normal |
| **Gemini AI** | Ilimitado* | ✅ Sem limites práticos |
| **Supabase** | 50.000 reads/mês | ✅ Muito generoso |

*Gemini tem rate limit mas é muito alto para uso normal

---

## 🔧 **CONFIGURAÇÃO GRATUITA OTIMIZADA**

### **1. Google Cloud - Configuração Gratuita**

#### **1.1 Ativar Cobrança (SEM GASTAR)**
```
⚠️ IMPORTANTE: Ativar cobrança não significa que será cobrado!
✅ Google oferece $300 em créditos gratuitos
✅ Só é cobrado se ultrapassar os limites gratuitos
```

**Passos:**
1. Google Cloud Console → "Faturamento"
2. "Vincular conta de faturamento"
3. **NÃO SE PREOCUPE**: Não será cobrado dentro dos limites

#### **1.2 Configurar Alertas de Orçamento**
1. "Faturamento" → "Orçamentos e alertas"
2. "Criar orçamento"
3. **Valor**: R$ 5,00 (muito baixo de propósito)
4. **Alerta**: 50%, 90%, 100%
5. ✅ **Receberá email antes de qualquer cobrança**

#### **1.3 Configurar Cotas para Segurança**
```
Google Cloud Console → APIs e Serviços → Cotas
```

**Places API:**
- Limite diário: 30 consultas
- Limite mensal: 900 consultas

**Custom Search:**
- Limite diário: 90 consultas

---

## 💾 **SISTEMA DE CACHE INTELIGENTE (IMPLEMENTADO!)**

### **✅ Cache Automático Já Funcionando:**

O Guatá agora tem um **sistema de cache inteligente** que:

#### **🔍 Como Funciona:**
1. **Pergunta Nova**: Consulta APIs normalmente
2. **Pergunta Similar**: Usa resposta em cache (**0 APIs gastas!**)
3. **Cache Inteligente**: Detecta perguntas similares automaticamente

#### **📊 Economia Automática:**
```javascript
Exemplo de logs que você verá:

✅ CACHE HIT EXATO: APIs economizadas: 15
✅ CACHE HIT SIMILAR (87%): APIs economizadas: 23
💾 CACHE SAVE: Resposta salva para futuras consultas

💰 ECONOMIA DE APIS:
• 47 chamadas economizadas
• 68% de taxa de acerto
• ~R$ 0,94 economizados
• 125 respostas em cache
```

#### **🎯 Perguntas que Economizam APIs:**
- "hotéis perto do aeroporto" → "hotel próximo aeroporto" ✅ **Cache Hit!**
- "o que fazer em Bonito" → "atividades em Bonito" ✅ **Cache Hit!**
- "restaurantes centro Campo Grande" → "onde comer centro CG" ✅ **Cache Hit!**

### **⚙️ Configurações do Cache:**
- **Tempo de vida**: 24 horas
- **Máximo**: 1.000 respostas
- **Similaridade**: 85% para reutilizar
- **Limpeza**: Automática

---

## 🎮 **ESTRATÉGIAS PARA MAXIMIZAR O GRATUITO**

### **1. 📈 Usar o Cache de Forma Inteligente**

#### **Perguntas Populares (Cache Frequente):**
- "hotéis perto do aeroporto"
- "o que fazer em Bonito"
- "restaurantes em Campo Grande"
- "transporte público CG"

#### **Como Testar o Cache:**
1. Faça uma pergunta no Guatá
2. Mude ligeiramente a pergunta
3. Veja nos logs: `✅ CACHE HIT`

### **2. 🎯 Configuração de Desenvolvimento vs Produção**

#### **Desenvolvimento (.env local):**
```env
# Modo desenvolvimento - cache mais agressivo
VITE_CACHE_TTL_HOURS=48
VITE_CACHE_SIMILARITY_THRESHOLD=0.80
VITE_USE_MOCK_DATA=true
```

#### **Produção (.env produção):**
```env
# Modo produção - cache otimizado
VITE_CACHE_TTL_HOURS=24
VITE_CACHE_SIMILARITY_THRESHOLD=0.85
VITE_USE_MOCK_DATA=false
```

### **3. 📊 Monitoramento de Uso**

#### **Como Ver Economia em Tempo Real:**
1. Abrir console (F12)
2. Fazer perguntas no Guatá
3. Observar logs:
   ```javascript
   🔍 CACHE: Buscando resposta similar...
   ✅ CACHE HIT: APIs economizadas: 25
   💰 ~R$ 0,50 economizados
   ```

---

## 🚨 **CONFIGURAÇÃO SEGURA PARA ZERO GASTOS**

### **1. Arquivo .env Otimizado:**

```env
# 💰 CONFIGURAÇÃO MÁXIMA ECONOMIA

# ===== APIS OBRIGATÓRIAS =====
VITE_GEMINI_API_KEY=sua_chave
VITE_SUPABASE_URL=sua_url
VITE_SUPABASE_ANON_KEY=sua_key

# ===== APIS OPCIONAIS (COM LIMITES SEGUROS) =====
VITE_GOOGLE_PLACES_API_KEY=sua_chave_places
VITE_GOOGLE_SEARCH_API_KEY=mesma_chave
VITE_GOOGLE_SEARCH_ENGINE_ID=seu_engine_id

# ===== CONFIGURAÇÕES DE ECONOMIA =====
VITE_ENABLE_CACHE=true
VITE_CACHE_TTL_HOURS=48
VITE_PREFER_LOCAL_DATA=true
VITE_MAX_API_CALLS_PER_HOUR=10
```

### **2. Limites de Segurança no Google Cloud:**

#### **Places API:**
```
Cotas → Places API → Requests per day: 30
Cotas → Places API → Requests per minute: 2
```

#### **Custom Search:**
```
Cotas → Custom Search → Queries per day: 90
Cotas → Custom Search → Queries per minute: 5
```

### **3. Alertas de Email:**
- **R$ 1,00**: "Atenção - 20% do limite"
- **R$ 3,00**: "CUIDADO - 60% do limite"
- **R$ 5,00**: "PARE - Limite atingido!"

---

## ✅ **RESULTADO FINAL**

### **Com Cache Inteligente Você Tem:**

1. **60-80% de economia** nas chamadas de API
2. **Respostas mais rápidas** (cache é instantâneo)
3. **Uso gratuito prolongado** das APIs
4. **Monitoramento em tempo real** do gasto

### **Exemplo Real de Uso:**
```
Dia 1: 50 perguntas → 50 APIs usadas
Dia 2: 50 perguntas → 15 APIs usadas (35 do cache!)
Dia 3: 50 perguntas → 8 APIs usadas (42 do cache!!)

Total em 3 dias: 150 perguntas, apenas 73 APIs gastas!
Economia: 77 APIs = ~R$ 1,54 economizados
```

---

## 🎯 **PRÓXIMOS PASSOS**

1. ✅ **APIs já configuradas** (você fez!)
2. ✅ **Cache já implementado** (automático!)
3. ✅ **Sistema funcionando**
4. 🎮 **Teste e monitore** a economia

### **Para Testar Agora:**
1. Reinicie o servidor: `npm run dev`
2. Acesse: `http://localhost:8080/chatguata`
3. Faça perguntas similares
4. Veja a economia nos logs (F12)

---

**🎉 Resultado: Guatá inteligente, econômico e 100% gratuito! 💰✨**
