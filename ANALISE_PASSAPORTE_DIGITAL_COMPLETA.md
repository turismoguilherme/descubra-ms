# 📘 ANÁLISE COMPLETA DO PASSAPORTE DIGITAL

## 🎯 VISÃO GERAL

O **Passaporte Digital** é um sistema gamificado que permite aos turistas:
- ✅ Coletar carimbos digitais ao visitar pontos turísticos
- ✅ Completar rotas temáticas
- ✅ Ganhar pontos e recompensas
- ✅ Funcionar offline com sincronização automática

---

## 📋 FLUXO COMPLETO DO SISTEMA

### **1. CADASTRO DO PASSAPORTE (Usuário/Turista)**

#### **1.1. Inicialização Automática**
Quando um usuário faz login pela primeira vez no sistema:

```typescript
// Hook: usePassport.ts
1. Verifica se o usuário já tem passaporte
   ↓
2. Se NÃO tem:
   - Gera número único: "MS-{timestamp}-{random}"
   - Cria registro na tabela `user_passports`
   ↓
3. Se JÁ tem:
   - Retorna o passaporte existente
```

**Arquivos:**
- `src/hooks/usePassport.ts` - Hook principal
- `src/services/passport/passportService.ts` - Método `createPassport()`

**Tabela no Banco:**
```sql
user_passports (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  passport_number VARCHAR UNIQUE,  -- Ex: "MS-abc123-XYZ789"
  created_at TIMESTAMPTZ
)
```

#### **1.2. Quando o Passaporte é Criado?**
- ✅ Automaticamente no primeiro acesso ao sistema
- ✅ Quando o usuário acessa a página do Passaporte Digital
- ✅ Quando tenta fazer check-in pela primeira vez

**Não requer ação manual do usuário!**

---

### **2. ESTRUTURA DE DADOS**

#### **2.1. Rotas (Routes)**
```sql
routes (
  id UUID PRIMARY KEY,
  name VARCHAR,                    -- "Rota do Pantanal"
  description TEXT,
  region VARCHAR,                  -- "Pantanal"
  difficulty VARCHAR,              -- 'facil', 'medio', 'dificil'
  is_active BOOLEAN,
  video_url TEXT,                  -- Vídeo promocional
  passport_number_prefix VARCHAR,  -- "MS" (prefixo do número do passaporte)
  wallpaper_url TEXT,             -- Imagem de fundo do passaporte
  created_at TIMESTAMPTZ
)
```

**O que é uma Rota?**
- Uma sequência de checkpoints que o turista deve visitar
- Exemplo: "Rota do Pantanal" = 8 checkpoints em locais específicos

#### **2.2. Checkpoints (Pontos de Visitação)**
```sql
route_checkpoints (
  id UUID PRIMARY KEY,
  route_id UUID REFERENCES routes,
  name VARCHAR,                    -- "Mirante do Pantanal"
  description TEXT,
  order_sequence INTEGER,          -- Ordem na rota (1, 2, 3...)
  latitude NUMERIC,                -- Coordenada GPS
  longitude NUMERIC,               -- Coordenada GPS
  geofence_radius INTEGER,         -- Raio em metros (padrão: 100m)
  validation_mode VARCHAR,          -- 'geofence', 'code', 'mixed'
  partner_code VARCHAR,            -- Código do parceiro (se validation_mode = 'code' ou 'mixed')
  requires_photo BOOLEAN,          -- Se foto é obrigatória
  stamp_fragment_number INTEGER,   -- Qual fragmento do carimbo (1, 2, 3...)
  is_mandatory BOOLEAN,            -- Se é obrigatório para completar a rota
  created_at TIMESTAMPTZ
)
```

**O que é um Checkpoint?**
- Um ponto físico que o turista deve visitar
- Pode ser validado por:
  - **Geofence**: GPS (usuário precisa estar próximo)
  - **Code**: Código fornecido pelo parceiro
  - **Mixed**: Ambos (GPS + código)

#### **2.3. Carimbos (Stamps)**
```sql
passport_stamps (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  route_id UUID REFERENCES routes,
  checkpoint_id UUID REFERENCES route_checkpoints,
  stamp_type VARCHAR,              -- Tipo do carimbo
  stamped_at TIMESTAMPTZ,
  photo_url TEXT,                  -- Foto do check-in (se obrigatória)
  latitude NUMERIC,                -- Localização do check-in
  longitude NUMERIC,
  accuracy NUMERIC                 -- Precisão do GPS
)
```

**O que é um Carimbo?**
- Registro de que o turista visitou um checkpoint
- Gerado automaticamente após check-in bem-sucedido

#### **2.4. Temas de Carimbos (Stamp Themes)**
```sql
stamp_themes (
  id UUID PRIMARY KEY,
  theme_name VARCHAR,              -- "Pantanal", "Bonito", etc.
  color_primary VARCHAR,           -- Cor primária (#RRGGBB)
  color_secondary VARCHAR,          -- Cor secundária (#RRGGBB)
  is_active BOOLEAN,
  created_at TIMESTAMPTZ
)
```

**O que é um Tema?**
- Visual do carimbo (cores, estilo)
- Cada rota pode ter um tema diferente

#### **2.5. Recompensas (Rewards)**
```sql
passport_rewards (
  id UUID PRIMARY KEY,
  route_id UUID REFERENCES routes,
  reward_type VARCHAR,              -- 'desconto', 'brinde', 'experiencia', 'outros'
  reward_description TEXT,
  voucher_prefix VARCHAR,          -- Prefixo do voucher (ex: "BONITO2025")
  max_vouchers INTEGER,            -- Estoque máximo (NULL = ilimitado)
  max_per_user INTEGER,            -- Limite por usuário
  is_fallback BOOLEAN,             -- Se é recompensa secundária
  is_active BOOLEAN,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)
```

**O que é uma Recompensa?**
- Prêmio dado ao completar uma rota
- Pode ter estoque limitado
- Pode ter data de validade

---

## 🗺️ GEOLOCALIZAÇÃO - COMO FUNCIONA?

### **3.1. Validação por Geofence (GPS)**

#### **Como Funciona:**
1. **Admin cadastra checkpoint** com:
   - Latitude/Longitude (coordenadas GPS)
   - Raio de validação (ex: 100 metros)

2. **Turista faz check-in:**
   - App solicita permissão de localização
   - Obtém coordenadas atuais do GPS
   - Calcula distância até o checkpoint
   - Valida se está dentro do raio

#### **Cálculo de Distância (Fórmula de Haversine)**
```typescript
// geolocationService.ts
calculateDistance(lat1, lon1, lat2, lon2) {
  // Fórmula matemática para calcular distância entre dois pontos na Terra
  // Retorna distância em METROS
}
```

#### **Validação no Banco (SQL)**
```sql
-- Função: check_geofence()
-- Retorna TRUE se usuário está dentro do raio
SELECT check_geofence(
  checkpoint_lat := -20.4697,
  checkpoint_lon := -54.6201,
  user_lat := -20.4698,      -- Coordenada atual do turista
  user_lon := -54.6202,
  radius_meters := 100        -- Raio permitido
);
```

#### **Fluxo Completo:**
```
1. Turista clica "Fazer Check-in"
   ↓
2. App solicita permissão de GPS
   ↓
3. Obtém coordenadas atuais
   ↓
4. Calcula distância até checkpoint
   ↓
5. Se distância <= raio:
   ✅ Permite check-in
   ↓
6. Se distância > raio:
   ❌ Bloqueia: "Você está muito longe do checkpoint"
```

**Arquivos:**
- `src/services/passport/geolocationService.ts` - Serviço de geolocalização
- `src/components/passport/CheckpointCheckin.tsx` - Componente de check-in
- `supabase/migrations/.../create_passport_digital_tables.sql` - Função SQL `check_geofence()`

---

### **3.2. Validação por Código do Parceiro**

#### **Como Funciona:**
1. **Admin cadastra checkpoint** com:
   - `validation_mode = 'code'` ou `'mixed'`
   - `partner_code = 'BONITO2025'` (código fornecido pelo parceiro)

2. **Turista faz check-in:**
   - Informa o código fornecido pelo parceiro
   - Sistema valida se o código está correto
   - Se correto, permite check-in

#### **Fluxo:**
```
1. Turista chega no local
   ↓
2. Parceiro fornece código (ex: "BONITO2025")
   ↓
3. Turista digita código no app
   ↓
4. Sistema valida código
   ↓
5. Se correto: ✅ Check-in liberado
   Se incorreto: ❌ "Código inválido"
```

---

### **3.3. Validação Mista (Geofence + Código)**

#### **Como Funciona:**
- `validation_mode = 'mixed'`
- Requer **AMBOS**:
  1. Usuário estar dentro do raio GPS
  2. Código do parceiro estar correto

**Mais seguro, previne fraudes!**

---

## 🛠️ COMO CADASTRAR NO ADMIN?

### **4.1. Criar uma Nova Rota**

**Localização:** `/viajar/admin/descubra-ms/passport` → Aba "Rotas"

**Passos:**
1. Clicar em "Nova Rota"
2. Preencher:
   - **Nome**: "Rota do Pantanal"
   - **Descrição**: Texto explicativo
   - **Região**: "Pantanal"
   - **Dificuldade**: Fácil / Médio / Difícil
3. Clicar "Criar"

**Após criar, você pode:**
- Editar configurações do passaporte:
  - **Vídeo promocional** (URL do YouTube/Vimeo)
  - **Prefixo do número** (padrão: "MS")
  - **Papel de parede** (URL da imagem de fundo)

**Arquivo:** `src/components/admin/passport/PassportRouteManager.tsx`

---

### **4.2. Criar Checkpoints na Rota**

**Localização:** `/viajar/admin/descubra-ms/passport` → Aba "Checkpoints"

**Passos:**
1. **Selecionar a rota** no dropdown
2. Clicar em "Novo Checkpoint"
3. Preencher formulário:

#### **Campos Obrigatórios:**
- **Nome**: "Mirante do Pantanal"
- **Ordem na rota**: 1, 2, 3... (sequência)
- **Fragmento do carimbo**: 1, 2, 3... (qual parte do carimbo)

#### **Campos de Localização:**
- **Latitude / Longitude**: 
  - Opção 1: Clicar "Escolher no mapa" → Selecionar no mapa interativo
  - Opção 2: Digitar manualmente (ex: `-20.4697, -54.6201`)
- **Raio de validação**: 100 metros (padrão)

#### **Modo de Validação:**
- **Geofence**: Apenas GPS (usuário precisa estar próximo)
- **Code**: Apenas código do parceiro
- **Mixed**: GPS + código (mais seguro)

#### **Configurações Adicionais:**
- **Código do parceiro**: Se `validation_mode = 'code'` ou `'mixed'`
- **Requer foto**: Se o check-in precisa de foto obrigatória
- **Obrigatório**: Se é necessário para completar a rota

4. Clicar "Criar Checkpoint"

**Arquivo:** `src/components/admin/passport/PassportCheckpointManager.tsx`

---

### **4.3. Criar Temas de Carimbos**

**Localização:** `/viajar/admin/descubra-ms/passport` → Aba "Carimbos"

**Passos:**
1. Clicar "Novo Tema"
2. Preencher:
   - **Nome do tema**: "Pantanal"
   - **Cor primária**: `#FF5733` (formato #RRGGBB)
   - **Cor secundária**: `#C70039` (formato #RRGGBB)
3. Clicar "Criar"

**Arquivo:** `src/components/admin/passport/PassportStampConfig.tsx`

---

### **4.4. Criar Recompensas**

**Localização:** `/viajar/admin/descubra-ms/passport` → Aba "Recompensas"

**Passos:**
1. Clicar "Nova Recompensa"
2. Preencher:
   - **Rota**: Selecionar a rota
   - **Tipo**: Desconto / Brinde / Experiência / Outros
   - **Descrição**: Detalhes da recompensa
   - **Prefixo do voucher**: "BONITO2025"
   - **Validade**: Data de expiração
   - **Estoque (max vouchers)**: Quantidade máxima (deixe vazio para ilimitado)
   - **Limite por usuário**: Quantos vouchers cada usuário pode ganhar
   - **Secundária (fallback)**: Se é recompensa de backup
3. Clicar "Criar"

**Arquivo:** `src/components/admin/passport/PassportRewardsManager.tsx`

---

## 📱 FLUXO DO TURISTA (APP/WEB)

### **5.1. Acessar Passaporte Digital**

**Página:** `/ms/passaporte` ou `/ms/passaporte/lista`

**O que acontece:**
1. Sistema verifica se usuário tem passaporte
2. Se não tem, cria automaticamente
3. Carrega rotas disponíveis
4. Mostra progresso do usuário

---

### **5.2. Iniciar uma Rota**

**Passos:**
1. Usuário vê lista de rotas
2. Clica em uma rota
3. Vê detalhes: checkpoints, dificuldade, duração
4. Clica "Iniciar Rota"
5. Sistema ativa a rota para o usuário

---

### **5.3. Fazer Check-in em um Checkpoint**

**Passos:**
1. Usuário chega no local físico
2. Abre o app e seleciona o checkpoint
3. Clica "Fazer Check-in"

#### **Se validação = 'geofence' ou 'mixed':**
4. App solicita permissão de GPS
5. Obtém coordenadas atuais
6. Valida se está dentro do raio
7. Se dentro: ✅ Continua
8. Se fora: ❌ "Você está muito longe"

#### **Se validação = 'code' ou 'mixed':**
4. Usuário digita código fornecido pelo parceiro
5. Sistema valida código
6. Se correto: ✅ Continua
7. Se incorreto: ❌ "Código inválido"

#### **Se requires_photo = true:**
4. App solicita tirar foto
5. Usuário tira foto
6. Foto é enviada junto com check-in

#### **Finalização:**
7. Sistema registra carimbo
8. Atualiza progresso da rota
9. Se completou todos checkpoints:
   - ✅ Rota concluída!
   - 🎁 Desbloqueia recompensas
   - 📧 Envia vouchers por email

**Arquivo:** `src/components/passport/CheckpointCheckin.tsx`

---

### **5.4. Funcionamento Offline**

**Como Funciona:**
1. Usuário faz check-in sem internet
2. Sistema salva localmente (IndexedDB)
3. Quando internet volta:
   - Sincroniza automaticamente
   - Valida check-ins pendentes
   - Atualiza progresso

**Arquivo:** `src/services/passport/offlineSyncService.ts`

---

## 🔧 FUNÇÕES SQL DO BANCO

### **6.1. `check_geofence()`**
Valida se usuário está dentro do raio do checkpoint.

```sql
SELECT check_geofence(
  checkpoint_lat := -20.4697,
  checkpoint_lon := -54.6201,
  user_lat := -20.4698,
  user_lon := -54.6202,
  radius_meters := 100
);
-- Retorna: TRUE ou FALSE
```

### **6.2. `calculate_distance()`**
Calcula distância entre dois pontos (Haversine).

```sql
SELECT calculate_distance(
  lat1 := -20.4697,
  lon1 := -54.6201,
  lat2 := -20.4698,
  lon2 := -54.6202
);
-- Retorna: distância em METROS
```

### **6.3. `unlock_rewards()`**
Desbloqueia recompensas quando rota é completada.

```sql
SELECT * FROM unlock_rewards(
  p_user_id := 'uuid-do-usuario',
  p_route_id := 'uuid-da-rota'
);
-- Retorna: Lista de vouchers gerados
```

### **6.4. `check_checkin_rate_limit()`**
Previne spam de check-ins.

```sql
SELECT check_checkin_rate_limit(
  p_user_id := 'uuid-do-usuario',
  p_max_checkins := 10,
  p_window_minutes := 60
);
-- Retorna: TRUE se pode fazer check-in, FALSE se excedeu limite
```

---

## 📊 DIAGRAMA DE FLUXO

```
┌─────────────────┐
│  Usuário faz    │
│     Login       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Sistema verifica│
│  se tem         │
│  passaporte     │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
   SIM       NÃO
    │         │
    │         ▼
    │    ┌──────────────┐
    │    │ Cria         │
    │    │ passaporte   │
    │    │ automaticamente│
    │    └──────┬───────┘
    │           │
    └───────────┘
         │
         ▼
┌─────────────────┐
│  Carrega rotas  │
│   disponíveis   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Usuário inicia  │
│     uma rota    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Visita         │
│  checkpoint     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Faz check-in   │
│  (GPS + Código) │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
  Válido   Inválido
    │         │
    │         ▼
    │    ┌──────────────┐
    │    │ Erro:        │
    │    │ "Muito longe"│
    │    │ ou           │
    │    │ "Código inválido"│
    │    └──────────────┘
    │
    ▼
┌─────────────────┐
│  Carimbo        │
│  registrado     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Todos checkpoints│
│  completados?   │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
   SIM       NÃO
    │         │
    │         ▼
    │    ┌──────────────┐
    │    │ Continua     │
    │    │ coletando    │
    │    │ carimbos     │
    │    └──────────────┘
    │
    ▼
┌─────────────────┐
│  Rota           │
│  concluída!     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Desbloqueia    │
│  recompensas    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Gera vouchers  │
│  e envia email  │
└─────────────────┘
```

---

## 🎯 RESUMO EXECUTIVO

### **Para o Admin:**
1. **Criar Rota** → Definir nome, descrição, dificuldade
2. **Criar Checkpoints** → Definir localização (GPS), modo de validação, código do parceiro
3. **Criar Temas** → Definir cores dos carimbos
4. **Criar Recompensas** → Definir prêmios, estoque, validade

### **Para o Turista:**
1. **Acessa Passaporte** → Sistema cria automaticamente
2. **Inicia Rota** → Escolhe uma rota para completar
3. **Visita Checkpoints** → Vai aos locais físicos
4. **Faz Check-in** → GPS valida proximidade + código do parceiro (se necessário)
5. **Ganha Carimbos** → Progresso é atualizado automaticamente
6. **Completa Rota** → Recebe recompensas e vouchers

### **Geolocalização:**
- ✅ Funciona via GPS do celular
- ✅ Valida se usuário está dentro do raio (ex: 100m)
- ✅ Pode ser combinado com código do parceiro
- ✅ Funciona offline (sincroniza depois)

---

## 📝 PRÓXIMOS PASSOS SUGERIDOS

1. ✅ **Testar criação de rota** no admin
2. ✅ **Testar criação de checkpoint** com mapa
3. ✅ **Testar check-in** no app do turista
4. ✅ **Verificar geolocalização** funcionando
5. ✅ **Testar recompensas** ao completar rota

---

**Documento criado em:** 17/12/2025  
**Última atualização:** 17/12/2025

