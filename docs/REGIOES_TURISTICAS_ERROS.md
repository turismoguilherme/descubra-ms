# Análise de Erros e IDs das Regiões Turísticas do Mapa

## Visão Geral

Este documento explica os erros identificados no módulo de regiões turísticas do mapa turístico interativo, incluindo os IDs de cada região e os motivos pelos quais uma região pode acender quando outra é clicada.

---

## Estrutura das Regiões Turísticas

### Regiões Oficiais (9 regiões)

O sistema possui **9 regiões turísticas oficiais** de Mato Grosso do Sul, conforme definido pela Secretaria de Estado de Turismo, Esporte e Cultura (SETESC) - Manual Informativo Regionalização do Turismo MS 2025.

#### 1. Pantanal
- **ID no código**: `"pantanal"`
- **ID no banco**: UUID (gerado automaticamente)
- **Slug**: `"pantanal"`
- **Cor**: `#FFCA28` (Amarelo-mostarda)
- **Cor Hover**: `#FFB300`
- **Cidades**: Corumbá, Ladário, Aquidauana, Miranda, Anastácio
- **Destaques**: Safari fotográfico, Pesca esportiva, Observação de fauna, Passeios de barco

#### 2. Bonito-Serra da Bodoquena
- **ID no código**: `"bonito-serra-bodoquena"`
- **ID no banco**: UUID (gerado automaticamente)
- **Slug**: `"bonito-serra-bodoquena"`
- **Cor**: `#4FC3F7` (Azul-claro)
- **Cor Hover**: `#29B6F6`
- **Cidades**: Bonito, Jardim, Bodoquena, Guia Lopes da Laguna, Nioaque, Porto Murtinho, Bela Vista
- **Destaques**: Flutuação, Mergulho em grutas, Cachoeiras, Balneários

#### 3. Campo Grande dos Ipês
- **ID no código**: `"campo-grande-ipes"`
- **ID no banco**: UUID (gerado automaticamente)
- **Slug**: `"campo-grande-ipes"`
- **Cor**: `#7E57C2` (Roxo)
- **Cor Hover**: `#673AB7`
- **Cidades**: Campo Grande, Terenos, Sidrolândia, Nova Alvorada do Sul, Rochedo, Corguinho, Rio Negro, Jaraguari, Ribas do Rio Pardo
- **Destaques**: Gastronomia regional, Parques urbanos, Museus, Feiras e eventos

#### 4. Caminhos da Fronteira
- **ID no código**: `"caminhos-fronteira"`
- **ID no banco**: UUID (gerado automaticamente)
- **Slug**: `"caminhos-fronteira"`
- **Cor**: `#8D6E63` (Marrom)
- **Cor Hover**: `#6D4C41`
- **Cidades**: Ponta Porã, Antônio João, Aral Moreira, Coronel Sapucaia, Paranhos, Sete Quedas, Caracol, Amambai
- **Destaques**: Compras, Gastronomia de fronteira, Turismo histórico, Cultura guarani

#### 5. Caminhos da Natureza-Cone Sul
- **ID no código**: `"caminhos-natureza-cone-sul"`
- **ID no banco**: UUID (gerado automaticamente)
- **Slug**: `"caminhos-natureza-cone-sul"`
- **Cor**: `#FF9800` (Laranja)
- **Cor Hover**: `#F57C00`
- **Cidades**: Naviraí, Eldorado, Mundo Novo, Iguatemi, Itaquiraí, Japorã, Tacuru, Sete Quedas
- **Destaques**: Cachoeiras, Rios para banho, Pesca, Turismo rural

#### 6. Celeiro do MS
- **ID no código**: `"celeiro-ms"`
- **ID no banco**: UUID (gerado automaticamente)
- **Slug**: `"celeiro-ms"`
- **Cor**: `#CE93D8` (Lilás)
- **Cor Hover**: `#BA68C8`
- **Cidades**: Dourados, Maracaju, Rio Brilhante, Itaporã, Douradina, Fátima do Sul, Vicentina, Caarapó, Laguna Carapã, Juti, Deodápolis, Glória de Dourados
- **Destaques**: Turismo rural, Agroturismo, Eventos country, Gastronomia regional

#### 7. Costa Leste
- **ID no código**: `"costa-leste"`
- **ID no banco**: UUID (gerado automaticamente)
- **Slug**: `"costa-leste"`
- **Cor**: `#EF5350` (Vermelho)
- **Cor Hover**: `#E53935`
- **Cidades**: Três Lagoas, Aparecida do Taboado, Paranaíba, Cassilândia, Inocência, Selvíria, Brasilândia, Santa Rita do Pardo, Água Clara
- **Destaques**: Praias fluviais, Pesca esportiva, Esportes náuticos, Turismo de negócios

#### 8. Rota Cerrado Pantanal
- **ID no código**: `"rota-cerrado-pantanal"`
- **ID no banco**: UUID (gerado automaticamente)
- **Slug**: `"rota-cerrado-pantanal"`
- **Cor**: `#66BB6A` (Verde)
- **Cor Hover**: `#43A047`
- **Cidades**: Coxim, São Gabriel do Oeste, Rio Verde de Mato Grosso, Camapuã, Pedro Gomes, Sonora, Costa Rica, Alcinópolis, Figueirão, Chapadão do Sul
- **Destaques**: Pesca, Cachoeiras, Turismo ecológico, Observação de aves

#### 9. Vale das Águas
- **ID no código**: `"vale-das-aguas"`
- **ID no banco**: UUID (gerado automaticamente)
- **Slug**: `"vale-das-aguas"`
- **Cor**: `#42A5F5` (Azul)
- **Cor Hover**: `#1E88E5`
- **Cidades**: Nova Andradina, Ivinhema, Batayporã, Taquarussu, Novo Horizonte do Sul, Anaurilândia, Bataguassu
- **Destaques**: Cachoeiras, Rios, Pesca, Turismo de aventura

---

## Problemas Identificados

### 1. Incompatibilidade de IDs entre Código e Banco de Dados

#### Problema
- **Código estático** (`touristRegions2025.ts`): Usa IDs como strings simples (`"pantanal"`, `"bonito-serra-bodoquena"`, etc.)
- **Banco de dados** (`tourist_regions`): Usa UUIDs gerados automaticamente (ex: `"a1b2c3d4-e5f6-7890-abcd-ef1234567890"`)
- **Arquivo JSON de paths SVG** (`svg-regions-paths.json`): Usa os IDs do código estático como chaves

#### Impacto
Quando uma região é carregada do banco de dados, seu ID é um UUID, mas o sistema tenta buscar os paths SVG usando esse UUID como chave. Como o JSON usa IDs estáticos, a busca falha e a região não é renderizada corretamente no mapa.

#### Exemplo do Erro
```typescript
// Região do banco tem ID: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
// Sistema tenta buscar: svgRegionsPaths.regions["a1b2c3d4-e5f6-7890-abcd-ef1234567890"]
// Mas o JSON tem: svgRegionsPaths.regions["pantanal"]
// Resultado: paths não encontrados, região não aparece no mapa
```

### 2. Paths SVG Sobrepostos

#### Problema
As regiões no mapa SVG têm áreas que se sobrepõem. Regiões menores ficam por cima de regiões maiores, o que pode fazer com que ao clicar em uma região grande, o clique seja capturado por uma região menor que está sobreposta.

#### Ordem de Renderização Atual
O código tenta ordenar as regiões para que as menores fiquem por cima:
```typescript
.sort((a, b) => {
  // Regiões selecionadas por último (ficam visíveis)
  if (a.isSelected && !b.isSelected) return 1;
  if (!a.isSelected && b.isSelected) return -1;
  // Regiões ativas por último
  if (a.isActive && !b.isActive) return 1;
  if (!a.isActive && b.isActive) return -1;
  // Menores por último (ficam por cima)
  return b.pathCount - a.pathCount;
});
```

#### Problema com a Ordenação
- A ordenação por `pathCount` pode não refletir o tamanho real da área da região
- Regiões com muitos paths pequenos podem ter um `pathCount` alto, mas área total pequena
- Regiões com poucos paths grandes podem ter um `pathCount` baixo, mas área total grande

### 3. Propagação de Eventos de Clique

#### Problema
Mesmo com `stopPropagation()` e `stopImmediatePropagation()`, eventos de clique podem ser capturados por múltiplos paths quando há sobreposição.

#### Código Atual
```typescript
onClick={(e: React.MouseEvent<SVGPathElement>) => {
  e.stopPropagation();
  e.nativeEvent.stopImmediatePropagation();
  handleRegionClick(e, region.id);
}}
```

#### Limitação
- Se dois paths estão exatamente sobrepostos, ambos podem receber o evento
- A ordem de processamento dos eventos pode variar
- O último path processado pode sobrescrever a seleção anterior

### 4. Comparação de IDs Inconsistente

#### Problema
O sistema faz múltiplas conversões de tipo (string, UUID) e comparações que podem falhar:

```typescript
// Em MapaTuristico.tsx
const clickedRegionId = String(region.id);
const currentSelectedId = selectedRegion ? String(selectedRegion.id) : '';

// Em MSInteractiveMap.tsx
const normalizedSelectedRegion = selectedRegion ? String(selectedRegion) : null;
const regionIdStr = String(region.id);
const isSelected = normalizedSelectedRegion === regionIdStr;
```

#### Problemas Potenciais
- Se `region.id` do banco for UUID e `selectedRegion` for do código estático, a comparação falha
- Conversões múltiplas podem introduzir erros de tipo
- Comparações estritas (`===`) podem falhar se os tipos não forem exatamente iguais

### 5. Fallback para Dados Estáticos

#### Problema
Quando o banco de dados está vazio ou há erro, o sistema usa dados do arquivo `touristRegions2025.ts`, que tem IDs diferentes dos UUIDs do banco.

#### Fluxo de Dados
1. Sistema tenta carregar do banco (UUIDs)
2. Se falhar, usa dados estáticos (IDs simples)
3. Paths SVG sempre usam IDs estáticos
4. **Incompatibilidade**: UUIDs do banco não correspondem aos IDs dos paths

---

## Por Que Outra Região Acende?

### Cenário 1: Paths Sobrepostos
Quando você clica em uma região grande (ex: Pantanal), mas há uma região menor sobreposta (ex: Campo Grande), o clique pode ser capturado pela região menor que está por cima.

**Solução necessária**: Melhorar a detecção de qual região foi realmente clicada, considerando a área visual do mapa base.

### Cenário 2: ID Incorreto
Se o ID da região selecionada não corresponde ao ID usado nos paths SVG, o sistema pode:
1. Não encontrar os paths corretos
2. Aplicar o destaque na região errada
3. Não aplicar destaque algum

**Solução necessária**: Garantir que o `slug` seja usado como identificador consistente entre banco, código e paths SVG.

### Cenário 3: Múltiplos Paths da Mesma Região
Uma região pode ter múltiplos paths SVG (ilhas, áreas separadas). Se apenas um path recebe o clique, mas o destaque é aplicado a todos, pode parecer que outra região foi selecionada.

**Solução necessária**: Agrupar todos os paths de uma região e aplicar o destaque uniformemente.

### Cenário 4: Estado Desatualizado
Se o estado React não atualizar corretamente após o clique, a região visualmente destacada pode não corresponder à região selecionada no estado.

**Solução necessária**: Garantir que o estado seja atualizado de forma síncrona e consistente.

---

## Recomendações de Correção

### 1. Usar Slug como Identificador Principal
- O `slug` é único e consistente entre banco e código
- Usar `slug` como chave no JSON de paths SVG
- Comparar sempre por `slug`, não por `id`

### 2. Melhorar Detecção de Clique
- Usar coordenadas do clique para determinar qual região foi realmente clicada
- Considerar a região visualmente mais próxima do ponto de clique
- Priorizar regiões maiores quando há ambiguidade

### 3. Normalizar IDs
- Criar um mapeamento UUID → slug no banco de dados
- Usar sempre o slug para renderização e comparação
- Manter UUID apenas para referências internas do banco

### 4. Melhorar Ordenação de Paths
- Calcular área real de cada região (não apenas pathCount)
- Ordenar por área, com menores por cima
- Manter ordem consistente entre renderizações

### 5. Adicionar Logs de Debug
- Logar qual região foi clicada
- Logar qual região foi selecionada
- Logar comparações de IDs para identificar inconsistências

---

## Estrutura de Dados Esperada

### No Banco de Dados (`tourist_regions`)
```sql
id: UUID (chave primária)
slug: TEXT UNIQUE (identificador consistente)
name: TEXT
color: TEXT (hex)
color_hover: TEXT (hex)
description: TEXT
cities: JSONB (array de strings)
highlights: JSONB (array de strings)
image_url: TEXT
order_index: INTEGER
is_active: BOOLEAN
```

### No Código (`touristRegions2025.ts`)
```typescript
id: string (deve ser o slug)
slug: string (identificador consistente)
name: string
color: string
colorHover: string
description: string
cities: string[]
highlights: string[]
image: string
```

### No JSON de Paths (`svg-regions-paths.json`)
```json
{
  "regions": {
    "pantanal": ["path1", "path2", ...],
    "bonito-serra-bodoquena": ["path1", "path2", ...],
    ...
  }
}
```

**IMPORTANTE**: As chaves do JSON devem corresponder aos `slug` das regiões, não aos `id` (UUIDs).

---

## Conclusão

O principal problema é a **incompatibilidade entre IDs do banco (UUIDs) e IDs usados nos paths SVG (slugs)**. A solução é usar o `slug` como identificador consistente em todo o sistema, mantendo o UUID apenas como chave primária do banco de dados.

Além disso, é necessário melhorar a detecção de cliques em áreas sobrepostas e garantir que apenas a região realmente clicada seja destacada.

---

## Correções Implementadas

### 1. Uso de Slug como Identificador Principal ✅

**Arquivos modificados:**
- `src/components/map/MSInteractiveMap.tsx`
- `src/pages/MapaTuristico.tsx`
- `src/hooks/useTouristRegions.ts`

**Mudanças:**
- Todas as comparações agora usam `slug` em vez de `id`
- O hook `useTouristRegions` agora define `id` como `slug` para consistência
- O componente de mapa busca paths SVG usando `slug` como chave
- Comparações de seleção e hover usam `slug`

### 2. Melhoria na Ordenação de Renderização ✅

**Implementação:**
- Criada função `getRenderPriority()` com prioridades fixas por região
- Campo Grande (menor/central): prioridade 9 (renderiza por último, fica por cima)
- Pantanal (maior): prioridade 1 (renderiza primeiro, fica atrás)
- Ordenação garante que regiões menores capturam cliques corretamente

### 3. Agrupamento de Paths em Elementos `<g>` ✅

**Mudança:**
- `onClick` movido do elemento `<path>` para o grupo `<g>`
- Melhor performance e detecção de cliques
- Evita múltiplos eventos de clique em paths individuais
- Todos os paths de uma região são tratados como uma unidade

### 4. Script SQL para Garantir Slugs Corretos ✅

**Arquivo criado:**
- `supabase/migrations/20250126000001_fix_tourist_regions_slugs.sql`

**Funcionalidades:**
- Insere ou atualiza todas as 9 regiões com slugs corretos
- Garante que os slugs correspondam exatamente aos usados nos paths SVG
- Validação automática de slugs após migração
- Usa `ON CONFLICT` para atualizar regiões existentes

### 5. Logs de Debug Melhorados ✅

**Melhorias:**
- Logs agora mostram `slug` em vez de `id`
- Mensagens mais claras sobre qual região foi clicada/selecionada
- Facilita identificação de problemas de sincronização

---

## Como Aplicar as Correções

### 1. Executar a Migration SQL

```sql
-- Executar no Supabase SQL Editor ou via CLI
\i supabase/migrations/20250126000001_fix_tourist_regions_slugs.sql
```

### 2. Verificar Slugs no Banco

```sql
SELECT name, slug, is_active 
FROM tourist_regions 
ORDER BY order_index;
```

### 3. Testar o Mapa

1. Acesse a página do mapa turístico
2. Clique em cada região
3. Verifique se a região correta é destacada
4. Verifique os logs do console para confirmar slugs corretos

---

## Resultados Esperados

Após aplicar as correções:

✅ **Cada clique seleciona a região correta** - Não há mais regiões erradas sendo destacadas

✅ **Slugs consistentes** - Banco, código e paths SVG usam os mesmos identificadores

✅ **Melhor performance** - Agrupamento de paths reduz eventos desnecessários

✅ **Ordenação correta** - Regiões menores capturam cliques quando sobrepostas

✅ **Debug facilitado** - Logs claros mostram exatamente qual região foi selecionada

---

## Próximos Passos (Opcional)

1. **Adicionar testes automatizados** para validar mapeamento slug → paths
2. **Criar validação no admin** para garantir que slugs sejam únicos e correspondam aos paths
3. **Documentar processo** de adicionar novas regiões (incluindo criação de paths SVG)
4. **Implementar cache** de paths SVG para melhor performance

