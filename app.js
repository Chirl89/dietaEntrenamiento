/**
 * FitDuo & Collie Coach - Main Application Engine (v0.9.12)
 * Integrated Architecture: UI Views, State Machine, Local Storage & PubNub Cloud Sync
 */

import {
  INITIAL_PROFILES as DATA_INITIAL_PROFILES,
  RECIPES_DATABASE as DATA_RECIPES_DATABASE,
  WEEKLY_WORKOUT_SCHEDULE as DATA_WEEKLY_WORKOUT_SCHEDULE,
  INGREDIENT_CATEGORIES as DATA_INGREDIENT_CATEGORIES,
  BOO_TRAINING_MODULES as DATA_BOO_TRAINING_MODULES,
  BOO_WEEKLY_SCHEDULE as DATA_BOO_WEEKLY_SCHEDULE,
  BOO_CONTINUOUS_REINFORCEMENT as DATA_BOO_CONTINUOUS_REINFORCEMENT,
  BOO_TRICKS_BACKLOG as DATA_BOO_TRICKS_BACKLOG
} from './data.js?v=0.8.2';

const INITIAL_PROFILES = DATA_INITIAL_PROFILES || window.INITIAL_PROFILES;
const RECIPES_DATABASE = DATA_RECIPES_DATABASE || window.RECIPES_DATABASE;
const WEEKLY_WORKOUT_SCHEDULE = DATA_WEEKLY_WORKOUT_SCHEDULE || window.WEEKLY_WORKOUT_SCHEDULE;
const INGREDIENT_CATEGORIES = DATA_INGREDIENT_CATEGORIES || window.INGREDIENT_CATEGORIES;
const BOO_TRAINING_MODULES = DATA_BOO_TRAINING_MODULES || window.BOO_TRAINING_MODULES;
const BOO_WEEKLY_SCHEDULE = DATA_BOO_WEEKLY_SCHEDULE || window.BOO_WEEKLY_SCHEDULE;
const BOO_CONTINUOUS_REINFORCEMENT = DATA_BOO_CONTINUOUS_REINFORCEMENT || window.BOO_CONTINUOUS_REINFORCEMENT;
const BOO_TRICKS_BACKLOG = DATA_BOO_TRICKS_BACKLOG || window.BOO_TRICKS_BACKLOG;

// ==========================================
// 1. STATE & STORAGE MANAGEMENT
// ==========================================
export const LOCAL_STORAGE_KEY = "FITDUO_APP_STATE_V1";
export const LAST_ACTIVE_PROFILE_KEY = "FITDUO_LAST_ACTIVE_PROFILE";
export const DEVICE_DEFAULT_PROFILE_KEY = "FITDUO_DEVICE_DEFAULT_PROFILE";
export const LAST_REGISTERED_METRICS_KEY = "FITDUO_LAST_REGISTERED_METRICS";
export const LAST_CLOUD_REPLICA_KEY = "FITDUO_LAST_CLOUD_REPLICA";

export const defaultWatchMetrics = {
  he: { deviceName: "Apple Watch Series 9", moveKcal: 480, moveGoal: 600, targetKcal: 600, exerciseMin: 35, exerciseGoal: 30, targetMin: 30, steps: 8450, stepsGoal: 10000, targetSteps: 10000, hr: 72, distanceKm: 6.2, floors: 0, sleep: "--" },
  she: { deviceName: "Apple Watch SE", moveKcal: 420, moveGoal: 500, targetKcal: 500, exerciseMin: 40, exerciseGoal: 30, targetMin: 30, steps: 9120, stepsGoal: 10000, targetSteps: 10000, hr: 68, distanceKm: 6.8, floors: 0, sleep: "--" }
};

export const defaultCloudReplica = {
  he: { moveKcal: 480, exerciseMin: 35, steps: 8450, hr: 72, distanceKm: 6.2, floors: 0, sleep: "--", lastSync: new Date().toISOString(), source: "Atajo Nube en 2º Plano" },
  she: { moveKcal: 420, exerciseMin: 40, steps: 9120, hr: 68, distanceKm: 6.8, floors: 0, sleep: "--", lastSync: new Date().toISOString(), source: "Atajo Nube en 2º Plano" }
};

export function getTodayDayName() {
  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  return days[new Date().getDay()];
}

export const appState = {
  masterProfileId: "he",
  activeProfileId: "he",
  profiles: JSON.parse(JSON.stringify(INITIAL_PROFILES || {})),
  exclusions: [],
  completedWorkouts: {
    he: {
      Lunes: { done: false, watchData: null, sessions: [] },
      Martes: { done: false, watchData: null, sessions: [] },
      Miércoles: { done: false, watchData: null, sessions: [] },
      Jueves: { done: false, watchData: null, sessions: [] },
      Viernes: { done: false, watchData: null, sessions: [] },
      Sábado: { done: false, watchData: null, sessions: [] },
      Domingo: { done: false, watchData: null, sessions: [] }
    },
    she: {
      Lunes: { done: false, watchData: null, sessions: [] },
      Martes: { done: false, watchData: null, sessions: [] },
      Miércoles: { done: false, watchData: null, sessions: [] },
      Jueves: { done: false, watchData: null, sessions: [] },
      Viernes: { done: false, watchData: null, sessions: [] },
      Sábado: { done: false, watchData: null, sessions: [] },
      Domingo: { done: false, watchData: null, sessions: [] }
    }
  },
  activeDay: getTodayDayName(),
  activeWorkoutDay: getTodayDayName(),
  activeBooDay: getTodayDayName(),
  recipesDaysRange: "5",
  shoppingDaysRange: "5",
  checkedShoppingItems: {},
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
    syncMode: "real",
    autoSyncEnabled: true,
    syncIntervalSec: 6,
    lastGlobalSync: new Date().toISOString(),
    metrics: JSON.parse(JSON.stringify(defaultWatchMetrics)),
    cloudReplica: JSON.parse(JSON.stringify(defaultCloudReplica)),
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

export function getMasterProfileId() {
  const devicePref = localStorage.getItem(DEVICE_DEFAULT_PROFILE_KEY);
  if (devicePref === 'he' || devicePref === 'she') {
    return devicePref;
  }
  return appState.masterProfileId === 'she' ? 'she' : 'he';
}

export function loadSavedState() {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        Object.assign(appState, parsed);
      }
    } catch (e) {
      console.warn("Could not parse saved state, using defaults.");
    }
  }

  const devicePref = localStorage.getItem(DEVICE_DEFAULT_PROFILE_KEY);
  if (devicePref === 'he' || devicePref === 'she') {
    appState.masterProfileId = devicePref;
  } else if (!appState.masterProfileId) {
    appState.masterProfileId = 'he';
  }

  const lastProfile = localStorage.getItem(LAST_ACTIVE_PROFILE_KEY);
  if (lastProfile === 'he' || lastProfile === 'she') {
    appState.activeProfileId = lastProfile;
  } else if (!appState.activeProfileId) {
    appState.activeProfileId = appState.masterProfileId;
  }

  if (!appState.profiles) appState.profiles = JSON.parse(JSON.stringify(INITIAL_PROFILES || {}));
  if (!appState.profiles.he) appState.profiles.he = { ...INITIAL_PROFILES.he };
  if (!appState.profiles.she) appState.profiles.she = { ...INITIAL_PROFILES.she };
  if (!appState.profiles.dog) appState.profiles.dog = { ...INITIAL_PROFILES.dog };

  if (appState.profiles.he.name === "Él (Carlos)") appState.profiles.he.name = "Carlos";
  if (appState.profiles.she.name === "Ella (Andrea)") appState.profiles.she.name = "Andrea";
  if (appState.profiles.dog.name === "Boo (Border Collie)") appState.profiles.dog.name = "Boo";

  if (!appState.appleWatch) {
    appState.appleWatch = {
      syncMode: "real",
      autoSyncEnabled: true,
      syncIntervalSec: 6,
      lastGlobalSync: new Date().toISOString(),
      metrics: JSON.parse(JSON.stringify(defaultWatchMetrics)),
      cloudReplica: JSON.parse(JSON.stringify(defaultCloudReplica)),
      syncLogs: []
    };
  }
  if (!appState.appleWatch.metrics) {
    appState.appleWatch.metrics = JSON.parse(JSON.stringify(defaultWatchMetrics));
  }

  ['he', 'she'].forEach(pid => {
    if (!appState.appleWatch.metrics[pid]) appState.appleWatch.metrics[pid] = { ...defaultWatchMetrics[pid] };
    const m = appState.appleWatch.metrics[pid];
    if (!m.moveGoal) m.moveGoal = m.targetKcal || (pid === 'he' ? 600 : 500);
    if (!m.exerciseGoal) m.exerciseGoal = m.targetMin || 30;
    if (!m.stepsGoal) m.stepsGoal = m.targetSteps || 10000;
    if (m.floors === undefined || m.floors === null || m.floors === 14 || m.floors === 10) m.floors = 0;
    if (!m.sleep || m.sleep === '7h 45m' || m.sleep === '8h 15m') m.sleep = '--';
  });

  ['he', 'she'].forEach(pid => {
    if (appState.appleWatch?.cloudReplica?.[pid]) {
      const rep = appState.appleWatch.cloudReplica[pid];
      if (rep.floors === 14 || rep.floors === 10) rep.floors = 0;
      if (rep.sleep === '7h 45m' || rep.sleep === '8h 15m') rep.sleep = '--';
    }
  });
  
  if (!appState.completedWorkouts) {
    appState.completedWorkouts = {
      he: { Lunes: { done: false, watchData: null, sessions: [] }, Martes: { done: false, watchData: null, sessions: [] }, Miércoles: { done: false, watchData: null, sessions: [] }, Jueves: { done: false, watchData: null, sessions: [] }, Viernes: { done: false, watchData: null, sessions: [] }, Sábado: { done: false, watchData: null, sessions: [] }, Domingo: { done: false, watchData: null, sessions: [] } },
      she: { Lunes: { done: false, watchData: null, sessions: [] }, Martes: { done: false, watchData: null, sessions: [] }, Miércoles: { done: false, watchData: null, sessions: [] }, Jueves: { done: false, watchData: null, sessions: [] }, Viernes: { done: false, watchData: null, sessions: [] }, Sábado: { done: false, watchData: null, sessions: [] }, Domingo: { done: false, watchData: null, sessions: [] } }
    };
  }

  ['he', 'she'].forEach(pid => {
    if (appState.completedWorkouts?.[pid]) {
      for (const [day, dayObj] of Object.entries(appState.completedWorkouts[pid])) {
        if (dayObj && Array.isArray(dayObj.sessions) && dayObj.sessions.length > 1) {
          const uniqueSessions = [];
          for (const s of dayObj.sessions) {
            const exists = uniqueSessions.some(u =>
              (u.id && s.id && u.id === s.id) ||
              (u.durationMin === s.durationMin && u.kcal === s.kcal && u.timestamp === s.timestamp)
            );
            if (!exists) uniqueSessions.push(s);
          }
          dayObj.sessions = uniqueSessions;
        }
      }
    }
  });
}

let pushDebounceTimer = null;
export function debouncedPushToCloud(delay = 1500) {
  if (pushDebounceTimer) clearTimeout(pushDebounceTimer);
  pushDebounceTimer = setTimeout(() => {
    pushToCloud(false);
  }, delay);
}

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

export function triggerHapticTouch() {
  if (window.navigator && window.navigator.vibrate) {
    try { window.navigator.vibrate(15); } catch(e){}
  }
}

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

export function addDebugLog(message, type = 'info', data = null) {
  if (!appState.debugLogs) appState.debugLogs = [];
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + "." + String(now.getMilliseconds()).padStart(3, '0');
  
  const logEntry = {
    id: Date.now() + "_" + Math.random().toString(36).substr(2, 4),
    timestamp: timeStr,
    message: message,
    type: type,
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
    urlBadge.innerText = window.location.search || "? (Sin parámetros)";
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

// ==========================================
// 2. SHARED UTILITIES & PARSERS
// ==========================================
export function parseSmartMetricValue(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') {
    if (isNaN(val) || !isFinite(val)) return null;
    if (val > 50000) return Math.round(val / 4184);
    return Math.round(val);
  }
  if (Array.isArray(val)) {
    if (val.length === 0) return null;
    const validNums = val.map(v => parseSmartMetricValue(v)).filter(v => v !== null && v >= 0);
    if (validNums.length === 0) return null;
    return validNums[validNums.length - 1];
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed === '0') return 0;
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) return null;
    const clean = trimmed.replace(/,/g, '.');
    const floatVal = parseFloat(clean);
    if (!isNaN(floatVal) && isFinite(floatVal)) {
      if (floatVal > 50000) return Math.round(floatVal / 4184);
      return Math.round(floatVal);
    }
    const match = clean.match(/(\d+(?:\.\d+)?)/);
    if (match) {
      const parsed = parseFloat(match[1]);
      if (!isNaN(parsed) && isFinite(parsed)) {
        if (parsed > 50000) return Math.round(parsed / 4184);
        return Math.round(parsed);
      }
    }
    return null;
  }
  return null;
}

export function parseSmartMetricFloatValue(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') {
    if (isNaN(val) || !isFinite(val)) return null;
    if (val > 100) return parseFloat((val / 1000).toFixed(2));
    return parseFloat(val.toFixed(2));
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed === '0' || trimmed === '0.0' || trimmed === '0.00') return 0;
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) return null;
    const clean = trimmed.replace(/,/g, '.');
    const floatVal = parseFloat(clean);
    if (!isNaN(floatVal) && isFinite(floatVal)) {
      if (floatVal > 100) return parseFloat((floatVal / 1000).toFixed(2));
      return parseFloat(floatVal.toFixed(2));
    }
    const match = clean.match(/(\d+(?:\.\d+)?)/);
    if (match) {
      const parsed = parseFloat(match[1]);
      if (!isNaN(parsed) && isFinite(parsed)) {
        if (parsed > 100) return parseFloat((parsed / 1000).toFixed(2));
        return parseFloat(parsed.toFixed(2));
      }
    }
    return null;
  }
  return null;
}

export function parseSmartMetricArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(v => parseInt(v)).filter(v => !isNaN(v));
  if (typeof val === 'string') {
    return val.split(',').map(s => parseInt(s.trim())).filter(v => !isNaN(v));
  }
  const p = parseInt(val);
  return isNaN(p) ? [] : [p];
}

export function formatSmartSleepValue(val) {
  if (val === null || val === undefined || val === '') return '--';
  if (typeof val === 'string') {
    const s = val.trim();
    if (s.startsWith('[') && s.endsWith(']')) return '--';
    if (s === '0' || s === '0.0' || s === '0.00' || s === '0h' || s === '0m' || s === '0h 0m' || s === '0:00' || s === '-' || s === '--' || s.toLowerCase() === 'null' || s.toLowerCase() === 'undefined' || s.toLowerCase() === 'nan') {
      return '--';
    }
    if (s.toLowerCase().includes('h') || s.toLowerCase().includes('m') || s.includes(':')) {
      return s;
    }
    const num = parseFloat(s.replace(',', '.'));
    if (!isNaN(num)) val = num;
    else return s;
  }
  if (typeof val === 'number') {
    if (val <= 0 || isNaN(val) || !isFinite(val)) return '--';
    if (val < 24) {
      const hrs = Math.floor(val);
      const mins = Math.round((val - hrs) * 60);
      if (hrs === 0 && mins === 0) return '--';
      return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
    } else {
      const hrs = Math.floor(val / 60);
      const mins = Math.round(val % 60);
      if (hrs === 0 && mins === 0) return '--';
      return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
    }
  }
  return String(val);
}

export function formatSyncRelativeTime(lastSyncDate) {
  if (!lastSyncDate) return "Sincronizado hace 0 segundos";
  const now = new Date();
  const past = new Date(lastSyncDate);
  const diffSec = Math.max(0, Math.floor((now - past) / 1000));
  if (diffSec < 60) return `Sincronizado hace ${diffSec} segundos`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `Sincronizado hace ${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'}`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Sincronizado hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
  const diffDays = Math.floor(diffHours / 24);
  return `Sincronizado hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
}

export function toUrlSafeB64(jsonObj) {
  try {
    const str = JSON.stringify(jsonObj);
    const b64 = btoa(unescape(encodeURIComponent(str)));
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  } catch (e) {
    return "";
  }
}

export function fromUrlSafeB64(b64Str) {
  try {
    if (!b64Str || typeof b64Str !== 'string') return null;
    let base64 = b64Str.trim().replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    const jsonStr = decodeURIComponent(escape(atob(base64)));
    const parsed = JSON.parse(jsonStr);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch (e) {}
  return null;
}

// ==========================================
// 3. NAVIGATION & CATEGORIES
// ==========================================
export const NAVIGATION_CATEGORIES = {
  summary: {
    name: "Resumen & Salud",
    dockId: "dock-btn-summary",
    sidebarId: "sidebar-nav-summary",
    subtabs: [
      { id: "summary-view", label: "Resumen Diario", icon: "fa-solid fa-gauge-high" }
    ]
  },
  nutrition: {
    name: "Nutrición",
    dockId: "dock-btn-nutrition",
    sidebarId: "sidebar-nav-nutrition",
    subtabs: [
      { id: "nutrition-menu-view", label: "Menú del Día", icon: "fa-solid fa-utensils" },
      { id: "nutrition-recipes-view", label: "Recetas", icon: "fa-solid fa-book-open" },
      { id: "nutrition-shopping-view", label: "Lista de la Compra", icon: "fa-solid fa-cart-shopping" }
    ]
  },
  workouts: {
    name: "Entrenamiento",
    dockId: "dock-btn-workouts",
    sidebarId: "sidebar-nav-workouts",
    subtabs: [
      { id: "workouts-view", label: "Entrenamientos", icon: "fa-solid fa-dumbbell" },
      { id: "workouts-boo-view", label: "Boo", icon: "fa-solid fa-dog" },
      { id: "workouts-exercises-view", label: "Tabla de Ejercicios", icon: "fa-solid fa-list-check" }
    ]
  },
  profile: {
    name: "Ajustes",
    dockId: "dock-btn-profile",
    sidebarId: "sidebar-nav-profile",
    subtabs: [
      { id: "settings-view", label: "Ajustes & Nube", icon: "fa-solid fa-gear" },
      { id: "apple-watch-view", label: "Atajos de Salud", icon: "fa-brands fa-apple" }
    ]
  }
};

export function switchCategory(categoryKey, targetTabId = null, btnElement = null) {
  triggerHapticTouch();
  const cat = NAVIGATION_CATEGORIES[categoryKey];
  if (!cat) return;

  if (categoryKey === 'workouts') {
    const today = getTodayDayName();
    appState.activeWorkoutDay = today;
    appState.activeBooDay = today;
    const selectElem = document.getElementById("workout-day-select");
    if (selectElem) selectElem.value = today;
    const booSelect = document.getElementById("boo-day-select");
    if (booSelect) booSelect.value = today;
  }

  let tabToOpen = cat.subtabs[0].id;
  if (targetTabId && cat.subtabs.some(s => s.id === targetTabId)) {
    tabToOpen = targetTabId;
  }
  showTab(tabToOpen);
}

export function renderSubtabSegmentedControl(categoryKey, activeTabId) {
  const container = document.getElementById("ios-segmented-control-inner");
  if (!container) return;

  const cat = NAVIGATION_CATEGORIES[categoryKey];
  if (!cat || !cat.subtabs || cat.subtabs.length <= 1) {
    if (container.parentElement) container.parentElement.style.cssText = "display: none !important;";
    return;
  }

  if (container.parentElement) {
    container.parentElement.style.cssText = "display: flex !important; visibility: visible !important;";
  }

  container.innerHTML = cat.subtabs.map(sub => `
    <button type="button" class="ios-segmented-btn ${sub.id === activeTabId ? 'active' : ''}" onclick="showTab('${sub.id}')">
      <i class="${sub.icon}"></i>
      <span>${sub.label}</span>
    </button>
  `).join("");
}

export function updateProfileSwitcherButtonsUI() {
  const profileId = appState.activeProfileId || "he";
  const btnHe = document.getElementById("btn-profile-he");
  const btnShe = document.getElementById("btn-profile-she");
  if (btnHe) btnHe.classList.toggle("active", profileId === "he");
  if (btnShe) btnShe.classList.toggle("active", profileId === "she");

  const iosBtnHe = document.getElementById("ios-btn-profile-he");
  const iosBtnShe = document.getElementById("ios-btn-profile-she");
  if (iosBtnHe) iosBtnHe.classList.toggle("active", profileId === "he");
  if (iosBtnShe) iosBtnShe.classList.toggle("active", profileId === "she");
}

export function renderAll() {
  updateProfileSwitcherButtonsUI();
  renderSummaryView();
  renderProfileView();
  renderNutritionMenuView();
  renderNutritionRecipesView();
  renderShoppingView();
  renderWorkoutsView();
  renderBooWorkoutView();
  renderExerciseTableView();
  renderProgressView();
  renderSettingsView();
  updateHeaderWatchBadge();

  if (document.getElementById("apple-watch-modal")?.classList.contains("active")) {
    updateAppleWatchModalUI();
  }

  if (document.getElementById("logs-view")?.classList.contains("active")) {
    renderDebugLogsView();
  }

  const activePanel = document.querySelector(".view-panel.active");
  const activeTabId = activePanel ? activePanel.id : "summary-view";
  let activeCatKey = 'summary';
  for (const [catKey, catObj] of Object.entries(NAVIGATION_CATEGORIES)) {
    if (catObj.subtabs && catObj.subtabs.some(s => s.id === activeTabId)) {
      activeCatKey = catKey;
      break;
    }
  }
  renderSubtabSegmentedControl(activeCatKey, activeTabId);
}

export function switchProfile(profileId) {
  triggerHapticTouch();
  appState.activeProfileId = profileId;
  localStorage.setItem(LAST_ACTIVE_PROFILE_KEY, profileId);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appState));

  updateProfileSwitcherButtonsUI();
  renderAll();

  const viewName = profileId === 'he' ? 'Carlos' : 'Andrea';
  showIosToast(`👁️ Visualizando a ${viewName}`, "fa-solid fa-eye");
}

export function showTab(tabId, btnElement) {
  triggerHapticTouch();

  if (tabId === 'nutrition-view' || tabId === 'nutrition') {
    tabId = 'nutrition-menu-view';
  } else if (tabId === 'shopping-view') {
    tabId = 'nutrition-shopping-view';
  }

  let activeCatKey = 'summary';
  for (const [catKey, catObj] of Object.entries(NAVIGATION_CATEGORIES)) {
    if (catObj.subtabs && catObj.subtabs.some(s => s.id === tabId)) {
      activeCatKey = catKey;
      break;
    }
  }

  document.querySelectorAll(".view-panel").forEach(panel => panel.classList.remove("active"));
  const targetPanel = document.getElementById(tabId) || document.getElementById("nutrition-menu-view");
  if (targetPanel) {
    targetPanel.classList.add("active");
  }

  const catObj = NAVIGATION_CATEGORIES[activeCatKey];
  if (catObj) {
    document.querySelectorAll(".ios-dock-btn").forEach(btn => btn.classList.remove("active"));
    document.querySelectorAll(".nav-menu button").forEach(btn => btn.classList.remove("active"));

    const dockBtn = document.getElementById(catObj.dockId);
    if (dockBtn) dockBtn.classList.add("active");

    const sidebarBtn = document.getElementById(catObj.sidebarId);
    if (sidebarBtn) sidebarBtn.classList.add("active");
  }

  renderSubtabSegmentedControl(activeCatKey, tabId);

  if (tabId === 'summary-view') {
    renderSummaryView();
  } else if (tabId === 'nutrition-menu-view') {
    renderNutritionMenuView();
  } else if (tabId === 'nutrition-recipes-view') {
    renderNutritionRecipesView();
  } else if (tabId === 'nutrition-shopping-view') {
    renderShoppingView();
  } else if (tabId === 'workouts-view') {
    renderWorkoutsView();
  } else if (tabId === 'workouts-boo-view') {
    renderBooWorkoutView();
  } else if (tabId === 'workouts-exercises-view') {
    renderExerciseTableView();
  } else if (tabId === 'apple-watch-view') {
    updateAppleWatchModalUI();
  } else if (tabId === 'settings-view') {
    renderSettingsView();
  } else if (tabId === 'progress-view') {
    renderProgressView();
  } else if (tabId === 'logs-view') {
    renderDebugLogsView();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function setDeviceDefaultProfile(mode) {
  triggerHapticTouch();
  if (mode === 'he' || mode === 'she') {
    localStorage.setItem(DEVICE_DEFAULT_PROFILE_KEY, mode);
    appState.masterProfileId = mode;
  }
  saveState();
  renderAll();

  const masterName = appState.masterProfileId === 'he' ? 'Carlos' : 'Andrea';
  showIosToast(`📱 Perfil Maestro fijado a: ${masterName.toUpperCase()}`, "fa-solid fa-shield-halved");
}

export function checkDeviceIdentityBanner() {
  const devicePref = localStorage.getItem(DEVICE_DEFAULT_PROFILE_KEY);
  let banner = document.getElementById("device-identity-setup-banner");
  
  if (!devicePref) {
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "device-identity-setup-banner";
      banner.style.cssText = "position: fixed; top: 0; left: 0; right: 0; z-index: 999999; background: linear-gradient(135deg, #1e1b4b, #311b92); color: #fff; padding: 0.9rem 1rem; border-bottom: 2px solid var(--accent-cyan); box-shadow: 0 8px 32px rgba(0,0,0,0.5); text-align: center; font-family: system-ui, -apple-system, sans-serif;";
      banner.innerHTML = `
        <div style="max-width: 600px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: 0.6rem;">
          <div style="font-weight: 700; font-size: 0.95rem; display: flex; align-items: center; gap: 0.5rem; color: #a5f3fc;">
            <i class="fa-solid fa-mobile-screen-button" style="color: var(--accent-cyan);"></i> Configuración Inicial: ¿De quién es este teléfono?
          </div>
          <div style="font-size: 0.8rem; color: #cbd5e1; margin-bottom: 0.2rem;">
            Selecciona el dueño de este dispositivo para la sincronización en nube.
          </div>
          <div style="display: flex; gap: 0.75rem; width: 100%; justify-content: center; flex-wrap: wrap;">
            <button onclick="window.setDeviceDefaultProfile('he'); if(document.getElementById('device-identity-setup-banner')) document.getElementById('device-identity-setup-banner').remove();" style="flex: 1; min-width: 140px; padding: 0.7rem 1rem; background: #2563eb; color: #fff; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);">
              👦 Es el móvil de Carlos
            </button>
            <button onclick="window.setDeviceDefaultProfile('she'); if(document.getElementById('device-identity-setup-banner')) document.getElementById('device-identity-setup-banner').remove();" style="flex: 1; min-width: 140px; padding: 0.7rem 1rem; background: #ec4899; color: #fff; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(236, 72, 153, 0.4);">
              👧 Es el móvil de Andrea
            </button>
          </div>
        </div>
      `;
      document.body.prepend(banner);
    }
  } else if (banner) {
    banner.remove();
  }
}

export function getProfileShortName(pid) {
  if (!appState || !appState.profiles) {
    if (pid === 'he') return "Carlos";
    if (pid === 'she') return "Andrea";
    if (pid === 'dog') return "Boo";
    return "Usuario";
  }
  if (pid === 'he') {
    const raw = appState.profiles.he?.name || "Carlos";
    return raw.replace(/^Él\s*\(/i, '').replace(/\)$/, '').trim() || "Carlos";
  }
  if (pid === 'she') {
    const raw = appState.profiles.she?.name || "Andrea";
    return raw.replace(/^Ella\s*\(/i, '').replace(/\)$/, '').trim() || "Andrea";
  }
  if (pid === 'dog') {
    const raw = appState.profiles.dog?.name || "Boo";
    return raw.replace(/\s*\(Border Collie\)$/i, '').trim() || "Boo";
  }
  return appState.profiles[pid]?.name || "Usuario";
}

export function updateUIProfileNames() {
  const heName = getProfileShortName('he');
  const sheName = getProfileShortName('she');
  const dogName = getProfileShortName('dog');

  const btnHe = document.getElementById("btn-profile-he");
  if (btnHe) btnHe.innerHTML = `<i class="fa-solid fa-mars"></i> ${heName}`;
  const btnShe = document.getElementById("btn-profile-she");
  if (btnShe) btnShe.innerHTML = `<i class="fa-solid fa-venus"></i> ${sheName}`;

  const iosBtnHe = document.getElementById("ios-btn-profile-he");
  if (iosBtnHe) iosBtnHe.innerText = heName;
  const iosBtnShe = document.getElementById("ios-btn-profile-she");
  if (iosBtnShe) iosBtnShe.innerText = sheName;

  const prefBtnHe = document.querySelector("#pref-btn-he strong");
  if (prefBtnHe) prefBtnHe.innerText = heName;
  const prefBtnShe = document.querySelector("#pref-btn-she strong");
  if (prefBtnShe) prefBtnShe.innerText = sheName;

  const ringLabelHe = document.getElementById("setting-label-ring-he");
  if (ringLabelHe) ringLabelHe.innerText = `Objetivos ${heName}`;
  const ringLabelShe = document.getElementById("setting-label-ring-she");
  if (ringLabelShe) ringLabelShe.innerText = `Objetivos ${sheName}`;

  const nutLabelHe = document.getElementById("setting-label-nut-he");
  if (nutLabelHe) nutLabelHe.innerText = `Nutrición ${heName}`;
  const nutLabelShe = document.getElementById("setting-label-nut-she");
  if (nutLabelShe) nutLabelShe.innerText = `Nutrición ${sheName}`;

  const dogWalkLabel = document.getElementById("setting-label-dog-walk");
  if (dogWalkLabel) dogWalkLabel.innerText = dogName;
}

// ==========================================
// 4. APPLE WATCH & HEALTH SHORTCUT INTEGRATION
// ==========================================
let autoSyncIntervalTimer = null;

export function startAppleWatchAutoSync() {
  if (autoSyncIntervalTimer) clearInterval(autoSyncIntervalTimer);
  autoSyncIntervalTimer = setInterval(() => {
    if (!document.hidden && !window.isCloudSyncing) {
      pullFromCloud(false).then(hasChanges => {
        if (hasChanges && window.renderAll) window.renderAll();
      });
    }
  }, 10000);
}

export function performAutoSyncTick() {
  appState.appleWatch.lastGlobalSync = new Date().toISOString();
  saveState();
  if (window.renderAll) window.renderAll();
}

export function updateHeaderWatchBadge() {
  const badgeText = document.getElementById("ios-header-watch-text");
  if (badgeText) badgeText.innerText = "☁️ Actualizar Nube";
}

export function setAppleWatchSyncMode(mode) {
  triggerHapticTouch();
  if (!appState.appleWatch) appState.appleWatch = {};
  appState.appleWatch.syncMode = mode;
  saveState();
  if (window.renderAll) window.renderAll();

  if (mode === "real") {
    showIosToast("🎯 <strong>Modo Datos Reales Activado</strong>", "fa-solid fa-shield-halved");
  } else {
    showIosToast("🧪 <strong>Modo Simulación Demo Activado</strong>", "fa-solid fa-vial");
  }
}

export function openAppleWatchModal() {
  triggerHapticTouch();
  const modal = document.getElementById("apple-watch-modal");
  if (modal) {
    modal.classList.add("active");
    updateAppleWatchModalUI();
  }
}

export function closeAppleWatchModal() {
  triggerHapticTouch();
  const modal = document.getElementById("apple-watch-modal");
  if (modal) modal.classList.remove("active");
}

export function closeAppleWatchModalOnBackdrop(e) {
  if (e && e.target && e.target.id === "apple-watch-modal") {
    closeAppleWatchModal();
  }
}

export function toggleAutoSync(enabled) {
  triggerHapticTouch();
  if (!appState.appleWatch) return;
  appState.appleWatch.autoSyncEnabled = enabled;
  saveState();
  updateHeaderWatchBadge();
  showIosToast(enabled ? " Sincronización de Apple Watch ACTIVADA" : "⏸️ Sincronización PAUSADA", "fa-brands fa-apple");
}

export function triggerManualSync() {
  triggerHapticTouch();
  const pid = appState.activeProfileId;
  const m = appState.appleWatch.metrics[pid];
  const pName = getProfileShortName(pid);

  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  appState.appleWatch.lastGlobalSync = new Date().toISOString();
  
  appState.appleWatch.syncLogs.unshift({
    timestamp: timeStr,
    device: m.deviceName,
    hr: m.hr,
    kcal: m.moveKcal,
    steps: m.steps,
    status: "Verificado con Salud iOS"
  });
  if (appState.appleWatch.syncLogs.length > 8) appState.appleWatch.syncLogs.pop();

  saveState();
  if (window.renderAll) window.renderAll();
  showIosToast(` ¡Datos de Apple Watch (${pName}) verificados!`, "fa-solid fa-circle-check");
}

export function syncWeeklyWatchHistory(profileId, kcalArr = [], exMinArr = [], hrArr = []) {
  if (!Array.isArray(kcalArr) || kcalArr.length === 0) return;
  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const todayIdx = (new Date().getDay() + 6) % 7;

  for (let i = 0; i < kcalArr.length; i++) {
    const pastDayIdx = (todayIdx - (kcalArr.length - 1 - i) + 7) % 7;
    const targetDayName = days[pastDayIdx];
    const kcalVal = kcalArr[i];
    const durVal = (exMinArr && exMinArr[i]) ? exMinArr[i] : 45;
    const hrVal = (hrArr && hrArr[i]) ? hrArr[i] : 138;

    if (kcalVal && kcalVal > 150) {
      if (!appState.completedWorkouts[profileId]) appState.completedWorkouts[profileId] = {};
      const existing = appState.completedWorkouts[profileId][targetDayName];
      if (!existing || !existing.done || !existing.watchData) {
        appState.completedWorkouts[profileId][targetDayName] = {
          done: true,
          watchData: {
            deviceName: appState.appleWatch.metrics[profileId]?.deviceName || "Apple Watch",
            durationMin: durVal,
            kcal: kcalVal,
            avgHr: hrVal,
            maxHr: hrVal + 22,
            timestamp: "Salud iOS Sync",
            autoSync: true
          }
        };
      }
    }
  }
}

export function checkUrlParamsForWatchSync() {
  let searchStr = window.location?.search || "";
  let hashStr = window.location?.hash || "";
  
  if (!searchStr && hashStr && hashStr.includes("?")) {
    searchStr = hashStr.substring(hashStr.indexOf("?"));
  } else if (!searchStr && hashStr && hashStr.includes("=")) {
    searchStr = hashStr.replace("#", "?");
  }

  const params = new URLSearchParams(searchStr);
  if (!params.has("syncWatch") && !params.has("kcal") && !params.has("steps") && !params.has("workout") && !params.has("duration") && !params.has("workoutKcal") && !params.has("hr")) {
    return false;
  }

  let pid = appState.activeProfileId || getMasterProfileId();
  const profileParam = params.get("profile") || params.get("user");
  if (profileParam) {
    const pLower = profileParam.toLowerCase();
    if (pLower.includes("carlos") || pLower === "he" || pLower === "m") pid = "he";
    else if (pLower.includes("andrea") || pLower === "she" || pLower === "f") pid = "she";
    appState.activeProfileId = pid;
    localStorage.setItem(LAST_ACTIVE_PROFILE_KEY, pid);
  }

  if (!appState.appleWatch) appState.appleWatch = {};
  if (!appState.appleWatch.metrics) appState.appleWatch.metrics = JSON.parse(JSON.stringify(defaultWatchMetrics));
  if (!appState.appleWatch.metrics[pid]) appState.appleWatch.metrics[pid] = { ...defaultWatchMetrics[pid] };

  const m = appState.appleWatch.metrics[pid];
  let updated = false;

  const kcalRaw = params.get("kcal") || params.get("moveKcal") || params.get("activeCalories");
  const kcalVal = parseSmartMetricValue(kcalRaw);
  if (kcalVal !== null) { m.moveKcal = kcalVal; updated = true; }

  const stepsRaw = params.get("steps");
  const stepsVal = parseSmartMetricValue(stepsRaw);
  if (stepsVal !== null) {
    m.steps = stepsVal;
    m.distanceKm = parseFloat((m.steps * 0.00075).toFixed(2));
    updated = true;
  }

  const distRaw = params.get("dist") || params.get("distanceKm") || params.get("distance");
  const distVal = parseSmartMetricFloatValue(distRaw);
  if (distVal !== null) { m.distanceKm = distVal; updated = true; }

  const hrRaw = params.get("hr") || params.get("heartRate") || params.get("avgHr");
  const hrVal = parseSmartMetricValue(hrRaw);
  if (hrVal !== null) { m.hr = hrVal; updated = true; }

  const exMinRaw = params.get("exMin") || params.get("exerciseMin") || params.get("duration") || params.get("dur");
  const exMinVal = parseSmartMetricValue(exMinRaw);
  if (exMinVal !== null) { m.exerciseMin = exMinVal; updated = true; }

  const floorsRaw = params.get("floors") || params.get("pisos");
  const floorsVal = parseSmartMetricValue(floorsRaw);
  if (floorsVal !== null) { m.floors = floorsVal; updated = true; }

  const sleepRaw = params.get("sleep") || params.get("sueno");
  if (sleepRaw !== null && sleepRaw !== undefined) {
    m.sleep = formatSmartSleepValue(sleepRaw);
    updated = true;
  }

  const kcalArr = parseSmartMetricArray(kcalRaw);
  const exMinArr = parseSmartMetricArray(exMinRaw);
  const hrArr = parseSmartMetricArray(hrRaw);
  if (kcalArr.length > 1) {
    syncWeeklyWatchHistory(pid, kcalArr, exMinArr, hrArr);
    updated = true;
  }

  const isWorkoutSync = params.has("workout") || params.get("syncWorkout") === "true" || params.has("workoutKcal") || (params.has("duration") && params.has("avgHr"));
  let targetDay = params.get("day");
  if (!targetDay || targetDay === "Hoy" || targetDay.toLowerCase() === "today" || targetDay.toLowerCase() === "hoy") {
    targetDay = getTodayDayName();
  }

  if (isWorkoutSync) {
    const wKcal = parseSmartMetricValue(params.get("workoutKcal") || params.get("wKcal")) || (kcalVal || 350);
    const durMin = parseSmartMetricValue(params.get("workoutDuration") || params.get("dur") || params.get("duration")) || (exMinVal || 45);

    if (!appState.completedWorkouts[pid]) appState.completedWorkouts[pid] = {};
    if (!appState.completedWorkouts[pid][targetDay] || typeof appState.completedWorkouts[pid][targetDay] !== 'object') {
      appState.completedWorkouts[pid][targetDay] = { done: true, watchData: null, sessions: [] };
    }
    if (!Array.isArray(appState.completedWorkouts[pid][targetDay].sessions)) {
      appState.completedWorkouts[pid][targetDay].sessions = [];
    }

    const sessionObj = {
      deviceName: m.deviceName || `Apple Watch (${getProfileShortName(pid)})`,
      durationMin: durMin,
      kcal: wKcal,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " hs",
      autoSync: true
    };

    const isDuplicate = appState.completedWorkouts[pid][targetDay].sessions.some(s => s.durationMin === durMin && s.kcal === wKcal && s.timestamp === sessionObj.timestamp);
    if (!isDuplicate) {
      appState.completedWorkouts[pid][targetDay].sessions.push(sessionObj);
    }
    appState.completedWorkouts[pid][targetDay].done = true;
    appState.completedWorkouts[pid][targetDay].watchData = sessionObj;
    appState.activeWorkoutDay = targetDay;
    updated = true;
  }

  if (updated) {
    appState.appleWatch.lastGlobalSync = new Date().toISOString();
    saveState();
    pushToCloud(false);
    if (window.renderAll) window.renderAll();

    const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
    showIosToast(` Datos de Salud sincronizados`, "fa-brands fa-apple");
    return true;
  }
  return false;
}

export function checkAutoLaunchShortcutOnOpen() {
  if (!appState.appleWatch?.autoLaunchShortcutOnOpen) return;
  if (sessionStorage.getItem("fitduo_shortcut_launched") === "true") return;
  sessionStorage.setItem("fitduo_shortcut_launched", "true");
  setTimeout(() => launchIosShortcutSync(true, 'health'), 1000);
}

export async function syncHealthShortcutAndCloud() {
  triggerHapticTouch();
  const shortcutName = "SubirSaludNubeFitDuo";
  const url = `shortcuts://run-shortcut?name=${encodeURIComponent(shortcutName)}`;
  showIosToast(`☁️ <strong>Subiendo a la Nube:</strong> Ejecutando atajo...`, "fa-solid fa-cloud-arrow-up");

  setTimeout(() => { window.location.href = url; }, 200);
  setTimeout(async () => {
    try {
      await pullFromCloud(true);
      if (window.renderAll) window.renderAll();
    } catch(e) {}
  }, 4000);
}

export function launchIosShortcutSync(isAuto = false, mode = 'health') {
  triggerHapticTouch();
  const shortcutName = mode === 'workout' ? "SincronizarEntrenamientoFitDuo" : "SincronizarSaludFitDuo";
  const url = `shortcuts://run-shortcut?name=${encodeURIComponent(shortcutName)}`;
  showIosToast(`⚡ Lanzando Atajo de iOS (${shortcutName})...`, "fa-brands fa-apple");
  setTimeout(() => { window.location.href = url; }, 300);
}

export function getShortcutUrl(mode = 'health') {
  let baseUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
  if (mode === 'workout') {
    return `${baseUrl}?syncWatch=true&workout=true&day=Hoy&workoutKcal=[Calorias_Entreno]&duration=[Duracion_Entreno]&avgHr=[FC_Entreno]&kcal=[Calorias_Activas]&steps=[Pasos]&hr=[Ritmo_Cardiaco]&dist=[Distancia]&exMin=[Minutos_Ejercicio]&floors=[Pisos_Subidos]&sleep=[Horas_Sueno]`;
  }
  return `${baseUrl}?syncWatch=true&kcal=[Calorias_Activas]&steps=[Pasos]&hr=[Ritmo_Cardiaco]&dist=[Distancia]&exMin=[Minutos_Ejercicio]&floors=[Pisos_Subidos]&sleep=[Horas_Sueno]`;
}

export function getShortcutCloudUrl(mode = 'health', customPid = null) {
  const key = getCloudSyncKey();
  const pid = customPid || getMasterProfileId();
  const channel = `${key}_${pid}`;
  if (mode === 'workout') {
    return `https://ps.pubnub.com/publish/demo/demo/0/${channel}/0/{"author":"${pid}","workout":true,"day":"Hoy","workoutKcal":"[Calorias_Entreno]","duration":"[Duracion_Entreno]","avgHr":"[FC_Entreno]","kcal":"[Calorias_Activas]","steps":"[Pasos]","hr":"[Ritmo_Cardiaco]","dist":"[Distancia]","exMin":"[Minutos_Ejercicio]","floors":"[Pisos_Subidos]","sleep":"[Horas_Sueno]"}`;
  }
  return `https://ps.pubnub.com/publish/demo/demo/0/${channel}/0/{"author":"${pid}","kcal":"[Calorias_Activas]","steps":"[Pasos]","hr":"[Ritmo_Cardiaco]","dist":"[Distancia]","exMin":"[Minutos_Ejercicio]","floors":"[Pisos_Subidos]","sleep":"[Horas_Sueno]"}`;
}

export function updateShortcutUrlInputs() {
  const healthInput = document.getElementById("shortcut-url-health-input");
  if (healthInput) healthInput.value = getShortcutUrl('health');
  const workoutInput = document.getElementById("shortcut-url-workout-input");
  if (workoutInput) workoutInput.value = getShortcutUrl('workout');
  const cloudHealthInput = document.getElementById("shortcut-cloud-url-health-input");
  if (cloudHealthInput) cloudHealthInput.value = getShortcutCloudUrl('health');
  const cloudWorkoutInput = document.getElementById("shortcut-cloud-url-workout-input");
  if (cloudWorkoutInput) cloudWorkoutInput.value = getShortcutCloudUrl('workout');
  const settingsCloudInput = document.getElementById("settings-shortcut-cloud-url-input");
  if (settingsCloudInput) settingsCloudInput.value = getShortcutCloudUrl('health');
}

export function copyShortcutUrlToClipboard(mode = 'health') {
  triggerHapticTouch();
  const url = getShortcutUrl(mode);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      showIosToast(`📋 URL del Atajo copiada`, "fa-solid fa-copy");
    });
  } else {
    prompt("Copia la URL del atajo:", url);
  }
}

export function copyShortcutCloudUrlToClipboard(mode = 'health') {
  triggerHapticTouch();
  const url = getShortcutCloudUrl(mode);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      showIosToast(`☁️ URL de Subida Nube copiada`, "fa-solid fa-cloud-arrow-up");
    });
  } else {
    prompt("Copia la URL de nube:", url);
  }
}

export function openHealthSyncModal() {
  triggerHapticTouch();
  updateShortcutUrlInputs();
  const modal = document.getElementById("health-sync-modal");
  if (modal) modal.classList.add("active");
}

export function closeHealthSyncModal() {
  triggerHapticTouch();
  const modal = document.getElementById("health-sync-modal");
  if (modal) modal.classList.remove("active");
}

export function applyReplicaToPrimary(customPid = null) {
  triggerHapticTouch();
  const pid = customPid || appState.activeProfileId || 'he';
  const rep = appState.appleWatch?.cloudReplica?.[pid];
  const m = appState.appleWatch?.metrics?.[pid];
  if (!rep || !m) return;

  m.moveKcal = rep.moveKcal || m.moveKcal;
  m.steps = rep.steps || m.steps;
  m.distanceKm = rep.distanceKm || m.distanceKm;
  m.hr = rep.hr || m.hr;
  m.exerciseMin = rep.exerciseMin || m.exerciseMin;
  if (rep.floors !== undefined) m.floors = rep.floors;
  if (rep.sleep !== undefined) m.sleep = rep.sleep;

  saveState();
  if (window.renderAll) window.renderAll();
  showIosToast(`📥 Datos de Réplica aplicados`, "fa-solid fa-circle-check");
}

export function openManualMetricsModal() {
  triggerHapticTouch();
  const pid = appState.activeProfileId || 'he';
  const m = appState.appleWatch?.metrics?.[pid];
  if (!m) return;

  const stepsInp = document.getElementById("manual-edit-steps");
  if (stepsInp) stepsInp.value = m.steps;
  const kcalInp = document.getElementById("manual-edit-kcal");
  if (kcalInp) kcalInp.value = m.moveKcal;
  const hrInp = document.getElementById("manual-edit-hr");
  if (hrInp) hrInp.value = m.hr;
  const exminInp = document.getElementById("manual-edit-exmin");
  if (exminInp) exminInp.value = m.exerciseMin;
  const floorsInp = document.getElementById("manual-edit-floors");
  if (floorsInp) floorsInp.value = m.floors ?? 0;
  const sleepInp = document.getElementById("manual-edit-sleep");
  if (sleepInp) sleepInp.value = m.sleep || "--";
  const distInp = document.getElementById("manual-edit-dist");
  if (distInp) distInp.value = m.distanceKm;

  const modal = document.getElementById("manual-metrics-modal");
  if (modal) modal.classList.add("active");
}

export function closeManualMetricsModal() {
  triggerHapticTouch();
  const modal = document.getElementById("manual-metrics-modal");
  if (modal) modal.classList.remove("active");
}

export function saveManualMetricsFromModal(e) {
  if (e) e.preventDefault();
  triggerHapticTouch();
  const pid = appState.activeProfileId || 'he';
  const m = appState.appleWatch?.metrics?.[pid];
  if (!m) return;

  m.steps = parseInt(document.getElementById("manual-edit-steps")?.value) || m.steps;
  m.moveKcal = parseInt(document.getElementById("manual-edit-kcal")?.value) || m.moveKcal;
  m.hr = parseInt(document.getElementById("manual-edit-hr")?.value) || m.hr;
  m.exerciseMin = parseInt(document.getElementById("manual-edit-exmin")?.value) || m.exerciseMin;
  m.floors = parseInt(document.getElementById("manual-edit-floors")?.value) || 0;
  m.sleep = formatSmartSleepValue(document.getElementById("manual-edit-sleep")?.value);
  m.distanceKm = parseFloat(document.getElementById("manual-edit-dist")?.value) || m.distanceKm;

  saveState();
  if (window.renderAll) window.renderAll();
  closeManualMetricsModal();
  showIosToast(`💾 Métricas guardadas manualmente`, "fa-solid fa-circle-check");
}

export function switchShortcutMethodTab(methodName) {
  triggerHapticTouch();
  updateShortcutUrlInputs();
  const btnCloud = document.getElementById("shortcut-method-btn-cloud");
  const btnSafari = document.getElementById("shortcut-method-btn-safari");
  const paneCloud = document.getElementById("shortcut-method-pane-cloud");
  const paneSafari = document.getElementById("shortcut-method-pane-safari");

  if (methodName === 'cloud') {
    if (btnCloud) btnCloud.className = "shortcut-tab-btn active";
    if (btnSafari) btnSafari.className = "shortcut-tab-btn";
    if (paneCloud) paneCloud.style.display = "block";
    if (paneSafari) paneSafari.style.display = "none";
  } else {
    if (btnCloud) btnCloud.className = "shortcut-tab-btn";
    if (btnSafari) btnSafari.className = "shortcut-tab-btn active";
    if (paneCloud) paneCloud.style.display = "none";
    if (paneSafari) paneSafari.style.display = "block";
  }
}

export function switchShortcutTab(tabName) {
  triggerHapticTouch();
  updateShortcutUrlInputs();
  const btnHealth = document.getElementById("shortcut-tab-btn-health");
  const btnWorkout = document.getElementById("shortcut-tab-btn-workout");
  const paneHealth = document.getElementById("shortcut-pane-health");
  const paneWorkout = document.getElementById("shortcut-pane-workout");

  if (tabName === 'health') {
    if (btnHealth) btnHealth.className = "shortcut-tab-btn active";
    if (btnWorkout) btnWorkout.className = "shortcut-tab-btn";
    if (paneHealth) paneHealth.style.cssText = "display: block !important;";
    if (paneWorkout) paneWorkout.style.cssText = "display: none !important;";
  } else {
    if (btnHealth) btnHealth.className = "shortcut-tab-btn";
    if (btnWorkout) btnWorkout.className = "shortcut-tab-btn active";
    if (paneHealth) paneHealth.style.cssText = "display: none !important;";
    if (paneWorkout) paneWorkout.style.cssText = "display: block !important;";
  }
}

export function testSimulatedHealthSync() {
  triggerHapticTouch();
  const randomKcal = Math.floor(480 + Math.random() * 220);
  const randomSteps = Math.floor(8200 + Math.random() * 4000);
  const randomHr = Math.floor(68 + Math.random() * 18);
  const testUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?syncWatch=true&kcal=${randomKcal}&steps=${randomSteps}&hr=${randomHr}&exMin=45&dist=6.8&stand=10`;
  window.history.replaceState({}, document.title, testUrl);
  checkUrlParamsForWatchSync();
}

export function testSimulatedWorkoutSync() {
  triggerHapticTouch();
  const todayDay = getTodayDayName();
  const testUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?syncWatch=true&workout=true&day=${encodeURIComponent(todayDay)}&kcal=580&steps=9500&hr=72&exMin=55&dist=7.9&stand=12&workoutKcal=420&duration=50&avgHr=142&maxHr=168`;
  window.history.replaceState({}, document.title, testUrl);
  checkUrlParamsForWatchSync();
}

export function resetMetricsToZeroUsingUrlShortcut(customPid = null) {
  triggerHapticTouch();
  const pid = customPid || appState.activeProfileId || 'he';
  const testUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?syncWatch=true&profile=${pid}&kcal=0&steps=0&hr=0&dist=0&exMin=0`;
  window.history.replaceState({}, document.title, testUrl);
  checkUrlParamsForWatchSync();
}

export async function testSimulatedBackgroundCloudSync() {
  triggerHapticTouch();
  const key = getCloudSyncKey();
  const masterPid = getMasterProfileId();
  const payload = {
    author: masterPid,
    authorProfileId: masterPid,
    workout: true,
    day: getTodayDayName(),
    steps: 8800,
    kcal: 520,
    dist: 6.6,
    exerciseMin: 45,
    hr: 75,
    workoutKcal: 390,
    duration: 45,
    workoutAvgHr: 140,
    timeStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " hs"
  };

  try {
    const pnChannel = `${key}_${masterPid}`;
    const encodedMsg = encodeURIComponent(JSON.stringify(payload));
    const pnPubUrl = `https://ps.pubnub.com/publish/demo/demo/0/${pnChannel}/0/${encodedMsg}`;
    await fetch(pnPubUrl);
    setTimeout(() => pullFromCloud(true), 500);
  } catch (e) {}
}

export function updateAppleWatchModalUI() {
  const pid = appState.activeProfileId;
  const m = appState.appleWatch?.metrics?.[pid];
  if (!m) return;

  const mode = appState.appleWatch.syncMode || "real";
  const btnReal = document.getElementById("btn-mode-real");
  const btnDemo = document.getElementById("btn-mode-demo");
  if (btnReal) btnReal.className = `mode-btn ${mode === 'real' ? 'active' : ''}`;
  if (btnDemo) btnDemo.className = `mode-btn ${mode === 'demo' ? 'active' : ''}`;

  document.querySelectorAll("[id='watch-metric-hr']").forEach(el => el.innerHTML = `${m.hr} <small>BPM</small>`);
  document.querySelectorAll("[id='watch-metric-floors']").forEach(el => el.innerHTML = `${m.floors ?? 0} <small>pisos</small>`);
  document.querySelectorAll("[id='watch-metric-sleep']").forEach(el => el.innerHTML = `${formatSmartSleepValue(m.sleep)}`);
  document.querySelectorAll("[id='watch-metric-dist']").forEach(el => el.innerHTML = `${m.distanceKm} <small>km</small>`);

  const moveGoal = m.moveGoal || m.targetKcal || 600;
  const moveRatio = Math.min(1.2, m.moveKcal / moveGoal);
  const moveOffset = Math.max(0, 314 - (314 * Math.min(1, moveRatio)));
  document.querySelectorAll("[id='ring-move-circle']").forEach(el => el.style.strokeDashoffset = moveOffset);
  document.querySelectorAll("[id='ring-move-val']").forEach(el => el.innerText = `${m.moveKcal} / ${moveGoal} kcal`);

  const exGoal = m.exerciseGoal || m.targetMin || 30;
  const exRatio = Math.min(1.2, m.exerciseMin / exGoal);
  const exOffset = Math.max(0, 238 - (238 * Math.min(1, exRatio)));
  document.querySelectorAll("[id='ring-exercise-circle']").forEach(el => el.style.strokeDashoffset = exOffset);
  document.querySelectorAll("[id='ring-exercise-val']").forEach(el => el.innerText = `${m.exerciseMin} / ${exGoal} min`);

  const stepsGoal = m.stepsGoal || m.targetSteps || 10000;
  const stepsRatio = Math.min(1.2, m.steps / stepsGoal);
  const stepsOffset = Math.max(0, 163 - (163 * Math.min(1, stepsRatio)));
  document.querySelectorAll("[id='ring-steps-circle'], [id='ring-stand-circle']").forEach(el => el.style.strokeDashoffset = stepsOffset);
  document.querySelectorAll("[id='ring-steps-val'], [id='ring-stand-val']").forEach(el => el.innerText = `${m.steps.toLocaleString()} / ${stepsGoal.toLocaleString()} pasos`);
}

export function handleHealthFileImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const json = JSON.parse(e.target.result);
      const pid = appState.activeProfileId;
      const m = appState.appleWatch.metrics[pid];
      if (json.steps) m.steps = parseInt(json.steps);
      if (json.activeCalories) m.moveKcal = parseInt(json.activeCalories);
      if (json.heartRate) m.hr = parseInt(json.heartRate);
      m.distanceKm = parseFloat((m.steps * 0.00075).toFixed(2));
      saveState();
      if (window.renderAll) window.renderAll();
      showIosToast("📄 Archivo de Salud importado", "fa-solid fa-file-circle-check");
    } catch(err) {
      showIosToast("⚠️ Error al importar archivo", "fa-solid fa-triangle-exclamation");
    }
  };
  reader.readAsText(file);
}

export function toggleShortcutGuide() {
  triggerHapticTouch();
  const content = document.getElementById("shortcut-guide-content");
  if (content) content.classList.toggle("active");
}

// ==========================================
// 5. CLOUD SYNC & MULTI-DEVICE PUB/SUB
// ==========================================
export const CLOUD_SYNC_APP_KEY = "fitduo_v2";
export const DEFAULT_CLOUD_KEY = "fitduo_sync_v2";
export let isCloudSyncing = false;

export function getCloudSyncKey() {
  return localStorage.getItem("FITDUO_CLOUD_KEY") || DEFAULT_CLOUD_KEY;
}

export function addSyncConsoleLog(message, type = "info") {
  const consoleEl = document.getElementById("sync-diagnostic-console");
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const logLine = `[${timeStr}] ${message}\n`;
  if (consoleEl) {
    consoleEl.textContent = logLine + consoleEl.textContent.slice(0, 1000);
  }
}

export async function cleanAndParseJsonFromCloud(rawText) {
  const list = await cleanAndParseAllMessagesFromCloud(rawText);
  return list.length > 0 ? list[list.length - 1] : null;
}

export async function cleanAndParseAllMessagesFromCloud(rawText) {
  if (!rawText || typeof rawText !== 'string') return [];
  let text = rawText.trim();
  if (text === 'null' || text === '""' || text.length < 2) return [];

  const results = [];

  if (text.includes('"channels":') && text.includes('"message":')) {
    try {
      const parsed = JSON.parse(text);
      if (parsed && parsed.channels) {
        for (let ch of Object.keys(parsed.channels)) {
          const msgList = parsed.channels[ch];
          if (Array.isArray(msgList) && msgList.length > 0) {
            for (const msgItem of msgList) {
              if (msgItem && msgItem.message) {
                const subParsed = await cleanAndParseAllMessagesFromCloud(typeof msgItem.message === 'string' ? msgItem.message : JSON.stringify(msgItem.message));
                for (const item of subParsed) {
                  if (item && typeof item === 'object') {
                    if (msgItem.timetoken) {
                      item._timetoken = String(msgItem.timetoken);
                      const pubDate = new Date(parseInt(msgItem.timetoken) / 10000);
                      if (!isNaN(pubDate.getTime())) {
                        item._timeStr = pubDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " hs";
                      }
                    }
                    results.push(item);
                  }
                }
              }
            }
          }
        }
        if (results.length > 0) return results;
      }
    } catch (e) {}
  }

  const fromUrlB64 = fromUrlSafeB64(text);
  if (fromUrlB64) return [fromUrlB64];

  if ((text.startsWith('{') && text.endsWith('}')) || (text.startsWith('[') && text.endsWith(']'))) {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === 'object') return [parsed];
    } catch (e) {}
  }
  return [];
}

export function mergeCloudDataIntoAppState(cloudData) {
  if (!cloudData || typeof cloudData !== 'object') return false;
  let hasChanges = false;
  const author = cloudData.authorProfileId || cloudData.masterProfileId || cloudData.author || cloudData.pid || 'he';

  if (!appState.appleWatch.metrics[author]) appState.appleWatch.metrics[author] = { ...defaultWatchMetrics[author] };
  if (!appState.appleWatch.cloudReplica[author]) appState.appleWatch.cloudReplica[author] = { ...defaultCloudReplica[author] };

  const rep = appState.appleWatch.cloudReplica[author];
  const m = appState.appleWatch.metrics[author];
  let replicaUpdated = false;

  const isWorkoutPayload = cloudData.workout === true || cloudData.workout === "true" || cloudData.syncWorkout === true || cloudData.syncWorkout === "true";

  // ONLY update summary daily health metrics (Move, Steps, Rings, Floors, Sleep) if this is NOT a pure workout snippet
  if (!isWorkoutPayload || cloudData.steps !== undefined || cloudData.floors !== undefined || cloudData.sleep !== undefined) {
    const kcalVal = parseSmartMetricValue(cloudData.kcal ?? cloudData.moveKcal ?? cloudData.activeCalories ?? cloudData.calorias);
    if (kcalVal !== null && !isWorkoutPayload) { rep.moveKcal = kcalVal; m.moveKcal = kcalVal; replicaUpdated = true; }

    const stepsVal = parseSmartMetricValue(cloudData.steps ?? cloudData.pasos);
    if (stepsVal !== null) {
      rep.steps = stepsVal;
      m.steps = stepsVal;
      rep.distanceKm = parseFloat((rep.steps * 0.00075).toFixed(2));
      m.distanceKm = rep.distanceKm;
      replicaUpdated = true;
    }

    const hrVal = parseSmartMetricValue(cloudData.hr ?? cloudData.avgHr ?? cloudData.bpm);
    if (hrVal !== null && !isWorkoutPayload) { rep.hr = hrVal; m.hr = hrVal; replicaUpdated = true; }

    const exMinVal = parseSmartMetricValue(cloudData.exMin ?? cloudData.exerciseMin ?? cloudData.minutosEjercicio ?? cloudData.exerciseTime);
    if (exMinVal !== null && !isWorkoutPayload) { rep.exerciseMin = exMinVal; m.exerciseMin = exMinVal; replicaUpdated = true; }

    const floorsVal = parseSmartMetricValue(cloudData.floors ?? cloudData.pisos ?? cloudData.floorsClimbed);
    if (floorsVal !== null) { rep.floors = floorsVal; m.floors = floorsVal; replicaUpdated = true; }

    const sleepVal = cloudData.sleep ?? cloudData.sueno ?? cloudData.sleepHours;
    if (sleepVal !== undefined && sleepVal !== null && sleepVal !== "") {
      const formattedSleep = formatSmartSleepValue(sleepVal);
      rep.sleep = formattedSleep;
      m.sleep = formattedSleep;
      replicaUpdated = true;
    }
  }

  if (replicaUpdated) {
    rep.lastSync = new Date().toISOString();
    appState.appleWatch.lastGlobalSync = new Date().toISOString();
    hasChanges = true;
  }

  if (cloudData.completedWorkouts?.[author]) {
    if (!appState.completedWorkouts[author]) appState.completedWorkouts[author] = {};
    for (const [day, dayObj] of Object.entries(cloudData.completedWorkouts[author])) {
      if (!dayObj) continue;
      if (!appState.completedWorkouts[author][day] || typeof appState.completedWorkouts[author][day] !== 'object') {
        appState.completedWorkouts[author][day] = { done: false, watchData: null, sessions: [] };
      }
      const localDay = appState.completedWorkouts[author][day];
      if (!Array.isArray(localDay.sessions)) {
        localDay.sessions = localDay.watchData ? [localDay.watchData] : [];
      }
      const incomingList = Array.isArray(dayObj.sessions) ? dayObj.sessions : (dayObj.watchData ? [dayObj.watchData] : []);
      for (const inc of incomingList) {
        if (!inc) continue;
        const already = localDay.sessions.some(s =>
          (s.id && inc.id && s.id === inc.id) ||
          (s.timestamp === inc.timestamp && s.durationMin === inc.durationMin && s.kcal === inc.kcal)
        );
        if (!already) {
          localDay.sessions.push(inc);
          hasChanges = true;
        }
      }
      if (dayObj.done || localDay.sessions.length > 0) {
        localDay.done = true;
        localDay.watchData = localDay.sessions[localDay.sessions.length - 1];
      }
    }
  }

  // Handle direct workout payload from Shortcuts (e.g. "Fin Entrenamiento")
  const isDirectWorkout = cloudData.workout === true || cloudData.workout === "true" || cloudData.syncWorkout === true || cloudData.syncWorkout === "true" || (cloudData.workoutKcal !== undefined && cloudData.workoutKcal !== "0" && cloudData.workoutKcal !== 0) || (cloudData.duration !== undefined && cloudData.duration !== "0" && cloudData.duration !== 0);
  if (isDirectWorkout) {
    let targetDay = cloudData.day;
    if (!targetDay || targetDay === "Hoy" || targetDay.toLowerCase() === "today" || targetDay.toLowerCase() === "hoy") {
      targetDay = getTodayDayName();
    }
    const durMin = parseSmartMetricValue(cloudData.duration ?? cloudData.workoutDuration ?? cloudData.dur) ?? 0;
    const wKcal = parseSmartMetricValue(cloudData.workoutKcal ?? cloudData.wKcal) ?? 0;

    if (durMin > 0 || wKcal > 0) {
      if (!appState.completedWorkouts[author]) appState.completedWorkouts[author] = {};
      if (!appState.completedWorkouts[author][targetDay] || typeof appState.completedWorkouts[author][targetDay] !== 'object') {
        appState.completedWorkouts[author][targetDay] = { done: true, watchData: null, sessions: [] };
      }
      if (!Array.isArray(appState.completedWorkouts[author][targetDay].sessions)) {
        appState.completedWorkouts[author][targetDay].sessions = appState.completedWorkouts[author][targetDay].watchData ? [appState.completedWorkouts[author][targetDay].watchData] : [];
      }

      const sessionTimestamp = cloudData.timeStr || cloudData._timeStr || (cloudData.timestamp ? (cloudData.timestamp.includes(":") ? cloudData.timestamp : new Date(cloudData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " hs") : "10:00 hs");
      const sessionId = cloudData._timetoken ? `pn_${cloudData._timetoken}` : (cloudData.id || `sess_${durMin}_${wKcal}_${sessionTimestamp}`);

      const sessionObj = {
        id: sessionId,
        deviceName: `Apple Watch (${getProfileShortName(author)})`,
        durationMin: durMin,
        kcal: wKcal,
        timestamp: sessionTimestamp,
        autoSync: true
      };

      const isDuplicate = appState.completedWorkouts[author][targetDay].sessions.some(s =>
        (s.id && s.id === sessionObj.id) ||
        (s.durationMin === durMin && s.kcal === wKcal && (s.timestamp === sessionObj.timestamp || s.id === sessionId))
      );

      if (!isDuplicate) {
        appState.completedWorkouts[author][targetDay].sessions.push(sessionObj);
        appState.completedWorkouts[author][targetDay].done = true;
        appState.completedWorkouts[author][targetDay].watchData = sessionObj;
        hasChanges = true;
      }
    }
  }

  if (hasChanges) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appState));
  }
  return hasChanges;
}

export function copyDiagnosticLogs() {
  const consoleEl = document.getElementById("sync-diagnostic-console");
  const logsText = consoleEl ? consoleEl.textContent : "";
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(logsText).then(() => {
      showIosToast("📋 ¡Logs copiados!", "fa-solid fa-copy");
    });
  }
}

let isPushSyncing = false;
let isPullSyncing = false;

export async function pushToCloud(showToast = false) {
  if (isPushSyncing) return;
  isPushSyncing = true;

  try {
    const key = getCloudSyncKey();
    const masterPid = getMasterProfileId();
    const m = appState.appleWatch?.metrics?.[masterPid] || {};
    const compactPayload = {
      authorProfileId: masterPid,
      timestamp: new Date().toISOString(),
      appleWatch: { metrics: { [masterPid]: m } },
      completedWorkouts: { [masterPid]: appState.completedWorkouts?.[masterPid] || {} }
    };

    const urlSafeData = toUrlSafeB64(compactPayload);
    const pnChannel = `${key}_${masterPid}`;
    const encodedMsg = encodeURIComponent(JSON.stringify(urlSafeData));
    const pnPubUrl = `https://ps.pubnub.com/publish/demo/demo/0/${pnChannel}/0/${encodedMsg}`;
    
    await fetch(pnPubUrl);
    appState.lastCloudSync = new Date().toISOString();
    updateCloudSyncUI("Conectado a la Nube (Sincronizado)", true);
    if (showToast) showIosToast("☁️ ¡Datos sincronizados en la nube!", "fa-solid fa-cloud-arrow-up");
  } catch (e) {
  } finally {
    isPushSyncing = false;
  }
}

export async function pullFromCloud(showToast = false) {
  if (isPullSyncing) return;
  isPullSyncing = true;

  try {
    const key = getCloudSyncKey();
    const myMasterPid = getMasterProfileId();
    const partnerPid = myMasterPid === 'he' ? 'she' : 'he';
    const channels = Array.from(new Set([
      `${key}_${partnerPid}`,
      `${key}_${myMasterPid}`,
      `fitduo_sync_${partnerPid}`,
      `fitduo_sync_${myMasterPid}`,
      `fitduo_sync_v2_${partnerPid}`,
      `fitduo_sync_v2_${myMasterPid}`
    ]));

    let hasMerged = false;
    for (const ch of channels) {
      try {
        const pnSubUrl = `https://ps.pubnub.com/v3/history/sub-key/demo/channel/${ch}?count=15`;
        const res = await fetch(pnSubUrl);
        if (res.ok) {
          const rawText = await res.text();
          const dataList = await cleanAndParseAllMessagesFromCloud(rawText);
          for (const data of dataList) {
            if (data) {
              const changed = mergeCloudDataIntoAppState(data);
              if (changed) hasMerged = true;
            }
          }
        }
      } catch (eCh) {}
    }

    if (hasMerged) {
      if (window.renderAll) window.renderAll();
      if (showToast) showIosToast(`☁️ ¡Datos actualizados desde la nube!`, "fa-solid fa-cloud-arrow-down");
    }
  } finally {
    isPullSyncing = false;
  }
}

export function syncNowWithCloud() {
  triggerHapticTouch();
  showIosToast("☁️ Sincronizando...", "fa-solid fa-arrows-rotate");
  pushToCloud(false).then(() => pullFromCloud(true));
}

export function saveCustomCloudKeyFromInput() {
  const input = document.getElementById("setting-cloud-key-input");
  if (!input) return;
  const keyVal = input.value.trim();
  if (keyVal.length >= 3) {
    localStorage.setItem("FITDUO_CLOUD_KEY", keyVal);
    showIosToast(`🔑 Clave guardada: ${keyVal}`, "fa-solid fa-key");
    syncNowWithCloud();
  }
}

export function resetDefaultCloudKey() {
  localStorage.removeItem("FITDUO_CLOUD_KEY");
  const input = document.getElementById("setting-cloud-key-input");
  if (input) input.value = DEFAULT_CLOUD_KEY;
  showIosToast("🔑 Clave por defecto restablecida", "fa-solid fa-rotate-left");
  syncNowWithCloud();
}

export function exportSyncToken() {
  triggerHapticTouch();
  const payload = { masterProfileId: appState.masterProfileId, appleWatch: appState.appleWatch };
  const token = btoa(encodeURIComponent(JSON.stringify(payload)));
  if (navigator.clipboard) navigator.clipboard.writeText(token);
  showIosToast("📋 ¡Código de sincronización copiado!", "fa-solid fa-copy");
}

export function promptImportSyncToken() {
  triggerHapticTouch();
  const token = prompt("Pega el código de sincronización:");
  if (token) {
    try {
      const data = JSON.parse(decodeURIComponent(atob(token.trim())));
      mergeCloudDataIntoAppState(data);
      if (window.renderAll) window.renderAll();
      showIosToast("⚡ Datos importados", "fa-solid fa-bolt");
    } catch(e) {
      showIosToast("❌ Código inválido", "fa-solid fa-triangle-exclamation");
    }
  }
}

export function exportBackupJson() {
  triggerHapticTouch();
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState, null, 2));
  const a = document.createElement('a');
  a.href = dataStr;
  a.download = `fitduo_backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  showIosToast("💾 Copia JSON descargada", "fa-solid fa-download");
}

export function triggerImportBackupJson() {
  const fileInput = document.getElementById("json-backup-file-input");
  if (fileInput) fileInput.click();
}

export function handleBackupFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (imported && typeof imported === 'object') {
        mergeCloudDataIntoAppState(imported);
        if (window.renderAll) window.renderAll();
        showIosToast("📂 Copia cargada", "fa-solid fa-file-circle-check");
      }
    } catch(err) {
      showIosToast("❌ Archivo inválido", "fa-solid fa-circle-exclamation");
    }
  };
  reader.readAsText(file);
}

export function updateCloudSyncUI(statusText, isConnected) {
  const statusEl = document.getElementById("cloud-sync-status-text");
  if (statusEl) statusEl.innerText = `Estado: ${statusText}`;

  const badgeEl = document.getElementById("cloud-status-badge");
  if (badgeEl) {
    badgeEl.className = `cloud-status-badge ${isConnected ? '' : 'offline'}`;
    badgeEl.innerHTML = `<i class="fa-solid ${isConnected ? 'fa-cloud' : 'fa-cloud-slash'}"></i> Nube ${isConnected ? 'Conectada' : 'Local'}`;
  }
}

export function forceAppRefresh() {
  triggerHapticTouch();
  showIosToast("🔄 Actualizando...", "fa-solid fa-arrows-rotate");
  setTimeout(() => { window.location.href = window.location.pathname + '?v=' + Date.now(); }, 400);
}

// ==========================================
// 6. SUMMARY & DASHBOARD VIEW
// ==========================================
export function renderSummaryView() {
  const pid = appState.activeProfileId;
  const p = appState.profiles[pid];
  const m = appState.appleWatch?.metrics?.[pid];
  if (!p || !m) return;

  const syncTimeEl = document.getElementById("summary-watch-sync-time");
  if (syncTimeEl) syncTimeEl.innerText = formatSyncRelativeTime(appState.appleWatch?.lastGlobalSync);

  const hrEl = document.getElementById("summary-metric-hr");
  if (hrEl) hrEl.innerHTML = `${m.hr} <small>BPM</small>`;

  const floorsEl = document.getElementById("summary-metric-floors");
  if (floorsEl) floorsEl.innerHTML = `${m.floors ?? 0} <small>pisos</small>`;

  const sleepEl = document.getElementById("summary-metric-sleep");
  if (sleepEl) sleepEl.innerHTML = `${formatSmartSleepValue(m.sleep)}`;

  const distEl = document.getElementById("summary-metric-dist");
  if (distEl) distEl.innerHTML = `${m.distanceKm} <small>km</small>`;

  const moveGoal = m.moveGoal || m.targetKcal || 600;
  const moveCircle = document.getElementById("summary-ring-move-circle");
  const moveRatio = Math.min(1.2, m.moveKcal / moveGoal);
  const moveOffset = Math.max(0, 314 - (314 * Math.min(1, moveRatio)));
  if (moveCircle) moveCircle.style.strokeDashoffset = moveOffset;
  const moveValEl = document.getElementById("summary-ring-move-val");
  if (moveValEl) moveValEl.innerText = `${m.moveKcal} / ${moveGoal} kcal`;

  const exGoal = m.exerciseGoal || m.targetMin || 30;
  const exCircle = document.getElementById("summary-ring-exercise-circle");
  const exRatio = Math.min(1.2, m.exerciseMin / exGoal);
  const exOffset = Math.max(0, 238 - (238 * Math.min(1, exRatio)));
  if (exCircle) exCircle.style.strokeDashoffset = exOffset;
  const exValEl = document.getElementById("summary-ring-exercise-val");
  if (exValEl) exValEl.innerText = `${m.exerciseMin} / ${exGoal} min`;

  const stepsGoal = m.stepsGoal || m.targetSteps || 10000;
  const stepsCircle = document.getElementById("summary-ring-steps-circle") || document.getElementById("summary-ring-stand-circle");
  const stepsRatio = Math.min(1.2, m.steps / stepsGoal);
  const stepsOffset = Math.max(0, 163 - (163 * Math.min(1, stepsRatio)));
  if (stepsCircle) stepsCircle.style.strokeDashoffset = stepsOffset;
  const stepsValEl = document.getElementById("summary-ring-steps-val") || document.getElementById("summary-ring-stand-val");
  if (stepsValEl) stepsValEl.innerText = `${m.steps.toLocaleString()} / ${stepsGoal.toLocaleString()} pasos`;

  const targetCalEl = document.getElementById("summary-target-calories");
  if (targetCalEl) targetCalEl.innerText = `${p.targetCalories} kcal`;
  const targetProtEl = document.getElementById("summary-target-protein");
  if (targetProtEl) targetProtEl.innerText = `${p.protein} g`;
  const targetCarbsEl = document.getElementById("summary-target-carbs");
  if (targetCarbsEl) targetCarbsEl.innerText = `${p.carbs} g`;
  const targetFatsEl = document.getElementById("summary-target-fats");
  if (targetFatsEl) targetFatsEl.innerText = `${p.fats} g`;
}

export function renderProfileView() {
  const p = appState.profiles[appState.activeProfileId];
  if (!p) return;
  
  const subElem = document.getElementById("profile-subtitle");
  if (subElem) subElem.innerText = `Personalización para ${p.name} (${p.height}cm, ${p.weight}kg)`;
  
  const calElem = document.getElementById("target-calories");
  if (calElem) calElem.innerText = `${p.targetCalories} kcal`;
  const protElem = document.getElementById("target-protein");
  if (protElem) protElem.innerText = `${p.protein} g`;
  const carbElem = document.getElementById("target-carbs");
  if (carbElem) carbElem.innerText = `${p.carbs} g`;
  const fatElem = document.getElementById("target-fats");
  if (fatElem) fatElem.innerText = `${p.fats} g`;

  updateShortcutUrlInputs();
  renderWorkoutTracker();
}

// ==========================================
// 7. NUTRITION, RECIPES & SHOPPING VIEWS
// ==========================================
export function renderExclusions() {}
export function addExclusion() {}
export function removeExclusion() {}

export function getFilteredRecipes() {
  if (!RECIPES_DATABASE) return [];
  if (!appState.exclusions || appState.exclusions.length === 0) return RECIPES_DATABASE;
  return RECIPES_DATABASE.filter(recipe => {
    const recipeText = (recipe.name + " " + recipe.ingredients.map(i => i.name).join(" ")).toLowerCase();
    return !appState.exclusions.some(ex => recipeText.includes(ex));
  });
}

export function openTodayNutrition() {
  const today = getTodayDayName();
  appState.activeDay = today;
  const selectElem = document.getElementById("nutrition-day-select");
  if (selectElem) selectElem.value = today;
  showTab("nutrition-menu-view", document.getElementById("dock-btn-nutrition"));
}

export function selectDay(dayName) {
  appState.activeDay = dayName;
  const selectElem = document.getElementById("nutrition-day-select");
  if (selectElem) selectElem.value = dayName;
  renderNutritionMenuView();
}

export function selectDayFromDropdown(dayName) {
  appState.activeDay = dayName;
  renderNutritionMenuView();
}

export function renderNutritionMenuView() {
  const container = document.getElementById("meal-cards-container");
  if (!container) return;
  container.innerHTML = "";

  const availableRecipes = getFilteredRecipes();
  if (availableRecipes.length === 0) return;

  const breakfasts = availableRecipes.filter(r => r.type === "desayuno");
  const lunches = availableRecipes.filter(r => r.type === "comida");
  const dinners = availableRecipes.filter(r => r.type === "cena");
  const snacks = availableRecipes.filter(r => r.type === "snack");

  const dayNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const currentDay = appState.activeDay || getTodayDayName();
  const dayIndex = Math.max(0, dayNames.indexOf(currentDay));

  const selectElem = document.getElementById("nutrition-day-select");
  if (selectElem && selectElem.value !== currentDay) selectElem.value = currentDay;

  const mealSlots = [
    { slotLabel: "DESAYUNO", slotIcon: "fa-sun", color: "var(--accent-amber)", meal: breakfasts[dayIndex % (breakfasts.length || 1)] || RECIPES_DATABASE[0] },
    { slotLabel: "SNACK 1 (MAÑANA)", slotIcon: "fa-apple-whole", color: "var(--accent-emerald)", meal: snacks[dayIndex % (snacks.length || 1)] || RECIPES_DATABASE[8] },
    { slotLabel: "COMIDA", slotIcon: "fa-utensils", color: "var(--accent-cyan)", meal: lunches[dayIndex % (lunches.length || 1)] || RECIPES_DATABASE[3] },
    { slotLabel: "SNACK 2 (TARDE)", slotIcon: "fa-cookie-bite", color: "var(--accent-purple)", meal: snacks[(dayIndex + 1) % (snacks.length || 1)] || RECIPES_DATABASE[9] },
    { slotLabel: "CENA", slotIcon: "fa-moon", color: "var(--accent-rose)", meal: dinners[dayIndex % (dinners.length || 1)] || RECIPES_DATABASE[6] }
  ];

  mealSlots.forEach((slot, idx) => {
    const meal = slot.meal;
    if (!meal) return;

    const card = document.createElement("div");
    card.className = "glass-card meal-card vertical-meal-card";
    const ingredientsHtml = meal.ingredients.map(ing => `<li><span>${ing.name}</span><strong>${ing.amount} ${ing.unit}</strong></li>`).join("");
    const tagsHtml = meal.tags.map(t => `<span class="macro-pill">${t}</span>`).join(" ");

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">
        <div class="meal-card-type" style="color: ${slot.color}; font-size: 0.82rem; display: flex; align-items: center; gap: 0.4rem;">
          <i class="fa-solid ${slot.slotIcon}"></i> <strong>${slot.slotLabel}</strong> • ${meal.prepTime} min prep
        </div>
        <span style="font-size: 0.75rem; color: var(--text-muted); background: var(--bg-card); padding: 2px 8px; border-radius: 12px; border: 1px solid var(--border-color);">
          Plato ${idx + 1} de 5
        </span>
      </div>
      <h3 class="meal-card-title" style="font-size: 1.15rem; margin-bottom: 0.6rem;">${meal.name}</h3>
      <div class="meal-macros-pills" style="margin-bottom: 0.75rem;">
        <span class="macro-pill" style="color:var(--accent-amber);"><i class="fa-solid fa-fire"></i> ${meal.calories} kcal</span>
        <span class="macro-pill" style="color:var(--accent-emerald);"><i class="fa-solid fa-dumbbell"></i> ${meal.protein}g Proteína</span>
        <span class="macro-pill" style="color:var(--accent-cyan);"><i class="fa-solid fa-wheat-awn"></i> ${meal.carbs}g Carbs</span>
        <span class="macro-pill" style="color:var(--accent-violet);"><i class="fa-solid fa-droplet"></i> ${meal.fats}g Grasas</span>
      </div>
      <div style="margin-bottom: 0.85rem;">${tagsHtml}</div>
      <ul class="ingredient-list">${ingredientsHtml}</ul>
    `;
    container.appendChild(card);
  });
}

export function setRecipesRange(range) {
  appState.recipesDaysRange = range;
  saveState();
  renderNutritionRecipesView();
}

export function renderNutritionRecipesView() {
  const container = document.getElementById("recipes-cards-container");
  if (!container) return;
  container.innerHTML = "";

  const range = appState.recipesDaysRange || '5';
  const dayNames = range === '5' ? ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"] : ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  const btn5 = document.getElementById("recipes-range-5");
  const btn7 = document.getElementById("recipes-range-7");
  if (btn5) btn5.classList.toggle("active", range === '5');
  if (btn7) btn7.classList.toggle("active", range === '7');

  const availableRecipes = getFilteredRecipes();
  availableRecipes.slice(0, 12).forEach(meal => {
    const card = document.createElement("div");
    card.className = "glass-card recipe-batch-card";
    const ingredientsHtml = meal.ingredients.map(ing => `<li><span>${ing.name}</span><strong>${ing.amount} ${ing.unit}</strong></li>`).join("");

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
        <span class="meal-card-type"><i class="fa-solid fa-fire-burner"></i> ${meal.type.toUpperCase()} • ${meal.prepTime} min</span>
      </div>
      <h3 class="meal-card-title">${meal.name}</h3>
      <div class="meal-macros-pills">
        <span class="macro-pill" style="color:var(--accent-amber);">${meal.calories} kcal</span>
        <span class="macro-pill" style="color:var(--accent-emerald);">${meal.protein}g Prot</span>
        <span class="macro-pill" style="color:var(--accent-cyan);">${meal.carbs}g Carbs</span>
      </div>
      <ul class="ingredient-list">${ingredientsHtml}</ul>
    `;
    container.appendChild(card);
  });
}

export function setShoppingRange(range) {
  appState.shoppingDaysRange = range;
  saveState();
  renderShoppingView();
}

export function renderShoppingView() {
  const container = document.getElementById("shopping-categories-container");
  if (!container) return;
  container.innerHTML = "";

  const range = appState.shoppingDaysRange || '5';
  const btn5 = document.getElementById("shopping-range-5");
  const btn7 = document.getElementById("shopping-range-7");
  if (btn5) btn5.classList.toggle("active", range === '5');
  if (btn7) btn7.classList.toggle("active", range === '7');

  const availableRecipes = getFilteredRecipes();
  const aggregated = {};

  availableRecipes.slice(0, 8).forEach(meal => {
    meal.ingredients.forEach(ing => {
      const key = `${ing.name} (${ing.unit})`;
      if (!aggregated[key]) {
        aggregated[key] = { name: ing.name, amount: 0, unit: ing.unit, category: ing.category || INGREDIENT_CATEGORIES.PANTRY };
      }
      aggregated[key].amount += ing.amount;
    });
  });

  const categories = {};
  Object.values(aggregated).forEach(item => {
    if (!categories[item.category]) categories[item.category] = [];
    categories[item.category].push(item);
  });

  Object.keys(categories).forEach(catName => {
    const catSection = document.createElement("div");
    catSection.className = "shopping-category";
    const itemsHtml = categories[catName].map(item => {
      const itemKey = item.name.toLowerCase();
      const isChecked = !!appState.checkedShoppingItems[itemKey];
      return `
        <div class="shopping-item ${isChecked ? 'checked' : ''}" onclick="toggleShoppingItem('${itemKey}', this)">
          <input type="checkbox" ${isChecked ? 'checked' : ''} onclick="event.stopPropagation(); toggleShoppingItem('${itemKey}', this.parentNode);">
          <span class="shopping-item-name">${item.name}</span>
          <span class="shopping-item-qty">${item.amount} ${item.unit}</span>
        </div>
      `;
    }).join("");

    catSection.innerHTML = `
      <h3 class="shopping-cat-title"><i class="fa-solid fa-basket-shopping"></i> ${catName}</h3>
      <div class="shopping-items-grid">${itemsHtml}</div>
    `;
    container.appendChild(catSection);
  });
}

export function toggleShoppingItem(itemKey, elem) {
  appState.checkedShoppingItems[itemKey] = !appState.checkedShoppingItems[itemKey];
  saveState();
  if (elem) {
    elem.classList.toggle("checked", appState.checkedShoppingItems[itemKey]);
    const cb = elem.querySelector("input[type='checkbox']");
    if (cb) cb.checked = appState.checkedShoppingItems[itemKey];
  }
}

export function copyShoppingList() {
  let text = "🛒 LISTA DE LA COMPRA - FITDUO & COLLIE 🛒\n\n";
  document.querySelectorAll(".shopping-category").forEach(cat => {
    const title = cat.querySelector(".shopping-cat-title").innerText;
    text += `\n--- ${title} ---\n`;
    cat.querySelectorAll(".shopping-item").forEach(item => {
      const name = item.querySelector(".shopping-item-name").innerText;
      const qty = item.querySelector(".shopping-item-qty").innerText;
      const checked = item.classList.contains("checked") ? "[X]" : "[ ]";
      text += `${checked} ${name}: ${qty}\n`;
    });
  });
  navigator.clipboard.writeText(text).then(() => {
    showIosToast("¡Lista copiada al portapapeles!", "fa-solid fa-copy");
  });
}

// ==========================================
// 8. WORKOUTS & ROUTINES VIEW (SUBTAB 1 & SUBTAB 3)
// ==========================================
export function isDayCompleted(profileId, dayName) {
  const val = appState.completedWorkouts?.[profileId]?.[dayName];
  if (!val) return false;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'object') return !!val.done;
  return false;
}

export function getDayWatchData(profileId, dayName) {
  const val = appState.completedWorkouts?.[profileId]?.[dayName];
  if (val && typeof val === 'object' && val.watchData) {
    return val.watchData;
  }
  return null;
}

export function getDaySessions(profileId, dayName) {
  const val = appState.completedWorkouts?.[profileId]?.[dayName];
  if (val && typeof val === 'object') {
    if (Array.isArray(val.sessions) && val.sessions.length > 0) {
      return val.sessions;
    }
    if (val.watchData) {
      return [val.watchData];
    }
  }
  return [];
}

export function toggleWorkoutDay(dayName) {
  triggerHapticTouch();
  const pid = appState.activeProfileId;
  if (!appState.completedWorkouts) appState.completedWorkouts = {};
  if (!appState.completedWorkouts[pid]) appState.completedWorkouts[pid] = {};

  const isDone = isDayCompleted(pid, dayName);

  if (isDone) {
    appState.completedWorkouts[pid][dayName] = { done: false, watchData: null, sessions: [] };
  } else {
    appState.completedWorkouts[pid][dayName] = {
      done: true,
      watchData: null,
      sessions: []
    };
  }

  saveState();
  renderAll();
  showIosToast(!isDone ? `🏋️ ¡Entrenamiento (${dayName}) completado!` : `Entrenamiento (${dayName}) desmarcado`, "fa-solid fa-dumbbell");
}

export function deleteWorkoutSession(dayName, sessionIndex) {
  triggerHapticTouch();
  const pid = appState.activeProfileId;
  const dayEntry = appState.completedWorkouts?.[pid]?.[dayName];
  if (!dayEntry || !Array.isArray(dayEntry.sessions)) return;

  dayEntry.sessions.splice(sessionIndex, 1);
  if (dayEntry.sessions.length === 0) {
    appState.completedWorkouts[pid][dayName] = { done: false, watchData: null, sessions: [] };
  } else {
    dayEntry.watchData = dayEntry.sessions[dayEntry.sessions.length - 1];
  }

  saveState();
  renderAll();
  showIosToast("🗑️ Sesión de entrenamiento eliminada", "fa-solid fa-trash-can");
}

export function resetWorkoutWeek() {
  triggerHapticTouch();
  const pid = appState.activeProfileId;
  if (!appState.completedWorkouts) appState.completedWorkouts = {};
  if (!appState.completedWorkouts[pid]) appState.completedWorkouts[pid] = {};
  ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].forEach(d => {
    appState.completedWorkouts[pid][d] = { done: false, watchData: null, sessions: [] };
  });
  saveState();
  renderAll();
  showIosToast("🔄 Semana de entrenamientos reiniciada", "fa-solid fa-rotate-left");
}

export function syncAppleWatchData() {
  triggerManualSync();
}

export function renderWorkoutTracker() {
  const pid = appState.activeProfileId;
  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const completedCount = days.filter(d => isDayCompleted(pid, d)).length;

  const countEl = document.getElementById("tracker-completed-count");
  if (countEl) countEl.innerText = `${completedCount}/7 Días Completados`;

  const barEl = document.getElementById("tracker-progress-bar");
  if (barEl) barEl.style.width = `${(completedCount / 7) * 100}%`;

  const daysGrid = document.getElementById("tracker-days-grid");
  if (daysGrid) {
    daysGrid.innerHTML = days.map(d => {
      const isDone = isDayCompleted(pid, d);
      return `
        <button type="button" class="tracker-day-pill ${isDone ? 'completed' : ''}" onclick="toggleWorkoutDay('${d}')">
          <i class="fa-solid ${isDone ? 'fa-circle-check' : 'fa-circle'}"></i>
          <span>${d.slice(0, 3)}</span>
        </button>
      `;
    }).join("");
  }
}

export function openTodayWorkouts() {
  showTab("workouts-view", document.getElementById("dock-btn-workouts"));
}

export function openManualWorkoutModal() {
  triggerHapticTouch();
  const modal = document.getElementById("manual-workout-modal");
  if (modal) {
    const timeInput = document.getElementById("manual-workout-timestamp");
    if (timeInput) {
      timeInput.value = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " hs";
    }
    modal.classList.add("active");
  }
}

export function closeManualWorkoutModal() {
  const modal = document.getElementById("manual-workout-modal");
  if (modal) modal.classList.remove("active");
}

export function saveManualWorkoutSession(e) {
  if (e) e.preventDefault();
  triggerHapticTouch();

  const durInput = document.getElementById("manual-workout-duration");
  const kcalInput = document.getElementById("manual-workout-kcal");
  const timeInput = document.getElementById("manual-workout-timestamp");

  const duration = parseInt(durInput?.value || "30", 10);
  const kcal = parseInt(kcalInput?.value || "250", 10);
  const timestamp = timeInput?.value.trim() || (new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " hs");

  const pid = appState.activeProfileId;
  const today = getTodayDayName();

  if (!appState.completedWorkouts) appState.completedWorkouts = {};
  if (!appState.completedWorkouts[pid]) appState.completedWorkouts[pid] = {};

  const existing = appState.completedWorkouts[pid][today] || {};
  const sessions = Array.isArray(existing.sessions) ? [...existing.sessions] : (existing.watchData ? [existing.watchData] : []);

  const newSession = {
    deviceName: "Registro Manual",
    durationMin: duration,
    kcal: kcal,
    timestamp: timestamp,
    autoSync: false,
    isScheduled: true
  };

  sessions.push(newSession);

  appState.completedWorkouts[pid][today] = {
    done: true,
    watchData: newSession,
    sessions: sessions
  };

  saveState();
  closeManualWorkoutModal();
  if (durInput) durInput.value = "";
  if (kcalInput) kcalInput.value = "";

  renderAll();
  showIosToast(`🏋️ Sesión añadida (${duration} min · ${kcal} kcal)`, "fa-solid fa-dumbbell");
}

// SUBTAB 1: RENDER REGISTRO DE ENTRENAMIENTOS DE HOY
export function renderWorkoutsView() {
  const container = document.getElementById("workouts-daily-container") || document.getElementById("routines-container");
  if (!container) return;
  container.innerHTML = "";

  const profileId = appState.activeProfileId;
  const today = getTodayDayName();
  const sessions = getDaySessions(profileId, today);

  if (sessions.length === 0) {
    const emptyCard = document.createElement("div");
    emptyCard.className = "glass-card";
    emptyCard.style.cssText = "text-align: center; padding: 2.8rem 1.5rem; border: 1px dashed var(--border-color); border-radius: var(--radius-md);";
    emptyCard.innerHTML = `
      <div style="font-size: 2.8rem; margin-bottom: 0.75rem; color: var(--text-muted); opacity: 0.5;">
        <i class="fa-solid fa-dumbbell"></i>
      </div>
      <h3 style="font-family: var(--font-heading); font-size: 1.2rem; color: #fff; margin-bottom: 0.4rem;">
        Hoy no se han registrado entrenamientos
      </h3>
      <p style="font-size: 0.85rem; color: var(--text-muted); max-width: 440px; margin: 0 auto 1.5rem auto; line-height: 1.45;">
        Los entrenamientos que ejecutes con los atajos de Apple Watch o añadas manualmente se guardarán en esta lista diaria.
      </p>
      <button type="button" class="btn-primary" onclick="openManualWorkoutModal()" style="display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; padding: 0.55rem 1.1rem; margin: 0 auto;">
        <i class="fa-solid fa-plus"></i> + Añadir Entrenamiento Manual
      </button>
    `;
    container.appendChild(emptyCard);
    return;
  }

  const totalMin = sessions.reduce((acc, s) => acc + (s.durationMin || 0), 0);
  const totalKcal = sessions.reduce((acc, s) => acc + (s.kcal || 0), 0);

  const summaryCard = document.createElement("div");
  summaryCard.className = "glass-card watch-workout-summary-card";
  summaryCard.style.marginBottom = "1.25rem";

  summaryCard.innerHTML = `
    <div class="watch-summary-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
      <div class="watch-summary-title">
        <div class="watch-icon-glow"><i class="fa-solid fa-bolt"></i></div>
        <div>
          <h3 style="font-family: var(--font-heading); font-size: 1.15rem; color: #fff;">
            Entrenamientos Registrados Hoy (${today})
          </h3>
          <p style="color: var(--text-muted); font-size: 0.82rem; margin-top: 2px;">
            ${sessions.length} ${sessions.length === 1 ? 'sesión completada' : 'sesiones completadas'}
          </p>
        </div>
      </div>
      <button type="button" class="btn-secondary-sm" onclick="openManualWorkoutModal()" style="font-size: 0.78rem; padding: 5px 12px; border-radius: 8px;">
        <i class="fa-solid fa-plus"></i> + Añadir otra sesión
      </button>
    </div>

    <div class="watch-summary-grid" style="grid-template-columns: repeat(2, 1fr); margin-top: 0.85rem;">
      <div class="summary-metric-box">
        <span class="metric-lbl"><i class="fa-solid fa-stopwatch" style="color:var(--accent-cyan);"></i> Tiempo Total Medido</span>
        <span class="metric-val" style="color:var(--accent-cyan);">${totalMin} <small>min</small></span>
      </div>
      <div class="summary-metric-box">
        <span class="metric-lbl"><i class="fa-solid fa-fire" style="color:var(--accent-rose);"></i> Calorías Totales</span>
        <span class="metric-val" style="color:var(--accent-rose);">${totalKcal} <small>kcal</small></span>
      </div>
    </div>

    <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.08);">
      <div style="font-size: 0.82rem; font-weight: 600; color: var(--accent-cyan); margin-bottom: 0.6rem; display: flex; align-items: center; gap: 0.4rem;">
        <i class="fa-solid fa-list-check"></i> Desglose de Sesiones de Hoy:
      </div>
      <div style="display: flex; flex-direction: column; gap: 0.45rem;">
        ${sessions.map((s, idx) => `
          <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.04); padding: 0.55rem 0.85rem; border-radius: 8px; font-size: 0.83rem;">
            <div>
              <span style="font-weight: 600; color: #fff;"><i class="fa-solid fa-stopwatch" style="color:var(--accent-cyan);"></i> Sesión ${idx + 1}</span>
              <span style="color: var(--text-muted); font-size: 0.75rem; margin-left: 0.4rem;">(${s.timestamp || '--'})</span>
              <span style="color: var(--text-muted); font-size: 0.72rem; margin-left: 0.3rem;">• ${s.deviceName || 'Apple Watch'}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <span style="color: var(--accent-cyan); font-weight: 600;">${s.durationMin || 0} min</span>
              <span style="color: var(--accent-rose); font-weight: 600;">${s.kcal || 0} kcal</span>
              <button type="button" onclick="deleteWorkoutSession('${today}', ${idx})" style="background: transparent; border: none; color: #ef4444; cursor: pointer; padding: 2px 6px; font-size: 0.85rem;" title="Eliminar esta sesión">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  container.appendChild(summaryCard);
}

// SUBTAB 3: RENDER TABLA DE EJERCICIOS SEMANAL (RUTINAS POR DÍA)
export function selectExerciseDayFromDropdown(dayName) {
  appState.activeExerciseDay = dayName;
  renderExerciseTableView();
}

export function selectWorkoutDay(dayName) {
  selectExerciseDayFromDropdown(dayName);
}

export function selectWorkoutDayFromDropdown(dayName) {
  selectExerciseDayFromDropdown(dayName);
}

export function renderExerciseTableView() {
  const container = document.getElementById("exercise-routines-container");
  if (!container) return;
  container.innerHTML = "";

  const activeDay = appState.activeExerciseDay || getTodayDayName();

  const selectElem = document.getElementById("exercise-day-select");
  if (selectElem && selectElem.value !== activeDay) {
    selectElem.value = activeDay;
  }

  const routine = WEEKLY_WORKOUT_SCHEDULE?.[activeDay] || WEEKLY_WORKOUT_SCHEDULE?.["Lunes"];
  if (!routine) return;

  const card = document.createElement("div");
  card.className = "glass-card";

  const rows = (routine.exercises || []).map(ex => `
    <tr>
      <td>
        <div class="exercise-name">${ex.name}</div>
        <div class="exercise-tech"><i class="fa-solid fa-lightbulb" style="color:var(--accent-amber);"></i> ${ex.technique || ''}</div>
      </td>
      <td><strong style="color:var(--accent-emerald);">${ex.sets}</strong> series</td>
      <td><strong>${ex.reps}</strong> reps</td>
      <td><span style="color:var(--text-muted);">${ex.rest}</span></td>
    </tr>
  `).join("");

  card.innerHTML = `
    <div class="routine-header-box" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:1rem;">
      <div>
        <h2 style="font-family: var(--font-heading); font-size: 1.3rem;">${routine.title} (${activeDay})</h2>
        <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 2px;">Enfoque: ${routine.focus || ''}</p>
      </div>
      <div>
        <span class="routine-badge"><i class="fa-solid fa-clock"></i> ${routine.duration} min (Juntos)</span>
      </div>
    </div>

    <div style="display:flex; flex-wrap: wrap; gap: 1rem; font-size: 0.82rem; color: var(--text-muted); margin-bottom: 0.85rem;">
      <span><i class="fa-solid fa-location-dot" style="color:var(--accent-cyan);"></i> ${routine.location || 'En casa'}</span>
      <span><i class="fa-solid fa-dumbbell" style="color:var(--accent-emerald);"></i> ${routine.type || 'Fuerza'}</span>
      <span><i class="fa-solid fa-toolbox" style="color:var(--accent-violet);"></i> Equipamiento: ${(routine.equipment || []).join(", ")}</span>
    </div>

    <div class="table-responsive">
      <table class="exercise-table">
        <thead>
          <tr>
            <th>Ejercicio & Técnica</th>
            <th>Series</th>
            <th>Repeticiones / Tiempo</th>
            <th>Descanso</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;

  container.appendChild(card);
}

export function openEditWorkoutWatchModal(dayName) {
  const modal = document.getElementById("edit-workout-watch-modal");
  if (modal) modal.classList.add("active");
}

export function closeEditWorkoutWatchModal() {
  const modal = document.getElementById("edit-workout-watch-modal");
  if (modal) modal.classList.remove("active");
}

export function saveWorkoutWatchDataFromModal(e) {
  if (e) e.preventDefault();
  closeEditWorkoutWatchModal();
  saveState();
  renderAll();
}

export function recordWatchWorkoutForDay() {
  toggleWorkoutDay(getTodayDayName());
}

export function connectBluetoothHR() {
  showIosToast("Buscando pulsómetro Bluetooth...", "fa-brands fa-bluetooth-b");
}

// ==========================================
// 9. BOO (BORDER COLLIE) TRAINING VIEW (SUBTAB 2)
// ==========================================
export function selectBooDayFromDropdown(dayName) {
  appState.activeBooDay = dayName;
  renderBooWorkoutView();
}

export function toggleBooTask(taskId, dayName = null) {
  triggerHapticTouch();
  const targetDay = dayName || appState.activeBooDay || getTodayDayName();
  if (!appState.booProgress) appState.booProgress = {};
  if (!appState.booProgress.completedTasks) appState.booProgress.completedTasks = {};
  const current = !!appState.booProgress.completedTasks[taskId];
  appState.booProgress.completedTasks[taskId] = !current;
  saveState();
  renderBooWorkoutView();
  showIosToast(!current ? "🐾 ¡Ejercicio de Boo registrado!" : "Ejercicio desmarcado", "fa-solid fa-paw");
}

export function setBooMood(dayName, mood) {
  triggerHapticTouch();
  if (!appState.booProgress) appState.booProgress = {};
  if (!appState.booProgress.moodLogs) appState.booProgress.moodLogs = {};
  appState.booProgress.moodLogs[dayName] = mood;
  saveState();
  renderBooWorkoutView();
  showIosToast(`Estado de Boo: ${mood}`, "fa-solid fa-face-smile-wink");
}

export function saveBooSessionNotes(dayName) {
  triggerHapticTouch();
  const input = document.getElementById("boo-session-note-input");
  if (!input) return;
  if (!appState.booProgress) appState.booProgress = {};
  if (!appState.booProgress.sessionNotes) appState.booProgress.sessionNotes = {};
  appState.booProgress.sessionNotes[dayName] = input.value.trim();
  saveState();
  showIosToast("📝 Nota guardada", "fa-solid fa-floppy-disk");
}

export function markBooModulePracticed(moduleId) {
  triggerHapticTouch();
  if (!appState.booProgress) appState.booProgress = {};
  if (!appState.booProgress.moduleStats) appState.booProgress.moduleStats = {};
  appState.booProgress.moduleStats[moduleId] = (appState.booProgress.moduleStats[moduleId] || 0) + 1;
  saveState();
  renderBooWorkoutView();
  showIosToast("🐾 ¡Módulo practicado!", "fa-solid fa-paw");
}

export function toggleContinuousItem(itemId, dayName) {
  triggerHapticTouch();
  if (!appState.booProgress) appState.booProgress = {};
  if (!appState.booProgress.completedContinuous) appState.booProgress.completedContinuous = {};
  const key = `${dayName}_${itemId}`;
  const cur = !!appState.booProgress.completedContinuous[key];
  appState.booProgress.completedContinuous[key] = !cur;
  saveState();
  renderBooWorkoutView();
  showIosToast(!cur ? "🐾 Hábito reforzado" : "Desmarcado", "fa-solid fa-paw");
}

export function markTrickMastered(trickId) {
  triggerHapticTouch();
  if (!appState.booProgress) appState.booProgress = {};
  if (!appState.booProgress.learnedTricks) appState.booProgress.learnedTricks = [];
  if (!appState.booProgress.learnedTricks.includes(trickId)) {
    appState.booProgress.learnedTricks.push(trickId);
  }
  const next = BOO_TRICKS_BACKLOG?.find(t => !appState.booProgress.learnedTricks.includes(t.id));
  appState.booProgress.activeTrickId = next ? next.id : null;
  saveState();
  renderBooWorkoutView();
  showIosToast("🎉 ¡Enhorabuena! Boo ha dominado un nuevo truco.", "fa-solid fa-trophy");
}

export function selectActiveTrickFromBacklog(trickId) {
  triggerHapticTouch();
  if (!appState.booProgress) appState.booProgress = {};
  appState.booProgress.activeTrickId = trickId;
  saveState();
  renderBooWorkoutView();
  showIosToast("🎯 Truco fijado para hoy", "fa-solid fa-bullseye");
}

export function toggleBooAccordion(accordionId) {
  triggerHapticTouch();
  if (!appState.booProgress) appState.booProgress = {};
  if (!appState.booProgress.accordions) appState.booProgress.accordions = {};
  appState.booProgress.accordions[accordionId] = !appState.booProgress.accordions[accordionId];
  saveState();
  renderBooWorkoutView();
}

export function openBooBacklogModal() {
  triggerHapticTouch();
  let modal = document.getElementById("boo-backlog-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "boo-backlog-modal";
    modal.className = "modal-overlay";
    modal.onclick = (e) => closeBooBacklogModalOnBackdrop(e);
    modal.innerHTML = `
      <div class="glass-modal" style="max-width: 620px;" onclick="event.stopPropagation()">
        <div class="modal-header">
          <div class="modal-header-title">
            <div style="font-size: 1.8rem;">🐕</div>
            <div>
              <h3 style="color: #fff;">Mapa de Adiestramiento de Boo 🐾</h3>
              <p style="font-size: 0.78rem; color: var(--accent-amber);">Catálogo completo de trucos</p>
            </div>
          </div>
          <button type="button" class="modal-close-btn" onclick="closeBooBacklogModal()"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="modal-body" id="boo-backlog-modal-content" style="padding-top: 1rem;"></div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  renderBooBacklogModalUI();
  modal.classList.add("active");
}

export function closeBooBacklogModal() {
  triggerHapticTouch();
  const modal = document.getElementById("boo-backlog-modal");
  if (modal) modal.classList.remove("active");
}

export function closeBooBacklogModalOnBackdrop(e) {
  if (e && e.target && e.target.id === "boo-backlog-modal") {
    closeBooBacklogModal();
  }
}

export function renderBooBacklogModalUI() {
  const container = document.getElementById("boo-backlog-modal-content");
  if (!container) return;

  if (!appState.booProgress) {
    appState.booProgress = { completedContinuous: {}, learnedTricks: [], activeTrickId: null, moodLogs: {}, sessionNotes: {}, accordions: {} };
  }

  const learnedTricks = appState.booProgress.learnedTricks || [];
  const activeTrickId = appState.booProgress.activeTrickId;
  const unlearnedTricks = (BOO_TRICKS_BACKLOG || []).filter(t => !learnedTricks.includes(t.id));
  const masteredTricks = (BOO_TRICKS_BACKLOG || []).filter(t => learnedTricks.includes(t.id));

  const unlearnedListHtml = unlearnedTricks.map((t, idx) => {
    const isCurrentActive = activeTrickId === t.id;
    return `
      <div style="padding: 0.85rem 0.95rem; background: var(--bg-secondary); border-radius: var(--radius-sm); border: 1px solid ${isCurrentActive ? 'var(--accent-amber)' : 'var(--border-color)'}; margin-bottom: 0.75rem;">
        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem;">
          <div style="display: flex; align-items: flex-start; gap: 0.6rem; flex: 1;">
            <span style="font-weight: 700; font-size: 0.8rem; color: var(--accent-amber); background: rgba(245, 158, 11, 0.18); width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">#${idx + 1}</span>
            <div>
              <div style="font-size: 0.95rem; font-weight: 700; color: #fff;">
                <i class="${t.icon}" style="color: ${t.badgeColor}; font-size: 0.9rem; margin-right: 0.35rem;"></i>${t.title}
              </div>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 3px;">${t.summary}</div>
            </div>
          </div>
          <div>
            ${isCurrentActive ? `
              <span style="font-size: 0.75rem; background: rgba(245,158,11,0.22); color: var(--accent-amber); padding: 4px 10px; border-radius: 12px; font-weight: 700; border: 1px solid var(--accent-amber);">
                🎯 En Curso
              </span>
            ` : `
              <button type="button" class="btn-micro" onclick="selectActiveTrickFromBacklog('${t.id}'); closeBooBacklogModal();" style="font-size: 0.75rem; padding: 5px 12px; border-radius: 8px; background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-color);">
                Fijar Hoy
              </button>
            `}
          </div>
        </div>
      </div>
    `;
  }).join("");

  const masteredListHtml = masteredTricks.map(t => `
    <div style="padding: 0.75rem 0.95rem; background: rgba(16, 185, 129, 0.08); border-radius: var(--radius-sm); border: 1px solid rgba(16, 185, 129, 0.25); margin-bottom: 0.5rem; display: flex; align-items: center; justify-content: space-between;">
      <div>
        <div style="font-size: 0.9rem; font-weight: 700; color: #fff;"><i class="fa-solid fa-medal" style="color:var(--accent-emerald);"></i> ${t.title}</div>
        <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">${t.summary}</div>
      </div>
      <span style="font-size: 0.75rem; color: var(--accent-emerald); font-weight: 700; background: rgba(16,185,129,0.15); padding: 4px 10px; border-radius: 12px;">
        <i class="fa-solid fa-circle-check"></i> Dominado
      </span>
    </div>
  `).join("");

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-secondary); padding: 0.85rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); margin-bottom: 1.25rem;">
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <i class="fa-solid fa-graduation-cap" style="color: var(--accent-amber); font-size: 1.2rem;"></i>
        <span style="font-size: 0.88rem; font-weight: 600; color: #fff;">Progreso Total del Adiestramiento</span>
      </div>
      <div style="display: flex; gap: 0.5rem;">
        <span style="font-size: 0.78rem; padding: 3px 10px; border-radius: 12px; background: rgba(16, 185, 129, 0.2); color: var(--accent-emerald); font-weight: 700;">
          🏆 ${masteredTricks.length} Aprendidos
        </span>
        <span style="font-size: 0.78rem; padding: 3px 10px; border-radius: 12px; background: rgba(245, 158, 11, 0.2); color: var(--accent-amber); font-weight: 700;">
          ⏳ ${unlearnedTricks.length} Pendientes
        </span>
      </div>
    </div>

    <div style="margin-bottom: 1.5rem;">
      <h4 style="font-family: var(--font-heading); font-size: 1rem; color: var(--accent-amber); margin-bottom: 0.65rem;">
        <i class="fa-solid fa-list-ol"></i> Próximos Trucos en Cola (${unlearnedTricks.length})
      </h4>
      ${unlearnedListHtml || '<p style="font-size: 0.85rem; color: var(--text-muted); text-align: center; padding: 1rem;">🎉 ¡Felicidades! Boo ha aprendido todos los trucos programados.</p>'}
    </div>

    ${masteredTricks.length > 0 ? `
      <div>
        <h4 style="font-family: var(--font-heading); font-size: 1rem; color: var(--accent-emerald); margin-bottom: 0.65rem;">
          <i class="fa-solid fa-trophy"></i> Trucos Dominados (${masteredTricks.length})
        </h4>
        ${masteredListHtml}
      </div>
    ` : ''}
  `;
}

export function renderBooWorkoutView() {
  const container = document.getElementById("boo-workout-container");
  if (!container) return;
  container.innerHTML = "";

  const activeDay = appState.activeBooDay || getTodayDayName();

  const selectElem = document.getElementById("boo-day-select");
  if (selectElem && selectElem.value !== activeDay) {
    selectElem.value = activeDay;
  }

  if (!appState.booProgress) {
    appState.booProgress = { completedContinuous: {}, learnedTricks: [], activeTrickId: null, moodLogs: {}, sessionNotes: {}, accordions: {} };
  }

  const completedContinuous = appState.booProgress.completedContinuous || {};
  const learnedTricks = appState.booProgress.learnedTricks || [];
  const moodLogs = appState.booProgress.moodLogs || {};
  const sessionNotes = appState.booProgress.sessionNotes || {};
  const accordions = appState.booProgress.accordions || {};

  let activeTrick = (BOO_TRICKS_BACKLOG || []).find(t => t.id === appState.booProgress.activeTrickId);
  if (!activeTrick || learnedTricks.includes(activeTrick.id)) {
    activeTrick = (BOO_TRICKS_BACKLOG || []).find(t => !learnedTricks.includes(t.id)) || BOO_TRICKS_BACKLOG?.[0];
    appState.booProgress.activeTrickId = activeTrick ? activeTrick.id : null;
  }

  const currentMood = moodLogs[activeDay] || "🧘‍♂️ Calma & Enfocada";
  const currentNote = sessionNotes[activeDay] || "";

  // 1. BOO HERO BANNER
  const heroCard = document.createElement("div");
  heroCard.className = "glass-card boo-hero-card";
  heroCard.style.marginBottom = "1.25rem";
  heroCard.innerHTML = `
    <div class="boo-hero-header" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
      <div style="display: flex; align-items: center; gap: 1rem;">
        <div class="boo-avatar-badge" style="width: 52px; height: 52px; border-radius: 50%; background: linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(16, 185, 129, 0.25)); border: 2px solid var(--accent-amber); display: flex; align-items: center; justify-content: center; font-size: 1.7rem;">
          🐕
        </div>
        <div>
          <h2 style="font-family: var(--font-heading); font-size: 1.25rem; color: #fff; margin-bottom: 2px;">
            Boo <span style="font-size: 0.8rem; background: var(--bg-tertiary); color: var(--accent-amber); padding: 2px 8px; border-radius: 12px; font-weight: 500;">Border Collie • 3 años</span>
          </h2>
          <p style="color: var(--text-muted); font-size: 0.82rem;">
            Plan de adiestramiento conductual y mapa evolutivo de trucos
          </p>
        </div>
      </div>
      <div style="display: flex; gap: 0.6rem; flex-wrap: wrap; align-items: center;">
        <span class="boo-stat-pill"><i class="fa-solid fa-trophy" style="color:var(--accent-amber);"></i> ${learnedTricks.length} Dominados</span>
        <span class="boo-stat-pill"><i class="fa-solid fa-list-check" style="color:var(--accent-cyan);"></i> ${(BOO_TRICKS_BACKLOG || []).length - learnedTricks.length} En Cola</span>
        <button type="button" class="btn-primary" onclick="openBooBacklogModal()" style="font-size: 0.8rem; padding: 6px 12px; background: rgba(245, 158, 11, 0.18); border: 1px solid var(--accent-amber); color: var(--accent-amber); border-radius: 20px; font-weight: 600;">
          <i class="fa-solid fa-book-open"></i> Ver Mapa de Trucos
        </button>
      </div>
    </div>
  `;
  container.appendChild(heroCard);

  // 2. OBJETIVO DE APRENDIZAJE DE HOY
  if (activeTrick) {
    const isMastered = learnedTricks.includes(activeTrick.id);
    const activeTrickCard = document.createElement("div");
    activeTrickCard.className = "glass-card boo-active-trick-card";
    activeTrickCard.style.cssText = "margin-bottom: 1.25rem; border: 1px solid var(--accent-amber); background: linear-gradient(135deg, rgba(245,158,11,0.06), rgba(19,26,42,0.95));";

    const stepsListHtml = (activeTrick.steps || []).map((step, idx) => `
      <li style="margin-bottom: 0.45rem; font-size: 0.85rem; line-height: 1.4; color: var(--text-secondary); display: flex; gap: 0.5rem; align-items: flex-start;">
        <span style="background: ${activeTrick.badgeColor || 'var(--accent-amber)'}; color: #000; font-weight: 700; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; flex-shrink: 0; margin-top: 2px;">${idx + 1}</span>
        <span>${step}</span>
      </li>
    `).join("");

    activeTrickCard.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 0.85rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-size: 0.78rem; font-weight: 700; padding: 4px 12px; border-radius: 12px; background: rgba(245, 158, 11, 0.18); color: var(--accent-amber); border: 1px solid var(--accent-amber);">
            <i class="fa-solid fa-bullseye"></i> OBJETIVO DE APRENDIZAJE DE HOY
          </span>
          <span style="font-size: 0.78rem; color: var(--text-muted);">Dificultad: <strong style="color:#fff;">${activeTrick.difficulty || 'Media'}</strong></span>
        </div>
        <span style="font-size: 0.8rem; font-weight: 600; color: var(--accent-cyan); background: var(--bg-tertiary); padding: 4px 10px; border-radius: 12px;">
          <i class="${activeTrick.icon || 'fa-solid fa-star'}"></i> ${activeTrick.category || 'Habilidad'}
        </span>
      </div>

      <h3 style="font-family: var(--font-heading); font-size: 1.3rem; color: #fff; margin-bottom: 0.4rem;">
        ${activeTrick.title}
      </h3>
      <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 1rem; line-height: 1.4;">
        ${activeTrick.summary}
      </p>

      <div style="background: var(--bg-secondary); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); margin-bottom: 1rem;">
        <div style="font-size: 0.8rem; font-weight: 700; color: var(--accent-cyan); text-transform: uppercase; margin-bottom: 0.6rem; letter-spacing: 0.5px;">
          <i class="fa-solid fa-shoe-prints"></i> Paso a Paso para Entrenar Hoy:
        </div>
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${stepsListHtml}
        </ul>
      </div>

      ${activeTrick.proTip ? `
        <div style="background: rgba(245, 158, 11, 0.08); border-left: 3px solid var(--accent-amber); padding: 0.75rem 1rem; border-radius: 0 8px 8px 0; margin-bottom: 1.25rem; font-size: 0.82rem; color: var(--text-secondary);">
          <strong style="color: var(--accent-amber);"><i class="fa-solid fa-lightbulb"></i> Consejo Collie:</strong> ${activeTrick.proTip}
        </div>
      ` : ''}

      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; padding-top: 0.85rem; border-top: 1px solid var(--border-color);">
        <span style="font-size: 0.82rem; color: var(--text-muted);">
          Estado: <strong style="color: ${isMastered ? 'var(--accent-emerald)' : 'var(--accent-amber)'};">${isMastered ? '¡Ya Dominado!' : 'En Proceso de Aprendizaje'}</strong>
        </span>
        <button type="button" class="btn-primary" onclick="markTrickMastered('${activeTrick.id}')" style="background: linear-gradient(135deg, #10b981, #059669); font-size: 0.88rem; padding: 8px 16px;">
          <i class="fa-solid fa-circle-check"></i> ¡Dominado / Ya lo sabe! ✅ (Siguiente Truco)
        </button>
      </div>
    `;
    container.appendChild(activeTrickCard);
  }

  // 3. REFUERZO CONTINUO DEL PASEO
  const isContinuousOpen = accordions["continuous"] ?? true;
  const continuousAccordionCard = document.createElement("div");
  continuousAccordionCard.className = "glass-card boo-accordion-card";
  continuousAccordionCard.style.marginBottom = "1.25rem";

  const continuousItemsHtml = (BOO_CONTINUOUS_REINFORCEMENT || []).map(item => {
    const key = `${activeDay}_${item.id}`;
    const isDone = !!completedContinuous[key];
    return `
      <div class="boo-task-item ${isDone ? 'completed' : ''}" onclick="toggleContinuousItem('${item.id}', '${activeDay}')" style="display: flex; align-items: center; justify-content: space-between; padding: 0.85rem 1rem; background: var(--bg-secondary); border-radius: var(--radius-sm); border: 1px solid var(--border-color); margin-bottom: 0.5rem; cursor: pointer; transition: all 0.2s ease;">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div class="custom-checkbox ${isDone ? 'checked' : ''}" style="width: 22px; height: 22px; border-radius: 6px; border: 2px solid ${isDone ? 'var(--accent-emerald)' : 'var(--text-muted)'}; background: ${isDone ? 'var(--accent-emerald)' : 'transparent'}; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 0.75rem;">
            ${isDone ? '<i class="fa-solid fa-check"></i>' : ''}
          </div>
          <div>
            <div style="font-weight: 600; font-size: 0.92rem; color: ${isDone ? 'var(--text-muted)' : 'var(--text-primary)'}; ${isDone ? 'text-decoration: line-through;' : ''}">
              <i class="${item.icon}" style="color: ${item.color};"></i> ${item.title}
            </div>
            <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">${item.desc}</div>
          </div>
        </div>
        <span class="btn-micro" style="font-size: 0.78rem; padding: 4px 10px; border-radius: 12px; background: ${isDone ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-tertiary)'}; color: ${isDone ? 'var(--accent-emerald)' : 'var(--text-secondary)'}; font-weight: 600;">
          ${isDone ? '¡Reforzado!' : 'Practicado hoy'}
        </span>
      </div>
    `;
  }).join("");

  continuousAccordionCard.innerHTML = `
    <div class="boo-accordion-header" onclick="toggleBooAccordion('continuous')" style="display: flex; align-items: center; justify-content: space-between; cursor: pointer;">
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <i class="fa-solid fa-arrows-rotate" style="font-size: 1.1rem; color: var(--accent-cyan);"></i>
        <div>
          <h4 style="font-family: var(--font-heading); font-size: 1.05rem; color: #fff; margin: 0;">
            🔄 Refuerzo Continuo del Paseo (${activeDay})
          </h4>
          <p style="color: var(--text-muted); font-size: 0.8rem; margin: 2px 0 0 0;">
            Hábitos permanentes que se trabajan a diario durante las salidas (Pulsar para ${isContinuousOpen ? 'ocultar' : 'desplegar'})
          </p>
        </div>
      </div>
      <i class="fa-solid fa-chevron-${isContinuousOpen ? 'up' : 'down'}" style="color: var(--text-muted);"></i>
    </div>

    ${isContinuousOpen ? `
      <div style="margin-top: 1rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
        ${continuousItemsHtml}
      </div>
    ` : ''}
  `;
  container.appendChild(continuousAccordionCard);

  // 4. REGISTRO EMOCIONAL Y NOTAS DEL PASEO
  const moodCard = document.createElement("div");
  moodCard.className = "glass-card";
  moodCard.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 0.85rem;">
      <div>
        <h3 style="font-family: var(--font-heading); font-size: 1.05rem; color: #fff; display: flex; align-items: center; gap: 0.5rem;">
          <i class="fa-solid fa-face-smile-wink" style="color: var(--accent-amber);"></i> Registro Emocional y Notas del Paseo (${activeDay})
        </h3>
        <p style="color: var(--text-muted); font-size: 0.8rem;">Registra la actitud de Boo hoy y anotaciones de su evolución</p>
      </div>
    </div>

    <div style="margin-bottom: 1rem;">
      <label style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 0.4rem;">
        Estado de Ánimo Predominante de Boo Hoy:
      </label>
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
        ${["🧘‍♂️ Calma & Enfocada", "⚡ Alta Excitación", "🎾 Obsesionada con Pelota", "🎯 Excelente Respuesta a Llamada"].map(m => `
          <button type="button" class="boo-mood-btn ${currentMood === m ? 'active' : ''}" onclick="setBooMood('${activeDay}', '${m}')" style="padding: 6px 12px; border-radius: 20px; font-size: 0.78rem; font-weight: 500; border: 1px solid ${currentMood === m ? 'var(--accent-amber)' : 'var(--border-color)'}; background: ${currentMood === m ? 'rgba(245,158,11,0.2)' : 'var(--bg-secondary)'}; color: ${currentMood === m ? 'var(--accent-amber)' : 'var(--text-secondary)'}; cursor: pointer; transition: all 0.2s ease;">
            ${m}
          </button>
        `).join("")}
      </div>
    </div>

    <div>
      <label for="boo-session-note-input" style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 0.4rem;">
        Observaciones o Logro Destacado del Día:
      </label>
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <input type="text" id="boo-session-note-input" class="custom-input" placeholder="Ej: ¡Hoy volvió a la primera cuando la llamé en el parque!" value="${currentNote.replace(/"/g, '&quot;')}" style="flex: 1; min-width: 240px; font-size: 0.85rem;">
        <button type="button" class="btn-primary" onclick="saveBooSessionNotes('${activeDay}')" style="font-size: 0.82rem;">
          <i class="fa-solid fa-floppy-disk"></i> Guardar Nota
        </button>
      </div>
    </div>
  `;
  container.appendChild(moodCard);
}

// ==========================================
// 10. PROGRESS, SETTINGS & CHATBOT VIEWS
// ==========================================
let weightChartInstance = null;

export function renderProgressView() {
  const logs = appState.weightLogs[appState.activeProfileId] || [];
  const ctx = document.getElementById("weightChart");
  if (!ctx || typeof Chart === 'undefined') return;

  if (weightChartInstance) weightChartInstance.destroy();
  weightChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: logs.map(l => l.date),
      datasets: [{
        label: `Peso - ${getProfileShortName(appState.activeProfileId)}`,
        data: logs.map(l => l.weight),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.35
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

export function addWeightEntry() {
  const input = document.getElementById("weight-input");
  if (!input) return;
  const val = parseFloat(input.value);
  if (!isNaN(val) && val > 30 && val < 250) {
    const todayStr = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    const targetPid = getMasterProfileId();
    if (!appState.weightLogs[targetPid]) appState.weightLogs[targetPid] = [];
    appState.weightLogs[targetPid].push({ date: todayStr, weight: val });
    input.value = "";
    saveState();
    renderAll();
    showIosToast(`⚖️ Registro de ${val} kg guardado`, "fa-solid fa-weight-scale");
  }
}

export function populateSettingsInputs() {
  const inputNameHe = document.getElementById("setting-name-he");
  if (inputNameHe) inputNameHe.value = getProfileShortName('he');
  const inputNameShe = document.getElementById("setting-name-she");
  if (inputNameShe) inputNameShe.value = getProfileShortName('she');
  const inputCloudKey = document.getElementById("setting-cloud-key-input");
  if (inputCloudKey) inputCloudKey.value = getCloudSyncKey();
}

export function saveCustomSettings() {
  triggerHapticTouch();
  const nameHe = document.getElementById("setting-name-he")?.value.trim() || "Carlos";
  const nameShe = document.getElementById("setting-name-she")?.value.trim() || "Andrea";
  appState.profiles.he.name = nameHe;
  appState.profiles.she.name = nameShe;
  saveState();
  showIosToast("⚙️ Ajustes guardados", "fa-solid fa-floppy-disk");
  renderAll();
}

export function renderSettingsView() {
  const currentPref = localStorage.getItem(DEVICE_DEFAULT_PROFILE_KEY) || 'last';
  const btnHe = document.getElementById("pref-btn-he");
  const btnShe = document.getElementById("pref-btn-she");
  const btnLast = document.getElementById("pref-btn-last");
  if (btnHe) btnHe.classList.toggle("active", currentPref === 'he');
  if (btnShe) btnShe.classList.toggle("active", currentPref === 'she');
  if (btnLast) btnLast.classList.toggle("active", currentPref === 'last');

  updateUIProfileNames();
  populateSettingsInputs();
  updateCloudSyncUI("Conectado", true);
}

export function handleChatKeyPress(event) {
  if (event.key === "Enter") sendChatMessage();
}

export function sendChatMessage() {
  const input = document.getElementById("chat-input");
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  const messagesBox = document.getElementById("chat-messages");
  if (messagesBox) {
    const userMsg = document.createElement("div");
    userMsg.className = "chat-bubble user";
    userMsg.innerText = text;
    messagesBox.appendChild(userMsg);
    input.value = "";
    messagesBox.scrollTop = messagesBox.scrollHeight;

    setTimeout(() => {
      const botMsg = document.createElement("div");
      botMsg.className = "chat-bubble bot";
      botMsg.innerHTML = "💪 ¡Excelente pregunta! Para optimizar vuestro progreso, mantened la constancia en los entrenamientos y paseos con Boo.";
      messagesBox.appendChild(botMsg);
      messagesBox.scrollTop = messagesBox.scrollHeight;
    }, 400);
  }
}

// ==========================================
// 11. GLOBAL BINDINGS & BOOTSTRAP
// ==========================================
window.appState = appState;
window.switchProfile = switchProfile;
window.syncNowWithCloud = syncNowWithCloud;
window.setDeviceDefaultProfile = setDeviceDefaultProfile;
window.showTab = showTab;
window.switchCategory = switchCategory;
window.renderAll = renderAll;
window.renderSummaryView = renderSummaryView;
window.renderProfileView = renderProfileView;
window.addExclusion = addExclusion;
window.removeExclusion = removeExclusion;
window.toggleWorkoutDay = toggleWorkoutDay;
window.renderWorkoutTracker = renderWorkoutTracker;
window.deleteWorkoutSession = deleteWorkoutSession;
window.resetWorkoutWeek = resetWorkoutWeek;
window.syncAppleWatchData = syncAppleWatchData;
window.selectDay = selectDay;
window.selectDayFromDropdown = selectDayFromDropdown;
window.setRecipesRange = setRecipesRange;
window.setShoppingRange = setShoppingRange;
window.renderNutritionMenuView = renderNutritionMenuView;
window.renderNutritionRecipesView = renderNutritionRecipesView;
window.selectWorkoutDay = selectWorkoutDayFromDropdown;
window.selectWorkoutDayFromDropdown = selectWorkoutDayFromDropdown;
window.selectExerciseDayFromDropdown = selectExerciseDayFromDropdown;
window.renderExerciseTableView = renderExerciseTableView;
window.openManualWorkoutModal = openManualWorkoutModal;
window.closeManualWorkoutModal = closeManualWorkoutModal;
window.saveManualWorkoutSession = saveManualWorkoutSession;
window.selectBooDayFromDropdown = selectBooDayFromDropdown;
window.toggleBooTask = toggleBooTask;
window.toggleContinuousItem = toggleContinuousItem;
window.markTrickMastered = markTrickMastered;
window.selectActiveTrickFromBacklog = selectActiveTrickFromBacklog;
window.toggleBooAccordion = toggleBooAccordion;
window.openBooBacklogModal = openBooBacklogModal;
window.closeBooBacklogModal = closeBooBacklogModal;
window.closeBooBacklogModalOnBackdrop = closeBooBacklogModalOnBackdrop;
window.setBooMood = setBooMood;
window.saveBooSessionNotes = saveBooSessionNotes;
window.markBooModulePracticed = markBooModulePracticed;
window.renderBooWorkoutView = renderBooWorkoutView;
window.openTodayNutrition = openTodayNutrition;
window.openTodayWorkouts = openTodayWorkouts;
window.toggleShoppingItem = toggleShoppingItem;
window.copyShoppingList = copyShoppingList;
window.addWeightEntry = addWeightEntry;
window.sendChatMessage = sendChatMessage;
window.handleChatKeyPress = handleChatKeyPress;
window.openAppleWatchModal = openAppleWatchModal;
window.closeAppleWatchModal = closeAppleWatchModal;
window.closeAppleWatchModalOnBackdrop = closeAppleWatchModalOnBackdrop;
window.toggleAutoSync = toggleAutoSync;
window.triggerManualSync = triggerManualSync;
window.recordWatchWorkoutForDay = recordWatchWorkoutForDay;
window.connectBluetoothHR = connectBluetoothHR;
window.forceAppRefresh = forceAppRefresh;
window.setAppleWatchSyncMode = setAppleWatchSyncMode;
window.openEditWorkoutWatchModal = openEditWorkoutWatchModal;
window.closeEditWorkoutWatchModal = closeEditWorkoutWatchModal;
window.saveWorkoutWatchDataFromModal = saveWorkoutWatchDataFromModal;
window.launchIosShortcutSync = launchIosShortcutSync;
window.syncHealthShortcutAndCloud = syncHealthShortcutAndCloud;
window.openHealthSyncModal = openHealthSyncModal;
window.closeHealthSyncModal = closeHealthSyncModal;
window.applyReplicaToPrimary = applyReplicaToPrimary;
window.openManualMetricsModal = openManualMetricsModal;
window.closeManualMetricsModal = closeManualMetricsModal;
window.saveManualMetricsFromModal = saveManualMetricsFromModal;
window.switchShortcutTab = switchShortcutTab;
window.switchShortcutMethodTab = switchShortcutMethodTab;
window.copyShortcutUrlToClipboard = copyShortcutUrlToClipboard;
window.copyShortcutCloudUrlToClipboard = copyShortcutCloudUrlToClipboard;
window.testSimulatedHealthSync = testSimulatedHealthSync;
window.testSimulatedWorkoutSync = testSimulatedWorkoutSync;
window.testSimulatedBackgroundCloudSync = testSimulatedBackgroundCloudSync;
window.resetMetricsToZeroUsingUrlShortcut = resetMetricsToZeroUsingUrlShortcut;
window.addDebugLog = addDebugLog;
window.clearDebugLogs = clearDebugLogs;
window.copyDebugLogsToClipboard = copyDebugLogsToClipboard;
window.renderDebugLogsView = renderDebugLogsView;
window.updateAppleWatchModalUI = updateAppleWatchModalUI;
window.handleHealthFileImport = handleHealthFileImport;
window.pushToCloud = pushToCloud;
window.pullFromCloud = pullFromCloud;
window.saveCustomCloudKeyFromInput = saveCustomCloudKeyFromInput;
window.resetDefaultCloudKey = resetDefaultCloudKey;
window.exportSyncToken = exportSyncToken;
window.promptImportSyncToken = promptImportSyncToken;
window.exportBackupJson = exportBackupJson;
window.triggerImportBackupJson = triggerImportBackupJson;
window.handleBackupFileSelect = handleBackupFileSelect;
window.copyDiagnosticLogs = copyDiagnosticLogs;
window.saveCustomSettings = saveCustomSettings;
window.checkDeviceIdentityBanner = checkDeviceIdentityBanner;
window.getProfileShortName = getProfileShortName;
window.isCloudSyncing = isCloudSyncing;
window.toggleShortcutGuide = toggleShortcutGuide;

function initApp() {
  loadSavedState();
  checkDeviceIdentityBanner();

  setTimeout(() => { pullFromCloud(false); }, 1000);
  setInterval(() => { pullFromCloud(false); }, 45000);

  addDebugLog("⚡ App FitDuo iniciada", "info", { url: window.location.href });

  const syncedFromUrl = checkUrlParamsForWatchSync();
  if (!syncedFromUrl) {
    checkAutoLaunchShortcutOnOpen();
  }

  renderAll();
  updateShortcutUrlInputs();
  startAppleWatchAutoSync();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

window.addEventListener("pageshow", () => {
  loadSavedState();
  checkUrlParamsForWatchSync();
  pullFromCloud(false);
  renderAll();
});

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    loadSavedState();
    checkUrlParamsForWatchSync();
    pullFromCloud(false);
    renderAll();
  }
});

setInterval(() => {
  const syncTimeEl = document.getElementById("summary-watch-sync-time");
  if (syncTimeEl && appState?.appleWatch?.lastGlobalSync) {
    syncTimeEl.innerText = formatSyncRelativeTime(appState.appleWatch.lastGlobalSync);
  }
}, 5000);
