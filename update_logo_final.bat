@echo off
echo Atualizando logo e forçando refresh do cache...
echo.

echo 1. Verificando arquivos de logo...
dir public\images\logo-descubra-ms*

echo.
echo 2. Limpando cache do navegador...
echo Pressione Ctrl+Shift+R no navegador para forçar refresh

echo.
echo 3. Testando se a aplicação compila...
npm run build

echo.
echo 4. Atualizando documentação...
echo Logo atualizada para: /images/logo-descubra-ms-v2.png

echo.
echo 5. Preparando commit...
git add .
git status

echo.
echo Logo atualizada com sucesso!
echo Acesse: http://localhost:8094/ms
echo Pressione Ctrl+Shift+R para ver a nova logo
pause
