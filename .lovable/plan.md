

# Plano: Corrigir Build + Redesign Visual do Hero ViaJARTur

## Problema 1: Erros de Build

Os erros atuais sao:
- `gl-matrix/index.d.ts`: Erros em `node_modules` - resolvido adicionando `skipLibCheck: true` ao `tsconfig.app.json` (ja deve estar, mas precisa verificar)
- `vite.config.ts`: Parametros `server`, `req`, `res`, `next` sem tipo - corrigido adicionando tipos explicitos

### Correcao no `vite.config.ts`
Adicionar tipos aos parametros do middleware:

```typescript
configureServer(server: any) {
  server.middlewares.use((req: any, res: any, next: any) => {
```

## Problema 2: Nome "ViajARTur" nao muda no Admin

O Hero usa `getContent('viajar_hero_title', 'ViajARTur: Ecossistema Inteligente de Turismo')`. O campo `viajar_hero_title` existe no `SimpleTextEditor.tsx` e no `platformContentService.ts`. O problema provavel e que:
- O registro nao existe na tabela `institutional_content` do Supabase (nunca foi salvo)
- Ou o valor salvo esta vazio, e o fallback e usado

O Hero precisa usar a key `viajar_hero_title` corretamente, e o fallback deve ser apenas "ViajARTur" (conforme o design da imagem).

## Problema 3: Redesign Visual do Hero

Baseado na imagem de referencia, o Hero precisa ficar mais limpo e minimalista:

### Mudancas no `TravelTechHero.tsx`
- **Titulo**: Fallback muda de "ViajARTur: Ecossistema Inteligente de Turismo" para apenas "ViajARTur"
- **Descricao**: Fallback muda para "Transforme dados em decisoes estrategicas. Analytics avancado e IA para o setor publico e privado."
- **Apenas 1 botao CTA**: "Acessar Plataforma" (azul, com seta)
- **Sem badge, sem stats**: Remover elementos extras que poluem o layout
- **Mais espacamento**: min-height maior, mais padding vertical
- **Texto preto**: titulo e descricao em preto sobre fundo branco (ja esta assim)
- **Descricao com cor mais suave**: `text-slate-600` em vez de `text-black`

### Mudancas no `TravelTechRobot.tsx`
- Manter o robo como esta (ja ficou parecido com a referencia)
- Aumentar levemente o tamanho maximo do container

### Resultado esperado (igual a imagem):
```text
+------------------------------------------------------------------+
|                                                                    |
|                                                                    |
|  ViajARTur                        +---------------------------+   |
|  (titulo grande, bold, preto)     |                           |   |
|                                   |     [Robo com globo       |   |
|  Transforme dados em decisoes     |      e graficos no        |   |
|  estrategicas. Analytics          |      peito]               |   |
|  avancado e IA para o setor       |                           |   |
|  publico e privado.               +---------------------------+   |
|                                                                    |
|  [Acessar Plataforma ->]                                          |
|                                                                    |
+------------------------------------------------------------------+
```

## Arquivos a modificar

| # | Arquivo | Mudanca |
|---|---------|---------|
| 1 | `vite.config.ts` | Adicionar tipos `any` nos parametros do middleware |
| 2 | `src/components/home/TravelTechHero.tsx` | Simplificar layout (1 botao, sem badge/stats, fallbacks corretos) |

## O que NAO sera alterado
- `TravelTechRobot.tsx` - robo ja esta bom
- `ViaJARSaaS.tsx` - ja usa `<TravelTechHero />`
- Nenhuma funcionalidade do Descubra MS ou admin
- `SimpleTextEditor.tsx` e `platformContentService.ts` - ja estao corretos

