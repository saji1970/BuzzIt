# Android SDK Local Setup Script
# This script helps set up and verify Android SDK components locally

Write-Host "=== Android SDK Local Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if Android SDK is already configured
$sdkPath = $env:ANDROID_HOME
if (-not $sdkPath) {
    $sdkPath = "$env:LOCALAPPDATA\Android\Sdk"
}

Write-Host "SDK Path: $sdkPath" -ForegroundColor Yellow

# Check for required components
Write-Host "`nChecking SDK components..." -ForegroundColor Cyan

$components = @{
    "platform-tools" = "$sdkPath\platform-tools"
    "build-tools" = "$sdkPath\build-tools"
    "platforms" = "$sdkPath\platforms"
    "ndk" = "$sdkPath\ndk"
    "cmdline-tools" = "$sdkPath\cmdline-tools"
}

$missing = @()
foreach ($component in $components.GetEnumerator()) {
    if (Test-Path $component.Value) {
        Write-Host "  ✓ $($component.Key)" -ForegroundColor Green
        if ($component.Key -eq "build-tools") {
            $versions = Get-ChildItem $component.Value -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name
            if ($versions) {
                Write-Host "    Versions: $($versions -join ', ')" -ForegroundColor Gray
            }
        }
        if ($component.Key -eq "platforms") {
            $versions = Get-ChildItem $component.Value -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name
            if ($versions) {
                Write-Host "    Installed: $($versions.Count) platform(s)" -ForegroundColor Gray
            }
        }
    } else {
        Write-Host "  ✗ $($component.Key) (missing)" -ForegroundColor Red
        $missing += $component.Key
    }
}

Write-Host ""

# Update local.properties if needed
$localPropsPath = "android\local.properties"
if (Test-Path $localPropsPath) {
    Write-Host "local.properties exists" -ForegroundColor Green
    $content = Get-Content $localPropsPath
    if ($content -notmatch "sdk\.dir") {
        Write-Host "Adding SDK path to local.properties..." -ForegroundColor Yellow
        Add-Content $localPropsPath "`nsdk.dir=$($sdkPath.Replace('\', '\\'))"
    }
} else {
    Write-Host "Creating local.properties..." -ForegroundColor Yellow
    $propsContent = @"
## This file must *NOT* be checked into Version Control Systems,
# as it contains information specific to your local configuration.
#
# Location of the SDK. This is only used by Gradle.
sdk.dir=$($sdkPath.Replace('\', '\\'))
"@
    Set-Content $localPropsPath $propsContent
}

# Check for required SDK versions
Write-Host "`nChecking required SDK versions..." -ForegroundColor Cyan

# Check for Android API 33 or 34 (commonly used)
$requiredApi = @("33", "34")
$installedPlatforms = Get-ChildItem "$sdkPath\platforms" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name
foreach ($api in $requiredApi) {
    $platform = "android-$api"
    if ($installedPlatforms -contains $platform) {
        Write-Host "  ✓ Android API $api" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Android API $api (recommended)" -ForegroundColor Yellow
    }
}

# Check for build-tools version
$buildToolsPath = "$sdkPath\build-tools"
if (Test-Path $buildToolsPath) {
    $buildToolsVersions = Get-ChildItem $buildToolsPath -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name
    if ($buildToolsVersions) {
        Write-Host "`nInstalled build-tools versions:" -ForegroundColor Cyan
        foreach ($version in $buildToolsVersions) {
            Write-Host "  - $version" -ForegroundColor Gray
        }
    }
}

Write-Host ""

# Instructions for installing missing components
if ($missing.Count -gt 0) {
    Write-Host "To install missing components:" -ForegroundColor Yellow
    Write-Host "1. Open Android Studio" -ForegroundColor White
    Write-Host "2. Go to Tools > SDK Manager" -ForegroundColor White
    Write-Host "3. Install the following:" -ForegroundColor White
    foreach ($item in $missing) {
        Write-Host "   - $item" -ForegroundColor Gray
    }
    Write-Host ""
    Write-Host "Or use command line:" -ForegroundColor Yellow
    Write-Host "  sdkmanager `"$($missing -join '`" `"')`"" -ForegroundColor Gray
}

Write-Host "`n=== Setup Complete ===" -ForegroundColor Cyan
Write-Host "SDK Location: $sdkPath" -ForegroundColor Green
Write-Host ""

