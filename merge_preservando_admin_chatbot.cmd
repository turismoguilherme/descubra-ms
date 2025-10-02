@echo off
setlocal

REM Desativa pager para evitar travas de saída
set GIT_PAGER=cat
set PAGER=cat

echo [1/7] Salvando alteracoes locais (stash)...
git -c core.pager=cat stash push -u -m pre-merge-local

echo [2/7] Buscando atualizacoes do remoto (origin)...
git -c core.pager=cat fetch origin

echo [3/7] Iniciando merge sem commit (--no-commit --no-ff) a partir de origin/main...
git -c core.pager=cat merge --no-commit --no-ff origin/main

echo [4/7] Preservando Area Admin e Chatbot (restaurando para HEAD)...
git -c core.pager=cat restore --source=HEAD --staged --worktree ^
  src/components/admin ^
  src/pages/AdminPortal.tsx ^
  src/pages/Management.tsx ^
  src/pages/MunicipalAdmin.tsx ^
  src/pages/EventsManagement.tsx ^
  src/pages/RoutesManagement.tsx ^
  src/components/guata ^
  src/pages/Guata.tsx ^
  src/pages/GuataPublic.tsx ^
  src/hooks/useGuataConnection.ts ^
  src/hooks/useGuataConversation.ts ^
  src/hooks/useGuataMessages.ts ^
  src/services/ai ^
  supabase/functions/guata-ai ^
  supabase/functions/guata-web-rag

echo [5/7] Finalizando merge...
git -c core.pager=cat add -A
git -c core.pager=cat commit -m "merge: remoto preservando Admin e Chatbot"

echo [6/7] Reaplicando stash (se existir)...
git -c core.pager=cat stash pop

echo [7/7] Consolidando reaplicacao pos-merge...
git -c core.pager=cat add -A
git -c core.pager=cat commit -m "apply: pos-merge preservando Admin/Chatbot"

echo.
echo ✅ Processo concluido. Caso veja conflitos, repita este script apos resolver ou me avise que eu resolvo.
exit /b 0
