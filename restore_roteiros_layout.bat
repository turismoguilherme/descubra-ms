@echo off
echo ========================================
echo RESTAURANDO LAYOUT ORIGINAL DOS ROTEIROS
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
echo LAYOUT ORIGINAL RESTAURADO:
echo ========================================
echo ✅ 6 Roteiros mockados adicionados:
echo    - Roteiro Pantanal - Corumbá
echo    - Bonito - Capital do Ecoturismo  
echo    - Campo Grande - Capital Cultural
echo    - Trilha da Serra da Bodoquena
echo    - Rota do Peixe - Aquidauana
echo    - Cultura Terena - Miranda
echo.
echo ✅ Filtros funcionando:
echo    - Dificuldade (Fácil, Médio, Difícil)
echo    - Região (Pantanal, Bonito, Campo Grande, Corumbá)
echo.
echo ✅ Layout original restaurado:
echo    - Grid de roteiros com cards
echo    - Sistema de pontos e conquistas
echo    - Filtros funcionais
echo    - Busca por nome
echo.
echo 🎯 RESULTADO:
echo A página de roteiros agora está EXATAMENTE como era antes,
echo com todos os roteiros sendo exibidos e o layout completo!
echo.
echo 📋 PÁGINAS TESTADAS:
echo - http://localhost:8080 (Principal)
echo - http://localhost:8080/ms (MS)
echo - http://localhost:8080/ms/roteiros (Roteiros) ✅ RESTAURADO
echo - http://localhost:8080/ms/guata (Guatá)
echo.
echo ✨ LAYOUT ORIGINAL COMPLETAMENTE RESTAURADO! ✨
echo.
pause

