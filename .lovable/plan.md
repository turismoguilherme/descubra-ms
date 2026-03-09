

# Plano: Robô SVG Vetorial Animado com GSAP

## Problema
O componente atual usa uma **imagem PNG estática** com overlays animados. O usuário quer um **SVG vetorial completo** do robô, totalmente animado com GSAP — corpo, braços, olhos, telas holográficas — tudo como shapes SVG que se movem organicamente.

## Solução

Reescrever `TravelTechRobot.tsx` usando:
1. **SVG inline** com formas vetoriais (círculos, retângulos, paths)
2. **GSAP** para animações complexas e coordenadas
3. **Mouse tracking** para pupilas dinâmicas

### Estrutura do Robô SVG

| Elemento | Shapes | Animação GSAP |
|----------|--------|---------------|
| **Corpo** | Retângulo arredondado preto + accents neon verde | Respiração (scale 0.98→1.02 em 4s) + Flutuação (translateY ±3px) |
| **Cabeça** | Oval/círculo com olhos redondos grandes | Rotação leve Z (-2deg→2deg em 7s) |
| **Olhos** | Círculos grandes verdes glowing + pupilas internas | Fill animando (#00FF00↔#00FFAA), pupilas seguem mouse |
| **Peito** | Círculo central com glow + arco de energia | Pulse scale + opacity |
| **Braço Direito** | Path curvo apontando para cima | Rotate -5deg yoyo em 6s (gesto dinâmico) |
| **Braço Esquerdo** | Path flexionado | Oscilação leve |
| **Juntas** | Círculos neon verde nas articulações | Pulse opacity |

### Telas Holográficas SVG

| Tela | Conteúdo | Animação |
|------|----------|----------|
| **Analytics** | Barras multicoloridas (vermelho/azul/ciano) | Height anima 20%→80% em loop random |
| **AI Neural** | Rede de conexões rosa/verde | Stroke-opacity variando (sinapses) |
| **Satisfação 98.5%** | Arco rainbow + número | Número oscila 98%↔99%, arco pulse |
| **Trend** | Linha ascendente multicolor | Stroke-dashoffset 0 em 5s repeat |
| **Lista textual** | Linhas de texto simuladas | Fade in/out sequencial |

### Fundo Cyber

- Shapes de bokeh blur multicolor (círculos com filter blur)
- Partículas animadas com `animateMotion`
- Scan lines horizontais translúcidas

### Dependência

Adicionar **GSAP** ao projeto:
```json
"gsap": "^3.12.5"
```

## Arquivos

| Arquivo | Ação |
|---------|------|
| `src/components/home/TravelTechRobot.tsx` | Reescrever completamente — SVG vetorial + GSAP |
| `package.json` | Adicionar dependência `gsap` |

## Código Base (estrutura)

```tsx
import { gsap } from 'gsap';
import { useEffect, useRef, useCallback } from 'react';

const TravelTechRobot = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const pupilsRef = useRef<SVGGElement>(null);
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Respiração corpo
      gsap.to('#robot-body', { scale: 1.02, duration: 4, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      // Flutuação
      gsap.to('#robot-group', { y: -6, duration: 5, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      // Braço direito apontando
      gsap.to('#arm-right', { rotation: -5, transformOrigin: 'left center', duration: 6, yoyo: true, repeat: -1 });
      // Cabeça olhando
      gsap.to('#head', { rotation: 2, duration: 7, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      // Olhos color shift
      gsap.to('.eye-glow', { fill: '#00FFAA', duration: 3, yoyo: true, repeat: -1 });
      // Barras analytics
      gsap.to('.bar', { scaleY: 'random(0.3, 1)', duration: 2, stagger: 0.2, repeat: -1, yoyo: true });
      // Trend line draw
      gsap.to('#trend-line', { strokeDashoffset: 0, duration: 5, repeat: -1 });
      // Neural synapses
      gsap.to('.synapse', { opacity: 'random(0.3, 1)', duration: 0.8, stagger: 0.1, repeat: -1 });
    }, svgRef);
    return () => ctx.revert();
  }, []);

  // Mouse follow para pupilas
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || !pupilsRef.current) return;
    const x = (e.clientX - rect.left - rect.width / 2) / 25;
    const y = (e.clientY - rect.top - rect.height / 2) / 25;
    gsap.to(pupilsRef.current.children, { x, y, duration: 0.3 });
  }, []);

  return (
    <svg ref={svgRef} viewBox="0 0 500 400" onMouseMove={handleMouseMove}>
      {/* Fundo bokeh */}
      {/* Corpo robô */}
      {/* Braços */}
      {/* Cabeça + olhos */}
      {/* Telas holográficas */}
      {/* Partículas */}
    </svg>
  );
};
```

## Resultado

Robô 100% vetorial com:
- Animações orgânicas coordenadas via GSAP
- Olhos que seguem o cursor
- Telas com dados "ao vivo"
- Otimizado para performance (transform-only)
- Funciona em mobile

