@echo off
REM Script para atualizar o Vercel forçando um novo deployment
REM Baseado na documentação oficial do Vercel

echo.
echo ========================================
echo   🚀 Atualizar Vercel - Forçar Deploy
echo ========================================
echo.

REM Verificar se estamos na branch main
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

REM Verificar se o remote vercel existe
git remote get-url vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Remote 'vercel' não encontrado!
    echo.
    echo    Configurando remote vercel...
    git remote add vercel https://github.com/guilhermearevalo/descubrams.git
    if %errorlevel% neq 0 (
        echo ❌ Erro ao configurar remote vercel
        exit /b 1
    )
    echo ✅ Remote vercel configurado com sucesso!
    echo.
)

REM Mostrar última informação do commit
echo 📦 Último commit:
git log -1 --oneline
echo.

REM Verificar se há commits para enviar
git log vercel/main..HEAD --oneline 2>nul | findstr /R "." >nul
if %errorlevel% equ 0 (
    echo 📤 Encontrados commits novos para enviar:
    git log vercel/main..HEAD --oneline
    echo.
) else (
    echo ℹ️  Não há commits novos. Criando commit vazio para forçar deploy...
    echo.
    git commit --allow-empty -m "trigger: Forçar atualização no Vercel - %date% %time%"
    if %errorlevel% neq 0 (
        echo ❌ Erro ao criar commit vazio
        exit /b 1
    )
    echo ✅ Commit vazio criado com sucesso!
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
    echo    - Problemas de autenticação Git
    echo.
    echo    Para verificar:
    echo    - git remote -v
    echo    - git status
    echo.
    exit /b 1
)

echo ✅ Push para vercel concluído com sucesso!
echo.

REM Resumo final
echo ========================================
echo   ✅ Atualização Enviada para Vercel!
echo ========================================
echo.
echo 📦 Próximos passos:
echo    1. Acesse: https://vercel.com/dashboard
echo    2. Vá em Deployments
echo    3. Verifique que um novo deployment foi criado automaticamente (em ~30 segundos)
echo    4. Aguarde o deployment concluir (status "Ready")
echo.
echo ℹ️  O Vercel deve detectar o push automaticamente em alguns segundos.
echo    Se não aparecer em 1 minuto, verifique:
echo    - GitHub Settings → Webhooks → Verificar último evento
echo    - Vercel Settings → Git → Repositório conectado
echo    - Consulte: GUIA_ATUALIZACAO_VERCEL_2025.md
echo.
echo 📚 Documentação: GUIA_ATUALIZACAO_VERCEL_2025.md
echo.

exit /b 0




























