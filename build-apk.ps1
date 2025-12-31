# Build APK Script for BuzzIt
# This script cleans and builds a release APK

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BuzzIt - Clean Build APK Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to android directory
$androidDir = Join-Path $PSScriptRoot "android"
if (-not (Test-Path $androidDir)) {
    Write-Host "Error: android directory not found!" -ForegroundColor Red
    exit 1
}

Set-Location $androidDir

# Step 1: Clean build directories
Write-Host "[1/3] Cleaning build directories..." -ForegroundColor Yellow
if (Test-Path "app\build") {
    Remove-Item -Recurse -Force "app\build"
    Write-Host "  ✓ Removed app\build" -ForegroundColor Green
}
if (Test-Path "build") {
    Remove-Item -Recurse -Force "build"
    Write-Host "  ✓ Removed build" -ForegroundColor Green
}
if (Test-Path ".gradle") {
    Remove-Item -Recurse -Force ".gradle"
    Write-Host "  ✓ Removed .gradle cache" -ForegroundColor Green
}
Write-Host "  Build cleaned successfully!" -ForegroundColor Green
Write-Host ""

# Step 2: Check for gradle wrapper
Write-Host "[2/3] Checking Gradle wrapper..." -ForegroundColor Yellow
if (-not (Test-Path "gradlew.bat")) {
    Write-Host "  ⚠ Gradle wrapper not found!" -ForegroundColor Yellow
    Write-Host "  Attempting to generate wrapper..." -ForegroundColor Yellow
    
    # Try to use npx to run gradle
    $gradleCheck = Get-Command gradle -ErrorAction SilentlyContinue
    if ($gradleCheck) {
        gradle wrapper --gradle-version=7.5.1
    } else {
        Write-Host "  ✗ Gradle not found. Please install Gradle or use Android Studio." -ForegroundColor Red
        Write-Host ""
        Write-Host "Alternative: Use Android Studio to build the APK:" -ForegroundColor Yellow
        Write-Host "  1. Open Android Studio" -ForegroundColor White
        Write-Host "  2. Open the 'android' folder" -ForegroundColor White
        Write-Host "  3. Build > Build Bundle(s) / APK(s) > Build APK(s)" -ForegroundColor White
        exit 1
    }
} else {
    Write-Host "  ✓ Gradle wrapper found" -ForegroundColor Green
}
Write-Host ""

# Step 3: Build APK
Write-Host "[3/3] Building Release APK..." -ForegroundColor Yellow
Write-Host "  This may take several minutes..." -ForegroundColor Gray
Write-Host ""

try {
    # Build release APK
    .\gradlew.bat clean assembleRelease
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "  ✓ APK Build Successful!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        
        $apkPath = Join-Path $androidDir "app\build\outputs\apk\release\app-release.apk"
        if (Test-Path $apkPath) {
            $apkSize = (Get-Item $apkPath).Length / 1MB
            Write-Host "APK Location: $apkPath" -ForegroundColor Cyan
            Write-Host "APK Size: $([math]::Round($apkSize, 2)) MB" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "You can now install this APK on your Android device!" -ForegroundColor Green
        } else {
            Write-Host "Warning: APK file not found at expected location" -ForegroundColor Yellow
            Write-Host "Expected: $apkPath" -ForegroundColor Yellow
        }
    } else {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Red
        Write-Host "  ✗ Build Failed!" -ForegroundColor Red
        Write-Host "========================================" -ForegroundColor Red
        Write-Host "Check the error messages above for details." -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "Error during build: $_" -ForegroundColor Red
    exit 1
} finally {
    # Return to original directory
    Set-Location $PSScriptRoot
}



