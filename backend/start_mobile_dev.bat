@echo off
echo Starting Legatura Mobile Development Environment...
echo.

REM Get the local IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    for /f "tokens=1" %%b in ("%%a") do (
        echo Your computer IP address: %%b
        echo Update mobile_app/src/config/api.ts with this IP if needed
        echo.
    )
)

echo Starting Laravel API server...
start "Laravel API" cmd /k "cd /d %~dp0 && C:\xampp\php\php.exe artisan serve --host=0.0.0.0 --port=8000"

timeout /t 3

echo Starting React Native Mobile App...
start "React Native" cmd /k "cd /d %~dp0mobile_app && npm start"

echo.
echo Both servers are starting up!
echo - Laravel API: http://localhost:8000
echo - React Native: Check the second terminal window for QR code
echo.
echo To view on your phone:
echo 1. Install Expo Go app from your app store
echo 2. Scan the QR code that appears in the React Native terminal
echo 3. Make sure your phone is on the same WiFi network as this computer
echo.
pause
