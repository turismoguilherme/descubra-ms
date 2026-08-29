# Separação dos projetos, domínios próprios e extração do Passaporte + Parceiros

## Situação atual (verificada)

- Um único código e um único banco Supabase (`hvtrpkbjgbuypkskqcqm`) atendem as duas marcas.
- `src/App.tsx` decide qual plataforma mostrar por prefixo de caminho: `/descubrams/...` para o Descubra MS e `/viajar/...` para o Guatá Labs (ex.: linhas 170-174, 191-362).
- As integrações de agente (MCP) já estão no projeto: `src/lib/mcp/index.ts` com 5 ferramentas (eventos, parceiros, roteiros, progresso, reservas) e o manifesto em `.lovable/mcp/manifest.json`. Nada novo a criar ali.

## Respostas diretas

1. **Separar os dois projetos com bancos próprios: sim, é possível** — mas não é um botão. Significa criar um segundo projeto Lovable/Supabase e migrar o que pertence a cada marca. Depois disso, atualizar um não afeta o outro.
2. **Remover `/viajartur` e `/descubrams` das URLs: sim** — passa a ser resolvido por domínio (`descubrams.com` → raiz do MS; `guatalabs.com` → raiz do Guatá Labs), mantendo redirecionamentos dos caminhos antigos para não quebrar links.
3. **Ter só o código do Passaporte Digital + Parceiros: sim** — como um projeto novo, enxuto, com esses dois módulos e o mínimo de infraestrutura (auth, layout, tema).

## Fase 1 — Domínios em vez de prefixos (neste projeto)

- Introduzir uma resolução única de marca: domínio primeiro, prefixo apenas como retrocompatibilidade.
- Registrar as rotas de cada marca também na raiz (`/`, `/eventos`, `/passaporte`, `/parceiros`, ...), mantendo as versões `/descubrams/*` e `/viajar/*` como `Navigate` permanente para a nova URL.
- Ajustar links internos e `sitemap`/metadados para a URL canônica de cada domínio.
- Resultado: mesma base de código, URLs limpas, nada quebrado. É a etapa de menor risco e pré-requisito natural da separação.

## Fase 2 — Projeto separado do Guatá Labs (banco próprio)

- Criar um projeto novo (código + Supabase próprio) contendo apenas o SaaS/B2B: dashboards ViaJAR, inventário, relatórios, leads, setor público, CAT, onboarding, cobrança.
- Migrar as tabelas de domínio Guatá Labs (`viajar_*`, `master_*`, `commercial_*`, `leads*`, `plano_diretor_*`, inventário) com dados; as tabelas do MS ficam onde estão.
- Neste projeto, remover as rotas e o código do Guatá Labs após a migração validada.
- Contas de usuário e Stripe são o ponto delicado: cada projeto passa a ter seu próprio `auth.users` e sua própria configuração Stripe. Isso exige convite/redefinição de senha para os usuários B2B e reconexão do Stripe Connect dos parceiros comerciais — precisa ser combinado antes de executar.

## Fase 3 — Projeto-modelo "Passaporte + Parceiros"

Novo projeto reutilizável contendo apenas:

- **Passaporte Digital**: roteiros, checkpoints (incluindo agrupamento por dia e modo sequencial/livre), check-in com geofence/código, selos, pontos, ranking/gamificação, administração dos roteiros.
- **Parceiros**: cadastro/onboarding com termo, aprovação no admin, preços e disponibilidade, reservas, Stripe Connect.
- Base mínima: autenticação, perfis, papéis (`user_roles`), layout e tema neutros (fáceis de re-tematizar), storage de imagens.
- Sem: Guatá/IA, cartilhas, eventos, mapas turísticos, módulos B2B.
- Entregue com migrações limpas (schema + dados de exemplo, sem dados reais) para servir de ponto de partida de outros projetos no mesmo estilo.

## Ordem recomendada

1. Fase 1 (URLs por domínio) — rápida, sem risco de dados.
2. Fase 3 (projeto-modelo Passaporte + Parceiros) — não mexe no que está em produção.
3. Fase 2 (separação Guatá Labs com banco próprio) — maior impacto, exige janela de migração e decisão sobre contas/Stripe.

## Detalhes técnicos

- Resolução de marca: um único módulo (`brandFromLocation`) usado por `App.tsx`, `BrandContext` e `DynamicBranding`, com ordem domínio → prefixo legado → padrão.
- Redirecionamentos: `Navigate replace` no router para as rotas legadas e regras equivalentes em `public/_redirects` / `vercel.json`.
- Migração de dados entre projetos: `pg_dump` seletivo por tabela + reaplicação de RLS/GRANTs no destino; edge functions e secrets recriados no projeto novo.
- Cada projeto passa a ter seu próprio MCP (`src/lib/mcp`) com apenas as ferramentas do seu domínio.

## Decisões que preciso de você

- Confirmar os domínios finais de cada marca.
- Confirmar se a Fase 2 pode exigir que usuários B2B redefinam senha e que parceiros comerciais reconectem o Stripe.
- Confirmar se começamos pela Fase 1 agora.
