

# Correção Definitiva: Campo Grande vs Celeiro - Highlighting Visual

## Problema Raiz Identificado

O problema NÃO é na detecção de clique (que já usa coordenadas reais). O problema é no **highlighting visual**.

Grupos SVG ambíguos como `BEAFC9` (Y=586→751) e `75428C` (Y=548→754) são **um único elemento DOM**. Não é possível iluminar metade e escurecer a outra metade. Na inicialização, o código atribui `data-region` baseado no primeiro ponto M, e o highlighting usa esse atributo:

- `BEAFC9` recebe `data-region="campo-grande-ipes"` (primeiro M Y=586)
- Quando Celeiro é ativo → BEAFC9 fica escurecido (errado, pois metade é Celeiro)
- Quando Campo Grande é ativo → BEAFC9 fica iluminado (errado, pois metade é Celeiro)

O replay confirma: o hover alterna rapidamente entre Campo Grande e Celeiro ao mover o mouse sobre esses paths.

## Solução

Para grupos ambíguos que cruzam fisicamente ambas as regiões: **torná-los visualmente neutros** (sem filtro de brilho). Isso impede que iluminem ou escureçam incorretamente.

Adicionalmente, o grupo `CED1DD` (Y=689→866) também cruza Celeiro e Caminhos da Fronteira, então precisa do mesmo tratamento.

### Mudanças em `MSInteractiveMap.tsx` (highlighting - ~5 linhas)

No bloco de highlighting (linhas 207-214), para grupos com `data-ambiguous="true"`:
```
// ANTES: tentava iluminar/escurecer baseado em data-region
// DEPOIS: sempre neutro (sem filtro)
if (isAmbiguous && activeSlug) {
  gEl.style.filter = 'none'; // Neutro — evita contaminação visual
}
```

### Mudanças em `regionColorMapping.ts` (~3 linhas)

Adicionar `CED1DD` ao `AMBIGUOUS_PURPLE_SET` (cruza Celeiro + Fronteira):
```
const AMBIGUOUS_PURPLE_SET = new Set([
  ...existentes,
  'CED1DD', // cinza-lilás que cruza Celeiro e Fronteira
]);
```

E adicionar `CDABB3` e `C6B2B4` como ambíguos (paths de transição na fronteira Campo Grande/Celeiro/Costa Leste).

### Resultado esperado

- Clique continua preciso (usa coordenada Y real)
- Hover no sidebar da lista continua funcionando
- Regiões NÃO ambíguas iluminam/escurecem normalmente (sem mudança)
- Paths que cruzam duas regiões ficam neutros visualmente (nem iluminam nem escurecem)
- Campo Grande e Celeiro nunca "acendem" um ao outro

### Arquivos a modificar

| Arquivo | Ação |
|---|---|
| `src/components/map/MSInteractiveMap.tsx` | Highlighting neutro para ambíguos (~5 linhas) |
| `src/data/regionColorMapping.ts` | Expandir AMBIGUOUS set com 3 cores (~3 linhas) |

