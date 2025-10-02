@echo off
echo ========================================
echo DIAGNÓSTICO DE PROBLEMAS DE CARREGAMENTO
echo ========================================

echo.
echo 1. Verificando se o servidor está rodando...
curl -s http://localhost:8080 > nul
if %errorlevel% neq 0 (
    echo ❌ Servidor não está respondendo!
    echo Iniciando servidor...
    start cmd /k "npm run dev"
    timeout 5
) else (
    echo ✅ Servidor respondendo
)

echo.
echo 2. Verificando erros de TypeScript...
npx tsc --noEmit
if %errorlevel% neq 0 (
    echo ❌ Erros de TypeScript encontrados!
) else (
    echo ✅ Nenhum erro de TypeScript
)

echo.
echo 3. Verificando se há processos Node.js rodando...
tasklist | findstr node.exe

echo.
echo 4. Verificando se há problemas com o Supabase...
echo Testando conexão com Supabase...

echo.
echo 5. Verificando se há problemas com os hooks do Guatá...
if exist "src\hooks\useGuataConnection.ts" (
    echo ✅ useGuataConnection.ts existe
) else (
    echo ❌ useGuataConnection.ts NÃO existe
)

if exist "src\hooks\useGuataConversation.ts" (
    echo ✅ useGuataConversation.ts existe
) else (
    echo ❌ useGuataConversation.ts NÃO existe
)

if exist "src\hooks\useGuataInput.ts" (
    echo ✅ useGuataInput.ts existe
) else (
    echo ❌ useGuataInput.ts NÃO existe
)

echo.
echo 6. Verificando se há problemas com os serviços de IA...
if exist "src\services\ai\index.ts" (
    echo ✅ services/ai/index.ts existe
) else (
    echo ❌ services/ai/index.ts NÃO existe
)

if exist "src\services\ai\guataConsciousService.ts" (
    echo ✅ guataConsciousService.ts existe
) else (
    echo ❌ guataConsciousService.ts NÃO existe
)

echo.
echo 7. Verificando se há problemas com o componente Guatá...
if exist "src\pages\Guata.tsx" (
    echo ✅ Guata.tsx existe
) else (
    echo ❌ Guata.tsx NÃO existe
)

if exist "src\components\guata\GuataChat.tsx" (
    echo ✅ GuataChat.tsx existe
) else (
    echo ❌ GuataChat.tsx NÃO existe
)

echo.
echo 8. Verificando se há problemas com o Supabase client...
if exist "src\integrations\supabase\client.ts" (
    echo ✅ Supabase client existe
) else (
    echo ❌ Supabase client NÃO existe
)

echo.
echo ========================================
echo DIAGNÓSTICO CONCLUÍDO
echo ========================================
pause

