@echo off
echo Atualizando repositório da branch main...
cd /d "C:\Users\guilh\Descubra MS\descubra-ms"

echo.
echo 1. Fazendo fetch da branch main...
git fetch origin main

echo.
echo 2. Verificando diferenças...
git log --oneline HEAD..origin/main

echo.
echo 3. Fazendo merge da branch main...
git merge origin/main

echo.
echo 4. Verificando status final...
git status

echo.
echo Atualização concluída!
pause

