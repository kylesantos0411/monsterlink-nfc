@echo off
title MonsterLink Web Prototype Launcher
echo ===================================================
echo     MONSTERLINK - NFC CREATURE BATTLE PROTOTYPE
echo          Phase 0.5: Interactive Web Prototype
echo ===================================================
echo.
echo Launching prototype in your default browser...
start "" "%~dp0web-prototype\standalone.html"
echo.
echo If your browser opened, you're ready to test!
echo You can also run a local web server by running:
echo   npx serve "%~dp0web-prototype"
echo.
pause
