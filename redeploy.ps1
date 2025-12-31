# Redeploy App in Android Studio - Quick Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BuzzIt - Redeploy in Android Studio" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = $PSScriptRoot
$androidPath = Join-Path $projectRoot "android"

# Check if android directory exists
if (-not (Test-Path $androidPath)) {
    $androidPath = Join-Path $projectRoot "BuzzIt\android"
}

if (-not (Test-Path $androidPath)) {
    Write-Host "Error: Android project not found!" -ForegroundColor Red
    exit 1
}

Write-Host "Android project: $androidPath" -ForegroundColor Green
Write-Host ""

# Check for fonts
$fontsPath = Join-Path $androidPath "app\src\main\assets\fonts"
if (Test-Path $fontsPath) {
    $fontCount = (Get-ChildItem $fontsPath -Filter "*.ttf" -ErrorAction SilentlyContinue).Count
    Write-Host "✓ Fonts: $fontCount files" -ForegroundColor Green
} else {
    Write-Host "⚠ Fonts not found - run fix-icons.ps1 first" -ForegroundColor Yellow
}

Write-Host ""

# Try to open Android Studio
$studioPaths = @(
    "C:\Program Files\Android\Android Studio\bin\studio64.exe",
    "C:\Program Files (x86)\Android\Android Studio\bin\studio64.exe",
    "$env:LOCALAPPDATA\Programs\Android\Android Studio\bin\studio64.exe"
)

$studioExe = $null
foreach ($path in $studioPaths) {
    if (Test-Path $path) {
        $studioExe = $path
        break
    }
}

if ($studioExe) {
    Write-Host "Opening Android Studio..." -ForegroundColor Yellow
    Start-Process -FilePath $studioExe -ArgumentList $androidPath
    Write-Host ""
    Write-Host "✓ Android Studio opening..." -ForegroundColor Green
    Write-Host ""
    Write-Host "In Android Studio:" -ForegroundColor Cyan
    Write-Host "  1. Wait for Gradle sync" -ForegroundColor White
    Write-Host "  2. Build → Clean Project" -ForegroundColor White
    Write-Host "  3. Build → Rebuild Project" -ForegroundColor White
    Write-Host "  4. Run → Run 'app' (Shift+F10)" -ForegroundColor White
} else {
    Write-Host "Android Studio not found automatically." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please open manually:" -ForegroundColor Cyan
    Write-Host "  1. Launch Android Studio" -ForegroundColor White
    Write-Host "  2. File → Open" -ForegroundColor White
    Write-Host "  3. Navigate to: $androidPath" -ForegroundColor White
    Write-Host "  4. Select 'android' folder → OK" -ForegroundColor White
    Write-Host ""
}

Write-Host ""
Write-Host "For detailed instructions, see: REDEPLOY_ANDROID_STUDIO.md" -ForegroundColor Gray



