# 🗺️ GUIA PRÁTICO: COMO CADASTRAR PARADAS (CHECKPOINTS) NO PASSAPORTE DIGITAL

## 📍 EXEMPLO PRÁTICO: ROTA "CENTRO HISTÓRICO"

**Roteiro:**
1. Casa do Artesão
2. Bioparque
3. Feira Central

---

## ✅ PASSO A PASSO COMPLETO

### **ETAPA 1: Criar a Rota**

1. Acesse: `/viajar/admin/descubra-ms/passport` → Aba **"Rotas"**
2. Clique em **"Nova Rota"**
3. Preencha:
   - **Nome**: `Centro Histórico`
   - **Descrição**: `Explore o centro histórico da cidade visitando pontos culturais e comerciais`
   - **Região**: `Centro`
   - **Dificuldade**: `Fácil`
4. Clique **"Criar"**

✅ **Rota criada!** Agora você pode cadastrar as paradas (checkpoints).

---

### **ETAPA 2: Cadastrar as Paradas (Checkpoints)**

Cada **parada física** = um **checkpoint** no sistema.

#### **PARADA 1: Casa do Artesão**

1. Vá para a aba **"Checkpoints"**
2. Selecione a rota **"Centro Histórico"** no dropdown
3. Clique em **"Novo Checkpoint"**

**Preencha o formulário:**

**📝 Informações Básicas:**
- **Nome do Ponto**: `Casa do Artesão`
- **Descrição**: `Loja de artesanato local com produtos regionais`
- **Ordem na Rota**: `1` (primeira parada)
- **Fragmento do carimbo**: `1` (primeira parte do carimbo)

**🗺️ Localização (GEOLOCALIZAÇÃO):**

**Opção A - Usar o Mapa (RECOMENDADO):**
1. Clique em **"Escolher no mapa"**
2. Um mapa interativo abre
3. Navegue até o local da **Casa do Artesão**
4. Clique no ponto exato no mapa
5. As coordenadas são preenchidas automaticamente

**Opção B - Digitar Manualmente:**
- Se você já tem as coordenadas GPS:
  - **Latitude**: `-20.4697` (exemplo)
  - **Longitude**: `-54.6201` (exemplo)
- **Como obter coordenadas?**
  - Google Maps: Clique com botão direito no local → "O que há aqui?" → Veja as coordenadas
  - Ou use: https://www.google.com/maps → Clique no local → Veja na URL

**⚙️ Configurações de Validação:**

- **Raio de validação**: `100` metros (padrão)
  - Significa: turista precisa estar a até 100m do local para fazer check-in

- **Modo de validação**: Escolha uma opção:

  **A) Geofence (GPS apenas):**
  - ✅ Turista chega no local
  - ✅ App detecta GPS
  - ✅ Se estiver dentro de 100m → Check-in liberado
  - ❌ Se estiver fora → Bloqueado

  **B) Code (Código do parceiro apenas):**
  - ✅ Turista chega no local
  - ✅ Parceiro fornece código (ex: `CASA2025`)
  - ✅ Turista digita código no app
  - ✅ Se código correto → Check-in liberado
  - ❌ Se código errado → Bloqueado

  **C) Mixed (GPS + Código) - MAIS SEGURO:**
  - ✅ Turista chega no local
  - ✅ App detecta GPS (deve estar dentro de 100m)
  - ✅ Parceiro fornece código
  - ✅ Turista digita código
  - ✅ Se GPS OK E código OK → Check-in liberado
  - ❌ Se GPS fora OU código errado → Bloqueado

**Para este exemplo, vamos usar "Geofence":**
- Selecione: **"Geofence"**
- **Código do parceiro**: Deixe vazio (não é necessário)

**📸 Outras Configurações:**
- **Requer foto**: Marque se quiser que o turista tire foto obrigatória
- **Obrigatório**: Marque (sim, é necessário para completar a rota)

4. Clique **"Criar Checkpoint"**

✅ **Parada 1 cadastrada!**

---

#### **PARADA 2: Bioparque**

1. Clique em **"Novo Checkpoint"** novamente

**Preencha:**
- **Nome**: `Bioparque`
- **Descrição**: `Parque zoológico e botânico`
- **Ordem na Rota**: `2` (segunda parada)
- **Fragmento do carimbo**: `2` (segunda parte do carimbo)

**Localização:**
- Clique **"Escolher no mapa"** → Localize o Bioparque → Clique no ponto
- Ou digite coordenadas: `-20.4750, -54.6250` (exemplo)

**Validação:**
- **Raio**: `100` metros
- **Modo**: `Geofence` (GPS apenas)

**Outras:**
- **Requer foto**: Opcional
- **Obrigatório**: Sim

2. Clique **"Criar Checkpoint"**

✅ **Parada 2 cadastrada!**

---

#### **PARADA 3: Feira Central**

1. Clique em **"Novo Checkpoint"** novamente

**Preencha:**
- **Nome**: `Feira Central`
- **Descrição**: `Feira municipal com produtos locais`
- **Ordem na Rota**: `3` (terceira parada)
- **Fragmento do carimbo**: `3` (terceira parte do carimbo)

**Localização:**
- Clique **"Escolher no mapa"** → Localize a Feira Central → Clique no ponto
- Ou digite coordenadas: `-20.4800, -54.6300` (exemplo)

**Validação:**
- **Raio**: `100` metros
- **Modo**: `Mixed` (GPS + Código) - Exemplo de uso com código

**Código do Parceiro:**
- **Opção 1**: Digite manualmente: `FEIRA2025`
- **Opção 2**: Clique **"Gerar Código"** → Sistema gera automaticamente (ex: `MS-4281`)

**⚠️ IMPORTANTE - Onde o código aparece?**
- O código **NÃO aparece automaticamente** para o turista
- Você precisa **comunicar o código ao parceiro físico** (dono da Feira Central)
- O parceiro físico fornece o código ao turista quando ele chegar
- O turista digita o código no app para fazer check-in

**Outras:**
- **Requer foto**: Opcional
- **Obrigatório**: Sim

2. Clique **"Criar Checkpoint"**

✅ **Parada 3 cadastrada!**

---

## 🎯 COMO O SISTEMA SABE A GEOLOCALIZAÇÃO?

### **Resposta: VOCÊ cadastra as coordenadas!**

1. **Você (admin)** cadastra cada checkpoint com:
   - Latitude/Longitude (coordenadas GPS)
   - Raio de validação (ex: 100 metros)

2. **Sistema salva** essas coordenadas no banco de dados

3. **Quando turista faz check-in:**
   - App obtém GPS atual do celular do turista
   - Sistema calcula distância entre:
     - Coordenadas do checkpoint (que você cadastrou)
     - Coordenadas atuais do turista (GPS do celular)
   - Se distância ≤ raio → ✅ Permite check-in
   - Se distância > raio → ❌ Bloqueia

**Exemplo prático:**
```
Checkpoint "Casa do Artesão":
- Latitude: -20.4697
- Longitude: -54.6201
- Raio: 100 metros

Turista faz check-in:
- GPS do celular: -20.4698, -54.6202
- Distância calculada: 85 metros
- 85m < 100m → ✅ Check-in liberado!

Se turista estiver em outro lugar:
- GPS do celular: -20.5000, -54.6500
- Distância calculada: 3500 metros
- 3500m > 100m → ❌ "Você está muito longe do checkpoint"
```

---

## 🔑 CÓDIGO DO PARCEIRO - ONDE É GERADO E ONDE APARECE?

### **1. ONDE É GERADO?**

**No Admin Panel:**
- Ao cadastrar checkpoint com `validation_mode = 'code'` ou `'mixed'`
- Você pode:
  - **Digitar manualmente**: Ex: `FEIRA2025`
  - **Gerar automaticamente**: Clicar botão "Gerar Código" → Sistema cria (ex: `MS-4281`)

**O código é salvo no banco de dados** junto com o checkpoint.

---

### **2. ONDE APARECE PARA O TURISTA?**

**NO APP DO TURISTA:**

Quando o turista tenta fazer check-in em um checkpoint que exige código:

1. **App mostra campo de texto:**
   ```
   ┌─────────────────────────────┐
   │ Código do parceiro          │
   │ ┌─────────────────────────┐ │
   │ │ [Digite o código aqui]   │ │
   │ └─────────────────────────┘ │
   │                             │
   │ Peça o código no balcão e   │
   │ digite aqui (ex.: MS-4281)  │
   └─────────────────────────────┘
   ```

2. **Turista precisa:**
   - Ir ao local físico (ex: Feira Central)
   - Pedir o código ao parceiro (dono do estabelecimento)
   - Parceiro fornece o código (ex: `FEIRA2025`)
   - Turista digita no app
   - Sistema valida se código está correto

---

### **3. COMO O PARCEIRO SABE O CÓDIGO?**

**⚠️ VOCÊ PRECISA COMUNICAR O CÓDIGO AO PARCEIRO!**

**Opções:**

**A) Comunicação Manual:**
- Você cadastra o checkpoint com código `FEIRA2025`
- Você liga/envia mensagem para o dono da Feira Central
- Informa: "O código do seu checkpoint é `FEIRA2025`"
- Parceiro anota e fornece aos turistas

**B) Dashboard do Parceiro (FUTURO):**
- Criar uma área no admin para parceiros verem seus códigos
- Parceiro faz login e vê: "Seu código: FEIRA2025"

**C) QR Code (FUTURO):**
- Gerar QR Code com o código
- Parceiro imprime e coloca no balcão
- Turista escaneia → Código preenchido automaticamente

---

## 📱 FLUXO COMPLETO DO TURISTA

### **Cenário: Turista fazendo a rota "Centro Histórico"**

#### **PARADA 1: Casa do Artesão (Geofence apenas)**

1. Turista chega na Casa do Artesão
2. Abre o app → Seleciona checkpoint "Casa do Artesão"
3. Clica "Fazer Check-in"
4. App solicita permissão de GPS
5. App obtém coordenadas: `-20.4698, -54.6202`
6. Sistema calcula: distância = 85m (dentro do raio de 100m)
7. ✅ **Check-in liberado!**
8. Turista ganha fragmento 1 do carimbo

---

#### **PARADA 2: Bioparque (Geofence apenas)**

1. Turista chega no Bioparque
2. Abre o app → Seleciona checkpoint "Bioparque"
3. Clica "Fazer Check-in"
4. App obtém GPS: `-20.4751, -54.6251`
5. Sistema calcula: distância = 120m (fora do raio de 100m)
6. ❌ **Bloqueado**: "Você está a 120m do checkpoint. Aproxime-se mais."
7. Turista se aproxima mais
8. App obtém GPS: `-20.4750, -54.6250`
9. Sistema calcula: distância = 50m (dentro do raio)
10. ✅ **Check-in liberado!**
11. Turista ganha fragmento 2 do carimbo

---

#### **PARADA 3: Feira Central (Mixed: GPS + Código)**

1. Turista chega na Feira Central
2. Abre o app → Seleciona checkpoint "Feira Central"
3. Clica "Fazer Check-in"
4. App obtém GPS: `-20.4801, -54.6301`
5. Sistema calcula: distância = 60m (dentro do raio) ✅
6. **App mostra campo para código:**
   ```
   ┌─────────────────────────────┐
   │ Código do parceiro          │
   │ ┌─────────────────────────┐ │
   │ │ [Digite aqui]           │ │
   │ └─────────────────────────┘ │
   └─────────────────────────────┘
   ```
7. Turista vai ao balcão e pergunta: "Qual o código do passaporte?"
8. Parceiro informa: "O código é `FEIRA2025`"
9. Turista digita: `FEIRA2025`
10. Sistema valida:
    - GPS: ✅ OK (dentro do raio)
    - Código: ✅ OK (correto)
11. ✅ **Check-in liberado!**
12. Turista ganha fragmento 3 do carimbo
13. **Rota completa!** 🎉
14. Sistema desbloqueia recompensas

---

## 🗺️ RESUMO VISUAL

```
┌─────────────────────────────────────────────────────────┐
│                    ADMIN CADASTRA                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. Cria Rota: "Centro Histórico"                       │
│                                                          │
│  2. Cadastra Checkpoint 1:                              │
│     - Nome: "Casa do Artesão"                          │
│     - Coordenadas: -20.4697, -54.6201                  │
│     - Raio: 100m                                        │
│     - Modo: Geofence                                    │
│                                                          │
│  3. Cadastra Checkpoint 2:                              │
│     - Nome: "Bioparque"                                 │
│     - Coordenadas: -20.4750, -54.6250                  │
│     - Raio: 100m                                        │
│     - Modo: Geofence                                    │
│                                                          │
│  4. Cadastra Checkpoint 3:                              │
│     - Nome: "Feira Central"                            │
│     - Coordenadas: -20.4800, -54.6300                   │
│     - Raio: 100m                                        │
│     - Modo: Mixed                                       │
│     - Código: FEIRA2025                                 │
│     - Comunica código ao parceiro                       │
│                                                          │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                  TURISTA FAZ CHECK-IN                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Checkpoint 1 (Casa do Artesão):                        │
│  - GPS do celular: -20.4698, -54.6202                  │
│  - Distância: 85m ✅                                     │
│  - Check-in liberado!                                   │
│                                                          │
│  Checkpoint 2 (Bioparque):                              │
│  - GPS do celular: -20.4751, -54.6251                  │
│  - Distância: 50m ✅                                     │
│  - Check-in liberado!                                   │
│                                                          │
│  Checkpoint 3 (Feira Central):                          │
│  - GPS do celular: -20.4801, -54.6301                  │
│  - Distância: 60m ✅                                     │
│  - Código digitado: FEIRA2025 ✅                        │
│  - Check-in liberado!                                   │
│                                                          │
│  🎉 Rota completa! Recompensas desbloqueadas!          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## ❓ PERGUNTAS FREQUENTES

### **1. Como obter as coordenadas GPS de um local?**

**Google Maps:**
1. Abra https://www.google.com/maps
2. Digite o endereço ou nome do local
3. Clique com botão direito no ponto exato
4. Clique em "O que há aqui?"
5. Veja as coordenadas na parte inferior (ex: `-20.4697, -54.6201`)

**Ou use o mapa interativo no admin:**
- Clique "Escolher no mapa"
- Navegue até o local
- Clique no ponto exato
- Coordenadas preenchidas automaticamente

---

### **2. Qual raio usar?**

- **Locais pequenos** (loja, restaurante): `50-100m`
- **Locais médios** (praça, parque): `100-200m`
- **Locais grandes** (zoológico, feira): `200-500m`

**Recomendação:** Comece com `100m` e ajuste conforme necessário.

---

### **3. Quando usar código do parceiro?**

**Use código quando:**
- Quer garantir que turista realmente visitou o local
- Parceiro precisa validar presença física
- Quer prevenir fraudes (GPS pode ser falsificado)

**Não precisa código quando:**
- Confia apenas no GPS
- Local é público (praça, monumento)
- Não há parceiro físico para validar

---

### **4. O parceiro precisa de acesso ao sistema?**

**Não necessariamente:**
- Você pode apenas comunicar o código por telefone/email
- Parceiro anota e fornece aos turistas

**Mas seria ideal:**
- Criar dashboard para parceiros verem seus códigos
- Parceiro pode gerar novos códigos
- Parceiro vê estatísticas de check-ins

---

## ✅ CHECKLIST DE CADASTRO

- [ ] Criar rota no admin
- [ ] Para cada parada física:
  - [ ] Cadastrar checkpoint
  - [ ] Definir coordenadas GPS (mapa ou manual)
  - [ ] Definir raio de validação
  - [ ] Escolher modo de validação
  - [ ] Se usar código: gerar/comunicar ao parceiro
  - [ ] Definir ordem na rota
  - [ ] Definir fragmento do carimbo
- [ ] Testar check-in no app do turista
- [ ] Verificar geolocalização funcionando
- [ ] Comunicar códigos aos parceiros (se aplicável)

---

**Documento criado em:** 17/12/2025  
**Última atualização:** 17/12/2025

