# 🗺️ CONSULTA: INTELIGÊNCIA GEOGRÁFICA E FILTROS DE DADOS - ViaJAR

## 📅 Data: Fevereiro 2025
## 🎯 Objetivo: Definir lógica de filtros geográficos e relevância de dados ANTES de implementar

---

## ⚠️ PONTO CRÍTICO IDENTIFICADO

**Você está absolutamente certo!** 

Dados de CAT de **Campo Grande** NÃO devem ser usados para análise de negócio em **Bonito**. A ViaJAR precisa ser **inteligente geograficamente** em todos os sentidos.

---

## 📋 RESUMO EXECUTIVO - O QUE PRECISO CONFIRMAR

### **✅ O QUE JÁ ENTENDI:**
1. ✅ Fluxo completo: CADASTUR → Plano → Pagamento → Consentimento → Perfil → Diagnóstico → Dashboard
2. ✅ Localização (cidade/estado) é coletada no perfil e diagnóstico
3. ✅ Dados devem ser filtrados geograficamente
4. ✅ CATs de Campo Grande não devem ser usados para Bonito
5. ✅ ViaJAR precisa ser inteligente em todos os sentidos

### **❓ O QUE PRECISO CONFIRMAR:**

**1. FILTROS GEOGRÁFICOS:**
- Raio de proximidade padrão? (50km, 100km?)
- Região turística: identificar automaticamente ou manual?
- Se não houver dados da cidade, expandir para região ou estado?

**2. DADOS DA ALUMIA:**
- A Alumia fornece dados filtrados por cidade ou devemos filtrar?
- Se negócio em Bonito, usar dados de Bonito ou de todo MS?
- Quais dados específicos a Alumia fornece?

**3. COMPETITIVE BENCHMARK:**
- Prioridade: cidade → região → estado?
- Raio de proximidade para concorrentes?

**4. MARKET INTELLIGENCE:**
- Origem turistas: apenas da mesma cidade ou também da região?

**5. REVENUE OPTIMIZER:**
- Eventos: apenas mesma cidade ou também região turística?

---

**Por favor, responda as perguntas abaixo para eu implementar corretamente!** 🚀

---

## 🔍 PERGUNTAS CRÍTICAS ANTES DE IMPLEMENTAR

### **1. FLUXO COMPLETO: Do Plano ao Dashboard**

**Fluxo identificado no código:**

```
1. Step 1: Verificação CADASTUR
   └─ ViaJAROnboarding.tsx
   └─ Componente: CadastURVerification

2. Step 2: Escolher Plano
   └─ ViaJAROnboarding.tsx
   └─ Componente: PlanSelector
   └─ Planos: Freemium, Professional, Enterprise, Government

3. Step 3: Pagamento (Stripe)
   └─ ViaJAROnboarding.tsx
   └─ Componente: StripeCheckout
   └─ Métodos: Cartão, PIX, Boleto
   └─ Após sucesso: redireciona para Step 4

4. Step 4: Termo de Consentimento LGPD (OBRIGATÓRIO)
   └─ ViaJAROnboarding.tsx
   └─ Componente: ConsentTerm
   └─ Usuário escolhe tipos de dados a compartilhar

5. Step 5: Completar Perfil
   └─ ViaJAROnboarding.tsx
   └─ Componente: ProfileCompletion
   └─ ✅ COLETA: cidade, estado, endereço completo
   └─ Salva em: user_profiles (city, state, address)

6. Step 6: Diagnóstico Inicial (opcional?)
   └─ DiagnosticQuestionnaire
   └─ ✅ COLETA: tipo de negócio, receita, ocupação, etc.
   └─ ✅ COLETA: cidade/estado (basicInfo.city, basicInfo.state)

7. Dashboard carrega
   └─ PrivateDashboard.tsx
   └─ Busca: user_profiles.city e user_profiles.state
   └─ Usa para filtrar dados geograficamente
```

**✅ Confirmado:**
- ProfileCompletion coleta cidade e estado (location.city, location.state)
- Dados salvos em `user_profiles.city` e `user_profiles.state`
- DiagnosticQuestionnaire também coleta cidade/estado (basicInfo.city, basicInfo.state)

**❓ Perguntas:**
- O diagnóstico acontece no onboarding ou depois?
- Se usuário mudar de cidade depois, os dados antigos devem ser invalidados?
- A localização do negócio é sempre a mesma do usuário ou pode ser diferente?

---

### **2. FILTROS GEOGRÁFICOS - Dados dos CATs**

**Problema identificado:**
- Dados de CAT de Campo Grande não devem ser usados para Bonito
- Dados de CAT de Bonito não devem ser usados para Campo Grande

**Proposta de lógica:**

```
SE negócio está em BONITO:
  ├─ Usar dados de CATs de BONITO
  ├─ Usar dados de CATs próximos (raio de X km?)
  └─ NÃO usar dados de CATs de Campo Grande

SE negócio está em CAMPO GRANDE:
  ├─ Usar dados de CATs de CAMPO GRANDE
  ├─ Usar dados de CATs próximos (raio de X km?)
  └─ NÃO usar dados de CATs de Bonito
```

**❓ Perguntas:**
1. **Raio de proximidade:** Qual o raio máximo? (ex: 50km, 100km?)
2. **Região:** Deve considerar região turística? (ex: Bonito + Bodoquena + Jardim = mesma região?)
3. **Prioridade:** Se não houver dados da cidade, usar dados da região ou do estado?
4. **Alumia:** Os dados da Alumia já vêm filtrados por cidade/região ou são gerais do MS?

---

### **3. DADOS DA ALUMIA - Escopo Completo**

**Você disse: "os dados da Alumia é todos os dados"**

**Baseado no site da Alumia (https://alumia.tur.br/):**
- Plataforma de Inteligência Turística do MS
- Módulos: Informações Gerais, Aéreo, Motores de Busca, Redes Sociais, Alojamento, Eventos
- Dados desde 2018
- Fontes: CAGED, Google, IATA, IBGE, Observatório, SEFAZ, STR, etc.

**❓ Preciso entender:**
1. **Escopo dos dados:**
   - A Alumia fornece dados de **todo o MS** ou filtrados por cidade/região?
   - Quando usar Alumia, devemos filtrar por cidade do negócio ou usar todos?
   - Se negócio está em Bonito, devemos usar dados de Bonito ou de todo MS?

2. **Endpoints da API:**
   - A Alumia tem endpoints específicos por cidade/região?
   - Exemplo: `/api/destinations/bonito` ou `/api/destinations?city=bonito`?
   - Ou devemos buscar todos e filtrar no nosso lado?

3. **Dados disponíveis:**
   - Quais dados específicos a Alumia fornece?
   - Fluxo turístico por cidade?
   - Ocupação hoteleira por cidade?
   - Origem dos turistas por destino?
   - Eventos por cidade?

4. **Filtragem:**
   - Se negócio está em Bonito:
     - Usar dados da Alumia de Bonito (se disponível)?
     - Ou dados gerais do MS e depois filtrar por Bonito?
     - Ou dados da região turística (Bonito + Bodoquena + Jardim)?

---

### **4. COMPETITIVE BENCHMARK - Identificação de Concorrentes**

**Lógica proposta:**

```
IDENTIFICAR CONCORRENTES:
├─ Mesma categoria (hotel, restaurante, etc.)
├─ Mesma cidade (prioridade 1)
├─ Região próxima (prioridade 2 - se não houver na cidade)
├─ Mesmo porte (pequeno, médio, grande)
└─ Dados agregados (com consentimento LGPD)
```

**❓ Perguntas:**
1. **Prioridade geográfica:**
   - Primeiro: mesma cidade
   - Segundo: região próxima (raio de quantos km?)
   - Terceiro: estado inteiro?
   - Quarto: nacional?

2. **Região turística:**
   - Bonito, Bodoquena, Jardim = mesma região?
   - Deve considerar isso na comparação?

3. **Porte do negócio:**
   - Como definir? (receita do cadastro?)
   - Faixas: pequeno (< R$ 15k), médio (R$ 15k-50k), grande (> R$ 50k)?

---

### **5. MARKET INTELLIGENCE - Origem dos Turistas**

**Lógica proposta:**

```
ORIGEM DOS TURISTAS:
├─ Dados dos CATs da MESMA cidade/região
├─ Dados da Alumia da MESMA cidade/região (se MS)
├─ Dados agregados (com consentimento) da MESMA região
└─ NÃO usar dados de outras cidades distantes
```

**❓ Perguntas:**
1. Se negócio está em Bonito:
   - Usar apenas dados de turistas que visitaram Bonito?
   - Ou também turistas que visitaram região (Bodoquena, Jardim)?

2. Se não houver dados suficientes da cidade:
   - Expandir para região?
   - Expandir para estado?
   - Mostrar aviso: "Dados limitados para sua cidade"?

---

### **6. REVENUE OPTIMIZER - Precificação Dinâmica**

**Lógica proposta:**

```
PREVISÃO DE DEMANDA:
├─ Eventos na MESMA cidade/região
├─ Sazonalidade da MESMA cidade/região
├─ Clima da MESMA cidade
├─ Dados históricos do PRÓPRIO negócio
└─ Dados agregados da MESMA região (com consentimento)
```

**❓ Perguntas:**
1. Eventos:
   - Considerar apenas eventos na mesma cidade?
   - Ou também eventos na região que atraem turistas para a cidade?

2. Sazonalidade:
   - Usar dados históricos do próprio negócio (prioridade 1)
   - Se não houver, usar dados agregados da região (prioridade 2)
   - Se não houver, usar dados do estado (prioridade 3)?

---

### **7. UPLOAD DE DOCUMENTOS - Contexto Geográfico**

**❓ Perguntas:**
1. Documentos anexados devem ser associados à localização do negócio?
2. Se usuário anexar planilha de ocupação, deve considerar apenas dados da própria cidade?
3. Documentos de outras cidades devem ser ignorados ou usados com peso menor?

---

### **8. DADOS DO DIAGNÓSTICO INICIAL**

**✅ Confirmado no código:**
- DiagnosticQuestionnaire coleta cidade/estado (basicInfo.city, basicInfo.state)
- ProfileCompletion também coleta cidade/estado (location.city, location.state)
- Dados salvos em `user_profiles.city` e `user_profiles.state`

**❓ Perguntas:**
1. Se houver diferença entre cidade do diagnóstico e cidade do perfil, qual usar?
2. Esses dados são usados para filtrar TODAS as análises do dashboard?
3. Se usuário mudar de cidade depois, os dados antigos devem ser invalidados?
4. Deve haver validação para garantir que cidade/estado estão corretos?

---

## 🎯 PROPOSTA DE LÓGICA GEOGRÁFICA INTELIGENTE

### **Hierarquia de Relevância Geográfica:**

```
1. PRÓPRIO NEGÓCIO (prioridade máxima)
   └─ Dados internos do negócio

2. MESMA CIDADE (prioridade alta)
   └─ CATs da mesma cidade
   └─ Eventos da mesma cidade
   └─ Dados agregados da mesma cidade

3. REGIÃO PRÓXIMA (prioridade média)
   └─ Raio de 50-100km (configurável)
   └─ Região turística (ex: Bonito + Bodoquena + Jardim)

4. ESTADO (prioridade baixa)
   └─ Apenas se não houver dados suficientes
   └─ Com aviso: "Dados do estado - precisão reduzida"

5. NACIONAL/INTERNACIONAL (prioridade mínima)
   └─ Apenas para tendências gerais
   └─ Com aviso claro sobre limitações
```

### **Exemplo Prático: Hotel em Bonito**

```
DADOS USADOS:
✅ CATs de Bonito (prioridade 1)
✅ CATs de Bodoquena e Jardim (prioridade 2 - mesma região turística)
✅ Eventos em Bonito (prioridade 1)
✅ Eventos em Bodoquena e Jardim (prioridade 2)
✅ Alumia - dados de Bonito (se disponível)
✅ Dados agregados de Bonito (com consentimento)
❌ CATs de Campo Grande (NÃO usar - muito distante)
❌ Eventos de Campo Grande (NÃO usar - não afetam Bonito)
```

---

## 📊 MATRIZ DE DECISÃO GEOGRÁFICA

| Tipo de Dado | Mesma Cidade | Região Próxima | Estado | Nacional |
|--------------|--------------|----------------|--------|----------|
| **CATs** | ✅ Usar | ✅ Usar (se < 100km) | ❌ Não usar | ❌ Não usar |
| **Eventos** | ✅ Usar | ✅ Usar (se região turística) | ❌ Não usar | ❌ Não usar |
| **Alumia** | ✅ Usar (filtrado) | ✅ Usar (filtrado) | ⚠️ Usar com aviso | ❌ Não usar |
| **Concorrentes** | ✅ Prioridade 1 | ✅ Prioridade 2 | ⚠️ Prioridade 3 | ❌ Não usar |
| **Origem Turistas** | ✅ Usar | ✅ Usar (região) | ⚠️ Usar com aviso | ❌ Não usar |
| **Sazonalidade** | ✅ Usar (próprio) | ✅ Usar (região) | ⚠️ Usar (estado) | ❌ Não usar |

---

## 🔧 CONFIGURAÇÕES PROPOSTAS

**Opções que usuário pode configurar:**

1. **Raio de proximidade:** (padrão: 50km)
   - Usuário pode ajustar: 25km, 50km, 100km, 200km

2. **Região turística:**
   - Sistema identifica automaticamente
   - Usuário pode confirmar/ajustar

3. **Nível de dados:**
   - "Apenas minha cidade" (mais preciso, menos dados)
   - "Minha região" (balanceado)
   - "Meu estado" (mais dados, menos preciso)

---

## 🧠 VIAJAR PRECISA SER INTELIGENTE EM TODOS OS SENTIDOS

**Você disse: "a viajAR tem que ser inteligente em todos os sentidos"**

### **Inteligência Geográfica (já discutido):**
- ✅ Filtrar dados por localização do negócio
- ✅ Não usar dados de cidades distantes
- ✅ Considerar região turística

### **Inteligência Contextual:**
- ✅ Entender tipo de negócio (hotel vs restaurante vs atração)
- ✅ Ajustar métricas e análises por tipo
- ✅ Mostrar apenas dados relevantes

### **Inteligência Temporal:**
- ✅ Considerar sazonalidade
- ✅ Considerar eventos programados
- ✅ Considerar feriados e datas especiais

### **Inteligência de Dados:**
- ✅ Priorizar dados mais precisos
- ✅ Mostrar qualidade/confiança dos dados
- ✅ Avisar quando dados são estimados

### **Inteligência de Recomendações:**
- ✅ Personalizar recomendações por perfil
- ✅ Considerar objetivos do negócio
- ✅ Priorizar ações de maior impacto

**❓ Perguntas:**
1. Há outros aspectos de "inteligência" que devo considerar?
2. A IA (Guilherme IA) deve aprender com o uso do usuário?
3. Deve haver sistema de feedback para melhorar recomendações?

---

## ❓ PERGUNTAS FINAIS PARA CONFIRMAÇÃO

### **1. Sobre Raio de Proximidade:**
- Qual raio padrão? (50km, 100km?)
- Deve ser configurável pelo usuário?

### **2. Sobre Região Turística:**
- Sistema deve identificar automaticamente?
- Ou usuário deve escolher manualmente?
- Exemplos: Bonito+Bodoquena+Jardim, Pantanal (Corumbá+Miranda), etc.

### **3. Sobre Dados da Alumia:**
- A Alumia fornece dados filtrados por cidade?
- Ou devemos filtrar no nosso lado?
- Se não houver dados da cidade, usar dados do estado com aviso?

### **4. Sobre Fallback:**
- Se não houver dados suficientes da cidade/região:
  - Mostrar aviso e usar dados do estado?
  - Ou mostrar aviso e não usar dados externos?

### **5. Sobre Concorrentes:**
- Primeiro: mesma cidade
- Segundo: região próxima (raio configurável)
- Terceiro: estado (com aviso)
- Está correto?

### **6. Sobre Eventos:**
- Eventos na mesma cidade: usar sempre
- Eventos na região: usar se região turística
- Eventos distantes: não usar
- Está correto?

---

## 🎯 RESUMO DA CONSULTA

**Pontos críticos identificados:**
1. ✅ Dados geográficos devem ser filtrados por localização do negócio
2. ✅ CATs de Campo Grande não devem ser usados para Bonito
3. ✅ ViaJAR precisa ser inteligente geograficamente
4. ✅ Dados da Alumia são "todos os dados" - preciso entender escopo
5. ✅ Fluxo completo identificado: CADASTUR → Plano → Pagamento → Consentimento → Perfil → Diagnóstico → Dashboard

**Fluxo completo mapeado:**
```
1. CADASTUR Verification
   └─ Valida registro turístico

2. Escolher Plano
   └─ Freemium, Professional, Enterprise, Government

3. Pagamento (Stripe)
   └─ Cartão, PIX, Boleto
   └─ Após sucesso → Termo de Consentimento

4. Termo de Consentimento LGPD (OBRIGATÓRIO)
   └─ Usuário escolhe tipos de dados a compartilhar
   └─ Salvo em: data_sharing_consents

5. Completar Perfil
   └─ ✅ COLETA: cidade, estado, endereço
   └─ Salvo em: user_profiles (city, state, address)

6. Diagnóstico Inicial (opcional?)
   └─ ✅ COLETA: tipo de negócio, receita, ocupação, etc.
   └─ ✅ COLETA: cidade, estado
   └─ Salvo em: diagnostic_answers

7. Dashboard Carrega
   └─ Busca: user_profiles.city e user_profiles.state
   └─ Aplica filtros geográficos em TODAS as análises
   └─ Revenue Optimizer, Market Intelligence, Benchmark
```

**Próximos passos:**
1. Você responde as perguntas acima
2. Eu ajusto a proposta com suas respostas
3. Você confirma
4. Eu implemento com a lógica geográfica correta

---

## 📝 CHECKLIST DE CONFIRMAÇÃO

Por favor, confirme ou ajuste:

- [ ] Fluxo de onboarding está correto (CADASTUR → Plano → Pagamento → Consentimento → Perfil → Diagnóstico)
- [ ] Localização (cidade/estado) é coletada no perfil e diagnóstico
- [ ] Dashboard deve usar localização para filtrar TODOS os dados
- [ ] CATs de Campo Grande NÃO devem ser usados para Bonito
- [ ] Dados da Alumia são "todos os dados" - preciso entender como filtrar
- [ ] ViaJAR precisa ser inteligente em todos os sentidos (geográfico, contextual, temporal, etc.)

---

**Por favor, responda as perguntas para eu implementar corretamente!** 🚀

