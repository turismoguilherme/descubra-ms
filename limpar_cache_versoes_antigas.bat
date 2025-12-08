@echo off
echo ========================================
echo Limpando Cache e Versoes Antigas
echo ========================================
echo.

echo [1/5] Parando servidor se estiver rodando...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/5] Limpando node_modules...
if exist node_modules (
    echo Removendo node_modules...
    rmdir /s /q node_modules
    echo node_modules removido!
) else (
    echo node_modules nao encontrado.
)

echo [3/5] Limpando dist (build antigo)...
if exist dist (
    echo Removendo dist...
    rmdir /s /q dist
    echo dist removido!
) else (
    echo dist nao encontrado.
)

echo [4/5] Limpando .vite (cache do Vite)...
if exist .vite (
    echo Removendo .vite...
    rmdir /s /q .vite
    echo .vite removido!
) else (
    echo .vite nao encontrado.
)

echo [5/5] Limpando cache do npm...
call npm cache clean --force
echo Cache do npm limpo!

echo.
echo ========================================
echo Limpeza Concluida!
echo ========================================
echo.
echo Agora execute:
echo   npm install
echo   npm run dev
echo.
pause




