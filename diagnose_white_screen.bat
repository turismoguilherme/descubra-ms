@echo off
echo ========================================
echo DIAGNOSTICANDO TELA BRANCA
echo ========================================

echo.
echo 1. Aguardando servidor inicializar...
timeout 10

echo.
echo 2. Testando página principal...
curl -s http://localhost:8080/ > temp_main.html
if %errorlevel% neq 0 (
    echo ❌ Página principal não está respondendo
) else (
    echo ✅ Página principal respondendo
    findstr "root" temp_main.html
)

echo.
echo 3. Testando página MS...
curl -s http://localhost:8080/ms > temp_ms.html
if %errorlevel% neq 0 (
    echo ❌ Página MS não está respondendo
) else (
    echo ✅ Página MS respondendo
    findstr "root" temp_ms.html
)

echo.
echo 4. Testando página de roteiros...
curl -s http://localhost:8080/ms/roteiros > temp_roteiros.html
if %errorlevel% neq 0 (
    echo ❌ Página de roteiros não está respondendo
) else (
    echo ✅ Página de roteiros respondendo
    findstr "root" temp_roteiros.html
)

echo.
echo 5. Verificando se há conteúdo React...
findstr "Roteiros MS" temp_roteiros.html
if %errorlevel% neq 0 (
    echo ❌ Conteúdo React não está sendo renderizado
) else (
    echo ✅ Conteúdo React encontrado
)

echo.
echo 6. Limpando arquivos temporários...
del temp_*.html 2>nul

echo.
echo ========================================
echo DIAGNÓSTICO CONCLUÍDO
echo ========================================
echo.
echo Se a tela está branca, o problema pode ser:
echo 1. Erro de JavaScript no console do navegador
echo 2. Problema com imports ou dependências
echo 3. Erro de sintaxe no componente React
echo 4. Problema com o roteamento
echo.
echo Para resolver:
echo 1. Abra o console do navegador (F12)
echo 2. Verifique se há erros em vermelho
echo 3. Acesse http://localhost:8080/ms/roteiros
echo 4. Verifique se há erros de JavaScript
echo.
pause
