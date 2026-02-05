@echo off
echo ========================================
echo   FORCAR DEPLOY NO VERCEL
echo ========================================
echo.

echo [1/4] Verificando status do Git...
git status
echo.

echo [2/4] Fazendo commit vazio para trigger...
git commit --allow-empty -m "trigger: Forcar deploy Vercel - %date% %time%"
echo.

echo [3/4] Enviando para repositorio Vercel...
git push vercel main
echo.

echo [4/4] Enviando para repositorio Origin...
git push origin main
echo.

echo ========================================
echo   DEPLOY FORCADO - AGUARDE NO VERCEL
echo ========================================
echo.
echo Próximos passos:
echo 1. Acesse: https://vercel.com/dashboard
echo 2. Verifique se o deploy iniciou automaticamente
echo 3. Se não iniciar, faça deploy manual:
echo    - Vá em Deployments
echo    - Clique em "..." do último deployment
echo    - Selecione "Redeploy" (SEM cache)
echo.
pause

