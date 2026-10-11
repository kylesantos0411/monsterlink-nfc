@echo off
setlocal
echo ===================================================
echo     MONSTERLINK - PHASE 2 AUTOMATED TEST RUNNER
echo ===================================================
echo.
set CSC=C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe

if not exist "%CSC%" (
    echo Error: C# compiler not found at %CSC%
    pause
    exit /b 1
)

echo Compiling Phase 2 test suite...
powershell -Command "$files = (Get-ChildItem -Path 'Assets\Scripts' -Filter '*.cs' -Recurse | Where-Object { $_.Name -ne 'Phase1Tests.cs' }).FullName; & '%CSC%' /nologo /main:MonsterLink.Tests.Phase2Tests /out:Phase2Tests.exe /target:exe $files"

if %ERRORLEVEL% NEQ 0 (
    echo Compilation failed!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo Running Phase 2 tests...
echo.
Phase2Tests.exe
set TEST_EXIT=%ERRORLEVEL%

del Phase2Tests.exe Phase2Tests.pdb 2>nul
echo.
if %TEST_EXIT% EQU 0 (
    echo All Phase 2 tests passed successfully!
) else (
    echo Some tests failed with exit code %TEST_EXIT%.
)
echo.
pause
exit /b %TEST_EXIT%
