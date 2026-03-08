

# Plano: Corrigir Mapa (Campo Grande vs Celeiro) + Info sobre Rotas Removidas

## Sobre as rotas removidas anteriormente

Na ultima alteracao foram removidas rotas duplicadas que existiam FORA dos blocos `showMS`/`showViajar`. Eram rotas compartilhadas como:
- `/admin/*`, `/overflow-one/*`, `/cat-login`
- Dashboard routes que estavam duplicados fora dos condicionais

**Nenhuma funcionalidade foi perdida** — essas rotas continuam existindo dentro dos blocos `showViajar` (linhas 174-298) e `showMS` (linhas 302-360). A duplicacao causava ambiguidade no React Router.

---

## Diagnostico do mapa: Campo Grande vs Celeiro

O SVG `mapa-ms-regioes.svg` usa a mesma familia de cores roxas escuras (`76448E`, `76438D`, `76428E`, `76428D`) para AMBAS as regioes. A logica atual tenta distinguir pela coordenada Y do primeiro ponto M de cada grupo:

| Grupo `<g>` | Cor | Primeiro M (Y) | Regiao esperada |
|---|---|---|---|
| Linha 2737 | `76448E` | Y=506 | Campo Grande |
| Linha 2869 | `76438D` | Y=526 | Campo Grande |
| Linha 2885 | `76438D` | Y=538 | Campo Grande |
| Linha 3057 | `76428E` | Y=618 | Campo Grande |
| Linha 3086 | `76428E` | Y=596 | Campo Grande |
| Linha 3333 | `76428E` | Y=690 | **Celeiro** |
| Linha 3481 | `76428D` | Y=730 | **Celeiro** |

O threshold atual e `Y > 650`. Isso parece correto para esses grupos.

**Porem**, ha cores neutras NAO mapeadas que pertencem ao Celeiro:

| Cor | Primeiro M (Y) | Descricao | Regiao provavel |
|---|---|---|---|
| `B5C2CD` | Y=743 | Cinza-azulado | Celeiro (borda) |
| `BDB6BE` | Y=781 | Cinza | Celeiro (borda) |
| `BCB8AB` | Y=878 | Bege-cinza | Caminhos da Fronteira (borda) |
| `BFB9AD` | Y=900 | Bege-cinza | Caminhos da Fronteira (borda) |
| `BFB8AC` | Y=931 | Bege-cinza | Caminhos da Fronteira (borda) |
| `CCC0A9` | Y=494 | Bege | Cerrado Pantanal (borda) |

Essas cores neutras sao transicoes/bordas entre regioes. Quando o usuario clica nessas areas, nada acontece (zona morta), e visualmente elas nao se destacam junto com a regiao.

## Plano de correcao

### 1. Adicionar cores neutras ao mapeamento (`regionColorMapping.ts`)

Mapear as cores de borda/transicao para suas regioes corretas com base na posicao geografica:

- `B5C2CD`, `BDB6BE` → `celeiro-ms` (sul, Y > 700)
- `BCB8AB`, `BFB9AD`, `BFB8AC` → `caminhos-fronteira` (extremo sul, Y > 850)
- `CCC0A9` → `rota-cerrado-pantanal` (norte, Y < 500)

### 2. Refinar threshold Campo Grande vs Celeiro

Manter Y=650 como threshold (os dados confirmam que funciona), mas adicionar log de debug temporario para validar se os grupos estao sendo classificados corretamente.

### 3. Verificar contorno visual

O destaque usa `brightness(1.4)` para a regiao ativa e `brightness(0.7)` para as outras. Grupos nao mapeados ficam sem filtro (neutros), o que cria a impressao de "contorno errado". Ao mapear as cores neutras, o contorno visual ficara completo.

## Arquivos a modificar

| Arquivo | Acao |
|---|---|
| `src/data/regionColorMapping.ts` | Adicionar ~6 cores neutras ao mapeamento |
| `src/components/map/MSInteractiveMap.tsx` | Nenhuma mudanca estrutural necessaria |

