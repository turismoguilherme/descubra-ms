@echo off
echo Testando aplicacao...
npm run build
if %errorlevel% equ 0 (
    echo Build OK! Iniciando servidor...
    start http://localhost:5173
    npm run dev
) else (
    echo Build falhou!
)
pause











