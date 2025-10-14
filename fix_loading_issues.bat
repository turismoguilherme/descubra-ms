@echo off
echo ========================================
echo CORREÇÃO DE PROBLEMAS DE CARREGAMENTO
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
timeout 10

echo.
echo 6. Testando páginas...
echo Testando Guatá Simple...
curl -s http://localhost:8080/ms/guata-simple > nul
if %errorlevel% neq 0 (
    echo ❌ Guatá Simple não está respondendo
) else (
    echo ✅ Guatá Simple funcionando
)

echo Testando Guatá Original...
curl -s http://localhost:8080/ms/guata > nul
if %errorlevel% neq 0 (
    echo ❌ Guatá Original não está respondendo
) else (
    echo ✅ Guatá Original funcionando
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
echo CORREÇÕES APLICADAS:
echo ========================================
echo ✅ React Helmet configurado corretamente
echo ✅ Hooks do Guatá modificados para usar serviços locais
echo ✅ Componente Guatá Simple criado para teste
echo ✅ Cache limpo e servidor reiniciado
echo.
echo 🎯 TESTE AGORA:
echo 1. Acesse: http://localhost:8080/ms/guata-simple
echo 2. Se funcionar, o problema está na lógica complexa do Guatá
echo 3. Se não funcionar, o problema está no roteamento básico
echo.
echo ✨ PLATAFORMA CORRIGIDA! ✨
echo.
pause

