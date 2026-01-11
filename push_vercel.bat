@echo off
REM Script para fazer push para ambos os remotes (origin e vercel)
REM Garante que o Vercel sempre receba as atualizações

echo.
echo ========================================
echo   🚀 Push para Remotes Origin e Vercel
echo ========================================
echo.

REM Verificar se estamos na branch main
git branch --show-current | findstr /C:"main" >nul
if %errorlevel% neq 0 (
    echo ⚠️  AVISO: Você não está na branch main!
    echo    Este script faz push para a branch main.
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

REM Verificar se há commits para enviar
git log origin/main..HEAD --oneline 2>nul | findstr /R "." >nul
set tem_commits_origin=%errorlevel%
git log vercel/main..HEAD --oneline 2>nul | findstr /R "." >nul
set tem_commits_vercel=%errorlevel%

if %tem_commits_origin% neq 0 if %tem_commits_vercel% neq 0 (
    echo ℹ️  Não há commits novos para enviar.
    echo    Ambos os remotes já estão atualizados.
    echo.
    git log -1 --oneline
    echo.
    exit /b 0
)

REM Mostrar commits que serão enviados
echo 📦 Commits que serão enviados:
echo.
git log origin/main..HEAD --oneline 2>nul
if %errorlevel% neq 0 (
    echo    (sem commits novos para origin)
) else (
    echo    → Para origin
)
echo.
git log vercel/main..HEAD --oneline 2>nul
if %errorlevel% neq 0 (
    echo    (sem commits novos para vercel)
) else (
    echo    → Para vercel
)
echo.

REM Fazer push para origin
echo 📤 Fazendo push para origin (turismoguilherme/descubra-ms)...
git push origin main
set push_origin=%errorlevel%
if %push_origin% neq 0 (
    echo ❌ Erro ao fazer push para origin
    echo    Código de erro: %push_origin%
    echo.
    echo    Possíveis causas:
    echo    - Repositório remoto não está acessível
    echo    - Você não tem permissão para fazer push
    echo    - Há conflitos que precisam ser resolvidos
    echo.
    set /p continuar="Deseja continuar com o push para vercel mesmo assim? (S/N): "
    if /i not "%continuar%"=="S" (
        echo ❌ Operação cancelada.
        exit /b 1
    )
    echo.
) else (
    echo ✅ Push para origin concluído com sucesso!
    echo.
)

REM Fazer push para vercel
echo 📤 Fazendo push para vercel (guilhermearevalo/descubrams)...
git push vercel main
set push_vercel=%errorlevel%
if %push_vercel% neq 0 (
    echo ❌ Erro ao fazer push para vercel
    echo    Código de erro: %push_vercel%
    echo.
    echo    Possíveis causas:
    echo    - Repositório remoto não está acessível
    echo    - Você não tem permissão para fazer push
    echo    - Há conflitos que precisam ser resolvidos
    echo    - Remote vercel não está configurado
    echo.
    echo    Para configurar o remote vercel:
    echo    git remote add vercel https://github.com/guilhermearevalo/descubrams.git
    echo.
    exit /b 1
) else (
    echo ✅ Push para vercel concluído com sucesso!
    echo.
)

REM Resumo final
echo ========================================
echo   ✅ Push Concluído com Sucesso!
echo ========================================
echo.
echo 📦 Próximos passos:
echo    1. Acesse: https://vercel.com/dashboard
echo    2. Vá em Deployments
echo    3. Verifique que um novo deployment foi criado automaticamente
echo    4. Aguarde o deployment concluir (status "Ready")
echo.
echo ℹ️  O Vercel deve detectar o push automaticamente em alguns segundos.
echo    Se não aparecer em 1 minuto, consulte PREVENCAO_ATUALIZACAO_VERCEL.md
echo.

exit /b 0

