

# Plano: Corrigir Campo Grande vs Celeiro - Grupos SVG que Abrangem Duas Regiões

## Diagnóstico Raiz

Analisei o SVG original e encontrei o problema real. Existem **grupos `<g>` grandes cujos paths cruzam ambas as regiões**:

| Grupo (linha SVG) | Cor | Início (Y) | Extensão até (Y) | Região atribuída |
|---|---|---|---|---|
| Linha 2913 | `BEAFC9` | 586 | ~750 | Campo Grande (fixo) |
| Linha 2895 | `75428C` | 548 | ~754 | Campo Grande (via threshold) |
| Linha 3398 | `CED1DD` | 689 | ~866 | **Não mapeado** (zona morta) |

O `BEAFC9` (roxo claro) é UM ÚNICO path SVG que desenha uma forma desde o centro de Campo Grande até a área do Celeiro. Quando alguém clica na parte sul desse path, o sistema retorna "Campo Grande" porque o grupo inteiro está marcado assim. O inverso também acontece com paths do Celeiro que se estendem para cima.

## Solução

Usar as **coordenadas reais do clique** (não apenas a primeira coordenada M do path) para determinar a região em grupos ambíguos.

### Mudanças em `regionColorMapping.ts`
1. Expandir o `AMBIGUOUS_PURPLE_SET` para incluir TODOS os tons roxos/lilás que aparecem em ambas as regiões: `BEAFC9`, `75428C`, `BFB2C9`
2. Adicionar `CED1DD` ao mapeamento (cor cinza-lilás não mapeada, pertence ao Celeiro)

### Mudanças em `MSInteractiveMap.tsx`
1. No click handler, converter `event.clientX/clientY` para coordenadas SVG usando `getScreenCTM()`
2. Para grupos marcados como ambíguos, usar a coordenada Y do **clique real** (não do path) para decidir a região
3. Para o highlighting visual, grupos ambíguos ficam neutros (sem escurecer/clarear) — evita acender a região errada

### Lógica de fronteira
Para áreas de borda entre Campo Grande e Celeiro, o sistema seleciona a região mais próxima com base na posição Y do clique (threshold Y=650).

## Arquivos a modificar

| Arquivo | Ação |
|---|---|
| `src/data/regionColorMapping.ts` | Expandir set ambíguo + mapear `CED1DD` |
| `src/components/map/MSInteractiveMap.tsx` | Click handler com coordenadas SVG reais |

## O que NÃO muda
- SVG original intacto
- Visual das outras 7 regiões
- Interface do componente (props)

