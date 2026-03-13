

# Plano: Buscador + Borda Ondulada Premium

## 1. Buscador de Informações

**Onde ficaria melhor:** Logo abaixo do subtítulo e acima dos botões no Hero, similar ao padrão do "Descubra Mato Grosso" na imagem de referência. Fica centralizado, é o primeiro elemento interativo que o usuário vê.

**Como funcionaria:**
- Campo de busca com ícone de lupa, fundo semi-transparente (glassmorphism branco)
- Ao digitar, abre um dropdown com resultados agrupados por categoria: **Destinos**, **Eventos**, **Regiões Turísticas**, **Parceiros**
- Busca nos dados já existentes no Supabase: `tourist_attractions`, `events`, `touristRegions2025`, `institutional_partners`
- Ao clicar num resultado, navega para a página correspondente

**Arquivos:**
- Novo: `src/components/search/HeroSearchBar.tsx` — componente de busca com dropdown de resultados
- Novo: `src/services/searchService.ts` — serviço que consulta múltiplas tabelas do Supabase
- Editar: `src/components/layout/UniversalHero.tsx` — inserir o `HeroSearchBar` entre o subtítulo e os botões

## 2. Borda Ondulada Melhorada

A onda atual é um SVG de 40px com curva sutil. Na referência do Descubra Mato Grosso, a onda é muito mais pronunciada e alta (~120px), com curvas mais orgânicas e fluidas.

**Mudança:**
- Substituir o SVG atual (linhas 539-553 do `UniversalHero.tsx`) por uma onda mais alta (~100-120px) com curvas mais orgânicas, similar à referência
- Usar `viewBox` mais amplo para curvas suaves e naturais
- Manter `fill="white"` para transição limpa com a seção seguinte

**Arquivo:** `src/components/layout/UniversalHero.tsx` — substituir o bloco SVG da onda

## Resumo de Arquivos

| Arquivo | Ação |
|---------|------|
| `src/components/search/HeroSearchBar.tsx` | Criar — buscador com dropdown |
| `src/services/searchService.ts` | Criar — consulta Supabase multi-tabela |
| `src/components/layout/UniversalHero.tsx` | Editar — adicionar buscador + melhorar onda |

