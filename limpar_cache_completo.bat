@echo off
echo ========================================
echo LIMPEZA COMPLETA DE CACHE
echo ========================================
echo.

echo [1/6] Parando servidor...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/6] Limpando node_modules\.vite...
if exist node_modules\.vite (
    rmdir /s /q node_modules\.vite
    echo Limpo!
)

echo [3/6] Limpando .vite...
if exist .vite (
    rmdir /s /q .vite
    echo Limpo!
)

echo [4/6] Limpando dist...
if exist dist (
    rmdir /s /q dist
    echo Limpo!
)

echo [5/6] Limpando cache do npm...
call npm cache clean --force
echo Limpo!

echo [6/6] Limpando cache do Vite em node_modules...
if exist node_modules\.cache rmdir /s /q node_modules\.cache
echo Limpo!

echo.
echo ========================================
echo LIMPEZA CONCLUIDA!
echo ========================================
echo.
echo IMPORTANTE: Agora faça:
echo   1. Limpe o cache do navegador (Ctrl+Shift+Delete)
echo   2. Feche TODAS as abas do navegador
echo   3. Execute: npm run dev
echo   4. Abra uma NOVA aba anonima/privada
echo   5. Acesse: http://localhost:8080
echo.
pause



