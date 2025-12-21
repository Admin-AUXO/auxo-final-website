@echo off
REM Batch script to fix Windows permissions for Lighthouse
REM Run this as Administrator

echo 🔧 Fixing Windows Permissions for Lighthouse
echo =============================================

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Running as Administrator
) else (
    echo ❌ Please run this script as Administrator!
    echo    Right-click Command Prompt and select "Run as Administrator"
    pause
    exit /b 1
)

echo.
echo 📁 Fixing TEMP directory permissions...
icacls "%TEMP%" /grant Users:(OI)(CI)F /T /Q
if %errorLevel% == 0 (
    echo ✅ TEMP directory permissions fixed
) else (
    echo ⚠️  Could not fix TEMP permissions, continuing...
)

echo.
echo 📁 Creating alternative temp directory...
if not exist "temp-lighthouse" mkdir temp-lighthouse
icacls "temp-lighthouse" /grant Users:(OI)(CI)F /T /Q
if %errorLevel% == 0 (
    echo ✅ Alternative temp directory ready: temp-lighthouse
) else (
    echo ⚠️  Could not set permissions on temp directory
)

echo.
echo 🌐 Checking Chrome availability...
where chrome >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Chrome found in PATH
) else (
    where /R "C:\Program Files" chrome.exe >nul 2>&1
    if %errorLevel% == 0 (
        echo ✅ Chrome found in Program Files
    ) else (
        echo ⚠️  Chrome not found in standard locations
        echo    Lighthouse may download Chromium automatically
    )
)

echo.
echo 🎯 SETUP COMPLETE!
echo ==================
echo Try running Lighthouse now:
echo    npm run performance:check
echo.
echo If it still fails, use the online tools:
echo    https://pagespeed.web.dev
echo.
echo Or view the existing report:
echo    npm run performance:report
echo.
pause