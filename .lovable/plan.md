

# Redesign Visual — ViajARTur (Travel Tech Identity)

## Diagnóstico do Estado Atual

O site da ViajARTur hoje tem um visual genérico de SaaS corporativo — fundos slate escuros, dot patterns, cards simples. Não comunica visualmente que é uma **empresa de tecnologia** especializada em IA, dados e turismo inteligente. O robô mascote (TravelTechRobot.tsx) existe mas é pequeno e discreto, usando apenas uma imagem estática com animações CSS básicas.

---

## Escopo da Mudança

**O que muda:** Visual das páginas públicas/marketing (Home, Soluções, Cases, Preços, Sobre, Contato, Navbar, Footer)
**O que NÃO muda:** Dashboards internos, lógica de negócio, autenticação, rotas, banco de dados

---

## Conceito Visual: "Neural Network / AI-First Travel Tech"

Direção: Dark mode tech com acentos de ciano/azul neon, elementos de grid/circuitos, partículas, gradientes vibrantes. Inspiração: sites de empresas de IA como Vercel, Linear, OpenAI.

Paleta mantida: Ciano (#14b8a6 / viajar-cyan), Slate escuro (viajar-slate), com adição de efeitos de glow e gradientes mais ousados.

---

## Componentes a Criar/Refatorar

### 1. Navbar (ViaJARNavbar.tsx) — Refatorar
- Glassmorphism mais forte com blur e borda sutil brilhante
- Logo com efeito glow sutil no ícone
- Botão "Começar Agora" com gradiente ciano animado (shimmer)
- Menu mobile com backdrop blur escuro

### 2. Hero da Home (TravelTechHero.tsx) — Redesign completo
- Fundo escuro (slate-950) com grid animado estilo "neural network"
- Texto principal com gradiente text (branco → ciano)
- Subtítulo enfatizando IA, dados, tecnologia
- Robô MAIOR e mais impactante — ocupando ~50% da viewport no desktop
- Partículas de dados mais densas e visíveis
- Badges animados flutuando ("IA", "Big Data", "Analytics", "Machine Learning")
- CTA com efeito glow pulsante

### 3. TravelTechRobot.tsx — Upgrade visual
- Imagem maior (de w-64/96 para tamanho hero completo)
- Halo de luz ciano mais intenso por trás
- Partículas de código/dados (0s e 1s, ícones de gráfico) orbitando
- Efeito de "hologram scan lines" sutil
- Animação de flutuação mais pronunciada

### 4. WhatViajARTurDoesSection.tsx — Refatorar
- Fundo escuro com grid sutil
- Cards com borda de glow no hover (efeito "neon border")
- Ícones com efeito de pulse/glow
- Título com gradiente text

### 5. SuccessCasesSection.tsx — Refatorar
- Cards com overlay mais tech (scan lines, grid overlay)
- Métricas com efeito de "contador digital" visual
- Bordas com glow sutil

### 6. Soluções (Solucoes.tsx) — Refatorar hero + cards
- Hero com fundo dark tech (grid neural) em vez do slate genérico
- Cards de soluções com efeito glassmorphism escuro
- Ícones com glow colorido

### 7. Cases (CasosSucesso.tsx) — Refatorar hero
- Hero dark tech consistente
- Cards mantidos mas com overlay tech

### 8. Preços (Precos.tsx) — Refatorar hero + cards
- Hero dark tech consistente
- Cards com borda glow no highlighted
- Efeito "spotlight" no plano destacado

### 9. Sobre (Sobre.tsx) — Refatorar hero
- Hero dark tech consistente
- Seção narrativa com fundo escuro e tipografia maior

### 10. Contato (Contato.tsx) — Refatorar hero
- Hero dark tech consistente
- Formulário com glassmorphism escuro

### 11. Footer (ViaJARFooter.tsx) — Upgrade
- Grid de circuito sutil no fundo
- Logo com glow
- Links com hover ciano mais vibrante

### 12. Novo componente: TechBackground.tsx (reutilizável)
- Componente compartilhado de fundo tech (grid neural, partículas, orbs)
- Usado em todas as páginas para consistência

### 13. Novo componente: GlowCard.tsx (reutilizável)
- Card com efeito de borda glow no hover
- Substitui os cards simples atuais

---

## Detalhes Técnicos

- **0 alterações no banco de dados** — apenas visual
- **0 alterações nas rotas** — mesmas URLs
- **CSS animations** via `<style>` inline ou classes Tailwind + keyframes no index.css
- **Framer Motion** já instalado — usar para animações de entrada (fade-in, slide-up)
- **Preservação total do CMS** — todos os `getContent()` e `platformContentService` mantidos
- **Preservação da marca** — Ciano, logo, "ViajARTur" mantidos. Apenas modernização do layout.

## Ordem de Implementação

1. `TechBackground.tsx` + `GlowCard.tsx` (componentes base reutilizáveis)
2. `TravelTechHero.tsx` + `TravelTechRobot.tsx` (hero impactante)
3. `ViaJARNavbar.tsx` (glassmorphism tech)
4. `WhatViajARTurDoesSection.tsx` + `SuccessCasesSection.tsx` (seções da home)
5. `ViaJARSaaS.tsx` (composição da home com fundo dark)
6. `Solucoes.tsx`, `CasosSucesso.tsx`, `Precos.tsx`, `Sobre.tsx`, `Contato.tsx` (páginas internas)
7. `ViaJARFooter.tsx` (footer tech)

**Estimativa: ~13 arquivos modificados/criados, 0 migrações SQL.**

