@echo off
REM Script para diagnosticar problemas de atualização no Vercel
REM Baseado em pesquisa web e documentação oficial

echo.
echo ========================================
echo   🔍 Diagnóstico: Vercel Não Atualiza
echo ========================================
echo.

REM 1. Verificar autor do último commit
echo 📦 1. VERIFICAR AUTOR DO ÚLTIMO COMMIT
echo.
git log -1 --format="   Autor: %%an <%%ae>"
git log -1 --format="   Hash: %%H"
git log -1 --format="   Mensagem: %%s"
echo.
echo ⚠️  IMPORTANTE: O autor do commit deve ser membro da equipe no Vercel
echo.

REM 2. Verificar configuração Git local
echo 📝 2. VERIFICAR CONFIGURAÇÃO GIT LOCAL
echo.
echo    Nome configurado:
git config user.name
echo    Email configurado:
git config user.email
echo.
echo ⚠️  IMPORTANTE: Nome/Email devem corresponder ao GitHub/Vercel
echo.

REM 3. Verificar remotes
echo 🌐 3. VERIFICAR REMOTES GIT
echo.
git remote -v
echo.
echo ⚠️  IMPORTANTE: Deve existir remote 'vercel' apontando para guilhermearevalo/descubrams
echo.

REM 4. Verificar branch atual
echo 🌿 4. VERIFICAR BRANCH ATUAL
echo.
git branch --show-current
echo.
echo ⚠️  IMPORTANTE: Deve estar na branch 'main'
echo.

REM 5. Verificar commits não enviados para vercel
echo 📤 5. VERIFICAR COMMITS NÃO ENVIADOS PARA VERCEL
echo.
git log vercel/main..HEAD --oneline 2>nul
if %errorlevel% neq 0 (
    echo    (sem commits novos para enviar)
) else (
    echo ⚠️  IMPORTANTE: Há commits não enviados para vercel!
    echo    Execute: git push vercel main
)
echo.

REM 6. Resumo e recomendações
echo ========================================
echo   📋 RESUMO E RECOMENDAÇÕES
echo ========================================
echo.
echo ✅ Verificações realizadas:
echo    1. Autor do último commit
echo    2. Configuração Git local
echo    3. Remotes configurados
echo    4. Branch atual
echo    5. Commits não enviados
echo.
echo 📚 PRÓXIMOS PASSOS:
echo.
echo    Se o Vercel ainda não atualiza, execute:
echo.
echo    1. Verificar autor do commit:
echo       git log -1 --format="%%an <%%ae>"
echo.
echo    2. Configurar Git corretamente:
echo       git config user.name "Seu Nome"
echo       git config user.email "seu-email@provedor.com"
echo.
echo    3. Reconectar integração Git no Vercel:
echo       - Vercel Dashboard → Settings → Git → Disconnect
echo       - Connect Git Repository → guilhermearevalo/descubrams
echo.
echo    4. Verificar webhooks do GitHub:
echo       - GitHub → Settings → Webhooks
echo       - Verificar se webhook do Vercel está ativo
echo.
echo    5. Limpar cache de build:
echo       - Vercel Dashboard → Deployments → ⋯ → Redeploy
echo       - DESMARQUE "Use existing Build Cache"
echo.
echo    Para mais detalhes, consulte:
echo    - SOLUCAO_COMPLETA_VERCEL_NAO_ATUALIZA.md
echo    - GUIA_ATUALIZACAO_VERCEL_2025.md
echo.
echo ========================================
echo.

exit /b 0




























