@echo off
echo ========================================
echo TESTANDO LOGS DO COMPONENTE ROTEIROS
echo ========================================

echo.
echo Abrindo navegador em http://localhost:8080/ms/roteiros
echo.
echo INSTRUÇÕES:
echo 1. Pressione F12 para abrir o console
echo 2. Vá para a aba "Console"
echo 3. Procure por logs que começam com "🔍 RoteirosMS:"
echo 4. Verifique se aparecem os seguintes logs:
echo    - "🔍 RoteirosMS: Componente carregado"
echo    - "🔍 RoteirosMS: Componente sendo executado"
echo    - "🔍 RoteirosMS: Chegou no return, routes.length: 6"
echo.
echo Se os logs aparecerem, o componente está funcionando.
echo Se não aparecerem, há um problema de importação ou roteamento.
echo.
echo Pressione qualquer tecla para abrir o navegador...
pause

start http://localhost:8080/ms/roteiros

echo.
echo Navegador aberto! Verifique o console para os logs.
echo.
pause
