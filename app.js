/**
 * FitDuo iOS Shortcut Debugger & Logger
 * Single page diagnostic tool for inspecting iOS Shortcuts payloads, URLs, and errors.
 */

// State
const logsArr = [];
let autoScroll = true;

// DOM Elements
const logsContainer = document.getElementById("logs-container");
const logCountEl = document.getElementById("log-count");
const btnRunShortcut = document.getElementById("btn-run-shortcut");
const btnCopyLogs = document.getElementById("btn-copy-logs");
const btnClearLogs = document.getElementById("btn-clear-logs");
const selectShortcut = document.getElementById("shortcut-name-select");
const inputShortcutCustom = document.getElementById("shortcut-name-custom");
const chkAutoScroll = document.getElementById("filter-auto-scroll");
const toast = document.getElementById("toast");
const toastMsg = document.getElementById("toast-message");

// Helper: Toast Notifications
function showToast(msg, iconClass = "fa-circle-check") {
  if (!toast || !toastMsg) return;
  toastMsg.textContent = msg;
  const icon = toast.querySelector(".toast-icon");
  if (icon) icon.className = `toast-icon fa-solid ${iconClass}`;
  
  toast.classList.remove("hidden");
  setTimeout(() => {
    toast.classList.add("hidden");
  }, 3000);
}

// Core Logger Engine
function addLog(msg, level = "info", data = null) {
  const now = new Date();
  const timeStr = now.toTimeString().split(" ")[0] + "." + String(now.getMilliseconds()).padStart(3, "0");
  
  const entry = {
    id: logsArr.length + 1,
    timeStr,
    timestamp: now.toISOString(),
    level: level.toLowerCase(),
    msg: typeof msg === "object" ? JSON.stringify(msg, null, 2) : String(msg),
    data: data ? (typeof data === "object" ? JSON.stringify(data, null, 2) : String(data)) : null
  };

  logsArr.push(entry);

  if (logCountEl) {
    logCountEl.textContent = logsArr.length;
  }

  renderLogEntry(entry);
}

function renderLogEntry(entry) {
  if (!logsContainer) return;

  const item = document.createElement("div");
  item.className = "log-item";

  // Badge class based on level
  let badgeClass = "info";
  if (entry.level.includes("error")) badgeClass = "error";
  else if (entry.level.includes("warn")) badgeClass = "warn";
  else if (entry.level.includes("shortcut")) badgeClass = "shortcut";
  else if (entry.level.includes("url") || entry.level.includes("param")) badgeClass = "url";
  else if (entry.level.includes("json") || entry.level.includes("data")) badgeClass = "json";

  let html = `
    <div class="log-header">
      <span class="log-time">[${entry.timeStr}]</span>
      <span class="log-badge ${badgeClass}">${entry.level}</span>
    </div>
    <div class="log-msg">${escapeHtml(entry.msg)}</div>
  `;

  if (entry.data) {
    html += `<pre class="log-data"><code>${escapeHtml(entry.data)}</code></pre>`;
  }

  item.innerHTML = html;
  logsContainer.appendChild(item);

  if (chkAutoScroll && chkAutoScroll.checked) {
    logsContainer.scrollTop = logsContainer.scrollHeight;
  }
}

function escapeHtml(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Monkey-patch Console to capture all console output
(function interceptConsole() {
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;
  const originalInfo = console.info;

  console.log = function (...args) {
    originalLog.apply(console, args);
    addLog(args.map(a => (typeof a === "object" ? JSON.stringify(a) : a)).join(" "), "console-log");
  };

  console.warn = function (...args) {
    originalWarn.apply(console, args);
    addLog(args.map(a => (typeof a === "object" ? JSON.stringify(a) : a)).join(" "), "warn");
  };

  console.error = function (...args) {
    originalError.apply(console, args);
    addLog(args.map(a => (typeof a === "object" ? JSON.stringify(a) : a)).join(" "), "error");
  };

  console.info = function (...args) {
    originalInfo.apply(console, args);
    addLog(args.map(a => (typeof a === "object" ? JSON.stringify(a) : a)).join(" "), "info");
  };
})();

// Intercept Global Errors & Unhandled Promises
window.addEventListener("error", function (e) {
  addLog(`❌ Error Global JS: ${e.message} en ${e.filename}:${e.lineno}:${e.colno}`, "error", e.error ? e.error.stack : null);
});

window.addEventListener("unhandledrejection", function (e) {
  addLog(`⚠️ Promesa Rechazada no capturada: ${e.reason}`, "error", e.reason ? e.reason.stack : null);
});

// Intercept Navigation & Visibility Events
window.addEventListener("visibilitychange", function () {
  addLog(`👁️ Visibilidad de la página cambió: document.hidden = ${document.hidden}`, "info");
  if (!document.hidden) {
    scanUrlAndStorage("Al regresar a la app");
  }
});

window.addEventListener("pageshow", function (e) {
  addLog(`📄 Evento PageShow disparado (persisted: ${e.persisted})`, "info");
  scanUrlAndStorage("PageShow");
});

window.addEventListener("hashchange", function () {
  addLog(`🔗 Hash de URL cambió: ${window.location.hash}`, "url");
  scanUrlAndStorage("HashChange");
});

window.addEventListener("popstate", function (e) {
  addLog(`🔗 PopState de URL cambió: ${window.location.href}`, "url", e.state);
  scanUrlAndStorage("PopState");
});

// Deep Scanner for URL Parameters & Payloads
function scanUrlAndStorage(context = "Init") {
  addLog(`🔍 Escaneando parámetros de URL y estado (${context})...`, "info");

  const fullUrl = window.location.href;
  const searchStr = window.location.search;
  const hashStr = window.location.hash;

  addLog(`🌐 URL Completa: ${fullUrl}`, "info");
  addLog(`🔍 window.location.search: "${searchStr}" | window.location.hash: "${hashStr}"`, "info");

  // Parse Query Search Params
  let queryParamsObj = {};
  if (searchStr) {
    const params = new URLSearchParams(searchStr);
    for (const [key, val] of params.entries()) {
      queryParamsObj[key] = val;
    }
  }

  // Parse Hash Params if present (e.g. #data=... or #kcal=...)
  let hashParamsObj = {};
  if (hashStr && hashStr.length > 1) {
    const cleanHash = hashStr.substring(1);
    if (cleanHash.includes("=")) {
      const searchFromHash = cleanHash.includes("?") ? cleanHash.substring(cleanHash.indexOf("?")) : cleanHash;
      const params = new URLSearchParams(searchFromHash);
      for (const [key, val] of params.entries()) {
        hashParamsObj[key] = val;
      }
    } else {
      hashParamsObj["_rawHash"] = cleanHash;
    }
  }

  const hasQueryParams = Object.keys(queryParamsObj).length > 0;
  const hasHashParams = Object.keys(hashParamsObj).length > 0;

  if (hasQueryParams) {
    addLog(`📥 Parámetros detectados en Query String (?):`, "url", queryParamsObj);
    inspectPayloadData(queryParamsObj);
  }

  if (hasHashParams) {
    addLog(`📥 Parámetros detectados en Hash (#):`, "url", hashParamsObj);
    inspectPayloadData(hashParamsObj);
  }

  if (!hasQueryParams && !hasHashParams) {
    addLog(`ℹ️ No se encontraron parámetros query (?) ni hash (#) en la URL.`, "info");
  }

  // Storage Inspection
  try {
    const lastLaunch = sessionStorage.getItem("fitduo_last_launched");
    if (lastLaunch) {
      addLog(`🕒 Atajo lanzado previamente registrado en SessionStorage: ${lastLaunch}`, "shortcut");
    }
  } catch (e) {
    addLog(`⚠️ Error accediendo a SessionStorage: ${e.message}`, "warn");
  }
}

// Inspect if payload contains JSON strings or encoded data
function inspectPayloadData(paramsObj) {
  for (const [key, val] of Object.entries(paramsObj)) {
    if (typeof val === "string" && (val.startsWith("{") || val.startsWith("["))) {
      try {
        const parsed = JSON.parse(val);
        addLog(`📦 Campo JSON decodificado de URL [${key}]:`, "json", parsed);
      } catch (e) {
        // Not valid JSON
      }
    } else if (typeof val === "string" && val.length > 20) {
      try {
        const decoded = decodeURIComponent(val);
        if (decoded !== val && (decoded.startsWith("{") || decoded.startsWith("["))) {
          const parsed = JSON.parse(decoded);
          addLog(`📦 Campo JSON URI-decoded de URL [${key}]:`, "json", parsed);
        }
      } catch (e) {
        // Not valid encoded JSON
      }
    }
  }
}

// Action: Execute iOS Shortcut
function launchShortcut() {
  let shortcutName = selectShortcut ? selectShortcut.value : "SincronizarSaludFitDuo";
  if (shortcutName === "custom") {
    shortcutName = inputShortcutCustom ? inputShortcutCustom.value.trim() : "";
  }

  if (!shortcutName) {
    addLog("❌ Error: Nombre del atajo no especificado.", "error");
    showToast("Escribe un nombre de atajo válido", "fa-triangle-exclamation");
    return;
  }

  // Save selected shortcut to local storage for convenience
  try {
    localStorage.setItem("fitduo_debug_shortcut_name", shortcutName);
  } catch (e) {}

  const shortcutUrl = `shortcuts://run-shortcut?name=${encodeURIComponent(shortcutName)}`;

  addLog(`⚡ ==========================================`, "shortcut");
  addLog(`⚡ EJECUTANDO ATAJO DE IOS: "${shortcutName}"`, "shortcut");
  addLog(`⚡ URL Scheme generada: ${shortcutUrl}`, "shortcut");
  addLog(`⚡ ==========================================`, "shortcut");

  try {
    sessionStorage.setItem("fitduo_last_launched", new Date().toISOString());
  } catch (e) {}

  showToast(`⚡ Lanzando Atajo "${shortcutName}"...`, "fa-bolt");

  setTimeout(() => {
    window.location.href = shortcutUrl;
  }, 300);
}

// Action: Copy Logs to Clipboard
async function copyLogsToClipboard() {
  if (logsArr.length === 0) {
    showToast("No hay logs para copiar", "fa-circle-info");
    return;
  }

  const header = `==========================================
FITDUO SHORTCUT DEBUG LOGS EXPORT
Fecha: ${new Date().toLocaleString()}
URL Actual: ${window.location.href}
User-Agent: ${navigator.userAgent}
Total Entradas: ${logsArr.length}
==========================================\n\n`;

  const logsText = logsArr.map(l => {
    let line = `[${l.timeStr}] [${l.level.toUpperCase()}] ${l.msg}`;
    if (l.data) {
      line += `\nDATA: ${l.data}`;
    }
    return line;
  }).join("\n\n");

  const fullExportText = header + logsText;

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(fullExportText);
    } else {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = fullExportText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }

    addLog(`📋 Copiados ${logsArr.length} registros de log al portapapeles con éxito.`, "info");
    showToast(`📋 ${logsArr.length} logs copiados al portapapeles`, "fa-clipboard");
  } catch (err) {
    addLog(`❌ Error copiando al portapapeles: ${err.message}`, "error");
    showToast("Error al copiar al portapapeles", "fa-triangle-exclamation");
  }
}

// Action: Clear Screen Logs
function clearLogs() {
  logsArr.length = 0;
  if (logsContainer) logsContainer.innerHTML = "";
  if (logCountEl) logCountEl.textContent = "0";
  addLog("🧹 Pantalla de logs limpiada.", "info");
}

// Event Listeners Setup
function initApp() {
  // Dropdown selector custom toggle
  if (selectShortcut) {
    selectShortcut.addEventListener("change", function () {
      if (this.value === "custom") {
        if (inputShortcutCustom) inputShortcutCustom.style.display = "block";
      } else {
        if (inputShortcutCustom) inputShortcutCustom.style.display = "none";
      }
    });

    // Restore saved shortcut preference if exists
    try {
      const savedName = localStorage.getItem("fitduo_debug_shortcut_name");
      if (savedName) {
        if (savedName === "SincronizarSaludFitDuo" || savedName === "SincronizarEntrenamientoFitDuo") {
          selectShortcut.value = savedName;
        } else {
          selectShortcut.value = "custom";
          if (inputShortcutCustom) {
            inputShortcutCustom.value = savedName;
            inputShortcutCustom.style.display = "block";
          }
        }
      }
    } catch (e) {}
  }

  // Button 1: Run Shortcut
  if (btnRunShortcut) {
    btnRunShortcut.addEventListener("click", launchShortcut);
  }

  // Button 2: Copy Logs
  if (btnCopyLogs) {
    btnCopyLogs.addEventListener("click", copyLogsToClipboard);
  }

  // Clear Logs Button
  if (btnClearLogs) {
    btnClearLogs.addEventListener("click", clearLogs);
  }

  // Startup Diagnostics Log
  addLog("🚀 === FITDUO SHORTCUT DEBUGGER & LOGGER INICIADO ===", "info");
  addLog(`📱 Dispositivo / User Agent: ${navigator.userAgent}`, "info");
  addLog(`🍏 ¿Dispositivo iOS?: ${/iPhone|iPad|iPod/i.test(navigator.userAgent) ? "SÍ" : "NO"}`, "info");
  addLog(`📲 Modo PWA Standalone: ${window.navigator.standalone ? "SÍ" : "NO"}`, "info");
  addLog(`📄 Document Referrer: "${document.referrer || "Ninguno"}"`, "info");

  // Initial Scan
  scanUrlAndStorage("Carga Inicial");
}

// Initialize when DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
