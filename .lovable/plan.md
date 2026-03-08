
# Continuação do Redesign Visual (Travel Tech Identity)

Parece que houve uma interrupção antes de iniciarmos a escrita do código. Como o plano geral foi aprovado, vamos iniciar a implementação prática, começando pelas fundações visuais e a página inicial.

## Fases de Implementação Imediata

### Fase 1: Componentes Base (Tech & IA)
- **`TechBackground.tsx`**: Componente de fundo escuro com grid "neural", orbs em gradiente e partículas, usado em todas as páginas para consistência.
- **`GlowCard.tsx`**: Card com efeito glassmorphism escuro (`slate-900/50`) e bordas que brilham em neon cyan ao passar o mouse.

### Fase 2: O Novo Hero Impactante
- **`TravelTechRobot.tsx`**: Aumentaremos significativamente o tamanho do robô. Adicionaremos órbitas, linhas de escaneamento holográfico, partículas de dados e "badges" flutuantes com termos tech (`<AI_Core />`, `Machine Learning`).
- **`TravelTechHero.tsx`**: Tipografia repaginada com gradientes vibrantes (ciano para azul), botões com efeitos brilhantes e integração do `TechBackground`.

### Fase 3: Navegação e Layout Principal
- **`ViaJARNavbar.tsx`**: Adaptação para o estilo dark/glassmorphism, botões CTA com sombras neon.
- **Seções da Home (`WhatViajARTurDoesSection`, `SuccessCasesSection`)**: Transição para fundos escuros (slate-950) e substituição dos cards atuais pelo novo `GlowCard`.

### Fase 4: Páginas Internas e Footer
- **Páginas**: `ViaJARSaaS.tsx`, `Solucoes.tsx`, `CasosSucesso.tsx`, `Precos.tsx`, `Sobre.tsx` e `Contato.tsx` terão seus Heros e fundos atualizados para refletir o mesmo `TechBackground` escuro.
- **`ViaJARFooter.tsx`**: Temática alinhada, com cores contrastantes e logos brilhantes.

## Detalhes Técnicos de Execução
- **Arquivos a criar**: `src/components/home/TechBackground.tsx` e `src/components/home/GlowCard.tsx`.
- **Estilização**: Uso extensivo de Tailwind CSS com suporte de animações customizadas via tag `<style>` e efeitos de `backdrop-blur`.
- Nenhuma alteração no CMS (Supabase) ou no roteamento. Todo o conteúdo dinâmico será perfeitamente preservado.

Por favor, aprove este plano para que eu possa escrever os códigos imediatamente.
