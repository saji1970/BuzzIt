# PowerShell script to check which processes are using the camera
Write-Host "Checking processes using camera devices..." -ForegroundColor Cyan

# Check for common video/camera processes
$videoProcesses = Get-Process | Where-Object {
    $_.ProcessName -match 'chrome|firefox|edge|brave|zoom|teams|skype|obs|streamlabs|camera'
}

if ($videoProcesses) {
    Write-Host "`nProcesses that might be using the camera:" -ForegroundColor Yellow
    $videoProcesses | Select-Object ProcessName, Id, StartTime | Format-Table -AutoSize
} else {
    Write-Host "`nNo obvious camera-using processes found." -ForegroundColor Green
}

Write-Host "`nTo free up the camera, close these applications or kill specific processes with:" -ForegroundColor Cyan
Write-Host "Stop-Process -Id <ProcessId>" -ForegroundColor White
