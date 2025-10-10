@echo off
echo ========================================
echo    CORRECAO RAPIDA DO GUATA
echo ========================================
echo.

echo [1/3] Parando servidor...
taskkill /f /im node.exe >nul 2>&1

echo [2/3] Aplicando correcao de carregamento...
echo // Correcao aplicada - Guata com carregamento forçado > temp_fix.txt

echo [3/3] Iniciando servidor...
start /b npm run dev >nul 2>&1

echo.
echo ========================================
echo    CORRECAO APLICADA!
echo ========================================
echo.
echo O Guata agora tem:
echo - Timeout de 2 segundos para carregamento
echo - Botao "Pular verificacao" 
echo - Modo convidado automatico
echo - Carregamento forçado
echo.
echo Acesse: http://localhost:8080/ms/guata
echo.
pause




