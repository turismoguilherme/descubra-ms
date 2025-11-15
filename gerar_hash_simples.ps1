# Script simples para gerar hash SHA-256 do código-fonte (pasta src)
Write-Host "Gerando hash SHA-256 do código-fonte..." -ForegroundColor Green
Write-Host ""

# Criar ZIP apenas da pasta src
$zipFile = "codigo-fonte-src.zip"
if (Test-Path $zipFile) {
    Remove-Item $zipFile -Force
}

Compress-Archive -Path "src\*" -DestinationPath $zipFile -Force

# Gerar hash
$hash = Get-FileHash -Path $zipFile -Algorithm SHA256
$hashValue = $hash.Hash

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RESULTADO PARA O REGISTRO NO INPI:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Algoritmo hash: SHA-256 - Secure Hash Algorithm" -ForegroundColor Yellow
Write-Host ""
Write-Host "Resumo digital hash:" -ForegroundColor Yellow
Write-Host $hashValue -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan


