@echo off
echo Limpando cache do navegador e reiniciando servidor...

REM Parar processos Node.js
taskkill /f /im node.exe 2>nul

REM Limpar cache do Vite
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite"

REM Limpar cache do navegador (Chrome/Edge)
echo Limpando cache do navegador...
echo Abra o navegador e pressione Ctrl+Shift+Delete para limpar o cache
echo Ou use Ctrl+F5 para forçar o reload

REM Reiniciar servidor
echo Reiniciando servidor...
npm run dev

pause






