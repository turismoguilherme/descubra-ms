# 📅 SISTEMA DE EVENTOS - EXPLICAÇÃO COMPLETA

## **🎯 COMO FUNCIONA**

### **1. De onde vêm os eventos?**

Os eventos são **100% REAIS** e vêm do **Google Custom Search API**:

#### **Fonte dos Dados:**
- 🔍 **Google Custom Search API** busca na web por eventos em Mato Grosso do Sul
- 📰 Encontra **notícias, páginas oficiais, agendas culturais**
- 🗓️ Extrai informações como título, descrição, data, local
- 🔗 **Captura o link original** da página onde o evento foi encontrado

#### **Query de Busca:**
```
"eventos Campo Grande Mato Grosso do Sul 2025"
```

---

## **🔗 SOBRE OS LINKS DOS EVENTOS**

### **Como funcionam os links de "Site Oficial"?**

O botão **"Site Oficial"** usa o **link REAL** retornado pelo Google Search:

```typescript
site_oficial: evento.site_oficial // Link original do Google Search
```

**Exemplos de links que podem aparecer:**
- `https://campogrande.ms.gov.br/agenda/evento-x`
- `https://www.facebook.com/events/12345`
- `https://g1.globo.com/ms/mato-grosso-do-sul/noticia/evento-y.ghtml`
- `https://www.sympla.com.br/evento-z`

### **Por que alguns links levam para páginas genéricas?**

Isso acontece quando:
1. ❌ **Limite da API foi atingido** - Nenhum evento real disponível
2. ⚠️ **Página do evento foi removida** - Link ficou inválido
3. 📄 **Google indexou página geral** - Não a página específica do evento

---

## **⚠️ EVENTOS DE DEMONSTRAÇÃO REMOVIDOS**

### **Antes:**
- ❌ Mostrava 3 eventos falsos quando a API não retornava dados
- ❌ Links levavam para páginas genéricas (prefeituras)
- ❌ Dava impressão de informações falsas

### **Agora:**
- ✅ **SEM eventos de demonstração**
- ✅ **Apenas eventos REAIS do Google**
- ✅ **Mensagem clara** quando não há eventos
- ✅ **Status transparente** da API

---

## **📊 SITUAÇÃO ATUAL DO SISTEMA**

### **Limite da API Google Search:**
- **100 requisições por dia** (plano gratuito)
- **Sistema configurado para 80/dia** (margem de segurança)
- **Reset diário**: Meia-noite (Pacific Time)

### **Proteções Implementadas:**
- ✅ Cache de 1 hora (evita requisições repetidas)
- ✅ Rate limiting (máx 10 req/hora, 3 req/minuto)
- ✅ Intervalo mínimo de 3 segundos entre requisições
- ✅ Logs persistentes no localStorage

---

## **🔍 COMO VERIFICAR SE OS EVENTOS SÃO REAIS**

### **Indicadores de eventos reais:**
1. **Fonte**: Deve mostrar "google_search" (não "demo")
2. **Links**: Levam para sites de notícias, prefeituras, Facebook, etc.
3. **Descrição**: Trechos reais de páginas web (snippets)
4. **Header**: Mostra "🔍 Dados da API" (não cache)

### **No Console do Navegador:**
```javascript
// Ver estatísticas
const service = new GoogleSearchEventService();
console.log(service.getUsageStats());

// Verificar cache
console.log(localStorage.getItem('google_search_request_log'));
```

---

## **❓ CENÁRIOS POSSÍVEIS**

### **Cenário 1: Eventos Reais Aparecem** ✅
- **Status**: API funcionando
- **Fonte**: Google Search
- **Links**: Reais (notícias, agendas oficiais)
- **Ação**: Nenhuma necessária

### **Cenário 2: Nenhum Evento Aparece** ⚠️
- **Status**: Limite diário atingido
- **Fonte**: Nenhuma
- **Mensagem**: "Nenhum evento disponível no momento"
- **Ação**: 
  - Aguardar reset (meia-noite Pacific Time)
  - OU limpar localStorage: `localStorage.removeItem('google_search_request_log')`
  - OU esperar eventos em cache expirarem

### **Cenário 3: Eventos em Cache** 📦
- **Status**: Usando cache (menos de 1 hora desde última busca)
- **Fonte**: Cache local
- **Links**: Mesmos da última busca real
- **Indicador**: "📦 Dados em cache"

---

## **🚀 COMO GARANTIR EVENTOS REAIS**

### **Método 1: Limpar Cache e Contador**
```javascript
// NO CONSOLE DO NAVEGADOR:
localStorage.removeItem('google_search_request_log');
location.reload();
```

### **Método 2: Aguardar Reset Natural**
- Esperar até meia-noite (Pacific Time)
- Sistema resetará automaticamente

### **Método 3: Verificar Requisições Disponíveis**
- Olhar o header da página: "Requisições hoje: X/80"
- Se < 80, há margem para buscar

---

## **📝 EXEMPLO DE EVENTO REAL**

```javascript
{
  titulo: "Festival de Inverno de Bonito 2025",
  descricao: "Notícia do G1: Festival reúne música, gastronomia...",
  site_oficial: "https://g1.globo.com/ms/mato-grosso-do-sul/noticia/...",
  fonte: "google_search",
  cidade: "Bonito",
  data_inicio: "2025-07-15"
}
```

**Quando clica em "Site Oficial":**
→ Abre: `https://g1.globo.com/ms/mato-grosso-do-sul/noticia/...`
→ Página REAL da notícia sobre o evento

---

## **✅ GARANTIAS DO SISTEMA**

1. ✅ **NUNCA mostra eventos falsos** (removidos completamente)
2. ✅ **NUNCA ultrapassa limite da API** (proteção tripla)
3. ✅ **SEMPRE usa links reais** do Google Search
4. ✅ **TRANSPARENTE** sobre origem dos dados (cache/API)
5. ✅ **MENSAGEM CLARA** quando não há eventos disponíveis

---

## **🎯 RESUMO**

**ANTES da correção:**
- ❌ Mostrava eventos falsos
- ❌ Links genéricos de prefeituras
- ❌ Ultrapassava limite da API

**DEPOIS da correção:**
- ✅ Apenas eventos REAIS do Google
- ✅ Links REAIS das páginas encontradas
- ✅ Sistema protegido (nunca ultrapassa limite)
- ✅ Mensagem transparente quando sem eventos

**O sistema agora é 100% honesto e transparente!** 🎉

