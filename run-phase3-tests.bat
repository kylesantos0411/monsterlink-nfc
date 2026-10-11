@echo off
setlocal
echo ===================================================
echo     MONSTERLINK - PHASE 3 AUTOMATED TEST RUNNER
echo ===================================================
echo.
set CSC=C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe

if not exist "%CSC%" (
    echo Error: C# compiler not found at %CSC%
    pause
    exit /b 1
)

echo Compiling Phase 3 test suite...
powershell -Command "$files = (Get-ChildItem -Path 'Assets\Scripts' -Filter '*.cs' -Recurse | Where-Object { $_.Name -ne 'Phase1Tests.cs' -and $_.Name -ne 'Phase2Tests.cs' }).FullName; & '%CSC%' /nologo /main:MonsterLink.Tests.Phase3Tests /out:Phase3Tests.exe /target:exe $files"

if %ERRORLEVEL% NEQ 0 (
    echo Compilation failed!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo Running Phase 3 tests...
echo.
Phase3Tests.exe
set TEST_EXIT=%ERRORLEVEL%

del Phase3Tests.exe Phase3Tests.pdb 2>nul
echo.
if %TEST_EXIT% EQU 0 (
    echo All Phase 3 tests passed successfully!
) else (
    echo Some tests failed with exit code %TEST_EXIT%.
)
echo.
pause
exit /b %TEST_EXIT%
