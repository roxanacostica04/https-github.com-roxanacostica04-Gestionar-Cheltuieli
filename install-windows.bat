@echo off
echo ========================================
echo   Gestionar Cheltuieli - Instalare
echo ========================================
echo.

echo Verificare Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo EROARE: Node.js nu este instalat!
    echo.
    echo Te rog sa descarci si sa instalezi Node.js de pe:
    echo https://nodejs.org
    echo.
    echo Apasa orice tasta pentru a deschide site-ul...
    pause >nul
    start https://nodejs.org
    exit /b 1
)

echo Node.js detectat! ✓
echo.

echo Instalare dependente...
call npm install
if %errorlevel% neq 0 (
    echo EROARE: Instalarea dependentelor a esuat!
    pause
    exit /b 1
)

echo Instalare Encore CLI...
call npm install -g @encore/cli
if %errorlevel% neq 0 (
    echo EROARE: Instalarea Encore CLI a esuat!
    pause
    exit /b 1
)

echo Configurare baza de date...
call encore db create expense
if %errorlevel% neq 0 (
    echo EROARE: Crearea bazei de date a esuat!
    pause
    exit /b 1
)

echo Rulare migratii...
call encore db migrate
if %errorlevel% neq 0 (
    echo EROARE: Migratiile au esuat!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Instalarea s-a finalizat cu succes!
echo ========================================
echo.

echo Pornire aplicatie...
echo Backend se porneste...
start /b encore run

echo Asteptare 10 secunde pentru pornirea backend-ului...
timeout /t 10 /nobreak >nul

echo Frontend se porneste...
cd frontend
start /b npm run dev

echo.
echo Aplicatia se va deschide in browser in cateva secunde...
echo.
echo URL: http://localhost:3000
echo.
echo Conturi demo:
echo - admin / admin123
echo - user / password  
echo - demo / demo123
echo.

timeout /t 5 /nobreak >nul
start http://localhost:3000

echo Pentru a opri aplicatia, inchide acest terminal.
echo.
pause
