## Escopo aprovado

1. Limpeza completa e profunda de código morto (Descubra MS + Guatá Labs)
2. Remover a "capa" que aparece rapidamente ao clicar em "Iniciar Rota"
3. Substituir favicon dos dois sites e corrigir o título da aba

---

## 1) Limpeza completa e profunda

### 1a. Raiz do projeto — remoção direta
- **Scripts obsoletos**: todos os `test_guata_*.bat` (~25 arquivos), `fix_*.bat`, `diagnose_*.bat`, `restore_*.bat`, `verify_*.bat`, `test_*.bat`, `enable_all_components.bat`, `clean_restore.bat`, `clear_cache.bat`, `commit_logo_update.bat`, `force_logo_update.bat`, `open_browser_debug.bat`, `push_vercel.bat`, `atualizar_vercel.bat`, `git_update.bat`, `limpar_cache*.bat`, `forcar_deploy_vercel.bat`, `diagnosticar_vercel.bat`, `merge_preservando_admin_chatbot.cmd`, `update_from_main.bat`, `CORRIGIR_VERCEL_COMPLETO.bat`, `t_guata_protection.bat`, `restore_before_partners.bat`.
- **PowerShell antigos**: `fix-all-errors.ps1`, `gerar_hash_*.ps1`, `update_main.ps1`.
- **Docs de trabalho já concluídos**: todos `RESUMO_*.md`, `ANALISE_*.md`, `CORRECOES_APLICADAS.md`, `IMPLEMENTACAO_*.md`, `VERIFICACAO_*.md`, `PROPOSTA_*.md`, `PROGRESSO_*.md`, `PLANO_*.md` (raiz), `SOLUCAO_*.md`, `DIAGNOSTICO_*.md`, `RECOMENDACAO_*.md`, `TROUBLESHOOTING_*.md`, `MELHORIAS_*.md`, `AUDITORIA_*.md`, `ACAO_IMEDIATA_*.md`, `EXPLICACAO_*.md`, `MELHOR_OPCAO_*.md`, `ONDE_PARCEIRO_*.md`, `INSTRUCOES_*.md`, `CONFIGURAR_*.md`, `CONFIGURACAO_*.md`, `COMO_USAR_*.md`, `CONSULTA_*.md`. Manter: `README.md`.
- **Arquivos soltos**: `temp.html`, `temp_file.tsx`, `test_report.json`, `tsc-errors.txt`, `diagnosticar_versao_servida.html`, `hash-sha256*.txt`, `guata-config*.txt`, `guata-env-config.txt`, `env.example.txt` (manter só se referenciado), `supabase_cli_install_log.txt`.
- **JS scripts one-off**: `baixar_logo*.js`, `buscar_e_baixar_logo.js`, `check_events.js`, `create_users_script.js`, `criar_parceiro_teste_console.js`, `criar_usuario_parceiro_teste.js`, `debug-translations.js`, `test-google-translate.js`, `test-translation-flow.js`, `test_destinations.js`, `test_edge_function.js`, `generate-missing-translations.js`, `run-migration.js`, `verificar_logo_banco.js`, `fix_prefer_const.py`.
- **Alternativos App**: `src/App.simple.tsx`, `src/MinimalApp.tsx`, `package-simple.json`, `.env.bak`, `server.js` (se não usado), `deploy.config.js` (se não usado).
- **Nomes corrompidos**: paths estranhos em `public/images/descubra-ms/` (`.env.bak`, `clean_restore.bat`, `0.7)`, etc.) e nomes como `ersguilhDescubra MSdescubra-ms && git status`, `how 1627771 --name-only`, `rccomponentsadmindashboards...`, `tash show stash...`, `tatus`, `dir`, `copy`, `desabilitados` (verificar antes de remover).

### 1b. Serviços Guatá antigos
Manter apenas o serviço ativo em produção. Vou identificar qual é o ativo (rastreando `guata-ai` edge function e imports em `src/pages/Guata.tsx` e `src/components/koda/`) e remover os demais dentre:
`guataInstantService, guataUltraFastIntelligentService, guataUltraFastService, guataSmartHybridService, guataSmartHybridRealService, guataIntelligentService, guataAdaptiveService, guataAdvancedMemoryService, guataEmotionalIntelligenceService, guataFallbackService, guataGeminiService, guataInteractiveService, guataPersonaService, guataRealWebSearchService, guataResponseDepth, guataRestoredService, guataSimpleEdgeService, guataSimpleService, guataSupabaseService, guataTrueApiService, guataIntelligentTourismService`.

Vou também revisar `src/services/ai/` (subpastas `apis/`, `cache/`, `external/`, `feedback/`, `integration/`, `knowledge/`, `learning/`) e remover módulos sem imports.

### 1c. Componentes/hooks/pages órfãos
Varredura com `rg` para achar `.tsx`/`.ts` em `src/components/`, `src/hooks/`, `src/pages/` que não são importados em nenhum lugar (excluindo entry points e rotas de `App.tsx`). Removo apenas os 100% órfãos. Também remover diretórios `docs/historico/`, `docs/sql-archive/` e `guata-channel/` (WhatsApp export legado) — confirmarei que não são referenciados em runtime.

### 1d. Segurança de limpeza
- Antes de apagar cada bloco, confirmo com `rg` que não há import/referência no código executável.
- Nada em `supabase/functions/`, `supabase/migrations/`, `src/integrations/`, `public/branding/`, `public/_redirects` será tocado.

---

## 2) Remover a "capa" ao iniciar rota

Ao clicar em "Iniciar Rota" em `PassaporteLista.tsx`, é aberta uma rota (`/descubrams/passaporte/:id`) que renderiza um `RoutePreviewCard` (capa com resumo/imagem/botão "Iniciar") e só depois entra em `PassportRouteView` (mapa + checkpoints). Vou:
- Pular a etapa da capa: renderizar `PassportRouteView` diretamente na abertura da rota.
- Manter `RoutePreviewCard` no arquivo mas removê-lo do fluxo, ou removê-lo se ficar órfão após a mudança (cai na limpeza da fase 1).

---

## 3) Favicon e título da aba

### 3a. Favicon
Dois sites compartilham o mesmo `index.html`, então o favicon precisa mudar por rota, via JS.
- Adiciono dois arquivos em `public/`: `favicon-ms.png` (logo oficial do MS que já usamos no header) e `favicon-guata-labs.png` (derivado de `image-27.png` que você enviou).
- Adiciono um pequeno componente `<DynamicFavicon />` (montado em `App.tsx`) que, com base em `location.pathname.startsWith('/descubrams') ? MS : Guatá Labs`, injeta o `<link rel="icon">` correto.
- Removo o `public/favicon.ico` padrão do Lovable.

### 3b. Título da aba
Hoje `index.html` não tem `<title>` nenhum, então quando o usuário navega Guatá Labs → Descubra MS, o navegador mantém o último título (é o bug que você viu).
- Adiciono `<title>` inicial em `index.html`.
- Adiciono um `<DynamicTitle />` (mesmo componente que o favicon) que aplica títulos por plataforma:
  - Guatá Labs (rotas fora de `/descubrams`): **"Guatá Labs — IA para o turismo"**
  - Descubra MS (`/descubrams/*` e `/`  quando é home MS): **"Descubra MS — Turismo em Mato Grosso do Sul"**
- Páginas que já usam `<Helmet>` (Termos, Privacidade, Cookies) continuam sobrescrevendo.

**Sugestões de título (você escolhe agora ou aceito estes como padrão):**
- Descubra MS → `Descubra MS — Turismo em Mato Grosso do Sul`
- Guatá Labs → `Guatá Labs — IA para o turismo`

---

## Ordem de execução
1. Confirmar quais serviços Guatá estão em uso ativo (rastrear `import` em `Guata.tsx`, edge functions e `services/ai/index.ts`)
2. Limpeza 1a (raiz) + 1b (serviços)
3. Limpeza 1c (órfãos com varredura)
4. Fase 2: remover capa de rota
5. Fase 3: favicons + títulos dinâmicos
6. Build de verificação após cada fase

## Detalhes técnicos
- Nenhuma migration, nenhuma mudança em RLS, nenhuma edge function tocada.
- Nenhum arquivo em `.lovable/`, `supabase/`, `src/integrations/supabase/types.ts` será removido.
- Todos os removidos são confirmados como "sem import" antes de sair. Se houver dúvida, o arquivo fica.