@echo off
REM Script completo para corrigir problemas de atualização no Vercel
REM Baseado em pesquisa web e documentação oficial do Vercel

echo.
echo ========================================
echo   🔧 Corrigir: Vercel Não Atualiza
echo ========================================
echo.
echo Este script irá:
echo   1. Verificar configurações Git
echo   2. Corrigir autor do commit (se necessário)
echo   3. Fazer push para vercel
echo   4. Mostrar próximos passos
echo.
pause
echo.

REM 1. Verificar se está na branch main
git branch --show-current | findstr /C:"main" >nul
if %errorlevel% neq 0 (
    echo ⚠️  AVISO: Você não está na branch main!
    echo    Branch atual:
    git branch --show-current
    echo.
    set /p continuar="Deseja continuar mesmo assim? (S/N): "
    if /i not "%continuar%"=="S" (
        echo ❌ Operação cancelada.
        exit /b 1
    )
    echo.
)

REM 2. Verificar autor do último commit
echo 📦 Verificando autor do último commit...
echo.
git log -1 --format="   Autor: %%an <%%ae>"
echo.
echo ⚠️  IMPORTANTE: Este email deve estar na equipe do Vercel
echo    Para verificar: Vercel Dashboard → Settings → Team
echo.
pause
echo.

REM 3. Verificar configuração Git
echo 📝 Verificando configuração Git...
echo.
echo    Nome atual:
git config user.name
echo    Email atual:
git config user.email
echo.
set /p corrigir="Deseja corrigir a configuração Git? (S/N): "
if /i "%corrigir%"=="S" (
    set /p nome="Digite seu nome (como no GitHub): "
    set /p email="Digite seu email (como no GitHub/Vercel): "
    
    git config user.name "%nome%"
    git config user.email "%email%"
    
    echo.
    echo ✅ Configuração Git atualizada!
    echo.
)

REM 4. Verificar se remote vercel existe
git remote get-url vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Remote 'vercel' não encontrado!
    echo    Configurando...
    git remote add vercel https://github.com/guilhermearevalo/descubrams.git
    if %errorlevel% neq 0 (
        echo ❌ Erro ao configurar remote vercel
        exit /b 1
    )
    echo ✅ Remote vercel configurado!
    echo.
)

REM 5. Verificar commits não enviados
echo 📤 Verificando commits não enviados...
echo.
git log vercel/main..HEAD --oneline 2>nul | findstr /R "." >nul
if %errorlevel% equ 0 (
    echo    Commits encontrados:
    git log vercel/main..HEAD --oneline
    echo.
) else (
    echo    Não há commits novos. Criando commit vazio para testar...
    echo.
    git commit --allow-empty -m "trigger: Corrigir atualização no Vercel - %date% %time%"
    if %errorlevel% neq 0 (
        echo ❌ Erro ao criar commit vazio
        exit /b 1
    )
    echo ✅ Commit vazio criado!
    echo.
)

REM 6. Fazer push para vercel
echo 📤 Fazendo push para vercel...
echo.
git push vercel main
if %errorlevel% neq 0 (
    echo.
    echo ❌ Erro ao fazer push para vercel!
    echo.
    echo    Possíveis causas:
    echo    - Problemas de autenticação Git
    echo    - Permissões revogadas
    echo    - Repositório remoto não acessível
    echo.
    echo    SOLUÇÕES:
    echo    1. Verificar credenciais do GitHub
    echo    2. Reconectar integração Git no Vercel
    echo    3. Verificar permissões no GitHub
    echo.
    exit /b 1
)

echo.
echo ✅ Push realizado com sucesso!
echo.

REM 7. Resumo final
echo ========================================
echo   ✅ Correção Aplicada!
echo ========================================
echo.
echo 📦 PRÓXIMOS PASSOS:
echo.
echo    1. AGUARDE ~30 segundos
echo.
echo    2. Verifique no Vercel Dashboard:
echo       - Acesse: https://vercel.com/dashboard
echo       - Vá em Deployments
echo       - Verifique se novo deployment foi criado
echo.
echo    3. Se deployment NÃO aparecer:
echo.
echo       A. Verificar webhooks do GitHub:
echo          - https://github.com/guilhermearevalo/descubrams/settings/hooks
echo          - Webhook do Vercel deve estar ativo
echo          - Último delivery deve ser bem-sucedido (verde)
echo.
echo       B. Reconectar integração Git no Vercel:
echo          - Vercel Dashboard → Settings → Git → Disconnect
echo          - Connect Git Repository → guilhermearevalo/descubrams
echo          - Confirme branch main
echo.
echo       C. Verificar autor do commit na equipe Vercel:
echo          - Vercel Dashboard → Settings → Team
echo          - Email do autor deve estar na lista
echo.
echo    4. Para mais detalhes, consulte:
echo       - SOLUCAO_COMPLETA_VERCEL_NAO_ATUALIZA.md
echo       - GUIA_ATUALIZACAO_VERCEL_2025.md
echo.
echo ========================================
echo.

exit /b 0
























