# Script para atualizar da branch main
Write-Host "Iniciando atualização da branch main..." -ForegroundColor Green

# Navegar para o diretório do projeto
Set-Location "C:\Users\guilh\Descubra MS\descubra-ms"

# Verificar se estamos no diretório correto
Write-Host "Diretório atual: $(Get-Location)" -ForegroundColor Yellow

# Fazer fetch da branch main
Write-Host "Fazendo fetch da branch main..." -ForegroundColor Cyan
git fetch origin main

# Verificar se há atualizações
Write-Host "Verificando diferenças..." -ForegroundColor Cyan
$differences = git log --oneline HEAD..origin/main
if ($differences) {
    Write-Host "Encontradas atualizações na branch main:" -ForegroundColor Yellow
    Write-Host $differences -ForegroundColor White
    
    # Fazer merge
    Write-Host "Fazendo merge da branch main..." -ForegroundColor Cyan
    git merge origin/main
    
    Write-Host "Merge concluído!" -ForegroundColor Green
} else {
    Write-Host "Não há atualizações na branch main." -ForegroundColor Yellow
}

# Verificar status final
Write-Host "Status final:" -ForegroundColor Cyan
git status

Write-Host "Atualização concluída!" -ForegroundColor Green
Read-Host "Pressione Enter para continuar"

