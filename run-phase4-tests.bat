@echo off
setlocal
echo ===================================================
echo     MONSTERLINK - PHASE 4 AUTOMATED TEST RUNNER
echo ===================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0run-phase4-tests.ps1"
set TEST_EXIT=%ERRORLEVEL%

echo.
if %TEST_EXIT% EQU 0 (
    echo All Phase 4 tests passed successfully!
) else (
    echo Some tests failed with exit code %TEST_EXIT%.
)
echo.
exit /b %TEST_EXIT%
