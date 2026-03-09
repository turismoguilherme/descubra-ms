

# Plano: Robô Cyber-Futurista Profissional

## Problema
O robô atual é um SVG simplificado com formas geométricas básicas — não se aproxima da referência 3D realista com corpo metálico, olhos glowing, e telas holográficas detalhadas.

## Solução

Usar a **AI Image Generation** (Gemini) para gerar uma imagem de alta qualidade do robô baseada na referência, e depois integrar no componente com animações CSS sobrepostas para manter interatividade.

### Abordagem em 2 camadas:

**Camada 1 — Imagem gerada por IA:**
- Gerar via `google/gemini-3-pro-image-preview` (modelo de maior qualidade) um robô androide cyber-futurista com:
  - Corpo preto fosco metálico, accents neon verde nas juntas
  - Olhos grandes glowing verde intenso, cabeça oval sem boca
  - Pose de perfil esquerdo, braço direito apontando para cima
  - Telas holográficas flutuantes com gráficos (barras, linhas, "AI")
  - Fundo bokeh noturno (laranja/vermelho/verde/azul)
- Salvar como `src/assets/travel-tech-robot.png`

**Camada 2 — Animações CSS overlay:**
- Manter efeitos de glow pulsante nos olhos (CSS `box-shadow` animado sobre posições fixas)
- Partículas de dados flutuantes (CSS/framer-motion)
- Scan lines holográficas sutis
- Hover interatividade (scale sutil, brilho aumenta)
- `prefers-reduced-motion` respeitado

### Arquivo modificado:
| Arquivo | Ação |
|---------|------|
| `src/components/home/TravelTechRobot.tsx` | Reescrever — imagem + overlays animados |
| `src/assets/travel-tech-robot.png` | Criar via AI image generation |

### Resultado:
Robô com aparência 3D profissional idêntica à referência, com micro-animações web sobrepostas para manter dinamismo.

