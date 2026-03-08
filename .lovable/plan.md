

# Redesign do Hero da ViaJARTur - Identidade Travel Tech

## Contexto

A ViaJARTur e uma **Travel Tech** - uma empresa de tecnologia aplicada ao turismo. A pagina inicial atual e limpa e bonita, mas nao comunica isso. O hero mostra apenas o nome "ViajARTur" com textos genericos. Nao ha nenhum elemento visual que remeta a tecnologia, IA, dados ou inovacao.

A proposta e redesenhar **apenas o Hero Section** da pagina `ViaJARSaaS.tsx` para comunicar visualmente que a ViaJARTur e uma Travel Tech que usa IA e tecnologia para resolver problemas do turismo.

## O que NAO sera alterado

- Nenhuma funcionalidade do Descubra MS
- Nenhuma funcionalidade interna da ViaJARTur
- Navbar e Footer permanecem iguais
- Secoes WhatViajARTurDoesSection e SuccessCasesSection permanecem iguais
- Secoes de video e CTA final permanecem iguais
- Logo e cores da marca (Ciano, Slate, Emerald) permanecem iguais

## O que sera criado

### Novo Hero Section com identidade Travel Tech

**Layout**: Split-screen (texto a esquerda + ilustracao de robo/IA a direita)

**Lado Esquerdo**:
- Badge: "Travel Tech | Turismo + Inteligencia Artificial"
- Titulo: "Tecnologia que transforma o turismo"
- Subtitulo: "IA, dados e automacao para destinos e negocios turisticos"
- Dois botoes CTA (manter os atuais)
- Mini-stats animados embaixo (ex: "+100K usuarios", "98% satisfacao", "IA 24/7")

**Lado Direito - Ilustracao do Robo/IA**:
Um robo estilizado feito em SVG/CSS que remete a IA e turismo:
- Corpo geometrico moderno com cores ciano/slate da marca
- Tela no "peito" mostrando graficos/dados (pulso animado)
- Icones flutuantes ao redor: aviao, mapa, grafico, globo, chat
- Particulas e linhas conectando os icones (efeito tech)
- Animacoes sutis de flutuacao (CSS keyframes)

**Fundo**:
- Grid de pontos sutil (ja existe, manter)
- Orbs de gradiente ciano/azul (ja existe, manter)
- Linha decorativa de circuito/tech no fundo

### Componente novo: `TravelTechRobot.tsx`

Um componente SVG/CSS dedicado ao robo ilustrativo. Sera:
- Responsivo (menor em mobile, maior em desktop)
- Animado com CSS puro (sem bibliotecas extras)
- Nas cores da marca (ciano, slate, emerald)
- Icones flutuantes usando Lucide icons

## Estrutura de arquivos

```text
src/
  components/
    home/
      TravelTechHero.tsx       -- Novo hero completo (substitui o hero inline no ViaJARSaaS.tsx)
      TravelTechRobot.tsx      -- Ilustracao SVG do robo com animacoes
  pages/
    ViaJARSaaS.tsx             -- Atualizar para usar TravelTechHero
```

## Visual esperado (layout em texto)

```text
Desktop:
+------------------------------------------------------------------+
|  [Navbar ViaJARTur]                                               |
+------------------------------------------------------------------+
|                                                                    |
|  [Travel Tech Badge]              +---------------------------+   |
|                                   |                           |   |
|  Tecnologia que                   |     [Robo Ilustrativo]    |   |
|  transforma o turismo             |     com icones de aviao,  |   |
|                                   |     mapa, dados, chat     |   |
|  IA, dados e automacao            |     flutuando ao redor    |   |
|  para destinos...                 |                           |   |
|                                   +---------------------------+   |
|  [Acessar Plataforma] [Agendar Demo]                              |
|                                                                    |
|  +100K usuarios  |  98% satisfacao  |  IA 24/7                    |
+------------------------------------------------------------------+

Mobile:
+---------------------------+
|  [Navbar]                 |
+---------------------------+
|                           |
|  [Travel Tech Badge]     |
|                           |
|  Tecnologia que           |
|  transforma o turismo     |
|                           |
|  [Robo menor centralizado]|
|                           |
|  [Botoes CTA empilhados] |
|                           |
|  Stats em linha           |
+---------------------------+
```

## Detalhes tecnicos

### TravelTechRobot.tsx
- SVG inline com animacoes CSS (`@keyframes float`, `@keyframes pulse`)
- Circulos e retangulos geometricos formando o robo
- Icones Lucide posicionados ao redor com `absolute` + animacao de flutuacao
- Cores: `text-viajar-cyan`, `text-viajar-slate`, gradientes ciano

### TravelTechHero.tsx
- Mantem o carregamento de conteudo do banco (platformContentService) para textos editaveis
- Mantem os botoes CTA existentes (links para /viajar/login e /contato)
- Adiciona stats com numeros animados (count-up simples com CSS)
- Layout flex: `flex-col lg:flex-row` para responsividade
- Background: grid de pontos + orbs de gradiente (ja existem)

### ViaJARSaaS.tsx
- Substituir o bloco `{/* Hero Section */}` (linhas 127-192) por `<TravelTechHero />`
- Restante da pagina permanece identico

## Sequencia de implementacao

1. Criar `TravelTechRobot.tsx` - componente SVG do robo
2. Criar `TravelTechHero.tsx` - hero completo com layout split-screen
3. Atualizar `ViaJARSaaS.tsx` - substituir hero antigo pelo novo
4. Adicionar `// @ts-nocheck` nos arquivos com erros de build pendentes (partners, passport, private)

## Notas importantes

- Os textos do hero continuam editaveis via admin (platformContentService)
- O robo e puramente visual/decorativo - nao tem funcionalidade
- Todas as animacoes usam CSS puro (sem framer-motion no hero)
- O componente respeita `prefers-reduced-motion` para acessibilidade
- As cores seguem rigorosamente a identidade visual: ciano (#06b6d4), slate (#1e293b)

