
# Plano: Corrigir Roteamento /descubrams + Sincronização de Regiões Turísticas

## Problema 1: /descubrams não funciona no preview

**Causa raiz**: Em `App.tsx` (linha 161-165), a lógica `showMS` só é `true` para:
- `descubrams.com`
- `localhost` com path `/descubrams`

O domínio do preview (`id-preview--xxx.lovable.app`) não é nenhum desses, então `showMS = false` e as rotas do Descubra MS nunca são renderizadas. O `showViajar` também falha porque o domínio não é `viajartur.com` nem `localhost`.

**Correção**: Alterar a lógica em `App.tsx` para que, quando o path começar com `/descubrams`, **sempre** renderize as rotas MS, independente do domínio. Isso garante que funcione no preview, em staging e em qualquer ambiente.

```
// Antes:
const showMS = currentDomain === 'descubrams.com' || 
               (currentDomain === 'localhost' && location.pathname.startsWith('/descubrams'));

// Depois:
const showMS = currentDomain === 'descubrams.com' || 
               location.pathname.startsWith('/descubrams');
```

Também ajustar `showViajar` para não conflitar:
```
const showViajar = currentDomain === 'viajartur.com' || 
                   !location.pathname.startsWith('/descubrams');
```

## Problema 2: Regiões turísticas não atualizam do admin

**Causa raiz**: Dois componentes usam dados estáticos em vez do hook `useTouristRegions`:

1. **`RegioesTuristicasSection.tsx`** (linha 10): `const regioes = touristRegions2025.slice(4, 10)` — importa direto do arquivo estático
2. **`PolosTuristicosSection.tsx`** (linha 12): `const polos = touristRegions2025.slice(0, 4)` — idem

O componente **`DestaquesSection.tsx`** já usa `useTouristRegions()` corretamente e funciona.

**Correção**: Substituir a importação estática pelo hook `useTouristRegions` nos dois componentes, seguindo o mesmo padrão do `DestaquesSection`.

## Arquivos a modificar

| Arquivo | Mudança |
|---------|---------|
| `src/App.tsx` (linhas 161-165) | Lógica showMS/showViajar para aceitar qualquer domínio com path /descubrams |
| `src/components/home/RegioesTuristicasSection.tsx` | Trocar `touristRegions2025` por `useTouristRegions()` |
| `src/components/home/PolosTuristicosSection.tsx` | Trocar `touristRegions2025` por `useTouristRegions()` |

## O que NÃO muda

- `DestaquesSection.tsx` — já usa o hook corretamente
- `useTouristRegions.ts` — já tem Realtime subscription funcionando
- Nenhuma funcionalidade do admin
- Hero da ViaJARTur
