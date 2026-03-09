
## Estado Real do Código

Após inspeção completa, **NENHUMA** das mudanças visuais dos planos anteriores foi aplicada. Os arquivos ainda estão nas versões originais:

- `TravelTechHero.tsx`: fundo branco, hero simples, 1 botão só
- `TravelTechRobot.tsx`: imagem PNG estática, w-64~96, 6 partículas fracas
- `ViaJARNavbar.tsx`: bg-white/95, links muted-foreground, sem dark mode
- `Solucoes.tsx`, `Precos.tsx`, `Sobre.tsx`, `Contato.tsx`: hero `from-viajar-slate to-slate-800` genérico
- `TechBackground.tsx` e `GlowCard.tsx`: **não existem**

## O que será implementado agora (de fato)

### 1. Robô interativo e impactante — `TravelTechRobot.tsx`
O robô terá movimentos que reagem ao mouse (parallax). Ao mover o cursor na tela, o robô inclina levemente na direção, criando sensação de vida. Além disso:
- Tamanho muito maior: `w-72 sm:w-96 md:w-[28rem] lg:w-[34rem]`
- Halo de luz ciano intenso atrás (`blur-3xl`, `bg-cyan-500/30`)
- **Rastreamento do mouse via `onMouseMove`** — robô inclina leve (max ±8°) seguindo o cursor
- Scan lines holográficas animadas sobre a imagem
- 12+ partículas de dados espalhadas
- Badges tech flutuando ao redor: `IA`, `Big Data`, `ML`, `Analytics`, `24/7`
- 2 órbitas rotacionando em direções opostas

### 2. Hero completo dark tech — `TravelTechHero.tsx`
- Fundo `bg-slate-950` com grid neural (linhas finas ciano)
- Gradient orbs pulsantes (cyan blur-3xl)
- Título: gradiente `from-white via-cyan-100 to-cyan-400` + `bg-clip-text text-transparent`
- Badge animado: "🤖 Travel Tech | IA + Turismo"
- 2 CTAs: "Acessar Plataforma" (cyan neon glow) + "Agendar Demo" (outline branco)
- Mini-stats embaixo: "+100K Usuários | 98% Satisfação | IA 24/7"
- Preserva `platformContentService`

### 3. Navbar dark glassmorphism — `ViaJARNavbar.tsx`
- Antes de scroll: `bg-transparent`
- Após scroll: `bg-slate-950/90 backdrop-blur-xl border-b border-cyan-500/10`
- Links: `text-white/70 hover:text-cyan-400`
- Dropdown: `bg-slate-900/95 border border-white/10 backdrop-blur-xl`
- "Entrar": `text-white/80 hover:text-white`
- "Começar Agora": gradiente cyan com shimmer + sombra neon

### 4. Páginas internas — hero dark tech unificado

**Padrão para todas:** substituir o hero `from-viajar-slate to-slate-800` por fundo `bg-slate-950` com grid neural ciano, gradient orbs, título com gradient text, badge tech animado.

- `Solucoes.tsx`: hero dark tech + cards com `bg-slate-900 border-white/10 hover:border-cyan-400/40`
- `Precos.tsx`: hero dark tech + cards glassmorphism escuro  
- `Sobre.tsx`: hero dark tech + seção narrativa em `bg-slate-900`
- `Contato.tsx`: hero dark tech + formulário `bg-white/5 backdrop-blur-xl`

### 5. Footer tech — `ViaJARFooter.tsx`
- Fundo: `bg-slate-950` com grid de circuito sutil
- Logo "Viaj**AR**Tur" com AR em ciano brilhante com `text-shadow glow`
- Borda superior: `border-cyan-500/20`
- Links hover: `hover:text-cyan-400`

## Componentes base a criar

- **`TechBackground.tsx`**: componente reutilizável com grid neural (`60px 60px`, linhas ciano/5), orbs pulsantes, partículas
- **`GlowCard.tsx`**: card glassmorphism `bg-white/5 border-white/10` com hover neon `border-cyan-400/40 shadow-[0_0_30px_-5px_rgba(20,184,166,0.3)]`

## Detalhe técnico do robô interativo (parallax)

```text
src/components/home/TravelTechRobot.tsx

- useState: { rotateX, rotateY } (inicialmente 0, 0)
- onMouseMove no container pai (TravelTechHero):
    deltaX = (mouseX - centerX) / centerX  // -1 a 1
    deltaY = (mouseY - centerY) / centerY  // -1 a 1
    rotateY = deltaX * 8   // max 8 graus horizontal
    rotateX = -deltaY * 5  // max 5 graus vertical
- style={{ transform: `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)` }}
- onMouseLeave: smooth reset para 0,0 com transition: 'transform 0.5s ease'
- A flutuação vertical (ttFloat) continua junto
```

## Arquivos modificados

1. `src/components/home/TechBackground.tsx` — CRIAR
2. `src/components/home/GlowCard.tsx` — CRIAR  
3. `src/components/home/TravelTechRobot.tsx` — REESCREVER
4. `src/components/home/TravelTechHero.tsx` — REESCREVER
5. `src/components/layout/ViaJARNavbar.tsx` — REFATORAR
6. `src/pages/Solucoes.tsx` — REFATORAR hero + cards
7. `src/pages/Precos.tsx` — REFATORAR hero + cards
8. `src/pages/Sobre.tsx` — REFATORAR hero + seções
9. `src/pages/Contato.tsx` — REFATORAR hero + formulário
10. `src/components/layout/ViaJARFooter.tsx` — REFATORAR
