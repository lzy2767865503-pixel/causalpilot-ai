param(
  [string]$InstallerPath = "release/CausalPilot-AI-0.1.0-windows-x64-setup.exe",
  [string]$EvidenceDirectory = "release/windows-installer-evidence"
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

if (-not $IsWindows) {
  throw "The NSIS installation smoke test must run on Windows."
}

$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$projectWorkRoot = [System.IO.Path]::GetFullPath((Join-Path $projectRoot "work"))
$testRoot = [System.IO.Path]::GetFullPath((Join-Path $projectWorkRoot "windows-installer-smoke"))
$installRoot = Join-Path $testRoot "installed"
$resolvedInstaller = (Resolve-Path -LiteralPath (Join-Path $projectRoot $InstallerPath)).Path
$evidenceRoot = if ([System.IO.Path]::IsPathRooted($EvidenceDirectory)) {
  [System.IO.Path]::GetFullPath($EvidenceDirectory)
} else {
  [System.IO.Path]::GetFullPath((Join-Path $projectRoot $EvidenceDirectory))
}

if (-not $testRoot.StartsWith($projectWorkRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "Refusing to use an installer smoke-test directory outside the project work directory."
}
if (Test-Path -LiteralPath $testRoot) {
  Remove-Item -LiteralPath $testRoot -Recurse -Force
}
New-Item -ItemType Directory -Path $installRoot -Force | Out-Null
New-Item -ItemType Directory -Path $evidenceRoot -Force | Out-Null

$installerHash = (Get-FileHash -LiteralPath $resolvedInstaller -Algorithm SHA256).Hash.ToLowerInvariant()
$installStartedAt = [DateTime]::UtcNow.ToString("o")
$installer = Start-Process `
  -FilePath $resolvedInstaller `
  -ArgumentList @("/S", "/D=$installRoot") `
  -Wait `
  -PassThru
if ($installer.ExitCode -ne 0) {
  throw "NSIS installer exited with code $($installer.ExitCode)."
}

$applicationPath = Join-Path $installRoot "CausalPilot AI.exe"
if (-not (Test-Path -LiteralPath $applicationPath -PathType Leaf)) {
  throw "The expected installed application was not found at $applicationPath."
}

$env:CAUSALPILOT_APP_EXECUTABLE = $applicationPath
& npm.cmd run qa:packaged
if ($LASTEXITCODE -ne 0) {
  throw "Installed application E2E failed with exit code $LASTEXITCODE."
}

$installedE2eSource = Join-Path $projectRoot "design/qa/packaged-e2e-report.json"
$installedE2eEvidence = Join-Path $evidenceRoot "packaged-e2e-installed-report.json"
Copy-Item -LiteralPath $installedE2eSource -Destination $installedE2eEvidence -Force

$uninstallers = @(Get-ChildItem -LiteralPath $installRoot -Filter "Uninstall*.exe" -File)
if ($uninstallers.Count -ne 1) {
  throw "Expected exactly one NSIS uninstaller, found $($uninstallers.Count)."
}
$uninstallerPath = $uninstallers[0].FullName
$uninstallStartedAt = [DateTime]::UtcNow.ToString("o")
$uninstaller = Start-Process -FilePath $uninstallerPath -ArgumentList "/S" -Wait -PassThru
if ($uninstaller.ExitCode -ne 0) {
  throw "NSIS uninstaller exited with code $($uninstaller.ExitCode)."
}

$applicationRemoved = $false
for ($attempt = 0; $attempt -lt 100; $attempt += 1) {
  if (-not (Test-Path -LiteralPath $applicationPath)) {
    $applicationRemoved = $true
    break
  }
  Start-Sleep -Milliseconds 100
}
if (-not $applicationRemoved) {
  throw "The installed application remained after the uninstaller completed."
}

$report = [ordered]@{
  status = "validated_nsis_install_launch_uninstall"
  author = "LAI ZEYU (来泽宇)"
  testedAt = [DateTime]::UtcNow.ToString("o")
  platform = [ordered]@{
    operatingSystem = [System.Environment]::OSVersion.VersionString
    architecture = [System.Runtime.InteropServices.RuntimeInformation]::OSArchitecture.ToString()
  }
  installer = [ordered]@{
    name = [System.IO.Path]::GetFileName($resolvedInstaller)
    sha256 = $installerHash
    silentInstallExitCode = $installer.ExitCode
    installStartedAt = $installStartedAt
  }
  installedApplication = [ordered]@{
    executableName = [System.IO.Path]::GetFileName($applicationPath)
    packagedE2eReport = [System.IO.Path]::GetFileName($installedE2eEvidence)
    bundledLocalEngineExercised = $true
    unicodeInputPathExercised = $true
    aggregateEvidenceExportExercised = $true
  }
  uninstaller = [ordered]@{
    executableName = [System.IO.Path]::GetFileName($uninstallerPath)
    silentUninstallExitCode = $uninstaller.ExitCode
    uninstallStartedAt = $uninstallStartedAt
    installedApplicationRemoved = $applicationRemoved
  }
  boundary = "This is an automated install, packaged-workflow, and uninstall smoke test on the recorded GitHub-hosted Windows runner. It is not a clean consumer-device, signing, SmartScreen, WACK, Defender, or broad Windows compatibility certification."
}

$reportPath = Join-Path $evidenceRoot "nsis-install-uninstall-report.json"
$report | ConvertTo-Json -Depth 7 | Set-Content -LiteralPath $reportPath -Encoding utf8NoBOM
$report | ConvertTo-Json -Depth 7
