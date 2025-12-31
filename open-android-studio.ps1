# Open Android Studio Script for BuzzIt
# This script helps open the Android project in Android Studio

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BuzzIt - Open in Android Studio" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Determine Android project path
$androidPath = Join-Path $PSScriptRoot "android"
if (-not (Test-Path $androidPath)) {
    $androidPath = Join-Path $PSScriptRoot "BuzzIt\android"
}

if (-not (Test-Path $androidPath)) {
    Write-Host "Error: Android project not found!" -ForegroundColor Red
    Write-Host "Expected locations:" -ForegroundColor Yellow
    Write-Host "  - $PSScriptRoot\android" -ForegroundColor Yellow
    Write-Host "  - $PSScriptRoot\BuzzIt\android" -ForegroundColor Yellow
    exit 1
}

Write-Host "Android project found at: $androidPath" -ForegroundColor Green
Write-Host ""

# Check for local.properties
$localPropsPath = Join-Path $androidPath "local.properties"
if (-not (Test-Path $localPropsPath)) {
    Write-Host "Creating local.properties..." -ForegroundColor Yellow
    $sdkPath = $env:ANDROID_HOME
    if (-not $sdkPath) {
        $sdkPath = "$env:LOCALAPPDATA\Android\Sdk"
    }
    
    if (Test-Path $sdkPath) {
        $content = "sdk.dir=$($sdkPath.Replace('\', '\\'))`n"
        Set-Content -Path $localPropsPath -Value $content
        Write-Host "  ✓ Created local.properties" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ SDK path not found. Please set ANDROID_HOME or edit local.properties manually." -ForegroundColor Yellow
    }
}

# Try to find Android Studio
$studioPaths = @(
    "C:\Program Files\Android\Android Studio\bin\studio64.exe",
    "C:\Program Files (x86)\Android\Android Studio\bin\studio64.exe",
    "$env:LOCALAPPDATA\Programs\Android\Android Studio\bin\studio64.exe",
    "$env:ProgramFiles\Android\Android Studio\bin\studio64.exe"
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
    Write-Host "  Project: $androidPath" -ForegroundColor Gray
    Write-Host ""
    
    Start-Process -FilePath $studioExe -ArgumentList $androidPath
    
    Write-Host "✓ Android Studio should be opening now!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Wait for Gradle sync to complete" -ForegroundColor White
    Write-Host "  2. Connect your Android device or start an emulator" -ForegroundColor White
    Write-Host "  3. Click Run button (▶️) or press Shift+F10" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "Android Studio not found in common locations." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please open Android Studio manually:" -ForegroundColor Cyan
    Write-Host "  1. Launch Android Studio" -ForegroundColor White
    Write-Host "  2. Click File → Open" -ForegroundColor White
    Write-Host "  3. Navigate to: $androidPath" -ForegroundColor White
    Write-Host "  4. Select the 'android' folder and click OK" -ForegroundColor White
    Write-Host ""
    Write-Host "Or try opening from File Explorer:" -ForegroundColor Cyan
    Write-Host "  Right-click on: $androidPath" -ForegroundColor White
    Write-Host "  Select 'Open in Android Studio'" -ForegroundColor White
    Write-Host ""
}

Write-Host "For detailed instructions, see: DEPLOY_ANDROID_STUDIO.md" -ForegroundColor Gray



