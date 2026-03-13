

# Plano: Buscador Inteligente Conectado ao Guatá

## Ideia

Excelente ideia. Em vez do buscador ter seu próprio modo IA separado, ele funciona assim:

1. **Busca rápida normal**: digitou "Bonito" → mostra destinos/eventos/parceiros (como já funciona)
2. **Detecta pergunta**: digitou "o que fazer em Corguinho?" → mostra uma opção especial **"Perguntar ao Guatá 🦦"**
3. **Ao clicar**: navega para `/descubrams/guata` passando a pergunta como parâmetro na URL
4. **Guatá recebe a mensagem**: a página do Guatá lê o parâmetro e envia automaticamente como primeira mensagem

Isso é melhor do que ter IA duplicada no buscador porque:
- Centraliza a inteligência no Guatá (um único ponto de IA)
- Leva o usuário a conhecer o Guatá naturalmente
- Evita custo duplo de chamadas ao Gemini
- O Guatá já tem contexto, memória e personalidade

## Mudanças

### 1. `src/components/search/HeroSearchBar.tsx`
- Adicionar detecção de pergunta (palavras como "o que", "onde", "como", "qual", "quando")
- Quando detectar pergunta, mostrar no dropdown um item especial: **"🦦 Perguntar ao Guatá: [pergunta]"**
- Ao clicar, navegar para `/descubrams/guata?q=o+que+fazer+em+corguinho`
- Também mostrar resultados normais do banco abaixo (se houver)

### 2. `src/pages/Guata.tsx`
- Ler `?q=` da URL ao carregar
- Se existir, enviar automaticamente como primeira mensagem do chat
- Limpar o parâmetro da URL após enviar

### 3. `src/services/searchService.ts`
- Adicionar função `isNaturalLanguageQuery(query)` para detectar perguntas

## Arquivos afetados

| Arquivo | Ação |
|---------|------|
| `src/components/search/HeroSearchBar.tsx` | Editar — adicionar detecção de pergunta + link ao Guatá |
| `src/services/searchService.ts` | Editar — adicionar `isNaturalLanguageQuery()` |
| `src/pages/Guata.tsx` | Editar — ler `?q=` e enviar como mensagem automática |

