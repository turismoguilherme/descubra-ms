
Objetivo: eliminar a contaminação cruzada entre “Celeiro do MS” e “Campo Grande dos Ipês” em hover/lista/clique, mantendo o critério “acender tudo”.

Diagnóstico do que ainda falha
- Hoje a classificação está em nível de `<g>` (`data-region` no grupo).
- No SVG há grupos ambíguos com muitos `<path>` desconectados dentro do mesmo `<g>` (ex.: tons roxos claros e transições), então um único `data-region` no grupo “pinta blocos inteiros” em regiões erradas.
- Mesmo com `getBBox()`, se aplicado ao `<g>` inteiro, o centro representa o conjunto, não cada área individual.

Plano de implementação (conciso)
1) Migrar classificação de ambíguos para nível de path
- Arquivo: `src/components/map/MSInteractiveMap.tsx`
- Na etapa de inicialização do SVG:
  - Para cores não ambíguas: manter estratégia atual (grupo pode continuar com `data-region`).
  - Para cores ambíguas: não atribuir `data-region` ao `<g>`; iterar `g.querySelectorAll('path')` e definir `data-region` em cada `<path>` com `getBBox()` do próprio path.
- Benefício: cada mancha recebe dono correto, reduzindo contaminação em múltiplas áreas.

2) Ajustar resolução de região para eventos
- Arquivo: `src/components/map/MSInteractiveMap.tsx`
- Em `getRegionSlugFromElement`:
  - Primeiro tentar `closest('[data-region]')` (path ou group).
  - Se não achar, manter fallback por `<g fill>` para compatibilidade.
- Benefício: hover/click do mapa passam a respeitar a classificação granular.

3) Ajustar highlight para operar em elementos com `data-region` (path + group)
- Arquivo: `src/components/map/MSInteractiveMap.tsx`
- No effect de destaque:
  - Trocar seleção de `g[data-region]` para `[data-region]`.
  - Aplicar filtro por elemento individual.
  - Remover neutralização de spanning para o caso Campo/Celeiro (alinhado ao critério “acender tudo”).
- Benefício: hover na lista e seleção ativa acendem exatamente as áreas corretas.

4) Tornar a regra de separação mais estável para Campo/Celeiro
- Arquivo: `src/components/map/MSInteractiveMap.tsx`
- Para paths ambíguos: usar `getBBox().centerY` do path como critério principal.
- Manter fallback defensivo se `getBBox()` falhar (evita quebra em edge cases).

5) Validação funcional obrigatória
- Fluxos: hover na lista, hover no mapa e clique no mapa.
- Cenários focais:
  - Hover em “Celeiro do MS” não acende áreas de Campo.
  - Hover em “Campo Grande dos Ipês” não acende áreas de Celeiro.
  - Clique no mapa em ambos mantém seleção consistente com o highlight.

Detalhes técnicos
- Arquivo principal afetado: `src/components/map/MSInteractiveMap.tsx`.
- Mudança de modelo: “classificação por grupo” → “classificação híbrida (grupo para não ambíguo, path para ambíguo)”.
- Risco controlado: manter fallback existente evita regressão em regiões não ambíguas.
- Não será necessário mexer em `src/data/regionColorMapping.ts` nesta etapa, salvo se surgir novo conjunto ambíguo durante validação.

Observação de execução
- O formulário de perguntas foi dispensado; seguirei este plano assumindo que o aceite permanece: prioridade para “acender tudo” sem contaminação visual entre as duas regiões.
