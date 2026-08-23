#!/bin/sh
# FitDuo & Collie Coach - Automated Version Bumper (POSIX Shell)

TYPE="${1:-patch}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# If powershell is available, delegate to powershell script for consistency
if command -v powershell.exe >/dev/null 2>&1; then
    powershell.exe -ExecutionPolicy Bypass -File "$SCRIPT_DIR/bump-version.ps1" -Type "$TYPE"
    exit $?
fi

# Fallback POSIX implementation
VERSION_JSON="$PROJECT_ROOT/version.json"
INDEX_HTML="$PROJECT_ROOT/index.html"
APP_JS="$PROJECT_ROOT/app.js"
VERSION_JS="$PROJECT_ROOT/js/version.js"

CURRENT_VERSION="0.16.0"
if [ -f "$VERSION_JSON" ]; then
    CURRENT_VERSION=$(grep -o '"version": *"[^"]*"' "$VERSION_JSON" | head -1 | cut -d'"' -f4)
fi

MAJOR=$(echo "$CURRENT_VERSION" | cut -d. -f1)
MINOR=$(echo "$CURRENT_VERSION" | cut -d. -f2)
PATCH=$(echo "$CURRENT_VERSION" | cut -d. -f3)

case "$TYPE" in
    major)
        MAJOR=$((MAJOR + 1))
        MINOR=0
        PATCH=0
        ;;
    minor)
        MINOR=$((MINOR + 1))
        PATCH=0
        ;;
    patch|*)
        PATCH=$((PATCH + 1))
        ;;
esac

NEW_VERSION="$MAJOR.$MINOR.$PATCH"
echo "FitDuo Version Bump (sh): v$CURRENT_VERSION -> v$NEW_VERSION ($TYPE)"

cat <<EOF > "$VERSION_JSON"
{
  "version": "$NEW_VERSION",
  "lastUpdated": "$(date -u +'%Y-%m-%dT%H:%M:%SZ')",
  "previousVersion": "$CURRENT_VERSION"
}
EOF

cat <<EOF > "$VERSION_JS"
/**
 * FitDuo & Collie Coach - Centralized Application Version
 * AUTO-GENERATED - DO NOT EDIT MANUALLY
 */
export const APP_VERSION = "$NEW_VERSION";

export function applyAppVersionToDOM() {
  const vStr = "v" + APP_VERSION;
  document.querySelectorAll('.app-version-tag').forEach(el => {
    el.textContent = vStr;
  });
  const sidebarVersionEl = document.getElementById('sidebar-app-version');
  if (sidebarVersionEl) {
    sidebarVersionEl.textContent = " Salud • " + vStr;
  }
  const cloudStatusText = document.getElementById('cloud-sync-status-text');
  if (cloudStatusText && cloudStatusText.textContent.includes('Conectado')) {
    cloudStatusText.textContent = "Estado: Conectado a la Nube (" + vStr + ")";
  }
}
EOF

if [ -f "$INDEX_HTML" ]; then
    sed -i "s/styles\.css?v=[0-9]*\.[0-9]*\.[0-9]*/styles.css?v=$NEW_VERSION/g" "$INDEX_HTML"
    sed -i "s/app\.js?v=[0-9]*\.[0-9]*\.[0-9]*/app.js?v=$NEW_VERSION/g" "$INDEX_HTML"
    sed -i "s/<span class=\"app-version-tag\">v[0-9]*\.[0-9]*\.[0-9]*<\/span>/<span class=\"app-version-tag\">v$NEW_VERSION<\/span>/g" "$INDEX_HTML"
    sed -i "s/Estado: Conectado a la Nube (v[0-9]*\.[0-9]*\.[0-9]*)/Estado: Conectado a la Nube (v$NEW_VERSION)/g" "$INDEX_HTML"
    sed -i "s/fitduo_v2 sync engine v[0-9]*\.[0-9]*\.[0-9]*/fitduo_v2 sync engine v$NEW_VERSION/g" "$INDEX_HTML"
fi

if [ -f "$APP_JS" ]; then
    sed -i "s/FitDuo & Collie Coach - Main Application Orchestrator (v[0-9]*\.[0-9]*\.[0-9]*)/FitDuo & Collie Coach - Main Application Orchestrator (v$NEW_VERSION)/g" "$APP_JS"
    sed -i "s/initialized successfully (v[0-9]*\.[0-9]*\.[0-9]*)/initialized successfully (v$NEW_VERSION)/g" "$APP_JS"
fi

echo "Version bump to v$NEW_VERSION completed successfully!"
