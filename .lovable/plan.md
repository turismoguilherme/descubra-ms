

# Redesign do Robo ViaJARTur - Estilo 3D Realista com Animacoes

## Objetivo

Substituir o robo atual (feito com divs CSS basicos) por uma **imagem gerada por IA** no estilo 3D realista igual a referencia enviada - um robo amigavel com olhos ciano brilhantes e globo holografico no peito. A imagem tera **animacoes CSS** aplicadas para dar vida ao robo.

## O que sera feito

### 1. Gerar imagem do robo via IA

Usar o modelo `google/gemini-2.5-flash-image` para gerar um robo no estilo da referencia:
- Robo 3D metalizado/prateado
- Olhos ciano brilhantes e grandes
- Tela no peito com globo terrestre holografico azul
- Fundo transparente/branco limpo
- Estilo profissional e moderno

A imagem sera salva em `src/assets/travel-tech-robot.png` e importada via ES6 module.

### 2. Reescrever `TravelTechRobot.tsx`

Substituir todas as divs CSS pelo componente com a imagem real + animacoes:

- **Flutuacao suave** (`translateY` de 0 a -15px, 4s loop) - o robo "flutua"
- **Brilho pulsante nos olhos** - glow ciano pulsando via `box-shadow` overlay
- **Particulas de dados** - pequenos pontos ciano flutuando ao redor do robo
- **Orbita tech** - circulos finos girando ao redor representando dados/conexoes
- **Glow no globo** - efeito de luz azul pulsando na area do peito

### 3. Ajustar `TravelTechHero.tsx`

- Fundo: manter branco limpo com grid de pontos sutil (ja esta assim)
- Aumentar o container do robo para `max-w-2xl` para maior destaque
- Garantir responsividade (robo menor em mobile)

## Arquivos modificados

| Arquivo | Acao |
|---------|------|
| `src/assets/travel-tech-robot.png` | CRIAR - Imagem gerada por IA |
| `src/components/home/TravelTechRobot.tsx` | REESCREVER - Usar imagem + animacoes CSS |
| `src/components/home/TravelTechHero.tsx` | AJUSTAR - Container do robo maior |

## O que NAO muda

- Navbar, Footer, demais secoes da pagina
- Textos e CTA do hero (continuam editaveis via admin)
- Nenhuma funcionalidade do Descubra MS
- Cores da marca (ciano, slate, azul)

## Animacoes planejadas

```text
Robo:
  - float: sobe/desce 15px a cada 4s (ease-in-out)
  
Elementos ao redor:
  - 6 particulas ciano pequenas flutuando em orbitas diferentes
  - 2 circulos finos semi-transparentes girando (orbita tech)
  - Glow pulsante azul atras do robo (shadow)
```

## Detalhes tecnicos

- Imagem importada como ES6 module (`import robotImg from '@/assets/travel-tech-robot.png'`)
- Animacoes 100% CSS (`@keyframes`) sem dependencias extras
- `prefers-reduced-motion` respeitado para acessibilidade
- Responsivo: imagem escala de `w-64` (mobile) a `w-96` (desktop)

