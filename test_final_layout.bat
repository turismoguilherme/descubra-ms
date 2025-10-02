@echo off
echo ========================================
echo TESTE FINAL - LAYOUT ORIGINAL RESTAURADO
echo ========================================

echo.
echo 1. Verificando TypeScript...
npx tsc --noEmit
if %errorlevel% neq 0 (
    echo ❌ Erros de TypeScript encontrados!
    pause
    exit /b 1
) else (
    echo ✅ Nenhum erro de TypeScript
)

echo.
echo 2. Testando página principal...
curl -s http://localhost:8080/ | findstr "root"
if %errorlevel% neq 0 (
    echo ❌ Página principal não está respondendo
) else (
    echo ✅ Página principal funcionando
)

echo.
echo 3. Testando página MS...
curl -s http://localhost:8080/ms | findstr "root"
if %errorlevel% neq 0 (
    echo ❌ Página MS não está respondendo
) else (
    echo ✅ Página MS funcionando
)

echo.
echo 4. Testando página de roteiros...
curl -s http://localhost:8080/ms/roteiros | findstr "root"
if %errorlevel% neq 0 (
    echo ❌ Página de roteiros não está respondendo
) else (
    echo ✅ Página de roteiros respondendo
)

echo.
echo 5. Verificando se há conteúdo React...
curl -s http://localhost:8080/ms/roteiros | findstr "Roteiros"
if %errorlevel% neq 0 (
    echo ❌ Conteúdo React não está sendo renderizado
    echo.
    echo POSSÍVEIS SOLUÇÕES:
    echo 1. Abra o navegador em http://localhost:8080/ms/roteiros
    echo 2. Pressione F12 para abrir o console
    echo 3. Verifique se há erros em vermelho
    echo 4. Se houver erros, copie e cole aqui
    echo.
    echo O problema pode estar em:
    echo - Erro de JavaScript no console
    echo - Problema com imports
    echo - Erro de sintaxe no componente
    echo - Problema com o roteamento
) else (
    echo ✅ Conteúdo React encontrado
)

echo.
echo ========================================
echo TESTE CONCLUÍDO
echo ========================================
echo.
echo Para verificar o layout:
echo 1. Acesse http://localhost:8080/ms/roteiros
echo 2. Se a tela estiver branca, abra o console (F12)
echo 3. Verifique se há erros em vermelho
echo 4. Me informe os erros encontrados
echo.
pause
