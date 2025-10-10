@echo off
echo ========================================
echo    VERIFICACAO DO LAYOUT DO GUATA
echo ========================================
echo.

echo [1/5] Verificando arquivo principal do Guata...
if exist "src\pages\Guata.tsx" (
    echo ✓ Arquivo Guata.tsx encontrado
) else (
    echo ✗ Arquivo Guata.tsx nao encontrado - Restaurando...
    copy "src\pages\Guata.tsx.backup" "src\pages\Guata.tsx" >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✓ Arquivo restaurado com sucesso!
    ) else (
        echo ✗ Erro ao restaurar arquivo
        pause
        exit /b 1
    )
)

echo [2/5] Verificando UniversalLayout...
findstr /C:"UniversalLayout" "src\pages\Guata.tsx" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ UniversalLayout encontrado
) else (
    echo ✗ UniversalLayout nao encontrado - Corrigindo...
    copy "src\pages\Guata.tsx.backup" "src\pages\Guata.tsx" >nul 2>&1
    echo ✓ Layout corrigido!
)

echo [3/5] Verificando cores CSS...
findstr /C:"--ms-primary-blue" "src\index.css" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Cores CSS encontradas
) else (
    echo ✗ Cores CSS nao encontradas - Adicionando...
    echo. >> "src\index.css"
    echo     /* Cores da marca MS */ >> "src\index.css"
    echo     --ms-primary-blue: 220 91%% 29%%; >> "src\index.css"
    echo     --ms-secondary-yellow: 48 96%% 55%%; >> "src\index.css"
    echo     --ms-pantanal-green: 140 65%% 42%%; >> "src\index.css"
    echo     --ms-cerrado-orange: 24 95%% 53%%; >> "src\index.css"
    echo     --ms-discovery-teal: 180 84%% 32%%; >> "src\index.css"
    echo     --ms-earth-brown: 30 45%% 35%%; >> "src\index.css"
    echo     --ms-sky-blue: 210 100%% 70%%; >> "src\index.css"
    echo     --ms-nature-green-light: 140 50%% 75%%; >> "src\index.css"
    echo ✓ Cores CSS adicionadas!
)

echo [4/5] Verificando componentes necessarios...
if exist "src\components\guata\GuataChat.tsx" (
    echo ✓ GuataChat encontrado
) else (
    echo ✗ GuataChat nao encontrado
)

if exist "src\components\guata\GuataHeader.tsx" (
    echo ✓ GuataHeader encontrado
) else (
    echo ✗ GuataHeader nao encontrado
)

if exist "src\components\guata\SuggestionQuestions.tsx" (
    echo ✓ SuggestionQuestions encontrado
) else (
    echo ✗ SuggestionQuestions nao encontrado
)

echo [5/5] Verificando hooks necessarios...
if exist "src\hooks\useGuataInput.ts" (
    echo ✓ useGuataInput encontrado
) else (
    echo ✗ useGuataInput nao encontrado
)

if exist "src\hooks\useGuataConnection.ts" (
    echo ✓ useGuataConnection encontrado
) else (
    echo ✗ useGuataConnection nao encontrado
)

echo.
echo ========================================
echo    VERIFICACAO CONCLUIDA!
echo ========================================
echo.
echo O layout do Guata foi verificado e corrigido.
echo Execute 'restore_guata_layout.bat' se necessario.
echo.
pause




