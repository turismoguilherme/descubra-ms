

# Plano: Robô Integrado como Experiência Visual Interativa

## Problema
O robô atual é literalmente uma imagem PNG estática "jogada" no hero — sem integração visual com o ambiente, sem profundidade, sem interatividade real. Parece um recorte colado.

## Solução: Composição Visual em Camadas

Em vez de uma imagem solta, criar uma **cena imersiva** onde o robô está **integrado ao ambiente** com elementos interativos ao redor que reforçam "Travel Tech":

### Camada 1 — Pedestal/Base Holográfica
- Círculo de luz neon verde no "chão" abaixo do robô (gradiente radial + blur)
- Anéis concêntricos girando lentamente (SVG animado) — simula plataforma holográfica
- Grid hexagonal sutil no chão (perspectiva CSS 3D)

### Camada 2 — Robô com Integração
- Imagem PNG mantida mas com `mask-image` gradiente para fundir bordas com o fundo (sem corte brusco)
- Sombra projetada colorida (drop-shadow emerald) no pedestal
- Efeito de flutuação mais pronunciado (hover effect: sobe mais + glow intensifica)

### Camada 3 — Telas Holográficas Flutuantes (CSS/SVG)
- 3-4 painéis transparentes posicionados AO REDOR do robô (não na imagem)
- Cada painel tem conteúdo animado:
  - **Painel superior-direito**: Mini gráfico de barras animado (CSS bars crescendo)
  - **Painel esquerdo**: Ícone "AI" com pulse + linhas de conexão neural
  - **Painel inferior**: Linha de tendência ascendente (SVG path animado com `stroke-dashoffset`)
  - **Painel médio**: KPI numbers contando (ex: "98.5%" satisfaction animando)
- Painéis com `backdrop-blur`, border neon sutil, leve rotação 3D (perspective + rotateY)

### Camada 4 — Partículas e Conexões
- Linhas de dados fluindo do robô para os painéis (SVG paths animados)
- Partículas de luz subindo do pedestal
- Orbs de energia orbitando o robô

### Camada 5 — Interatividade
- **Hover no container**: painéis se aproximam, glow intensifica, partículas aceleram
- **Mouse parallax leve**: painéis se movem sutilmente com o mouse (framer-motion `useMotionValue`)

## Arquivo modificado
| Arquivo | Ação |
|---------|------|
| `src/components/home/TravelTechRobot.tsx` | Reescrever completamente — cena imersiva com camadas |

## Resultado
O robô deixa de ser "uma imagem colada" e passa a ser o **centro de uma cena tecnológica viva** — com hologramas, dados fluindo, pedestal luminoso — transmitindo que a ViaJARTur é uma plataforma de IA/dados de verdade.

