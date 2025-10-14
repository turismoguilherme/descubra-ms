@echo off
echo ========================================
echo    RESTAURACAO DO LAYOUT DO GUATA
echo ========================================
echo.

echo [1/4] Parando servidor se estiver rodando...
taskkill /f /im node.exe >nul 2>&1

echo [2/4] Restaurando layout do Guata...
copy "src\pages\Guata.tsx.backup" "src\pages\Guata.tsx" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Layout do Guata restaurado com sucesso!
) else (
    echo ✗ Erro ao restaurar layout do Guata
    pause
    exit /b 1
)

echo [3/4] Verificando cores CSS...
findstr /C:"--ms-primary-blue" "src\index.css" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Cores CSS verificadas
) else (
    echo ⚠ Cores CSS podem estar faltando
)

echo [4/4] Iniciando servidor...
start /b npm run dev >nul 2>&1

echo.
echo ========================================
echo    RESTAURACAO CONCLUIDA!
echo ========================================
echo.
echo O Guata foi restaurado para o layout original.
echo Acesse: http://localhost:8080/ms/guata
echo.
echo Pressione qualquer tecla para continuar...
pause >nul




