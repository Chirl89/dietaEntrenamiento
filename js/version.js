/**
 * FitDuo & Collie Coach - Centralized Application Version
 * AUTO-GENERATED - DO NOT EDIT MANUALLY
 */
export const APP_VERSION = "0.19.9";

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
