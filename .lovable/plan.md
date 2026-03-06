

# Plano: Corrigir Mapa Interativo - Regiões Acendendo Errado

## Diagnóstico

O problema está na abordagem atual do mapa interativo. O componente `MSInteractiveMap.tsx` funciona assim:

1. Carrega o SVG como `<img>` (não-interativo)
2. Sobrepõe um `<svg>` transparente com paths extraídos do `svg-regions-paths.json`
3. Quando clicado, destaca os paths da região selecionada

**O problema**: os paths em `svg-regions-paths.json` estão atribuídos a regiões erradas. A extração baseada em cores falha porque:
- O `celeiro-ms` tem 34 paths com ~30+ cores neutras/ambíguas que se sobrepõem a outras regiões
- Cores como `C2CDAF`, `CCC0A9`, `D9CF8F` são tons de transição que aparecem em áreas de múltiplas regiões
- Vários scripts de extração já tentaram corrigir isso sem sucesso

## Solução: Inline SVG com Detecção Direta de Cor

Substituir completamente a abordagem de overlay por **SVG inline** com detecção direta nos grupos `<g>` do SVG original.

### Como funciona:
1. **Buscar** o SVG via `fetch()` como texto
2. **Renderizar** inline via `dangerouslySetInnerHTML` (com sanitização)
3. **Mapear** cada `<g fill="#COR">` para uma região via `colorToRegion`
4. **Ao clicar** num path, identificar a cor do grupo pai → região
5. **Ao destacar**, modificar opacidade/brilho apenas dos grupos daquela região

### Mapeamento de cores simplificado (cores primárias do SVG):

| Região | Cores principais (fill) |
|--------|------------------------|
| Pantanal | `D1B21B`, `D1B218`, `CFB11C`, `D2B31C`, `DACC7A` |
| Rota Cerrado Pantanal | `84A24B`, `84A148`, `83A147`, `83A049`, `86A155` |
| Costa Leste | `D84642`, `DA4240`, `DA4340`, `DB4240` |
| Campo Grande dos Ipês | `76448E`, `75428E`, `76428D` |
| Bonito Serra da Bodoquena | `81C7CF`, `81C7D1`, `82C7CE` |
| Caminhos da Fronteira | `77694D`, `786C4F`, `76684C` |
| Vale das Águas | `118DC2`, `128EC1`, `148DC1` |
| Caminhos Natureza/Cone Sul | `E0501C`, `E04E1A`, `DA5527` |
| Celeiro do MS | `BFB2C9`, `B5B4D4`, `B3B3D4` |

Cores neutras/ambíguas (como `C2CDAF`, `CCC0A9`, `D9CF8F`) serão mapeadas com base na posição geográfica do path (coordenada X/Y do primeiro ponto `M`).

## Arquivos a modificar

| # | Arquivo | Ação |
|---|---------|------|
| 1 | `src/components/map/MSInteractiveMap.tsx` | Reescrever: SVG inline + detecção por cor de grupo |
| 2 | `src/data/regionColorMapping.ts` | Criar: mapeamento cor→região centralizado |

## O que NÃO muda
- SVG original (`public/images/mapa-ms-regioes.svg`) fica intacto
- `svg-regions-paths.json` não será mais usado pelo mapa (pode ser removido futuramente)
- Interface do componente (`onRegionClick`, `selectedRegion`, etc.) mantém o mesmo contrato
- Nenhuma outra funcionalidade do site

## Benefícios
- Cada clique só pode acionar a região cujo grupo colorido foi clicado
- Sem paths duplicados ou sobrepostos
- Mais simples de manter (sem scripts de extração)

