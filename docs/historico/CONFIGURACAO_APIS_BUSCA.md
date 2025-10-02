# 🔍 CONFIGURAÇÃO DE APIs DE BUSCA REAL

## **📋 Visão Geral**

Este documento explica como configurar APIs de busca real para o Guatá, substituindo a busca simulada por informações atualizadas e verificáveis.

## **🚀 APIs Disponíveis**

### **1. Google Custom Search API**
- **Função:** Busca específica em sites oficiais de MS
- **Vantagens:** Resultados filtrados e confiáveis
- **Custo:** Gratuito até 100 consultas/dia

### **2. Sistema de Verificação Integrado**
- **Função:** Verifica informações antes de responder
- **Vantagens:** Garante confiabilidade
- **Custo:** Zero (interno)

## **⚙️ Configuração**

### **Passo 1: Google Custom Search API**

1. **Criar projeto no Google Cloud Console:**
   ```
   https://console.cloud.google.com/
   ```

2. **Ativar Custom Search API:**
   - Vá para "APIs & Services" > "Library"
   - Procure por "Custom Search API"
   - Clique em "Enable"

3. **Criar credenciais:**
   - Vá para "APIs & Services" > "Credentials"
   - Clique em "Create Credentials" > "API Key"
   - Copie a chave gerada

4. **Criar Search Engine:**
   - Acesse: https://programmablesearchengine.google.com/
   - Clique em "Create a search engine"
   - Configure para buscar em sites específicos de MS

### **Passo 2: Variáveis de Ambiente**

Adicione ao seu arquivo `.env`:

```env
# Google Search API
GOOGLE_SEARCH_API_KEY=sua_chave_api_aqui
GOOGLE_SEARCH_ENGINE_ID=seu_search_engine_id_aqui

# Configurações de Busca
VITE_ENABLE_REAL_WEB_SEARCH=true
VITE_MIN_CONFIDENCE_SCORE=0.7
```

### **Passo 3: Sites Oficiais Configurados**

O sistema já está configurado para buscar em:

- `fundtur.ms.gov.br` - Fundação de Turismo de MS
- `campogrande.ms.gov.br` - Prefeitura de Campo Grande
- `bonito.ms.gov.br` - Prefeitura de Bonito
- `corumba.ms.gov.br` - Prefeitura de Corumbá
- `bioparque.com` - Bioparque Pantanal
- `turismo.ms.gov.br` - Portal de Turismo de MS

## **🔧 Como Funciona**

### **Fluxo de Busca:**

1. **Usuário faz pergunta específica**
   ```
   "Hotéis perto do shopping Campo Grande"
   ```

2. **Sistema detecta necessidade de busca real**
   - Identifica palavras-chave: "hotéis", "Campo Grande"
   - Ativa busca na Google Search API

3. **Busca em fontes oficiais**
   - Restringe busca aos sites oficiais de MS
   - Filtra por relevância e confiabilidade

4. **Verificação cruzada**
   - Compara informações de múltiplas fontes
   - Calcula score de confiança

5. **Resposta verificada**
   - Se confiança > 70%: responde com informações reais
   - Se confiança < 70%: gera resposta alternativa

### **Exemplo de Resposta Real:**

```
✅ ENCONTRADO: Hotel Campo Grande Plaza
📍 Localização: Rua 14 de Julho, 123 - Centro
📞 Contato: (67) 3321-1234
💰 Preço: A partir de R$ 200/noite
🔗 Site: https://hotelcampogrande.com.br
```

### **Exemplo de Resposta Alternativa:**

```
Para encontrar hotéis perto do Shopping Campo Grande, recomendo consultar diretamente os sites oficiais de reservas como Booking.com, Airbnb ou os sites dos próprios hotéis para informações atualizadas sobre disponibilidade e preços.
```

## **📊 Monitoramento**

### **Dashboard de Verificação:**

O sistema gera logs detalhados para administradores:

```
🔍 VERIFICAÇÃO: SUCESSO
📊 Confiança: 85% (3 fontes consultadas)
✅ Verificação cruzada: APROVADA
📝 Fontes: fundtur.ms.gov.br, booking.com, hotelcampogrande.com.br
⏰ Última verificação: 2025-01-15 14:30:00
```

### **Estatísticas Disponíveis:**

- Total de consultas
- Taxa de verificação
- Confiança média
- Fontes mais consultadas
- Tempo de resposta

## **🛠️ Manutenção**

### **Atualização de Fontes:**

Para adicionar novas fontes confiáveis:

1. Edite `src/services/ai/search/googleSearchAPI.ts`
2. Adicione o domínio em `OFFICIAL_SITES`
3. Teste a busca

### **Ajuste de Confiabilidade:**

Para ajustar o nível de confiança:

1. Edite `VITE_MIN_CONFIDENCE_SCORE` no `.env`
2. Valores: 0.0 (muito permissivo) a 1.0 (muito restritivo)
3. Recomendado: 0.7

## **🚨 Troubleshooting**

### **Erro: "API keys não configuradas"**

**Solução:**
1. Verifique se as variáveis de ambiente estão corretas
2. Confirme se a API key tem permissões adequadas
3. Teste a conexão com a API

### **Erro: "Nenhum resultado encontrado"**

**Solução:**
1. Verifique se o Search Engine ID está correto
2. Confirme se os sites estão indexados
3. Teste com queries mais genéricas

### **Performance Lenta**

**Solução:**
1. Implemente cache de resultados
2. Otimize queries de busca
3. Use busca paralela quando possível

## **📈 Próximos Passos**

### **Fase 2: APIs Adicionais**

- **Booking.com API** - Para reservas de hotéis
- **TripAdvisor API** - Para avaliações de restaurantes
- **OpenWeather API** - Para informações climáticas
- **Google Places API** - Para localizações específicas

### **Fase 3: Machine Learning**

- **Sistema de aprendizado** - Melhora precisão ao longo do tempo
- **Detecção de padrões** - Identifica informações desatualizadas
- **Recomendações personalizadas** - Baseadas no histórico do usuário

## **✅ Checklist de Configuração**

- [ ] Google Cloud Console configurado
- [ ] Custom Search API ativada
- [ ] API Key criada
- [ ] Search Engine configurado
- [ ] Variáveis de ambiente definidas
- [ ] Sites oficiais adicionados
- [ ] Teste de busca realizado
- [ ] Sistema de verificação ativo
- [ ] Logs de monitoramento funcionando

## **🎯 Benefícios**

### **Para Usuários:**
- ✅ Informações sempre atualizadas
- ✅ Zero informações inventadas
- ✅ Respostas confiáveis
- ✅ Direcionamento para fontes oficiais

### **Para Administradores:**
- ✅ Controle total sobre fontes
- ✅ Monitoramento em tempo real
- ✅ Relatórios detalhados
- ✅ Facilidade de manutenção

---

**📞 Suporte:** Em caso de dúvidas sobre configuração, consulte a documentação ou entre em contato com a equipe técnica. 