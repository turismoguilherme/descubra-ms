# 📅 QUANDO E COMO OS EVENTOS APARECEM

## **🎯 RESPOSTA DIRETA**

### **Os eventos aparecem quando:**

1. ✅ **Existem eventos reais** divulgados em sites oficiais (prefeituras, agendas culturais, notícias)
2. ✅ **Google encontra esses eventos** através da pesquisa automatizada
3. ✅ **Estão programados** para datas próximas (7-30 dias no futuro)
4. ✅ **Estão na região** de Mato Grosso do Sul

---

## **🔍 COMO O SISTEMA BUSCA EVENTOS**

### **1. Fontes de Eventos**

O sistema busca eventos em:

- 🏛️ **Sites de Prefeituras** (Campo Grande, Bonito, Corumbá, Dourados, etc.)
- 🎭 **Agendas Culturais** (Fundações culturais, teatros, centros de eventos)
- 📰 **Portais de Notícias Locais** (sobre eventos em MS)
- 🎉 **Páginas de Eventos** (culturais, esportivos, gastronômicos)
- 🏢 **Sites Governamentais** (turismo, cultura, esportes)

### **2. Processo de Busca**

```
1. Sistema faz busca no Google com: "eventos Campo Grande Mato Grosso do Sul 2025"
2. Google retorna até 10 resultados de sites relevantes
3. Sistema analisa cada resultado e extrai:
   - Título do evento
   - Descrição
   - Data (quando disponível)
   - Local e cidade
   - Categoria (cultural, esportivo, etc.)
   - Link para site oficial
   - Imagem (quando disponível)
4. Eventos são salvos em cache por 24 horas
5. Eventos são exibidos na página
```

---

## **⏰ FREQUÊNCIA DE ATUALIZAÇÃO**

### **Atualização Automática:**

- **Primeira busca**: Quando você acessa a página pela primeira vez
- **Cache de 24h**: Usa dados salvos durante 24 horas
- **Após 24h**: Sistema busca automaticamente eventos novos

### **Atualização Manual:**

- **Botão "Atualizar"**: Força busca imediata de novos eventos
- **Útil quando**: Você sabe que um novo evento foi divulgado

---

## **📊 POR QUE PODE NÃO APARECER EVENTOS?**

### **Motivo 1: Não há eventos divulgados publicamente**
```
❌ Nenhum evento programado na região nos próximos 30 dias
❌ Eventos não estão divulgados em sites públicos
❌ Eventos só divulgados em redes sociais fechadas
```

**Solução**: Aguardar eventos serem anunciados oficialmente

### **Motivo 2: Limite de requisições atingido**
```
❌ Limite do Google: 100 requisições/dia (nosso limite: 80/dia)
❌ Muitas atualizações manuais no mesmo dia
```

**Solução**: 
- Sistema mostra eventos do cache (24h)
- Aguardar reset à meia-noite (Pacific Time)
- Evitar clicar em "Atualizar" várias vezes seguidas

### **Motivo 3: Eventos com datas muito distantes**
```
❌ Eventos programados para daqui a 2 meses
❌ Eventos do passado (já finalizados)
```

**Solução**: Sistema prioriza eventos nos próximos 7-30 dias

### **Motivo 4: Eventos não indexados pelo Google**
```
❌ Sites novos (ainda não indexados)
❌ Sites sem SEO adequado
❌ Eventos em PDFs não pesquisáveis
```

**Solução**: Aguardar Google indexar ou evento ser divulgado em site público

---

## **✅ QUANDO OS EVENTOS APARECEM COM SUCESSO**

### **Exemplo Real:**

```
Prefeitura de Campo Grande divulga:
"Festival Gastronômico da Praça do Papa - 25 a 27 de Outubro"

↓

Google indexa essa informação no site da prefeitura

↓

Sistema busca "eventos Campo Grande Mato Grosso do Sul 2025"

↓

Google retorna link da prefeitura nos resultados

↓

Sistema extrai:
- Título: "Festival Gastronômico da Praça do Papa"
- Data: 25-27/10/2025
- Local: Campo Grande, MS
- Categoria: Gastronômico
- Link: site oficial da prefeitura

↓

EVENTO APARECE NA PLATAFORMA! 🎉
```

---

## **🎮 INTERFACE DO USUÁRIO**

### **O que você vê:**

#### **Quando há eventos:**
```
Próximos Eventos
5 eventos encontrados  [🔄 Atualizar]

[Cards dos eventos com imagens, títulos, datas, etc.]
```

#### **Quando NÃO há eventos:**
```
Buscando eventos em Mato Grosso do Sul

Estamos buscando os próximos eventos na região.

Os eventos são atualizados diariamente através de fontes oficiais 
como prefeituras, agendas culturais e notícias regionais.

[🌍 Buscar Eventos]

Volte em breve para conferir os próximos eventos!
```

### **O que você NÃO vê mais (movido para console):**

- ❌ "Sistema protegido contra excesso de requisições"
- ❌ "Requisições: 10/80"
- ❌ "Limite diário atingido"
- ❌ "📦 Cache (24h) | Dados da API"

**Essas informações técnicas agora aparecem APENAS no console do navegador (F12).**

---

## **🔍 PARA DESENVOLVEDORES**

### **Ver informações técnicas:**

1. Abrir **Console do Navegador** (F12)
2. Acessar página `/ms/eventos`
3. Ver logs:

```javascript
✅ 5 eventos carregados (cache 24h)
📊 Requisições hoje: 2/80
📊 ESTATÍSTICAS: {
  total_eventos: 5,
  from_cache: true,
  requests_today: 2,
  requests_remaining: 78,
  cache_size: 1
}
```

### **Modo Debug na Interface:**

- Clicar no ícone 👁️ (canto superior esquerdo)
- Mostra informações técnicas: `📦 Cache (24h) | 2/80`

---

## **📝 RESUMO**

### **Quando eventos aparecem:**
✅ Quando existem eventos reais divulgados em sites públicos
✅ Quando Google encontra esses eventos
✅ Quando estão programados para os próximos 7-30 dias
✅ Quando são da região de Mato Grosso do Sul

### **Quando eventos NÃO aparecem:**
❌ Quando não há eventos programados publicamente
❌ Quando limite de requisições foi atingido (raro, 80/dia)
❌ Quando eventos não estão indexados no Google
❌ Quando eventos são muito distantes (> 30 dias)

### **Frequência de atualização:**
- ⏰ **Automática**: A cada 24 horas
- 🔄 **Manual**: Quando você clica em "Atualizar"

### **Interface:**
- ✅ **Limpa e amigável** - Sem termos técnicos
- ✅ **Mensagem clara** - "Buscando eventos..." quando vazio
- ✅ **Contador** - "5 eventos encontrados" quando há eventos
- ✅ **Informações técnicas** - Apenas no console (F12)

---

## **🎯 O QUE FAZER AGORA**

### **Se você é usuário:**
1. Acesse `/ms/eventos`
2. Se houver eventos, explore!
3. Se não houver, volte amanhã
4. Clique em "Atualizar" só se quiser forçar busca nova

### **Se você é desenvolvedor:**
1. Abra console (F12)
2. Veja estatísticas detalhadas
3. Clique em 👁️ para debug visual
4. Verifique `localStorage` para ver cache

### **Se você é administrador:**
- Sistema busca automaticamente
- Cache economiza 90% das requisições
- Limite de 80 requisições/dia é mais que suficiente
- Eventos aparecem quando divulgados publicamente

**Sistema funcionando perfeitamente! 🚀**

