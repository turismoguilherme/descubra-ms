@echo off
echo Fazendo commit da atualizacao da logo...
git add .
git commit -m "feat: atualizar logo do Descubra MS para nova versao com torre do relogio e arara azul"
echo.
echo Fazendo push para o repositorio remoto...
git push origin feature/overflow-one-partners-safe
echo.
echo Atualizacao da logo concluida e enviada para o repositorio remoto!
pause
