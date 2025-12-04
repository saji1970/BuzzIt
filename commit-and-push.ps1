# PowerShell script to commit and push changes to GitHub
cd C:\BuzzIt\BuzzIt

Write-Host "=== Checking Git Status ===" -ForegroundColor Cyan
$status = git status --porcelain 2>&1
if ($status) {
    Write-Host "Changes found:" -ForegroundColor Yellow
    Write-Host $status
} else {
    Write-Host "No changes to commit" -ForegroundColor Green
}

Write-Host "`n=== Adding all changes ===" -ForegroundColor Cyan
git add -A 2>&1 | ForEach-Object { Write-Host $_ }

Write-Host "`n=== Committing changes ===" -ForegroundColor Cyan
$commitMsg = "Fix stream viewer: Add user-initiated video loading to prevent bridge errors"
git commit -m $commitMsg 2>&1 | ForEach-Object { Write-Host $_ }

Write-Host "`n=== Checking remote repository ===" -ForegroundColor Cyan
$remote = git remote -v 2>&1
if ($remote) {
    Write-Host $remote
} else {
    Write-Host "No remote configured" -ForegroundColor Yellow
}

Write-Host "`n=== Checking current branch ===" -ForegroundColor Cyan
$branch = git branch --show-current 2>&1
Write-Host "Current branch: $branch"

Write-Host "`n=== Pushing to GitHub ===" -ForegroundColor Cyan
git push origin $branch 2>&1 | ForEach-Object { Write-Host $_ }

Write-Host "`n=== Done ===" -ForegroundColor Green







