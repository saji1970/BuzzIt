# Fix Icons Script - Fixes Chinese characters showing instead of icons
# This script ensures react-native-vector-icons fonts are properly linked

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Fix Icons - React Native Vector Icons" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = $PSScriptRoot
$fontsSource = Join-Path $projectRoot "node_modules\react-native-vector-icons\Fonts"
$androidAssets = Join-Path $projectRoot "android\app\src\main\assets\fonts"

# Check if fonts source exists
if (-not (Test-Path $fontsSource)) {
    Write-Host "Error: Fonts source not found!" -ForegroundColor Red
    Write-Host "Location: $fontsSource" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please run: npm install react-native-vector-icons" -ForegroundColor Yellow
    exit 1
}

Write-Host "[1/3] Checking fonts source..." -ForegroundColor Yellow
$fontFiles = Get-ChildItem $fontsSource -Filter "*.ttf" -ErrorAction SilentlyContinue
Write-Host "  Found $($fontFiles.Count) font files" -ForegroundColor Green
Write-Host ""

# Create assets/fonts directory if it doesn't exist
Write-Host "[2/3] Setting up Android assets directory..." -ForegroundColor Yellow
if (-not (Test-Path $androidAssets)) {
    New-Item -ItemType Directory -Path $androidAssets -Force | Out-Null
    Write-Host "  Created directory: $androidAssets" -ForegroundColor Green
} else {
    Write-Host "  Directory exists: $androidAssets" -ForegroundColor Green
}
Write-Host ""

# Copy fonts to Android assets
Write-Host "[3/3] Copying fonts to Android assets..." -ForegroundColor Yellow
try {
    Copy-Item -Path "$fontsSource\*.ttf" -Destination $androidAssets -Force
    $copiedCount = (Get-ChildItem $androidAssets -Filter "*.ttf" -ErrorAction SilentlyContinue).Count
    Write-Host "  Copied $copiedCount font files" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  Icons Fixed Successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Clean and rebuild the app in Android Studio:" -ForegroundColor White
    Write-Host "     - Build -> Clean Project" -ForegroundColor Gray
    Write-Host "     - Build -> Rebuild Project" -ForegroundColor Gray
    Write-Host "  2. Or from command line:" -ForegroundColor White
    Write-Host "     cd android" -ForegroundColor Gray
    Write-Host "     .\gradlew.bat clean" -ForegroundColor Gray
    Write-Host "     .\gradlew.bat assembleDebug" -ForegroundColor Gray
    Write-Host "  3. Reinstall the app on your device" -ForegroundColor White
    Write-Host ""
} catch {
    $errorMsg = $_.Exception.Message
    Write-Host "  Error copying fonts: $errorMsg" -ForegroundColor Red
    exit 1
}
