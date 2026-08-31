param(
  [Parameter(Mandatory = $true)]
  [string]$AppxPath,

  [string]$EvidenceDirectory = "evidence/windows-store-candidate"
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

if (-not $IsWindows) {
  throw "Store AppX inspection must run on Windows."
}

$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$resolvedAppx = (Resolve-Path -LiteralPath $AppxPath).Path
$evidenceRoot = if ([System.IO.Path]::IsPathRooted($EvidenceDirectory)) {
  [System.IO.Path]::GetFullPath($EvidenceDirectory)
} else {
  [System.IO.Path]::GetFullPath((Join-Path $projectRoot $EvidenceDirectory))
}

function Get-RequiredEnvironmentValue {
  param([string]$Name)

  $value = [System.Environment]::GetEnvironmentVariable($Name)
  if ([string]::IsNullOrWhiteSpace($value)) {
    throw "$Name is required and must be copied exactly from Partner Center."
  }
  return $value.Trim()
}

function Assert-Equal {
  param(
    [string]$Label,
    [AllowEmptyString()][string]$Actual,
    [AllowEmptyString()][string]$Expected
  )

  if (-not [string]::Equals($Actual, $Expected, [System.StringComparison]::Ordinal)) {
    throw "$Label mismatch. Expected '$Expected'; received '$Actual'."
  }
}

function Assert-File {
  param([string]$Path, [string]$Label)

  if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
    throw "Missing $Label at $Path"
  }
}

function Assert-PortableExecutable {
  param([string]$Path, [string]$Label)

  Assert-File -Path $Path -Label $Label
  $stream = [System.IO.File]::OpenRead($Path)
  try {
    $first = $stream.ReadByte()
    $second = $stream.ReadByte()
  } finally {
    $stream.Dispose()
  }
  if ($first -ne 0x4d -or $second -ne 0x5a) {
    throw "$Label does not have a Windows PE (MZ) header."
  }
}

function Get-RelativePortablePath {
  param([string]$BasePath, [string]$Path)

  return [System.IO.Path]::GetRelativePath($BasePath, $Path).Replace("\", "/")
}

$expectedIdentity = Get-RequiredEnvironmentValue "CAUSALPILOT_STORE_IDENTITY_NAME"
$expectedPublisher = Get-RequiredEnvironmentValue "CAUSALPILOT_STORE_PUBLISHER"
$expectedPublisherDisplayName = if ([string]::IsNullOrWhiteSpace($env:CAUSALPILOT_STORE_PUBLISHER_DISPLAY_NAME)) {
  "LAI ZEYU"
} else {
  $env:CAUSALPILOT_STORE_PUBLISHER_DISPLAY_NAME.Trim()
}
$expectedDisplayName = if ([string]::IsNullOrWhiteSpace($env:CAUSALPILOT_STORE_DISPLAY_NAME)) {
  "CausalPilot AI by LAI ZEYU"
} else {
  $env:CAUSALPILOT_STORE_DISPLAY_NAME.Trim()
}
$expectedVersion = if ([string]::IsNullOrWhiteSpace($env:CAUSALPILOT_STORE_PACKAGE_VERSION)) {
  "1.0.0.0"
} else {
  $env:CAUSALPILOT_STORE_PACKAGE_VERSION.Trim()
}

$inspectionRoot = Join-Path $projectRoot "work/windows-store-appx-inspection"
if (-not $inspectionRoot.StartsWith((Join-Path $projectRoot "work"), [System.StringComparison]::Ordinal)) {
  throw "Refusing to clean an inspection directory outside the project work directory."
}
if (Test-Path -LiteralPath $inspectionRoot) {
  Remove-Item -LiteralPath $inspectionRoot -Recurse -Force
}
New-Item -ItemType Directory -Path $inspectionRoot | Out-Null
New-Item -ItemType Directory -Path $evidenceRoot -Force | Out-Null

$extractedPackage = Join-Path $inspectionRoot "package"
[System.IO.Compression.ZipFile]::ExtractToDirectory($resolvedAppx, $extractedPackage)

$manifestPath = Join-Path $extractedPackage "AppxManifest.xml"
Assert-File -Path $manifestPath -Label "AppxManifest.xml"
[xml]$manifest = [System.IO.File]::ReadAllText($manifestPath)

$identity = $manifest.SelectSingleNode("/*[local-name()='Package']/*[local-name()='Identity']")
$properties = $manifest.SelectSingleNode("/*[local-name()='Package']/*[local-name()='Properties']")
$targetFamily = $manifest.SelectSingleNode("/*[local-name()='Package']/*[local-name()='Dependencies']/*[local-name()='TargetDeviceFamily']")
$application = $manifest.SelectSingleNode("/*[local-name()='Package']/*[local-name()='Applications']/*[local-name()='Application']")
if ($null -eq $identity -or $null -eq $properties -or $null -eq $targetFamily -or $null -eq $application) {
  throw "AppxManifest.xml is missing a required Store package node."
}

$manifestIdentity = [string]$identity.GetAttribute("Name")
$manifestPublisher = [string]$identity.GetAttribute("Publisher")
$manifestVersion = [string]$identity.GetAttribute("Version")
$manifestArchitecture = [string]$identity.GetAttribute("ProcessorArchitecture")
$manifestDisplayName = [string]$properties.SelectSingleNode("*[local-name()='DisplayName']").InnerText
$manifestPublisherDisplayName = [string]$properties.SelectSingleNode("*[local-name()='PublisherDisplayName']").InnerText
$targetName = [string]$targetFamily.GetAttribute("Name")
$targetMinVersion = [string]$targetFamily.GetAttribute("MinVersion")
$targetMaxVersion = [string]$targetFamily.GetAttribute("MaxVersionTested")
$applicationId = [string]$application.GetAttribute("Id")

Assert-Equal "Identity Name" $manifestIdentity $expectedIdentity
Assert-Equal "Identity Publisher" $manifestPublisher $expectedPublisher
Assert-Equal "Identity Version" $manifestVersion $expectedVersion
Assert-Equal "Identity ProcessorArchitecture" $manifestArchitecture "x64"
Assert-Equal "Package DisplayName" $manifestDisplayName $expectedDisplayName
Assert-Equal "PublisherDisplayName" $manifestPublisherDisplayName $expectedPublisherDisplayName
Assert-Equal "TargetDeviceFamily Name" $targetName "Windows.Desktop"
Assert-Equal "TargetDeviceFamily MinVersion" $targetMinVersion "10.0.17763.0"
Assert-Equal "TargetDeviceFamily MaxVersionTested" $targetMaxVersion "10.0.26100.0"
Assert-Equal "Application Id" $applicationId "CausalPilotAI"

$capabilities = @(
  $manifest.SelectNodes("/*[local-name()='Package']/*[local-name()='Capabilities']/*") |
    ForEach-Object { [string]$_.GetAttribute("Name") } |
    Sort-Object -Unique
)
if ($capabilities.Count -ne 1 -or $capabilities[0] -ne "runFullTrust") {
  throw "Unexpected AppX capability set: $($capabilities -join ', ')"
}

$appRoot = Join-Path $extractedPackage "app"
$mainExecutable = Join-Path $appRoot "CausalPilot AI.exe"
$sidecarExecutable = Join-Path $appRoot "resources/engine/causalpilot-engine.exe"
$appAsar = Join-Path $appRoot "resources/app.asar"
$electronLicense = Join-Path $appRoot "LICENSE.electron.txt"
$chromiumLicense = Join-Path $appRoot "LICENSES.chromium.html"

Assert-PortableExecutable -Path $mainExecutable -Label "packaged Electron executable"
Assert-PortableExecutable -Path $sidecarExecutable -Label "packaged Windows sidecar"
Assert-File -Path $appAsar -Label "app.asar"
Assert-File -Path $electronLicense -Label "Electron license notice"
Assert-File -Path $chromiumLicense -Label "Chromium license notice"

$sidecarVersion = (Get-Item -LiteralPath $sidecarExecutable).VersionInfo
if ($sidecarVersion.CompanyName -notlike "*LAI ZEYU*") {
  throw "The packaged sidecar is missing LAI ZEYU ownership metadata."
}

$asarCli = Join-Path $projectRoot "node_modules/.bin/asar.cmd"
Assert-File -Path $asarCli -Label "locked ASAR inspection tool"
$extractedAsar = Join-Path $inspectionRoot "app-asar"
& $asarCli extract $appAsar $extractedAsar
if ($LASTEXITCODE -ne 0) {
  throw "ASAR extraction failed with exit code $LASTEXITCODE."
}

$packagedMetadataPath = Join-Path $extractedAsar "package.json"
Assert-File -Path $packagedMetadataPath -Label "packaged package.json"
$packagedMetadata = Get-Content -LiteralPath $packagedMetadataPath -Raw | ConvertFrom-Json
Assert-Equal "Packaged author" ([string]$packagedMetadata.author) "LAI ZEYU (来泽宇)"

$projectNotices = @("AUTHORS.md", "LICENSE", "NOTICE.md", "THIRD_PARTY_NOTICES.md")
foreach ($notice in $projectNotices) {
  Assert-File -Path (Join-Path $extractedAsar $notice) -Label "packaged project notice $notice"
}

$sensitiveFileMatches = @(
  Get-ChildItem -LiteralPath $extractedPackage, $extractedAsar -File -Recurse |
    Where-Object {
      $lowerName = $_.Name.ToLowerInvariant()
      $lowerName -eq ".env" -or
        $lowerName.StartsWith(".env.") -or
        $lowerName.EndsWith(".pfx") -or
        $lowerName.EndsWith(".p12") -or
        $lowerName.EndsWith(".key")
    } |
    ForEach-Object { Get-RelativePortablePath -BasePath $inspectionRoot -Path $_.FullName } |
    Sort-Object -Unique
)

$secretPatterns = @(
  [pscustomobject]@{ Name = "private-key"; Expression = "-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----" },
  [pscustomobject]@{ Name = "github-token"; Expression = "gh[pousr]_[A-Za-z0-9]{20,}" },
  [pscustomobject]@{ Name = "openai-api-key"; Expression = "sk-(?:proj-)?[A-Za-z0-9_-]{20,}" },
  [pscustomobject]@{ Name = "aws-access-key"; Expression = "AKIA[0-9A-Z]{16}" },
  [pscustomobject]@{ Name = "slack-token"; Expression = "xox[baprs]-[A-Za-z0-9-]{20,}" },
  [pscustomobject]@{ Name = "google-api-key"; Expression = "AIza[0-9A-Za-z_-]{35}" }
)
$textExtensions = @(".cjs", ".css", ".html", ".js", ".json", ".md", ".mjs", ".txt", ".xml", ".yaml", ".yml")
$secretPatternMatches = [System.Collections.Generic.List[object]]::new()
$scannedTextFiles = 0
foreach ($file in Get-ChildItem -LiteralPath $extractedPackage, $extractedAsar -File -Recurse) {
  if ($textExtensions -notcontains $file.Extension.ToLowerInvariant()) {
    continue
  }
  $scannedTextFiles += 1
  $content = [System.IO.File]::ReadAllText($file.FullName)
  foreach ($pattern in $secretPatterns) {
    if ([System.Text.RegularExpressions.Regex]::IsMatch($content, $pattern.Expression)) {
      $secretPatternMatches.Add([ordered]@{
        pattern = $pattern.Name
        file = Get-RelativePortablePath -BasePath $inspectionRoot -Path $file.FullName
      })
    }
  }
}

if ($sensitiveFileMatches.Count -gt 0 -or $secretPatternMatches.Count -gt 0) {
  $fileSummary = if ($sensitiveFileMatches.Count -gt 0) { $sensitiveFileMatches -join ", " } else { "none" }
  $patternSummary = if ($secretPatternMatches.Count -gt 0) {
    @($secretPatternMatches | ForEach-Object { "$($_.pattern):$($_.file)" }) -join ", "
  } else {
    "none"
  }
  throw "Secret scan failed. Sensitive files: $fileSummary. Token-pattern matches: $patternSummary."
}

$packageFile = Get-Item -LiteralPath $resolvedAppx
$packageHash = (Get-FileHash -LiteralPath $resolvedAppx -Algorithm SHA256).Hash.ToLowerInvariant()
$mainHash = (Get-FileHash -LiteralPath $mainExecutable -Algorithm SHA256).Hash.ToLowerInvariant()
$sidecarHash = (Get-FileHash -LiteralPath $sidecarExecutable -Algorithm SHA256).Hash.ToLowerInvariant()
$authenticodeStatus = try {
  (Get-AuthenticodeSignature -LiteralPath $resolvedAppx).Status.ToString()
} catch {
  "Unavailable: $($_.Exception.Message)"
}

$report = [ordered]@{
  status = "validated_store_upload_candidate"
  author = "LAI ZEYU (来泽宇)"
  artifact = [ordered]@{
    name = $packageFile.Name
    bytes = $packageFile.Length
    sha256 = $packageHash
    authenticodeStatusBeforeStoreResigning = $authenticodeStatus
  }
  manifest = [ordered]@{
    identityName = $manifestIdentity
    publisher = $manifestPublisher
    version = $manifestVersion
    processorArchitecture = $manifestArchitecture
    displayName = $manifestDisplayName
    publisherDisplayName = $manifestPublisherDisplayName
    applicationId = $applicationId
    targetDeviceFamily = [ordered]@{
      name = $targetName
      minVersion = $targetMinVersion
      maxVersionTested = $targetMaxVersion
    }
    capabilities = $capabilities
  }
  payload = [ordered]@{
    mainExecutableSha256 = $mainHash
    sidecarExecutableSha256 = $sidecarHash
    sidecarCompanyName = $sidecarVersion.CompanyName
    appAsarPresent = $true
    electronLicensePresent = $true
    chromiumLicensePresent = $true
    projectNotices = $projectNotices
  }
  secretScan = [ordered]@{
    status = "passed"
    textFilesScanned = $scannedTextFiles
    sensitiveFileMatches = 0
    tokenPatternMatches = 0
    appAsarExpanded = $true
  }
  validationBoundaries = [ordered]@{
    windowsAppCertificationKitRan = $false
    windowsAppCertificationKitReason = "WACK requires an active interactive user session and is not run in GitHub Actions Session 0."
    microsoftDefenderScanRan = $false
    microsoftDefenderScanReason = "This workflow performs package structure and secret checks; malware scanning remains a release-host gate."
    packageInstalled = $false
    packageInstallReason = "This unsigned Store upload candidate is intended for Partner Center re-signing, not CI installation."
    submittedToPartnerCenter = $false
    publiclyAvailableInMicrosoftStore = $false
  }
}

$reportPath = Join-Path $evidenceRoot "store-appx-inspection.json"
$checksumPath = Join-Path $evidenceRoot "SHA256SUMS-appx.txt"
$manifestEvidencePath = Join-Path $evidenceRoot "AppxManifest-inspected.xml"
$report | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $reportPath -Encoding utf8NoBOM
Set-Content -LiteralPath $checksumPath -Value "$packageHash  $($packageFile.Name)" -Encoding utf8NoBOM
Copy-Item -LiteralPath $manifestPath -Destination $manifestEvidencePath -Force

Write-Host "Validated Store AppX candidate: $($packageFile.Name)"
Write-Host "SHA-256: $packageHash"
Write-Host "Evidence: $reportPath"
