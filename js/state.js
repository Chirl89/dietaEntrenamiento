import { INITIAL_PROFILES } from '../data.js?v=0.8.0';

// STATE STORAGE KEYS
export const LOCAL_STORAGE_KEY = "FITDUO_APP_STATE_V1";
export const LAST_ACTIVE_PROFILE_KEY = "FITDUO_LAST_ACTIVE_PROFILE";
export const DEVICE_DEFAULT_PROFILE_KEY = "FITDUO_DEVICE_DEFAULT_PROFILE";
export const LAST_REGISTERED_METRICS_KEY = "FITDUO_LAST_REGISTERED_METRICS";
export const LAST_CLOUD_REPLICA_KEY = "FITDUO_LAST_CLOUD_REPLICA";

// INITIAL FALLBACK METRICS
export let defaultWatchMetrics = {
  he: { deviceName: "Apple Watch Series 9", moveKcal: 480, moveGoal: 600, targetKcal: 600, exerciseMin: 35, exerciseGoal: 30, targetMin: 30, steps: 8450, stepsGoal: 10000, targetSteps: 10000, hr: 72, distanceKm: 6.2, floors: 0, sleep: "--" },
  she: { deviceName: "Apple Watch SE", moveKcal: 420, moveGoal: 500, targetKcal: 500, exerciseMin: 40, exerciseGoal: 30, targetMin: 30, steps: 9120, stepsGoal: 10000, targetSteps: 10000, hr: 68, distanceKm: 6.8, floors: 0, sleep: "--" }
};

export let defaultCloudReplica = {
  he: { moveKcal: 480, exerciseMin: 35, steps: 8450, hr: 72, distanceKm: 6.2, floors: 0, sleep: "--", lastSync: new Date().toISOString(), source: "Atajo Nube en 2º Plano" },
  she: { moveKcal: 420, exerciseMin: 40, steps: 9120, hr: 68, distanceKm: 6.8, floors: 0, sleep: "--", lastSync: new Date().toISOString(), source: "Atajo Nube en 2º Plano" }
};

try {
  const savedLastMetrics = localStorage.getItem(LAST_REGISTERED_METRICS_KEY);
  if (savedLastMetrics) {
    const parsedLastMetrics = JSON.parse(savedLastMetrics);
    if (parsedLastMetrics?.he) defaultWatchMetrics.he = { ...defaultWatchMetrics.he, ...parsedLastMetrics.he };
    if (parsedLastMetrics?.she) defaultWatchMetrics.she = { ...defaultWatchMetrics.she, ...parsedLastMetrics.she };
  }
  const savedReplica = localStorage.getItem(LAST_CLOUD_REPLICA_KEY);
  if (savedReplica) {
    const parsedReplica = JSON.parse(savedReplica);
    if (parsedReplica?.he) defaultCloudReplica.he = { ...defaultCloudReplica.he, ...parsedReplica.he };
    if (parsedReplica?.she) defaultCloudReplica.she = { ...defaultCloudReplica.she, ...parsedReplica.she };
  }
} catch (e) {}

export function getTodayDayName() {
  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const idx = new Date().getDay();
  return days[idx];
}

// INITIAL STATE STRUCTURE
export let appState = {
  masterProfileId: "he", // 'he' (Carlos) or 'she' (Andrea) - Selected in Settings
  activeProfileId: "he", // 'he' (Carlos) or 'she' (Andrea) - Visual view mode
  profiles: JSON.parse(JSON.stringify(INITIAL_PROFILES)),
  exclusions: [], // Kept for backward safety
  completedWorkouts: {
    he: {
      Lunes: { done: true, watchData: { deviceName: "Apple Watch (Carlos)", durationMin: 45, kcal: 430, avgHr: 142, maxHr: 168, timestamp: "09:30 hs", autoSync: true } },
      Martes: { done: true, watchData: { deviceName: "Apple Watch (Carlos)", durationMin: 40, kcal: 390, avgHr: 136, maxHr: 160, timestamp: "18:15 hs", autoSync: true } },
      Miércoles: false, Jueves: false, Viernes: false, Sábado: false, Domingo: false
    },
    she: {
      Lunes: { done: true, watchData: { deviceName: "Apple Watch (Andrea)", durationMin: 45, kcal: 380, avgHr: 138, maxHr: 162, timestamp: "09:30 hs", autoSync: true } },
      Martes: false,
      Miércoles: { done: true, watchData: { deviceName: "Apple Watch (Andrea)", durationMin: 50, kcal: 410, avgHr: 140, maxHr: 165, timestamp: "19:00 hs", autoSync: true } },
      Jueves: false, Viernes: false, Sábado: false, Domingo: false
    }
  },
  activeDay: getTodayDayName(),
  activeWorkoutDay: getTodayDayName(),
  activeBooDay: getTodayDayName(),
  recipesDaysRange: "5", // '5' (L-V) or '7' (L-D)
  shoppingDaysRange: "5", // '5' (L-V) or '7' (L-D)
  checkedShoppingItems: {}, // { "ingredientName": true/false }
  weightLogs: {
    he: [
      { date: "Semana -4", weight: 79.5 },
      { date: "Semana -3", weight: 79.0 },
      { date: "Semana -2", weight: 78.4 },
      { date: "Semana -1", weight: 78.2 },
      { date: "Hoy", weight: 78.0 }
    ],
    she: [
      { date: "Semana -4", weight: 64.2 },
      { date: "Semana -3", weight: 63.8 },
      { date: "Semana -2", weight: 63.5 },
      { date: "Semana -1", weight: 63.1 },
      { date: "Hoy", weight: 63.0 }
    ]
  },
  appleWatch: {
    autoSyncEnabled: true,
    syncIntervalSec: 6,
    lastGlobalSync: new Date().toISOString(),
    metrics: defaultWatchMetrics,
    cloudReplica: defaultCloudReplica,
    syncLogs: []
  },
  booProgress: {
    completedContinuous: {},
    learnedTricks: [],
    activeTrickId: null,
    moodLogs: {},
    sessionNotes: {},
    accordions: {}
  },
  debugLogs: []
};

// HELPER: GET MASTER PROFILE ID (LOCKED TO THIS SPECIFIC PHYSICAL DEVICE)
export function getMasterProfileId() {
  const devicePref = localStorage.getItem(DEVICE_DEFAULT_PROFILE_KEY);
  if (devicePref === 'he' || devicePref === 'she') {
    return devicePref;
  }
  return appState.masterProfileId === 'she' ? 'she' : 'he';
}

// LOAD STATE FROM LOCALSTORAGE
export function loadSavedState() {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      appState = { ...appState, ...parsed };
    } catch (e) {
      console.warn("Could not parse saved state, using defaults.");
    }
  }

  // Device-specific master profile memory preference (Fixed to physical device)
  const devicePref = localStorage.getItem(DEVICE_DEFAULT_PROFILE_KEY);
  if (devicePref === 'he' || devicePref === 'she') {
    appState.masterProfileId = devicePref;
  } else {
    if (!appState.masterProfileId) appState.masterProfileId = 'he';
  }

  // Active visual profile preference (persist last viewed profile)
  const lastProfile = localStorage.getItem(LAST_ACTIVE_PROFILE_KEY);
  if (lastProfile === 'he' || lastProfile === 'she') {
    appState.activeProfileId = lastProfile;
  } else if (!appState.activeProfileId) {
    appState.activeProfileId = appState.masterProfileId;
  }

  // Ensure profiles structure & names exist
  if (!appState.profiles) appState.profiles = JSON.parse(JSON.stringify(INITIAL_PROFILES));
  if (!appState.profiles.he) appState.profiles.he = { ...INITIAL_PROFILES.he };
  if (!appState.profiles.she) appState.profiles.she = { ...INITIAL_PROFILES.she };
  if (!appState.profiles.dog) appState.profiles.dog = { ...INITIAL_PROFILES.dog };

  if (appState.profiles.he.name === "Él (Carlos)") appState.profiles.he.name = "Carlos";
  if (appState.profiles.she.name === "Ella (Andrea)") appState.profiles.she.name = "Andrea";
  if (appState.profiles.dog.name === "Boo (Border Collie)") appState.profiles.dog.name = "Boo";

  // Ensure ring goals in metrics
  ['he', 'she'].forEach(pid => {
    if (!appState.appleWatch.metrics) appState.appleWatch.metrics = defaultWatchMetrics;
    if (!appState.appleWatch.metrics[pid]) appState.appleWatch.metrics[pid] = { ...defaultWatchMetrics[pid] };
    const m = appState.appleWatch.metrics[pid];
    if (!m.moveGoal) m.moveGoal = m.targetKcal || (pid === 'he' ? 600 : 500);
    if (!m.exerciseGoal) m.exerciseGoal = m.targetMin || 30;
    if (!m.stepsGoal) m.stepsGoal = m.targetSteps || 10000;
    if (m.floors === undefined || m.floors === null || m.floors === 14 || m.floors === 10) m.floors = 0;
    if (!m.sleep || m.sleep === '7h 45m' || m.sleep === '8h 15m') m.sleep = '--';
  });

  // Clean cloud replica legacy hardcoded demo metrics if present
  ['he', 'she'].forEach(pid => {
    if (appState.appleWatch?.cloudReplica?.[pid]) {
      const rep = appState.appleWatch.cloudReplica[pid];
      if (rep.floors === 14 || rep.floors === 10) rep.floors = 0;
      if (rep.sleep === '7h 45m' || rep.sleep === '8h 15m') rep.sleep = '--';
    }
  });
  
  if (!appState.completedWorkouts) {
    appState.completedWorkouts = {
      he: { Lunes: false, Martes: false, Miércoles: false, Jueves: false, Viernes: false, Sábado: false, Domingo: false },
      she: { Lunes: false, Martes: false, Miércoles: false, Jueves: false, Viernes: false, Sábado: false, Domingo: false }
    };
  }
  if (!appState.completedWorkouts.he) {
    appState.completedWorkouts.he = { Lunes: false, Martes: false, Miércoles: false, Jueves: false, Viernes: false, Sábado: false, Domingo: false };
  }
  if (!appState.completedWorkouts.she) {
    appState.completedWorkouts.she = { Lunes: false, Martes: false, Miércoles: false, Jueves: false, Viernes: false, Sábado: false, Domingo: false };
  }

  // Ensure Apple Watch structure exists
  if (!appState.appleWatch) {
    appState.appleWatch = {
      syncMode: "real",
      autoSyncEnabled: true,
      syncIntervalSec: 6,
      lastGlobalSync: new Date().toISOString(),
      metrics: defaultWatchMetrics,
      syncLogs: []
    };
  }
  if (!appState.appleWatch.syncMode) {
    appState.appleWatch.syncMode = "real";
  }
}

let pushDebounceTimer = null;

export function debouncedPushToCloud(delay = 1500) {
  if (pushDebounceTimer) clearTimeout(pushDebounceTimer);
  pushDebounceTimer = setTimeout(() => {
    if (window.pushToCloud) {
      window.pushToCloud(false);
    }
  }, delay);
}

// SAVE STATE TO LOCALSTORAGE & PUSH TO CLOUD
export function saveState() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appState));
  if (appState.appleWatch?.metrics) {
    localStorage.setItem(LAST_REGISTERED_METRICS_KEY, JSON.stringify(appState.appleWatch.metrics));
  }
  if (appState.appleWatch?.cloudReplica) {
    localStorage.setItem(LAST_CLOUD_REPLICA_KEY, JSON.stringify(appState.appleWatch.cloudReplica));
  }
  debouncedPushToCloud(1500);
}

// IOS HAPTIC FEEDBACK SIMULATOR
export function triggerHapticTouch() {
  if (window.navigator && window.navigator.vibrate) {
    try { window.navigator.vibrate(15); } catch(e){}
  }
}

// FLOATING IOS TOAST NOTIFICATION SYSTEM
export function showIosToast(message, iconClass = "fa-brands fa-apple") {
  const container = document.getElementById("ios-toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "ios-toast";
  toast.innerHTML = `
    <i class="${iconClass} ios-toast-icon"></i>
    <div style="flex:1;">${message}</div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-15px) scale(0.95)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// DEBUG & DIAGNOSTIC LOGS ENGINE
export function addDebugLog(message, type = 'info', data = null) {
  if (!appState.debugLogs) appState.debugLogs = [];

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + "." + String(now.getMilliseconds()).padStart(3, '0');
  
  const logEntry = {
    id: Date.now() + "_" + Math.random().toString(36).substr(2, 4),
    timestamp: timeStr,
    message: message,
    type: type, // 'info', 'success', 'warning', 'error', 'url', 'clipboard', 'health'
    data: data ? (typeof data === 'object' ? JSON.parse(JSON.stringify(data)) : data) : null
  };

  appState.debugLogs.unshift(logEntry);
  if (appState.debugLogs.length > 60) appState.debugLogs.pop();

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appState));

  if (document.getElementById("logs-view")?.classList.contains("active")) {
    renderDebugLogsView();
  }
}

export function clearDebugLogs() {
  triggerHapticTouch();
  appState.debugLogs = [];
  saveState();
  renderDebugLogsView();
  showIosToast("🗑️ Logs de diagnóstico limpiados", "fa-solid fa-trash-can");
}

export function copyDebugLogsToClipboard() {
  triggerHapticTouch();
  if (!appState.debugLogs || appState.debugLogs.length === 0) {
    showIosToast("⚠️ No hay logs para copiar", "fa-solid fa-triangle-exclamation");
    return;
  }

  const logText = appState.debugLogs.map(l => 
    `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.message}` + (l.data ? ` | Data: ${JSON.stringify(l.data)}` : '')
  ).join("\n");

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(logText).then(() => {
      showIosToast("📋 ¡Logs copiados al portapapeles con éxito!", "fa-solid fa-copy");
    }).catch(() => {
      prompt("Copia manualmente los logs:", logText);
    });
  } else {
    prompt("Copia manualmente los logs:", logText);
  }
}

export function renderDebugLogsView() {
  const container = document.getElementById("debug-logs-container");
  if (!container) return;

  const countBadge = document.getElementById("logs-count-badge");
  if (countBadge) countBadge.innerText = `${(appState.debugLogs || []).length} Registros`;

  const urlBadge = document.getElementById("logs-env-url");
  if (urlBadge) {
    const search = window.location.search || "? (Sin parámetros)";
    urlBadge.innerText = search;
  }

  const lastSyncBadge = document.getElementById("logs-env-last-sync");
  if (lastSyncBadge) {
    const lastSync = appState.appleWatch?.lastGlobalSync;
    lastSyncBadge.innerText = lastSync ? new Date(lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "Pendiente";
  }

  const modeBadge = document.getElementById("logs-env-mode");
  if (modeBadge) {
    const mode = appState.appleWatch?.syncMode || "real";
    modeBadge.innerText = mode === "real" ? "🎯 Datos Reales (Preciso)" : "🧪 Simulación Demo";
  }

  const logs = appState.debugLogs || [];
  if (logs.length === 0) {
    container.innerHTML = `
      <div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.82rem;">
        <i class="fa-solid fa-terminal" style="font-size: 1.5rem; margin-bottom: 0.5rem; display: block; color: var(--border-color);"></i>
        No hay registros aún en la consola de diagnóstico. Realiza una acción o sincroniza para ver los eventos en vivo.
      </div>
    `;
    return;
  }

  const typeStyles = {
    info: { icon: "fa-solid fa-circle-info", color: "var(--accent-cyan)", bg: "rgba(6, 182, 212, 0.08)", border: "rgba(6, 182, 212, 0.2)" },
    success: { icon: "fa-solid fa-circle-check", color: "var(--accent-emerald)", bg: "rgba(16, 185, 129, 0.08)", border: "rgba(16, 185, 129, 0.2)" },
    warning: { icon: "fa-solid fa-triangle-exclamation", color: "var(--accent-amber)", bg: "rgba(245, 158, 11, 0.08)", border: "rgba(245, 158, 11, 0.2)" },
    error: { icon: "fa-solid fa-circle-xmark", color: "var(--accent-rose)", bg: "rgba(239, 68, 68, 0.08)", border: "rgba(239, 68, 68, 0.2)" },
    url: { icon: "fa-solid fa-link", color: "var(--accent-amber)", bg: "rgba(245, 158, 11, 0.1)", border: "rgba(245, 158, 11, 0.3)" },
    clipboard: { icon: "fa-solid fa-paste", color: "var(--accent-purple)", bg: "rgba(168, 85, 247, 0.1)", border: "rgba(168, 85, 247, 0.3)" },
    health: { icon: "fa-brands fa-apple", color: "#fff", bg: "rgba(255, 255, 255, 0.08)", border: "rgba(255, 255, 255, 0.2)" }
  };

  container.innerHTML = logs.map(l => {
    const style = typeStyles[l.type] || typeStyles.info;
    const dataHtml = l.data ? `<pre style="margin-top: 0.35rem; padding: 0.45rem; background: rgba(0,0,0,0.5); border-radius: 4px; overflow-x: auto; font-size: 0.72rem; color: #e2e8f0; border: 1px solid rgba(255,255,255,0.08);">${JSON.stringify(l.data, null, 2)}</pre>` : '';

    return `
      <div style="background: ${style.bg}; border: 1px solid ${style.border}; padding: 0.6rem 0.75rem; border-radius: var(--radius-sm); font-size: 0.78rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; margin-bottom: 0.2rem;">
          <span style="color: ${style.color}; font-weight: 700; display: flex; align-items: center; gap: 0.35rem;">
            <i class="${style.icon}"></i> [${l.type.toUpperCase()}] ${l.message}
          </span>
          <span style="color: var(--text-muted); font-size: 0.7rem;">${l.timestamp}</span>
        </div>
        ${dataHtml}
      </div>
    `;
  }).join("");
}
