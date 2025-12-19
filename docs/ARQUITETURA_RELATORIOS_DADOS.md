# 📊 ARQUITETURA DOS RELATÓRIOS DE DADOS

## 🎯 VISÃO GERAL

Os relatórios de dados de turismo são gerados **EXCLUSIVAMENTE** a partir de duas fontes:

1. **Alumia** - Plataforma de Inteligência Turística do Governo de MS (quando API disponível)
2. **Descubra Mato Grosso do Sul** - Dados da plataforma Descubra MS (em desenvolvimento)

---

## 🔄 FLUXO DE DADOS

```
┌─────────────────────────────────────────────────────────────┐
│                    SOLICITAÇÃO DE RELATÓRIO                  │
│  (Formulário de Contato → Lead → Data Sale Request)         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              VALIDAÇÃO DE DISPONIBILIDADE                    │
│  - Verificar se Alumia API está disponível                   │
│  - Verificar se há dados do Descubra MS no período           │
│  - Validar mínimo de 10 registros agregados                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              AGREGAÇÃO DE DADOS                              │
│                                                               │
│  ┌──────────────────┐      ┌──────────────────┐          │
│  │   ALUMIA API     │      │  DESCUBRA MS      │          │
│  │                  │      │                   │          │
│  │ • Analytics      │      │ • user_profiles   │          │
│  │ • Demographics   │      │   (com consent)   │          │
│  │ • Origins        │      │ • destinations    │          │
│  │ • Destinations   │      │   (visualizações) │          │
│  │ • Events         │      │ • events          │          │
│  │ • Bookings       │      │   (visualizações) │          │
│  └────────┬─────────┘      └────────┬─────────┘          │
│           │                          │                      │
│           └──────────┬───────────────┘                      │
│                     ▼                                        │
│         ┌───────────────────────┐                           │
│         │  DADOS AGREGADOS      │                           │
│         │  (anonimizados)       │                           │
│         └───────────┬───────────┘                           │
└─────────────────────┼──────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              GERAÇÃO DE RELATÓRIOS                           │
│                                                               │
│  • PDF Explicativo (análises, gráficos, insights)           │
│  • Excel com Dados Brutos (planilhas agregadas)             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📥 DADOS DA ALUMIA

### Estrutura da API Alumia

A API Alumia retorna dados através do método `getAnalytics(period)`:

```typescript
interface AlumiaAnalytics {
  period: string;                    // Ex: '30d', '90d', '1y'
  totalVisitors: number;             // Total de visitantes
  totalBookings: number;             // Total de reservas
  totalRevenue: number;              // Receita total
  
  // Destinos populares
  popularDestinations: Array<{
    id: string;
    name: string;
    visitors: number;
    revenue: number;
  }>;
  
  // Eventos populares
  popularEvents: Array<{
    id: string;
    name: string;
    attendees: number;
    revenue: number;
  }>;
  
  // Demografia dos visitantes
  visitorDemographics: {
    byCountry: Record<string, number>;  // Ex: { 'Brasil': 12000, 'Argentina': 1500 }
    byAge: Record<string, number>;      // Ex: { '18-25': 3000, '26-35': 4500 }
    byLanguage: Record<string, number>; // Ex: { 'pt-BR': 12000, 'es-ES': 1500 }
  };
  
  // Tendências de reservas
  bookingTrends: Array<{
    date: string;
    bookings: number;
    revenue: number;
  }>;
}
```

### Como os dados são processados:

1. **Chamada à API**: `alumiaService.getAnalytics('30d')`
2. **Validação**: Verifica se API está configurada e conectada
3. **Agregação**: Os dados já vêm agregados da Alumia (não precisamos agregar)
4. **Mapeamento**: Convertemos para o formato do relatório:
   - `visitorDemographics.byAge` → `demographics.ageGroups`
   - `visitorDemographics.byCountry` → `origins.countries`
   - `popularDestinations` → informações de destinos
   - `popularEvents` → informações de eventos

---

## 📥 DADOS DO DESCUBRA MS

### Tabelas e Dados Disponíveis

Quando implementado, os dados virão das seguintes tabelas do Descubra MS:

#### 1. **user_profiles** (com consentimento)
```sql
SELECT 
  age_range,           -- Faixa etária
  gender,              -- Gênero
  origin_state,        -- Estado de origem
  travel_purpose,      -- Propósito de viagem
  preferences          -- Preferências/interesses
FROM user_profiles
WHERE created_at BETWEEN :periodStart AND :periodEnd
  AND EXISTS (
    SELECT 1 FROM data_sharing_consents
    WHERE user_id = user_profiles.user_id
      AND consent_given = true
      AND revoked_at IS NULL
  )
```

**Dados agregados:**
- Demografia (idade, gênero)
- Origem (estados, países)
- Propósito de viagem
- Interesses/preferências

#### 2. **destinations** (visualizações/interações)
```sql
SELECT 
  d.id,
  d.name,
  COUNT(dv.id) as views,
  COUNT(DISTINCT dv.user_id) as unique_visitors
FROM destinations d
LEFT JOIN destination_views dv ON d.id = dv.destination_id
WHERE dv.viewed_at BETWEEN :periodStart AND :periodEnd
GROUP BY d.id, d.name
ORDER BY views DESC
```

**Dados agregados:**
- Destinos mais visualizados
- Número de visitantes únicos por destino
- Tendências de interesse

#### 3. **events** (visualizações/interações)
```sql
SELECT 
  e.id,
  e.name,
  e.event_date,
  COUNT(ev.id) as views,
  COUNT(DISTINCT ev.user_id) as unique_visitors
FROM events e
LEFT JOIN event_views ev ON e.id = ev.event_id
WHERE ev.viewed_at BETWEEN :periodStart AND :periodEnd
  AND e.is_visible = true
GROUP BY e.id, e.name, e.event_date
ORDER BY views DESC
```

**Dados agregados:**
- Eventos mais visualizados
- Interesse por eventos
- Sazonalidade

#### 4. **user_interactions** (se implementado)
```sql
SELECT 
  interaction_type,
  page_url,
  metadata->>'search_query' as search_query,
  COUNT(*) as count
FROM user_interactions
WHERE created_at BETWEEN :periodStart AND :periodEnd
GROUP BY interaction_type, page_url, search_query
```

**Dados agregados:**
- Páginas mais visitadas
- Buscas mais frequentes
- Padrões de navegação

---

## 🔀 COMO OS DADOS SÃO COMBINADOS

### Processo de Agregação:

1. **Inicialização**: Criar estruturas vazias para dados agregados
   ```typescript
   const ageGroups: Record<string, number> = {};
   const gender: Record<string, number> = {};
   const origins: { states: {}, countries: {} } = { states: {}, countries: {} };
   const travelPurposes: Record<string, number> = {};
   ```

2. **Alumia**: Processar dados da API
   ```typescript
   if (alumiaData.visitorDemographics?.byAge) {
     Object.entries(alumiaData.visitorDemographics.byAge).forEach(([age, count]) => {
       ageGroups[age] = (ageGroups[age] || 0) + count;
     });
   }
   ```

3. **Descubra MS**: Processar dados do banco
   ```typescript
   profiles.forEach(profile => {
     if (profile.age_range) {
       ageGroups[profile.age_range] = (ageGroups[profile.age_range] || 0) + 1;
     }
     // ... outros campos
   });
   ```

4. **Combinação**: Os dados são somados/agregados
   - Se Alumia tem 1000 visitantes de 18-25 anos
   - E Descubra MS tem 500 usuários de 18-25 anos
   - O relatório mostrará: 1500 total (agregado)

---

## 📄 ESTRUTURA DO RELATÓRIO

### PDF Explicativo (Tratado)

```
1. RESUMO EXECUTIVO
   - Total de registros agregados
   - Fontes de dados utilizadas
   - Período analisado

2. PERFIL DEMOGRÁFICO
   - Distribuição por faixa etária (gráfico)
   - Distribuição por gênero (gráfico)

3. ORIGEM DOS VISITANTES
   - Estados de origem (tabela)
   - Países de origem (tabela)

4. PROPÓSITO DE VIAGEM
   - Motivações (tabela/gráfico)

5. INTERAÇÕES NA PLATAFORMA (Descubra MS)
   - Páginas mais visitadas
   - Buscas mais frequentes

6. DADOS ALUMIA
   - Destinos populares
   - Eventos populares
   - Tendências de reservas

7. METODOLOGIA E CONFORMIDADE LGPD
   - Como os dados foram coletados
   - Agregação e anonimização
   - Fontes utilizadas
```

### Excel (Dados Brutos)

```
Aba 1: Demografia
  - Faixa Etária | Quantidade
  - Gênero | Quantidade

Aba 2: Origem
  - Tipo | Local | Quantidade
  (Estados e Países)

Aba 3: Propósito
  - Propósito | Quantidade

Aba 4: Interações
  - Página | Visualizações
  - Busca | Quantidade

Aba 5: Metadados
  - Período Inicial
  - Período Final
  - Total de Registros
  - Fontes de Dados
  - Status de Validação
```

---

## 🔒 CONFORMIDADE LGPD

### Princípios Aplicados:

1. **Agregação**: Dados sempre agregados (nunca individuais)
2. **Anonimização**: Nenhuma informação pessoal identificável
3. **Consentimento**: Apenas dados com consentimento explícito (Descubra MS)
4. **Transparência**: Fontes claramente identificadas no relatório
5. **Minimização**: Apenas dados necessários para o relatório

### Exemplo de Agregação:

❌ **NÃO FAZEMOS:**
```
João Silva, 25 anos, de SP, visitou Bonito
Maria Santos, 30 anos, de RJ, visitou Campo Grande
```

✅ **FAZEMOS:**
```
Faixa 18-25: 1.500 visitantes
Faixa 26-35: 2.300 visitantes
Origem SP: 3.200 visitantes
Origem RJ: 1.800 visitantes
```

---

## 🚀 IMPLEMENTAÇÃO ATUAL

### Status:

- ✅ **Alumia**: Estrutura pronta, aguardando API estar disponível
- ⏳ **Descubra MS**: Estrutura preparada, aguardando implementação

### Próximos Passos:

1. **Alumia**: Quando API estiver disponível, os dados serão automaticamente incluídos
2. **Descubra MS**: Implementar queries para buscar dados agregados das tabelas mencionadas
3. **Testes**: Validar agregação e geração de relatórios com dados reais

---

## 📝 NOTAS IMPORTANTES

1. **Nunca usamos dados individuais**: Tudo é agregado
2. **Nunca usamos dados sem consentimento**: Apenas usuários que consentiram (Descubra MS)
3. **Nunca usamos dados de outras fontes**: Apenas Alumia e Descubra MS
4. **Validação obrigatória**: Mínimo de 10 registros agregados para gerar relatório
5. **Transparência total**: Fontes sempre identificadas no relatório
