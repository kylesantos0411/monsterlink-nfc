$files = (Get-ChildItem -Path "Assets\Scripts" -Filter "*.cs" -Recurse | Where-Object { $_.Name -ne "Phase1Tests.cs" -and $_.Name -ne "Phase2Tests.cs" -and $_.Name -ne "Phase3Tests.cs" }).FullName
$csc = "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
& $csc /nologo /main:MonsterLink.Tests.Phase4Tests /out:Phase4Tests.exe /target:exe $files
if ($LASTEXITCODE -ne 0) {
    Write-Error "Compilation failed with code $LASTEXITCODE"
    exit $LASTEXITCODE
}
.\Phase4Tests.exe
$testExit = $LASTEXITCODE
Remove-Item Phase4Tests.exe, Phase4Tests.pdb -ErrorAction SilentlyContinue
exit $testExit
