@echo off
echo ========================================
echo   DIAGNOSTICO - DASHBOARD ESTATICO
echo ========================================
echo.

echo [1/4] Verificando erros de sintaxe...
call npm run build 2>&1 | findstr /C:"error" /C:"Error" /C:"failed" /C:"Failed"
if errorlevel 1 (
    echo OK - Sem erros de build
) else (
    echo ERRO: Encontrados erros de build!
)
echo.

echo [2/4] Verificando imports...
call npm run build 2>&1 | findstr /C:"Cannot find" /C:"Module not found"
if errorlevel 1 (
    echo OK - Imports corretos
) else (
    echo ERRO: Problemas com imports!
)
echo.

echo [3/4] Verificando linter...
call npm run lint 2>&1 | findstr /C:"error" /C:"Error"
if errorlevel 1 (
    echo OK - Sem erros de lint
) else (
    echo AVISO: Erros de lint encontrados
)
echo.

echo [4/4] Verificando arquivos principais...
if exist "src\pages\PrivateDashboard.tsx" (
    echo OK - PrivateDashboard.tsx existe
) else (
    echo ERRO: PrivateDashboard.tsx nao encontrado!
)

if exist "src\components\private\GoalsTracking.tsx" (
    echo OK - GoalsTracking.tsx existe
) else (
    echo ERRO: GoalsTracking.tsx nao encontrado!
)

if exist "src\components\private\PrivateAIConversation.tsx" (
    echo OK - PrivateAIConversation.tsx existe
) else (
    echo ERRO: PrivateAIConversation.tsx nao encontrado!
)

if exist "src\components\private\ReportsSection.tsx" (
    echo OK - ReportsSection.tsx existe
) else (
    echo ERRO: ReportsSection.tsx nao encontrado!
)

if exist "src\components\private\SettingsModal.tsx" (
    echo OK - SettingsModal.tsx existe
) else (
    echo ERRO: SettingsModal.tsx nao encontrado!
)
echo.

echo ========================================
echo   DIAGNOSTICO CONCLUIDO
echo ========================================
echo.
echo PROXIMOS PASSOS:
echo 1. Abra o navegador e pressione F12
echo 2. Vá para a aba Console
echo 3. Procure por erros em vermelho
echo 4. Teste clicar nos botões e veja se aparecem erros
echo 5. Verifique a aba Network para ver se há requisições falhando
echo.
pause

