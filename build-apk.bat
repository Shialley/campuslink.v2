@echo off
echo ================================
echo CampusLink v2 - Android APK Builder
echo ================================
echo.

cd /d %~dp0

echo Step 1: Checking environment...
where java >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Java not found. Please install JDK 17 or higher.
    echo Download from: https://adoptium.net/
    pause
    exit /b 1
)

echo [OK] Java found
echo.

echo Step 2: Building APK...
echo This may take 5-15 minutes on first build...
echo.

cd android
call gradlew.bat assembleRelease

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Build failed!
    echo Try running: gradlew.bat clean
    echo Then run this script again
    pause
    exit /b 1
)

echo.
echo ================================
echo [SUCCESS] APK built successfully!
echo ================================
echo.
echo APK Location:
echo %cd%\app\build\outputs\apk\release\app-release.apk
echo.
echo You can now:
echo 1. Transfer the APK to your Android device
echo 2. Enable "Install from Unknown Sources"
echo 3. Install the APK
echo.
pause

start explorer "%cd%\app\build\outputs\apk\release"
