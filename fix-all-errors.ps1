# Script para corrigir TODOS os arquivos restantes
$files = @()
$files += Get-ChildItem -Path "src/components" -Recurse -Include "*.tsx","*.ts" | 
    Select-String -Pattern 'catch\s*\(\s*error\s*:\s*any\s*\)' | 
    Select-Object -ExpandProperty Path -Unique
$files += Get-ChildItem -Path "src/hooks" -Recurse -Include "*.tsx","*.ts" | 
    Select-String -Pattern 'catch\s*\(\s*error\s*:\s*any\s*\)' | 
    Select-Object -ExpandProperty Path -Unique
$files += Get-ChildItem -Path "src/pages" -Recurse -Include "*.tsx","*.ts" | 
    Select-String -Pattern 'catch\s*\(\s*error\s*:\s*any\s*\)' | 
    Select-Object -ExpandProperty Path -Unique
$files = $files | Select-Object -Unique

$totalFiles = $files.Count
$processed = 0

foreach ($file in $files) {
    $processed++
    Write-Host "[$processed/$totalFiles] Processing: $file"
    
    if (Test-Path $file) {
        $content = Get-Content $file -Raw -Encoding UTF8
        
        # Substituir catch (error: any) por catch (error: unknown)
        $content = $content -replace 'catch\s*\(\s*error\s*:\s*any\s*\)', 'catch (error: unknown)'
        
        # Adicionar type guard após cada catch (error: unknown) que não tenha ainda
        # Padrão: catch (error: unknown) { seguido de console.error ou toast
        $content = $content -replace '(catch\s*\(\s*error\s*:\s*unknown\s*\)\s*\{)(\s*)(console\.error|toast|setError|throw)', '$1$2const err = error instanceof Error ? error : new Error(String(error));$2$3'
        
        # Substituir error.message por err.message (dentro de catch blocks)
        $content = $content -replace '(catch\s*\(\s*error\s*:\s*unknown\s*[^}]*?)(error\.message)', '$1err.message'
        
        # Substituir error.code por err.code (com type guard)
        $content = $content -replace '(catch\s*\(\s*error\s*:\s*unknown\s*[^}]*?)(error\.code)', '$1(err as { code?: string }).code'
        
        # Substituir error.name por err.name
        $content = $content -replace '(catch\s*\(\s*error\s*:\s*unknown\s*[^}]*?)(error\.name)', '$1err.name'
        
        # Substituir error.stack por err.stack
        $content = $content -replace '(catch\s*\(\s*error\s*:\s*unknown\s*[^}]*?)(error\.stack)', '$1err.stack'
        
        # Substituir error sozinho em console.error por err
        $content = $content -replace '(catch\s*\(\s*error\s*:\s*unknown\s*[^}]*?console\.error\([^,]*,\s*)error(\))', '$1err$2'
        
        Set-Content $file -Value $content -NoNewline -Encoding UTF8
    }
}

Write-Host "`nDone! Processed $totalFiles files."

