@echo off
echo ========================================
echo    TESTE DO SISTEMA DE PROTECAO
echo ========================================
echo.

echo [1/6] Verificando arquivo de backup...
if exist "src\pages\Guata.tsx.backup" (
    echo ✓ Backup encontrado
) else (
    echo ✗ Backup nao encontrado - Criando...
    copy "src\pages\Guata.tsx" "src\pages\Guata.tsx.backup" >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✓ Backup criado com sucesso!
    ) else (
        echo ✗ Erro ao criar backup
        pause
        exit /b 1
    )
)

echo [2/6] Verificando sistema de protecao...
if exist "src\utils\guataLayoutProtection.ts" (
    echo ✓ Sistema de protecao encontrado
) else (
    echo ✗ Sistema de protecao nao encontrado
    pause
    exit /b 1
)

echo [3/6] Verificando integracao no componente...
findstr /C:"initGuataProtection" "src\pages\Guata.tsx" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Integracao encontrada
) else (
    echo ✗ Integracao nao encontrada
    pause
    exit /b 1
)

echo [4/6] Verificando data-testid...
findstr /C:"data-testid" "src\pages\Guata.tsx" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Data-testid encontrado
) else (
    echo ✗ Data-testid nao encontrado
    pause
    exit /b 1
)

echo [5/6] Verificando cores CSS...
findstr /C:"--ms-primary-blue" "src\index.css" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Cores CSS encontradas
) else (
    echo ✗ Cores CSS nao encontradas
    pause
    exit /b 1
)

echo [6/6] Verificando scripts de restauracao...
if exist "restore_guata_layout.bat" (
    echo ✓ Script de restauracao encontrado
) else (
    echo ✗ Script de restauracao nao encontrado
)

if exist "verify_guata_layout.bat" (
    echo ✓ Script de verificacao encontrado
) else (
    echo ✗ Script de verificacao nao encontrado
)

echo.
echo ========================================
echo    TESTE CONCLUIDO!
echo ========================================
echo.
echo Sistema de protecao do Guata verificado.
echo Execute 'restore_guata_layout.bat' se necessario.
echo.
pause




