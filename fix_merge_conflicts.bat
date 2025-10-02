@echo off
echo Limpando conflitos de merge em todo o projeto...

REM Procurar e remover marcadores de conflito de merge
for /r src %%f in (*.ts *.tsx *.js *.jsx) do (
    echo Processando: %%f
    powershell -Command "(Get-Content '%%f') -replace '<<<<<<< HEAD.*?=======.*?>>>>>>> [a-f0-9]+', '' | Set-Content '%%f'"
    powershell -Command "(Get-Content '%%f') -replace '<<<<<<< HEAD', '' | Set-Content '%%f'"
    powershell -Command "(Get-Content '%%f') -replace '=======', '' | Set-Content '%%f'"
    powershell -Command "(Get-Content '%%f') -replace '>>>>>>> [a-f0-9]+', '' | Set-Content '%%f'"
)

echo Conflitos de merge removidos!
echo Limpando cache do Vite...
if exist node_modules\.vite rmdir /s /q node_modules\.vite

echo Cache limpo!
echo Reinstalando dependências...
npm install

echo Dependências reinstaladas!
echo Iniciando servidor...
npm run dev


