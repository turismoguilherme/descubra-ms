# Etapa atual: URLs sem prefixo + pacote de código do Passaporte e Parceiros

Escopo reduzido conforme pedido: (1) tirar `/viajar` e `/descubrams` dos links, (2) entregar o código isolado do Passaporte Digital e de Parceiros. A separação de bancos fica para depois.

## Parte 1 — URLs limpas por domínio

Hoje `src/App.tsx` escolhe a plataforma pelo prefixo do caminho (`/descubrams/...` para o Descubra MS, `/viajar/...` para o Guatá Labs), e `Navbar.tsx` / `authRedirect.ts` montam links com esse prefixo.

O que muda:

- Criar um resolvedor único de marca (`src/lib/brandRoutes.ts`) com a ordem: domínio → prefixo legado → padrão. Ele expõe também `withBrandPath(path)`, que devolve o caminho **sem prefixo** quando a marca já vem do domínio.
- Registrar as rotas de cada marca na raiz: `/`, `/destinos`, `/eventos`, `/parceiros`, `/passaporte`, `/guata`, `/sobre`, `/login`, `/register`, etc. para o Descubra MS; `/dashboard`, `/inventario`, `/relatorios`, `/leads`, `/precos`, ... para o Guatá Labs.
- Manter `/descubrams/*` e `/viajar/*` funcionando como redirecionamento permanente para a nova URL (links antigos, e-mails e QR codes já distribuídos não quebram).
- Trocar a montagem de links por `withBrandPath` em `Navbar`, menus, footer, `authRedirect.ts`, `passwordReset.ts` e nos redirecionamentos pós-login/OAuth — assim nenhum link novo volta a exibir o prefixo.
- No preview da Lovable (um único domínio para as duas marcas) o prefixo continua sendo o modo de alternar entre elas; nos domínios próprios ele desaparece.

Ponto que preciso confirmar: qual domínio o Guatá Labs vai usar (`viajartur.com` continua, ou já é `guatalabs.com`?). O Descubra MS assumo `descubrams.com`.

## Parte 2 — Pacote de código: Passaporte Digital + Parceiros

Entrega de um pacote de projeto novo (arquivos + SQL), pronto para virar outro app no mesmo estilo, contendo apenas:

**Passaporte Digital**
- Roteiros e checkpoints, incluindo agrupamento por dia (`day_number`/`day_title`, `total_days`) e modo sequencial ou livre (`checkpoint_order_mode`).
- Check-in validado no servidor (geofence e código), selos, pontos e níveis.
- Ranking/gamificação (geral, mensal, regional) com opção de sair do ranking.
- Administração de roteiros, checkpoints, recompensas e capa/wallpaper.

**Parceiros**
- Cadastro e onboarding com aceite de termo (assinatura + PDF).
- Aprovação e moderação no admin.
- Preços, disponibilidade e reservas.
- Stripe Connect (onboarding, checkout da reserva, cancelamento/reembolso).

**Base mínima incluída**
- Autenticação, perfis, papéis em `user_roles` com `has_role`/`is_admin_user`.
- Layout e tema neutros (tokens de cor no CSS, fáceis de re-tematizar), componentes shadcn usados pelos dois módulos.
- Buckets de imagem e políticas de storage escopadas por dono.
- Migrações completas na ordem correta (tabela → GRANT → RLS → policies), sem dados reais.
- Edge functions necessárias apenas para esses dois módulos.

Fica de fora: Guatá/IA, cartilhas, eventos, mapa turístico, regiões, módulos B2B do Guatá Labs, MCP.

Formato da entrega: uma pasta de projeto completa gerada em `/mnt/documents` (com `package.json`, `src/`, `supabase/migrations/` e um `README` de instalação), que você baixa e usa como base do próximo projeto. O projeto atual não é alterado por essa parte.

## Ordem de execução

1. Parte 1 no projeto atual (sem risco de dados, testada no preview).
2. Parte 2 como pacote separado.

## Detalhes técnicos

- Redirecionamento legado: `Navigate replace` no router + regra equivalente em `public/_redirects` e `vercel.json` para acesso direto.
- `authRedirect.ts` passa a derivar o destino do resolvedor de marca, eliminando as cadeias de `if` por hostname que hoje se repetem em três funções.
- No pacote extraído, as tabelas levadas são: `routes`, `route_checkpoints`, `passport_stamps`, `passport_rewards`, `passport_configurations`, `user_passports`, `user_levels`, `user_rewards`, `checkpoint_code_attempts`, `stamp_themes`, `institutional_partners`, `partner_pricing`, `partner_availability`, `partner_reservations`, `partner_transactions`, `partner_terms_acceptances`, `partner_notifications`, `partner_cancellation_policies`, `pending_refunds`, `user_profiles`, `user_roles`, além das funções de check-in, ranking e ownership de parceiro.
