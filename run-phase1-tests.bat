@echo off
setlocal
echo ===================================================
echo     MONSTERLINK - PHASE 1 AUTOMATED TEST RUNNER
echo ===================================================
echo.
set CSC=C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe

if not exist "%CSC%" (
    echo Error: C# compiler not found at %CSC%
    pause
    exit /b 1
)

echo Compiling Phase 1 test suite...
powershell -Command "$files = (Get-ChildItem -Path 'Assets\Scripts' -Filter '*.cs' -Recurse | Where-Object { $_.Name -ne 'Phase2Tests.cs' }).FullName; & '%CSC%' /nologo /main:MonsterLink.Tests.Phase1Tests /out:Phase1Tests.exe /target:exe $files"

if %ERRORLEVEL% NEQ 0 (
    echo Compilation failed!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo Running tests...
echo.
Phase1Tests.exe
set TEST_EXIT=%ERRORLEVEL%

del Phase1Tests.exe Phase1Tests.pdb 2>nul
echo.
if %TEST_EXIT% EQU 0 (
    echo All Phase 1 tests passed successfully!
) else (
    echo Some tests failed with exit code %TEST_EXIT%.
)
echo.
pause
exit /b %TEST_EXIT%
