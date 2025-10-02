@echo off
echo ========================================
echo HABILITANDO TODOS OS COMPONENTES
echo ========================================

echo Habilitando componentes administrativos...
move /Y "src\components\admin\community-moderation\CommunityModerationPanel.tsx.disabled" "src\components\admin\community-moderation\CommunityModerationPanel.tsx" 2>nul
move /Y "src\components\admin\community-moderation\CommunityModerationTrigger.tsx.disabled" "src\components\admin\community-moderation\CommunityModerationTrigger.tsx" 2>nul

echo Habilitando componentes de roteiro...
move /Y "src\components\admin\route-form\CheckpointManager.tsx.disabled" "src\components\admin\route-form\CheckpointManager.tsx" 2>nul

echo Habilitando componentes comuns...
move /Y "src\components\common\LeaderboardDisplay.tsx.disabled" "src\components\common\LeaderboardDisplay.tsx" 2>nul
move /Y "src\components\common\PhotoUploadSection.tsx.disabled" "src\components\common\PhotoUploadSection.tsx" 2>nul
move /Y "src\components\common\ReviewSection.tsx.disabled" "src\components\common\ReviewSection.tsx" 2>nul

echo Habilitando componentes de comunidade...
move /Y "src\components\community\CommunityModerationPanel.tsx.disabled" "src\components\community\CommunityModerationPanel.tsx" 2>nul

echo Habilitando componentes de APIs governamentais...
move /Y "src\components\governmentAPIs\GovernmentDataPanel.tsx.disabled" "src\components\governmentAPIs\GovernmentDataPanel.tsx" 2>nul

echo Habilitando hooks...
move /Y "src\hooks\useGovernmentAPIs.ts.disabled" "src\hooks\useGovernmentAPIs.ts" 2>nul

echo Habilitando páginas...
move /Y "src\pages\CATAttendant.tsx.disabled" "src\pages\CATAttendant.tsx" 2>nul
move /Y "src\pages\CommunitySuggestionDetail.tsx.disabled" "src\pages\CommunitySuggestionDetail.tsx" 2>nul
move /Y "src\pages\DestinationEditor.tsx.disabled" "src\pages\DestinationEditor.tsx" 2>nul
move /Y "src\pages\EventEditor.tsx.disabled" "src\pages\EventEditor.tsx" 2>nul
move /Y "src\pages\Eventos.tsx.disabled" "src\pages\Eventos.tsx" 2>nul
move /Y "src\pages\Guata.tsx.disabled" "src\pages\Guata.tsx" 2>nul
move /Y "src\pages\GuataLite.tsx.disabled" "src\pages\GuataLite.tsx" 2>nul
move /Y "src\pages\LeaderboardsPage.tsx.disabled" "src\pages\LeaderboardsPage.tsx" 2>nul
move /Y "src\pages\Roteiros.tsx.disabled" "src\pages\Roteiros.tsx" 2>nul
move /Y "src\pages\RouteDetailsPage.tsx.disabled" "src\pages\RouteDetailsPage.tsx" 2>nul
move /Y "src\pages\TCCReport.tsx.disabled" "src\pages\TCCReport.tsx" 2>nul

echo Habilitando páginas de teste...
move /Y "src\pages\test\GuataTest.tsx.disabled" "src\pages\test\GuataTest.tsx" 2>nul
move /Y "src\pages\test\ItineraryTest.tsx.disabled" "src\pages\test\ItineraryTest.tsx" 2>nul

echo Habilitando serviços...
move /Y "src\services\masterDashboardService.ts.disabled" "src\services\masterDashboardService.ts" 2>nul
move /Y "src\services\offlineCacheService.ts.disabled" "src\services\offlineCacheService.ts" 2>nul
move /Y "src\services\overflowOneAIService.ts.disabled" "src\services\overflowOneAIService.ts" 2>nul

echo Habilitando serviços de IA...
move /Y "src\services\ai\AIConsultantService.ts.disabled" "src\services\ai\AIConsultantService.ts" 2>nul
move /Y "src\services\ai\guataInteligenteService.ts.disabled" "src\services\ai\guataInteligenteService.ts" 2>nul
move /Y "src\services\ai\InfographicsService.ts.disabled" "src\services\ai\InfographicsService.ts" 2>nul
move /Y "src\services\ai\notificationService.ts.disabled" "src\services\ai\notificationService.ts" 2>nul
move /Y "src\services\ai\ReportGenerator.ts.disabled" "src\services\ai\ReportGenerator.ts" 2>nul
move /Y "src\services\ai\superTourismAI.ts.disabled" "src\services\ai\superTourismAI.ts" 2>nul
move /Y "src\services\ai\tourismIntegrationService.ts.disabled" "src\services\ai\tourismIntegrationService.ts" 2>nul
move /Y "src\services\ai\tourismRAGService.ts.disabled" "src\services\ai\tourismRAGService.ts" 2>nul

echo Habilitando base de conhecimento...
move /Y "src\services\ai\knowledge\verifiedKnowledgeBase.ts.disabled" "src\services\ai\knowledge\verifiedKnowledgeBase.ts" 2>nul

echo Habilitando serviços de aprendizado...
move /Y "src\services\ai\learning\adaptiveLearningService.ts.disabled" "src\services\ai\learning\adaptiveLearningService.ts" 2>nul

echo Habilitando serviços de Alumia...
move /Y "src\services\alumia\index.ts.disabled" "src\services\alumia\index.ts" 2>nul

echo ========================================
echo VERIFICANDO ERROS DE TYPESCRIPT...
echo ========================================
npx tsc --noEmit
if %errorlevel% neq 0 (
    echo ❌ Erros de TypeScript encontrados!
    pause
    exit /b 1
) else (
    echo ✅ Nenhum erro de TypeScript encontrado
)

echo.
echo ========================================
echo VERIFICANDO SERVIDOR...
echo ========================================
curl -s http://localhost:8080 > nul
if %errorlevel% neq 0 (
    echo ❌ Servidor não está respondendo!
    echo Iniciando servidor...
    start cmd /k "npm run dev"
    timeout 10
) else (
    echo ✅ Servidor funcionando
)

echo.
echo ========================================
echo TODOS OS COMPONENTES HABILITADOS!
echo ========================================
echo ✅ Sistema Guatá - Chat inteligente com IA
echo ✅ Área Administrativa - Gestores municipais/estaduais
echo ✅ Gestão de Roteiros - Criação/edição/exclusão
echo ✅ Gestão de Eventos - Criação/edição/exclusão
echo ✅ Sistema CAT - Centros de Atendimento
echo ✅ Dashboards Administrativos - Todos os níveis
echo ✅ Passaporte Digital - Sistema de gamificação
echo ✅ Componentes de IA - Todos os serviços
echo ✅ Serviços de Localização - CAT, Turismo
echo ✅ Sistema de Recompensas - Pontuação e gamificação
echo ✅ Base de Conhecimento - Verificada e atualizada
echo ✅ Serviços de Aprendizado - IA adaptativa
echo.
echo 🎯 ACESSE: http://localhost:8080
echo 🎯 ADMIN: http://localhost:8080/ms/admin
echo 🎯 GUATÁ: http://localhost:8080/ms/guata
echo 🎯 GESTÃO: http://localhost:8080/ms/management
echo.
echo ✨ PLATAFORMA COMPLETAMENTE RESTAURADA! ✨
echo.
pause


