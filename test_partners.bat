@echo off
echo Testando funcionalidade de parceiros comerciais...
echo.

echo Verificando se os arquivos existem:
if exist "src\pages\ParceirosComerciais.tsx" (
    echo ✓ ParceirosComerciais.tsx encontrado
) else (
    echo ✗ ParceirosComerciais.tsx NÃO encontrado
)

if exist "src\components\commercial\CommercialPartnerForm.tsx" (
    echo ✓ CommercialPartnerForm.tsx encontrado
) else (
    echo ✗ CommercialPartnerForm.tsx NÃO encontrado
)

if exist "src\components\commercial\CommercialPartnerDashboard.tsx" (
    echo ✓ CommercialPartnerDashboard.tsx encontrado
) else (
    echo ✗ CommercialPartnerDashboard.tsx NÃO encontrado
)

if exist "src\hooks\useCommercialPartners.tsx" (
    echo ✓ useCommercialPartners.tsx encontrado
) else (
    echo ✗ useCommercialPartners.tsx NÃO encontrado
)

echo.
echo Verificando rotas no App.tsx:
findstr /n "ParceirosComerciais" src\App.tsx
echo.

echo Teste concluído!
pause
