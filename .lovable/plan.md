

# Correção Definitiva: Contaminação Campo Grande / Celeiro

## Diagnóstico

O centroide baseado em pontos `M` (move-to) é **impreciso**. Paths SVG contêm curvas (`C`, `L`, `Q`) que estendem muito além do ponto M inicial. Um grupo com M em Y=640 pode renderizar visualmente em Y=700+. O regex `matchAll(/M\s+/)` ignora toda a geometria real.

## Solução: `getBBox()` nativo do SVG

O navegador calcula o bounding box real de cada `<g>` via `SVGGElement.getBBox()`. Isso retorna `{x, y, width, height}` considerando TODOS os comandos do path (curvas, linhas, arcos). O centro Y do bbox é a posição real do grupo.

### Mudança em `MSInteractiveMap.tsx` (função `resolveRegionForGroup`)

Substituir o parsing manual de M points por `getBBox()`:

```typescript
// ANTES: regex M points (impreciso)
const pathEls = gElement.querySelectorAll('path');
let totalY = 0, count = 0;
pathEls.forEach(p => { ... matchAll(/M\s+/) ... });

// DEPOIS: bounding box nativo (preciso)
try {
  const bbox = (gElement as SVGGElement).getBBox();
  const centerY = bbox.y + bbox.height / 2;
  return centerY > CAMPO_GRANDE_CELEIRO_Y_THRESHOLD 
    ? 'celeiro-ms' : 'campo-grande-ipes';
} catch { /* fallback atual */ }
```

`getBBox()` é síncrono e funciona desde que o SVG esteja no DOM (que está, pois roda no `useEffect` após render).

### Arquivo a modificar

| Arquivo | Mudança |
|---|---|
| `src/components/map/MSInteractiveMap.tsx` | `getBBox()` no fallback de `resolveRegionForGroup` (~5 linhas) |

Nenhuma mudança em `regionColorMapping.ts`.

### Resultado esperado

- Campo Grande acende **toda** sua área, sem contaminar Celeiro
- Celeiro acende **toda** sua área, sem contaminar Campo Grande
- Hover na lista, hover no mapa e clique — todos corretos
- Paths spanning continuam neutros (sem mudança nessa parte)

