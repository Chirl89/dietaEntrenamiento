/**
 * FitDuo & Collie Coach - Global State & Persistence Engine (v0.14.0)
 */

import { INITIAL_PROFILES } from '../data.js';

// STATE STORAGE KEYS
export const LOCAL_STORAGE_KEY = "FITDUO_APP_STATE_V1";
export const LAST_ACTIVE_PROFILE_KEY = "FITDUO_LAST_ACTIVE_PROFILE";
export const DEVICE_DEFAULT_PROFILE_KEY = "FITDUO_DEVICE_DEFAULT_PROFILE";
export const LAST_REGISTERED_METRICS_KEY = "FITDUO_LAST_REGISTERED_METRICS";
export const LAST_CLOUD_REPLICA_KEY = "FITDUO_LAST_CLOUD_REPLICA";

// INITIAL FALLBACK METRICS (ZERO BASELINE)
export const defaultWatchMetrics = {
  he: { deviceName: "Apple Watch Series 9", moveKcal: 0, moveGoal: 600, targetKcal: 600, exerciseMin: 0, exerciseGoal: 30, targetMin: 30, steps: 0, stepsGoal: 10000, targetSteps: 10000, hr: 0, distanceKm: 0, floors: 0, sleep: "--" },
  she: { deviceName: "Apple Watch SE", moveKcal: 0, moveGoal: 500, targetKcal: 500, exerciseMin: 0, exerciseGoal: 30, targetMin: 30, steps: 0, stepsGoal: 10000, targetSteps: 10000, hr: 0, distanceKm: 0, floors: 0, sleep: "--" }
};

export const defaultCloudReplica = {
  he: { moveKcal: 0, exerciseMin: 0, steps: 0, hr: 0, distanceKm: 0, floors: 0, sleep: "--", lastSync: null, source: "Atajo Nube en 2º Plano" },
  she: { moveKcal: 0, exerciseMin: 0, steps: 0, hr: 0, distanceKm: 0, floors: 0, sleep: "--", lastSync: null, source: "Atajo Nube en 2º Plano" }
};

try {
  const savedLastMetrics = localStorage.getItem(LAST_REGISTERED_METRICS_KEY);
  if (savedLastMetrics) {
    const parsedLastMetrics = JSON.parse(savedLastMetrics);
    if (parsedLastMetrics?.he) Object.assign(defaultWatchMetrics.he, parsedLastMetrics.he);
    if (parsedLastMetrics?.she) Object.assign(defaultWatchMetrics.she, parsedLastMetrics.she);
  }
  const savedReplica = localStorage.getItem(LAST_CLOUD_REPLICA_KEY);
  if (savedReplica) {
    const parsedReplica = JSON.parse(savedReplica);
    if (parsedReplica?.he) Object.assign(defaultCloudReplica.he, parsedReplica.he);
    if (parsedReplica?.she) Object.assign(defaultCloudReplica.she, parsedReplica.she);
  }
} catch (e) {}

export function getTodayDayName() {
  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const idx = new Date().getDay();
  return days[idx];
}

export function getLocalIsoDate(date = new Date()) {
  const d = (date instanceof Date && !isNaN(date.getTime())) ? date : new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getProfileShortName(pid) {
  try {
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
  } catch(e) {
    return pid === 'he' ? 'Carlos' : pid === 'she' ? 'Andrea' : 'Boo';
  }
}

// INITIAL STATE STRUCTURE (STABLE OBJECT REFERENCE)
export const appState = {
  masterProfileId: "he",
  activeProfileId: "he",
  profiles: JSON.parse(JSON.stringify(INITIAL_PROFILES)),
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
  deletedWorkoutSessionIds: [],
  activeDay: "Lunes",
  activeWorkoutDay: "Lunes",
  activeExerciseDay: "Lunes",
  activeBooDay: "Lunes",
  recipesDaysRange: "5",
  shoppingDaysRange: "5",
  checkedShoppingItems: {},
  weightLogs: { he: [], she: [] },
  history: { he: {}, she: {} },
  lastCloudSync: null,
  lastPurgeTimetoken: null,
  appleWatch: {
    syncMode: "real",
    autoSyncEnabled: true,
    syncIntervalSec: 6,
    lastGlobalSync: null,
    autoLaunchShortcutOnOpen: false,
    shortcutName: "SincronizarSaludFitDuo",
    shortcutWorkoutName: "SincronizarEntrenamientoFitDuo",
    metrics: JSON.parse(JSON.stringify(defaultWatchMetrics)),
    cloudReplica: JSON.parse(JSON.stringify(defaultCloudReplica)),
    pendingWorkout: {
      he: { flag: "N/A", pending: false, datos_inicio_entrenamiento: null, datos_fin_entrenamiento: null, startedAt: null, endedAt: null },
      she: { flag: "N/A", pending: false, datos_inicio_entrenamiento: null, datos_fin_entrenamiento: null, startedAt: null, endedAt: null }
    },
    syncLogs: []
  },
  booProgress: {
    completedTasks: {},
    completedContinuous: {},
    learnedTricks: ["t1_sit", "t2_paw"],
    activeTrickId: "t3_eye_contact",
    moodLogs: {},
    moduleStats: {},
    sessionNotes: {},
    accordions: {}
  },
  debugLogs: []
};

export function recordDailySnapshot(profileId, dateIso = null, metricsData = null, options = {}) {
  if (!profileId || (profileId !== 'he' && profileId !== 'she')) return null;
  if (!appState.history) appState.history = { he: {}, she: {} };
  if (!appState.history[profileId]) appState.history[profileId] = {};

  const targetDate = dateIso || getLocalIsoDate();
  const currentEntry = appState.history[profileId][targetDate] || {};
  const activeMetrics = metricsData || appState.appleWatch?.metrics?.[profileId] || defaultWatchMetrics[profileId] || {};
  
  const todayDayName = getTodayDayName();
  const dayWorkoutObj = appState.completedWorkouts?.[profileId]?.[todayDayName];
  const isWorkoutDone = (typeof dayWorkoutObj === 'object' && dayWorkoutObj?.done) || dayWorkoutObj === true;
  
  const isRestDay = options.isRestDay !== undefined ? options.isRestDay : (currentEntry.isRestDay || false);

  const stepsVal = Number(activeMetrics.steps !== undefined ? activeMetrics.steps : (currentEntry.steps || 0));
  const moveKcalVal = Number(activeMetrics.moveKcal !== undefined ? activeMetrics.moveKcal : (currentEntry.moveKcal || 0));
  const exMinVal = Number(activeMetrics.exerciseMin !== undefined ? activeMetrics.exerciseMin : (currentEntry.exerciseMin || 0));
  const hasData = stepsVal > 0 || moveKcalVal > 0 || exMinVal > 0 || isWorkoutDone || isRestDay;

  const updatedEntry = {
    steps: stepsVal,
    moveKcal: moveKcalVal,
    exerciseMin: exMinVal,
    distanceKm: parseFloat(Number(activeMetrics.distanceKm !== undefined ? activeMetrics.distanceKm : (currentEntry.distanceKm || 0)).toFixed(2)),
    floors: Number(activeMetrics.floors !== undefined ? activeMetrics.floors : (currentEntry.floors || 0)),
    sleep: activeMetrics.sleep || currentEntry.sleep || "--",
    hr: Number(activeMetrics.hr !== undefined ? activeMetrics.hr : (currentEntry.hr || 0)),
    completedWorkouts: options.completedWorkouts !== undefined ? options.completedWorkouts : (currentEntry.completedWorkouts || (isWorkoutDone ? [todayDayName] : [])),
    isRestDay: isRestDay,
    hasData: hasData,
    lastUpdated: new Date().toISOString()
  };

  appState.history[profileId][targetDate] = updatedEntry;
  return updatedEntry;
}

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
  } else {
    if (!appState.masterProfileId) appState.masterProfileId = 'he';
  }

  const lastProfile = localStorage.getItem(LAST_ACTIVE_PROFILE_KEY);
  if (lastProfile === 'he' || lastProfile === 'she') {
    appState.activeProfileId = lastProfile;
  } else if (!appState.activeProfileId) {
    appState.activeProfileId = appState.masterProfileId;
  }

  if (!appState.profiles) appState.profiles = JSON.parse(JSON.stringify(INITIAL_PROFILES));
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
      pendingWorkout: {
        he: { flag: "N/A", pending: false, datos_inicio_entrenamiento: null, datos_fin_entrenamiento: null, startedAt: null, endedAt: null },
        she: { flag: "N/A", pending: false, datos_inicio_entrenamiento: null, datos_fin_entrenamiento: null, startedAt: null, endedAt: null }
      },
      syncLogs: []
    };
  }

  if (!appState.appleWatch.metrics) {
    appState.appleWatch.metrics = JSON.parse(JSON.stringify(defaultWatchMetrics));
  }
  if (!appState.appleWatch.cloudReplica) {
    appState.appleWatch.cloudReplica = JSON.parse(JSON.stringify(defaultCloudReplica));
  }
  if (!appState.appleWatch.pendingWorkout) {
    appState.appleWatch.pendingWorkout = {
      he: { flag: "N/A", pending: false, datos_inicio_entrenamiento: null, datos_fin_entrenamiento: null, startedAt: null, endedAt: null },
      she: { flag: "N/A", pending: false, datos_inicio_entrenamiento: null, datos_fin_entrenamiento: null, startedAt: null, endedAt: null }
    };
  }

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

  if (!appState.history) {
    appState.history = { he: {}, she: {} };
  }
  if (!appState.history.he) appState.history.he = {};
  if (!appState.history.she) appState.history.she = {};
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

export function saveState() {
  if (appState.appleWatch?.metrics) {
    ['he', 'she'].forEach(pid => {
      recordDailySnapshot(pid);
    });
  }
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

export function copyDebugLogs() {
  copyDebugLogsToClipboard();
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

export function closeDebugLogsModal() {
  const modal = document.getElementById("logs-modal");
  if (modal) modal.classList.remove("active");
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
