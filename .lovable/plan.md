

# Plano: Robô Articulado SVG — Movimento Real de Corpo e Membros

## Problema
O robô atual é uma imagem PNG única. Qualquer "movimento" é apenas CSS transform na imagem inteira — não é possível mover braços, virar a cabeça, ou animar partes do corpo independentemente. Parece artificial.

## Solução: Substituir o PNG por um Robô SVG Articulado

Construir o robô inteiramente em SVG com **partes separadas**, cada uma animada individualmente via framer-motion. Mantemos todo o ecossistema ao redor (pedestal, painéis holográficos, partículas, data streams, parallax).

### Estrutura do Robô SVG (partes independentes):

```text
        [Antena] — oscila lateralmente
     ┌──[Cabeça]──┐ — vira para os lados (rotateY), inclina
     │  [Olhos]   │ — piscam, mudam cor, seguem mouse
     └────┬───────┘
    ┌─────┴─────┐
    │  [Tronco]  │ — respiração (scaleY), leve balanço
    │  [Tela]    │ — gráficos animados no "peito"
    └──┬─────┬──┘
  [Braço L] [Braço R] — acenam, apontam, gesticulam
       │         │
  [Mão L]   [Mão R]
       │
  ─────┴─────
   [Base/Pernas] — leve balanço
```

### Animações independentes por parte:

| Parte | Movimento | Duração |
|-------|-----------|---------|
| Cabeça | Vira esquerda→frente→direita→frente (rotateY) | 8s loop |
| Olhos | Piscam a cada ~4s, pupilas seguem mouse | contínuo |
| Braço direito | Acena (rotate -5°→15°→-5°) | 5s loop |
| Braço esquerdo | Gesto sutil (rotate 3°→-8°→3°) | 7s loop |
| Antena | Oscila lateralmente | 3s loop |
| Tronco | Respiração (scaleY 1→1.008→1) | 3s loop |
| Tela peito | Mini gráfico animado (barras subindo/descendo) | contínuo |
| Base | Balanço sutil lateral | 6s loop |

### Design visual do SVG:
- **Estilo**: Geométrico moderno, metalizado — gradientes lineares simulando metal escovado
- **Cores**: Ciano/emerald para glows e acentos, slate/cinza para corpo metálico
- **Proporções**: Cabeça oval grande, corpo retangular arredondado, braços articulados
- **Detalhes**: Juntas com círculos luminosos, linhas de circuito no corpo, tela holográfica no peito

### O que muda vs o que mantém:

**Mantém intacto:**
- `HolographicPedestal` — pedestal com anéis girando
- `BarChartPanel`, `AIPanel`, `TrendPanel`, `KPIPanel` — painéis holográficos
- `Particles`, `Orbs`, `DataStreams` — efeitos ambientais
- Mouse parallax nos painéis
- Scan lines
- Eye glow overlays (reposicionados para o SVG)

**Substitui:**
- `<motion.img src={robotImage}>` → `<RobotSVG />` componente SVG articulado
- Arquivo PNG não é mais usado (pode manter como fallback)

### Arquivos:

| Arquivo | Ação |
|---------|------|
| `src/components/home/RobotSVG.tsx` | **Criar** — SVG articulado com partes animadas |
| `src/components/home/TravelTechRobot.tsx` | **Atualizar** — trocar `<motion.img>` por `<RobotSVG />` |

### Resultado:
Robô com movimento real — cabeça que vira, braços que acenam, olhos que piscam e seguem o mouse, antena que balança. Tudo isso mantendo os hologramas, partículas e interatividade ao redor.

