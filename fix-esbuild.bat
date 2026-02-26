@echo off
echo Fixing esbuild EPERM error...
echo.

REM Stop Node processes
taskkill /F /IM node.exe >nul 2>&1

REM Delete cache folders
if exist ".vite" (
    echo Deleting .vite folder...
    rmdir /s /q ".vite"
)

if exist "node_modules\.vite" (
    echo Deleting node_modules\.vite folder...
    rmdir /s /q "node_modules\.vite"
)

if exist "node_modules\esbuild" (
    echo Deleting old esbuild...
    rmdir /s /q "node_modules\esbuild"
)

echo.
echo Reinstalling esbuild...
call npm install esbuild --save-exact --force

echo.
echo Done! Now try: npm run dev
pause
