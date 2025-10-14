@echo off
echo Restaurando plataforma para o estado anterior...
echo.

echo 1. Salvando mudanças atuais em stash...
git stash push -m "backup antes da restauração - %date% %time%"

echo.
echo 2. Restaurando arquivos para o último commit...
git restore .

echo.
echo 3. Verificando status...
git status

echo.
echo 4. Testando se a aplicação compila...
npm run build

echo.
echo Restauração concluída!
echo Acesse: http://localhost:8094/parceiros-comerciais
echo.
pause
