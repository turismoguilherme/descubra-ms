

# Plano: Robô "Ao Vivo" — Animações Contínuas e Realistas

## Problema
O robô tem animações de entrada (barras crescendo, trend line desenhando) mas depois fica essencialmente estático. Os painéis não atualizam, o robô só flutua levemente. Não parece "vivo".

## Solução: Micro-animações contínuas em loop

Tudo no mesmo arquivo `src/components/home/TravelTechRobot.tsx`:

### 1. Robô — Movimento orgânico
- **Respiração**: Scale sutil no eixo Y (1.0 → 1.005 → 1.0) em 3s loop
- **Leve inclinação**: Rotação sutil (rotate -1deg → 1deg) em 6s loop — simula "olhar para os lados"
- **Composição**: Combinar flutuação existente (y) com rotação e scale simultâneos

### 2. Painéis Holográficos — Dados "ao vivo"
- **BarChart**: Barras mudam de altura continuamente (loop 3s com valores aleatórios via `keyframes`)
- **Trend line**: Redesenha em loop (pathLength 0→1 repete a cada 4s)
- **KPI**: Número oscila levemente (98.2 ↔ 98.8) em loop
- **AI Neural**: Pulsos mais rápidos e conexões com opacidade variando como "sinapses disparando"
- **Flicker sutil**: Painéis piscam opacidade (0.85→1) aleatoriamente para simular tela holográfica

### 3. Olhos — Brilho mais dinâmico
- Alternar entre verde e ciano (emerald-400 ↔ cyan-400) em loop lento para efeito "processando"
- Pupilas (círculos menores dentro) que seguem a posição do mouse

### 4. Partículas e Orbs — Mais densidade
- Aumentar de 10→16 partículas, adicionar variação de tamanho
- Orbs com trail effect (vários divs escalonados com opacidade decrescente)
- Adicionar "data streams" — linhas finas que saem do robô em direção aos painéis

### 5. Scan line aprimorada
- Duas scan lines em velocidades diferentes cruzando em sentidos opostos

## Arquivo
| Arquivo | Ação |
|---------|------|
| `src/components/home/TravelTechRobot.tsx` | Atualizar — adicionar animações contínuas em todos os elementos |

