@echo off
echo Restaurando plataforma para ANTES dos parceiros comerciais...
echo.

echo 1. Salvando estado atual...
git stash push -m "estado atual antes da restauracao"

echo.
echo 2. Voltando para commit anterior aos parceiros...
git reset --hard a5766a4

echo.
echo 3. Verificando status...
git status

echo.
echo 4. Testando compilacao...
npm run build

echo.
echo RESTAURACAO CONCLUIDA!
echo A plataforma foi restaurada para o estado anterior aos parceiros comerciais.
echo.
echo Acesse: http://localhost:8094
echo.
pause
