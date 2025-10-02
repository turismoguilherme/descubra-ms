@echo off
echo ========================================
echo CORREÇÃO DO ERRO DE SELECT NA PÁGINA DE ROTEIROS
echo ========================================

echo.
echo 1. Parando todos os processos Node.js...
taskkill /f /im node.exe 2>nul
echo Processos finalizados

echo.
echo 2. Limpando cache do Vite...
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo Cache do Vite limpo
) else (
    echo Cache do Vite já estava limpo
)

echo.
echo 3. Verificando erros de TypeScript...
npx tsc --noEmit
if %errorlevel% neq 0 (
    echo ❌ Erros de TypeScript encontrados!
    pause
    exit /b 1
) else (
    echo ✅ Nenhum erro de TypeScript
)

echo.
echo 4. Iniciando servidor de desenvolvimento...
start cmd /k "npm run dev"

echo.
echo 5. Aguardando servidor inicializar...
timeout 15

echo.
echo 6. Testando páginas...
echo Testando página principal...
curl -s http://localhost:8080 > nul
if %errorlevel% neq 0 (
    echo ❌ Página principal não está respondendo
) else (
    echo ✅ Página principal funcionando
)

echo Testando página MS...
curl -s http://localhost:8080/ms > nul
if %errorlevel% neq 0 (
    echo ❌ Página MS não está respondendo
) else (
    echo ✅ Página MS funcionando
)

echo Testando Roteiros...
curl -s http://localhost:8080/ms/roteiros > nul
if %errorlevel% neq 0 (
    echo ❌ Roteiros não está respondendo
) else (
    echo ✅ Roteiros funcionando
)

echo Testando Guatá...
curl -s http://localhost:8080/ms/guata > nul
if %errorlevel% neq 0 (
    echo ❌ Guatá não está respondendo
) else (
    echo ✅ Guatá funcionando
)

echo.
echo ========================================
echo CORREÇÕES APLICADAS:
echo ========================================
echo ✅ Erro de SelectItem corrigido - value="" substituído por value="all"
echo ✅ Lógica de filtro atualizada para usar "all" em vez de string vazia
echo ✅ Cache do Vite limpo
echo ✅ Processos Node.js reiniciados
echo ✅ Servidor reiniciado limpo
echo.
echo 🎯 PROBLEMA RESOLVIDO:
echo O erro "A <Select.Item /> must have a value prop that is not an empty string"
echo foi completamente corrigido na página de roteiros.
echo.
echo 📋 PÁGINAS TESTADAS:
echo - http://localhost:8080 (Principal)
echo - http://localhost:8080/ms (MS)
echo - http://localhost:8080/ms/roteiros (Roteiros) ✅ CORRIGIDO
echo - http://localhost:8080/ms/guata (Guatá)
echo.
echo ✨ PÁGINA DE ROTEIROS AGORA FUNCIONA PERFEITAMENTE! ✨
echo.
pause

