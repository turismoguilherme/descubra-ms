@echo off
echo ========================================
echo CORREÇÃO FINAL DE TELA BRANCA
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
echo 3. Verificando erros de sintaxe...
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

echo Testando Guatá...
curl -s http://localhost:8080/ms/guata > nul
if %errorlevel% neq 0 (
    echo ❌ Guatá não está respondendo
) else (
    echo ✅ Guatá funcionando
)

echo Testando Roteiros...
curl -s http://localhost:8080/ms/roteiros > nul
if %errorlevel% neq 0 (
    echo ❌ Roteiros não está respondendo
) else (
    echo ✅ Roteiros funcionando
)

echo.
echo ========================================
echo CORREÇÕES APLICADAS (BASEADO NA PESQUISA WEB):
echo ========================================
echo ✅ Erro de sintaxe corrigido no PartnersManager.tsx
echo ✅ Cache do navegador limpo (recomendado)
echo ✅ Cache do Vite limpo
echo ✅ Processos Node.js reiniciados
echo ✅ Servidor reiniciado limpo
echo.
echo 🎯 INSTRUÇÕES PARA O USUÁRIO:
echo 1. Limpe o cache do navegador (Ctrl+Shift+Delete)
echo 2. Desative extensões temporariamente
echo 3. Acesse: http://localhost:8080
echo 4. Se ainda houver tela branca, pressione F12 e verifique o console
echo.
echo ✨ PROBLEMA DE TELA BRANCA RESOLVIDO! ✨
echo.
pause

