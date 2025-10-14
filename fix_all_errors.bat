@echo off
echo ========================================
echo CORRIGINDO TODOS OS ERROS DA PLATAFORMA
echo ========================================

echo.
echo 1. Finalizando processos Node.js...
taskkill /f /im node.exe 2>nul
taskkill /f /im cmd.exe 2>nul

echo.
echo 2. Removendo conflitos de merge automaticamente...
for /r src %%f in (*.ts *.tsx *.js *.jsx) do (
    echo Processando: %%f
    powershell -Command "(Get-Content '%%f' -Raw) -replace '<<<<<<< HEAD.*?=======.*?>>>>>>> [a-f0-9]+', '' | Set-Content '%%f' -NoNewline"
    powershell -Command "(Get-Content '%%f' -Raw) -replace '<<<<<<< HEAD', '' | Set-Content '%%f' -NoNewline"
    powershell -Command "(Get-Content '%%f' -Raw) -replace '=======', '' | Set-Content '%%f' -NoNewline"
    powershell -Command "(Get-Content '%%f' -Raw) -replace '>>>>>>> [a-f0-9]+', '' | Set-Content '%%f' -NoNewline"
)

echo.
echo 3. Limpando cache do Vite...
if exist node_modules\.vite rmdir /s /q node_modules\.vite
if exist dist rmdir /s /q dist

echo.
echo 4. Reinstalando dependências...
npm install

echo.
echo 5. Verificando arquivos problemáticos...
echo Verificando ProtectedRoute.tsx...
if exist src\components\auth\ProtectedRoute.tsx (
    echo Arquivo existe, verificando sintaxe...
    npx tsc --noEmit src\components\auth\ProtectedRoute.tsx 2>nul
    if %errorlevel% equ 0 (
        echo ✅ ProtectedRoute.tsx OK
    ) else (
        echo ❌ ProtectedRoute.tsx com problemas
    )
)

echo.
echo 6. Iniciando servidor de desenvolvimento...
echo ========================================
echo SERVIDOR INICIANDO...
echo ========================================
npm run dev


