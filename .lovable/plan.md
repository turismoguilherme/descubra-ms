

# Correção: Celeiro acendendo Campo Grande dos Ipês

## Diagnóstico

O problema está na **inicialização** (linha 130 do `MSInteractiveMap.tsx`). Ao atribuir `data-region` para grupos ambíguos, `resolveRegionForGroup(g)` usa o **primeiro ponto M do primeiro path** como heurística de posição. Porém, alguns grupos `<g fill="#75428C">` têm o primeiro path começando em Y > 650 (zona Celeiro) mas pertencem visualmente a Campo Grande, ou vice-versa.

Resultado: quando Celeiro é ativo, grupos erroneamente marcados como `data-region="celeiro-ms"` que estão visualmente em Campo Grande ficam iluminados → o usuário vê Campo Grande "acendendo".

## Solução

Substituir a heurística de "primeiro ponto M" por **centroide Y** (média de todos os pontos M do grupo). Isso é mais robusto porque usa a posição média real do grupo, não apenas o primeiro ponto.

### Mudança em `MSInteractiveMap.tsx` (função `resolveRegionForGroup`, linhas 46-53)

Alterar o fallback para calcular a média Y de **todos** os pontos M de **todos** os paths do grupo:

```typescript
// ANTES: usa apenas primeiro M do primeiro path
const pathEl = gElement.querySelector('path');

// DEPOIS: média Y de todos os M points de todos os paths
const pathEls = gElement.querySelectorAll('path');
let totalY = 0, count = 0;
pathEls.forEach(p => {
  const d = p.getAttribute('d') || '';
  const matches = d.matchAll(/M\s+([\d.]+)\s+([\d.]+)/g);
  for (const m of matches) { totalY += parseFloat(m[2]); count++; }
});
if (count > 0) {
  const avgY = totalY / count;
  return avgY > CAMPO_GRANDE_CELEIRO_Y_THRESHOLD ? 'celeiro-ms' : 'campo-grande-ipes';
}
```

### Arquivo a modificar

| Arquivo | Mudança |
|---|---|
| `src/components/map/MSInteractiveMap.tsx` | Centroide Y no fallback de `resolveRegionForGroup` (~10 linhas) |

Nenhuma mudança em `regionColorMapping.ts`.

