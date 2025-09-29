@echo off
echo ========================================
echo DIAGNOSTICO DA PLATAFORMA DESCUBRA MS
echo ========================================
echo.

echo 1. Verificando se o Node.js esta instalado...
node --version
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado!
    pause
    exit /b 1
)

echo.
echo 2. Verificando se o npm esta funcionando...
npm --version
if %errorlevel% neq 0 (
    echo ERRO: npm nao encontrado!
    pause
    exit /b 1
)

echo.
echo 3. Verificando dependencias...
npm list --depth=0

echo.
echo 4. Tentando build da aplicacao...
npm run build
if %errorlevel% neq 0 (
    echo ERRO: Build falhou!
    pause
    exit /b 1
)

echo.
echo 5. Iniciando servidor de desenvolvimento...
echo A aplicacao sera aberta em http://localhost:5173
echo Pressione Ctrl+C para parar o servidor
echo.
npm run dev

pause

