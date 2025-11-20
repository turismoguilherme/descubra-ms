# 🏗️ PROPOSTA DE ARQUITETURA - Sistema de Atendentes e Pesquisa com Turistas

## 📋 CONTEXTO E REQUISITOS

### **O que já existe:**
- ✅ Sistema de check-in por geolocalização (parcial)
- ✅ Tabelas no Supabase para atendentes
- ✅ Dashboard público básico
- ✅ APIs: Google Search ✅, Gemini ✅
- ❌ API ALUMIA (não tem ainda)

### **O que precisa ser implementado:**
1. **Sistema de Ponto por Geolocalização Completo**
2. **Cadastro de Atendentes pelo Dashboard Público**
3. **Forçar Troca de Senha no Primeiro Acesso**
4. **Sistema de Pesquisa com Turistas no CAT**
5. **Integração com Dashboard Público (visualização em tempo real)**

---

## 🎯 FUNDAMENTAÇÃO TEÓRICA (SIT e SISTUR)

### **SIT - Sheldon (1997)**
**Aplicação:** Sistema coleta dados de atendimento, processa informações de turistas, armazena no Supabase e dissemina para gestores públicos.

### **SISTUR - Mário Beni**
**Aplicação:** 
- **Oferta:** Inventário turístico (secretaria cadastra)
- **Demanda:** Dados de turistas (coletados nos CATs)
- **Infraestrutura:** CATs e atendentes
- **Informação:** Dashboard público com análises

---

## 🏗️ ARQUITETURA PROPOSTA

### **1. FLUXO DE CADASTRO DE ATENDENTE**

```
┌─────────────────────────────────────────────────┐
│  DASHBOARD PÚBLICO (Secretaria)                 │
│  ┌──────────────────────────────────────────┐  │
│  │ 1. Secretaria acessa "Gestão de CATs"    │  │
│  │ 2. Clica em "Adicionar Atendente"        │  │
│  │ 3. Preenche formulário:                  │  │
│  │    - Nome completo                       │  │
│  │    - Email                               │  │
│  │    - Telefone                            │  │
│  │    - CAT (seleciona qual CAT)            │  │
│  │    - Horário de trabalho                 │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  BACKEND (Supabase Functions)                   │
│  ┌──────────────────────────────────────────┐  │
│  │ 1. Cria usuário no auth.users            │  │
│  │ 2. Gera senha temporária aleatória       │  │
│  │ 3. Define role = 'atendente'             │  │
│  │ 4. Marca flag: must_change_password=true │  │
│  │ 5. Associa atendente ao CAT              │  │
│  │ 6. Envia email com credenciais           │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  PRIMEIRO ACESSO (Atendente)                    │
│  ┌──────────────────────────────────────────┐  │
│  │ 1. Atendente recebe email                │  │
│  │ 2. Faz login com senha temporária        │  │
│  │ 3. Sistema detecta: must_change_password │  │
│  │ 4. REDIRECIONA para tela de troca        │  │
│  │ 5. OBRIGA trocar senha                   │  │
│  │ 6. Após trocar, libera acesso            │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### **2. SISTEMA DE PONTO POR GEOLOCALIZAÇÃO**

```
┌─────────────────────────────────────────────────┐
│  APP/SISTEMA DO ATENDENTE                       │
│  ┌──────────────────────────────────────────┐  │
│  │ 1. Atendente clica "Bater Ponto"         │  │
│  │ 2. Sistema solicita permissão GPS        │  │
│  │ 3. Obtém coordenadas (lat/lng)           │  │
│  │ 4. Calcula distância até CAT             │  │
│  │ 5. Valida se está dentro do raio (ex: 100m)│
│  │ 6. Se válido:                            │  │
│  │    - Salva check-in no Supabase          │  │
│  │    - Registra horário                    │  │
│  │    - Atualiza status = "ativo"           │  │
│  │ 7. Se inválido:                          │  │
│  │    - Mostra erro                         │  │
│  │    - Informa distância                   │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  SUPABASE (Tabela: attendant_checkins)          │
│  ┌──────────────────────────────────────────┐  │
│  │ - attendant_id                           │  │
│  │ - location_id (CAT)                      │  │
│  │ - latitude, longitude                    │  │
│  │ - checkin_time                           │  │
│  │ - checkout_time (null se ainda ativo)    │  │
│  │ - is_valid                               │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  DASHBOARD PÚBLICO (Tempo Real)                 │
│  ┌──────────────────────────────────────────┐  │
│  │ 1. WebSocket ou Polling atualiza dados   │  │
│  │ 2. Mostra atendentes ativos por CAT      │  │
│  │ 3. Exibe horário de check-in             │  │
│  │ 4. Mostra localização no mapa            │  │
│  │ 5. Alerta se atendente está fora do CAT  │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### **3. SISTEMA DE PESQUISA COM TURISTAS**

```
┌─────────────────────────────────────────────────┐
│  APP/SISTEMA DO ATENDENTE                       │
│  ┌──────────────────────────────────────────┐  │
│  │ 1. Turista chega no CAT                  │  │
│  │ 2. Atendente clica "Nova Pesquisa"       │  │
│  │ 3. Preenche formulário:                  │  │
│  │    ┌──────────────────────────────────┐  │  │
│  │    │ DADOS DO TURISTA:                │  │  │
│  │    │ - Nome (opcional)                │  │  │
│  │    │ - Origem (estado/país)           │  │  │
│  │    │ - Idade (faixa)                  │  │  │
│  │    │                                  │  │  │
│  │    │ PERGUNTA FEITA:                  │  │  │
│  │    │ - O que perguntou? (texto livre) │  │  │
│  │    │                                  │  │  │
│  │    │ TIPO DE PERGUNTA:                │  │  │
│  │    │ ☐ Informação turística           │  │  │
│  │    │ ☐ Localização/roteiro            │  │  │
│  │    │ ☐ Hospedagem                     │  │  │
│  │    │ ☐ Gastronomia                    │  │  │
│  │    │ ☐ Eventos                        │  │  │
│  │    │ ☐ Transporte                     │  │  │
│  │    │ ☐ Outros                         │  │  │
│  │    │                                  │  │  │
│  │    │ MOTIVAÇÃO DA VIAGEM:             │  │  │
│  │    │ ☐ Lazer                          │  │  │
│  │    │ ☐ Negócios                       │  │  │
│  │    │ ☐ Visita a familiares            │  │  │
│  │    │ ☐ Eventos                        │  │  │
│  │    │ ☐ Natureza/aventura              │  │  │
│  │    │ ☐ Cultura                        │  │  │
│  │    │                                  │  │  │
│  │    │ OBSERVAÇÕES:                     │  │  │
│  │    │ (campo texto livre)              │  │  │
│  │    └──────────────────────────────────┘  │  │
│  │ 4. Salva no Supabase                    │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  SUPABASE (Tabela: tourist_surveys)             │
│  ┌──────────────────────────────────────────┐  │
│  │ - id                                     │  │
│  │ - cat_id                                 │  │
│  │ - attendant_id                           │  │
│  │ - survey_date                            │  │
│  │ - tourist_name (opcional)                │  │
│  │ - tourist_origin                         │  │
│  │ - tourist_age_range                      │  │
│  │ - question_asked (texto)                 │  │
│  │ - question_type (array)                  │  │
│  │ - travel_motivation (array)              │  │
│  │ - observations (texto)                   │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  DASHBOARD PÚBLICO (Análises)                   │
│  ┌──────────────────────────────────────────┐  │
│  │ 1. Estatísticas de pesquisas:            │  │
│  │    - Total de pesquisas por dia          │  │
│  │    - Origem dos turistas                 │  │
│  │    - Tipos de perguntas mais comuns      │  │
│  │    - Motivações de viagem                │  │
│  │                                          │  │
│  │ 2. Gráficos:                             │  │
│  │    - Origem dos turistas (pie chart)     │  │
│  │    - Tipos de perguntas (bar chart)      │  │
│  │    - Motivações (bar chart)              │  │
│  │                                          │  │
│  │ 3. Insights:                             │  │
│  │    - "60% perguntam sobre hospedagem"    │  │
│  │    - "Principal origem: São Paulo"       │  │
│  │    - "Maior motivação: Lazer"            │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## 📊 ESTRUTURA DE DADOS (Supabase)

### **Tabela: attendant_checkins** (já existe, melhorar)
```sql
CREATE TABLE attendant_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attendant_id UUID NOT NULL REFERENCES auth.users(id),
  cat_id UUID NOT NULL REFERENCES cat_locations(id),
  
  -- Geolocalização
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy INTEGER, -- precisão GPS em metros
  distance_from_cat INTEGER, -- distância calculada em metros
  
  -- Horários
  checkin_time TIMESTAMPTZ DEFAULT NOW(),
  checkout_time TIMESTAMPTZ,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active', -- active, completed, invalid
  is_valid BOOLEAN DEFAULT true,
  rejection_reason TEXT,
  
  -- Metadados
  device_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Tabela: tourist_surveys** (NOVA - criar)
```sql
CREATE TABLE tourist_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relacionamentos
  cat_id UUID NOT NULL REFERENCES cat_locations(id),
  attendant_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Data da pesquisa
  survey_date TIMESTAMPTZ DEFAULT NOW(),
  
  -- Dados do turista
  tourist_name TEXT, -- opcional (LGPD)
  tourist_origin VARCHAR(100), -- estado ou país
  tourist_age_range VARCHAR(20), -- ex: "26-35"
  
  -- Pergunta feita
  question_asked TEXT NOT NULL, -- o que o turista perguntou
  question_type TEXT[] NOT NULL, -- array: ["informacao_turistica", "hospedagem"]
  
  -- Motivação
  travel_motivation TEXT[] NOT NULL, -- array: ["lazer", "natureza"]
  
  -- Observações
  observations TEXT,
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_tourist_surveys_cat ON tourist_surveys(cat_id);
CREATE INDEX idx_tourist_surveys_date ON tourist_surveys(survey_date);
CREATE INDEX idx_tourist_surveys_origin ON tourist_surveys(tourist_origin);
```

### **Tabela: users** (adicionar campo)
```sql
-- Adicionar campo para forçar troca de senha
ALTER TABLE auth.users 
ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT false;

-- Ou criar tabela de metadados
CREATE TABLE user_metadata (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  must_change_password BOOLEAN DEFAULT false,
  password_changed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔄 INTEGRAÇÃO ENTRE MÓDULOS

### **Como os módulos se comunicam:**

```
┌─────────────────────────────────────────────────┐
│  MÓDULO 1: GESTÃO DE ATENDENTES                 │
│  └─ Cadastra atendente                          │
│      ↓                                          │
│  MÓDULO 2: SISTEMA DE PONTO                     │
│  └─ Atendente bate ponto                        │
│      ↓                                          │
│  MÓDULO 3: DASHBOARD PÚBLICO                    │
│  └─ Mostra atendentes ativos em tempo real      │
│      ↓                                          │
│  MÓDULO 4: PESQUISA COM TURISTAS                │
│  └─ Atendente registra pesquisa                 │
│      ↓                                          │
│  MÓDULO 5: ANÁLISES E RELATÓRIOS                │
│  └─ Dashboard mostra estatísticas               │
│      ↓                                          │
│  MÓDULO 6: IA ESTRATÉGICA                       │
│  └─ IA analisa dados e sugere ações             │
```

### **Comunicação em Tempo Real:**

**Opção 1: WebSockets (Supabase Realtime)**
```typescript
// Dashboard público escuta mudanças
supabase
  .channel('attendant-checkins')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'attendant_checkins' },
    (payload) => {
      // Atualiza dashboard em tempo real
      updateDashboard(payload.new);
    }
  )
  .subscribe();
```

**Opção 2: Polling (mais simples)**
```typescript
// Dashboard faz requisição a cada 30 segundos
setInterval(async () => {
  const checkins = await fetchRecentCheckins();
  updateDashboard(checkins);
}, 30000);
```

---

## 🎨 INTERFACES PROPOSTAS

### **1. Tela de Cadastro de Atendente (Dashboard Público)**

```
┌─────────────────────────────────────────────┐
│  Adicionar Atendente                        │
├─────────────────────────────────────────────┤
│                                             │
│  Nome Completo *                            │
│  [___________________________]              │
│                                             │
│  Email *                                    │
│  [___________________________]              │
│                                             │
│  Telefone                                   │
│  [___________________________]              │
│                                             │
│  CAT *                                      │
│  [▼ Selecione o CAT        ]               │
│    - CAT Campo Grande                       │
│    - CAT Bonito                             │
│    - CAT Corumbá                            │
│    - CAT Dourados                           │
│                                             │
│  Horário de Trabalho                        │
│  De: [08:00] Até: [18:00]                  │
│                                             │
│  [ ] Enviar email com credenciais           │
│                                             │
│  [Cancelar]  [Salvar e Enviar Email]       │
└─────────────────────────────────────────────┘
```

### **2. Tela de Troca de Senha (Primeiro Acesso)**

```
┌─────────────────────────────────────────────┐
│  ⚠️ Troca de Senha Obrigatória              │
├─────────────────────────────────────────────┤
│                                             │
│  Por segurança, você precisa alterar sua    │
│  senha antes de continuar.                  │
│                                             │
│  Senha Atual (temporária) *                 │
│  [___________________________]              │
│                                             │
│  Nova Senha *                               │
│  [___________________________]              │
│  Mínimo 8 caracteres                        │
│                                             │
│  Confirmar Nova Senha *                     │
│  [___________________________]              │
│                                             │
│  [Alterar Senha]                            │
└─────────────────────────────────────────────┘
```

### **3. Tela de Pesquisa com Turista (App Atendente)**

```
┌─────────────────────────────────────────────┐
│  Nova Pesquisa com Turista                  │
├─────────────────────────────────────────────┤
│                                             │
│  DADOS DO TURISTA                           │
│  ────────────────────────                   │
│  Nome (opcional)                            │
│  [___________________________]              │
│                                             │
│  Origem *                                   │
│  [▼ Selecione o estado/país]               │
│                                             │
│  Idade                                      │
│  [▼ Selecione a faixa etária]              │
│                                             │
│  PERGUNTA FEITA                             │
│  ────────────────────────                   │
│  O que o turista perguntou? *               │
│  [_________________________________]        │
│  [_________________________________]        │
│                                             │
│  TIPO DE PERGUNTA *                         │
│  ☐ Informação turística                     │
│  ☐ Localização/roteiro                      │
│  ☐ Hospedagem                               │
│  ☐ Gastronomia                              │
│  ☐ Eventos                                  │
│  ☐ Transporte                               │
│  ☐ Outros                                   │
│                                             │
│  MOTIVAÇÃO DA VIAGEM *                      │
│  ☐ Lazer                                    │
│  ☐ Negócios                                 │
│  ☐ Visita a familiares                      │
│  ☐ Eventos                                  │
│  ☐ Natureza/aventura                        │
│  ☐ Cultura                                  │
│                                             │
│  OBSERVAÇÕES                                │
│  [_________________________________]        │
│                                             │
│  [Cancelar]  [Salvar Pesquisa]              │
└─────────────────────────────────────────────┘
```

### **4. Dashboard Público - Seção de Atendentes**

```
┌─────────────────────────────────────────────┐
│  Gestão de Atendentes                       │
├─────────────────────────────────────────────┤
│                                             │
│  ATENDENTES ATIVOS AGORA                    │
│  ────────────────────────                   │
│  ┌─────────────────────────────────────┐   │
│  │ CAT Campo Grande                    │   │
│  │ ┌───────────────────────────────┐   │   │
│  │ │ 👤 João Silva                 │   │   │
│  │ │ 🕐 Check-in: 08:15            │   │   │
│  │ │ 📍 Distância: 25m do CAT      │   │   │
│  │ │ ✅ Status: Ativo              │   │   │
│  │ └───────────────────────────────┘   │   │
│  │ ┌───────────────────────────────┐   │   │
│  │ │ 👤 Maria Santos               │   │   │
│  │ │ 🕐 Check-in: 08:30            │   │   │
│  │ │ 📍 Distância: 15m do CAT      │   │   │
│  │ │ ✅ Status: Ativo              │   │   │
│  │ └───────────────────────────────┘   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ESTATÍSTICAS DE PESQUISAS                  │
│  ────────────────────────                   │
│  ┌─────────────────────────────────────┐   │
│  │ Hoje: 45 pesquisas                  │   │
│  │ Esta semana: 320 pesquisas          │   │
│  │                                      │   │
│  │ Origem dos Turistas:                │   │
│  │ [Gráfico Pizza]                     │   │
│  │                                      │   │
│  │ Tipos de Perguntas:                 │   │
│  │ [Gráfico Barras]                    │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [➕ Adicionar Atendente]                   │
└─────────────────────────────────────────────┘
```

---

## 🔐 SEGURANÇA E LGPD

### **Dados Coletados:**
- ✅ **Nome do turista:** Opcional (LGPD)
- ✅ **Origem:** Necessário para análise
- ✅ **Pergunta:** Necessário para melhorar atendimento
- ✅ **Motivação:** Necessário para planejamento

### **Conformidade LGPD:**
- ✅ Coleta apenas dados necessários
- ✅ Nome é opcional
- ✅ Dados agregados para análises
- ✅ Anonimização em relatórios públicos

---

## 🚀 PRÓXIMOS PASSOS (APÓS APROVAÇÃO)

### **Fase 1: Estrutura de Dados**
1. Criar tabela `tourist_surveys`
2. Adicionar campo `must_change_password` em users
3. Criar índices para performance

### **Fase 2: Cadastro de Atendentes**
1. Criar componente de cadastro no dashboard público
2. Implementar função Supabase para criar usuário
3. Implementar envio de email com credenciais
4. Implementar tela de troca de senha obrigatória

### **Fase 3: Sistema de Ponto**
1. Melhorar validação de geolocalização
2. Implementar check-out
3. Integrar com dashboard público (tempo real)

### **Fase 4: Pesquisa com Turistas**
1. Criar componente de formulário
2. Implementar salvamento no Supabase
3. Criar visualizações no dashboard público

### **Fase 5: Análises e Relatórios**
1. Criar gráficos de estatísticas
2. Implementar insights automáticos
3. Integrar com IA estratégica

---

## ❓ PERGUNTAS PARA VALIDAÇÃO

1. **Raio de geolocalização:** Qual distância máxima do CAT para validar check-in? (sugestão: 100m)
2. **Obrigatoriedade de nome:** Nome do turista deve ser obrigatório ou opcional? (sugestão: opcional)
3. **Frequência de atualização:** Dashboard deve atualizar em tempo real (WebSocket) ou polling? (sugestão: polling a cada 30s)
4. **Email de credenciais:** Enviar email automático ou apenas mostrar credenciais na tela? (sugestão: ambos)
5. **Validação de senha:** Quais requisitos para nova senha? (sugestão: mínimo 8 caracteres)

---

**Aguardando sua aprovação para implementar! 🚀**

