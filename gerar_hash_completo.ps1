# Script para gerar hash SHA-256 da plataforma completa para registro no INPI
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Gerador de Hash SHA-256 - Plataforma Completa" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$zipFile = "codigo-fonte-completo.zip"
$hashFile = "hash-sha256-completo.txt"

# Remover arquivos anteriores
if (Test-Path $zipFile) {
    Remove-Item $zipFile -Force
    Write-Host "Arquivo ZIP anterior removido." -ForegroundColor Yellow
}
if (Test-Path $hashFile) {
    Remove-Item $hashFile -Force
}

Write-Host "Compactando plataforma completa..." -ForegroundColor Green
Write-Host "(Excluindo: node_modules, dist, .git, arquivos temporários)" -ForegroundColor Gray
Write-Host ""

# Lista de arquivos e pastas a incluir (código-fonte importante)
$includeItems = @(
    "src",
    "public",
    "supabase",
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "vite.config.ts",
    "tailwind.config.ts",
    "postcss.config.js",
    "eslint.config.js",
    "index.html",
    "README.md"
)

# Lista de exclusões
$excludePatterns = @(
    "node_modules",
    "dist",
    ".git",
    ".vscode",
    "*.log",
    "*.bat",
    "*.ps1",
    "temp*",
    "Nova pasta",
    ".env",
    ".env.local"
)

# Criar lista de arquivos para compactar
$filesToZip = @()

foreach ($item in $includeItems) {
    if (Test-Path $item) {
        if (Test-Path $item -PathType Container) {
            # É uma pasta
            Get-ChildItem -Path $item -Recurse -File | ForEach-Object {
                $shouldExclude = $false
                foreach ($pattern in $excludePatterns) {
                    if ($_.FullName -like "*\$pattern\*" -or $_.FullName -like "*\$pattern") {
                        $shouldExclude = $true
                        break
                    }
                }
                if (-not $shouldExclude) {
                    $filesToZip += $_
                }
            }
        } else {
            # É um arquivo
            $filesToZip += Get-Item $item
        }
    }
}

Write-Host "Arquivos encontrados: $($filesToZip.Count)" -ForegroundColor Green

# Criar ZIP usando Compress-Archive (mais simples)
$tempDir = "temp-zip-$(Get-Random)"
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

foreach ($file in $filesToZip) {
    $relativePath = $file.FullName.Substring((Get-Location).Path.Length + 1)
    $destPath = Join-Path $tempDir $relativePath
    $destDir = Split-Path $destPath -Parent
    
    if (-not (Test-Path $destDir)) {
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    }
    
    Copy-Item $file.FullName -Destination $destPath -Force
}

Write-Host "Criando arquivo ZIP..." -ForegroundColor Green
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipFile -Force

# Limpar diretório temporário
Remove-Item $tempDir -Recurse -Force

# Gerar hash SHA-256
Write-Host "Gerando hash SHA-256..." -ForegroundColor Green
$hash = Get-FileHash -Path $zipFile -Algorithm SHA256
$hashValue = $hash.Hash

# Salvar hash
$hashValue | Out-File -FilePath $hashFile -Encoding UTF8 -NoNewline

# Obter tamanho do arquivo
$fileSize = (Get-Item $zipFile).Length / 1MB

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
Write-Host "Arquivo ZIP: $zipFile ($([math]::Round($fileSize, 2)) MB)" -ForegroundColor Green
Write-Host "Hash salvo em: $hashFile" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANTE PARA O REGISTRO:" -ForegroundColor Red
Write-Host "1. Algoritmo hash: Selecione 'SHA-256 - Secure Hash Algorithm'" -ForegroundColor White
Write-Host "2. Resumo digital hash: Copie o hash acima" -ForegroundColor White
Write-Host "3. Guarde o arquivo ZIP para referência futura" -ForegroundColor White
Write-Host ""



