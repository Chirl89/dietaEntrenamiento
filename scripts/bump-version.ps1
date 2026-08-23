# FitDuo & Collie Coach - Automated Version Bumper
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts/bump-version.ps1 [-Type patch|minor|major] [-SetVersion "X.Y.Z"] [-Stage]

param (
    [ValidateSet("patch", "minor", "major")]
    [string]$Type = "patch",
    [string]$SetVersion = "",
    [switch]$Stage = $false
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir

$versionJsonPath = Join-Path $projectRoot "version.json"
$versionJsPath   = Join-Path $projectRoot "js\version.js"
$indexHtmlPath   = Join-Path $projectRoot "index.html"
$appJsPath       = Join-Path $projectRoot "app.js"

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

# 1. Determine Current Version
$currentVersion = "0.16.0"
if (Test-Path $versionJsonPath) {
    try {
        $jsonRaw = [System.IO.File]::ReadAllText($versionJsonPath, $utf8NoBom)
        $jsonContent = $jsonRaw | ConvertFrom-Json
        if ($jsonContent.version) {
            $currentVersion = $jsonContent.version
        }
    } catch {
        Write-Warning "Could not parse version.json, falling back."
    }
} elseif (Test-Path $indexHtmlPath) {
    $htmlContent = [System.IO.File]::ReadAllText($indexHtmlPath, $utf8NoBom)
    if ($htmlContent -match 'styles\.css\?v=([0-9]+\.[0-9]+\.[0-9]+)') {
        $currentVersion = $matches[1]
    }
}

# 2. Compute New Version
if ($SetVersion -ne "") {
    $newVersion = $SetVersion.TrimStart('v')
} else {
    $parts = $currentVersion.Split('.')
    $major = if ($parts.Length -gt 0) { [int]$parts[0] } else { 0 }
    $minor = if ($parts.Length -gt 1) { [int]$parts[1] } else { 17 }
    $patch = if ($parts.Length -gt 2) { [int]$parts[2] } else { 0 }

    switch ($Type) {
        "major" {
            $major++
            $minor = 0
            $patch = 0
        }
        "minor" {
            $minor++
            $patch = 0
        }
        "patch" {
            $patch++
        }
    }
    $newVersion = "$major.$minor.$patch"
}

Write-Host "FitDuo Version Bump: v$currentVersion -> v$newVersion ($Type)" -ForegroundColor Cyan

# 3. Update version.json
$versionData = [PSCustomObject]@{
    version = $newVersion
    lastUpdated = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    previousVersion = $currentVersion
}
$jsonString = $versionData | ConvertTo-Json -Depth 4
[System.IO.File]::WriteAllText($versionJsonPath, $jsonString + "`n", $utf8NoBom)
Write-Host " [OK] Updated version.json" -ForegroundColor Green

# 4. Update js/version.js
$versionJsContent = @"
/**
 * FitDuo & Collie Coach - Centralized Application Version
 * AUTO-GENERATED - DO NOT EDIT MANUALLY
 */
export const APP_VERSION = "$newVersion";

/**
 * Dynamically synchronize and reflect the current app version across all UI badges
 */
export function applyAppVersionToDOM() {
  const vStr = "v" + APP_VERSION;
  
  // 1. Update all .app-version-tag elements
  document.querySelectorAll('.app-version-tag').forEach(el => {
    el.textContent = vStr;
  });
  
  // 2. Update sidebar health footer version
  const sidebarVersionEl = document.getElementById('sidebar-app-version');
  if (sidebarVersionEl) {
    sidebarVersionEl.innerHTML = '<i class="fa-brands fa-apple"></i> Salud &bull; ' + vStr;
  }
  
  // 3. Update diagnostic cloud status badge text if present
  const cloudStatusText = document.getElementById('cloud-sync-status-text');
  if (cloudStatusText && cloudStatusText.textContent.includes('Conectado')) {
    cloudStatusText.textContent = "Estado: Conectado a la Nube (" + vStr + ")";
  }
}
"@
$versionJsDir = Split-Path -Parent $versionJsPath
if (-not (Test-Path $versionJsDir)) {
    New-Item -ItemType Directory -Path $versionJsDir -Force | Out-Null
}
[System.IO.File]::WriteAllText($versionJsPath, $versionJsContent + "`n", $utf8NoBom)
Write-Host " [OK] Updated js/version.js" -ForegroundColor Green

# 5. Update index.html
if (Test-Path $indexHtmlPath) {
    $html = [System.IO.File]::ReadAllText($indexHtmlPath, $utf8NoBom)
    
    # Update CSS query param
    $html = [System.Text.RegularExpressions.Regex]::Replace($html, 'styles\.css\?v=[0-9]+\.[0-9]+\.[0-9]+', "styles.css?v=$newVersion")
    
    # Update app.js query param
    $html = [System.Text.RegularExpressions.Regex]::Replace($html, 'app\.js\?v=[0-9]+\.[0-9]+\.[0-9]+', "app.js?v=$newVersion")
    
    # Update version tags
    $html = [System.Text.RegularExpressions.Regex]::Replace($html, '<span class="app-version-tag">v[0-9]+\.[0-9]+\.[0-9]+</span>', "<span class=`"app-version-tag`">v$newVersion</span>")
    
    # Update Salud footer
    $html = [System.Text.RegularExpressions.Regex]::Replace($html, '<span>\s*(?:|&#63743;)?\s*Salud\s*•\s*v[0-9]+\.[0-9]+\.[0-9]+\s*</span>', "<span id=`"sidebar-app-version`"> Salud • v$newVersion</span>")
    $html = [System.Text.RegularExpressions.Regex]::Replace($html, '<span id="sidebar-app-version">\s*(?:|&#63743;)?\s*Salud\s*•\s*v[0-9]+\.[0-9]+\.[0-9]+\s*</span>', "<span id=`"sidebar-app-version`"> Salud • v$newVersion</span>")
    
    # Update sync text in diagnostic
    $html = [System.Text.RegularExpressions.Regex]::Replace($html, 'Estado:\s*Conectado a la Nube\s*\(v[0-9]+\.[0-9]+\.[0-9]+\)', "Estado: Conectado a la Nube (v$newVersion)")
    $html = [System.Text.RegularExpressions.Regex]::Replace($html, 'fitduo_v2 sync engine v[0-9]+\.[0-9]+\.[0-9]+', "fitduo_v2 sync engine v$newVersion")
    
    [System.IO.File]::WriteAllText($indexHtmlPath, $html, $utf8NoBom)
    Write-Host " [OK] Updated index.html" -ForegroundColor Green
}

# 6. Update app.js (header and console log)
if (Test-Path $appJsPath) {
    $appJs = [System.IO.File]::ReadAllText($appJsPath, $utf8NoBom)
    $appJs = [System.Text.RegularExpressions.Regex]::Replace($appJs, 'FitDuo & Collie Coach - Main Application Orchestrator \(v[0-9]+\.[0-9]+\.[0-9]+\)', "FitDuo & Collie Coach - Main Application Orchestrator (v$newVersion)")
    $appJs = [System.Text.RegularExpressions.Regex]::Replace($appJs, 'initialized successfully \(v[0-9]+\.[0-9]+\.[0-9]+\)', "initialized successfully (v$newVersion)")
    [System.IO.File]::WriteAllText($appJsPath, $appJs, $utf8NoBom)
    Write-Host " [OK] Updated app.js" -ForegroundColor Green
}

# 7. Git stage if requested
if ($Stage) {
    git -C $projectRoot add version.json js/version.js index.html app.js
    Write-Host " [OK] Staged updated version files in git" -ForegroundColor Green
}

Write-Host "Version bump to v$newVersion completed successfully!" -ForegroundColor Green
return $newVersion
