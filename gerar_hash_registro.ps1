# Script para gerar hash SHA-256 do código-fonte para registro no INPI
# Exclui arquivos desnecessários (node_modules, dist, etc.)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Gerador de Hash SHA-256 para Registro" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Nome do arquivo ZIP
$zipFile = "codigo-fonte-registro.zip"
$hashFile = "hash-sha256.txt"
$tempDir = "temp-codigo-fonte"

# Limpar arquivos anteriores
if (Test-Path $zipFile) {
    Remove-Item $zipFile -Force
}
if (Test-Path $hashFile) {
    Remove-Item $hashFile -Force
}
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}

Write-Host "Copiando código-fonte (excluindo arquivos desnecessários)..." -ForegroundColor Green

# Criar diretório temporário
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copiar arquivos importantes, excluindo os desnecessários
$excludeDirs = @("node_modules", "dist", ".git", ".vscode", "Nova pasta", "temp-codigo-fonte")
$excludeFiles = @("*.log", "*.lock", "bun.lockb", "package-lock.json", "*.bat", "*.ps1", "*.md")

Get-ChildItem -Path . -Recurse | Where-Object {
    $item = $_
    $shouldExclude = $false
    
    # Verificar se está em diretório excluído
    foreach ($excludeDir in $excludeDirs) {
        if ($item.FullName -like "*\$excludeDir\*" -or $item.FullName -like "*\$excludeDir") {
            $shouldExclude = $true
            break
        }
    }
    
    # Verificar se é arquivo excluído
    if (-not $item.PSIsContainer) {
        foreach ($pattern in $excludeFiles) {
            if ($item.Name -like $pattern) {
                $shouldExclude = $true
                break
            }
        }
    }
    
    -not $shouldExclude
} | ForEach-Object {
    $relativePath = $_.FullName.Substring((Get-Location).Path.Length + 1)
    $destPath = Join-Path $tempDir $relativePath
    $destDir = Split-Path $destPath -Parent
    
    if (-not (Test-Path $destDir)) {
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    }
    
    if (-not $_.PSIsContainer) {
        Copy-Item $_.FullName -Destination $destPath -Force
    }
}

Write-Host "Compactando código-fonte..." -ForegroundColor Green

# Criar ZIP
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipFile -Force

# Contar arquivos
$fileCount = (Get-ChildItem -Path $tempDir -Recurse -File).Count
Write-Host "Arquivos compactados: $fileCount" -ForegroundColor Green
Write-Host ""

# Limpar diretório temporário
Remove-Item $tempDir -Recurse -Force

# Gerar hash SHA-256
Write-Host "Gerando hash SHA-256..." -ForegroundColor Green

$hash = Get-FileHash -Path $zipFile -Algorithm SHA256
$hashValue = $hash.Hash

# Salvar hash em arquivo
$hashValue | Out-File -FilePath $hashFile -Encoding UTF8 -NoNewline

Write-Host ""
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
Write-Host ""
Write-Host "Arquivo ZIP criado: $zipFile" -ForegroundColor Green
Write-Host "Hash salvo em: $hashFile" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANTE:" -ForegroundColor Red
Write-Host "- Use 'SHA-256 - Secure Hash Algorithm' no campo Algoritmo hash" -ForegroundColor White
Write-Host "- Use o hash acima no campo Resumo digital hash" -ForegroundColor White
Write-Host "- Guarde o arquivo ZIP para referência futura" -ForegroundColor White
Write-Host ""
