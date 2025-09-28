@echo off
echo ========================================
echo DIAGNÓSTICO DA PÁGINA DE ROTEIROS
echo ========================================

echo.
echo 1. Verificando se react-helmet-async está instalado...
npm list react-helmet-async

echo.
echo 2. Verificando erros de TypeScript...
npx tsc --noEmit
if %errorlevel% neq 0 (
    echo ❌ Erros de TypeScript encontrados!
) else (
    echo ✅ Nenhum erro de TypeScript
)

echo.
echo 3. Verificando se o servidor está respondendo...
curl -s http://localhost:8080/ms/roteiros > nul
if %errorlevel% neq 0 (
    echo ❌ Servidor não está respondendo!
) else (
    echo ✅ Servidor respondendo
)

echo.
echo 4. Verificando se há processos Node.js rodando...
tasklist | findstr node.exe

echo.
echo 5. Verificando estrutura de arquivos críticos...
if exist "src\pages\ms\RoteirosMS.tsx" (
    echo ✅ RoteirosMS.tsx existe
) else (
    echo ❌ RoteirosMS.tsx NÃO existe
)

if exist "src\hooks\useRouteManagement.tsx" (
    echo ✅ useRouteManagement.tsx existe
) else (
    echo ❌ useRouteManagement.tsx NÃO existe
)

if exist "src\components\routes\RoutePreviewCard.tsx" (
    echo ✅ RoutePreviewCard.tsx existe
) else (
    echo ❌ RoutePreviewCard.tsx NÃO existe
)

if exist "src\types\passport.ts" (
    echo ✅ passport.ts existe
) else (
    echo ❌ passport.ts NÃO existe
)

echo.
echo 6. Verificando se HelmetProvider está no App.tsx...
findstr /i "HelmetProvider" src\App.tsx
if %errorlevel% neq 0 (
    echo ❌ HelmetProvider NÃO encontrado no App.tsx
) else (
    echo ✅ HelmetProvider encontrado no App.tsx
)

echo.
echo 7. Verificando se há erros de linting...
npx eslint src/pages/ms/RoteirosMS.tsx --quiet
if %errorlevel% neq 0 (
    echo ❌ Erros de linting encontrados
) else (
    echo ✅ Nenhum erro de linting
)

echo.
echo ========================================
echo DIAGNÓSTICO CONCLUÍDO
echo ========================================
pause

