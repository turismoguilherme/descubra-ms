@echo off
echo ========================================
echo   TESTE COMPLETO - TODOS OS MODULOS
echo ========================================
echo.

echo [1/5] Verificando dependencias...
call npm list --depth=0 >nul 2>&1
if errorlevel 1 (
    echo ERRO: Dependencias nao instaladas. Execute: npm install
    pause
    exit /b 1
)
echo OK - Dependencias instaladas
echo.

echo [2/5] Executando build...
call npm run build
if errorlevel 1 (
    echo ERRO: Build falhou!
    pause
    exit /b 1
)
echo OK - Build concluido
echo.

echo [3/5] Executando testes automatizados...
call npm test -- --run
if errorlevel 1 (
    echo AVISO: Alguns testes falharam. Verifique os resultados acima.
) else (
    echo OK - Todos os testes passaram
)
echo.

echo [4/5] Verificando linter...
call npm run lint
if errorlevel 1 (
    echo AVISO: Alguns erros de lint encontrados. Verifique acima.
) else (
    echo OK - Sem erros de lint
)
echo.

echo [5/5] Gerando relatorio de cobertura...
call npm run test:coverage
echo.

echo ========================================
echo   TESTE COMPLETO FINALIZADO
echo ========================================
echo.
echo PROXIMOS PASSOS:
echo 1. Revise o checklist em TESTE_COMPLETO_PRE_DEPLOY.md
echo 2. Execute testes manuais conforme o documento
echo 3. Verifique se todos os modulos funcionam
echo 4. Aprove para deploy se tudo estiver OK
echo.
pause


