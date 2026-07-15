# Deploy por domínio: Descubra MS e Guatá Labs

O mesmo repositório gera dois sites com identidades SEO independentes.

## Projeto 1 — Descubra MS (`descubra-ms` na Vercel)

- Domínio: `descubrams.com` e `www.descubrams.com`
- Build Command: `npm run build:descubrams`
- Output Directory: `dist`
- Título: `Descubra Mato Grosso do Sul`
- Canonical: `https://descubrams.com/`

## Projeto 2 — Guatá Labs (`viajartur` na Vercel)

- Domínio: `viajartur.com` e `www.viajartur.com`
- Build Command: `npm run build:guata-labs`
- Output Directory: `dist`
- Título: `Guatá Labs — Tecnologia e IA para o Turismo`
- Canonical: `https://viajartur.com/`

## Configuração na Vercel

O `vercel.json` usa `node scripts/vercel-build.mjs`, que lê a variável
`SITE_BRAND` para escolher o build (`descubrams` ou `guata-labs`).

1. Crie dois projetos apontando para o mesmo repositório e branch.
2. Em **Settings → Environment Variables**, defina:
   - Projeto Descubra MS: `SITE_BRAND=descubrams` (Production, Preview, Development)
   - Projeto Guatá Labs (`viajartur`): `SITE_BRAND=guata-labs` (Production, Preview, Development)
3. Build Command pode ficar o padrão do `vercel.json` (`node scripts/vercel-build.mjs`).
4. Output Directory: `dist` em ambos.
5. Vincule somente os domínios Descubra MS ao projeto Descubra MS.
6. Vincule somente os domínios ViaJAR/Guatá Labs ao projeto Guatá Labs.
7. Faça deploy dos dois projetos.

Não vincule os dois domínios ao mesmo projeto/deploy. O HTML inicial precisa ser
específico para cada domínio para que Google e outros crawlers recebam title,
description, canonical, favicon, Open Graph, JSON-LD, robots e sitemap corretos.

## Verificação após deploy

Em cada domínio:

1. Abra `view-source:https://DOMINIO/` e confirme o `<title>` e o canonical.
2. Abra `/robots.txt` e confirme o sitemap do mesmo domínio.
3. Abra `/sitemap.xml` e confirme que não contém URLs do outro domínio.
4. Confirme o favicon em `/branding/descubra-ms-mark.png` ou
   `/branding/guata-labs-mark.svg`.
5. Solicite nova indexação da home no Google Search Console.

Alterações no resultado do Google não são imediatas; dependem de novo rastreamento.
