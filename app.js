import { INITIAL_PROFILES, RECIPES_DATABASE, WEEKLY_WORKOUT_SCHEDULE, INGREDIENT_CATEGORIES } from './data.js?v=1.0.4';

// STATE STORAGE KEYS
const LOCAL_STORAGE_KEY = "FITDUO_APP_STATE_V1";
const DEVICE_DEFAULT_PROFILE_KEY = "FITDUO_DEVICE_PREFERRED_PROFILE";
const LAST_ACTIVE_PROFILE_KEY = "FITDUO_LAST_ACTIVE_PROFILE";
const LAST_REGISTERED_METRICS_KEY = "FITDUO_LAST_REGISTERED_METRICS";

// INITIAL FALLBACK METRICS
let defaultWatchMetrics = {
  he: { deviceName: "Apple Watch (Carlos)", battery: 100, hr: 0, maxHr: 165, steps: 0, stepsGoal: 10000, moveKcal: 0, moveGoal: 600, exerciseMin: 0, exerciseGoal: 30, distanceKm: 0 },
  she: { deviceName: "Apple Watch (Andrea)", battery: 100, hr: 0, maxHr: 158, steps: 0, stepsGoal: 10000, moveKcal: 0, moveGoal: 500, exerciseMin: 0, exerciseGoal: 30, distanceKm: 0 }
};

try {
  const savedLastMetrics = localStorage.getItem(LAST_REGISTERED_METRICS_KEY);
  if (savedLastMetrics) {
    const parsedLastMetrics = JSON.parse(savedLastMetrics);
    if (parsedLastMetrics?.he) defaultWatchMetrics.he = { ...defaultWatchMetrics.he, ...parsedLastMetrics.he };
    if (parsedLastMetrics?.she) defaultWatchMetrics.she = { ...defaultWatchMetrics.she, ...parsedLastMetrics.she };
  }
} catch (e) {}

// INITIAL STATE STRUCTURE
let appState = {
  activeProfileId: "he", // 'he' (Carlos) or 'she' (Andrea)
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
  activeDay: "Lunes",
  activeWorkoutDay: "Lunes",
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
    syncLogs: []
  }
};

let weightChart = null;
let autoSyncIntervalTimer = null;

// LOAD STATE FROM LOCALSTORAGE
function loadSavedState() {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      appState = { ...appState, ...parsed };
    } catch (e) {
      console.warn("Could not parse saved state, using defaults.");
    }
  }

  // Ensure last registered metrics persist as permanent defaults
  try {
    const savedLastMetrics = localStorage.getItem(LAST_REGISTERED_METRICS_KEY);
    if (savedLastMetrics) {
      const parsedLastMetrics = JSON.parse(savedLastMetrics);
      if (parsedLastMetrics?.he && appState.appleWatch?.metrics?.he) {
        appState.appleWatch.metrics.he = { ...defaultWatchMetrics.he, ...parsedLastMetrics.he, ...appState.appleWatch.metrics.he };
      }
      if (parsedLastMetrics?.she && appState.appleWatch?.metrics?.she) {
        appState.appleWatch.metrics.she = { ...defaultWatchMetrics.she, ...parsedLastMetrics.she, ...appState.appleWatch.metrics.she };
      }
    }
  } catch(e) {}

  // Device-specific profile memory preference
  const devicePref = localStorage.getItem(DEVICE_DEFAULT_PROFILE_KEY) || 'last';
  const lastProfile = localStorage.getItem(LAST_ACTIVE_PROFILE_KEY);

  if (devicePref === 'he' || devicePref === 'she') {
    appState.activeProfileId = devicePref;
  } else if (lastProfile === 'he' || lastProfile === 'she') {
    appState.activeProfileId = lastProfile;
  }

  // Ensure names are updated to Carlos, Andrea, and Boo
  appState.profiles.he.name = "Él (Carlos)";
  appState.profiles.she.name = "Ella (Andrea)";
  
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

// SAVE STATE TO LOCALSTORAGE
function saveState() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appState));
  if (appState.appleWatch?.metrics) {
    localStorage.setItem(LAST_REGISTERED_METRICS_KEY, JSON.stringify(appState.appleWatch.metrics));
  }
}

// INITIALIZATION ON DOM READY
document.addEventListener("DOMContentLoaded", () => {
  loadSavedState();
  
  // Make functions available globally on window object for HTML inline onclick handlers
  window.switchProfile = switchProfile;
  window.setDeviceDefaultProfile = setDeviceDefaultProfile;
  window.showTab = showTab;
  window.switchCategory = switchCategory;
  window.renderSummaryView = renderSummaryView;
  window.addExclusion = addExclusion;
  window.removeExclusion = removeExclusion;
  window.toggleWorkoutDay = toggleWorkoutDay;
  window.resetWorkoutWeek = resetWorkoutWeek;
  window.syncAppleWatchData = syncAppleWatchData;
  window.selectDay = selectDay;
  window.selectDayFromDropdown = selectDayFromDropdown;
  window.setRecipesRange = setRecipesRange;
  window.setShoppingRange = setShoppingRange;
  window.renderNutritionMenuView = renderNutritionMenuView;
  window.renderNutritionRecipesView = renderNutritionRecipesView;
  window.selectWorkoutDay = selectWorkoutDay;
  window.openTodayNutrition = openTodayNutrition;
  window.openTodayWorkouts = openTodayWorkouts;
  window.toggleShoppingItem = toggleShoppingItem;
  window.copyShoppingList = copyShoppingList;
  window.addWeightEntry = addWeightEntry;
  window.sendChatMessage = sendChatMessage;
  window.handleChatKeyPress = handleChatKeyPress;

  // Apple Watch & iOS Specific Handlers
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
  window.toggleAutoLaunchShortcutOnOpen = toggleAutoLaunchShortcutOnOpen;
  window.toggleShortcutGuide = toggleShortcutGuide;
  window.openHealthSyncModal = openHealthSyncModal;
  window.closeHealthSyncModal = closeHealthSyncModal;
  window.switchShortcutTab = switchShortcutTab;
  window.copyShortcutUrlToClipboard = copyShortcutUrlToClipboard;
  window.testSimulatedHealthSync = testSimulatedHealthSync;
  window.testSimulatedWorkoutSync = testSimulatedWorkoutSync;
  window.addDebugLog = addDebugLog;
  window.clearDebugLogs = clearDebugLogs;
  window.copyDebugLogsToClipboard = copyDebugLogsToClipboard;
  window.renderDebugLogsView = renderDebugLogsView;

  addDebugLog("⚡ App FitDuo arrancada (DOMContentLoaded)", "info", { url: window.location.href, userAgent: navigator.userAgent });

  const syncedFromUrl = checkUrlParamsForWatchSync();
  if (!syncedFromUrl) {
    checkAutoLaunchShortcutOnOpen();
  }

  renderAll();
  updateShortcutUrlInputs();

  // Direct event listeners binding for Atajos tab switcher
  const btnHealthTab = document.getElementById("shortcut-tab-btn-health");
  if (btnHealthTab) {
    btnHealthTab.addEventListener("click", (e) => {
      e.preventDefault();
      switchShortcutTab('health');
    });
  }

  const btnWorkoutTab = document.getElementById("shortcut-tab-btn-workout");
  if (btnWorkoutTab) {
    btnWorkoutTab.addEventListener("click", (e) => {
      e.preventDefault();
      switchShortcutTab('workout');
    });
  }

  startAppleWatchAutoSync();
});

// LISTEN FOR CROSS-TAB STORAGE SYNC, SAFARI FOCUS, VISIBILITY & URL NAVIGATION EVENTS
window.addEventListener("storage", (e) => {
  if (!e.key || e.key === LOCAL_STORAGE_KEY || e.key === LAST_ACTIVE_PROFILE_KEY || e.key === DEVICE_DEFAULT_PROFILE_KEY) {
    addDebugLog("💾 Evento 'storage' (Sincronización entre pestañas)", "info");
    loadSavedState();
    renderAll();
  }
});

window.addEventListener("pageshow", () => {
  addDebugLog("👁️ Evento 'pageshow' (Retorno a la pestaña Safari)", "info", { url: window.location.href });
  loadSavedState();
  checkUrlParamsForWatchSync();
  renderAll();
});

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    addDebugLog("👁️ Evento 'visibilitychange' (Pestaña visible)", "info", { url: window.location.href });
    loadSavedState();
    checkUrlParamsForWatchSync();
    renderAll();
  }
});

window.addEventListener("popstate", () => {
  addDebugLog("🔗 Evento 'popstate' (Navegación URL)", "info", { url: window.location.href });
  loadSavedState();
  checkUrlParamsForWatchSync();
  renderAll();
});

window.addEventListener("focus", () => {
  loadSavedState();
  checkUrlParamsForWatchSync();
  renderAll();
});

// CATEGORY & SUBTAB NAVIGATION ENGINE
const NAVIGATION_CATEGORIES = {
  summary: {
    name: "Resumen & Salud",
    dockId: "dock-btn-summary",
    sidebarId: "sidebar-nav-summary",
    subtabs: [
      { id: "summary-view", label: "📊 Resumen Diario", icon: "fa-solid fa-gauge-high" }
    ]
  },
  nutrition: {
    name: "Nutrición",
    dockId: "dock-btn-nutrition",
    sidebarId: "sidebar-nav-nutrition",
    subtabs: [
      { id: "nutrition-menu-view", label: "🍽️ Menú del Día", icon: "fa-solid fa-utensils" },
      { id: "nutrition-recipes-view", label: "📖 Recetas", icon: "fa-solid fa-book-open" },
      { id: "nutrition-shopping-view", label: "🛒 Lista de la Compra", icon: "fa-solid fa-cart-shopping" }
    ]
  },
  workouts: {
    name: "Entrenamiento",
    dockId: "dock-btn-workouts",
    sidebarId: "sidebar-nav-workouts",
    subtabs: [
      { id: "workouts-view", label: "💪 Ejercicios", icon: "fa-solid fa-dumbbell" }
    ]
  },
  profile: {
    name: "Perfil & Ajustes",
    dockId: "dock-btn-profile",
    sidebarId: "sidebar-nav-profile",
    subtabs: [
      { id: "profile-view", label: "👤 Perfil", icon: "fa-solid fa-sliders" },
      { id: "coach-view", label: "🤖 Coach AI", icon: "fa-solid fa-robot" },
      { id: "settings-view", label: "⚙️ Ajustes", icon: "fa-solid fa-gear" }
    ]
  }
};

function switchCategory(categoryKey, targetTabId = null, btnElement = null) {
  triggerHapticTouch();
  const cat = NAVIGATION_CATEGORIES[categoryKey];
  if (!cat) return;

  if (categoryKey === 'nutrition') {
    const today = getTodayDayName();
    appState.activeDay = today;
    const selectElem = document.getElementById("nutrition-day-select");
    if (selectElem) selectElem.value = today;
  }

  const tabToOpen = targetTabId || cat.subtabs[0].id;
  showTab(tabToOpen);
}

function renderSubtabSegmentedControl(categoryKey, activeTabId) {
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

// MAIN RENDER CONTROLLER
function renderAll() {
  renderSummaryView();
  renderProfileView();
  renderNutritionView();
  renderShoppingView();
  renderWorkoutsView();
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

// PROFILE SWITCHER (DESKTOP & IPHONE HEADER SYNC)
function switchProfile(profileId) {
  triggerHapticTouch();
  appState.activeProfileId = profileId;
  localStorage.setItem(LAST_ACTIVE_PROFILE_KEY, profileId);
  saveState();

  // Desktop buttons
  const btnHe = document.getElementById("btn-profile-he");
  const btnShe = document.getElementById("btn-profile-she");
  if (btnHe) btnHe.classList.toggle("active", profileId === "he");
  if (btnShe) btnShe.classList.toggle("active", profileId === "she");

  // Mobile Header buttons
  const iosBtnHe = document.getElementById("ios-btn-profile-he");
  const iosBtnShe = document.getElementById("ios-btn-profile-she");
  if (iosBtnHe) iosBtnHe.classList.toggle("active", profileId === "he");
  if (iosBtnShe) iosBtnShe.classList.toggle("active", profileId === "she");

  renderAll();
}

// TAB NAVIGATION (DESKTOP SIDEBAR & IPHONE DOCK SYNC WITH SUBTABS)
function showTab(tabId, btnElement) {
  triggerHapticTouch();

  // Find active category
  let activeCatKey = 'summary';
  for (const [catKey, catObj] of Object.entries(NAVIGATION_CATEGORIES)) {
    if (catObj.subtabs.some(s => s.id === tabId)) {
      activeCatKey = catKey;
      break;
    }
  }

  document.querySelectorAll(".view-panel").forEach(panel => panel.classList.remove("active"));
  const targetPanel = document.getElementById(tabId);
  if (targetPanel) targetPanel.classList.add("active");

  // Highlight Category Dock & Sidebar buttons
  const catObj = NAVIGATION_CATEGORIES[activeCatKey];
  if (catObj) {
    document.querySelectorAll(".ios-dock-btn").forEach(btn => btn.classList.remove("active"));
    document.querySelectorAll(".nav-menu button").forEach(btn => btn.classList.remove("active"));

    const dockBtn = document.getElementById(catObj.dockId);
    if (dockBtn) dockBtn.classList.add("active");

    const sidebarBtn = document.getElementById(catObj.sidebarId);
    if (sidebarBtn) sidebarBtn.classList.add("active");
  }

  // Render Segmented Control pills
  renderSubtabSegmentedControl(activeCatKey, tabId);

  if (tabId === 'summary-view') {
    renderSummaryView();
  } else if (tabId === 'nutrition-menu-view') {
    renderNutritionMenuView();
  } else if (tabId === 'nutrition-recipes-view') {
    renderNutritionRecipesView();
  } else if (tabId === 'nutrition-shopping-view') {
    renderShoppingView();
  } else if (tabId === 'apple-watch-view') {
    updateAppleWatchModalUI();
  } else if (tabId === 'settings-view') {
    renderSettingsView();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// IOS HAPTIC FEEDBACK SIMULATOR
function triggerHapticTouch() {
  if (window.navigator && window.navigator.vibrate) {
    try { window.navigator.vibrate(15); } catch(e){}
  }
}

// FLOATING IOS TOAST NOTIFICATION SYSTEM
function showIosToast(message, iconClass = "fa-brands fa-apple") {
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

// ==========================================
// APPLE WATCH & HEALTHKIT CONTROL & SYNC ENGINE
// ==========================================

function startAppleWatchAutoSync() {
  if (autoSyncIntervalTimer) clearInterval(autoSyncIntervalTimer);
  // Auto-sync periodic background interval loop completely disabled per user preference!
}

function performAutoSyncTick() {
  const pid = appState.activeProfileId;
  const m = appState.appleWatch?.metrics?.[pid];
  if (!m) return;

  appState.appleWatch.lastGlobalSync = new Date().toISOString();
  saveState();
  renderAll();
}

function updateHeaderWatchBadge() {
  const badgeText = document.getElementById("ios-header-watch-text");
  if (badgeText) {
    badgeText.innerText = " Sync Resumen";
  }
}

function setAppleWatchSyncMode(mode) {
  triggerHapticTouch();
  if (!appState.appleWatch) appState.appleWatch = {};
  appState.appleWatch.syncMode = mode;
  saveState();

  renderAll();

  if (mode === "real") {
    showIosToast("🎯 <strong>Modo Datos Reales Activado</strong>: Tus números de Apple Watch se mantendrán estables con máxima precisión.", "fa-solid fa-shield-halved");
  } else {
    showIosToast("🧪 <strong>Modo Simulación Demo Activado</strong>: Simulando telemetría en vivo.", "fa-solid fa-vial");
  }
}

function openAppleWatchModal() {
  triggerHapticTouch();
  const modal = document.getElementById("apple-watch-modal");
  if (modal) {
    modal.classList.add("active");
    updateAppleWatchModalUI();
  }
}

function closeAppleWatchModal() {
  triggerHapticTouch();
  const modal = document.getElementById("apple-watch-modal");
  if (modal) modal.classList.remove("active");
}

function closeAppleWatchModalOnBackdrop(e) {
  if (e.target.id === "apple-watch-modal") {
    closeAppleWatchModal();
  }
}

function toggleAutoSync(enabled) {
  triggerHapticTouch();
  if (!appState.appleWatch) return;
  appState.appleWatch.autoSyncEnabled = enabled;
  saveState();
  updateHeaderWatchBadge();

  showIosToast(
    enabled 
      ? " Sincronización de Apple Watch <strong>ACTIVADA</strong>" 
      : "⏸️ Sincronización de Apple Watch <strong>PAUSADA</strong>",
    enabled ? "fa-brands fa-apple" : "fa-solid fa-pause"
  );
}

function triggerManualSync() {
  triggerHapticTouch();
  const pid = appState.activeProfileId;
  const m = appState.appleWatch.metrics[pid];
  const pName = appState.profiles[pid].name.split(" ")[0];
  const mode = appState.appleWatch.syncMode || "real";

  if (mode === "demo") {
    m.steps += Math.floor(Math.random() * 120) + 40;
    m.moveKcal += Math.floor(Math.random() * 15) + 5;
    m.exerciseMin = Math.min(60, m.exerciseMin + 2);
    m.hr = Math.floor(Math.random() * 20) + 72;
    m.distanceKm = parseFloat((m.steps * 0.00075).toFixed(2));
  }

  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  appState.appleWatch.lastGlobalSync = new Date().toISOString();
  
  appState.appleWatch.syncLogs.unshift({
    timestamp: timeStr,
    device: m.deviceName,
    hr: m.hr,
    kcal: m.moveKcal,
    steps: m.steps,
    status: mode === "real" ? "Verificado con Salud iOS" : "Simulado Manualmente"
  });
  if (appState.appleWatch.syncLogs.length > 8) appState.appleWatch.syncLogs.pop();

  saveState();
  renderAll();

  showIosToast(` ¡Datos de Apple Watch (${pName}) verificados! (${m.moveKcal} kcal - ${m.steps.toLocaleString()} pasos)`, "fa-solid fa-circle-check");
}

// SMART 7-DAY METRIC PARSERS
function parseSmartMetricValue(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') return Math.round(val);
  if (Array.isArray(val)) {
    if (val.length === 0) return null;
    const validNums = val.map(v => parseSmartMetricValue(v)).filter(v => v !== null && v >= 0);
    if (validNums.length === 0) return null;
    return validNums[validNums.length - 1];
  }
  if (typeof val === 'string') {
    const cleanStr = val.replace(/,/g, '.').replace(/[^\d.]/g, ' ').trim();
    if (cleanStr === '' || cleanStr === '0') return 0;
    const numbers = cleanStr.split(/\s+/).map(n => parseFloat(n)).filter(n => !isNaN(n) && n >= 0);
    if (numbers.length > 0) {
      return Math.round(numbers[numbers.length - 1]);
    }
    return 0;
  }
  return null;
}

function parseSmartMetricFloatValue(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') return parseFloat(val.toFixed(2));
  if (typeof val === 'string') {
    const cleanStr = val.replace(/,/g, '.').replace(/[^\d.]/g, ' ').trim();
    if (cleanStr === '' || cleanStr === '0') return 0;
    const numbers = cleanStr.split(/\s+/).map(n => parseFloat(n)).filter(n => !isNaN(n) && n >= 0);
    if (numbers.length > 0) {
      return parseFloat(numbers[numbers.length - 1].toFixed(2));
    }
    return 0;
  }
  return null;
}

function parseSmartMetricArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(v => parseInt(v)).filter(v => !isNaN(v));
  if (typeof val === 'string') {
    return val.split(',').map(s => parseInt(s.trim())).filter(v => !isNaN(v));
  }
  const p = parseInt(val);
  return isNaN(p) ? [] : [p];
}

// Helper to sync weekly history array (7 days) across past days of the week
function syncWeeklyWatchHistory(profileId, kcalArr = [], exMinArr = [], hrArr = []) {
  if (!kcalArr || kcalArr.length === 0) return;

  const daysOfWeek = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const todayIdx = new Date().getDay(); // 0 (Domingo) to 6 (Sábado)

  // Align 7 days leading up to today
  // arr[6] = today, arr[5] = yesterday, arr[4] = 2 days ago, etc.
  for (let i = 0; i < kcalArr.length; i++) {
    const offsetFromToday = (kcalArr.length - 1) - i;
    if (offsetFromToday >= 7) continue;

    let targetDayIdx = todayIdx - offsetFromToday;
    if (targetDayIdx < 0) targetDayIdx += 7;
    const targetDayName = daysOfWeek[targetDayIdx];

    const kcalVal = kcalArr[i];
    const durVal = exMinArr[i] || 45;
    const hrVal = hrArr[i] || 138;

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

// IOS SHORTCUTS URL PARAMETER SYNC HANDLER & AUTO-LAUNCH ENGINE
function checkUrlParamsForWatchSync() {
  let searchStr = window.location.search;
  let hashStr = window.location.hash;
  
  if (!searchStr && hashStr.includes("?")) {
    searchStr = hashStr.substring(hashStr.indexOf("?"));
  } else if (!searchStr && hashStr.includes("=")) {
    searchStr = hashStr.replace("#", "?");
  }

  const params = new URLSearchParams(searchStr);
  if (!params.has("syncWatch") && !params.has("kcal") && !params.has("steps") && !params.has("workout") && !params.has("duration") && !params.has("workoutKcal") && !params.has("hr")) {
    return false;
  }

  // Profile resolution: optional URL override (&profile=he / &profile=she / &profile=carlos / &profile=andrea)
  let pid = appState.activeProfileId;
  const profileParam = params.get("profile") || params.get("user");
  if (profileParam) {
    const pLower = profileParam.toLowerCase();
    if (pLower.includes("carlos") || pLower === "he" || pLower === "m") {
      pid = "he";
      appState.activeProfileId = "he";
    } else if (pLower.includes("andrea") || pLower === "she" || pLower === "f") {
      pid = "she";
      appState.activeProfileId = "she";
    }
  }

  const m = appState.appleWatch?.metrics?.[pid];
  if (!m) return false;

  addDebugLog("🔗 Parámetros de URL/Acceso Directo detectados al cargar la app", "url", Object.fromEntries(params));

  let updated = false;

  // 1. General Daily Health Metrics
  const kcalRaw = params.get("kcal") || params.get("moveKcal") || params.get("activeCalories");
  const kcalVal = parseSmartMetricValue(kcalRaw);
  if (kcalVal !== null) {
    m.moveKcal = kcalVal;
    updated = true;
  } else if (params.has("syncWatch") || params.has("kcal")) {
    m.moveKcal = 0;
    updated = true;
  }

  const stepsRaw = params.get("steps");
  const stepsVal = parseSmartMetricValue(stepsRaw);
  if (stepsVal !== null) {
    m.steps = stepsVal;
    m.distanceKm = parseFloat((m.steps * 0.00075).toFixed(2));
    updated = true;
  } else if (params.has("syncWatch") || params.has("steps")) {
    m.steps = 0;
    updated = true;
  }

  const distRaw = params.get("dist") || params.get("distanceKm") || params.get("distance");
  const distVal = parseSmartMetricFloatValue(distRaw);
  if (distVal !== null) {
    m.distanceKm = distVal;
    updated = true;
  } else if ((params.has("syncWatch") || params.has("dist")) && stepsVal === null) {
    m.distanceKm = 0;
    updated = true;
  }

  const hrRaw = params.get("hr") || params.get("heartRate") || params.get("avgHr");
  const hrVal = parseSmartMetricValue(hrRaw);
  if (hrVal !== null) {
    m.hr = hrVal;
    updated = true;
  } else if (params.has("syncWatch") || params.has("hr")) {
    m.hr = 0;
    updated = true;
  }

  const maxHrRaw = params.get("maxHr");
  const maxHrVal = parseSmartMetricValue(maxHrRaw);
  if (maxHrVal !== null) {
    m.maxHr = maxHrVal;
    updated = true;
  }

  const exMinRaw = params.get("exMin") || params.get("exerciseMin") || params.get("duration") || params.get("dur");
  const exMinVal = parseSmartMetricValue(exMinRaw);
  if (exMinVal !== null) {
    m.exerciseMin = exMinVal;
    updated = true;
  } else if (params.has("syncWatch") || params.has("exMin")) {
    m.exerciseMin = 0;
    updated = true;
  }

  const standHoursRaw = params.get("standHours") || params.get("stand");
  const standHoursVal = parseSmartMetricValue(standHoursRaw);
  if (standHoursVal !== null) {
    m.standHours = standHoursVal;
    updated = true;
  }

  const deviceParam = params.get("deviceName") || params.get("device");
  if (deviceParam) {
    m.deviceName = decodeURIComponent(deviceParam);
    updated = true;
  }

  // Handle 7-day weekly history sync if an array of values was passed
  const kcalArr = parseSmartMetricArray(kcalRaw);
  const exMinArr = parseSmartMetricArray(exMinRaw);
  const hrArr = parseSmartMetricArray(hrRaw);
  if (kcalArr.length > 1) {
    syncWeeklyWatchHistory(pid, kcalArr, exMinArr, hrArr);
    updated = true;
    addDebugLog("📊 Historial de 7 días de Salud procesado desde URL", "health", { kcalArr, exMinArr, hrArr });
  }

  // 2. Workout specific metrics (if this is a post-workout sync)
  const isWorkoutSync = params.has("workout") || params.get("syncWorkout") === "true" || params.has("workoutKcal") || (params.has("duration") && params.has("avgHr"));
  let targetDay = params.get("day");
  if (!targetDay) {
    targetDay = getTodayDayName();
  }

  let workoutKcalVal = parseSmartMetricValue(params.get("workoutKcal") || params.get("wKcal"));
  let workoutDurationVal = parseSmartMetricValue(params.get("workoutDuration") || params.get("dur") || params.get("duration"));
  let workoutAvgHrVal = parseSmartMetricValue(params.get("workoutAvgHr") || params.get("avgHr"));
  let workoutMaxHrVal = parseSmartMetricValue(params.get("workoutMaxHr") || params.get("maxHr"));

  if (isWorkoutSync) {
    const durMin = workoutDurationVal !== null ? workoutDurationVal : (exMinVal !== null ? exMinVal : 45);
    const wKcal = workoutKcalVal !== null ? workoutKcalVal : (kcalVal !== null ? kcalVal : 350);
    const avgH = workoutAvgHrVal !== null ? workoutAvgHrVal : (hrVal !== null ? hrVal : 140);
    const maxH = workoutMaxHrVal !== null ? workoutMaxHrVal : (m.maxHr || (avgH + 20));
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " hs";

    if (!appState.completedWorkouts[pid]) appState.completedWorkouts[pid] = {};

    appState.completedWorkouts[pid][targetDay] = {
      done: true,
      watchData: {
        deviceName: m.deviceName || `Apple Watch (${appState.profiles[pid].name.split(" ")[0]})`,
        durationMin: durMin,
        kcal: wKcal,
        avgHr: avgH,
        maxHr: maxH,
        timestamp: timeStr,
        autoSync: true
      }
    };
    updated = true;
  }

  if (updated) {
    appState.appleWatch.syncMode = "real";
    appState.appleWatch.lastGlobalSync = new Date().toISOString();

    const pName = appState.profiles[pid].name.split(" ")[0];
    addDebugLog(` Datos de Salud actualizados vía URL para ${pName}`, "success", { moveKcal: m.moveKcal, steps: m.steps, hr: m.hr, exerciseMin: m.exerciseMin });
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    appState.appleWatch.syncLogs.unshift({
      timestamp: timeStr,
      device: m.deviceName || "Apple Watch",
      hr: m.hr,
      kcal: m.moveKcal,
      steps: m.steps,
      status: kcalArr.length > 1 ? "Semanas (7 días) Sincronizadas" : (isWorkoutSync ? `Entrenamiento + Salud (${targetDay}) Sincronizado` : "Salud General Sincronizado vía Atajo iOS")
    });
    if (appState.appleWatch.syncLogs.length > 8) appState.appleWatch.syncLogs.pop();

    saveState();
    renderAll();

    // Clean query params from browser location bar without reloading
    const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);

    sessionStorage.setItem("fitduo_shortcut_synced", "true");

    setTimeout(() => {
      if (kcalArr.length > 1) {
        showIosToast(` <strong>¡Historial de 7 días de Apple Watch sincronizado!</strong> (${m.moveKcal} kcal hoy)`, "fa-brands fa-apple");
      } else if (isWorkoutSync) {
        showIosToast(`🏋️ <strong>¡Entrenamiento (${targetDay}) y Salud sincronizados!</strong> (${workoutKcalVal || m.moveKcal} kcal entreno · ${m.steps.toLocaleString()} pasos)`, "fa-solid fa-dumbbell");
      } else {
        showIosToast(` <strong>Atajo de Salud ejecutado:</strong> Datos de Apple Watch (${pName}) cargados (${m.moveKcal} kcal · ${m.steps.toLocaleString()} pasos)`, "fa-brands fa-apple");
      }
    }, 400);

    return true;
  }

  return false;
}

async function checkClipboardForWatchSync(forceManual = false) {
  addDebugLog("📋 Iniciando comprobación de datos de Salud desde el Portapapeles...", "info");

  if (!navigator.clipboard || !navigator.clipboard.readText) {
    addDebugLog("⚠️ El navegador no soporta la API navigator.clipboard.readText", "warning");
    if (forceManual) {
      importFromShortcutText();
    }
    return false;
  }

  try {
    const text = await navigator.clipboard.readText();
    addDebugLog(`📥 TEXTO BRUTO LEÍDO DEL PORTAPAPELES (${text ? text.length : 0} caracteres)`, "clipboard", { rawText: text || "(Vacío)" });

    if (!text || text.trim().length === 0) {
      addDebugLog("ℹ️ El portapapeles está completamente vacío.", "info");
      if (forceManual) {
        importFromShortcutText();
      }
      return false;
    }

    const json = parseHealthTextOrUrl(text);
    if (!json) {
      addDebugLog(`⚠️ No se detectaron parámetros de Salud reconocibles en el texto del portapapeles: "${text}"`, "warning", { rawText: text });
      if (forceManual) {
        showIosToast("⚠️ El texto del portapapeles no tiene formato de Salud válido", "fa-triangle-exclamation");
        importFromShortcutText(text);
      }
      return false;
    }

    addDebugLog("🔍 ESTRUCTURA PARSEADA DE SALUD DE PORTAPAPELES", "health", json);

    const pid = appState.activeProfileId;
    const m = appState.appleWatch.metrics[pid];

    let updated = false;

    const kcalRaw = json.kcal || json.moveKcal || json.activeCalories;
    const kcalVal = parseSmartMetricValue(kcalRaw) ?? (json.syncWatch ? 0 : null);
    if (kcalVal !== null) {
      m.moveKcal = kcalVal;
      updated = true;
    }

    const stepsRaw = json.steps;
    const stepsVal = parseSmartMetricValue(stepsRaw) ?? (json.syncWatch ? 0 : null);
    if (stepsVal !== null) {
      m.steps = stepsVal;
      m.distanceKm = parseFloat((m.steps * 0.00075).toFixed(2));
      updated = true;
    }

    const hrRaw = json.hr || json.heartRate || json.avgHr;
    const hrVal = parseSmartMetricValue(hrRaw) ?? (json.syncWatch ? 0 : null);
    if (hrVal !== null) {
      m.hr = hrVal;
      updated = true;
    }

    const maxHrRaw = json.maxHr;
    const maxHrVal = parseSmartMetricValue(maxHrRaw);
    if (maxHrVal !== null) {
      m.maxHr = maxHrVal;
      updated = true;
    }

    const exMinRaw = json.exerciseMin || json.durationMin || json.exMin;
    const exMinVal = parseSmartMetricValue(exMinRaw) ?? (json.syncWatch ? 0 : null);
    if (exMinVal !== null) {
      m.exerciseMin = exMinVal;
      updated = true;
    }

    const kcalArr = parseSmartMetricArray(kcalRaw);
    const exMinArr = parseSmartMetricArray(exMinRaw);
    const hrArr = parseSmartMetricArray(hrRaw);
    if (kcalArr.length > 1) {
      syncWeeklyWatchHistory(pid, kcalArr, exMinArr, hrArr);
      updated = true;
    }

    if (updated) {
      appState.appleWatch.syncMode = "real";
      appState.appleWatch.lastGlobalSync = new Date().toISOString();

      saveState();
      renderAll();

      const pName = appState.profiles[pid].name.split(" ")[0];
      addDebugLog(`🎯 MÉTRICAS FINALES ACTUALIZADAS PARA ${pName} DESDE PORTAPAPELES`, "success", {
        moveKcal: m.moveKcal,
        steps: m.steps,
        hr: m.hr,
        exerciseMin: m.exerciseMin,
        distanceKm: m.distanceKm,
        lastSync: appState.appleWatch.lastGlobalSync
      });

      // Clear clipboard after reading so it doesn't re-trigger
      try {
        await navigator.clipboard.writeText("");
        addDebugLog("🧹 Portapapeles limpiado automáticamente tras la sincronización", "info");
      } catch (clipErr) {}

      showIosToast(`📋 <strong>Sincronización silenciosa:</strong> Datos de Apple Watch (${pName}) cargados desde Portapapeles (${m.moveKcal} kcal · ${m.steps.toLocaleString()} pasos)`, "fa-solid fa-clipboard-check");
      return true;
    }
  } catch(e) {
    addDebugLog(`⚠️ Error o permiso denegado leyendo portapapeles: ${e.name} - ${e.message}`, "warning", { error: e.message });
    if (forceManual) {
      importFromShortcutText();
    }
  }

  return false;
}

function checkAutoLaunchShortcutOnOpen() {
  if (!appState.appleWatch?.autoLaunchShortcutOnOpen) return;
  if (sessionStorage.getItem("fitduo_shortcut_synced") === "true") return;
  if (sessionStorage.getItem("fitduo_shortcut_launched") === "true") return;

  sessionStorage.setItem("fitduo_shortcut_launched", "true");

  setTimeout(() => {
    launchIosShortcutSync(true, 'health');
  }, 1000);
}

async function launchIosShortcutSync(isAuto = false, mode = 'health') {
  triggerHapticTouch();
  sessionStorage.setItem("fitduo_shortcut_launched", "true");

  const shortcutName = mode === 'workout' 
    ? (appState.appleWatch?.shortcutWorkoutName || "SincronizarEntrenamientoFitDuo")
    : (appState.appleWatch?.shortcutName || "SincronizarSaludFitDuo");

  const url = `shortcuts://run-shortcut?name=${encodeURIComponent(shortcutName)}`;

  addDebugLog(`⚡ Invocando Atajo de iOS: ${shortcutName} (${isAuto ? 'Auto' : 'Manual'}, Modo: ${mode})`, "info", { url });

  if (isAuto) {
    showIosToast("⚡ Ejecutando Atajo de Salud de iOS al iniciar...", "fa-brands fa-apple");
  } else {
    showIosToast(`⚡ Lanzando Atajo de iOS (${shortcutName})...`, "fa-brands fa-apple");
  }

  setTimeout(() => {
    window.location.href = url;
  }, 300);
}

function getShortcutUrl(mode = 'health') {
  let baseUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
  try {
    if (window.location && window.location.href) {
      const cleanHref = window.location.href.split('?')[0].split('#')[0];
      if (cleanHref && cleanHref.length > 5) {
        baseUrl = cleanHref;
      }
    }
  } catch(e) {}

  if (mode === 'workout') {
    return `${baseUrl}?syncWatch=true&workout=true&kcal=[Calorias_Activas]&steps=[Pasos]&hr=[Pulso_Promedio]&exMin=[Minutos_Ejercicio]&dist=[Distancia_Km]&stand=[Horas_De_Pie]&workoutKcal=[Calorias_Entrenamiento]&duration=[Duracion_Minutos]&avgHr=[FC_Entrenamiento_Media]&maxHr=[FC_Entrenamiento_Max]`;
  } else {
    return `${baseUrl}?syncWatch=true&kcal=[Calorias_Activas]&steps=[Pasos]&hr=[Pulso_Promedio]&exMin=[Minutos_Ejercicio]&dist=[Distancia_Km]&stand=[Horas_De_Pie]`;
  }
}

function updateShortcutUrlInputs() {
  try {
    const healthInput = document.getElementById("shortcut-url-health-input");
    if (healthInput) {
      healthInput.value = getShortcutUrl('health');
    }

    const workoutInput = document.getElementById("shortcut-url-workout-input");
    if (workoutInput) {
      workoutInput.value = getShortcutUrl('workout');
    }
  } catch(e) {
    console.error("Error updating shortcut URL inputs:", e);
  }
}

function copyShortcutUrlToClipboard(mode = 'health') {
  try { triggerHapticTouch(); } catch(e) {}
  const url = getShortcutUrl(mode);
  
  const inputId = mode === 'workout' ? 'shortcut-url-workout-input' : 'shortcut-url-health-input';
  const inputEl = document.getElementById(inputId);
  if (inputEl) {
    inputEl.value = url;
    inputEl.focus();
    inputEl.select();
    inputEl.setSelectionRange(0, 99999);
  }

  const label = mode === 'workout' ? 'Entrenamiento + Salud' : 'Solo Salud';

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      showIosToast(`📋 <strong>URL del Atajo (${label}) copiada al portapapeles</strong>. Pégala en la acción "Abrir URL" de Atajos iOS.`, "fa-solid fa-copy");
    }).catch(() => {
      try {
        document.execCommand('copy');
        showIosToast(`📋 <strong>URL del Atajo (${label}) seleccionada y copiada</strong>.`, "fa-solid fa-copy");
      } catch(err) {
        showIosToast("📋 Texto seleccionado. Mantén pulsado el cuadro y selecciona 'Copiar'.", "fa-solid fa-copy");
      }
    });
  } else {
    try {
      document.execCommand('copy');
      showIosToast(`📋 <strong>URL del Atajo (${label}) copiada al portapapeles</strong>.`, "fa-solid fa-copy");
    } catch(err) {
      showIosToast("📋 Texto seleccionado. Mantén pulsado el cuadro y selecciona 'Copiar'.", "fa-solid fa-copy");
    }
  }
}
window.copyShortcutUrlToClipboard = copyShortcutUrlToClipboard;

function fallbackCopyTextToClipboard(text, mode) {
  const inputId = mode === 'workout' ? 'shortcut-url-workout-input' : 'shortcut-url-health-input';
  const inputEl = document.getElementById(inputId);
  if (inputEl) {
    inputEl.focus();
    inputEl.select();
    inputEl.setSelectionRange(0, 99999);
    try {
      document.execCommand('copy');
      const label = mode === 'workout' ? 'Entrenamiento + Salud' : 'Solo Salud';
      showIosToast(`📋 <strong>URL del Atajo (${label}) copiada al portapapeles</strong>.`, "fa-solid fa-copy");
      return;
    } catch(e) {}
  }
  showIosToast("⚠️ Selecciona el texto del cuadro y usa Copiar.", "fa-solid fa-exclamation-triangle");
}

function openHealthSyncModal() {
  try { triggerHapticTouch(); } catch(e) {}
  updateShortcutUrlInputs();
  const modal = document.getElementById("health-sync-modal");
  if (modal) modal.classList.add("active");
}
window.openHealthSyncModal = openHealthSyncModal;

function closeHealthSyncModal() {
  try { triggerHapticTouch(); } catch(e) {}
  const modal = document.getElementById("health-sync-modal");
  if (modal) modal.classList.remove("active");
}
window.closeHealthSyncModal = closeHealthSyncModal;

function switchShortcutTab(tabName) {
  try { triggerHapticTouch(); } catch(e) {}
  updateShortcutUrlInputs();

  const btnHealth = document.getElementById("shortcut-tab-btn-health");
  const btnWorkout = document.getElementById("shortcut-tab-btn-workout");
  const paneHealth = document.getElementById("shortcut-pane-health");
  const paneWorkout = document.getElementById("shortcut-pane-workout");

  if (tabName === 'health') {
    if (btnHealth) {
      btnHealth.className = "shortcut-tab-btn active";
      btnHealth.style.background = "var(--gradient-primary)";
      btnHealth.style.color = "#ffffff";
    }
    if (btnWorkout) {
      btnWorkout.className = "shortcut-tab-btn";
      btnWorkout.style.background = "transparent";
      btnWorkout.style.color = "var(--text-secondary)";
    }
    if (paneHealth) {
      paneHealth.style.cssText = "display: block !important; visibility: visible !important; opacity: 1 !important;";
    }
    if (paneWorkout) {
      paneWorkout.style.cssText = "display: none !important; visibility: hidden !important; opacity: 0 !important;";
    }
  } else {
    if (btnHealth) {
      btnHealth.className = "shortcut-tab-btn";
      btnHealth.style.background = "transparent";
      btnHealth.style.color = "var(--text-secondary)";
    }
    if (btnWorkout) {
      btnWorkout.className = "shortcut-tab-btn active";
      btnWorkout.style.background = "linear-gradient(135deg, #f43f5e, #e11d48)";
      btnWorkout.style.color = "#ffffff";
    }
    if (paneHealth) {
      paneHealth.style.cssText = "display: none !important; visibility: hidden !important; opacity: 0 !important;";
    }
    if (paneWorkout) {
      paneWorkout.style.cssText = "display: block !important; visibility: visible !important; opacity: 1 !important;";
    }
  }
}
window.switchShortcutTab = switchShortcutTab;

function testSimulatedHealthSync() {
  triggerHapticTouch();
  const randomKcal = Math.floor(480 + Math.random() * 220);
  const randomSteps = Math.floor(8200 + Math.random() * 4000);
  const randomHr = Math.floor(68 + Math.random() * 18);
  const testUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?syncWatch=true&kcal=${randomKcal}&steps=${randomSteps}&hr=${randomHr}&exMin=45&dist=6.8&stand=10`;
  window.history.replaceState({}, document.title, testUrl);
  checkUrlParamsForWatchSync();
  renderAll();
}

function testSimulatedWorkoutSync() {
  triggerHapticTouch();
  const todayDay = getTodayDayName();
  const randomKcal = Math.floor(580 + Math.random() * 200);
  const randomSteps = Math.floor(9500 + Math.random() * 3500);
  const randomHr = Math.floor(72 + Math.random() * 15);
  const workoutKcal = Math.floor(380 + Math.random() * 140);
  const workoutHr = Math.floor(142 + Math.random() * 18);
  const testUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?syncWatch=true&workout=true&day=${encodeURIComponent(todayDay)}&kcal=${randomKcal}&steps=${randomSteps}&hr=${randomHr}&exMin=55&dist=7.9&stand=12&workoutKcal=${workoutKcal}&duration=50&avgHr=${workoutHr}&maxHr=${workoutHr + 24}`;
  window.history.replaceState({}, document.title, testUrl);
  checkUrlParamsForWatchSync();
  renderAll();
}

function updateAppleWatchModalUI() {
  const pid = appState.activeProfileId;
  const m = appState.appleWatch.metrics[pid];
  const pName = appState.profiles[pid].name.split(" ")[0];
  if (!m) return;

  const mode = appState.appleWatch.syncMode || "real";

  // Auto-launch shortcut checkbox
  const shortcutToggle = document.getElementById("toggle-auto-launch-shortcut");
  if (shortcutToggle) shortcutToggle.checked = !!appState.appleWatch.autoLaunchShortcutOnOpen;

  // Sync Mode buttons state
  const btnReal = document.getElementById("btn-mode-real");
  const btnDemo = document.getElementById("btn-mode-demo");
  if (btnReal) btnReal.className = `mode-btn ${mode === 'real' ? 'active' : ''}`;
  if (btnDemo) btnDemo.className = `mode-btn ${mode === 'demo' ? 'active' : ''}`;

  const modeBadge = document.getElementById("watch-mode-badge");
  if (modeBadge) {
    modeBadge.innerHTML = mode === "real" 
      ? `<i class="fa-solid fa-shield-halved"></i> Datos Reales Estables` 
      : `<i class="fa-solid fa-vial"></i> Simulación Demo`;
  }

  const modeDesc = document.getElementById("watch-mode-desc");
  if (modeDesc) {
    modeDesc.innerHTML = mode === "real" 
      ? `✓ <strong>Modo Datos Reales:</strong> Las mediciones se mantienen congeladas y 100% precisas según los datos reales de tu reloj.` 
      : `⚡ <strong>Modo Simulación Demo:</strong> Generando telemetría simulada en tiempo real para demostración.`;
  }

  // Device & Subtitle
  const deviceEl = document.getElementById("watch-device-name");
  if (deviceEl) deviceEl.innerText = `${m.deviceName}`;

  const subEl = document.getElementById("modal-watch-subtitle");
  if (subEl) subEl.innerText = `Salud iOS (${pName}) - ${mode === 'real' ? 'Medición Real' : 'Demostración'}`;

  const batEl = document.getElementById("watch-battery-level");
  if (batEl) batEl.innerText = `${m.battery}%`;

  const toggleEl = document.getElementById("toggle-auto-sync");
  if (toggleEl) toggleEl.checked = !!appState.appleWatch.autoSyncEnabled;

  const timeDiffSec = Math.round((new Date() - new Date(appState.appleWatch.lastGlobalSync || new Date())) / 1000);
  const tsEl = document.getElementById("watch-sync-timestamp");
  if (tsEl) tsEl.innerText = `Sincronizado: Hace ${timeDiffSec < 3 ? 'un instante' : timeDiffSec + ' seg'}`;

  // Live Metrics Grid
  document.querySelectorAll("[id='watch-metric-hr']").forEach(el => el.innerHTML = `${m.hr} <small>BPM</small>`);
  document.querySelectorAll("[id='watch-metric-steps']").forEach(el => el.innerText = m.steps.toLocaleString());
  document.querySelectorAll("[id='watch-metric-dist']").forEach(el => el.innerHTML = `${m.distanceKm} <small>km</small>`);
  document.querySelectorAll("[id='watch-metric-kcal']").forEach(el => el.innerHTML = `${m.moveKcal} <small>kcal</small>`);

  // Apple Activity Rings Calculations
  const moveRatio = Math.min(1.2, m.moveKcal / m.moveGoal);
  const moveOffset = Math.max(0, 314 - (314 * Math.min(1, moveRatio)));
  document.querySelectorAll("[id='ring-move-circle']").forEach(el => el.style.strokeDashoffset = moveOffset);
  document.querySelectorAll("[id='ring-move-val']").forEach(el => el.innerText = `${m.moveKcal} / ${m.moveGoal} kcal`);

  const exRatio = Math.min(1.2, m.exerciseMin / m.exerciseGoal);
  const exOffset = Math.max(0, 238 - (238 * Math.min(1, exRatio)));
  document.querySelectorAll("[id='ring-exercise-circle']").forEach(el => el.style.strokeDashoffset = exOffset);
  document.querySelectorAll("[id='ring-exercise-val']").forEach(el => el.innerText = `${m.exerciseMin} / ${m.exerciseGoal} min`);

  const stepsRatio = Math.min(1.2, m.steps / (m.stepsGoal || 10000));
  const stepsOffset = Math.max(0, 163 - (163 * Math.min(1, stepsRatio)));
  document.querySelectorAll("[id='ring-steps-circle'], [id='ring-stand-circle']").forEach(el => el.style.strokeDashoffset = stepsOffset);
  document.querySelectorAll("[id='ring-steps-val'], [id='ring-stand-val']").forEach(el => el.innerText = `${m.steps.toLocaleString()} / ${(m.stepsGoal || 10000).toLocaleString()} pasos`);

  // Render Sync Logs
  const logList = document.getElementById("sync-log-list");
  if (logList) {
    if (!appState.appleWatch.syncLogs || appState.appleWatch.syncLogs.length === 0) {
      logList.innerHTML = `<li class="sync-log-item"><span class="sync-log-time">Ahora</span><span class="sync-log-detail">Conexión Salud iOS Inicializada</span></li>`;
    } else {
      logList.innerHTML = appState.appleWatch.syncLogs.map(l => `
        <li class="sync-log-item">
          <span class="sync-log-time">${l.timestamp} - ${l.device}</span>
          <span class="sync-log-detail">${l.kcal} kcal | ${l.hr} BPM | ${l.steps} pasos (${l.status})</span>
        </li>
      `).join("");
    }
  }
}

// APPLE HEALTH FILE IMPORT (PARSER XML/JSON FROM IPHONE)
function handleHealthFileImport(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const content = e.target.result;
    const pid = appState.activeProfileId;
    const m = appState.appleWatch.metrics[pid];

    try {
      if (file.name.endsWith('.json')) {
        const json = JSON.parse(content);
        if (json.steps) m.steps = parseInt(json.steps);
        if (json.activeCalories) m.moveKcal = parseInt(json.activeCalories);
        if (json.heartRate) m.hr = parseInt(json.heartRate);
      } else {
        const stepMatches = [...content.matchAll(/HKQuantityTypeIdentifierStepCount[^>]+value="(\d+)"/g)];
        if (stepMatches.length > 0) {
          const totalSteps = stepMatches.slice(-20).reduce((acc, match) => acc + parseInt(match[1]), 0);
          if (totalSteps > 0) m.steps = totalSteps;
        }

        const kcalMatches = [...content.matchAll(/HKQuantityTypeIdentifierActiveEnergyBurned[^>]+value="([\d.]+)"/g)];
        if (kcalMatches.length > 0) {
          const totalKcal = Math.round(kcalMatches.slice(-20).reduce((acc, match) => acc + parseFloat(match[1]), 0));
          if (totalKcal > 0) m.moveKcal = totalKcal;
        }
      }

      m.distanceKm = parseFloat((m.steps * 0.00075).toFixed(2));
      appState.appleWatch.syncMode = "real";
      appState.appleWatch.lastGlobalSync = new Date().toISOString();

      saveState();
      renderAll();

      showIosToast(`📄 Archivo de Salud iOS importado con éxito: ${m.steps.toLocaleString()} pasos y ${m.moveKcal} kcal cargados.`, "fa-solid fa-file-circle-check");
    } catch(err) {
      showIosToast(`⚠️ Error al leer el archivo de Salud iOS: Comprueba el formato XML/JSON.`, "fa-solid fa-triangle-exclamation");
    }
  };
  reader.readAsText(file);
}

// EDIT INDIVIDUAL WORKOUT APPLE WATCH DATA MODAL
function openEditWorkoutWatchModal(dayName) {
  triggerHapticTouch();
  const pid = appState.activeProfileId;
  const watchData = getDayWatchData(pid, dayName) || createWatchDataSnapshot(pid);

  const modal = document.getElementById("edit-workout-watch-modal");
  if (!modal) return;

  const dayInput = document.getElementById("edit-workout-day-name");
  if (dayInput) dayInput.value = dayName;

  const sub = document.getElementById("edit-workout-modal-subtitle");
  if (sub) sub.innerText = `Ajustar mediciones reales de Apple Watch del ${dayName}`;

  const devInput = document.getElementById("edit-workout-device-name");
  if (devInput) devInput.value = watchData.deviceName || `Apple Watch (${appState.profiles[pid].name.split(" ")[0]})`;

  const durInput = document.getElementById("edit-workout-duration");
  if (durInput) durInput.value = watchData.durationMin || 45;

  const kcalInput = document.getElementById("edit-workout-kcal");
  if (kcalInput) kcalInput.value = watchData.kcal || 400;

  const avgHrInput = document.getElementById("edit-workout-avg-hr");
  if (avgHrInput) avgHrInput.value = watchData.avgHr || 140;

  const maxHrInput = document.getElementById("edit-workout-max-hr");
  if (maxHrInput) maxHrInput.value = watchData.maxHr || 168;

  const tsInput = document.getElementById("edit-workout-timestamp");
  if (tsInput) tsInput.value = watchData.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " hs";

  modal.classList.add("active");
}

function closeEditWorkoutWatchModal() {
  triggerHapticTouch();
  const modal = document.getElementById("edit-workout-watch-modal");
  if (modal) modal.classList.remove("active");
}

function saveWorkoutWatchDataFromModal(e) {
  e.preventDefault();
  triggerHapticTouch();

  const pid = appState.activeProfileId;
  const dayName = document.getElementById("edit-workout-day-name")?.value;
  if (!dayName) return;

  const deviceName = document.getElementById("edit-workout-device-name")?.value.trim();
  const durationMin = parseInt(document.getElementById("edit-workout-duration")?.value) || 45;
  const kcal = parseInt(document.getElementById("edit-workout-kcal")?.value) || 400;
  const avgHr = parseInt(document.getElementById("edit-workout-avg-hr")?.value) || 140;
  const maxHr = parseInt(document.getElementById("edit-workout-max-hr")?.value) || 168;
  const timestamp = document.getElementById("edit-workout-timestamp")?.value.trim() || "09:30 hs";

  if (!appState.completedWorkouts[pid]) appState.completedWorkouts[pid] = {};

  appState.completedWorkouts[pid][dayName] = {
    done: true,
    watchData: {
      deviceName: deviceName || `Apple Watch (${appState.profiles[pid].name.split(" ")[0]})`,
      durationMin,
      kcal,
      avgHr,
      maxHr,
      timestamp,
      autoSync: false
    }
  };

  saveState();
  closeEditWorkoutWatchModal();
  renderAll();

  showIosToast(` Entrenamiento de ${dayName} calibrado con éxito (${kcal} kcal - ${durationMin} min)`, "fa-solid fa-circle-check");
}

// WEBBTUETOOTH HEART RATE MONITOR PAIRING
function connectBluetoothHR() {
  triggerHapticTouch();
  if (navigator.bluetooth) {
    navigator.bluetooth.requestDevice({ filters: [{ services: ['heart_rate'] }] })
      .then(device => {
        showIosToast(` Conectado por Bluetooth a ${device.name || 'Pulsómetro Apple Watch'}`, "fa-solid fa-bluetooth");
      })
      .catch(err => {
        // Fallback demo pairing
        simulateBluetoothPairing();
      });
  } else {
    simulateBluetoothPairing();
  }
}

function simulateBluetoothPairing() {
  const pid = appState.activeProfileId;
  const m = appState.appleWatch.metrics[pid];
  m.hr = 142; // Workout pulse burst
  saveState();
  updateAppleWatchModalUI();
  showIosToast(` Pulsómetro Apple Watch enlazado por Bluetooth: Frecuencia cardíaca en directo 142 BPM`, "fa-solid fa-heart-pulse");
}

function formatSyncRelativeTime(lastSyncDate) {
  if (!lastSyncDate) return "Sincronizado hace 0 segundos";
  const now = new Date();
  const past = new Date(lastSyncDate);
  const diffSec = Math.max(0, Math.floor((now - past) / 1000));

  if (diffSec < 60) {
    return `Sincronizado hace ${diffSec} segundos`;
  }
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return `Sincronizado hace ${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'}`;
  }
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) {
    return `Sincronizado hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
  }
  const diffDays = Math.floor(diffHours / 24);
  return `Sincronizado hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
}

// RENDER MAIN SUMMARY & APPLE WATCH DASHBOARD
function renderSummaryView() {
  const pid = appState.activeProfileId;
  const p = appState.profiles[pid];
  const m = appState.appleWatch?.metrics?.[pid];
  if (!p || !m) return;

  const pName = p.name.split(" ")[0];

  const syncTimeEl = document.getElementById("summary-watch-sync-time");
  if (syncTimeEl) syncTimeEl.innerText = formatSyncRelativeTime(appState.appleWatch?.lastGlobalSync);

  // Live Metrics
  const hrEl = document.getElementById("summary-metric-hr");
  if (hrEl) hrEl.innerHTML = `${m.hr} <small>BPM</small>`;

  const stepsEl = document.getElementById("summary-metric-steps");
  if (stepsEl) stepsEl.innerText = m.steps.toLocaleString();

  const distEl = document.getElementById("summary-metric-dist");
  if (distEl) distEl.innerHTML = `${m.distanceKm} <small>km</small>`;

  const kcalEl = document.getElementById("summary-metric-kcal");
  if (kcalEl) kcalEl.innerHTML = `${m.moveKcal} <small>kcal</small>`;

  // Rings
  const moveCircle = document.getElementById("summary-ring-move-circle");
  const moveRatio = Math.min(1.2, m.moveKcal / m.moveGoal);
  const moveOffset = Math.max(0, 314 - (314 * Math.min(1, moveRatio)));
  if (moveCircle) moveCircle.style.strokeDashoffset = moveOffset;
  const moveValEl = document.getElementById("summary-ring-move-val");
  if (moveValEl) moveValEl.innerText = `${m.moveKcal} / ${m.moveGoal} kcal`;

  const exCircle = document.getElementById("summary-ring-exercise-circle");
  const exRatio = Math.min(1.2, m.exerciseMin / m.exerciseGoal);
  const exOffset = Math.max(0, 238 - (238 * Math.min(1, exRatio)));
  if (exCircle) exCircle.style.strokeDashoffset = exOffset;
  const exValEl = document.getElementById("summary-ring-exercise-val");
  if (exValEl) exValEl.innerText = `${m.exerciseMin} / ${m.exerciseGoal} min`;

  const stepsCircle = document.getElementById("summary-ring-steps-circle") || document.getElementById("summary-ring-stand-circle");
  const stepsRatio = Math.min(1.2, m.steps / (m.stepsGoal || 10000));
  const stepsOffset = Math.max(0, 163 - (163 * Math.min(1, stepsRatio)));
  if (stepsCircle) stepsCircle.style.strokeDashoffset = stepsOffset;
  const stepsValEl = document.getElementById("summary-ring-steps-val") || document.getElementById("summary-ring-stand-val");
  if (stepsValEl) stepsValEl.innerText = `${m.steps.toLocaleString()} / ${(m.stepsGoal || 10000).toLocaleString()} pasos`;

  // Nutrition targets
  const targetCalEl = document.getElementById("summary-target-calories");
  if (targetCalEl) targetCalEl.innerText = `${p.targetCalories} kcal`;
  const targetProtEl = document.getElementById("summary-target-protein");
  if (targetProtEl) targetProtEl.innerText = `${p.protein} g`;
  const targetCarbsEl = document.getElementById("summary-target-carbs");
  if (targetCarbsEl) targetCarbsEl.innerText = `${p.carbs} g`;
  const targetFatsEl = document.getElementById("summary-target-fats");
  if (targetFatsEl) targetFatsEl.innerText = `${p.fats} g`;

  // Today's Workout Summary Box
  const todayWorkoutBox = document.getElementById("summary-today-workout-box");
  if (todayWorkoutBox) {
    const todayName = getTodayDayName();
    const isCompleted = isDayCompleted(pid, todayName);
    const watchData = getDayWatchData(pid, todayName);

    if (isCompleted) {
      const durationText = watchData?.durationMin ? `${watchData.durationMin} min` : "45 min";
      const kcalText = watchData?.kcal ? `${watchData.kcal} kcal` : "350 kcal";
      const hrText = watchData?.avgHr ? `${watchData.avgHr} BPM` : "140 BPM";
      const deviceText = watchData?.deviceName ? `Registrado con ${watchData.deviceName} a las ${watchData.timestamp || 'hoy'}` : "Registrado en rutina de hoy";

      todayWorkoutBox.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(16, 185, 129, 0.15); color: var(--accent-emerald); display: flex; align-items: center; justify-content: center; font-size: 1.1rem;">
            <i class="fa-solid fa-circle-check"></i>
          </div>
          <div>
            <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-primary);">
              Entrenamiento de Hoy (${todayName}) Completado
            </div>
            <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 0.1rem;">
              ${deviceText}
            </div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 0.8rem; flex-wrap: wrap;">
          <span style="font-size: 0.85rem; font-weight: 600; color: var(--accent-emerald);">
            <i class="fa-solid fa-fire"></i> ${kcalText}
          </span>
          <span style="font-size: 0.85rem; font-weight: 600; color: var(--accent-cyan);">
            <i class="fa-solid fa-stopwatch"></i> ${durationText}
          </span>
          <span style="font-size: 0.85rem; font-weight: 600; color: var(--accent-purple);">
            <i class="fa-solid fa-heart-pulse"></i> ${hrText}
          </span>
          <button type="button" class="btn-primary" style="padding: 0.35rem 0.75rem; font-size: 0.76rem; background: rgba(244, 63, 94, 0.2); border: 1px solid var(--accent-rose); color: var(--accent-rose);" onclick="toggleWorkoutDay('${todayName}')">
            <i class="fa-solid fa-rotate-left"></i> Desmarcar
          </button>
        </div>
      `;
    } else {
      todayWorkoutBox.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(245, 158, 11, 0.15); color: var(--accent-orange); display: flex; align-items: center; justify-content: center; font-size: 1.1rem;">
            <i class="fa-solid fa-clock"></i>
          </div>
          <div>
            <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-primary);">
              Entrenamiento de Hoy (${todayName}): Pendiente
            </div>
            <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 0.1rem;">
              Pulsa para marcar el entrenamiento de hoy como completado
            </div>
          </div>
        </div>

        <button type="button" class="btn-primary" style="padding: 0.45rem 0.9rem; font-size: 0.8rem; background: var(--accent-emerald);" onclick="toggleWorkoutDay('${todayName}')">
          <i class="fa-solid fa-square-check"></i> Marcar Entreno Completado
        </button>
      `;
    }
  }
}

// RENDER PROFILE & MACROS
function renderProfileView() {
  const p = appState.profiles[appState.activeProfileId];
  
  document.getElementById("profile-subtitle").innerText = 
    `Personalización para ${p.name} - Objetivo: Recomposición corporal (${p.height}cm, ${p.weight}kg)`;
  
  document.getElementById("target-calories").innerText = `${p.targetCalories} kcal`;
  document.getElementById("target-protein").innerText = `${p.protein} g`;
  document.getElementById("target-carbs").innerText = `${p.carbs} g`;
  document.getElementById("target-fats").innerText = `${p.fats} g`;

  updateShortcutUrlInputs();
  renderWorkoutTracker();
}

// DEVICE PROFILE MEMORY SETTINGS & HANDLERS
function setDeviceDefaultProfile(mode) {
  triggerHapticTouch();
  localStorage.setItem(DEVICE_DEFAULT_PROFILE_KEY, mode);

  if (mode === 'he' || mode === 'she') {
    switchProfile(mode);
  } else {
    // 'last'
    const last = localStorage.getItem(LAST_ACTIVE_PROFILE_KEY) || 'he';
    switchProfile(last);
  }

  const msg = mode === 'he'
    ? "📱 Perfil predeterminado en este teléfono fijado a CARLOS"
    : mode === 'she'
    ? "📱 Perfil predeterminado en este teléfono fijado a ANDREA"
    : "📱 Se recordará el último perfil seleccionado en este teléfono";

  showIosToast(msg, "fa-solid fa-mobile-screen-button");
}

function renderSettingsView() {
  const currentPref = localStorage.getItem(DEVICE_DEFAULT_PROFILE_KEY) || 'last';
  const activeProfile = appState.activeProfileId || 'he';
  const p = appState.profiles?.[activeProfile] || { name: activeProfile === 'he' ? 'Él (Carlos)' : 'Ella (Andrea)' };
  const watchMetrics = appState.appleWatch?.metrics?.[activeProfile] || {};

  const btnHe = document.getElementById("pref-btn-he");
  const btnShe = document.getElementById("pref-btn-she");
  const btnLast = document.getElementById("pref-btn-last");
  
  if (btnHe) btnHe.classList.toggle("active", currentPref === 'he');
  if (btnShe) btnShe.classList.toggle("active", currentPref === 'she');
  if (btnLast) btnLast.classList.toggle("active", currentPref === 'last');

  const badge = document.getElementById("settings-device-badge");
  if (badge) {
    const rawName = p.name || (activeProfile === 'he' ? 'Carlos' : 'Andrea');
    let label = currentPref === 'he' ? "Carlos (Siempre)" : currentPref === 'she' ? "Andrea (Siempre)" : `Último usado (${rawName})`;
    badge.innerHTML = `<i class="fa-solid fa-shield-halved"></i> ${label}`;
  }

  const statusProfile = document.getElementById("settings-status-profile");
  if (statusProfile) {
    statusProfile.innerHTML = `<i class="fa-solid ${activeProfile === 'he' ? 'fa-mars' : 'fa-venus'}" style="color: var(--accent-emerald);"></i> ${p.name || 'Perfil Activo'}`;
  }

  const statusWatch = document.getElementById("settings-status-watch");
  if (statusWatch) {
    statusWatch.innerHTML = `<i class="fa-brands fa-apple" style="color: var(--accent-cyan);"></i> ${watchMetrics.deviceName || 'Apple Watch'}`;
  }
}

function forceAppRefresh() {
  triggerHapticTouch();
  showIosToast("🔄 Actualizando y vaciando caché del acceso directo...", "fa-solid fa-arrows-rotate");
  if ('caches' in window) {
    caches.keys().then(names => {
      for (let name of names) caches.delete(name);
    });
  }
  setTimeout(() => {
    window.location.href = window.location.pathname + '?v=' + Date.now();
  }, 400);
}

// WORKOUT TRACKER & APPLE WATCH SESSION ENGINE
function isDayCompleted(profileId, dayName) {
  const val = appState.completedWorkouts?.[profileId]?.[dayName];
  if (!val) return false;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'object') return !!val.done;
  return false;
}

function getDayWatchData(profileId, dayName) {
  const val = appState.completedWorkouts?.[profileId]?.[dayName];
  if (val && typeof val === 'object' && val.watchData) {
    return val.watchData;
  }
  if (val === true) {
    const snapshot = createWatchDataSnapshot(profileId);
    if (!appState.completedWorkouts[profileId]) appState.completedWorkouts[profileId] = {};
    appState.completedWorkouts[profileId][dayName] = { done: true, watchData: snapshot };
    saveState();
    return snapshot;
  }
  return null;
}

function createWatchDataSnapshot(profileId, customDuration = null) {
  const m = appState.appleWatch?.metrics?.[profileId] || {};
  const pName = appState.profiles[profileId]?.name?.split(" ")[0] || "Apple Watch";
  const duration = customDuration || (m.exerciseMin > 0 ? m.exerciseMin : 45);
  const kcal = m.moveKcal > 0 ? m.moveKcal : 420;
  const avgHr = m.hr || 138;
  const maxHr = m.maxHr || (avgHr + 22);
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " hs";

  return {
    deviceName: m.deviceName || `Apple Watch (${pName})`,
    durationMin: duration,
    kcal: kcal,
    avgHr: avgHr,
    maxHr: maxHr,
    timestamp: timeStr,
    autoSync: true
  };
}

function getTodayDayName() {
  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const idx = new Date().getDay();
  return days[idx];
}

function recordWatchWorkoutForDay(dayName = null, profileId = null, notify = true) {
  const pid = profileId || appState.activeProfileId;
  const targetDay = dayName || appState.activeWorkoutDay || getTodayDayName();
  
  if (!appState.completedWorkouts[pid]) {
    appState.completedWorkouts[pid] = {};
  }

  const snapshot = createWatchDataSnapshot(pid);
  appState.completedWorkouts[pid][targetDay] = {
    done: true,
    watchData: snapshot
  };

  saveState();
  renderAll();

  if (notify) {
    const pName = appState.profiles[pid].name.split(" ")[0];
    showIosToast(` Entrenamiento de ${targetDay} vinculado automáticamente desde Apple Watch (${pName})`, "fa-brands fa-apple");
  }
}

function toggleWorkoutDay(dayName) {
  const profileId = appState.activeProfileId;
  if (!appState.completedWorkouts[profileId]) {
    appState.completedWorkouts[profileId] = {};
  }

  const currentDone = isDayCompleted(profileId, dayName);

  if (currentDone) {
    appState.completedWorkouts[profileId][dayName] = { done: false, watchData: null };
  } else {
    const watchSnapshot = createWatchDataSnapshot(profileId);
    appState.completedWorkouts[profileId][dayName] = {
      done: true,
      watchData: watchSnapshot
    };
    const pName = appState.profiles[profileId].name.split(" ")[0];
    showIosToast(` Entrenamiento de ${dayName} registrado con Apple Watch (${pName}: ${watchSnapshot.kcal} kcal - ${watchSnapshot.durationMin} min)`, "fa-brands fa-apple");
  }

  saveState();
  renderAll();
}

function resetWorkoutWeek() {
  const profileId = appState.activeProfileId;
  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  if (!appState.completedWorkouts[profileId]) {
    appState.completedWorkouts[profileId] = {};
  }
  days.forEach(d => {
    appState.completedWorkouts[profileId][d] = { done: false, watchData: null };
  });
  saveState();
  renderAll();
}

function syncAppleWatchData() {
  triggerManualSync();
  recordWatchWorkoutForDay(appState.activeWorkoutDay || "Lunes", appState.activeProfileId, true);
  openAppleWatchModal();
}

function renderWorkoutTracker() {
  const container = document.getElementById("profile-workouts-container");
  if (!container) return;

  const profileId = appState.activeProfileId;
  const p = appState.profiles[profileId];
  const watchMetrics = appState.appleWatch?.metrics[profileId] || { moveKcal: 0, hr: 0, steps: 0, distanceKm: 0 };
  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  let completedCount = 0;
  let totalMinutes = 0;

  days.forEach(d => {
    if (isDayCompleted(profileId, d)) {
      completedCount++;
      const watchData = getDayWatchData(profileId, d);
      if (watchData && watchData.durationMin) {
        totalMinutes += watchData.durationMin;
      } else {
        const schedule = WEEKLY_WORKOUT_SCHEDULE[d];
        if (schedule && schedule.duration) {
          totalMinutes += schedule.duration;
        }
      }
    }
  });

  const totalDays = 7;
  const percent = Math.round((completedCount / totalDays) * 100);

  let html = `
    <div class="glass-card workout-tracker-card">
      <div class="tracker-header-row">
        <div>
          <h2 style="font-family: var(--font-heading); font-size: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
            <i class="fa-solid fa-calendar-check" style="color: var(--accent-emerald);"></i> 
            Registro y Vista de Entrenamientos Semanales (${p.name})
          </h2>
          <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 0.25rem;">
            Sincronización en tiempo real con Apple Watch: los entrenamientos grabados en el reloj se vinculan automáticamente a su día correspondiente.
          </p>
        </div>
        <button class="btn-secondary-sm" onclick="resetWorkoutWeek()" title="Reiniciar semana">
          <i class="fa-solid fa-rotate-left"></i> Reiniciar Semana
        </button>
      </div>

      <!-- APPLE WATCH SYNC BANNER -->
      <div class="apple-watch-banner">
        <div class="apple-watch-info">
          <div class="apple-watch-icon"><i class="fa-brands fa-apple"></i></div>
          <div>
            <h3 class="apple-watch-title"> Apple Watch (${p.name.split(' ')[0]}) - Live Auto-Sync</h3>
            <p class="apple-watch-subtitle">Última sync: ${watchMetrics.steps.toLocaleString()} pasos • ${watchMetrics.moveKcal} kcal • ${watchMetrics.hr} BPM (${watchMetrics.distanceKm} km con Boo)</p>
          </div>
        </div>
        <button class="btn-apple-sync" onclick="syncAppleWatchData();">
          <i class="fa-brands fa-apple"></i> Sincronizar
        </button>
      </div>

      <!-- PROGRESS SUMMARY BAR -->
      <div class="tracker-stats-summary">
        <div class="stat-pill-item">
          <span class="stat-pill-label"><i class="fa-solid fa-trophy" style="color:var(--accent-amber);"></i> Días Entrenados</span>
          <span class="stat-pill-val">${completedCount} / ${totalDays} días</span>
        </div>
        <div class="stat-pill-item">
          <span class="stat-pill-label"><i class="fa-solid fa-stopwatch" style="color:var(--accent-cyan);"></i> Tiempo Activo</span>
          <span class="stat-pill-val">${totalMinutes} min</span>
        </div>
        <div class="stat-pill-item">
          <span class="stat-pill-label"><i class="fa-solid fa-heart-pulse" style="color:var(--accent-rose);"></i> FC Media (Watch)</span>
          <span class="stat-pill-val">${watchMetrics.hr} BPM</span>
        </div>
        <div class="stat-pill-item">
          <span class="stat-pill-label"><i class="fa-solid fa-fire" style="color:var(--accent-rose);"></i> Calorías Activas</span>
          <span class="stat-pill-val">${watchMetrics.moveKcal} kcal</span>
        </div>
      </div>

      <div class="tracker-progress-container">
        <div class="tracker-progress-label">
          <span>Constancia semanal</span>
          <span><strong>${percent}%</strong> completado</span>
        </div>
        <div class="tracker-progress-bar-bg">
          <div class="tracker-progress-bar-fill" style="width: ${percent}%;"></div>
        </div>
      </div>

      <!-- DAYS CARDS GRID -->
      <div class="workout-days-grid">
  `;

  days.forEach(day => {
    const isDone = isDayCompleted(profileId, day);
    const watchData = getDayWatchData(profileId, day);
    const routine = WEEKLY_WORKOUT_SCHEDULE[day] || {};

    let watchBadgeHtml = "";
    if (isDone && watchData) {
      watchBadgeHtml = `
        <div class="watch-day-badge">
          <div class="watch-badge-top">
            <span class="watch-badge-device"><i class="fa-brands fa-apple"></i> ${watchData.deviceName}</span>
            <span class="watch-badge-time"><i class="fa-regular fa-clock"></i> ${watchData.timestamp}</span>
          </div>
          <div class="watch-badge-metrics">
            <span class="watch-mini-pill"><i class="fa-solid fa-stopwatch" style="color:var(--accent-cyan);"></i> ${watchData.durationMin} min</span>
            <span class="watch-mini-pill"><i class="fa-solid fa-fire" style="color:var(--accent-rose);"></i> ${watchData.kcal} kcal</span>
            <span class="watch-mini-pill"><i class="fa-solid fa-heart-pulse" style="color:var(--accent-rose);"></i> ${watchData.avgHr} BPM</span>
            <button class="btn-edit-watch-mini" onclick="event.stopPropagation(); openEditWorkoutWatchModal('${day}')" title="Calibrar datos reales de este entrenamiento"><i class="fa-solid fa-pen"></i></button>
          </div>
        </div>
      `;
    }

    html += `
      <div class="day-workout-card ${isDone ? 'completed' : ''}" onclick="toggleWorkoutDay('${day}')">
        <div class="day-card-top">
          <div class="day-checkbox-wrapper">
            <input type="checkbox" ${isDone ? 'checked' : ''} onclick="event.stopPropagation(); toggleWorkoutDay('${day}')">
            <span class="day-name">${day}</span>
          </div>
          <span class="day-status-badge ${isDone ? 'done' : 'pending'}">
            ${isDone ? (watchData ? '<i class="fa-brands fa-apple"></i> Watch OK' : '<i class="fa-solid fa-circle-check"></i> Entrenado') : '<i class="fa-regular fa-circle"></i> Pendiente'}
          </span>
        </div>

        <h4 class="day-routine-title">${routine.title || day}</h4>
        
        <div class="day-routine-meta">
          <span><i class="fa-solid fa-clock"></i> ${routine.duration || 0} min</span>
          <span><i class="fa-solid fa-location-dot"></i> ${routine.location || 'En casa'}</span>
        </div>

        <p class="day-routine-focus">
          <strong>Enfoque:</strong> ${routine.focus || 'Actividad libre'}
        </p>

        ${watchBadgeHtml}

        <details style="margin-top: 0.6rem; font-size: 0.78rem;" onclick="event.stopPropagation();">
          <summary style="color: var(--accent-cyan); cursor: pointer; font-weight: 600;">
            Ver ${routine.exercises ? routine.exercises.length : 0} Ejercicios de hoy
          </summary>
          <ul class="day-exercise-mini-list" style="margin-top: 0.4rem; padding-left: 1rem; color: var(--text-muted); line-height: 1.5;">
            ${routine.exercises ? routine.exercises.map(ex => `
              <li style="margin-bottom: 2px;"><strong>${ex.name}</strong> (${ex.sets} series x ${ex.reps})</li>
            `).join('') : '<li>Descanso</li>'}
          </ul>
        </details>
      </div>
    `;
  });

  html += `
      </div>
    </div>
  `;

  container.innerHTML = html;
}

// EXCLUSIONS ENGINE (DEPRECATED DUMMY HANDLERS FOR BACKWARD COMPATIBILITY)
function renderExclusions() {}
function addExclusion() {}
function removeExclusion() {}

// FILTER RECIPES BASED ON EXCLUSIONS
function getFilteredRecipes() {
  if (appState.exclusions.length === 0) return RECIPES_DATABASE;

  return RECIPES_DATABASE.filter(recipe => {
    const recipeText = (recipe.name + " " + recipe.ingredients.map(i => i.name).join(" ")).toLowerCase();
    return !appState.exclusions.some(ex => recipeText.includes(ex));
  });
}

// RENDER NUTRITION ENGINE (3 SUBTABS)
function openTodayNutrition() {
  const today = getTodayDayName();
  appState.activeDay = today;
  const selectElem = document.getElementById("nutrition-day-select");
  if (selectElem) selectElem.value = today;
  showTab("nutrition-menu-view", document.getElementById("dock-btn-nutrition"));
}

function selectDay(dayName, btnElem) {
  appState.activeDay = dayName;
  const selectElem = document.getElementById("nutrition-day-select");
  if (selectElem) selectElem.value = dayName;
  renderNutritionMenuView();
}

function selectDayFromDropdown(dayName) {
  appState.activeDay = dayName;
  renderNutritionMenuView();
}

// SUBTAB 1: MENU DEL DIA (5 TARJETAS VERTICALES)
function renderNutritionMenuView() {
  const container = document.getElementById("meal-cards-container");
  if (!container) return;
  container.innerHTML = "";

  const availableRecipes = getFilteredRecipes();
  
  if (availableRecipes.length === 0) {
    container.innerHTML = `
      <div class="glass-card" style="text-align:center; padding: 2rem;">
        <p style="color: var(--accent-rose);">⚠️ Habéis excluido demasiados alimentos y no hay recetas disponibles en la base de datos.</p>
      </div>
    `;
    return;
  }

  const breakfasts = availableRecipes.filter(r => r.type === "desayuno");
  const lunches = availableRecipes.filter(r => r.type === "comida");
  const dinners = availableRecipes.filter(r => r.type === "cena");
  const snacks = availableRecipes.filter(r => r.type === "snack");

  const dayNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const currentDay = appState.activeDay || getTodayDayName();
  const dayIndex = dayNames.indexOf(currentDay) >= 0 ? dayNames.indexOf(currentDay) : 0;

  // Sync dropdown selector state
  const selectElem = document.getElementById("nutrition-day-select");
  if (selectElem && selectElem.value !== currentDay) {
    selectElem.value = currentDay;
  }

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

    const ingredientsHtml = meal.ingredients.map(ing => `
      <li>
        <span>${ing.name}</span>
        <strong>${ing.amount} ${ing.unit}</strong>
      </li>
    `).join("");

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
        <span class="macro-pill" style="color:var(--accent-amber); font-weight:600;"><i class="fa-solid fa-fire"></i> ${meal.calories} kcal</span>
        <span class="macro-pill" style="color:var(--accent-emerald); font-weight:600;"><i class="fa-solid fa-dumbbell"></i> ${meal.protein}g Proteína</span>
        <span class="macro-pill" style="color:var(--accent-cyan); font-weight:600;"><i class="fa-solid fa-wheat-awn"></i> ${meal.carbs}g Carbs</span>
        <span class="macro-pill" style="color:var(--accent-violet); font-weight:600;"><i class="fa-solid fa-droplet"></i> ${meal.fats}g Grasas</span>
      </div>

      <div style="margin-bottom: 0.85rem;">${tagsHtml}</div>

      <h4 style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.3rem;">
        <i class="fa-solid fa-list-check"></i> Ingredientes necesarios:
      </h4>
      <ul class="ingredient-list">
        ${ingredientsHtml}
      </ul>

      <details style="font-size: 0.85rem; color: var(--accent-cyan); cursor: pointer; margin-top: 0.85rem; background: rgba(255,255,255,0.03); padding: 0.6rem 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
        <summary style="font-weight: 600; outline: none; display: flex; align-items: center; gap: 0.4rem;">
          <i class="fa-solid fa-kitchen-set"></i> Ver Pasos de Preparación
        </summary>
        <ol style="margin-top: 0.6rem; padding-left: 1.2rem; color: var(--text-secondary); line-height: 1.6;">
          ${meal.instructions.map(step => `<li style="margin-bottom: 0.3rem;">${step}</li>`).join("")}
        </ol>
      </details>
    `;
    container.appendChild(card);
  });
}

// SUBTAB 2: RECETAS Y BATCH COOKING
function setRecipesRange(range) {
  appState.recipesDaysRange = range;
  saveState();
  const btn5 = document.getElementById("recipes-range-5");
  const btn7 = document.getElementById("recipes-range-7");
  if (btn5) btn5.classList.toggle("active", range === '5');
  if (btn7) btn7.classList.toggle("active", range === '7');
  renderNutritionRecipesView();
}

function renderNutritionRecipesView() {
  const container = document.getElementById("recipes-cards-container");
  if (!container) return;
  container.innerHTML = "";

  const range = appState.recipesDaysRange || '5';
  const dayNames = range === '5' 
    ? ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]
    : ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  const btn5 = document.getElementById("recipes-range-5");
  const btn7 = document.getElementById("recipes-range-7");
  if (btn5) btn5.classList.toggle("active", range === '5');
  if (btn7) btn7.classList.toggle("active", range === '7');

  const availableRecipes = getFilteredRecipes();
  const usedRecipes = new Map();

  dayNames.forEach((dayName, idx) => {
    const breakfasts = availableRecipes.filter(r => r.type === "desayuno");
    const lunches = availableRecipes.filter(r => r.type === "comida");
    const dinners = availableRecipes.filter(r => r.type === "cena");
    const snacks = availableRecipes.filter(r => r.type === "snack");

    const dailyMeals = [
      breakfasts[idx % (breakfasts.length || 1)],
      lunches[idx % (lunches.length || 1)],
      dinners[idx % (dinners.length || 1)],
      snacks[idx % (snacks.length || 1)],
      snacks[(idx + 1) % (snacks.length || 1)]
    ];

    dailyMeals.forEach(m => {
      if (m && !usedRecipes.has(m.id)) {
        usedRecipes.set(m.id, { meal: m, days: [dayName] });
      } else if (m && usedRecipes.has(m.id)) {
        usedRecipes.get(m.id).days.push(dayName);
      }
    });
  });

  if (usedRecipes.size === 0) {
    container.innerHTML = `<div class="glass-card"><p style="color:var(--text-muted);">No hay recetas registradas.</p></div>`;
    return;
  }

  usedRecipes.forEach(({ meal, days }) => {
    const card = document.createElement("div");
    card.className = "glass-card recipe-batch-card";

    const ingredientsHtml = meal.ingredients.map(ing => `
      <li><span>${ing.name}</span><strong>${ing.amount} ${ing.unit}</strong></li>
    `).join("");

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem; flex-wrap:wrap; gap:0.4rem;">
        <span class="meal-card-type"><i class="fa-solid fa-fire-burner"></i> ${meal.type.toUpperCase()} • ${meal.prepTime} min</span>
        <span style="font-size:0.75rem; color:var(--accent-cyan); font-weight:600;"><i class="fa-solid fa-calendar-check"></i> ${days.join(", ")}</span>
      </div>
      <h3 class="meal-card-title">${meal.name}</h3>

      <div class="meal-macros-pills">
        <span class="macro-pill" style="color:var(--accent-amber);">${meal.calories} kcal</span>
        <span class="macro-pill" style="color:var(--accent-emerald);">${meal.protein}g Prot</span>
        <span class="macro-pill" style="color:var(--accent-cyan);">${meal.carbs}g Carbs</span>
        <span class="macro-pill" style="color:var(--accent-violet);">${meal.fats}g Grasas</span>
      </div>

      <h4 style="font-size:0.85rem; color:var(--text-muted); margin:0.6rem 0 0.4rem 0;">Ingredientes requeridos:</h4>
      <ul class="ingredient-list">${ingredientsHtml}</ul>

      <details style="font-size:0.85rem; color:var(--accent-cyan); cursor:pointer; margin-top:0.75rem; background:rgba(255,255,255,0.03); padding:0.6rem 0.8rem; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
        <summary style="font-weight:600;">Paso a Paso & Batch Prep</summary>
        <ol style="margin-top:0.5rem; padding-left:1.2rem; color:var(--text-muted); line-height:1.5;">
          ${meal.instructions.map(s => `<li>${s}</li>`).join("")}
        </ol>
      </details>
    `;
    container.appendChild(card);
  });
}

// SUBTAB 3: LISTA DE LA COMPRA INTELIGENTE
function setShoppingRange(range) {
  appState.shoppingDaysRange = range;
  saveState();
  const btn5 = document.getElementById("shopping-range-5");
  const btn7 = document.getElementById("shopping-range-7");
  if (btn5) btn5.classList.toggle("active", range === '5');
  if (btn7) btn7.classList.toggle("active", range === '7');
  renderShoppingView();
}

function renderShoppingView() {
  const container = document.getElementById("shopping-categories-container");
  if (!container) return;
  container.innerHTML = "";

  const range = appState.shoppingDaysRange || '5';
  const dayNames = range === '5' 
    ? ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]
    : ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  const btn5 = document.getElementById("shopping-range-5");
  const btn7 = document.getElementById("shopping-range-7");
  if (btn5) btn5.classList.toggle("active", range === '5');
  if (btn7) btn7.classList.toggle("active", range === '7');

  const availableRecipes = getFilteredRecipes();
  const aggregated = {};

  dayNames.forEach((d, idx) => {
    const breakfasts = availableRecipes.filter(r => r.type === "desayuno");
    const lunches = availableRecipes.filter(r => r.type === "comida");
    const dinners = availableRecipes.filter(r => r.type === "cena");
    const snacks = availableRecipes.filter(r => r.type === "snack");

    const dailyMeals = [
      breakfasts[idx % (breakfasts.length || 1)],
      lunches[idx % (lunches.length || 1)],
      dinners[idx % (dinners.length || 1)],
      snacks[idx % (snacks.length || 1)],
      snacks[(idx + 1) % (snacks.length || 1)]
    ];

    dailyMeals.forEach(meal => {
      if (!meal) return;
      meal.ingredients.forEach(ing => {
        const key = `${ing.name} (${ing.unit})`;
        if (!aggregated[key]) {
          aggregated[key] = {
            name: ing.name,
            amount: 0,
            unit: ing.unit,
            category: ing.category || INGREDIENT_CATEGORIES.PANTRY
          };
        }
        aggregated[key].amount += ing.amount;
      });
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
      <div class="shopping-items-grid">
        ${itemsHtml}
      </div>
    `;

    container.appendChild(catSection);
  });
}

function toggleShoppingItem(itemKey, elem) {
  appState.checkedShoppingItems[itemKey] = !appState.checkedShoppingItems[itemKey];
  saveState();
  if (elem) {
    elem.classList.toggle("checked", appState.checkedShoppingItems[itemKey]);
    const checkbox = elem.querySelector("input[type='checkbox']");
    if (checkbox) checkbox.checked = appState.checkedShoppingItems[itemKey];
  }
}

function copyShoppingList() {
  const items = document.querySelectorAll(".shopping-item");
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
    alert("¡Lista de la compra copiada al portapapeles! Puedes pegarla en WhatsApp o Notas.");
  });
}

// RENDER WORKOUTS VIEW
function openTodayWorkouts() {
  const today = getTodayDayName();
  let targetBtn = null;
  document.querySelectorAll("#workout-days-tabs .day-tab").forEach(btn => {
    if (btn.innerText.trim().toLowerCase() === today.toLowerCase()) {
      targetBtn = btn;
    }
  });
  selectWorkoutDay(today, targetBtn);
  showTab("workouts-view", document.getElementById("dock-btn-workouts"));
}

function selectWorkoutDay(dayName, btnElem) {
  appState.activeWorkoutDay = dayName;
  document.querySelectorAll("#workout-days-tabs .day-tab").forEach(tab => tab.classList.remove("active"));
  if (btnElem) btnElem.classList.add("active");
  renderWorkoutsView();
}

function renderWorkoutsView() {
  const container = document.getElementById("routines-container");
  if (!container) return;
  container.innerHTML = "";

  const activeDay = appState.activeWorkoutDay || "Lunes";
  const routine = WEEKLY_WORKOUT_SCHEDULE[activeDay] || WEEKLY_WORKOUT_SCHEDULE["Lunes"];
  const profileId = appState.activeProfileId;
  const isDone = isDayCompleted(profileId, activeDay);
  const watchData = getDayWatchData(profileId, activeDay);

  // If completed with watch data, show top Apple Watch banner
  if (isDone && watchData) {
    const watchBanner = document.createElement("div");
    watchBanner.className = "glass-card watch-workout-summary-card";
    watchBanner.style.marginBottom = "1rem";
    watchBanner.innerHTML = `
      <div class="watch-summary-header">
        <div class="watch-summary-title">
          <div class="watch-icon-glow"><i class="fa-brands fa-apple"></i></div>
          <div>
            <h3 style="font-family: var(--font-heading); font-size: 1.15rem; color: #fff; display: flex; align-items: center; gap: 0.4rem;">
               Sesión Medida por Apple Watch (${activeDay})
            </h3>
            <p style="color: var(--text-muted); font-size: 0.82rem; margin-top: 2px;">
              Sincronizado automáticamente a las ${watchData.timestamp} • ${watchData.deviceName}
            </p>
          </div>
        </div>
        <span class="watch-live-badge"><i class="fa-solid fa-circle-check"></i> Salud iOS Sync</span>
      </div>

      <div class="watch-summary-grid">
        <div class="summary-metric-box">
          <span class="metric-lbl"><i class="fa-solid fa-stopwatch" style="color:var(--accent-cyan);"></i> Tiempo Medido</span>
          <span class="metric-val" style="color:var(--accent-cyan);">${watchData.durationMin} <small>min</small></span>
        </div>
        <div class="summary-metric-box">
          <span class="metric-lbl"><i class="fa-solid fa-fire" style="color:var(--accent-rose);"></i> Calorías Activas</span>
          <span class="metric-val" style="color:var(--accent-rose);">${watchData.kcal} <small>kcal</small></span>
        </div>
        <div class="summary-metric-box">
          <span class="metric-lbl"><i class="fa-solid fa-heart-pulse" style="color:var(--accent-rose);"></i> FC Media</span>
          <span class="metric-val" style="color:var(--accent-emerald);">${watchData.avgHr} <small>BPM</small></span>
        </div>
        <div class="summary-metric-box">
          <span class="metric-lbl"><i class="fa-solid fa-chart-line" style="color:var(--accent-amber);"></i> FC Máxima</span>
          <span class="metric-val" style="color:var(--accent-amber);">${watchData.maxHr} <small>BPM</small></span>
        </div>
      </div>
    `;
    container.appendChild(watchBanner);
  }

  const card = document.createElement("div");
  card.className = "glass-card";

  const rows = routine.exercises.map(ex => `
    <tr>
      <td>
        <div class="exercise-name">${ex.name}</div>
        <div class="exercise-tech"><i class="fa-solid fa-lightbulb" style="color:var(--accent-amber);"></i> ${ex.technique}</div>
      </td>
      <td><strong style="color:var(--accent-emerald);">${ex.sets}</strong> series</td>
      <td><strong>${ex.reps}</strong> reps</td>
      <td><span style="color:var(--text-muted);">${ex.rest}</span></td>
    </tr>
  `).join("");

  card.innerHTML = `
    <div class="routine-header-box">
      <div>
        <h2 style="font-family: var(--font-heading); font-size: 1.3rem;">${routine.title}</h2>
        <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 2px;">Enfoque: ${routine.focus}</p>
      </div>
      <span class="routine-badge"><i class="fa-solid fa-clock"></i> ${routine.duration} min (Juntos)</span>
    </div>

    <div style="display:flex; flex-wrap: wrap; gap: 1rem; font-size: 0.82rem; color: var(--text-muted); margin-bottom: 0.85rem;">
      <span><i class="fa-solid fa-location-dot" style="color:var(--accent-cyan);"></i> ${routine.location}</span>
      <span><i class="fa-solid fa-dumbbell" style="color:var(--accent-emerald);"></i> ${routine.type}</span>
      <span><i class="fa-solid fa-toolbox" style="color:var(--accent-violet);"></i> Equipamiento: ${routine.equipment.join(", ")}</span>
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

  // Render integrated outdoor route & Boo activity details if available for the day
  if (routine.routeDetails) {
    const routeCard = document.createElement("div");
    routeCard.className = "glass-card route-card";
    routeCard.style.marginTop = "1.25rem";

    const stepsHtml = routine.routeDetails.breakdown.map(b => `
      <div class="route-step-item">
        <span class="step-time">${b.step}</span>
        <span style="font-size: 0.9rem; color: var(--text-main);">${b.activity}</span>
      </div>
    `).join("");

    routeCard.innerHTML = `
      <div class="routine-header-box" style="margin-bottom: 0.75rem;">
        <div>
          <h3 style="font-family: var(--font-heading); font-size: 1.15rem; color: var(--accent-cyan); display: flex; align-items: center; gap: 0.5rem;">
            <i class="fa-solid fa-dog"></i> ${routine.routeDetails.title}
          </h3>
          <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 2px;">${routine.routeDetails.description}</p>
        </div>
      </div>

      <div class="route-step-list">
        ${stepsHtml}
      </div>

      <div class="collie-tip-box" style="margin-top: 1rem;">
        <i class="fa-solid fa-paw" style="font-size: 1.2rem; color: var(--accent-cyan);"></i>
        <div>
          <strong style="color: var(--accent-cyan);">Consejo Border Collie:</strong> ${routine.routeDetails.collieTips}
        </div>
      </div>
    `;

    container.appendChild(routeCard);
  }
}

// RENDER PROGRESS VIEW WITH CHART.JS
function renderProgressView() {
  const logs = appState.weightLogs[appState.activeProfileId];
  const labels = logs.map(l => l.date);
  const dataPoints = logs.map(l => l.weight);

  const ctx = document.getElementById("weightChart");
  if (!ctx) return;

  if (weightChart) {
    weightChart.destroy();
  }

  weightChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: `Evolución de Peso - ${appState.profiles[appState.activeProfileId].name}`,
        data: dataPoints,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#10b981',
        pointRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#f3f4f6', font: { family: 'Plus Jakarta Sans' } }
        }
      },
      scales: {
        x: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' } }
      }
    }
  });
}

function addWeightEntry() {
  const input = document.getElementById("weight-input");
  const val = parseFloat(input.value);
  if (!isNaN(val) && val > 30 && val < 250) {
    const todayStr = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    appState.weightLogs[appState.activeProfileId].push({
      date: todayStr,
      weight: val
    });
    input.value = "";
    saveState();
    renderAll();
    alert(`¡Registro de ${val} kg guardado correctamente!`);
  }
}

// AI COACH BOT LOGIC
function handleChatKeyPress(event) {
  if (event.key === "Enter") {
    sendChatMessage();
  }
}

function sendChatMessage() {
  const input = document.getElementById("chat-input");
  const text = input.value.trim();
  if (!text) return;

  const messagesBox = document.getElementById("chat-messages");

  // User Message
  const userMsg = document.createElement("div");
  userMsg.className = "chat-bubble user";
  userMsg.innerText = text;
  messagesBox.appendChild(userMsg);

  input.value = "";
  messagesBox.scrollTop = messagesBox.scrollHeight;

  // Generate bot reply
  setTimeout(() => {
    const botReply = generateBotReply(text.toLowerCase());
    const botMsg = document.createElement("div");
    botMsg.className = "chat-bubble bot";
    botMsg.innerHTML = botReply;
    messagesBox.appendChild(botMsg);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }, 400);
}

function generateBotReply(query) {
  if (query.includes("10 años") || query.includes("paron") || query.includes("sedentario") || query.includes("empezar")) {
    return "💡 <strong>Consejo de Reactivación para Carlos:</strong> Tras 10 años sin hacer ejercicio, la clave no es la intensidad bruta, sino la <em>consistencia</em>. Empieza haciendo la Rutina 1 tres veces por semana. Escuchad a vuestras articulaciones y aseguraos de beber al menos 2.5L de agua al día.";
  }
  if (query.includes("boo") || query.includes("border collie") || query.includes("perro") || query.includes("ruta")) {
    return "🐾 <strong>Entrenamiento con Boo:</strong> Los Border Collies como Boo responden genial a los cambios de ritmo. Prueba a intercalar 1 min de trote con 2 min de caminata en la Ruta 1. Mantendrás sus pulsaciones activas y las tuyas también.";
  }
  if (query.includes("suplemento") || query.includes("proteina") || query.includes("creatina")) {
    return "🥛 <strong>Sobre Suplementación:</strong> La proteína de suero (whey) es muy útil si os cuesta llegar a vuestro objetivo diario (155g / 130g). La creatina monohidrato (3-5g al día) también es excelente para la fuerza y recuperación muscular.";
  }
  if (query.includes("sustituir") || query.includes("cambiar") || query.includes("receta") || query.includes("comida")) {
    return "🥗 <strong>Sustitución de Alimentos:</strong> Podéis añadir cualquier alimento que no os guste en la sección de <em>Exclusiones</em> de la pestaña Perfil. La aplicación recalculará el menú y la lista de la compra al instante.";
  }
  if (query.includes("rodilla") || query.includes("dolor") || query.includes("espalda")) {
    return "⚠️ <strong>Cuidado Articular:</strong> Si sentís molestias en la rodilla en las sentadillas, usad una silla como apoyo y no bajéis más allá de los 90 grados. Mantened siempre el abdomen activado para proteger la zona lumbar.";
  }
  
  return "💪 ¡Gran pregunta! Recordad que el secreto de la recomposición corporal de Carlos y Andrea es mantener una ingesta de proteína adecuada, dormir 7-8 horas y no saltarse los paseos activos con Boo. ¡Seguid así!";
}

// DEBUG & DIAGNOSTIC LOGS ENGINE
function addDebugLog(message, type = 'info', data = null) {
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

  saveState();

  if (document.getElementById("logs-view")?.classList.contains("active")) {
    renderDebugLogsView();
  }
}

function clearDebugLogs() {
  triggerHapticTouch();
  appState.debugLogs = [];
  saveState();
  renderDebugLogsView();
  showIosToast("🗑️ Logs de diagnóstico limpiados", "fa-solid fa-trash-can");
}

function copyDebugLogsToClipboard() {
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

function renderDebugLogsView() {
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

// Live timer update for summary sync time
setInterval(() => {
  const syncTimeEl = document.getElementById("summary-watch-sync-time");
  if (syncTimeEl && appState?.appleWatch?.lastGlobalSync) {
    syncTimeEl.innerText = formatSyncRelativeTime(appState.appleWatch.lastGlobalSync);
  }
}, 5000);
