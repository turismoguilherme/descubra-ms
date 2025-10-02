@echo off
echo ========================================
echo ABRINDO NAVEGADOR PARA DEBUG
echo ========================================

echo.
echo Abrindo navegador em http://localhost:8080/ms
echo.
echo INSTRUÇÕES:
echo 1. Pressione F12 para abrir o console
echo 2. Vá para a aba "Console"
echo 3. Verifique se há erros em vermelho
echo 4. Se houver erros, copie e cole aqui
echo.
echo Pressione qualquer tecla para abrir o navegador...
pause

start http://localhost:8080/ms

echo.
echo Navegador aberto! Verifique o console para erros.
echo.
pause
