

# Plano: Cases Premium + Sobre Redesign + Robô Cyber-Futurista

## 1. SuccessCasesSection -- Aplicar nova identidade visual

**Problema**: A seção já usa cores `travel-tech-*` mas não utiliza `GlassmorphismCard` e o layout dos cards ainda é o antigo (gradient overlay simples).

**Solução**: Refatorar para usar `GlassmorphismCard` com efeitos 3D, bordas neon, e visual premium consistente com o resto da landing page. Manter a estrutura de dados (Descubra MS + Koda) e o sistema de content dinâmico.

**Arquivo**: `src/components/home/SuccessCasesSection.tsx`

---

## 2. Sobre -- Redesign com identidade Travel Tech Premium

**Problema**: Layout atual usa `slate-950/900` com `TechBackground` e `GlowCard` -- estilo antigo que não segue a nova identidade premium.

**Solução**: Redesign completo aplicando:
- Hero com `FloatingTechElements` e gradientes travel-tech
- Narrativa com glassmorphism cards em vez de texto puro
- Team section com cards premium (neon borders, hover effects)
- CTA com gradient travel-tech (turquoise -> ocean-blue)
- Tom B2B consistente

**Arquivo**: `src/pages/Sobre.tsx`

---

## 3. TravelTechRobot -- Recriação baseada na referência

**Problema**: Robô atual é abstrato (caixas com bordas neon), não se parece com o androide da referência.

**Solução**: Recriar completamente usando CSS/SVG puro para renderizar:
- **Corpo**: Silhueta de androide preto fosco cilíndrico (perfil esquerdo)
- **Cabeça**: Oval preta com olhos grandes redondos glowing verde intenso (sem boca)
- **Juntas/Peito**: Accents neon verde circulares
- **Braços**: Articulados -- direito apontando para cima, esquerdo flexionado
- **Telas holográficas**: Painéis flutuantes semi-transparentes com gráficos de barras, linhas de tendência, ícones "AI", gauges
- **Fundo**: Bokeh simulado com blur laranja/vermelho/verde
- **Animações**: Braços oscilando suavemente, telas piscando/atualizando dados, glow pulsante nos olhos, partículas de dados fluindo

Tudo em CSS + SVG inline + framer-motion (sem dependências externas como Three.js/Blender -- otimizado para web).

**Arquivo**: `src/components/home/TravelTechRobot.tsx`

---

## Resumo de arquivos

| Arquivo | Ação |
|---------|------|
| `src/components/home/SuccessCasesSection.tsx` | Refatorar com GlassmorphismCard |
| `src/pages/Sobre.tsx` | Redesign completo travel-tech premium |
| `src/components/home/TravelTechRobot.tsx` | Recriar androide cyber-futurista |

