# BMECom - Deploy to GitHub Pages
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    BMECom - Deploy to GitHub Pages" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/4] Checking git status..." -ForegroundColor Yellow
git status

Write-Host ""
Write-Host "[2/4] Adding all changes..." -ForegroundColor Yellow
git add .

Write-Host ""
Write-Host "[3/4] Committing changes..." -ForegroundColor Yellow
$commitMsg = Read-Host "Enter commit message (or press Enter for default)"
if ([string]::IsNullOrWhiteSpace($commitMsg)) {
    $commitMsg = "Auto-deploy: Update BMECom site"
}

git commit -m $commitMsg

Write-Host ""
Write-Host "[4/4] Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "    Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your site will be automatically deployed to:" -ForegroundColor White
Write-Host "https://ma-bme.github.io/BMECom/" -ForegroundColor Cyan
Write-Host ""
Write-Host "It may take 2-5 minutes for changes to appear." -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to continue" 