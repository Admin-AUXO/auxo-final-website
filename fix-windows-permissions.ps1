# PowerShell script to fix Windows permissions for Lighthouse
# Run this as Administrator

Write-Host "🔧 Fixing Windows Permissions for Lighthouse" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Check if running as administrator
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
$isAdmin = $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ Please run this script as Administrator!" -ForegroundColor Red
    Write-Host "   Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Running as Administrator" -ForegroundColor Green

# Fix TEMP directory permissions
Write-Host "`n📁 Fixing TEMP directory permissions..." -ForegroundColor Yellow
try {
    $tempPath = $env:TEMP
    Write-Host "   TEMP directory: $tempPath" -ForegroundColor Gray

    # Grant full permissions to Users group
    icacls "$tempPath" /grant "Users:(OI)(CI)F" /T /Q

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ TEMP directory permissions fixed" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Could not fix TEMP permissions, continuing..." -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Error fixing TEMP permissions: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Create alternative temp directory
Write-Host "`n📁 Creating alternative temp directory..." -ForegroundColor Yellow
try {
    $altTemp = Join-Path $PSScriptRoot "temp-lighthouse"
    if (!(Test-Path $altTemp)) {
        New-Item -ItemType Directory -Path $altTemp -Force | Out-Null
        Write-Host "   Created: $altTemp" -ForegroundColor Gray
    }

    # Set permissions on alternative temp directory
    icacls "$altTemp" /grant "Users:(OI)(CI)F" /T /Q

    Write-Host "✅ Alternative temp directory ready: $altTemp" -ForegroundColor Green

    # Set environment variables for current session
    $env:TEMP = $altTemp
    $env:TMP = $altTemp
    Write-Host "✅ Environment variables set for current session" -ForegroundColor Green

} catch {
    Write-Host "⚠️  Error creating alternative temp directory: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test Chrome availability
Write-Host "`n🌐 Checking Chrome availability..." -ForegroundColor Yellow
try {
    $chromePaths = @(
        "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
        "$env:ProgramFiles(x86)\Google\Chrome\Application\chrome.exe",
        "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
    )

    $chromeFound = $false
    foreach ($path in $chromePaths) {
        if (Test-Path $path) {
            Write-Host "✅ Chrome found: $path" -ForegroundColor Green
            $chromeFound = $true
            break
        }
    }

    if (-not $chromeFound) {
        Write-Host "⚠️  Chrome not found in standard locations" -ForegroundColor Yellow
        Write-Host "   Lighthouse may download Chromium automatically" -ForegroundColor Gray
    }
} catch {
    Write-Host "⚠️  Error checking Chrome: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Final instructions
Write-Host "`n🎯 SETUP COMPLETE!" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green
Write-Host "Try running Lighthouse now:"
Write-Host "   npm run performance:check" -ForegroundColor Cyan
Write-Host ""
Write-Host "If it still fails, use the online tools:"
Write-Host "   https://pagespeed.web.dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "Or view the existing report:"
Write-Host "   npm run performance:report" -ForegroundColor Cyan

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")