## Recomendação para o carrossel

Sobre os 3 formatos de carrossel, recomendo **cards verticais 9:16 (formato stories/reels)** porque:

- Combina com a estética imersiva do Descubra MS (vídeos verticais valorizam paisagens em retrato — Pantanal, cachoeiras, etc.)
- É o formato moderno (TikTok/Reels) que o público jovem espera
- Vídeos do Guatá costumam ser curtos e verticais
- O visual da imagem 3 que você gostou usa exatamente esse formato

Vou usar cards verticais com play centralizado, mas com a paleta MS (azul/teal/verde Pantanal) ao invés do roxo da referência, mantendo coerência com o resto do site.

---

## Plano de execução

### 1. Esconder símbolo do YouTube no hero (desktop)

**Arquivo:** `src/components/layout/UniversalHero.tsx`

Hoje o overlay que cobre os controles do YouTube só existe no **mobile** (linhas 392-413). No desktop o iframe fica nu, e por isso aparecem os controles ▶ ⏸ ◀ ▶ sobrepostos ao texto.

**Correção:** mover o overlay de gradientes (top + bottom) pra fora do `if (isMobile)`, deixando ele sempre ativo. O `pointer-events-none` já está aplicado, então não atrapalha cliques nos botões do hero.

### 2. Eventos: logo grande + horário visível

**Arquivo:** `src/components/events/EventDetailModal.tsx`

a) **Logo grande antes do "Sobre o Evento":** inserir uma seção nova entre o grid de Data/Localização (linha 325) e o bloco "Sobre o Evento" (linha 327), exibindo `event.cover_image` num card centralizado, formato landscape (max-h ~280px, object-contain pra não cortar logos), com fundo sutil.

b) **Horário do evento:** o código já tenta mostrar via `timeRangeLabel`, mas só aparece se `start_time`/`end_time` estiverem preenchidos. Vou:
- Verificar no `resolveEventTimes` se `00:00` é tratado como vazio (provável causa do horário sumido) → ajustar pra mostrar mesmo assim, ou mostrar "Horário a definir" quando ausente
- Garantir que o card "Data e Horário" sempre mostre alguma indicação de horário (ou o range, ou "Horário a definir")

### 3. Substituir CATs por carrossel de vídeos do Guatá

**Banco — nova tabela** (via migração):
```
guata_videos (
  id uuid pk,
  title text not null,
  youtube_url text not null,
  display_order int default 0,
  is_active bool default true,
  created_at, updated_at
)
```
Com RLS: leitura pública (`select` para `anon`), escrita só pra admins (via `has_role(auth.uid(), 'admin')`).

**Novo componente:** `src/components/home/GuataVideosSection.tsx`
- Busca vídeos ativos ordenados por `display_order`
- Extrai videoId do YouTube e renderiza thumbnail automática (`https://img.youtube.com/vi/{id}/maxresdefault.jpg`)
- Carrossel horizontal com cards verticais 9:16, ~240px de largura
- Card: thumbnail + ícone play centralizado + título embaixo + badge MS no canto
- Click abre modal com iframe do YouTube em player (com controles, fullscreen, modestbranding)
- Paleta: `from-ms-primary-blue/5 via-white to-ms-pantanal-green/5` (igual atual)
- Título da seção: "Conheça MS com o Guatá" (editável via `platformContentService` com prefixo `ms_guata_videos_`)

**Substituição:** em `src/pages/MSIndex.tsx`, trocar `<CatsSection />` por `<GuataVideosSection />`. Manter `CatsSection.tsx` no projeto (pode ser reusado em outra rota se quiser no futuro).

**Admin:** novo manager `src/components/admin/GuataVideosManager.tsx`
- Lista todos os vídeos com preview da thumbnail
- Form simples: campo URL do YouTube + título
- Botões: ativar/desativar, reordenar (setas ↑↓), excluir
- Adicionar entrada no menu admin (provavelmente em `PlatformConfigCenter` ou similar — vou identificar o lugar certo na implementação)

### 4. Refatoração

- `GuataVideosSection.tsx` ficará sob 200 linhas (separar `GuataVideoCard` se passar disso)
- `GuataVideosManager.tsx` reaproveitar componentes shadcn (`Card`, `Input`, `Button`, `Switch`)
- Util `extractYoutubeId(url)` em `src/utils/youtube.ts` (verificar se já existe — vi regex parecida no UniversalHero, vou centralizar)

---

## Detalhes técnicos (referência)

| Item | Arquivo | Mudança |
|---|---|---|
| Overlay YouTube desktop | `UniversalHero.tsx` L391-413 | remover `{isMobile && ...}`, deixar overlay sempre |
| Logo evento | `EventDetailModal.tsx` L325-327 | inserir bloco com `<img src={event.cover_image}>` |
| Horário evento | `EventDetailModal.tsx` L309 + `resolveEventTimes` | tratar `00:00` e fallback "Horário a definir" |
| Tabela vídeos | nova migração | `guata_videos` + RLS |
| Seção home | novo `GuataVideosSection.tsx` + `MSIndex.tsx` | substitui `<CatsSection />` |
| Admin | novo `GuataVideosManager.tsx` | CRUD + reorder |

---

## Resultado esperado

- Hero do Descubra MS sem controles do YouTube visíveis em nenhum dispositivo
- Modal de evento mostra logo grande do evento, horário sempre presente (real ou "a definir")
- Home traz carrossel de vídeos verticais do Guatá no lugar dos CATs, gerenciável pelo admin com apenas link + título
