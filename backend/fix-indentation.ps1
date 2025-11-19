# Fix Indentation and Coding Style
# This script converts all tabs to 4 spaces for consistency

Write-Host "Fixing code style and indentation..." -ForegroundColor Green

# JavaScript Files
$jsFiles = @(
    "public\js\account.js",
    "public\js\contractor.js"
)

# PHP Files
$phpFiles = @(
    "app\Http\Controllers\contractor\cprocessController.php"
)

foreach ($file in $jsFiles) {
    $fullPath = Join-Path $PSScriptRoot $file
    if (Test-Path $fullPath) {
        Write-Host "Processing: $file" -ForegroundColor Yellow
        $content = Get-Content $fullPath -Raw
        $fixed = $content -replace "`t", "    "
        Set-Content $fullPath -Value $fixed -NoNewline
        Write-Host "  ✓ Fixed tabs to spaces" -ForegroundColor Green
    }
}

foreach ($file in $phpFiles) {
    $fullPath = Join-Path $PSScriptRoot $file
    if (Test-Path $fullPath) {
        Write-Host "Processing: $file" -ForegroundColor Yellow
        $content = Get-Content $fullPath -Raw
        $fixed = $content -replace "`t", "    "
        Set-Content $fullPath -Value $fixed -NoNewline
        Write-Host "  ✓ Fixed tabs to spaces" -ForegroundColor Green
    }
}

Write-Host "`nAll files processed successfully!" -ForegroundColor Green
Write-Host "Coding style is now consistent across all files." -ForegroundColor Cyan
