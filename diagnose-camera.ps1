# Comprehensive camera diagnostics for Windows
Write-Host "=== Camera Diagnostics ===" -ForegroundColor Cyan

# Check if camera exists in Device Manager
Write-Host "`n1. Checking Device Manager for cameras..." -ForegroundColor Yellow
$cameras = Get-PnpDevice | Where-Object {
    $_.Class -eq 'Camera' -or
    $_.Class -eq 'Image' -or
    $_.FriendlyName -match 'camera|webcam'
}

if ($cameras) {
    Write-Host "Found camera devices:" -ForegroundColor Green
    $cameras | Select-Object FriendlyName, Status, InstanceId | Format-List
} else {
    Write-Host "No camera devices found in Device Manager!" -ForegroundColor Red
}

# Check camera privacy settings
Write-Host "`n2. Checking Windows Camera Privacy Settings..." -ForegroundColor Yellow
$cameraAccess = Get-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\webcam" -ErrorAction SilentlyContinue
if ($cameraAccess) {
    Write-Host "Camera Access Value: $($cameraAccess.Value)" -ForegroundColor Cyan
    if ($cameraAccess.Value -eq "Deny") {
        Write-Host "WARNING: Camera access is DENIED at Windows level!" -ForegroundColor Red
        Write-Host "Fix: Go to Settings > Privacy > Camera and enable camera access" -ForegroundColor Yellow
    } elseif ($cameraAccess.Value -eq "Allow") {
        Write-Host "Camera access is ALLOWED at Windows level" -ForegroundColor Green
    }
}

# Check browser-specific camera access
Write-Host "`n3. Checking Browser Camera Access..." -ForegroundColor Yellow
$chromePerms = Test-Path "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Preferences"
if ($chromePerms) {
    Write-Host "Chrome user data found - check chrome://settings/content/camera" -ForegroundColor Cyan
}

# Check for camera service
Write-Host "`n4. Checking Windows Camera Services..." -ForegroundColor Yellow
$cameraService = Get-Service -Name "FrameServer" -ErrorAction SilentlyContinue
if ($cameraService) {
    Write-Host "Windows Camera Frame Server: $($cameraService.Status)" -ForegroundColor Cyan
    if ($cameraService.Status -ne "Running") {
        Write-Host "WARNING: Camera service is not running!" -ForegroundColor Red
        Write-Host "Try: Start-Service FrameServer" -ForegroundColor Yellow
    }
}

Write-Host "`n=== Common Fixes ===" -ForegroundColor Cyan
Write-Host "1. Restart Windows Camera Frame Server: Restart-Service FrameServer" -ForegroundColor White
Write-Host "2. Check Windows Privacy Settings: Start ms-settings:privacy-webcam" -ForegroundColor White
Write-Host "3. Update camera drivers in Device Manager" -ForegroundColor White
Write-Host "4. Restart your computer" -ForegroundColor White
Write-Host "5. Try a different browser" -ForegroundColor White
