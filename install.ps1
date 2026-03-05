$User = "Spectra010s"
$Repo = "term-invader"
$DestFolder = "$HOME\bin"
if (!(Test-Path $DestFolder)) { New-Item -ItemType Directory -Path $DestFolder | Out-Null }
$ApiUrl = "https://api.github.com/repos/$User/$Repo/releases/latest"
try {
    $ReleaseInfo = Invoke-RestMethod -Uri $ApiUrl
    $Asset = $ReleaseInfo.assets | Where-Object { $_.name -like "*win-x64.exe" } | Select-Object -First 1
    if ($null -eq $Asset) { throw "Binary not found" }
    $DownloadUrl = $Asset.browser_download_url
    $DestFile = "$DestFolder\term-invader.exe"
    Write-Host "Downloading term-invader..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri $DownloadUrl -OutFile $DestFile
    $UserPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if ($UserPath -notlike "*$DestFolder*") {
        [Environment]::SetEnvironmentVariable("Path", "$UserPath;$DestFolder", "User")
        Write-Host "`n[SUCCESS]" -ForegroundColor Green
        Write-Host "Please close your terminal and reopen it, then type 'term-invader' to play." -ForegroundColor Yellow
    } else {
        Write-Host "`n[SUCCESS]" -ForegroundColor Green
        Write-Host "Ready! Type 'term-invader' to start." -ForegroundColor Cyan
    }
} catch {
    Write-Host "Error: Could not download the game." -ForegroundColor Red
}
