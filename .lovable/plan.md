## Rebrand: ViaJARTur → Guatá Labs

Aplicado **somente na landing pública ViaJAR** (`/viajar` e páginas do mesmo grupo: ViaJARSaaS, navbar, footer, termos, privacidade, cookies). Dashboards internos, Descubra MS e admin permanecem como estão.

---

### 1. Nova identidade visual

**Paleta (da logo Guatá Labs):**
- Verde floresta `#1F4D2C` → `--guata-forest`
- Verde profundo `#143820` → `--guata-deep`
- Dourado `#C9A24C` → `--guata-gold`
- Bege papel `#F2EBDD` → `--guata-paper`
- Off-white textura `#FAF6EC` → `--guata-cream`

**Tipografia:** manter sans-serif atual; títulos em peso black/extrabold (referência da logo arredondada e robusta). Considerar Fraunces ou Outfit para headings.

**Tokens:** adicionar em `src/index.css` e `tailwind.config.ts` namespace `guata-*` (sem remover `viajar-*` legados imediatamente — manter alias para evitar quebras durante migração).

**Substituições nos componentes da landing:**
- `ViaJARNavbar`, `ViaJARFooter`: logo Guatá Labs (anexada), trocar nome "ViaJARTur" por "Guatá Labs"
- `TravelTechHero`, `BenefitsSection`, `WhatViajARTurDoesSection`, `SuccessCasesSection`, `PlatformInActionSection`, `KodaMarketingSection`, `HowItWorksSection`: reskin com paleta verde/dourado/bege, fundos bege papel ao invés de slate-950
- `ViaJARSaaS.tsx`: substituir referências `bg-viajar-slate`, `viajar-cyan` etc. por novos tokens
- Páginas `viajar/TermosUso`, `Privacidade`, `Cookies`: mesmo reskin

**Logo:** copiar `user-uploads://image-27.png` para `src/assets/guata-labs-logo.png`.

---

### 2. Mascote Capivara (Guatá) — papel completo

O personagem (estilo 3D Pixar das imagens 28-30) aparecerá em 3 camadas:

**A. Decorativo no Hero**
- Imagem grande do Guatá (selfie/safari/pôr do sol) como elemento principal do hero, ao lado do título
- Variação aleatória ou por horário (manhã/tarde/noite)

**B. Tooltips/balões em seções estratégicas**
- Pequeno avatar circular do Guatá com balão de fala curto em: "O que fazemos", "Casos de sucesso", "Como funciona", final de página antes do CTA
- Texto editável via admin (ex.: `guata_tip_hero`, `guata_tip_benefits`...)

**C. Mascote flutuante persistente**
- Componente `<GuataFloatingMascot />` renderizado em todas as páginas da landing
- Botão fixo bottom-right com avatar do Guatá
- Ao clicar, abre balão com mensagem contextual (varia por rota: home, casos, contato)
- Animação sutil de "respirar" / piscar
- Pode ser fechado/minimizado (sessionStorage)
- **Sem chat real** — apenas mensagens curtas pré-configuradas + CTA "Solicitar demonstração"

---

### 3. Admin — gestão de imagens e mensagens do mascote

Reusar **`src/pages/admin/ViaJARAdminPanel.tsx`** (mesmo lugar que já edita conteúdos da ViaJARTur). Adicionar nova aba **"Mascote Guatá"** com:

**Uploads de imagem (Supabase Storage bucket existente):**
- `guata_mascot_hero` — imagem principal do hero
- `guata_mascot_floating` — avatar do botão flutuante
- `guata_mascot_about` — seção sobre/benefícios
- `guata_mascot_404` — página de erro
- `guata_mascot_cta` — antes do CTA final

**Textos editáveis (mensagens do mascote):**
- `guata_msg_floating_home` / `guata_msg_floating_casos` / `guata_msg_floating_contato`
- `guata_tip_benefits` / `guata_tip_how_it_works` / `guata_tip_success`
- `guata_brand_name` (default: "Guatá Labs")
- `guata_brand_tagline`

Tudo persistido via `platformContentService` (CMS unificado já existente — padrão `usePlatformContent`).

**Seed inicial:** migration insere as 4 imagens anexadas (image-27 a image-30) em Storage e popula as chaves com URLs públicas + mensagens default em PT-BR.

---

### 4. Detalhes técnicos

- **Componentes novos:**
  - `src/components/guata-labs/GuataFloatingMascot.tsx`
  - `src/components/guata-labs/GuataTooltipBubble.tsx`
  - `src/components/guata-labs/GuataHeroMascot.tsx`
  - `src/components/admin/viajar/MascotManagerTab.tsx`
- **Hook:** `src/hooks/useGuataLabsContent.ts` — busca chaves `guata_*` do `platformContentService`, com cache e fallback para assets locais (image-27..30)
- **Rotas afetadas:** `/viajar`, `/viajar/termos`, `/viajar/privacidade`, `/viajar/cookies` e qualquer rota que use `ViaJARNavbar`/`ViaJARFooter`
- **Migração de tokens:** adicionar tokens novos sem remover os antigos; alias `viajar-cyan` → `guata-gold` etc. para componentes não migrados
- **Memória do projeto:** atualizar `mem://design/viajar-premium-identity` e `mem://brand/viajar-b2b-positioning` com a nova marca, ou criar `mem://brand/guata-labs-identity`

---

### 5. Fora do escopo (confirmado)

- Descubra MS permanece com identidade própria
- Dashboards internos de parceiros, admin master, financeiro: sem mudança visual
- Emails transacionais: sem mudança nesta fase
- Sem chat real do mascote (Guatá AI continua restrito a `/ms/guata`)

---

### Próximas perguntas antes de implementar (rápidas, no chat)

1. Confirmar copiar as 4 imagens anexadas como defaults iniciais do mascote? ✅/✏️
2. O mascote flutuante deve ter som/animação ao aparecer ou totalmente silencioso?
3. Manter "ViaJARTur" no domínio/URLs (`/viajar`) ou também renomear futuramente para `/guata-labs`?

Após sua aprovação deste plano, eu confirmo essas 3 e parto para implementação.
