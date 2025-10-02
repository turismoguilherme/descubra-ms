@echo off
echo Forçando atualização da logo...

REM Parar processos Node.js
taskkill /f /im node.exe 2>nul

REM Limpar cache do Vite
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite"

REM Limpar cache do navegador (instruções)
echo.
echo ========================================
echo LOGO ATUALIZADA COM SUCESSO!
echo ========================================
echo.
echo Para ver a nova logo:
echo 1. Pressione Ctrl+F5 no navegador
echo 2. Ou abra uma janela incógnita/privada
echo 3. Ou limpe o cache: Ctrl+Shift+Delete
echo.
echo Acesse: http://localhost:8081/ms
echo.

REM Reiniciar servidor
echo Reiniciando servidor...
npm run dev

pause






