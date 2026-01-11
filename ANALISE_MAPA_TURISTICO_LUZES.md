# Análise: Problema das Luzes no Mapa Turístico

## Situação Atual

O mapa turístico usa uma arquitetura de **duas camadas**:

1. **Camada de imagem** (`mapa-ms-regioes.svg`): Mapa visual com cores das regiões
2. **Camada de overlay SVG**: Paths invisíveis por cima para detectar cliques/hover

Quando uma região é clicada, deveria aparecer um **destaque visual** (stroke branco, fill semi-transparente, sombra).

## Possíveis Problemas Identificados

### 1. **Paths SVG não alinhados com o mapa**
   - Os paths no arquivo `svg-regions-paths.json` podem não corresponder exatamente aos contornos das regiões no SVG de imagem
   - ViewBox do overlay: `0 0 896 1152` - precisa corresponder exatamente ao SVG de imagem

### 2. **Paths incompletos**
   - Os paths podem não cobrir toda a área de cada região
   - Algumas regiões podem ter múltiplos paths que não estão todos incluídos

### 3. **Problemas de renderização**
   - A ordem de renderização (z-index) pode estar interferindo
   - Paths com `opacity: 0` podem estar causando problemas de detecção

### 4. **Lógica de comparação por slug**
   - O código parece correto, mas pode haver inconsistência entre os slugs

## Perguntas para o Usuário (antes de implementar):

1. **Os cliques estão funcionando?** 
   - Quando você clica em uma região, ela é detectada (aparece nos logs do console)?
   - Ou o clique não funciona de jeito nenhum?

2. **O que exatamente não funciona?**
   - As luzes não aparecem de forma alguma?
   - As luzes aparecem na região errada?
   - As luzes aparecem em múltiplas regiões ao mesmo tempo?

3. **Sobre os contornos:**
   - Você mencionou "o mapa precisa dos contornos das regiões ser mais fácil" - o que isso significa?
   - Os paths SVG precisam ser simplificados?
   - Os contornos precisam ser refeitos para cobrir melhor as regiões?

4. **Qual seria a solução ideal?**
   - Refazer os paths SVG baseados no SVG original?
   - Simplificar os paths existentes?
   - Usar uma abordagem diferente (ex: usar a imagem SVG diretamente com áreas clicáveis)?

## Próximos Passos (após sua resposta):

1. **Se o problema for alinhamento dos paths:**
   - Refazer a extração dos paths do SVG original
   - Ajustar o viewBox para corresponder exatamente

2. **Se o problema for contornos incompletos:**
   - Simplificar os paths usando técnicas de simplificação de SVG
   - Garantir que todos os paths estejam incluídos

3. **Se o problema for na lógica:**
   - Ajustar a comparação por slug
   - Melhorar a ordem de renderização

4. **Se precisar de uma solução mais robusta:**
   - Considerar usar o SVG original diretamente com eventos de clique
   - Usar uma biblioteca de mapas SVG mais robusta

---

**Por favor, me diga:**
1. O que exatamente não está funcionando?
2. Os cliques estão sendo detectados?
3. Qual abordagem você prefere para resolver?

Após sua resposta, vou implementar a solução adequada! 🗺️✨

