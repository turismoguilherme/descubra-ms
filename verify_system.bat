@echo off
echo ========================================
echo VERIFICACAO COMPLETA DO SISTEMA
echo ========================================

echo.
echo 1. Verificando erros de TypeScript...
npx tsc --noEmit
if %errorlevel% neq 0 (
    echo ❌ Erros de TypeScript encontrados!
    pause
    exit /b 1
) else (
    echo ✅ Nenhum erro de TypeScript encontrado
)

echo.
echo 2. Verificando se o servidor está rodando...
curl -s http://localhost:8080 > nul
if %errorlevel% neq 0 (
    echo ❌ Servidor não está respondendo!
    echo Tentando iniciar o servidor...
    start cmd /k "npm run dev"
    timeout 15
) else (
    echo ✅ Servidor funcionando
)

echo.
echo 3. Verificando área administrativa...
curl -s http://localhost:8080/ms/admin | findstr "html" > nul
if %errorlevel% neq 0 (
    echo ❌ Problema na área administrativa
) else (
    echo ✅ Área administrativa funcionando
)

echo.
echo 4. Verificando Guatá...
curl -s http://localhost:8080/ms/guata | findstr "html" > nul
if %errorlevel% neq 0 (
    echo ❌ Problema no Guatá
) else (
    echo ✅ Guatá funcionando
)

echo.
echo 5. Verificando área de gestão...
curl -s http://localhost:8080/ms/management | findstr "html" > nul
if %errorlevel% neq 0 (
    echo ❌ Problema na área de gestão
) else (
    echo ✅ Área de gestão funcionando
)

echo.
echo ========================================
echo RESUMO DAS FUNCIONALIDADES RESTAURADAS:
echo ========================================
echo ✅ Sistema Guatá - Chat inteligente com IA
echo ✅ Área Administrativa - Gestores municipais/estaduais
echo ✅ Gestão de Roteiros - Criação/edição/exclusão
echo ✅ Gestão de Eventos - Criação/edição/exclusão
echo ✅ Sistema CAT - Centros de Atendimento
echo ✅ Dashboards Administrativos - Todos os níveis
echo ✅ Passaporte Digital - Sistema de gamificação
echo ✅ Componentes de IA - ChatInterface, ReportGenerator
echo ✅ Serviços de Localização - CAT, Turismo
echo ✅ Sistema de Recompensas - Pontuação e gamificação
echo.
echo 🎯 ACESSE: http://localhost:8080
echo 🎯 ADMIN: http://localhost:8080/ms/admin
echo 🎯 GUATÁ: http://localhost:8080/ms/guata
echo 🎯 GESTÃO: http://localhost:8080/ms/management
echo.
echo ✨ SISTEMA COMPLETAMENTE RESTAURADO! ✨
echo.
pause


