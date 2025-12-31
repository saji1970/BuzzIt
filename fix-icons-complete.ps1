# Complete Icon Fix Script - Fixes crossed-out boxes for icons

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Complete Icon Fix - React Native Vector Icons" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = $PSScriptRoot
$fontsSource = Join-Path $projectRoot "node_modules\react-native-vector-icons\Fonts"
$androidAssets = Join-Path $projectRoot "android\app\src\main\assets\fonts"

# Step 1: Verify fonts source
Write-Host "[1/5] Checking fonts source..." -ForegroundColor Yellow
if (-not (Test-Path $fontsSource)) {
    Write-Host "  Error: Fonts source not found!" -ForegroundColor Red
    Write-Host "  Please run: npm install react-native-vector-icons" -ForegroundColor Yellow
    exit 1
}
$fontFiles = Get-ChildItem $fontsSource -Filter "*.ttf" -ErrorAction SilentlyContinue
Write-Host "  Found $($fontFiles.Count) font files" -ForegroundColor Green
Write-Host ""

# Step 2: Ensure assets/fonts directory exists
Write-Host "[2/5] Setting up Android assets directory..." -ForegroundColor Yellow
if (-not (Test-Path $androidAssets)) {
    New-Item -ItemType Directory -Path $androidAssets -Force | Out-Null
    Write-Host "  Created directory" -ForegroundColor Green
} else {
    Write-Host "  Directory exists" -ForegroundColor Green
}
Write-Host ""

# Step 3: Copy fonts
Write-Host "[3/5] Copying fonts to Android assets..." -ForegroundColor Yellow
try {
    Copy-Item -Path "$fontsSource\*.ttf" -Destination $androidAssets -Force
    $copiedCount = (Get-ChildItem $androidAssets -Filter "*.ttf" -ErrorAction SilentlyContinue).Count
    Write-Host "  Copied $copiedCount font files" -ForegroundColor Green
} catch {
    Write-Host "  Error copying fonts: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 4: Clear Metro bundler cache
Write-Host "[4/5] Clearing Metro bundler cache..." -ForegroundColor Yellow
$metroCache = Join-Path $projectRoot "node_modules\.cache"
if (Test-Path $metroCache) {
    Remove-Item -Path $metroCache -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  Cleared Metro cache" -ForegroundColor Green
} else {
    Write-Host "  No Metro cache found" -ForegroundColor Gray
}
Write-Host ""

# Step 5: Clean Android build
Write-Host "[5/5] Cleaning Android build..." -ForegroundColor Yellow
$androidPath = Join-Path $projectRoot "android"
if (Test-Path "$androidPath\gradlew.bat") {
    Push-Location $androidPath
    try {
        .\gradlew.bat clean 2>&1 | Out-Null
        Write-Host "  Android build cleaned" -ForegroundColor Green
    } catch {
        Write-Host "  Warning: Could not run gradlew clean" -ForegroundColor Yellow
    }
    Pop-Location
} else {
    Write-Host "  gradlew.bat not found - will need manual clean" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "  Icon Fix Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "CRITICAL: You MUST do a complete rebuild:" -ForegroundColor Yellow
Write-Host ""
Write-Host "In Android Studio:" -ForegroundColor Cyan
Write-Host "  1. Build -> Clean Project" -ForegroundColor White
Write-Host "  2. Build -> Rebuild Project" -ForegroundColor White
Write-Host "  3. Uninstall the app from your device" -ForegroundColor White
Write-Host "  4. Run -> Run 'app' (fresh install)" -ForegroundColor White
Write-Host ""
Write-Host "Or from command line:" -ForegroundColor Cyan
Write-Host "  cd android" -ForegroundColor Gray
Write-Host "  .\gradlew.bat clean" -ForegroundColor Gray
Write-Host "  .\gradlew.bat assembleDebug" -ForegroundColor Gray
Write-Host "  adb uninstall com.buzzit.app" -ForegroundColor Gray
Write-Host "  .\gradlew.bat installDebug" -ForegroundColor Gray
Write-Host ""
Write-Host "IMPORTANT: Clear app data on device before reinstalling!" -ForegroundColor Yellow



