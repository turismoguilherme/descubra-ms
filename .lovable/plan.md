

# Redesign Visual Completo — ViajARTur (Travel Tech Identity)

## Estado Atual

O site marketing da ViajARTur usa um visual genérico: Hero com fundo branco, robô pequeno (max-w-md, w-64~96), páginas internas com hero `from-viajar-slate to-slate-800` repetitivo, cards simples sem efeitos tech, navbar branca básica. Não comunica que é uma empresa de **tecnologia e IA**.

## Escopo

**Modifica:** 13 arquivos (páginas públicas/marketing + navbar + footer + 2 componentes novos)
**NÃO modifica:** Dashboards, autenticação, banco de dados, rotas

---

## Arquivos e Mudanças

### Fase 1 — Componentes Base Reutilizáveis

**1. `src/components/home/TechBackground.tsx`** (NOVO)
- Fundo `bg-slate-950` com grid neural animado (linhas finas cyan)
- Gradient orbs pulsantes (cyan + blue blur-3xl)
- Partículas flutuantes (pontos luminosos animados)
- Props: `variant?: 'hero' | 'section'` para intensidade
- Respeita `prefers-reduced-motion`

**2. `src/components/home/GlowCard.tsx`** (NOVO)
- Card glassmorphism: `bg-white/5 backdrop-blur-xl border border-white/10`
- Hover: `border-cyan-400/40 shadow-[0_0_30px_-5px_rgba(20,184,166,0.3)]`
- Props: `children`, `className`, `glowColor?`

### Fase 2 — Hero + Robô Impactante

**3. `src/components/home/TravelTechRobot.tsx`** (REESCREVER)
- Robô **muito maior**: `w-80 sm:w-96 md:w-[28rem] lg:w-[32rem]`
- Halo de luz cyan intenso: `w-96 h-96 bg-cyan-500/20 blur-3xl`
- Scan lines holográficas (linhas horizontais semi-transparentes animadas)
- Badges tech flutuantes orbitando: "IA", "Big Data", "ML", "Analytics" (com Lucide icons)
- Partículas de dados mais densas (12+ em vez de 6)
- Flutuação mais pronunciada (-20px)

**4. `src/components/home/TravelTechHero.tsx`** (REESCREVER)
- Fundo: `TechBackground variant="hero"` (dark, slate-950)
- Título com gradient text: `bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent`
- Badge: "Travel Tech | IA + Turismo"
- Dois CTAs com glow: primário (cyan com shadow neon), secundário (outline branco)
- Layout split-screen mantido, robô ocupa ~50% viewport
- Preserva `platformContentService` e `getContent()`

### Fase 3 — Navbar Tech

**5. `src/components/layout/ViaJARNavbar.tsx`** (REFATORAR)
- Quando scrolled: `bg-slate-950/90 backdrop-blur-xl border-b border-cyan-500/10`
- Quando não scrolled: `bg-transparent`
- Links: `text-white/70 hover:text-cyan-400`
- Dropdown Soluções: `bg-slate-900/95 border border-white/10 backdrop-blur-xl`
- Botão "Começar Agora": gradiente cyan com shimmer animation
- Botão "Entrar": `text-white/80 hover:text-white`
- Mobile menu: `bg-slate-950/95 backdrop-blur-xl`

### Fase 4 — Seções da Home

**6. `src/components/home/WhatViajARTurDoesSection.tsx`** (REFATORAR visual)
- Fundo: `bg-slate-950` com grid neural sutil
- Título com gradient text
- Cards de produtos usando `GlowCard` em vez de cards simples
- Preserva toda a lógica de carregamento do Supabase

**7. `src/components/home/SuccessCasesSection.tsx`** (REFATORAR visual)
- Fundo: `bg-slate-900`
- Métricas com visual "digital counter" (font mono, glow)
- Cards com overlay de scan lines sutil
- Preserva toda a lógica CMS

**8. `src/pages/ViaJARSaaS.tsx`** (AJUSTAR)
- Container principal: `bg-slate-950` em vez de `bg-background`
- Video section e CTA section: adaptar para dark theme
- CTA section: manter `bg-viajar-slate` mas com glow nos botões

### Fase 5 — Páginas Internas

**9-12. `Solucoes.tsx`, `CasosSucesso.tsx`, `Precos.tsx`, `Sobre.tsx`, `Contato.tsx`**
- Hero sections: substituir `bg-gradient-to-b from-viajar-slate to-slate-800` por `TechBackground`
- Badges e títulos com gradient text cyan
- Cards/forms: glassmorphism dark (`bg-white/5 border border-white/10`)
- Fundo geral: `bg-slate-950` em vez de `bg-background`
- Seções alternadas: `bg-slate-900` e `bg-slate-950`
- Preservar 100% da lógica CMS e formulários

### Fase 6 — Footer

**13. `src/components/layout/ViaJARFooter.tsx`** (REFATORAR)
- Fundo: `bg-slate-950` com grid de circuito sutil no background
- Logo "ViajARTur" com glow no "AR"
- Links hover: `hover:text-cyan-400` com transição suave
- Borda superior: `border-cyan-500/20`

---

## Detalhes Técnicos

- **CSS puro** para animações (keyframes inline via `<style>`)
- **Framer Motion** para fade-in/slide-up nas entradas de seção
- **0 mudanças no banco de dados ou rotas**
- **Paleta**: Ciano (#14b8a6), Slate-950 (#020617), White/opacity
- Todos os `getContent()` e `platformContentService` preservados integralmente
- `prefers-reduced-motion` respeitado em todas as animações

